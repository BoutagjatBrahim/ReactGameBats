// components/GameList.jsx
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function GameList() {
  const { user, token } = useContext(AuthContext);
  const [savedGames, setSavedGames] = useState([]);
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);


  const fetchSavedGames = async () => {
    try {
      const response = await fetch("http://localhost:3000/games/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setSavedGames(data.games);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchGames();
    fetchSavedGames();
  }, []);

  const fetchGames = async () => {
    try {
      const response = await fetch("http://localhost:3000/games/available", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des parties disponibles");
      }

      const data = await response.json();
      setGames(data.games);
    } catch (err) {
      setError("Impossible de charger les parties disponibles");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGame = async (gameId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/game/${gameId}/join`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: user.id }),
        }
      );

      if (!response.ok) {
        throw new Error("Impossible de rejoindre la partie");
      }

      const game = await response.json();
      navigate(`/game/${game.id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    // <div className="container mx-auto px-4 py-8">
    //   <div className="mb-8">
    //     <h1 className="text-3xl font-bold mb-4">Parties disponibles</h1>
    //     <button
    //       onClick={() => navigate("/dashboard")}
    //       className="text-blue-600 hover:text-blue-800"
    //     >
    //       ← Retour au tableau de bord
    //     </button>
    //   </div>

    //   {error && (
    //     <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
    //       {error}
    //       <button
    //         onClick={fetchGames}
    //         className="ml-4 text-sm underline hover:no-underline"
    //       >
    //         Réessayer
    //       </button>
    //     </div>
    //   )}

    //   <div className="grid gap-4">
    //     {games.length === 0 ? (
    //       <p className="text-gray-500 text-center py-8">
    //         Aucune partie disponible pour le moment.
    //       </p>
    //     ) : (
    //       games.map((game) => (
    //         <div
    //           key={game.id}
    //           className="border rounded-lg p-4 bg-white shadow hover:shadow-md transition-shadow"
    //         >
    //           <div className="flex justify-between items-center">
    //             <div>
    //               <h3 className="font-medium">
    //                 Partie de {game.player1?.username || "Inconnu"}
    //               </h3>
    //               <p className="text-sm text-gray-500">
    //                 État: {game.state === "pending" ? "En attente" : "En cours"}
    //               </p>
    //             </div>
    //             {game.state === "pending" && game.creator !== user.id && (
    //               <button
    //                 onClick={() => handleJoinGame(game.id)}
    //                 className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    //               >
    //                 Rejoindre
    //               </button>
    //             )}
    //           </div>
    //         </div>
    //       ))
    //     )}
    //   </div>
    // </div>

    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Parties disponibles</h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Retour au tableau de bord
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
          {error}
          <button
            onClick={fetchGames}
            className="ml-4 text-sm underline hover:no-underline"
          >
            Réessayer
          </button>
        </div>
      )}

      <div className="grid gap-4 mb-8">
        <h2 className="text-2xl font-bold">Parties en attente</h2>
        {games.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Aucune partie disponible pour le moment.
          </p>
        ) : (
          games.map((game) => (
            <div
              key={game.id}
              className="border rounded-lg p-4 bg-white shadow hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">
                    Partie de {game.player1?.username || "Inconnu"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    État: {game.state === "pending" ? "En attente" : "En cours"}
                  </p>
                </div>
                {game.state === "pending" && game.creator !== user.id && (
                  <button
                    onClick={() => handleJoinGame(game.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Rejoindre
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="grid gap-4">
        <h2 className="text-2xl font-bold mb-4">Parties sauvegardées</h2>
        {savedGames.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Aucune partie sauvegardée.
          </p>
        ) : (
          savedGames.map((game) => (
            <div
              key={game.id}
              className="border rounded-lg p-4 bg-white shadow hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">
                    Contre{" "}
                    {game.creator === user.id
                      ? game.secondPlayer?.username
                      : game.player1?.username}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Bâtonnets restants : {game.sticks}
                  </p>
                  <p className="text-sm text-gray-400">
                    Sauvegardée le {new Date(game.lastSaved).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/game/${game.id}`)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Reprendre
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default GameList;
