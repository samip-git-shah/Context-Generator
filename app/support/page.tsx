import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SupportForm } from "./SupportForm";

export const dynamic = "force-static";

export default function SupportPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </Link>
      <h1 className="text-3xl font-bold">Support & Feedback</h1>
      <p className="mt-2 text-muted-foreground">
        Found a bug or want to request a feature? Drop us a line.
      </p>
      <div className="mt-8">
        <SupportForm />
      </div>
    </main>
  );
}
