import { CryptoError, CryptoErrorCode } from "./errors";

export class RSA {
  async generateKeyPair() {
    return await crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]), // FIXME: Use a better exponent
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"]
    );
  }

  async wrapKey(
    key: CryptoKey,
    wrapingKey: CryptoKey,
    iv: ArrayBuffer
  ): Promise<ArrayBuffer> {
    try {
      return await crypto.subtle.wrapKey("jwk", key, wrapingKey, {
        name: "AES-GCM",
        iv,
      });
    } catch (error) {
      throw new CryptoError(
        CryptoErrorCode.WRAP_FAILED,
        error,
        "Failed to wrap key"
      );
    }
  }

  async unwrapKey(
    wrapedKey: ArrayBuffer,
    wrapingKey: CryptoKey,
    iv: ArrayBuffer,
    privateKey = false
  ): Promise<CryptoKey> {
    try {
      return await crypto.subtle.unwrapKey(
        "jwk",
        wrapedKey,
        wrapingKey,
        {
          name: "AES-GCM",
          iv,
        },
        {
          name: "RSA-OAEP",
          hash: "SHA-256",
        },
        true,
        privateKey ? ["decrypt"] : ["encrypt"]
      );
    } catch (error) {
      throw new CryptoError(
        CryptoErrorCode.UNWRAP_FAILED,
        error,
        "Failed to unwrap key"
      );
    }
  }

  async exportKey(key: CryptoKey): Promise<string> {
    try {
      const jwk = await crypto.subtle.exportKey("jwk", key);
      return JSON.stringify(jwk);
    } catch (error) {
      throw new CryptoError(
        CryptoErrorCode.EXPORT_FAILED,
        error,
        "Failed to export key"
      );
    }
  }

  async importKey(key: string, privateKey = false): Promise<CryptoKey> {
    try {
      return await crypto.subtle.importKey(
        "jwk",
        JSON.parse(key),
        {
          name: "RSA-OAEP",
          hash: "SHA-256",
        },
        true,
        privateKey ? ["decrypt"] : ["encrypt"]
      );
    } catch (error) {
      throw new CryptoError(
        CryptoErrorCode.IMPORT_FAILED,
        error,
        "Failed to import key"
      );
    }
  }

  async encrypt(publicKey: CryptoKey, data: ArrayBuffer): Promise<ArrayBuffer> {
    try {
      return await crypto.subtle.encrypt(
        {
          name: "RSA-OAEP",
        },
        publicKey,
        data
      );
    } catch (error) {
      throw new CryptoError(
        CryptoErrorCode.ENCRYPTION_FAILED,
        error,
        "Failed to encrypt data"
      );
    }
  }

  async decrypt(
    privateKey: CryptoKey,
    data: ArrayBuffer
  ): Promise<ArrayBuffer> {
    try {
      return await crypto.subtle.decrypt(
        {
          name: "RSA-OAEP",
        },
        privateKey,
        data
      );
    } catch (error) {
      throw new CryptoError(
        CryptoErrorCode.DECRYPTION_FAILED,
        error,
        "Failed to decrypt data"
      );
    }
  }
}
