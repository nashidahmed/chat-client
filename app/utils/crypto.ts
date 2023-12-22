export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

const generateKeyPair = async (): Promise<KeyPair> => {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "ECDH",
      namedCurve: "P-256",
    },
    true,
    ["deriveKey"],
  );

  const publicKey = await window.crypto.subtle.exportKey(
    "spki",
    keyPair.publicKey,
  );
  const privateKey = await window.crypto.subtle.exportKey(
    "pkcs8",
    keyPair.privateKey,
  );

  return {
    publicKey: Buffer.from(publicKey).toString("hex"),
    privateKey: Buffer.from(privateKey).toString("hex"),
  };
};

const deriveSharedSecret = async (
  localPrivateKey: string,
  remotePublicKey: string,
): Promise<CryptoKey> => {
  const localPrivateKeyBuffer = Buffer.from(localPrivateKey, "hex");
  const localKey = await window.crypto.subtle.importKey(
    "pkcs8",
    localPrivateKeyBuffer,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    ["deriveKey"],
  );

  const remotePublicKeyBuffer = Buffer.from(remotePublicKey, "hex");
  const remoteKey = await window.crypto.subtle.importKey(
    "spki",
    remotePublicKeyBuffer,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    [],
  );

  const sharedSecretKey = await window.crypto.subtle.deriveKey(
    { name: "ECDH", public: remoteKey },
    localKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );

  return sharedSecretKey;
};

const encryptString = async (
  plainText: string,
  localPrivateKey: string,
  remotePublicKey: string,
): Promise<string> => {
  const sharedSecret = await deriveSharedSecret(
    localPrivateKey,
    remotePublicKey,
  );
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const cipher = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    sharedSecret,
    Buffer.from(plainText, "utf-8"),
  );
  const encryptedBuffer = new Uint8Array([...iv, ...new Uint8Array(cipher)]);
  return Buffer.from(encryptedBuffer).toString("hex");
};

const decryptString = async (
  encryptedText: string,
  localPrivateKey: string,
  remotePublicKey: string,
): Promise<string> => {
  const sharedSecret = await deriveSharedSecret(
    localPrivateKey,
    remotePublicKey,
  );
  const encryptedBuffer = Buffer.from(encryptedText, "hex");
  const iv = encryptedBuffer.slice(0, 12);
  const cipher = encryptedBuffer.slice(12);
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    sharedSecret,
    cipher,
  );
  return Buffer.from(decryptedBuffer).toString("utf-8");
};

export { generateKeyPair, encryptString, decryptString };
