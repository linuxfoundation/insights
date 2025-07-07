// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {
  NativeConnection,
  Runtime,
  Worker as TemporalWorker,
  bundleWorkflowCode,
  makeTelemetryFilterString,
} from "@temporalio/worker";
import fs from "fs";
import path from "path";

import { Config, Service } from "@crowd/archetype-standard";
import { DbStore, getDbConnection } from "@crowd/database";
import { getServiceChildLogger } from "@crowd/logging";
import { getDataConverter } from "@crowd/temporal";

import * as metricActivities from "./activities";
import { ActivityMonitoringInterceptor } from "./activities/activityInterceptor";

import { createTemporalLogger } from "./logging";

// List all required environment variables, grouped per "component".
// They are in addition to the ones required by the "standard" archetype.
const envvars = {
  worker: [
    "INSIGHTS_TEMPORAL_SERVER_URL",
    "INSIGHTS_TEMPORAL_NAMESPACE",
    "INSIGHTS_TEMPORAL_TASKQUEUE",
    "INSIGHTS_TEMPORAL_ENCRYPTION_KEY_ID",
    "INSIGHTS_TEMPORAL_ENCRYPTION_KEY",
  ],
  insightsPostgres: [
    "INSIGHTS_DB_READ_HOST",
    "INSIGHTS_DB_WRITE_HOST",
    "INSIGHTS_DB_PORT",
    "INSIGHTS_DB_USERNAME",
    "INSIGHTS_DB_PASSWORD",
    "INSIGHTS_DB_DATABASE",
  ],
  cmPostgres: [
    "CM_DB_READ_HOST",
    "CM_DB_WRITE_HOST",
    "CM_DB_PORT",
    "CM_DB_USERNAME",
    "CM_DB_PASSWORD",
    "CM_DB_DATABASE",
  ],
};

export interface Options {
  maxTaskQueueActivitiesPerSecond?: number;
  maxConcurrentActivityTaskExecutions?: number;
  postgres?: {
    insights: {
      enabled: boolean;
    };
    cm: {
      enabled: boolean;
    };
  };
}

export class InsightsServiceWorker extends Service {
  readonly options: Options;

  protected _worker: TemporalWorker;

  protected _insightsPostgresReader: DbStore;
  protected _insightsPostgresWriter: DbStore;

  protected _cmPostgresReader: DbStore;
  protected _cmPostgresWriter: DbStore;

  constructor(config: Config, opts: Options) {
    super(config);

    this.options = opts;
  }

  get insightsPostgres(): { reader: DbStore; writer: DbStore } | null {
    if (!this.options.postgres?.insights.enabled) {
      return null;
    }

    return {
      reader: this._insightsPostgresReader,
      writer: this._insightsPostgresWriter,
    };
  }

  get cmPostgres(): { reader: DbStore; writer: DbStore } | null {
    if (!this.options.postgres?.cm.enabled) {
      return null;
    }

    return {
      reader: this._cmPostgresReader,
      writer: this._cmPostgresWriter,
    };
  }

  // We first need to ensure a standard service can be initialized given the config
  // and environment variables.
  override async init(initWorker = true) {
    // Since we're using crowd libraries, environment variables should be backwards compatible
    // with the INSIGHTS_ prefixed envs.
    this.setBackwardCompatibleEnvVars()

    try {
      await super.init();
    } catch (err) {
      throw new Error(err);
    }

    // We can now init tasks specific to a consumer service. Before actually
    // starting the service, we need to ensure required environment variables
    // are set.
    const missing: string[] = [];
    envvars.worker.forEach((envvar) => {
      if (!process.env[envvar]) {
        missing.push(envvar);
      }
    });

    // Only validate PostgreSQL-related environment variables if enabled.
    if (this.options.postgres?.cm.enabled) {
      envvars.cmPostgres.forEach((envvar) => {
        if (!process.env[envvar]) {
          missing.push(envvar);
        }
      });
    }

    if (this.options.postgres?.insights.enabled) {
      envvars.insightsPostgres.forEach((envvar) => {
        if (!process.env[envvar]) {
          missing.push(envvar);
        }
      });
    }

    // There's no point in continuing if a variable is missing.
    if (missing.length > 0) {
      throw new Error(`Missing environment variables: ${missing.join(", ")}`);
    }

    if (this.options.postgres?.cm.enabled) {
      try {
        const dbConnection = await getDbConnection({
          host: process.env["CM_DB_READ_HOST"] as string,
          port: Number(process.env["CM_DB_PORT"]),
          user: process.env["CM_DB_USERNAME"] as string,
          password: process.env["CM_DB_PASSWORD"] as string,
          database: process.env["CM_DB_DATABASE"] as string,
        });

        this._cmPostgresReader = new DbStore(this.log, dbConnection);
      } catch (err) {
        throw new Error(err);
      }

      try {
        const dbConnection = await getDbConnection({
          host: process.env["CM_DB_WRITE_HOST"] as string,
          port: Number(process.env["CM_DB_PORT"]),
          user: process.env["CM_DB_USERNAME"] as string,
          password: process.env["CM_DB_PASSWORD"] as string,
          database: process.env["CM_DB_DATABASE"] as string,
        });

        this._cmPostgresWriter = new DbStore(this.log, dbConnection);
      } catch (err) {
        throw new Error(err);
      }
    }

    if (this.options.postgres?.insights.enabled) {
      try {
        const dbConnection = await getDbConnection({
          host: process.env["INSIGHTS_DB_READ_HOST"] as string,
          port: Number(process.env["INSIGHTS_DB_PORT"]),
          user: process.env["INSIGHTS_DB_USERNAME"] as string,
          password: process.env["INSIGHTS_DB_PASSWORD"] as string,
          database: process.env["INSIGHTS_DB_DATABASE"] as string,
        });

        this._insightsPostgresReader = new DbStore(this.log, dbConnection);
      } catch (err) {
        throw new Error(err);
      }

      try {
        const dbConnection = await getDbConnection({
          host: process.env["INSIGHTS_DB_WRITE_HOST"] as string,
          port: Number(process.env["INSIGHTS_DB_PORT"]),
          user: process.env["INSIGHTS_DB_USERNAME"] as string,
          password: process.env["INSIGHTS_DB_PASSWORD"] as string,
          database: process.env["INSIGHTS_DB_DATABASE"] as string,
        });

        this._insightsPostgresWriter = new DbStore(this.log, dbConnection);
      } catch (err) {
        throw new Error(err);
      }
    }

    if (initWorker) {
      try {
        Runtime.install({
          logger: createTemporalLogger(
            getServiceChildLogger("temporal-worker")
          ),
          telemetryOptions: {
            logging: {
              forward: {},
              filter: makeTelemetryFilterString({ core: "INFO" }),
            },
          },
        });

        const certificate = process.env["INSIGHTS_TEMPORAL_CERTIFICATE"];
        const privateKey = process.env["INSIGHTS_TEMPORAL_PRIVATE_KEY"];

        const address = process.env["INSIGHTS_TEMPORAL_SERVER_URL"];
        const taskQueue = process.env["INSIGHTS_TEMPORAL_TASKQUEUE"];
        const namespace = process.env["INSIGHTS_TEMPORAL_NAMESPACE"];

        this.log.info(
          {
            address,
            namespace,
            taskQueue,
            certificate: certificate ? "yes" : "no",
            privateKey: privateKey ? "yes" : "no",
          },
          "Connecting to Temporal server as a worker!"
        );

        const connection = await NativeConnection.connect({
          address,
          tls:
            certificate && privateKey
              ? {
                  clientCertPair: {
                    crt: Buffer.from(certificate, "base64"),
                    key: Buffer.from(privateKey, "base64"),
                  },
                }
              : undefined,
        });

        const workflowInterceptorModules = [
          path.join(__dirname, "workflowInterceptors"),
        ];
        const serviceInterceptorsPath = path.resolve(
          "./src/workflows/interceptors"
        );
        if (fs.existsSync(serviceInterceptorsPath)) {
          workflowInterceptorModules.push(serviceInterceptorsPath);
        }

        const workflowBundle = await bundleWorkflowCode({
          workflowsPath: path.resolve("./src/workflows"),
          workflowInterceptorModules,
        });

        const dataConverter = await getDataConverter();

        this._worker = await TemporalWorker.create({
          connection: connection,
          identity: this.name,
          namespace,
          taskQueue: taskQueue as string,
          enableSDKTracing: true,
          showStackTraceSources: true,
          workflowBundle,
          activities: {
            ...metricActivities,
            ...require(path.resolve("./src/activities")),
          },
          interceptors: {
            activity: [
              (ctx) => {
                return {
                  inbound: new ActivityMonitoringInterceptor(ctx),
                };
              },
            ],
          },
          dataConverter: {
            ...dataConverter,
          },
          maxTaskQueueActivitiesPerSecond:
            this.options.maxTaskQueueActivitiesPerSecond,
          maxConcurrentActivityTaskExecutions:
            this.options.maxConcurrentActivityTaskExecutions,
        });
      } catch (err) {
        throw new Error(err);
      }
    }
  }

  // Actually start the Temporal worker.
  async start() {
    try {
      await this._worker.run();
    } catch (err) {
      throw new Error(err);
    }
  }

  // Stop allows to gracefully stop the service. Order for closing connections
  // matters. We need to stop the Temporal worker before closing other connections.
  protected override async stop() {
    if (this.options.postgres?.cm.enabled) {
      this._cmPostgresWriter.dbInstance.end();
      this._cmPostgresReader.dbInstance.end();
    }

    if (this.options.postgres?.insights.enabled) {
      this._insightsPostgresWriter.dbInstance.end();
      this._insightsPostgresReader.dbInstance.end();
    }

    await super.stop();
  }

  private setBackwardCompatibleEnvVars() {
    process.env["CROWD_TEMPORAL_ENCRYPTION_KEY_ID"] =
      process.env["INSIGHTS_TEMPORAL_ENCRYPTION_KEY_ID"] || "";
    process.env["CROWD_TEMPORAL_ENCRYPTION_KEY"] =
      process.env["INSIGHTS_TEMPORAL_ENCRYPTION_KEY"] || "";
    process.env["CROWD_TEMPORAL_NAMESPACE"] =
      process.env["INSIGHTS_TEMPORAL_NAMESPACE"] || "default";
    process.env["CROWD_TEMPORAL_SERVER_URL"] =
      process.env["INSIGHTS_TEMPORAL_SERVER_URL"] || "";
    process.env["CROWD_TEMPORAL_CERTIFICATE"] =
      process.env["INSIGHTS_TEMPORAL_CERTIFICATE"] || "";
    process.env["CROWD_TEMPORAL_PRIVATE_KEY"] =
      process.env["INSIGHTS_TEMPORAL_PRIVATE_KEY"] || "";
  }
}
