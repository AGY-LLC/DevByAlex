import { S3Client, type S3ClientConfig } from "@aws-sdk/client-s3";
import { GetCallerIdentityCommand, STSClient } from "@aws-sdk/client-sts";
import { fromIni, fromNodeProviderChain, fromTemporaryCredentials } from "@aws-sdk/credential-providers";
import { type EnvironmentConfig, type LoadedConfig, selectEnvironment } from "./config.ts";
import { classifyAwsError, EXIT, MediaError } from "./errors.ts";

export interface Storage {
  cfg: LoadedConfig;
  s3: S3Client;
  sts: STSClient;
  bucket: string;
  prefix: string;
  envName: string;
  env: EnvironmentConfig;
}

type Creds = NonNullable<S3ClientConfig["credentials"]>;

function baseCredentials(envName: string, env: EnvironmentConfig): Creds {
  if (env.accessKeyIdEnv) {
    const id = process.env[env.accessKeyIdEnv];
    const secret = env.secretAccessKeyEnv ? process.env[env.secretAccessKeyEnv] : undefined;
    if (!id || !secret) {
      throw new MediaError(
        EXIT.credentials,
        `Environment "${envName}" reads credentials from ${env.accessKeyIdEnv} / ${env.secretAccessKeyEnv}, and they are not set. ` +
          `Materialize them (Passworder write_env_file, or the worker's secret settings) and retry.`,
      );
    }
    const token = env.sessionTokenEnv ? process.env[env.sessionTokenEnv] : undefined;
    return { accessKeyId: id, secretAccessKey: secret, ...(token ? { sessionToken: token } : {}) };
  }
  if (env.profile) return fromIni({ profile: env.profile });
  return fromNodeProviderChain();
}

/** Build clients for one environment. Credentials are resolved lazily by the
 *  SDK; nothing here prints or stores them. */
export function connect(cfg: LoadedConfig, requestedEnv?: string): Storage {
  const { name, env } = selectEnvironment(cfg, requestedEnv);
  const { region, endpoint } = cfg.storage;
  const base = baseCredentials(name, env);
  const credentials: Creds = env.roleArn
    ? fromTemporaryCredentials({
        masterCredentials: base,
        params: { RoleArn: env.roleArn, RoleSessionName: `media-${cfg.project}-${name}`.slice(0, 64), DurationSeconds: 3600 },
        clientConfig: { region, ...(endpoint ? { endpoint } : {}) },
      })
    : base;
  const common = { region, credentials, maxAttempts: cfg.transfer.maxAttempts, ...(endpoint ? { endpoint } : {}) };
  const s3 = new S3Client({
    ...common,
    forcePathStyle: Boolean(endpoint),
    // We send our own SHA-256 checksums; do not add the SDK's default CRC32.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
  const sts = new STSClient(common);
  return { cfg, s3, sts, bucket: cfg.storage.bucket, prefix: cfg.storage.prefix, envName: name, env };
}

export interface Identity {
  account: string;
  arn: string;
}

/** Who the active credentials are. The ARN names a role/user, not a secret. */
export async function whoAmI(storage: Storage): Promise<Identity> {
  try {
    const r = await storage.sts.send(new GetCallerIdentityCommand({}));
    return { account: r.Account ?? "", arn: r.Arn ?? "" };
  } catch (e) {
    throw classifyAwsError(e, "Identity check");
  }
}

/** Refuse to touch storage under the wrong AWS account. */
export async function assertAccount(storage: Storage): Promise<Identity> {
  const id = await whoAmI(storage);
  const expected = storage.cfg.storage.accountId;
  if (expected === null) {
    throw new MediaError(EXIT.usage, `storage.accountId is not set in ${storage.cfg.configPath}; the bucket is not provisioned yet (see MEDIA_HANDLING.md, Setup).`);
  }
  if (id.account !== expected) {
    throw new MediaError(EXIT.credentials, `Credentials are for AWS account ${id.account}, but this project's media lives in ${expected}. Select the right profile or environment.`);
  }
  return id;
}
