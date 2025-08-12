// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { z } from "zod";
import { generateText } from "ai";

export abstract class BaseAgent<TInput, TOutput> {
  abstract readonly name: string;
  abstract readonly outputSchema: z.ZodSchema<TOutput>;
  abstract readonly temperature: number;
  abstract readonly maxSteps: number;

  /**
   * Generates JSON format instructions based on the Zod schema
   */
  protected generateJSONInstructions(): string {
    try {
      const schemaShape = this.getSchemaShape(this.outputSchema);
      return `\n\nReturn your response as a JSON object with this exact structure:\n${JSON.stringify(
        schemaShape,
        null,
        2
      )}\n\nDo not include any other text in your response, only the JSON object.`;
    } catch (error) {
      return "\n\nReturn your response as a valid JSON object.";
    }
  }

  /**
   * Extracts the shape of a Zod schema for documentation
   */
  private getSchemaShape(schema: z.ZodSchema<any>): any {
    if (schema instanceof z.ZodObject) {
      const shape: any = {};
      const schemaShape = (schema as any).shape;

      for (const key in schemaShape) {
        const field = schemaShape[key];
        if (field instanceof z.ZodString) {
          shape[key] = field.description || "string";
        } else if (field instanceof z.ZodNumber) {
          shape[key] = field.description || "number";
        } else if (field instanceof z.ZodBoolean) {
          shape[key] = field.description || "boolean";
        } else if (field instanceof z.ZodArray) {
          const elementType = this.getFieldDescription(field._def.type);
          shape[key] = field.description || `array of ${elementType}`;
        } else if (field instanceof z.ZodEnum) {
          const values = (field as any)._def.values;
          shape[key] = field.description || `one of: ${values.join(" | ")}`;
        } else if (field instanceof z.ZodOptional || field instanceof z.ZodNullable) {
          const innerType = (field as any)._def.innerType;
          shape[key] = `${this.getFieldDescription(innerType)} (optional)`;
        } else if (field instanceof z.ZodAny) {
          shape[key] = field.description || "any value";
        } else {
          shape[key] = field.description || "value";
        }
      }

      return shape;
    }

    return {};
  }

  private getFieldDescription(field: any): string {
    if (field instanceof z.ZodString) return "string";
    if (field instanceof z.ZodNumber) return "number";
    if (field instanceof z.ZodBoolean) return "boolean";
    if (field instanceof z.ZodAny) return "any";
    return "value";
  }

  async execute(input: TInput): Promise<TOutput> {
    try {
      const systemPrompt = await this.getSystemPrompt(input);
      const userPrompt = this.getUserPrompt(input);
      const tools = this.getTools(input);

      // Append JSON format instructions to system prompt
      const jsonInstructions = this.generateJSONInstructions();
      const fullSystemPrompt = systemPrompt + jsonInstructions;

      // Check if we have messages in the input
      // eslint-disable-next-line max-len, vue/max-len
      const hasMessages = typeof input === 'object' && input !== null && 'messages' in input && Array.isArray((input as any).messages);
      
      const generateConfig: any = {
        model: this.getModel(input),
        system: fullSystemPrompt,
        tools,
        maxSteps: this.maxSteps,
        temperature: this.temperature,
      };

      // Add any provider-specific options
      const providerOptions = this.getProviderOptions(input);
      if (providerOptions) {
        generateConfig.providerOptions = providerOptions;
      }

      // Use messages if available, otherwise use prompt
      if (hasMessages) {
        generateConfig.messages = (input as any).messages;
      } else {
        generateConfig.prompt = userPrompt;
      }


      const response = await generateText(generateConfig);


      // Extract and validate JSON from response
      return this.extractJSON(response.text);
    } catch (error) {
      throw this.createError(error);
    }
  }

  /**
   * Extract and validate JSON from the response text
   */
  protected extractJSON(text: string): TOutput {
    // Remove markdown code block wrappers if present
    let cleanText = text.replaceAll(/```json\s*\n?/g, "");
    cleanText = cleanText.replaceAll(/\n?```/g, "");

    // Try to find JSON in the response
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in the response");
      console.error(text);
      throw new Error(`${this.name} agent did not return valid JSON`);
    }

    const jsonStr = jsonMatch[0];
    let parsedOutput: any;

    try {
      parsedOutput = JSON.parse(jsonStr);
    } catch (error) {
      throw new Error(`Failed to parse ${this.name} JSON: ${error}`);
    }

    // Validate against schema
    try {
      const validatedOutput = this.outputSchema.parse(parsedOutput);
      console.warn(`${this.name} Agent Output:\n${JSON.stringify(validatedOutput, null, 2)}`);
      return validatedOutput;
    } catch (error) {
      console.error(`Failed to validate ${this.name} JSON`, error);
      throw new Error(`Failed to validate ${this.name} JSON: ${error}`);
    }
  }

  protected abstract getModel(input: TInput): any;
  protected abstract getSystemPrompt(input: TInput): string | Promise<string>;
  protected abstract getUserPrompt(input: TInput): string;
  protected abstract getTools(input: TInput): Record<string, any>;
  protected abstract createError(error: unknown): Error;
  
  /**
   * Override this method to provide provider-specific options
   */
  protected getProviderOptions(_input: TInput): any {
    return undefined;
  }
}