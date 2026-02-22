"use client";

import { useEffect, useState } from "react";
import TopNav from "../components/TopNav";
import { mockNovel } from "../data/mockNovel";

interface GeminiStatus {
  status: "checking" | "connected" | "error";
  apiKeyConfigured?: boolean;
  model?: string;
  latencyMs?: number;
  errorMessage?: string;
  checkedAt?: string;
}

export default function AdminPage() {
  const [gemini, setGemini] = useState<GeminiStatus>({ status: "checking" });

  async function fetchStatus() {
    setGemini({ status: "checking" });
    try {
      const res = await fetch("/api/gemini-status");
      const data: GeminiStatus = await res.json();
      setGemini(data);
    } catch {
      setGemini({
        status: "error",
        errorMessage: "Could not reach /api/gemini-status — is the server running?",
        checkedAt: new Date().toISOString(),
      });
    }
  }

  useEffect(() => { fetchStatus(); }, []);

  const novels = [mockNovel];
  const totalChapters = novels.reduce((s, n) => s + n.chapters.length, 0);
  const totalWords = novels.reduce(
    (s, n) => s + n.chapters.reduce((cs, c) => cs + c.wordCountCurrent, 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <TopNav active="admin" />

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Super Admin
          </span>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">
            Tableau de bord administrateur
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Supervision des services, API et statistiques globales
          </p>
        </div>

        {/* Global stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Romans", value: novels.length },
            { label: "Chapitres", value: totalChapters },
            { label: "Mots rédigés", value: totalWords.toLocaleString("fr-FR") },
            { label: "Utilisateurs", value: "1" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 text-center"
            >
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{s.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Gemini API Status ── */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Statut de l&apos;API Gemini
            </h2>
            <button
              onClick={fetchStatus}
              disabled={gemini.status === "checking"}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 disabled:opacity-40 flex items-center gap-1.5 transition-colors"
            >
              <svg
                className={`w-3.5 h-3.5 ${gemini.status === "checking" ? "animate-spin" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {gemini.status === "checking" ? "Vérification…" : "Revérifier"}
            </button>
          </div>

          {/* Connection dot + label */}
          <div className="flex items-center gap-3 mb-4">
            {gemini.status === "checking" && (
              <>
                <span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600 animate-pulse flex-shrink-0" />
                <span className="text-sm text-slate-500 dark:text-slate-400">Connexion à Gemini en cours…</span>
              </>
            )}
            {gemini.status === "connected" && (
              <>
                <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-400/50 flex-shrink-0" />
                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Connecté</span>
              </>
            )}
            {gemini.status === "error" && (
              <>
                <span className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
                <span className="text-sm font-semibold text-red-600 dark:text-red-400">Erreur de connexion</span>
              </>
            )}
          </div>

          {/* Info tiles */}
          {gemini.status !== "checking" && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">API Key</p>
                <div className="flex items-center gap-1.5">
                  {gemini.apiKeyConfigured ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                      <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Configurée</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                      <span className="text-xs font-medium text-red-600 dark:text-red-400">Manquante</span>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Modèle</p>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-200 font-mono truncate">
                  {gemini.model ?? "—"}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Latence</p>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
                  {gemini.latencyMs != null ? `${gemini.latencyMs} ms` : "—"}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Vérifié à</p>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
                  {gemini.checkedAt
                    ? new Date(gemini.checkedAt).toLocaleTimeString("fr-FR")
                    : "—"}
                </p>
              </div>
            </div>
          )}

          {/* Error box */}
          {gemini.status === "error" && gemini.errorMessage && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1.5">
                    API Error
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-300 font-mono leading-relaxed break-words">
                    {gemini.errorMessage}
                  </p>

                  {gemini.errorMessage.toLowerCase().includes("empty response") && (
                    <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-700">
                      <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-2">
                        Causes possibles &amp; solutions
                      </p>
                      <ul className="text-xs text-red-600 dark:text-red-300 space-y-1.5 list-disc list-inside leading-relaxed">
                        <li>
                          Le modèle <code className="font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">{gemini.model}</code>{" "}
                          nécessite l&apos;endpoint <code className="font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">v1beta</code>{" "}
                          (pas <code className="font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">v1</code>).{" "}
                          Ce code utilise maintenant <code className="font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">v1beta</code> par défaut.
                        </li>
                        <li>
                          Vérifiez le nom exact du modèle dans{" "}
                          <span className="font-mono">Google AI Studio → Models</span>.
                        </li>
                        <li>
                          Filtre de sécurité actif (<code className="font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">finishReason: SAFETY</code>)
                          — réponse bloquée avant génération.
                        </li>
                        <li>
                          Quota RPM/TPD dépassé — vérifiez votre{" "}
                          <span className="font-mono">Google Cloud Console</span>.
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent novels */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-4">
            Romans récents
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">
                <th className="text-left pb-2 font-medium">Titre</th>
                <th className="text-left pb-2 font-medium">Genre</th>
                <th className="text-right pb-2 font-medium">Chapitres</th>
                <th className="text-right pb-2 font-medium">Mots</th>
                <th className="text-right pb-2 font-medium">Modifié</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {novels.map((n) => (
                <tr key={n.id} className="text-slate-700 dark:text-slate-300">
                  <td className="py-3 font-medium">{n.title}</td>
                  <td className="py-3 text-slate-500">{n.genre}</td>
                  <td className="py-3 text-right">{n.chapters.length}</td>
                  <td className="py-3 text-right">
                    {n.chapters.reduce((s, c) => s + c.wordCountCurrent, 0).toLocaleString("fr-FR")}
                  </td>
                  <td className="py-3 text-right text-slate-400 text-xs">
                    {new Date(n.updatedAt).toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
