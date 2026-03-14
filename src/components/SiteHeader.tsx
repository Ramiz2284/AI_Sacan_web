import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="flex items-center justify-between px-6 py-5 text-sm">
      <Link href="/" className="font-semibold tracking-wide">
        Aiscan
      </Link>
      <nav className="flex items-center gap-4">
        <Link href="/scan" className="hover:underline">
          Сканировать
        </Link>
        <Link href="/history" className="hover:underline">
          История
        </Link>
      </nav>
    </header>
  );
}
