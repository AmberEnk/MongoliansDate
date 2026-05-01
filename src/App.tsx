import { Navigate, Route, Routes } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "./auth/AuthContext";
import { WAITLIST_ONLY_LAUNCH } from "./constants";
import AppShell from "./components/AppShell";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import OnboardingPage from "./pages/OnboardingPage";
import DiscoverPage from "./pages/DiscoverPage";
import ChatPage from "./pages/ChatPage";
import HomePage from "./pages/HomePage";
import LegalPage from "./pages/LegalPage";
import AdminWaitlistPage from "./pages/AdminWaitlistPage";

function Guard({ children }: { children: React.ReactElement }) {
  const { ready, loggedIn } = useAuth();
  const { t } = useTranslation();
  if (!ready) return <p className="layout">{t("common.loading")}</p>;
  if (!loggedIn) return <Navigate to={WAITLIST_ONLY_LAUNCH ? "/" : "/login"} replace />;
  return children;
}

function LaunchGate({ children }: { children: React.ReactElement }) {
  if (WAITLIST_ONLY_LAUNCH) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/login"
          element={
            <LaunchGate>
              <LoginPage />
            </LaunchGate>
          }
        />
        <Route
          path="/register"
          element={
            <LaunchGate>
              <RegisterPage />
            </LaunchGate>
          }
        />
        <Route
          path="/verify-email"
          element={
            <LaunchGate>
              <VerifyEmailPage />
            </LaunchGate>
          }
        />
        <Route path="/legal/:slug" element={<LegalPage />} />
        <Route path="/admin/waitlist" element={<AdminWaitlistPage />} />
        <Route
          path="/onboarding"
          element={
            <Guard>
              <OnboardingPage />
            </Guard>
          }
        />
        <Route
          path="/discover"
          element={
            <Guard>
              <DiscoverPage />
            </Guard>
          }
        />
        <Route
          path="/chat/:matchId"
          element={
            <Guard>
              <ChatPage />
            </Guard>
          }
        />
      </Route>
    </Routes>
  );
}
