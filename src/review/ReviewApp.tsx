import { Route, Routes } from "react-router-dom";
import { ReviewConsolePage } from "./ReviewConsolePage";
import { ReviewLayout } from "./ReviewLayout";
import { ReviewSessionProvider } from "./ReviewSessionContext";

/** `/review` — two-panel review console (source + findings). */
export default function ReviewApp() {
  return (
    <ReviewSessionProvider>
      <Routes>
        <Route element={<ReviewLayout />}>
          <Route index element={<ReviewConsolePage />} />
        </Route>
      </Routes>
    </ReviewSessionProvider>
  );
}
