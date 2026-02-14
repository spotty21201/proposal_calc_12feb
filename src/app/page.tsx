"use client";

import { useMemo, useState } from "react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import { Header } from "@/components/Header";
import { OutputPanel } from "@/components/OutputPanel";
import { ProjectForm } from "@/components/ProjectForm";
import { createProposalMarkdown, downloadMarkdown, downloadProposalPdf, validateBeforeExport } from "@/lib/exportProposal";
import { useProposalStore } from "@/store/proposalStore";

export default function Home() {
  const authEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const input = useProposalStore((s) => s.input);
  const output = useProposalStore((s) => s.output);

  const [toast, setToast] = useState<string>("");
  const [errors, setErrors] = useState<Partial<Record<"projectName" | "area", string>>>({});

  const validationErrors = useMemo(() => validateBeforeExport(input), [input]);

  const saveDraft = async () => {
    const res = await fetch("/api/proposals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inputs: input, outputs: output }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? "Failed to save draft");
    }

    setToast("Draft Saved");
    setTimeout(() => setToast(""), 2200);
  };

  const exportProposal = async () => {
    const nextErrors: Partial<Record<"projectName" | "area", string>> = {};
    if (!input.projectName.trim()) nextErrors.projectName = "Project name is required.";
    if (input.areaHa <= 0 && input.areaSqm <= 0) nextErrors.area = "Provide area in ha or sqm.";
    setErrors(nextErrors);

    if (validationErrors.length > 0) {
      setToast(validationErrors[0]);
      setTimeout(() => setToast(""), 2500);
      return;
    }

    const filename = `${(input.projectName || "proposal").replace(/\s+/g, "-").toLowerCase()}`;
    await downloadProposalPdf(`${filename}.pdf`, input, output);
    const md = createProposalMarkdown(input, output);
    downloadMarkdown(`${filename}.md`, md);
    setToast("Proposal Exported");
    setTimeout(() => setToast(""), 2200);
  };

  return (
    <div className="min-h-screen">
      <main className="w-full">
        <div className="mx-auto max-w-[1280px] px-8">
          <div className="flex items-center justify-end gap-4 border-b border-[#E2E2E2] py-3">
            {authEnabled ? (
              <>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="bg-[#111111] px-3 py-2 text-xs font-bold uppercase tracking-widest text-white">Sign In</button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </>
            ) : (
              <span className="text-xs text-[#6B6B6B]">Set Clerk env vars to enable auth</span>
            )}
          </div>
          <Header onSave={saveDraft} onExport={exportProposal} />
          {toast ? <div className="mt-4 border border-[#E2E2E2] bg-white px-4 py-2 text-sm">{toast}</div> : null}

          <div className="grid grid-cols-1 gap-6 py-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <ProjectForm errors={errors} />
            </div>
            <div className="lg:col-span-5 flex justify-end">
              <OutputPanel />
            </div>
          </div>
          <footer className="flex items-center justify-between pb-6 pt-2">
            <p className="text-[10px] text-[#8A8A8A]">Proposal Calculator - Studio Variant Internal v0.2</p>
            <div className="flex items-center gap-2 text-[#6B6B6B]">
              <span className="text-[11px]">Powered by Kolabs.Design</span>
              <Image src="/images/kolabs_logo.png" alt="Kolabs Logo" width={88} height={20} className="h-5 w-auto opacity-70" />
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
