import Link from "next/link";
import { mockNovel } from "./data/mockNovel";
import TopNav from "./components/TopNav";

export default function HomePage() {
  const novel = mockNovel;
  const totalChapters = novel.chapters.length;
  const completedChapters = novel.chapters.filter((c) => c.status === "completed").length;
  const totalWords = novel.chapters.reduce((sum, c) => sum + c.wordCountCurrent, 0);
  const targetWords = novel.chapters.reduce((sum, c) => sum + c.wordCountTarget, 0);
  const progressPct = Math.round((totalWords / targetWords) * 100);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <TopNav active="projects" />

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Mes Romans
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Gérez et rédigez vos projets d&apos;écriture assistés par IA
            </p>
          </div>
          <Link
            href="/new-book"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouveau Roman
          </Link>
        </div>

        {/* Novel Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs font-medium text-violet-600 bg-violet-50 dark:bg-violet-900/30 px-2 py-0.5 rounded-full">
                  {novel.genre}
                </span>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mt-2">
                  {novel.title}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  par {novel.author}
                </p>
              </div>
              <Link
                href="/editor"
                className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Ouvrir l&apos;éditeur
              </Link>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-5 line-clamp-2">
              {novel.synopsis}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-5">
              <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {totalChapters}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Chapitres</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {totalWords.toLocaleString("fr-FR")}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Mots rédigés</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {completedChapters}/{totalChapters}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Complétés</p>
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                <span>Progression globale</span>
                <span>{progressPct}%</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-500 rounded-full transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
