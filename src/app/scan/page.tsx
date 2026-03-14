"use client";

import Link from "next/link";
import ScanForm from "@/components/ScanForm";

export default function ScanPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fefcf6,_#f5f5f4_45%,_#e7ecf3_100%)] text-neutral-900">
      <header className="flex items-center justify-between px-6 py-5 text-sm">
        <Link href="/" className="font-semibold tracking-wide">
          Aiscan
        </Link>
        <Link href="/history" className="hover:underline">
          История
        </Link>
      </header>
      <main className="mx-auto max-w-6xl px-6 pb-20">
        <div className="mb-8 max-w-3xl">
          <h1 className="text-3xl font-semibold">Сканирование товара</h1>
          <p className="mt-3 text-sm text-neutral-600">
            Сделайте снимок упаковки, чтобы найти состав, нежелательные добавки и
            краткую выжимку отзывов.
          </p>
        </div>
        <ScanForm />
      </main>
    </div>
  );
}
