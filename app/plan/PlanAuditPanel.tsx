"use client";

import { useState } from "react";
import { predefinedGhostwriters, type Ghostwriter } from "../data/ghostwriters";
import type { Novel } from "../types/novel";
import type { AuditResult, ChapterAudit } from "../api/plan-audit/route";

// ─── Mini ghostwriter picker used inside the rewrite modal ───────────────────

function GhostwriterPicker({
  selected,
  onSelect,
}: {
  selected: Ghostwriter | null;
  onSelect: (gw: Ghostwriter) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {predefinedGhostwriters.map((gw) => (
        <button
          key={gw.id}
          onClick={() => onSelect(gw)}
          className={`text-left rounded-lg border p-3 transition-all ${
            selected?.id === gw.id
              ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20"
              : "border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700"
          }`}
        >
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
            {gw.name}
          </p>
          <p className="text-xs text-violet-500 truncate">{gw.style}</p>
        </button>
      ))}
    </div>
  );
}

// ─── Score badge ─────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 8
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
      : score >= 6
      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>
      {score}/10
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  novel: Novel;
  planText: string;
}

export default function PlanAuditPanel({ novel, planText }: Props) {
  // Audit state
  const [auditState, setAuditState] = useState<
    "idle" | "loading" | "done" | "error"
  >("idle");
  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);

  // Rewrite state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedGw, setSelectedGw] = useState<Ghostwriter | null>(null);
  const [rewriteState, setRewriteState] = useState<
    "idle" | "loading" | "done" | "error"
  >("idle");
  const [rewrittenPlan, setRewrittenPlan] = useState<string | null>(null);
  const [rewriteError, setRewriteError] = useState<string | null>(null);
  const [successDismissed, setSuccessDismissed] = useState(false);

  // Expanded chapters in audit view
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(
    new Set()
  );

  // ── Run audit ───────────────────────────────────────────────────────────────
  async function runAudit() {
    setAuditState("loading");
    setAuditError(null);
    setAudit(null);
    setRewrittenPlan(null);
    setSuccessDismissed(false);

    try {
      const res = await fetch("/api/plan-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planText,
          characters: novel.characters
            .map((c) => `${c.name} (${c.role}): ${c.description}`)
            .join("\n"),
          chapters: novel.chapters.map((c) => ({
            number: c.number,
            title: c.title,
            summary: c.summary,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAuditError(data.error ?? "Erreur inconnue");
        setAuditState("error");
        return;
      }

      setAudit(data as AuditResult);
      setAuditState("done");
      // Auto-expand first chapter
      setExpandedChapters(new Set([1]));
    } catch (err) {
      setAuditError(
        err instanceof Error ? err.message : "Erreur réseau"
      );
      setAuditState("error");
    }
  }

  // ── Trigger rewrite ─────────────────────────────────────────────────────────
  async function runRewrite() {
    if (!audit || !selectedGw) return;
    setShowConfirmModal(false);
    setRewriteState("loading");
    setRewriteError(null);

    try {
      const res = await fetch("/api/plan-rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planText,
          characters: novel.characters
            .map((c) => `${c.name} (${c.role}): ${c.description}`)
            .join("\n"),
          ghostwriterName: selectedGw.name,
          ghostwriterStyle: selectedGw.style,
          ghostwriterDescription: selectedGw.description,
          generalFeedback: audit.generalFeedback,
          strengths: audit.strengths,
          weaknesses: audit.weaknesses,
          chapterFeedbacks: audit.chapters.map((ch: ChapterAudit) => ({
            chapterNumber: ch.chapterNumber,
            title: ch.title,
            feedback: ch.feedback,
            suggestions: ch.suggestions,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setRewriteError(data.error ?? "Erreur inconnue");
        setRewriteState("error");
        return;
      }

      setRewrittenPlan(data.rewrittenPlan);
      setRewriteState("done");
    } catch (err) {
      setRewriteError(err instanceof Error ? err.message : "Erreur réseau");
      setRewriteState("error");
    }
  }

  function toggleChapter(num: number) {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      next.has(num) ? next.delete(num) : next.add(num);
      return next;
    });
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* ── Success banner ── */}
      {rewriteState === "done" && !successDismissed && (
        <div className="flex items-start gap-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-5 py-4 mb-6">
          <svg
            className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
              Plans Régénérés avec Succès
            </p>
            <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-0.5">
              {audit?.chapters.length ?? novel.chapters.length} chapitres mis à
              jour par <strong>{selectedGw?.name}</strong> en intégrant tous les
              retours de l&apos;audit.
            </p>
          </div>
          <button
            onClick={() => setSuccessDismissed(true)}
            className="text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-300 flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* ── Audit section header ── */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-violet-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              Audit IA du Plan Détaillé
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Analyse structurelle complète par Gemini — feedback général + commentaires par chapitre
            </p>
          </div>

          <button
            onClick={runAudit}
            disabled={auditState === "loading" || rewriteState === "loading"}
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {auditState === "loading" ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Analyse en cours…
              </>
            ) : auditState === "done" ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Relancer l&apos;audit
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Lancer l&apos;audit IA
              </>
            )}
          </button>
        </div>

        {/* Idle placeholder */}
        {auditState === "idle" && (
          <div className="text-center py-10 text-slate-400 dark:text-slate-500">
            <svg className="w-10 h-10 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm font-medium">Cliquez sur &quot;Lancer l&apos;audit IA&quot; pour analyser votre plan</p>
            <p className="text-xs mt-1">Gemini analysera la structure, les personnages et les chapitres</p>
          </div>
        )}

        {/* Loading */}
        {auditState === "loading" && (
          <div className="text-center py-10 text-slate-500 dark:text-slate-400">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium">Gemini analyse votre plan…</p>
            <p className="text-xs mt-1">Cela peut prendre 30 à 60 secondes</p>
          </div>
        )}

        {/* Error */}
        {auditState === "error" && auditError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-2">
            <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-600 dark:text-red-300">{auditError}</p>
          </div>
        )}
      </div>

      {/* ── Audit results ── */}
      {auditState === "done" && audit && (
        <>
          {/* Overall score + general feedback */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Feedback général
              </h3>
              <ScoreBadge score={audit.overallScore} />
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-5">
              {audit.generalFeedback}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4">
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Points forts
                </p>
                <ul className="space-y-1.5">
                  {audit.strengths.map((s, i) => (
                    <li key={i} className="text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5 flex-shrink-0">+</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19H19a2 2 0 001.75-2.75l-6.93-12a2 2 0 00-3.5 0l-6.93 12A2 2 0 005.07 19z" />
                  </svg>
                  Points à améliorer
                </p>
                <ul className="space-y-1.5">
                  {audit.weaknesses.map((w, i) => (
                    <li key={i} className="text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                      <span className="text-amber-400 mt-0.5 flex-shrink-0">!</span>
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Per-chapter feedback */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-5">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
              Commentaires par chapitre ({audit.chapters.length})
            </h3>
            <div className="space-y-2">
              {audit.chapters.map((ch) => (
                <div key={ch.chapterNumber} className="border border-slate-100 dark:border-slate-700 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleChapter(ch.chapterNumber)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-semibold text-slate-400 flex-shrink-0">
                        Ch. {ch.chapterNumber}
                      </span>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                        {ch.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      <ScoreBadge score={ch.score} />
                      <svg
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          expandedChapters.has(ch.chapterNumber) ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {expandedChapters.has(ch.chapterNumber) && (
                    <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-700 pt-3">
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                        {ch.feedback}
                      </p>
                      {ch.suggestions.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                            Suggestions
                          </p>
                          <ul className="space-y-1">
                            {ch.suggestions.map((s, i) => (
                              <li
                                key={i}
                                className="text-xs text-violet-700 dark:text-violet-300 flex items-start gap-2"
                              >
                                <span className="text-violet-400 mt-0.5 flex-shrink-0">→</span>
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Full rewrite CTA */}
          <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-violet-800 dark:text-violet-200 mb-1">
                  Réécriture complète du Plan Détaillé par l&apos;IA
                </h3>
                <p className="text-xs text-violet-700 dark:text-violet-300 leading-relaxed mb-4">
                  Votre Ghost Writer va réécrire l&apos;intégralité du plan en intégrant <strong>tous les retours de l&apos;audit</strong> —
                  feedback général et commentaires chapitre par chapitre.
                </p>
                <button
                  onClick={() => setShowConfirmModal(true)}
                  disabled={rewriteState === "loading"}
                  className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
                >
                  {rewriteState === "loading" ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Réécriture en cours…
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Réécrire le Plan Détaillé complet avec l&apos;IA
                    </>
                  )}
                </button>
                {rewriteState === "error" && rewriteError && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2">{rewriteError}</p>
                )}
              </div>
            </div>
          </div>

          {/* Rewritten plan display */}
          {rewriteState === "done" && rewrittenPlan && (
            <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl border border-emerald-200 dark:border-emerald-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Plan réécrit par {selectedGw?.name}
                </h3>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(rewrittenPlan);
                  }}
                  className="text-xs text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 flex items-center gap-1 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Copier
                </button>
              </div>
              <pre className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">
                {rewrittenPlan}
              </pre>
            </div>
          )}
        </>
      )}

      {/* ── Confirmation modal ── */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6">
            {/* Modal header */}
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Demander les retours du plan (IA)
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Réécriture complète du plan détaillé
                </p>
              </div>
            </div>

            {/* What will happen */}
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 mb-5">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                Ce que va faire l&apos;IA
              </p>
              <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Intégrer le <strong>feedback général</strong> de l&apos;audit
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Intégrer les <strong>commentaires de chaque chapitre</strong> ({audit?.chapters.length} chapitres)
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Réécrire dans le style du <strong>Ghost Writer sélectionné</strong>
                </li>
              </ul>
            </div>

            {/* Ghost writer picker */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                Sélectionnez votre Ghost Writer <span className="text-red-400">*</span>
              </p>
              <GhostwriterPicker
                selected={selectedGw}
                onSelect={setSelectedGw}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={runRewrite}
                disabled={!selectedGw}
                className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Lancer la réécriture
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
