import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { analyzeSalesforceUI } from "../lib/analyzer";
import type { ReviewResult } from "../types";
import type { WcagLevel, WcagVersion } from "../types";
import { applyTheme, readStoredTheme, type ThemeId } from "../themes";
import { SAMPLE_LWC_CLEAN, SAMPLE_LWC_WITH_ISSUES, type ReviewDemoSampleId } from "./reviewSamples";

const REVIEW_MIN_MS = 480;

export type ReviewSessionValue = {
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
  source: string;
  setSource: (s: string) => void;
  wcagTarget: WcagLevel;
  setWcagTarget: (l: WcagLevel) => void;
  wcagVersion: WcagVersion;
  setWcagVersion: (v: WcagVersion) => void;
  result: ReviewResult;
  isReviewing: boolean;
  runReview: (overrideSource?: string) => Promise<void>;
  loadSample: (which: ReviewDemoSampleId) => void;
};

const ReviewSessionContext = createContext<ReviewSessionValue | null>(null);

export function ReviewSessionProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeId>(() => readStoredTheme());
  const [source, setSource] = useState(SAMPLE_LWC_WITH_ISSUES);
  const [wcagTarget, setWcagTarget] = useState<WcagLevel>("AA");
  const [wcagVersion, setWcagVersion] = useState<WcagVersion>("2.2");
  const [isReviewing, setIsReviewing] = useState(false);
  const [result, setResult] = useState<ReviewResult>(() =>
    analyzeSalesforceUI(SAMPLE_LWC_WITH_ISSUES, { wcagTarget: "AA", wcagVersion: "2.2" })
  );

  const runReview = useCallback(
    async (overrideSource?: string) => {
      const src = (overrideSource ?? source).trim();
      setIsReviewing(true);
      const t0 = performance.now();
      const next = analyzeSalesforceUI(src, { wcagTarget, wcagVersion });
      const elapsed = performance.now() - t0;
      if (elapsed < REVIEW_MIN_MS) {
        await new Promise((r) => setTimeout(r, REVIEW_MIN_MS - elapsed));
      }
      setResult(next);
      setIsReviewing(false);
    },
    [source, wcagTarget, wcagVersion]
  );

  const latestSource = useRef(source);
  latestSource.current = source;

  useEffect(() => {
    setResult(analyzeSalesforceUI(latestSource.current, { wcagTarget, wcagVersion }));
  }, [wcagTarget, wcagVersion]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    delete document.body.dataset.appView;
    return () => {
      delete document.body.dataset.appView;
    };
  }, []);

  const loadSample = useCallback((which: ReviewDemoSampleId) => {
    setSource(which === "clean" ? SAMPLE_LWC_CLEAN : SAMPLE_LWC_WITH_ISSUES);
  }, []);

  const value = useMemo<ReviewSessionValue>(
    () => ({
      theme,
      setTheme,
      source,
      setSource,
      wcagTarget,
      setWcagTarget,
      wcagVersion,
      setWcagVersion,
      result,
      isReviewing,
      runReview,
      loadSample,
    }),
    [
      theme,
      source,
      wcagTarget,
      wcagVersion,
      result,
      isReviewing,
      runReview,
      loadSample,
    ]
  );

  return <ReviewSessionContext.Provider value={value}>{children}</ReviewSessionContext.Provider>;
}

export function useReviewSession(): ReviewSessionValue {
  const ctx = useContext(ReviewSessionContext);
  if (!ctx) {
    throw new Error("useReviewSession must be used within ReviewSessionProvider");
  }
  return ctx;
}
