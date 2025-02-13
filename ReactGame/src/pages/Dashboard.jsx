// components/Dashboard.jsx
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const response = await fetch("http://localhost:3000/games/user", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erreur lors de la récupération des parties"
        );
      }

      const data = await response.json();
      setGames(data.games);
      setError(null);
    } catch (err) {
      console.error("Erreur lors de la récupération des parties:", err);
      setError("Impossible de charger vos parties");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGame = () => {
    navigate("/create-game");
  };

  const handleJoinGame = () => {
    navigate("/game-list");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    // Modifiez la section des actions dans Dashboard.jsx
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <button
        onClick={handleCreateGame}
        className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
      >
        Créer une nouvelle partie
      </button>
      <button
        onClick={() => navigate("/join-game")}
        className="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
      >
        Rejoindre avec ID
      </button>
      <button
        onClick={handleJoinGame}
        className="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200"
      >
        Liste des parties
      </button>
    </div>
  );
}

export default Dashboard;
