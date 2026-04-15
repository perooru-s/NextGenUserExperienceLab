import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ScrollToTopFab, ScrollToTopOnRoute } from "./ScrollToTopFab";
import AccessibilityResourcesPage from "./AccessibilityResourcesPage";
import ContactPage from "./ContactPage";
import LandingPage from "./LandingPage";
import { ReviewLaunchScreen } from "./ReviewLaunchScreen";
import { routerBasename } from "./routerBasename";
import "./App.css";

/** Minimum time the launch screen is visible (full animation experience). */
const REVIEW_LAUNCH_MIN_MS = 6000;

const ReviewApp = lazy(async () => {
  const started = performance.now();
  const mod = await import("./review/ReviewApp");
  const remaining = REVIEW_LAUNCH_MIN_MS - (performance.now() - started);
  if (remaining > 0) {
    await new Promise<void>((resolve) => setTimeout(resolve, remaining));
  }
  return mod;
});

export default function App() {
  return (
    <BrowserRouter basename={routerBasename()}>
      <ScrollToTopOnRoute />
      <ScrollToTopFab />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/resources" element={<AccessibilityResourcesPage />} />
        <Route
          path="/review/*"
          element={
            <Suspense fallback={<ReviewLaunchScreen />}>
              <ReviewApp />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
