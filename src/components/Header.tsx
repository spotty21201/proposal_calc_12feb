"use client";

import { useState } from "react";
import Image from "next/image";

type HeaderProps = {
  onSave: () => Promise<void>;
  onExport: () => Promise<void>;
};

export function Header({ onSave, onExport }: HeaderProps) {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      await onExport();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <header className="border-b border-[#E2E2E2] py-3">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col items-start space-y-1">
          <Image src="/images/hda-aim-logo-black.png" alt="HDA + AIM Logo" width={330} height={52} className="h-[50px] w-auto object-contain" priority />
          <h1 className="font-serif text-[38px] leading-none text-[#111111]">Proposal Calculator</h1>
          <p className="text-[15px] leading-none font-normal text-[#6B6B6B]">Studio Variant - Internal</p>
        </div>
        <div className="mt-3 flex w-full flex-col gap-3 sm:flex-row md:mt-0 md:w-auto">
          <button
            onClick={handleSave}
            className="w-full border border-[#111111] px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-[#111111] hover:text-white sm:w-auto"
          >
            {saving ? "Saving..." : "Save Draft"}
          </button>
          <button
            onClick={handleExport}
            className="w-full bg-[#E10600] px-4 py-2 text-xs font-bold uppercase tracking-widest text-white transition duration-200 hover:scale-[1.02] hover:brightness-90 sm:w-auto"
          >
            Export Proposal
          </button>
        </div>
      </div>
    </header>
  );
}
