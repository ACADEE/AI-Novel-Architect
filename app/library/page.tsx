import Link from "next/link";
import { mockNovel } from "../data/mockNovel";
import TopNav from "../components/TopNav";

const genres = [
  "Tous", "Thriller", "Romance", "Fantasy", "Science-Fiction",
  "Policier", "Littérature générale", "Historique",
];

export default function LibraryPage() {
  const novels = [mockNovel];
  const totalWords = novels.reduce(
    (sum, n) => sum + n.chapters.reduce((s, c) => s + c.wordCountCurrent, 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <TopNav active="library" />

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Bibliothèque
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {novels.length} roman{novels.length !== 1 ? "s" : ""} ·{" "}
              {totalWords.toLocaleString("fr-FR")} mots au total
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

        {/* Genre filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          {genres.map((g) => (
            <button
              key={g}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                g === "Tous"
                  ? "bg-violet-600 text-white border-violet-600"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700"
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Novel grid */}
        <div className="grid gap-5">
          {novels.map((novel) => {
            const totalChapters = novel.chapters.length;
            const completedChapters = novel.chapters.filter(
              (c) => c.status === "completed"
            ).length;
            const novelWords = novel.chapters.reduce(
              (s, c) => s + c.wordCountCurrent,
              0
            );
            const novelTarget = novel.chapters.reduce(
              (s, c) => s + c.wordCountTarget,
              0
            );
            const pct = Math.round((novelWords / novelTarget) * 100);

            return (
              <div
                key={novel.id}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex gap-6"
              >
                {/* Spine color indicator */}
                <div className="w-1 rounded-full bg-violet-500 flex-shrink-0" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="min-w-0">
                      <span className="text-xs font-medium text-violet-600 bg-violet-50 dark:bg-violet-900/30 px-2 py-0.5 rounded-full">
                        {novel.genre}
                      </span>
                      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mt-2 truncate">
                        {novel.title}
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        par {novel.author}
                      </p>
                    </div>
                    <Link
                      href="/editor"
                      className="flex-shrink-0 inline-flex items-center gap-2 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Ouvrir
                    </Link>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4 line-clamp-2">
                    {novel.synopsis}
                  </p>

                  <div className="flex items-center gap-5 text-xs text-slate-500 dark:text-slate-400 mb-3">
                    <span>{totalChapters} chapitres</span>
                    <span>{novelWords.toLocaleString("fr-FR")} mots</span>
                    <span>
                      {completedChapters}/{totalChapters} complétés
                    </span>
                    <span className="text-slate-400 dark:text-slate-500">
                      Créé le {new Date(novel.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-8 text-right">
                      {pct}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {novels.length === 0 && (
          <div className="text-center py-20 text-slate-400 dark:text-slate-500">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="font-medium">Aucun roman dans la bibliothèque</p>
            <p className="text-sm mt-1">Créez votre premier roman pour commencer.</p>
          </div>
        )}
      </main>
    </div>
  );
}
