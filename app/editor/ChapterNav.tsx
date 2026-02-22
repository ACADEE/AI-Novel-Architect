"use client";

import Link from "next/link";
import { Chapter } from "../types/novel";

const statusConfig: Record<
  Chapter["status"],
  { label: string; color: string; dot: string }
> = {
  completed: {
    label: "Terminé",
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30",
    dot: "bg-emerald-500",
  },
  "in-progress": {
    label: "En cours",
    color: "text-blue-600 bg-blue-50 dark:bg-blue-900/30",
    dot: "bg-blue-500",
  },
  revision: {
    label: "Révision",
    color: "text-amber-600 bg-amber-50 dark:bg-amber-900/30",
    dot: "bg-amber-500",
  },
  draft: {
    label: "Brouillon",
    color: "text-slate-500 bg-slate-100 dark:bg-slate-700",
    dot: "bg-slate-400",
  },
};

interface ChapterNavProps {
  chapters: Chapter[];
  selectedChapterId: string;
  // FIX: this callback must be wired to real state-setter in the parent.
  // If it were a no-op (() => {}) the navigation would never update the view.
  onSelectChapter: (chapterId: string) => void;
  novelTitle: string;
}

export default function ChapterNav({
  chapters,
  selectedChapterId,
  onSelectChapter,
  novelTitle,
}: ChapterNavProps) {
  return (
    <aside className="w-72 flex-shrink-0 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col h-full">
      {/* Sidebar Header */}
      <div className="px-4 py-4 border-b border-slate-200 dark:border-slate-700">
        <Link
          href="/"
          className="flex items-center gap-2 mb-3 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xs transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Mes romans
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-violet-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">A</span>
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
              {novelTitle}
            </h2>
            <p className="text-xs text-slate-400">{chapters.length} chapitres</p>
          </div>
        </div>
      </div>

      {/* Chapter List */}
      <nav className="flex-1 overflow-y-auto py-2">
        <p className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Plan des chapitres
        </p>
        <ul className="space-y-0.5 px-2">
          {chapters.map((chapter) => {
            const isSelected = chapter.id === selectedChapterId;
            const status = statusConfig[chapter.status];
            const progress =
              chapter.wordCountTarget > 0
                ? Math.min(
                    100,
                    Math.round((chapter.wordCountCurrent / chapter.wordCountTarget) * 100)
                  )
                : 0;

            return (
              <li key={chapter.id}>
                {/*
                 * FIX: onClick calls onSelectChapter(chapter.id) — passing the CURRENT
                 * chapter's id from the map iteration, not a hardcoded value.
                 *
                 * BUGGY version would be:
                 *   onClick={() => onSelectChapter(chapters[0].id)}  ← always chapter 1
                 * or:
                 *   onClick={() => {}}                               ← no-op, nothing changes
                 */}
                <button
                  onClick={() => onSelectChapter(chapter.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-all ${
                    isSelected
                      ? "bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-700"
                      : "hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-transparent"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {/* Chapter number badge */}
                    <span
                      className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold mt-0.5 ${
                        isSelected
                          ? "bg-violet-600 text-white"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {chapter.number}
                    </span>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${
                          isSelected
                            ? "text-violet-700 dark:text-violet-300"
                            : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {chapter.title}
                      </p>

                      {/* Status badge */}
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full mt-1 ${status.color}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>

                      {/* Mini progress bar */}
                      {chapter.wordCountTarget > 0 && (
                        <div className="mt-1.5 h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isSelected ? "bg-violet-400" : "bg-slate-300 dark:bg-slate-600"
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sidebar Footer */}
      <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700">
        <p className="text-xs text-slate-400 text-center">AI Novel Architect</p>
      </div>
    </aside>
  );
}
