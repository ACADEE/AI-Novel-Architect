"use client";

import { useState } from "react";
import Link from "next/link";
import { Chapter } from "../types/novel";

/** Possible sub-item types within a chapter */
export type SubItemType = "storySoFar" | "scene" | "hook";

export interface SubItemSelection {
  type: SubItemType;
  /** Only set when type === "scene" */
  sceneId?: string;
}

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
  selectedSubItem: SubItemSelection | null;
  onSelectChapter: (chapterId: string) => void;
  onSelectSubItem: (chapterId: string, subItem: SubItemSelection) => void;
  novelTitle: string;
}

/** Small checkmark icon when content exists */
function CheckIcon() {
  return (
    <svg
      className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

/** Chevron icon that rotates when expanded */
function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
        expanded ? "rotate-90" : ""
      }`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  );
}

export default function ChapterNav({
  chapters,
  selectedChapterId,
  selectedSubItem,
  onSelectChapter,
  onSelectSubItem,
  novelTitle,
}: ChapterNavProps) {
  // Track which chapters are expanded (collapsed by default, selected is expanded)
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    () => new Set([selectedChapterId])
  );

  function toggleExpanded(chapterId: string) {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  }

  function handleChapterClick(chapterId: string) {
    onSelectChapter(chapterId);
    // Auto-expand when selecting
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      next.add(chapterId);
      return next;
    });
  }

  function handleSubItemClick(chapterId: string, subItem: SubItemSelection) {
    onSelectSubItem(chapterId, subItem);
    // Ensure the chapter stays expanded
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      next.add(chapterId);
      return next;
    });
  }

  function isSubItemActive(
    chapterId: string,
    type: SubItemType,
    sceneId?: string
  ): boolean {
    if (selectedChapterId !== chapterId || !selectedSubItem) return false;
    if (selectedSubItem.type !== type) return false;
    if (type === "scene") return selectedSubItem.sceneId === sceneId;
    return true;
  }

  return (
    <aside className="w-72 flex-shrink-0 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col h-full">
      {/* Sidebar Header */}
      <div className="px-4 py-4 border-b border-slate-200 dark:border-slate-700">
        <Link
          href="/"
          className="flex items-center gap-2 mb-3 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xs transition-colors"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
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
            <p className="text-xs text-slate-400">
              {chapters.length} chapitres
            </p>
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
            const isExpanded = expandedChapters.has(chapter.id);
            const status = statusConfig[chapter.status];
            const progress =
              chapter.wordCountTarget > 0
                ? Math.min(
                    100,
                    Math.round(
                      (chapter.wordCountCurrent / chapter.wordCountTarget) * 100
                    )
                  )
                : 0;

            return (
              <li key={chapter.id}>
                {/* Chapter Header Row */}
                <div
                  className={`flex items-center gap-1 rounded-lg transition-all ${
                    isSelected
                      ? "bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-700"
                      : "hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-transparent"
                  }`}
                >
                  {/* Chevron toggle */}
                  <button
                    onClick={() => toggleExpanded(chapter.id)}
                    className="flex-shrink-0 p-1.5 ml-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    aria-label={isExpanded ? "Réduire" : "Développer"}
                  >
                    <ChevronIcon expanded={isExpanded} />
                  </button>

                  {/* Chapter button */}
                  <button
                    onClick={() => handleChapterClick(chapter.id)}
                    className="flex-1 text-left px-2 py-2.5 min-w-0"
                  >
                    <div className="flex items-start gap-2">
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
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${status.dot}`}
                          />
                          {status.label}
                        </span>

                        {/* Mini progress bar */}
                        {chapter.wordCountTarget > 0 && (
                          <div className="mt-1.5 h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isSelected
                                  ? "bg-violet-400"
                                  : "bg-slate-300 dark:bg-slate-600"
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                </div>

                {/* Collapsible Sub-Items */}
                {isExpanded && (
                  <ul className="ml-6 mt-0.5 mb-1 border-l-2 border-slate-200 dark:border-slate-700 space-y-px">
                    {/* Story So Far */}
                    <li>
                      <button
                        onClick={() =>
                          handleSubItemClick(chapter.id, {
                            type: "storySoFar",
                          })
                        }
                        className={`w-full text-left flex items-center gap-2 px-3 py-1.5 text-xs rounded-r-md transition-colors ${
                          isSubItemActive(chapter.id, "storySoFar")
                            ? "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 font-medium"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                        }`}
                      >
                        <svg
                          className="w-3.5 h-3.5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                        <span className="truncate">Story So Far</span>
                        {chapter.storySoFar && <CheckIcon />}
                      </button>
                    </li>

                    {/* Scenes */}
                    {chapter.scenes.length > 0 ? (
                      chapter.scenes.map((scene, idx) => (
                        <li key={scene.id}>
                          <button
                            onClick={() =>
                              handleSubItemClick(chapter.id, {
                                type: "scene",
                                sceneId: scene.id,
                              })
                            }
                            className={`w-full text-left flex items-center gap-2 px-3 py-1.5 text-xs rounded-r-md transition-colors ${
                              isSubItemActive(chapter.id, "scene", scene.id)
                                ? "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 font-medium"
                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                            }`}
                          >
                            <svg
                              className="w-3.5 h-3.5 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4"
                              />
                            </svg>
                            <span className="truncate">
                              Scène {idx + 1} — {scene.title}
                            </span>
                            <CheckIcon />
                          </button>
                        </li>
                      ))
                    ) : (
                      <li className="px-3 py-1.5 text-xs text-slate-400 dark:text-slate-500 italic">
                        Aucune scène planifiée
                      </li>
                    )}

                    {/* Hook / Cliffhanger */}
                    <li>
                      <button
                        onClick={() =>
                          handleSubItemClick(chapter.id, { type: "hook" })
                        }
                        className={`w-full text-left flex items-center gap-2 px-3 py-1.5 text-xs rounded-r-md transition-colors ${
                          isSubItemActive(chapter.id, "hook")
                            ? "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 font-medium"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                        }`}
                      >
                        <svg
                          className="w-3.5 h-3.5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                        <span className="truncate">Hook / Cliffhanger</span>
                        {chapter.hook && <CheckIcon />}
                      </button>
                    </li>
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sidebar Footer */}
      <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700">
        <p className="text-xs text-slate-400 text-center">
          AI Novel Architect
        </p>
      </div>
    </aside>
  );
}
