/** Exit codes are part of the CLI contract: agents branch on them. */
export const EXIT = {
  ok: 0,
  failure: 1,
  usage: 2, // bad arguments or configuration
  missingInput: 3, // a declared input is absent, or the local copy is wrong
  verification: 4, // stored bytes do not match what was hashed locally
  conflict: 5, // the key already holds different content; nothing was overwritten
  credentials: 6, // no AWS credentials, or they cannot be used
  denied: 7, // credentials work but lack permission
  renderFailed: 8,
  uploadPending: 9, // render succeeded, outputs kept locally, upload not verified
  notApproved: 10, // promotion without a matching approval
} as const;

export type ExitCode = (typeof EXIT)[keyof typeof EXIT];

export class MediaError extends Error {
  readonly code: ExitCode;
  readonly details: Record<string, unknown> | undefined;
  constructor(code: ExitCode, message: string, details?: Record<string, unknown>) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

/** Map AWS SDK failures onto the CLI's codes, with messages that say what to
 *  do. Never includes credential material: only the error name and request id. */
export function classifyAwsError(e: unknown, action: string): MediaError {
  if (e instanceof MediaError) return e;
  const err = e as { name?: string; message?: string; $metadata?: { httpStatusCode?: number; requestId?: string } };
  const name = err?.name ?? "Error";
  const status = err?.$metadata?.httpStatusCode;
  const requestId = err?.$metadata?.requestId;
  const ref = requestId ? ` (request ${requestId})` : "";
  if (name === "CredentialsProviderError" || (/Could not load credentials|credential/i.test(err?.message ?? "") && !status)) {
    return new MediaError(
      EXIT.credentials,
      `${action}: no usable AWS credentials. Configure the environment's profile or role (see MEDIA_HANDLING.md, Setup) and run \`media doctor\`.`,
    );
  }
  if (name === "ExpiredToken" || name === "ExpiredTokenException") {
    return new MediaError(EXIT.credentials, `${action}: AWS credentials have expired; refresh them (e.g. \`aws sso login\`)${ref}.`);
  }
  if (name === "AccessDenied" || name === "Forbidden" || status === 403) {
    return new MediaError(EXIT.denied, `${action}: access denied${ref}. The active role is not allowed to do this; check which environment you selected.`);
  }
  if (name === "NoSuchBucket") {
    return new MediaError(EXIT.usage, `${action}: the configured bucket does not exist or is in another account${ref}.`);
  }
  return new MediaError(EXIT.failure, `${action}: ${name}${status ? ` HTTP ${status}` : ""}${ref}: ${err?.message ?? String(e)}`);
}
