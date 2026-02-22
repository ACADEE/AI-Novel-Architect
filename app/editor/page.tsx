import { mockNovel } from "../data/mockNovel";
import EditorClient from "./EditorClient";

/**
 * Editor Page — Server Component
 *
 * This server component fetches/provides the novel data and passes it to the
 * EditorClient, which is a client component responsible for all interactive
 * chapter-selection state.
 *
 * NAVIGATION BUG — Root Cause Summary
 * =====================================
 * The bug (clicking chapter 3, 5, 9 still shows chapter 1) was caused by:
 *
 * 1. The `selectedChapterId` state was either not initialized, or it was
 *    initialized but the `onSelectChapter` handler passed to ChapterNav was
 *    a no-op (e.g. `() => {}`), so clicking never updated the state.
 *
 * 2. The chapter content area was rendering `chapters[0]` (hardcoded index)
 *    instead of `chapters.find(c => c.id === selectedChapterId)`.
 *
 * Both issues are fixed in EditorClient.tsx and ChapterNav.tsx.
 */
export default function EditorPage() {
  // In a real app, fetch the novel from the database here using the project ID.
  const novel = mockNovel;

  return <EditorClient novel={novel} />;
}
