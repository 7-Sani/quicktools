"use client";

import React, { useState } from "react";
import {
  Lock,
  Unlock,
  Key,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
  Shield,
  Eye,
  EyeOff,
  Info,
} from "lucide-react";
import { encryptAesGcm, decryptAesGcm } from "@/lib/cryptoUtils";

export default function TextEncryptorDecryptorTool() {
  const [activeTab, setActiveTab] = useState<"encrypt" | "decrypt">("encrypt");

  // Encrypt state
  const [plainText, setPlainText] = useState("");
  const [encryptPassphrase, setEncryptPassphrase] = useState("");
  const [showEncryptPass, setShowEncryptPass] = useState(false);
  const [cipherOutput, setCipherOutput] = useState("");
  const [isEncrypting, setIsEncrypting] = useState(false);

  // Decrypt state
  const [cipherInput, setCipherInput] = useState("");
  const [decryptPassphrase, setDecryptPassphrase] = useState("");
  const [showDecryptPass, setShowDecryptPass] = useState(false);
  const [decryptedOutput, setDecryptedOutput] = useState("");
  const [isDecrypting, setIsDecrypting] = useState(false);

  // General error/success state
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleEncrypt = async () => {
    if (!plainText.trim()) {
      setError("Please enter the text you wish to encrypt.");
      return;
    }
    if (!encryptPassphrase) {
      setError("Please enter a secret passphrase to encrypt your text.");
      return;
    }

    setIsEncrypting(true);
    setError(null);

    try {
      const encrypted = await encryptAesGcm(plainText, encryptPassphrase);
      setCipherOutput(encrypted);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Encryption failed.";
      setError(msg);
    } finally {
      setIsEncrypting(false);
    }
  };

  const handleDecrypt = async () => {
    if (!cipherInput.trim()) {
      setError("Please paste the encrypted payload.");
      return;
    }
    if (!decryptPassphrase) {
      setError("Please enter the secret passphrase used during encryption.");
      return;
    }

    setIsDecrypting(true);
    setError(null);

    try {
      const decrypted = await decryptAesGcm(cipherInput, decryptPassphrase);
      setDecryptedOutput(decrypted);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Decryption failed.";
      setError(msg);
    } finally {
      setIsDecrypting(false);
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-2 gap-3 p-1 neo-card">
        <button
          onClick={() => {
            setActiveTab("encrypt");
            setError(null);
          }}
          className={`py-2.5 px-4 text-xs font-heading font-bold uppercase rounded flex items-center justify-center gap-2 transition-colors ${
            activeTab === "encrypt"
              ? "bg-accent text-white neo-shadow-sm"
              : "text-text-secondary hover:text-text"
          }`}
        >
          <Lock size={16} /> Encrypt Text
        </button>

        <button
          onClick={() => {
            setActiveTab("decrypt");
            setError(null);
          }}
          className={`py-2.5 px-4 text-xs font-heading font-bold uppercase rounded flex items-center justify-center gap-2 transition-colors ${
            activeTab === "decrypt"
              ? "bg-accent text-white neo-shadow-sm"
              : "text-text-secondary hover:text-text"
          }`}
        >
          <Unlock size={16} /> Decrypt Text
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 neo-border rounded-lg bg-red-50 text-red-700">
          <AlertCircle size={20} className="shrink-0" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      {/* ENCRYPT TAB */}
      {activeTab === "encrypt" && (
        <div className="space-y-6">
          <div className="neo-card p-6 space-y-4">
            <div>
              <label className="font-heading font-bold text-xs uppercase block text-text-secondary mb-2">
                Secret Message (Plaintext)
              </label>
              <textarea
                value={plainText}
                onChange={(e) => setPlainText(e.target.value)}
                placeholder="Type or paste the confidential text you want to encrypt..."
                className="neo-input min-h-[140px] font-mono text-sm p-4"
              />
            </div>

            <div>
              <label className="font-heading font-bold text-xs uppercase block text-text-secondary mb-2">
                Secret Encryption Passphrase
              </label>
              <div className="relative">
                <input
                  type={showEncryptPass ? "text" : "password"}
                  value={encryptPassphrase}
                  onChange={(e) => setEncryptPassphrase(e.target.value)}
                  placeholder="Enter a strong secret passphrase..."
                  className="neo-input text-sm font-mono pr-12 py-3"
                />
                <button
                  type="button"
                  onClick={() => setShowEncryptPass(!showEncryptPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text p-1.5"
                >
                  {showEncryptPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-[11px] text-text-secondary mt-1">
                Keys are derived using PBKDF2 (100,000 SHA-256 iterations) with a unique 16-byte random salt.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={handleEncrypt}
                disabled={isEncrypting}
                className="neo-btn neo-btn-primary w-full sm:w-auto text-sm"
              >
                <Lock size={16} />
                {isEncrypting ? "Encrypting with AES-256-GCM..." : "Encrypt Text (AES-256-GCM)"}
              </button>
            </div>
          </div>

          {/* Ciphertext Output */}
          {cipherOutput && (
            <div className="neo-card p-6 bg-accent/5 border-accent space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-heading font-bold text-sm uppercase text-accent">
                  <CheckCircle2 size={18} /> Encrypted Payload Ready
                </div>
                <button
                  onClick={() => copyText(cipherOutput)}
                  className="neo-btn neo-btn-secondary text-xs"
                >
                  {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy Payload"}
                </button>
              </div>

              <textarea
                readOnly
                value={cipherOutput}
                className="neo-input min-h-[140px] font-mono text-xs p-3 bg-surface select-all"
              />
              <p className="text-xs text-text-secondary">
                Share this payload securely. Only someone who knows your exact secret passphrase can decrypt it.
              </p>
            </div>
          )}
        </div>
      )}

      {/* DECRYPT TAB */}
      {activeTab === "decrypt" && (
        <div className="space-y-6">
          <div className="neo-card p-6 space-y-4">
            <div>
              <label className="font-heading font-bold text-xs uppercase block text-text-secondary mb-2">
                Encrypted Payload (JSON with Salt, IV &amp; Ciphertext)
              </label>
              <textarea
                value={cipherInput}
                onChange={(e) => setCipherInput(e.target.value)}
                placeholder='Paste the encrypted JSON payload (e.g. {"v":1,"alg":"AES-256-GCM",...})'
                className="neo-input min-h-[140px] font-mono text-xs p-4"
              />
            </div>

            <div>
              <label className="font-heading font-bold text-xs uppercase block text-text-secondary mb-2">
                Secret Decryption Passphrase
              </label>
              <div className="relative">
                <input
                  type={showDecryptPass ? "text" : "password"}
                  value={decryptPassphrase}
                  onChange={(e) => setDecryptPassphrase(e.target.value)}
                  placeholder="Enter the passphrase used to encrypt this message..."
                  className="neo-input text-sm font-mono pr-12 py-3"
                />
                <button
                  type="button"
                  onClick={() => setShowDecryptPass(!showDecryptPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text p-1.5"
                >
                  {showDecryptPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleDecrypt}
                disabled={isDecrypting}
                className="neo-btn neo-btn-primary w-full sm:w-auto text-sm"
              >
                <Unlock size={16} />
                {isDecrypting ? "Verifying & Decrypting..." : "Decrypt Text"}
              </button>
            </div>
          </div>

          {/* Decrypted Output */}
          {decryptedOutput && (
            <div className="neo-card p-6 bg-green-50/50 border-green-500 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-heading font-bold text-sm uppercase text-green-700">
                  <CheckCircle2 size={18} /> Authenticated Message Decrypted!
                </div>
                <button
                  onClick={() => copyText(decryptedOutput)}
                  className="neo-btn neo-btn-secondary text-xs"
                >
                  {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy Plaintext"}
                </button>
              </div>

              <textarea
                readOnly
                value={decryptedOutput}
                className="neo-input min-h-[140px] font-mono text-sm p-3 bg-surface select-all"
              />
            </div>
          )}
        </div>
      )}

      {/* Security Educational Box */}
      <div className="neo-card p-4 bg-accent-light flex items-start gap-3">
        <Shield size={20} className="text-accent shrink-0 mt-0.5" />
        <div className="text-xs text-text-secondary leading-relaxed">
          <strong className="text-text font-heading uppercase tracking-wide">
            Authenticated Encryption (AES-GCM):
          </strong>{" "}
          Unlike basic ciphers, AES-GCM (Galois/Counter Mode) provides both confidentiality and cryptographic authenticity. If even a single character of the encrypted payload is altered, decryption will immediately fail with a tampering error. All encryption is performed locally using the Web Crypto API.
        </div>
      </div>
    </div>
  );
}
