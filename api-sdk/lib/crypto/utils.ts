import { CryptoError, CryptoErrorCode } from "./errors";

export class CryptoUtils {
  bufferToBase64(buffer: ArrayBuffer): string {
    try {
      const binaryString = String.fromCharCode(...new Uint8Array(buffer));
      return btoa(binaryString);
    } catch (error) {
      throw new CryptoError(
        CryptoErrorCode.ENCODE_FAILED,
        error,
        "Failed to encode buffer to base64"
      );
    }
  }

  base64ToBuffer(base64: string): ArrayBuffer {
    try {
      const binaryString = atob(base64);
      const len = binaryString.length;

      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      return bytes.buffer;
    } catch (error) {
      throw new CryptoError(
        CryptoErrorCode.DECODE_FAILED,
        error,
        "Failed to decode base64 to buffer"
      );
    }
  }

  bufferToHex(buffer: ArrayBuffer): string {
    try {
      const array = new Uint8Array(buffer);
      let hex = "";

      for (let i = 0; i < array.length; i++) {
        const item = array[i];

        if (item != null) {
          hex += item.toString(16).padStart(2, "0");
        }
      }

      return hex;
    } catch (error) {
      throw new CryptoError(
        CryptoErrorCode.ENCODE_FAILED,
        error,
        "Failed to encode buffer to hex"
      );
    }
  }

  hexToBuffer(hex: string): ArrayBuffer {
    try {
      if (hex.length % 2 !== 0) {
        throw new CryptoError(
          CryptoErrorCode.DECODE_FAILED,
          null,
          "Expected string to be an even number of characters"
        );
      }

      const array = new Uint8Array(hex.length / 2);

      for (let i = 0; i < hex.length; i += 2) {
        array[i / 2] = parseInt(hex.substring(i, i + 2), 16);
      }

      return array.buffer;
    } catch (error) {
      throw new CryptoError(
        CryptoErrorCode.DECODE_FAILED,
        error,
        "Failed to decode hex to buffer"
      );
    }
  }

  wrappedToBase64(wrappedKey: ArrayBuffer, iv: ArrayBuffer): string {
    return this.bufferToBase64(iv) + "." + this.bufferToBase64(wrappedKey);
  }

  Base64ToWrapped(input: string): {
    wrappedKey: ArrayBuffer;
    iv: ArrayBuffer;
  } {
    try {
      const [ivBase64, wrappedKeyBase64] = input.split(".");
      return {
        iv: this.base64ToBuffer(ivBase64),
        wrappedKey: this.base64ToBuffer(wrappedKeyBase64),
      };
    } catch (error) {
      throw new CryptoError(
        CryptoErrorCode.DECODE_FAILED,
        error,
        "Failed to decode base64 wrapped key"
      );
    }
  }
}
