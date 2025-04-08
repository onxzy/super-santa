import {
  createSRPClient,
  Ephemeral,
  HashAlgorithm,
  PrimeGroup,
} from "@swan-io/srp";
import { AES } from "./aes";

export class SRP {
  constructor(
    private aes: AES,
    private prime_group: PrimeGroup = 2048,
    private hash: HashAlgorithm = "SHA-256"
  ) {}

  async getVerifier(password: string) {
    const client = createSRPClient(this.hash, this.prime_group);

    const salt = client.generateSalt();
    const privateKey = await client.deriveSafePrivateKey(salt, password);
    const verifier = client.deriveVerifier(privateKey);

    return {
      privateKey: await this.aes.hexToKey(privateKey),
      verifier,
      salt,
    };
  }

  async solveChallenge(
    serverPublicEphemeral: Ephemeral["public"],
    id: string,
    password: string,
    salt: string
  ) {
    const client = createSRPClient(this.hash, this.prime_group);
    const clientEphemeral = client.generateEphemeral();
    const privateKey = await client.deriveSafePrivateKey(salt, password);

    const clientSession = await client.deriveSession(
      clientEphemeral.secret,
      serverPublicEphemeral,
      salt,
      id,
      privateKey
    );

    return {
      privateKey: await this.aes.hexToKey(privateKey),
      clientPublicEphemeral: clientEphemeral.public,
      clientSession,
    };
  }
}
