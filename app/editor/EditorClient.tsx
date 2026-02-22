"use client";

import { useState } from "react";
import { Chapter, Novel } from "../types/novel";
import ChapterNav, { SubItemSelection } from "./ChapterNav";
import ChapterDetail from "./ChapterDetail";

interface EditorClientProps {
  novel: Novel;
}

export default function EditorClient({ novel }: EditorClientProps) {
  const [selectedChapterId, setSelectedChapterId] = useState<string>(
    novel.chapters[0]?.id ?? ""
  );
  const [selectedSubItem, setSelectedSubItem] =
    useState<SubItemSelection | null>(null);

  const selectedChapter: Chapter | undefined = novel.chapters.find(
    (c) => c.id === selectedChapterId
  );

  function handleSelectChapter(chapterId: string) {
    setSelectedChapterId(chapterId);
    // Clear sub-item selection when clicking the chapter header
    setSelectedSubItem(null);
  }

  function handleSelectSubItem(
    chapterId: string,
    subItem: SubItemSelection
  ) {
    setSelectedChapterId(chapterId);
    setSelectedSubItem(subItem);
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Left Navigation */}
      <ChapterNav
        chapters={novel.chapters}
        selectedChapterId={selectedChapterId}
        selectedSubItem={selectedSubItem}
        onSelectChapter={handleSelectChapter}
        onSelectSubItem={handleSelectSubItem}
        novelTitle={novel.title}
      />

      {/* Main Editor Area */}
      <main className="flex-1 overflow-y-auto">
        {selectedChapter ? (
          <ChapterDetail
            chapter={selectedChapter}
            selectedSubItem={selectedSubItem}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400">
            Sélectionnez un chapitre
          </div>
        )}
      </main>
    </div>
  );
}
