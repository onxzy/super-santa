# JWK Decrypt Tool

This tool attempts to decrypt AES-GCM wrapped JWK keys using a list of passwords. It's designed to work with JWK keys that were wrapped using the Web Crypto API (SubtleCrypto) with AES-GCM.

## Requirements

- Go 1.18 or higher
- A file containing a list of passwords to try (one per line)
- A file containing the wrapped key in the format `iv.wrappedKey` (base64 encoded)

## Building

```bash
cd jwk-decrypt-tool
go mod tidy
go build -o jwk-decrypt
```

## Usage

```bash
./jwk-decrypt -key-file=<wrapped_key_file> -passwords=<passwords_file> [-salt=<salt_hex>]
```

### Parameters

- `-key-file`: Required. Path to a file containing base64 encoded wrapped key in format 'iv.wrappedKey'
- `-passwords`: Required. Path to a file containing passwords to try, one per line
- `-salt`: Optional. Hex-encoded salt for PBKDF2. If not provided, an empty salt will be used

### Example

```bash
./jwk-decrypt -key-file="./wrapped-key.txt" -passwords="./password-list.txt" -salt="0123456789abcdef"
```

## How It Works

1. The tool reads a wrapped key from the specified file
2. It reads a list of passwords from the passwords file
3. For each password, it derives an AES key using PBKDF2:
   - SHA-256 hash function
   - 310,000 iterations (OWASP recommended minimum)
   - 16 bytes (128-bit) key length
4. It attempts to unwrap the key using AES-GCM decryption
5. If successful, it outputs the decrypted JWK