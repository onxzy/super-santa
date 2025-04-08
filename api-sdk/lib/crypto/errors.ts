export enum CryptoErrorCode {
  DECODE_FAILED = "DECODE_FAILED",
  ENCODE_FAILED = "ENCODE_FAILED",

  WRAP_FAILED = "WRAP_FAILED",
  UNWRAP_FAILED = "UNWRAP_FAILED",

  EXPORT_FAILED = "EXPORT_FAILED",
  IMPORT_FAILED = "IMPORT_FAILED",

  ENCRYPTION_FAILED = "ENCRYPTION_FAILED",
  DECRYPTION_FAILED = "DECRYPTION_FAILED",
}

export class CryptoError extends Error {
  constructor(public code: CryptoErrorCode, error: unknown, message: string) {
    super(
      error instanceof Error
        ? `${message} : [${error.name}] ${error.message}`
        : message || "Unknown error"
    );
    this.name = "CryptoError";
  }
}
