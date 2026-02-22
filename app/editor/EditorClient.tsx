"use client";

/**
 * BUG ANALYSIS & FIX — Chapter Navigation
 * =========================================
 * ROOT CAUSE: The most common cause of "left nav always shows chapter 1" is
 * one of the following anti-patterns:
 *
 * 1. MISSING STATE UPDATE — The onClick handler never calls setSelectedChapterId:
 *      onClick={() => console.log(chapter.id)}  // no state update → always chapter 1
 *
 * 2. WRONG INDEX — The content renders chapters[0] instead of the selected one:
 *      const current = chapters[0];              // hardcoded index 0 → always chapter 1
 *
 * 3. PROP NOT PASSED — ChapterNav receives selectedId but the parent never updates it:
 *      <ChapterNav selectedId={chapters[0].id}   // hardcoded → never changes
 *        onSelect={() => {}} />                   // no-op handler
 *
 * 4. STATE DEFINED IN WRONG COMPONENT — state lives in a child component that
 *    re-renders from scratch every time (e.g., inside map()), resetting to 0.
 *
 * FIX APPLIED HERE:
 * - `selectedChapterId` state lives at the top-level EditorClient component.
 * - The `handleSelectChapter` callback is passed to ChapterNav.
 * - The displayed chapter is derived via `chapters.find(c => c.id === selectedChapterId)`,
 *   not `chapters[0]`.
 * - The sidebar highlights the active chapter by comparing c.id === selectedChapterId.
 */

import { useState } from "react";
import { Chapter, Novel } from "../types/novel";
import ChapterNav from "./ChapterNav";
import ChapterDetail from "./ChapterDetail";

interface EditorClientProps {
  novel: Novel;
}

export default function EditorClient({ novel }: EditorClientProps) {
  // FIX: selectedChapterId state is managed here at the layout level,
  // so clicking any chapter in the left nav updates the displayed content.
  const [selectedChapterId, setSelectedChapterId] = useState<string>(
    novel.chapters[0]?.id ?? ""
  );

  // FIX: derive the active chapter from state, NOT from a hardcoded chapters[0].
  const selectedChapter: Chapter | undefined = novel.chapters.find(
    (c) => c.id === selectedChapterId
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Left Navigation */}
      <ChapterNav
        chapters={novel.chapters}
        selectedChapterId={selectedChapterId}
        // FIX: pass a real handler so the state updates when user clicks a chapter.
        onSelectChapter={setSelectedChapterId}
        novelTitle={novel.title}
      />

      {/* Main Editor Area */}
      <main className="flex-1 overflow-y-auto">
        {selectedChapter ? (
          <ChapterDetail chapter={selectedChapter} />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400">
            Sélectionnez un chapitre
          </div>
        )}
      </main>
    </div>
  );
}
