// components/JoinGame.jsx
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function JoinGame() {
  const { socket, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [gameId, setGameId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const response = await fetch("http://localhost:3000/games", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des parties");
      }

      const data = await response.json();
      setGames(data.games);
      setIsLoading(false);

      if (socket) {
        socket.on("gameListUpdated", (updatedGames) => {
          setGames(updatedGames);
        });
      }
    } catch (err) {
      console.error("Erreur:", err);
      setError("Impossible de charger les parties.");
      setIsLoading(false);
    }
  };

  const handleJoinGame = async (gameId) => {
    try {
      if (!socket) {
        throw new Error("La connexion socket n'est pas disponible");
      }

      setIsLoading(true);
      const response = await fetch(
        `http://localhost:3000/game/${gameId}/join`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: user.id }),
        }
      );

      if (!response.ok) {
        throw new Error("Impossible de rejoindre la partie");
      }

      const game = await response.json();
      navigate(`/game/${gameId}`);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinByID = async (e) => {
    e.preventDefault();
    if (!gameId.trim()) {
      setError("Veuillez entrer un ID de partie");
      return;
    }
    await handleJoinGame(gameId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Section pour rejoindre par ID */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Rejoindre par ID</h2>
        <form onSubmit={handleJoinByID} className="flex gap-4">
          <input
            type="text"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            placeholder="Entrez l'ID de la partie"
            className="flex-1 p-2 border rounded"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Rejoindre
          </button>
        </form>
        {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
      </div>

      {/* Liste des parties disponibles */}
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-4">Parties disponibles</h2>
        {games.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-gray-600">
              Aucune partie disponible pour le moment.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {games.map((game) => (
              <div
                key={game.id}
                className="border rounded-lg p-4 bg-white shadow hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">
                      Partie de {game.player1?.username || "Joueur inconnu"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      État :{" "}
                      {game.state === "pending" ? "En attente" : "En cours"}
                    </p>
                    <p className="text-xs text-gray-400">ID: {game.id}</p>
                  </div>
                  <button
                    onClick={() => handleJoinGame(game.id)}
                    disabled={game.state !== "pending" || isLoading}
                    className={`px-4 py-2 rounded ${
                      game.state === "pending"
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {game.state === "pending" ? "Rejoindre" : "Partie en cours"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default JoinGame;
