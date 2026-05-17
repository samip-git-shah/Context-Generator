"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { toast } from "sonner";

export function SupportForm() {
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState<"bug" | "feature" | "other">("bug");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, category, message, honeypot }),
      });
      if (r.ok) {
        setSent(true);
        toast.success("Message sent — thank you!");
      } else {
        const j = await r.json().catch(() => ({}));
        toast.error(j.error ?? "Submission failed");
      }
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-lg border border-primary/40 bg-primary/10 p-6 text-foreground">
        Thanks! We've received your message{email && <> and may reply at <strong className="text-primary">{email}</strong></>}.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        tabIndex={-1}
        aria-hidden
        autoComplete="off"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className="absolute left-[-9999px]"
      />

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Your email <span className="text-xs text-muted-foreground">(so we can reply)</span></span>
        <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Category</span>
        <Select value={category} onChange={(e) => setCategory(e.target.value as typeof category)}>
          <option value="bug">Bug report</option>
          <option value="feature">Feature request</option>
          <option value="other">Other</option>
        </Select>
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Message</span>
        <Textarea
          rows={6}
          required
          minLength={10}
          maxLength={5000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What's going on? Include any error messages or steps to reproduce."
        />
      </label>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>{loading ? "Sending…" : "Send"}</Button>
      </div>
    </form>
  );
}
