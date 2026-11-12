// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// Formulas come from the pipe agent's output, so they are parsed as plain arithmetic:
// numbers, the declared variables, + - * / and parentheses.
const TOKEN_PATTERN = /\s*(?:(\d+(?:\.\d+)?|\.\d+)|([A-Za-z_]\w*)|([-+*/()]))/y;

type Token = { kind: 'number'; value: number } | { kind: 'name' | 'op'; value: string };

function tokenize(formula: string): Token[] {
  const tokens: Token[] = [];
  TOKEN_PATTERN.lastIndex = 0;
  while (TOKEN_PATTERN.lastIndex < formula.length) {
    if (formula.slice(TOKEN_PATTERN.lastIndex).trim() === '') break;
    const match = TOKEN_PATTERN.exec(formula);
    if (!match) throw new Error(`Unexpected character at ${TOKEN_PATTERN.lastIndex}`);
    if (match[1] !== undefined) tokens.push({ kind: 'number', value: Number(match[1]) });
    else if (match[2] !== undefined) tokens.push({ kind: 'name', value: match[2] });
    else tokens.push({ kind: 'op', value: match[3] as string });
  }
  return tokens;
}

function parse(tokens: Token[], variables: Map<string, number>): number {
  let pos = 0;
  const peekOp = () => {
    const token = tokens[pos];
    return token?.kind === 'op' ? token.value : undefined;
  };

  const expression = (): number => {
    let value = term();
    for (let op = peekOp(); op === '+' || op === '-'; op = peekOp()) {
      pos++;
      value = op === '+' ? value + term() : value - term();
    }
    return value;
  };

  const term = (): number => {
    let value = unary();
    for (let op = peekOp(); op === '*' || op === '/'; op = peekOp()) {
      pos++;
      value = op === '*' ? value * unary() : value / unary();
    }
    return value;
  };

  const unary = (): number => {
    const op = peekOp();
    if (op === '-' || op === '+') {
      pos++;
      return op === '-' ? -unary() : unary();
    }
    return primary();
  };

  const primary = (): number => {
    const token = tokens[pos++];
    if (!token) throw new Error('Unexpected end of formula');
    if (token.kind === 'number') return token.value;
    if (token.kind === 'name') {
      const value = variables.get(token.value);
      if (value === undefined) throw new Error(`Unknown variable ${token.value}`);
      return value;
    }
    if (token.value === '(') {
      const value = expression();
      if (tokens[pos++]?.value !== ')') throw new Error('Missing closing parenthesis');
      return value;
    }
    throw new Error(`Unexpected ${token.value}`);
  };

  const result = expression();
  if (pos !== tokens.length) throw new Error('Unexpected trailing input');
  return result;
}

// Values are coerced with Number(), matching JavaScript arithmetic on pipe results (null -> 0).
// Returns null when the formula is not plain arithmetic over the given variables.
export function evaluateFormula(
  formula: string,
  variables: Record<string, unknown>,
): number | null {
  try {
    const values = new Map(Object.entries(variables).map(([name, value]) => [name, Number(value)]));
    const tokens = tokenize(formula);
    if (tokens.length === 0) return null;
    return parse(tokens, values);
  } catch {
    return null;
  }
}
