import { AES } from "./crypto/aes";
import { RSA } from "./crypto/rsa";
import { SRP } from "./crypto/srp";
import { CryptoUtils } from "./crypto/utils";

export enum CryptoContextErrorCode {
  OVERWRITE = "OVERWRITE",
  MISSING_SECRET_KEY = "MISSING_SECRET_KEY",
  INCOMPLETE = "INCOMPLETE",
  NOT_FOUND = "NOT_FOUND",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export class CryptoContextError extends Error {
  constructor(public code: CryptoContextErrorCode) {
    super(code);
    this.name = "CryptoContextError";
  }
}

export class CryptoContext {
  static LocalStorageKey = "cryptoContext";

  private secretKey: CryptoKey | null = null;
  private privateKey: CryptoKey | null = null;

  constructor(
    private cryptoUtils: CryptoUtils,
    private rsa: RSA,
    private aes: AES,
    private srp: SRP
  ) {}

  setSecretKey(secretKey: CryptoKey) {
    this.secretKey = secretKey;
    return this;
  }
  hasSecretKey() {
    return this.secretKey !== null;
  }

  setPrivateKey(privateKey: CryptoKey) {
    this.privateKey = privateKey;
    return this;
  }
  hasPrivateKey() {
    return this.privateKey !== null;
  }

  async importPrivateKey(
    passwordKey: CryptoKey,
    wrappedPrivateKeyBase64: string
  ) {
    const { wrappedKey, iv } = this.cryptoUtils.Base64ToWrapped(
      wrappedPrivateKeyBase64
    );

    this.privateKey = await this.rsa.unwrapKey(
      wrappedKey,
      passwordKey,
      iv,
      true
    );

    return this;
  }
  isComplete() {
    return this.secretKey !== null && this.privateKey !== null;
  }

  async saveToLocalStorage() {
    if (this.secretKey === null || this.privateKey === null) {
      throw new CryptoContextError(CryptoContextErrorCode.INCOMPLETE);
    }

    const [secretKey, privateKey] = await Promise.all([
      this.aes.exportKey(this.secretKey),
      this.rsa.exportKey(this.privateKey),
    ]);

    localStorage.setItem(
      CryptoContext.LocalStorageKey,
      JSON.stringify({
        secretKey,
        privateKey,
      })
    );
  }

  /**
   * Load the crypto context from local storage.
   * @throws {CryptoContextError} NOT_FOUND, INCOMPLETE
   */
  async loadFromLocalStorage() {
    if (this.isComplete()) {
      return this;
    }

    const data = localStorage.getItem(CryptoContext.LocalStorageKey);
    if (!data) {
      throw new CryptoContextError(CryptoContextErrorCode.NOT_FOUND);
    }

    const { secretKey, privateKey } = JSON.parse(data);

    if (!secretKey || !privateKey) {
      throw new CryptoContextError(CryptoContextErrorCode.INCOMPLETE);
    }

    await Promise.all([
      async () => {
        this.secretKey = await this.aes.importKey(secretKey);
      },
      async () => {
        this.privateKey = await this.rsa.importKey(privateKey, true);
      },
    ]);

    return this;
  }

  clear() {
    this.secretKey = null;
    this.privateKey = null;
    localStorage.removeItem(CryptoContext.LocalStorageKey);
  }

  /**
   * Generate the srp secret verifier and the secret key.
   *
   * @throws {CryptoContextError} OVERWRITE
   */
  async createSecretKey(secret: string): Promise<{
    secretVerifierEncoded: string;
    // secretKey: CryptoKey;
  }> {
    if (this.secretKey) {
      throw new CryptoContextError(CryptoContextErrorCode.OVERWRITE);
    }

    const {
      verifier: secretVerifier,
      salt: secretSalt,
      privateKey: secretKey,
    } = await this.srp.getVerifier(secret);

    this.secretKey = secretKey;

    return {
      secretVerifierEncoded: secretVerifier + "." + secretSalt,
      // secretKey,
    };
  }

  /**
   * Generate the srp password verifier and a new key pair for the user.
   *
   * - Encrypt the private key with the password key.
   * - Encrypt the public key with the secret key.
   *
   * @throws {CryptoContextError} OVERWRITE, MISSING_SECRET_KEY
   */
  async createUserKeys(password: string): Promise<{
    passwordVerifierEncoded: string;
    publicKeySecretEncoded: string;
    privateKeyEncryptedEncoded: string;
  }> {
    if (!this.secretKey) {
      throw new CryptoContextError(CryptoContextErrorCode.MISSING_SECRET_KEY);
    }
    if (this.privateKey) {
      throw new CryptoContextError(CryptoContextErrorCode.OVERWRITE);
    }

    // Generate a new key pair for the user
    const {
      verifier: passwordVerifier,
      salt: passwordSalt,
      privateKey: passwordKey,
    } = await this.srp.getVerifier(password);

    const keyPair = await this.rsa.generateKeyPair();
    this.privateKey = keyPair.privateKey;

    // Encrypt the private key with the password key
    // and the public key with the secret key
    const ivPrivateKey = await this.aes.generateIV();
    const privateKey = await this.rsa.wrapKey(
      keyPair.privateKey,
      passwordKey,
      ivPrivateKey
    );

    const ivPublicKey = await this.aes.generateIV();
    const publicKey = await this.rsa.wrapKey(
      keyPair.publicKey,
      this.secretKey,
      ivPublicKey
    );

    return {
      passwordVerifierEncoded: passwordVerifier + "." + passwordSalt,
      publicKeySecretEncoded: this.cryptoUtils.wrappedToBase64(
        publicKey,
        ivPublicKey
      ),
      privateKeyEncryptedEncoded: this.cryptoUtils.wrappedToBase64(
        privateKey,
        ivPrivateKey
      ),
    };
  }
}
