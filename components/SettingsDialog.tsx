"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Lock, ExternalLink, Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { visibleModels, findModel, type Provider } from "@/lib/llm/models";
import {
  clearKey,
  getStoredModel,
  hasStoredKey,
  isStoredKeyEncrypted,
  loadKey,
  saveKey,
  setStoredModel,
} from "@/lib/storage";
import { toast } from "sonner";

const KEY_LINKS: Record<Provider, { label: string; url: string }> = {
  openai: { label: "OpenAI dashboard", url: "https://platform.openai.com/api-keys" },
  anthropic: { label: "Anthropic console", url: "https://console.anthropic.com/settings/keys" },
  google: { label: "Google AI Studio", url: "https://aistudio.google.com/app/apikey" },
  mistral: { label: "Mistral console", url: "https://console.mistral.ai/api-keys/" },
};

export function SettingsDialog({
  open,
  onOpenChange,
  onChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onChange: () => void;
}) {
  const models = visibleModels();
  const [modelId, setModelId] = useState(models[0]?.id ?? "");
  const [keyInput, setKeyInput] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [passphrase, setPassphrase] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [keyExists, setKeyExists] = useState(false);
  const [keyEncrypted, setKeyEncrypted] = useState(false);

  // Re-initialize ONLY when the dialog opens. `models` is intentionally not a
  // dependency — `visibleModels()` returns a new array each render, which
  // would re-fire this effect and clobber the user's in-flight selection.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!open) return;
    setModelId(getStoredModel(models[0]?.id ?? ""));
    setKeyExists(hasStoredKey());
    setKeyEncrypted(isStoredKeyEncrypted());
    setKeyInput("");
    setPassphrase("");
    setConfirmPass("");
    setShowKey(false);
  }, [open]);

  const provider = findModel(modelId)?.provider as Provider | undefined;
  const link = provider ? KEY_LINKS[provider] : undefined;

  async function handleSave() {
    if (modelId) setStoredModel(modelId);

    if (keyInput.trim()) {
      if (passphrase && passphrase !== confirmPass) {
        toast.error("Passphrases don't match");
        return;
      }
      await saveKey(keyInput.trim(), passphrase.trim() || undefined);
      toast.success(passphrase ? "API key saved (encrypted)" : "API key saved");
    } else {
      toast.success("Settings saved");
    }
    onChange();
    onOpenChange(false);
  }

  function handleRemove() {
    clearKey();
    setKeyExists(false);
    setKeyEncrypted(false);
    onChange();
    toast.success("API key removed from this device");
  }

  async function handleVerify() {
    const k = await loadKey(passphrase).catch(() => null);
    if (k) toast.success("Passphrase is correct");
    else toast.error("Wrong passphrase");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>API key & model</DialogTitle>
          <DialogDescription>
            Bring your own key. We never see it.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Security summary */}
          <div className="rounded-md border border-primary/40 bg-primary/5 p-3 text-xs text-foreground">
            <div className="mb-1 flex items-center gap-1.5 font-bold text-primary">
              <ShieldCheck className="h-3.5 w-3.5" /> How we keep your key safe
            </div>
            <ul className="ml-4 list-disc space-y-0.5">
              <li>Key is sent <strong className="text-primary">directly from your browser to {provider ? prettyProvider(provider) : "the LLM provider"}</strong> — our server never receives it.</li>
              <li>Stored only in this browser (<code className="text-accent">localStorage</code>) on your device.</li>
              <li>You can encrypt it below with a passphrase using AES-GCM (Web Crypto).</li>
              <li>Strict Content-Security-Policy blocks any other destination from receiving it.</li>
            </ul>
          </div>

          {/* Model */}
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Model</span>
            <Select value={modelId} onChange={(e) => setModelId(e.target.value)}>
              {models.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </Select>
          </label>

          {/* Key */}
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium flex items-center justify-between">
              <span>
                API key
                {keyExists && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    (stored {keyEncrypted ? "encrypted" : "plaintext"})
                  </span>
                )}
              </span>
              {link && (
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  Get a key from {link.label} <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </span>
            <div className="relative">
              <Input
                type={showKey ? "text" : "password"}
                autoComplete="off"
                spellCheck={false}
                placeholder={keyExists ? "(unchanged — leave blank to keep)" : "sk-... / AIza... / etc."}
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showKey ? "Hide key" : "Show key"}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          {/* Passphrase (encrypts the key in localStorage) */}
          <details className="rounded-md border bg-muted/30">
            <summary className="cursor-pointer px-3 py-2 text-sm font-medium">
              <Lock className="mr-1 inline h-3.5 w-3.5" />
              Encrypt with passphrase (recommended)
            </summary>
            <div className="space-y-2 px-3 pb-3 pt-1">
              <p className="text-xs text-muted-foreground">
                Adds AES-GCM encryption (PBKDF2, 250k iterations). You'll be prompted for the passphrase
                each time you generate. We can't recover it if you forget it.
              </p>
              <Input
                type="password"
                autoComplete="off"
                spellCheck={false}
                placeholder="Passphrase (leave blank to skip)"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
              />
              {passphrase && (
                <Input
                  type="password"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="Confirm passphrase"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                />
              )}
              {keyExists && keyEncrypted && (
                <Button size="sm" variant="outline" onClick={handleVerify}>
                  Verify existing passphrase
                </Button>
              )}
            </div>
          </details>

          {/* Spend-cap reminder */}
          <p className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
            <strong>Pro tip:</strong> create a <em>dedicated</em> API key on your provider's dashboard
            with a hard monthly spend cap (most providers offer this). Even in the worst case, the
            blast radius is bounded.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button onClick={handleSave}>Save</Button>
            {keyExists && (
              <Button variant="destructive" onClick={handleRemove}>
                Remove key
              </Button>
            )}
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function prettyProvider(p: Provider): string {
  return { openai: "OpenAI", anthropic: "Anthropic", google: "Google", mistral: "Mistral" }[p];
}
