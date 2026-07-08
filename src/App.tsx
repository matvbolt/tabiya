import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import PlayBotPage from "./pages/PlayBotPage";
import TheoryPage from "./pages/TheoryPage";
import WorldPage from "./pages/WorldPage";
import SettingsPage from "./pages/SettingsPage";
import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import LearnPage from "./pages/LearnPage";
import ArticlePage from "./pages/ArticlePage";
import ArticleEditorPage from "./pages/ArticleEditorPage";
import PublicProfilePage from "./pages/PublicProfilePage";
import LoginPage from "./pages/LoginPage";
import LobbyPage from "./pages/LobbyPage";
import OnlineGamePage from "./pages/OnlineGamePage";
import ProfilePage from "./pages/ProfilePage";
import "./App.css";

const App = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route
          path="play/bot"
          element={
            <ProtectedRoute>
              <PlayBotPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="theory"
          element={
            <ProtectedRoute>
              <TheoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="world"
          element={
            <ProtectedRoute>
              <WorldPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="shop"
          element={
            <ProtectedRoute>
              <ShopPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="learn"
          element={
            <ProtectedRoute>
              <LearnPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="learn/new"
          element={
            <ProtectedRoute>
              <ArticleEditorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="learn/:id/edit"
          element={
            <ProtectedRoute>
              <ArticleEditorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="learn/:id"
          element={
            <ProtectedRoute>
              <ArticlePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="u/:id"
          element={
            <ProtectedRoute>
              <PublicProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="login" element={<LoginPage />} />
        <Route
          path="lobby"
          element={
            <ProtectedRoute>
              <LobbyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="game/:id"
          element={
            <ProtectedRoute>
              <OnlineGamePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/lobby" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
