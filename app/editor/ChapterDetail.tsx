"use client";

import { Chapter } from "../types/novel";

const statusConfig: Record<
  Chapter["status"],
  { label: string; color: string }
> = {
  completed: { label: "Terminé", color: "text-emerald-700 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-400" },
  "in-progress": { label: "En cours", color: "text-blue-700 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-400" },
  revision: { label: "Révision", color: "text-amber-700 bg-amber-100 dark:bg-amber-900/40 dark:text-amber-400" },
  draft: { label: "Brouillon", color: "text-slate-600 bg-slate-100 dark:bg-slate-700 dark:text-slate-400" },
};

interface ChapterDetailProps {
  chapter: Chapter;
}

export default function ChapterDetail({ chapter }: ChapterDetailProps) {
  const status = statusConfig[chapter.status];
  const progress =
    chapter.wordCountTarget > 0
      ? Math.min(100, Math.round((chapter.wordCountCurrent / chapter.wordCountTarget) * 100))
      : 0;

  return (
    <div className="max-w-3xl mx-auto px-8 py-8">
      {/* Chapter Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Chapitre {chapter.number}
          </span>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.color}`}>
            {status.label}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4">
          {chapter.title}
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          {chapter.summary}
        </p>
      </div>

      {/* Word Count Progress */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Progression de la rédaction
          </h2>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
            {progress}%
          </span>
        </div>
        <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-violet-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{chapter.wordCountCurrent.toLocaleString("fr-FR")} mots rédigés</span>
          <span>Objectif : {chapter.wordCountTarget.toLocaleString("fr-FR")} mots</span>
        </div>
      </div>

      {/* Objectives */}
      {chapter.objectives.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 mb-6">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Objectifs narratifs
          </h2>
          <ul className="space-y-2.5">
            {chapter.objectives.map((obj, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center text-xs font-bold mt-0.5">
                  {idx + 1}
                </span>
                <span className="text-sm text-slate-600 dark:text-slate-300 leading-snug">
                  {obj}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Scenes */}
      {chapter.scenes.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 mb-6">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
            Scènes ({chapter.scenes.length})
          </h2>
          <div className="space-y-4">
            {chapter.scenes.map((scene, idx) => (
              <div
                key={scene.id}
                className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700"
              >
                <div className="flex items-start gap-3 mb-2">
                  <span className="text-xs font-semibold text-slate-400 mt-0.5">
                    Scène {idx + 1}
                  </span>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {scene.title}
                  </h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                  {scene.description}
                </p>
                <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                  {scene.location && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {scene.location}
                    </span>
                  )}
                  {scene.characters.length > 0 && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {scene.characters.join(", ")}
                    </span>
                  )}
                </div>
                {scene.notes && (
                  <p className="mt-2 text-xs text-slate-400 dark:text-slate-500 italic border-t border-slate-200 dark:border-slate-600 pt-2">
                    Note : {scene.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {chapter.notes && (
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 p-5">
          <h2 className="text-sm font-semibold text-amber-800 dark:text-amber-400 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Notes de l&apos;auteur
          </h2>
          <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
            {chapter.notes}
          </p>
        </div>
      )}

      {/* Empty state for draft chapters without scenes/objectives */}
      {chapter.scenes.length === 0 && chapter.objectives.length === 0 && (
        <div className="text-center py-12 text-slate-400 dark:text-slate-500">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm">Ce chapitre est encore en attente de planification.</p>
          <p className="text-xs mt-1">Ajoutez des scènes et des objectifs pour commencer.</p>
        </div>
      )}
    </div>
  );
}
