import TopNav from "../components/TopNav";
import { mockNovel } from "../data/mockNovel";
import PlanAuditPanel from "./PlanAuditPanel";

// Build a text representation of the current plan from the mock novel
function buildPlanText(novel: typeof mockNovel): string {
  const lines: string[] = [
    `TITRE: ${novel.title}`,
    `GENRE: ${novel.genre}`,
    `AUTEUR: ${novel.author}`,
    "",
    "SYNOPSIS:",
    novel.synopsis,
    "",
    "PERSONNAGES:",
    ...novel.characters.map(
      (c) => `- ${c.name} (${c.role}): ${c.description}`
    ),
    "",
    "CHAPITRES:",
  ];

  novel.chapters.forEach((ch) => {
    lines.push(`\nChapitre ${ch.number}: ${ch.title}`);
    lines.push(`Résumé: ${ch.summary}`);
    if (ch.objectives.length > 0) {
      lines.push(`Objectifs: ${ch.objectives.join(" | ")}`);
    }
    if (ch.hook) {
      lines.push(`Hook: ${ch.hook}`);
    }
    if (ch.scenes.length > 0) {
      lines.push(
        `Scènes: ${ch.scenes.map((s) => s.title).join(", ")}`
      );
    }
  });

  return lines.join("\n");
}

export default function PlanPage() {
  const novel = mockNovel;
  const planText = buildPlanText(novel);
  const totalWords = novel.chapters.reduce(
    (s, c) => s + c.wordCountCurrent,
    0
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <TopNav />

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {novel.genre}
          </span>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">
            {novel.title}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            par {novel.author} · {novel.chapters.length} chapitres ·{" "}
            {totalWords.toLocaleString("fr-FR")} mots
          </p>
        </div>

        {/* Synopsis */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            Synopsis
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {novel.synopsis}
          </p>
        </div>

        {/* Characters */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            Personnages ({novel.characters.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {novel.characters.map((c) => (
              <div
                key={c.id}
                className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {c.name}
                  </p>
                  <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                    {c.role}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {c.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Chapter plan overview */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            Plan des chapitres ({novel.chapters.length})
          </h2>
          <div className="space-y-3">
            {novel.chapters.map((ch) => (
              <div
                key={ch.id}
                className="flex items-start gap-3 py-2 border-b border-slate-100 dark:border-slate-700 last:border-0"
              >
                <span className="text-xs font-semibold text-slate-400 w-6 flex-shrink-0 mt-0.5">
                  {ch.number}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100 mb-0.5">
                    {ch.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {ch.summary}
                  </p>
                </div>
                <span
                  className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
                    ch.status === "completed"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : ch.status === "in-progress"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                  }`}
                >
                  {ch.status === "completed"
                    ? "Terminé"
                    : ch.status === "in-progress"
                    ? "En cours"
                    : "Brouillon"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Plan Audit Panel ── */}
        <PlanAuditPanel novel={novel} planText={planText} />
      </main>
    </div>
  );
}
