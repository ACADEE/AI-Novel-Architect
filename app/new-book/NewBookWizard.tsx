"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  predefinedGhostwriters,
  generateEnhancedDescription,
  type Ghostwriter,
} from "../data/ghostwriters";

// ─── Types ───────────────────────────────────────────────────────────────────

type WizardStep = "mode" | "content" | "ghostwriter" | "generating" | "success";
type ContentMode = "plan" | "idea";

interface CustomGhostwriter {
  name: string;
  style: string;
  description: string;
  pictureUrl: string;
}

const LOADING_STEPS = [
  "Analyse de votre plan et des personnages",
  "Construction de la structure narrative",
  "Analyse du monde biblique, contexte et continuité",
  "Développement des arcs de personnages",
  "Génération du plan de chapitres",
  "Optimisation et cohérence narrative",
  "Finalisation du projet",
];

const TOTAL_SECONDS = 300; // 5 minutes
const STEP_INTERVAL_MS = Math.floor((TOTAL_SECONDS * 1000) / LOADING_STEPS.length);

// ─── Sub-components ──────────────────────────────────────────────────────────

function GhostwriterCard({
  gw,
  selected,
  onSelect,
}: {
  gw: Ghostwriter;
  selected: boolean;
  onSelect: () => void;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <button
      onClick={onSelect}
      className={`relative text-left rounded-xl border-2 p-4 transition-all duration-150 w-full ${
        selected
          ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20 shadow-md"
          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-violet-300 dark:hover:border-violet-700"
      }`}
    >
      {selected && (
        <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </span>
      )}
      <div className="flex items-center gap-3 mb-3">
        {!imgError ? (
          <img
            src={gw.pictureUrl}
            alt={gw.name}
            onError={() => setImgError(true)}
            className="w-12 h-12 rounded-full object-cover bg-slate-200 dark:bg-slate-700 flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-bold text-violet-600 dark:text-violet-400">
              {gw.name.charAt(0)}
            </span>
          </div>
        )}
        <div className="min-w-0">
          <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate">
            {gw.name}
          </p>
          <p className="text-xs text-violet-600 dark:text-violet-400 font-medium">
            {gw.style}
          </p>
        </div>
      </div>
      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
        {gw.description}
      </p>
    </button>
  );
}

// ─── Main Wizard ─────────────────────────────────────────────────────────────

export default function NewBookWizard() {
  const [step, setStep] = useState<WizardStep>("mode");
  const [mode, setMode] = useState<ContentMode | null>(null);

  // Content fields – plan mode
  const [planTitle, setPlanTitle] = useState("");
  const [planText, setPlanText] = useState("");
  const [planCharacters, setPlanCharacters] = useState("");

  // Content fields – idea mode
  const [ideaTitle, setIdeaTitle] = useState("");
  const [ideaGenre, setIdeaGenre] = useState("Thriller");
  const [ideaDescription, setIdeaDescription] = useState("");
  const [ideaWordCount, setIdeaWordCount] = useState(80000);

  // Ghostwriter selection
  const [selectedGwId, setSelectedGwId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [custom, setCustom] = useState<CustomGhostwriter>({
    name: "",
    style: "",
    description: "",
    pictureUrl: "",
  });
  const [rewritingAi, setRewritingAi] = useState(false);

  // Loading state
  const [countdown, setCountdown] = useState(TOTAL_SECONDS);
  const [currentLoadStep, setCurrentLoadStep] = useState(0);

  // Success banner
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const chapterCount = 9; // mock

  // countdown + step timer
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (step !== "generating") return;

    setCountdown(TOTAL_SECONDS);
    setCurrentLoadStep(0);

    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(countdownRef.current!);
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    stepRef.current = setInterval(() => {
      setCurrentLoadStep((s) => {
        if (s >= LOADING_STEPS.length - 1) {
          clearInterval(stepRef.current!);
          return s;
        }
        return s + 1;
      });
    }, STEP_INTERVAL_MS);

    // After ~5s (demo) advance to success — in production this would be after real API
    const finishTimer = setTimeout(() => {
      setStep("success");
    }, 6000);

    return () => {
      clearInterval(countdownRef.current!);
      clearInterval(stepRef.current!);
      clearTimeout(finishTimer);
    };
  }, [step]);

  // ── helpers ──────────────────────────────────────────────────────────────

  function formatCountdown(secs: number) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  async function handleAiRewrite() {
    if (!custom.name && !custom.style) return;
    setRewritingAi(true);
    await new Promise((r) => setTimeout(r, 2000));
    const enhanced = generateEnhancedDescription(custom.name, custom.style, custom.description);
    setCustom((c) => ({ ...c, description: enhanced }));
    setRewritingAi(false);
  }

  function selectCustomGw() {
    setSelectedGwId("custom");
    setShowCreateForm(true);
  }

  function canProceedContent() {
    if (mode === "plan") return planTitle.trim() && planText.trim();
    if (mode === "idea") return ideaTitle.trim() && ideaDescription.trim();
    return false;
  }

  function canGenerate() {
    if (!selectedGwId) return false;
    if (selectedGwId === "custom") {
      return custom.name.trim() && custom.style.trim() && custom.description.trim();
    }
    return true;
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      {/* ── STEP: mode ── */}
      {step === "mode" && (
        <>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Créer un nouveau roman
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Comment souhaitez-vous commencer ?
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <button
              onClick={() => { setMode("plan"); setStep("content"); }}
              className="group text-left bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-violet-400 dark:hover:border-violet-600 rounded-2xl p-7 transition-all duration-200 hover:shadow-lg"
            >
              <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center mb-4 group-hover:bg-violet-200 dark:group-hover:bg-violet-800/50 transition-colors">
                <svg className="w-6 h-6 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
                J&apos;ai un plan détaillé
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Collez votre plan complet, vos personnages et vos notes. L&apos;IA construira votre roman sur cette base.
              </p>
            </button>

            <button
              onClick={() => { setMode("idea"); setStep("content"); }}
              className="group text-left bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-violet-400 dark:hover:border-violet-600 rounded-2xl p-7 transition-all duration-200 hover:shadow-lg"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4 group-hover:bg-amber-200 dark:group-hover:bg-amber-800/40 transition-colors">
                <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
                J&apos;ai juste une idée
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Décrivez votre idée en quelques lignes et l&apos;IA créera un plan complet, des personnages et des chapitres.
              </p>
            </button>
          </div>
        </>
      )}

      {/* ── STEP: content (plan) ── */}
      {step === "content" && mode === "plan" && (
        <>
          <div className="flex items-center gap-3 mb-8">
            <button onClick={() => setStep("mode")} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                Votre plan détaillé
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-sm">
                Collez l&apos;intégralité de votre plan, chapitres, personnages et notes
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Titre du roman <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={planTitle}
                onChange={(e) => setPlanTitle(e.target.value)}
                placeholder="Ex : La Cité des Ombres"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Plan complet <span className="text-red-400">*</span>
              </label>
              <textarea
                value={planText}
                onChange={(e) => setPlanText(e.target.value)}
                placeholder="Collez ici votre plan détaillé : chapitres, résumés, arcs narratifs, thèmes, structure en 3 actes…"
                rows={12}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm resize-y"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Personnages principaux
              </label>
              <textarea
                value={planCharacters}
                onChange={(e) => setPlanCharacters(e.target.value)}
                placeholder="Décrivez vos personnages : nom, rôle, motivations, backstory, relations entre eux…"
                rows={6}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm resize-y"
              />
            </div>

            <button
              onClick={() => setStep("ghostwriter")}
              disabled={!canProceedContent()}
              className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              Continuer — Choisir mon Ghost Writer
            </button>
          </div>
        </>
      )}

      {/* ── STEP: content (idea) ── */}
      {step === "content" && mode === "idea" && (
        <>
          <div className="flex items-center gap-3 mb-8">
            <button onClick={() => setStep("mode")} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                Votre idée
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-sm">
                Quelques informations suffisent — l&apos;IA s&apos;occupe du reste
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Titre du roman (ou provisoire) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={ideaTitle}
                onChange={(e) => setIdeaTitle(e.target.value)}
                placeholder="Ex : Sans titre — L'histoire du détective"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Genre
                </label>
                <select
                  value={ideaGenre}
                  onChange={(e) => setIdeaGenre(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
                >
                  {["Thriller", "Romance", "Fantasy", "Science-Fiction", "Policier", "Historique", "Aventure", "Littérature générale"].map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Nombre de mots cible
                </label>
                <input
                  type="number"
                  value={ideaWordCount}
                  onChange={(e) => setIdeaWordCount(Number(e.target.value))}
                  min={10000}
                  step={10000}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Décrivez votre idée <span className="text-red-400">*</span>
              </label>
              <textarea
                value={ideaDescription}
                onChange={(e) => setIdeaDescription(e.target.value)}
                placeholder="Ex : Un détective amnésique dans une ville futuriste doit résoudre le meurtre de son propre alter ego..."
                rows={8}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm resize-y"
              />
            </div>

            <button
              onClick={() => setStep("ghostwriter")}
              disabled={!canProceedContent()}
              className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              Continuer — Choisir mon Ghost Writer
            </button>
          </div>
        </>
      )}

      {/* ── STEP: ghostwriter ── */}
      {step === "ghostwriter" && (
        <>
          <div className="flex items-center gap-3 mb-8">
            <button onClick={() => setStep("content")} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                Sélectionnez votre Ghost Writer IA
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-sm">
                Chaque ghost writer a un style narratif unique. Choisissez celui qui correspond à votre vision.
              </p>
            </div>
          </div>

          {/* Predefined ghostwriters grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {predefinedGhostwriters.map((gw) => (
              <GhostwriterCard
                key={gw.id}
                gw={gw}
                selected={selectedGwId === gw.id}
                onSelect={() => {
                  setSelectedGwId(gw.id);
                  setShowCreateForm(false);
                }}
              />
            ))}

            {/* Create custom ghostwriter card */}
            <button
              onClick={selectCustomGw}
              className={`relative text-left rounded-xl border-2 p-4 transition-all duration-150 w-full ${
                selectedGwId === "custom"
                  ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20 shadow-md"
                  : "border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-violet-400 dark:hover:border-violet-600"
              }`}
            >
              {selectedGwId === "custom" && (
                <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                    Créer mon Ghost Writer
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                    Personnalisé
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Définissez votre propre ghost writer avec un nom, un style et une description sur-mesure.
              </p>
            </button>
          </div>

          {/* Custom ghostwriter form */}
          {showCreateForm && (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 mb-6 space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Créer un Ghost Writer personnalisé
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Nom <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={custom.name}
                    onChange={(e) => setCustom((c) => ({ ...c, name: e.target.value }))}
                    placeholder="Ex : Clara Mystère"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Style narratif <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={custom.style}
                    onChange={(e) => setCustom((c) => ({ ...c, style: e.target.value }))}
                    placeholder="Ex : Cosy mystery"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                    Description / Prompt narratif <span className="text-red-400">*</span>
                  </label>
                  <button
                    onClick={handleAiRewrite}
                    disabled={rewritingAi || !custom.name || !custom.style}
                    className="inline-flex items-center gap-1.5 text-xs text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {rewritingAi ? (
                      <>
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Réécriture en cours…
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Réécrire avec l&apos;IA
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  value={custom.description}
                  onChange={(e) => setCustom((c) => ({ ...c, description: e.target.value }))}
                  placeholder="Décrivez le style, le ton, les techniques narratives et les forces de ce ghost writer…"
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  URL de la photo (optionnel)
                </label>
                <input
                  type="url"
                  value={custom.pictureUrl}
                  onChange={(e) => setCustom((c) => ({ ...c, pictureUrl: e.target.value }))}
                  placeholder="https://exemple.com/avatar.jpg"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
                />
              </div>

              {/* Preview */}
              {(custom.name || custom.style) && (
                <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                  {custom.pictureUrl ? (
                    <img src={custom.pictureUrl} alt="" className="w-10 h-10 rounded-full object-cover bg-slate-200 flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-violet-600">
                        {custom.name?.charAt(0) ?? "?"}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {custom.name || "Nom du ghost writer"}
                    </p>
                    <p className="text-xs text-violet-500">{custom.style || "Style"}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => setStep("generating")}
            disabled={!canGenerate()}
            className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Générer mon roman
          </button>
        </>
      )}

      {/* ── STEP: generating ── */}
      {step === "generating" && (
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-violet-600 dark:text-violet-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            Génération en cours…
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            L&apos;IA construit votre roman. Cela peut prendre jusqu&apos;à 5 minutes.
          </p>

          {/* Countdown */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 mb-6 text-center">
            <p className="text-5xl font-mono font-bold text-violet-600 dark:text-violet-400 mb-1">
              {formatCountdown(countdown)}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">temps restant estimé</p>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full mb-8 overflow-hidden">
            <div
              className="h-full bg-violet-500 rounded-full transition-all duration-1000"
              style={{ width: `${Math.round(((LOADING_STEPS.length - 1 - (LOADING_STEPS.length - 1 - currentLoadStep)) / (LOADING_STEPS.length - 1)) * 100)}%` }}
            />
          </div>

          {/* Step checklist */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 text-left space-y-3">
            {LOADING_STEPS.map((label, idx) => {
              const done = idx < currentLoadStep;
              const active = idx === currentLoadStep;
              return (
                <div key={idx} className={`flex items-center gap-3 transition-opacity duration-300 ${idx > currentLoadStep ? "opacity-40" : ""}`}>
                  {done ? (
                    <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  ) : active ? (
                    <span className="w-5 h-5 rounded-full border-2 border-violet-500 flex items-center justify-center flex-shrink-0">
                      <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                    </span>
                  ) : (
                    <span className="w-5 h-5 rounded-full border-2 border-slate-200 dark:border-slate-600 flex-shrink-0" />
                  )}
                  <span className={`text-sm ${active ? "font-medium text-slate-800 dark:text-slate-100" : done ? "text-slate-500 dark:text-slate-400 line-through" : "text-slate-500 dark:text-slate-400"}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── STEP: success ── */}
      {step === "success" && (
        <>
          {/* Inline success banner */}
          {!bannerDismissed && (
            <div className="flex items-start gap-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-5 py-4 mb-6">
              <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                  Plans Régénérés avec Succès
                </p>
                <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-0.5">
                  {chapterCount} chapitres mis à jour par l&apos;IA.
                </p>
              </div>
              <button
                onClick={() => setBannerDismissed(true)}
                className="text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <div className="text-center py-8">
            <div className="w-20 h-20 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              Votre roman est prêt !
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8">
              {chapterCount} chapitres ont été générés. Ouvrez l&apos;éditeur pour commencer à écrire.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/editor"
                className="inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Ouvrir l&apos;éditeur
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Retour aux projets
              </Link>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
