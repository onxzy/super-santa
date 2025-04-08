import { CryptoError, CryptoErrorCode } from "./errors";
import { CryptoUtils } from "./utils";

export class AES {
  constructor(private cryptoUtils: CryptoUtils) {}

  async generateIV(): Promise<ArrayBuffer> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    return iv.buffer;
  }

  async generateKey(pass: string, salt: ArrayBuffer): Promise<CryptoKey> {
    const textEncoder = new TextEncoder();

    const initKey = await crypto.subtle.importKey(
      "raw",
      textEncoder.encode(pass),
      "PBKDF2",
      false,
      ["deriveKey", "deriveBits"]
    );

    return await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        hash: "SHA-256",
        salt,
        iterations: 310000, // From https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#pbkdf2
      },
      initKey,
      {
        name: "AES-GCM",
        length: 128,
      },
      true,
      ["wrapKey", "unwrapKey"]
    );
  }

  async hexToKey(keyHex: string) {
    try {
      return await crypto.subtle.importKey(
        "raw",
        this.cryptoUtils.hexToBuffer(keyHex),
        "AES-GCM",
        true,
        ["wrapKey", "unwrapKey"]
      );
    } catch (error) {
      throw new CryptoError(
        CryptoErrorCode.IMPORT_FAILED,
        error,
        "Failed to import srp key"
      );
    }
  }

  async exportKey(key: CryptoKey): Promise<string> {
    try {
      const rawKey = await crypto.subtle.exportKey("raw", key);
      return this.cryptoUtils.bufferToBase64(rawKey);
    } catch (error) {
      throw new CryptoError(
        CryptoErrorCode.EXPORT_FAILED,
        error,
        "Failed to export key"
      );
    }
  }

  async importKey(key: string): Promise<CryptoKey> {
    try {
      const rawKey = this.cryptoUtils.base64ToBuffer(key);
      return await crypto.subtle.importKey(
        "raw",
        rawKey,
        {
          name: "AES-GCM",
          length: 128,
        },
        true,
        ["wrapKey", "unwrapKey"]
      );
    } catch (error) {
      throw new CryptoError(
        CryptoErrorCode.IMPORT_FAILED,
        error,
        "Failed to import key"
      );
    }
  }
}
