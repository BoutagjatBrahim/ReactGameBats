import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";
import ProtectedRoute from "./components/ProtectedRoute"; // Ajoutez cet import
import Connexion from "./pages/Connexion";
import Accueil from "./pages/Accueil";
import Inscription from "./pages/Inscription";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import VerifyEmail from "./components/VerifyEmail";
import CreateGame from "./components/CreateGame";
import GameList from "./components/GameList";
import Game from "./components/Game";
import JoinGameByID from "./components/JoinGameByID";

function App() {
  return (
    <Router>
      <Navbar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/connexion" element={<Connexion />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/join-game"
            element={
              <ProtectedRoute>
                <JoinGameByID />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-game"
            element={
              <ProtectedRoute>
                <CreateGame />
              </ProtectedRoute>
            }
          />
          <Route
            path="/game-list"
            element={
              <ProtectedRoute>
                <GameList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/game/:gameId"
            element={
              <ProtectedRoute>
                <Game />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
