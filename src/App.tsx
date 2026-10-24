import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import LegalPage from "./pages/LegalPage";
import AdminWaitlistPage from "./pages/AdminWaitlistPage";
import FeedPage from "./pages/FeedPage";
import ExplorePage from "./pages/ExplorePage";
import CommunityPage from "./pages/CommunityPage";
import PostPage from "./pages/PostPage";
import NewCommunityPage from "./pages/NewCommunityPage";
import SubmitPage from "./pages/SubmitPage";
import DatingPage from "./pages/DatingPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<FeedPage kind="feed" />} />
        <Route path="/popular" element={<FeedPage kind="popular" />} />
        <Route path="/news" element={<FeedPage kind="news" />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/dating" element={<DatingPage />} />
        <Route path="/communities/new" element={<NewCommunityPage />} />
        <Route path="/c/:slug" element={<CommunityPage />} />
        <Route path="/p/:id" element={<PostPage />} />
        <Route path="/submit" element={<SubmitPage />} />
        <Route path="/submit/:communitySlug" element={<SubmitPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/legal/:slug" element={<LegalPage />} />
        <Route path="/admin/waitlist" element={<AdminWaitlistPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
