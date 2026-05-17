"use client";

import { decryptKey, encryptKey, type EncryptedBlob } from "./crypto";

const KEY_KEY = "cg_byok_v1";          // either plaintext key or JSON EncryptedBlob
const MODEL_KEY = "cg_model_v1";
const ENCRYPTED_FLAG = "cg_byok_enc_v1"; // "1" if blob, else plaintext

export type StoredKey = { value: string; encrypted: boolean };

export function getStoredModel(fallback: string): string {
  if (typeof window === "undefined") return fallback;
  return window.localStorage.getItem(MODEL_KEY) ?? fallback;
}

export function setStoredModel(id: string) {
  window.localStorage.setItem(MODEL_KEY, id);
}

export function hasStoredKey(): boolean {
  if (typeof window === "undefined") return false;
  return !!window.localStorage.getItem(KEY_KEY);
}

export function isStoredKeyEncrypted(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(ENCRYPTED_FLAG) === "1";
}

export async function loadKey(passphrase?: string): Promise<string | null> {
  const raw = window.localStorage.getItem(KEY_KEY);
  if (!raw) return null;
  if (window.localStorage.getItem(ENCRYPTED_FLAG) === "1") {
    if (!passphrase) return null;
    const blob = JSON.parse(raw) as EncryptedBlob;
    return decryptKey(blob, passphrase);
  }
  return raw;
}

export async function saveKey(plain: string, passphrase?: string) {
  if (passphrase && passphrase.length > 0) {
    const blob = await encryptKey(plain, passphrase);
    window.localStorage.setItem(KEY_KEY, JSON.stringify(blob));
    window.localStorage.setItem(ENCRYPTED_FLAG, "1");
  } else {
    window.localStorage.setItem(KEY_KEY, plain);
    window.localStorage.removeItem(ENCRYPTED_FLAG);
  }
}

export function clearKey() {
  window.localStorage.removeItem(KEY_KEY);
  window.localStorage.removeItem(ENCRYPTED_FLAG);
}

export function lastFour(key: string): string {
  return key.length <= 4 ? "•".repeat(key.length) : `••••${key.slice(-4)}`;
}
