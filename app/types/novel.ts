export interface Scene {
  id: string;
  title: string;
  description: string;
  characters: string[];
  location: string;
  notes: string;
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  summary: string;
  wordCountTarget: number;
  wordCountCurrent: number;
  status: "draft" | "in-progress" | "completed" | "revision";
  scenes: Scene[];
  notes: string;
  objectives: string[];
  storySoFar: string;
  hook: string;
}

export interface Character {
  id: string;
  name: string;
  role: "protagonist" | "antagonist" | "supporting" | "minor";
  description: string;
}

export interface Novel {
  id: string;
  title: string;
  genre: string;
  synopsis: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  chapters: Chapter[];
  characters: Character[];
}
