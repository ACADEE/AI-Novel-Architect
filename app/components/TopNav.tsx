import Link from "next/link";

interface TopNavProps {
  active?: "projects" | "library" | "admin";
}

export default function TopNav({ active }: TopNavProps) {
  return (
    <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">A</span>
          </div>
          <span className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            AI Novel Architect
          </span>
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="/"
            className={
              active === "projects"
                ? "font-medium text-violet-600"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            }
          >
            Mes Projets
          </Link>
          <Link
            href="/library"
            className={
              active === "library"
                ? "font-medium text-violet-600"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            }
          >
            Bibliothèque
          </Link>
          <Link
            href="/admin"
            className={
              active === "admin"
                ? "font-medium text-violet-600"
                : "text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors text-xs"
            }
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
