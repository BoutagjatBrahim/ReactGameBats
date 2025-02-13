import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Game() {
  const { gameId } = useParams();
  const { user, socket } = useContext(AuthContext);
  const [game, setGame] = useState(null);
  const [error, setError] = useState(null);
  const [selectedSticks, setSelectedSticks] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (game?.state === "finished") {
      console.log("Game end state:", {
        winner: game.winner,
        userId: user.id,
        isWinner: game.winner === user.id,
        player1: game.player1,
        player2: game.secondPlayer,
        creator: game.creator,
      });
    }
  }, [game?.state]);

  useEffect(() => {
    localStorage.setItem("currentGameId", gameId);
    fetchGameState();

    if (socket) {
      socket.on("gameUpdated", (updatedGame) => {
        console.log("Game updated:", updatedGame);
        setGame(updatedGame);
      });

      // socket.on("playerDisconnected", (data) => {
      //   if (data.gameId === gameId) {
      //     fetchGameState();
      //   }
      // });
      socket.on("playerDisconnected", (data) => {
        if (data.gameId === gameId) {
          const disconnectedPlayer =
            game?.creator === data.userId
              ? game?.player1?.username
              : game?.secondPlayer?.username;

          setGame((prev) => ({
            ...prev,
            state: "finished",
            winner: user.id,
          }));
          setError(
            `${disconnectedPlayer} s'est déconnecté(e). Vous gagnez la partie !`
          );
        }
      });

      if (game?.state === "pending" && !game?.player2) {
        socket.emit("joinGame", gameId, (response) => {
          if (response.status === "ok") {
            setGame(response.game);
          } else {
            setError(response.error);
          }
        });
      }

      socket.emit("joinGameRoom", gameId);

      return () => {
        socket.off("gameUpdated");
        socket.off("playerDisconnected");
        socket.emit("leaveGameRoom", gameId);
        localStorage.removeItem("currentGameId");
      };
    }
  }, [socket, gameId, game]);

  // Modification de la condition de fin de jeu
  const isGameOver = game?.sticks === 0;

  const fetchGameState = async () => {
    try {
      console.log("Tentative de récupération de l'état du jeu:", gameId);

      const response = await fetch(`http://localhost:3000/game/${gameId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération de la partie");
      }

      try {
        const data = JSON.parse(responseText);
        console.log("Données du jeu reçues:", data);
        setGame(data);
      } catch (jsonError) {
        console.error("Erreur lors du parsing JSON:", jsonError);
        throw new Error("Format de réponse invalide");
      }
    } catch (error) {
      console.error("Erreur complète:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isMyTurn = () => {
    return game?.currentPlayer === user.id;
  };

  // const handlePlay = async () => {
  //   try {
  //     // Vérification supplémentaire côté client
  //     if (selectedSticks > game.sticks) {
  //       setError(
  //         `Il ne reste que ${game.sticks} bâtonnet${
  //           game.sticks > 1 ? "s" : ""
  //         }. Vous ne pouvez pas en retirer ${selectedSticks}`
  //       );
  //       return;
  //     }
  //     const response = await fetch(
  //       `http://localhost:3000/game/${gameId}/play`,
  //       {
  //         method: "POST",
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem("token")}`,
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           sticksToRemove: selectedSticks,
  //         }),
  //       }
  //     );

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(errorData.error);
  //     }

  //     const updatedGame = await response.json();
  //     setGame(updatedGame);
  //     setError(null);
  //   } catch (error) {
  //     setError(error.message);
  //   }
  // };
  const handlePlay = async (sticksToRemove) => {
    try {
      console.log("Tentative de retirer", sticksToRemove, "bâtonnet(s)");
      const response = await fetch(
        `http://localhost:3000/game/${gameId}/play`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sticksToRemove: sticksToRemove,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      const updatedGame = await response.json();
      setGame(updatedGame);
      setError(null);
    } catch (error) {
      setError(error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    // <div className="max-w-2xl mx-auto p-4">
    //   <div className="bg-white shadow-lg rounded-lg p-6">
    //     <h1 className="text-2xl font-bold mb-6">Jeu de bâtonnets</h1>
    //     <div className="text-sm text-gray-500 mb-4">
    //       ID de la partie : {gameId}
    //     </div>
    //     <div className="mb-6 p-4 bg-gray-50 rounded-lg">
    //       <div className="grid grid-cols-2 gap-4">
    //         <div>
    //           <p className="font-semibold">Joueur 1:</p>
    //           <p>{game?.player1?.username || "..."}</p>
    //         </div>
    //         <div>
    //           <p className="font-semibold">Joueur 2:</p>
    //           <p>{game?.secondPlayer?.username || "En attente..."}</p>
    //         </div>
    //       </div>
    //     </div>
    //     <div className="mb-6">
    //       <p className="text-lg mb-2">
    //         Bâtonnets restants: {game?.sticks || 0}
    //       </p>
    //       <div className="flex flex-wrap gap-1">
    //         {[...Array(game?.sticks || 0)].map((_, i) => (
    //           <div key={i} className="w-1 h-8 bg-yellow-600" />
    //         ))}
    //       </div>
    //     </div>
    //     <div className="mb-6 p-4 bg-blue-50 rounded-lg">
    //       <p className="font-bold">
    //         {isMyTurn()
    //           ? "C'est votre tour !"
    //           : "En attente de l'adversaire..."}
    //       </p>
    //     </div>
    //     {game?.state === "playing" && isMyTurn() && game.sticks > 0 && (
    //       <div className="flex items-center space-x-4">
    //         <select
    //           value={selectedSticks}
    //           onChange={(e) => {
    //             const newValue = Number(e.target.value);
    //             // S'assurer que la valeur ne dépasse pas le nombre de bâtonnets restants
    //             setSelectedSticks(Math.min(newValue, game.sticks));
    //           }}
    //           className="border p-2 rounded"
    //         >
    //           {/* Ne générer que les options possibles basées sur le nombre de bâtonnets restants */}
    //           {[...Array(Math.min(3, game.sticks))]
    //             .map((_, i) => i + 1)
    //             .map((num) => (
    //               <option key={num} value={num} disabled={num > game.sticks}>
    //                 {num} bâtonnet{num > 1 ? "s" : ""}
    //               </option>
    //             ))}
    //         </select>
    //         <button
    //           onClick={() => {
    //             // Double vérification avant d'envoyer la requête
    //             const sticksToRemove = Math.min(selectedSticks, game.sticks);
    //             handlePlay(sticksToRemove);
    //           }}
    //           className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    //         >
    //           Retirer
    //         </button>
    //       </div>
    //     )}
    //     {game?.state === "finished" && (
    //       <div
    //         className={`text-center p-4 ${
    //           game.winner === user.id ? "bg-green-100" : "bg-red-100"
    //         } rounded-lg`}
    //       >
    //         {game.winner === user.id ? (
    //           <>
    //             <h2 className="text-2xl font-bold text-green-800 mb-2">
    //               🎉 Victoire !
    //             </h2>
    //             <p className="text-green-700">
    //               Félicitations ! Vous avez remporté la partie en prenant le
    //               dernier bâtonnet !
    //             </p>
    //             <div className="mt-4 text-sm text-gray-600">
    //               <p>
    //                 Vous avez gagné contre{" "}
    //                 {user.id === game.creator
    //                   ? game.secondPlayer.username
    //                   : game.player1.username}
    //               </p>
    //             </div>
    //           </>
    //         ) : (
    //           <>
    //             <h2 className="text-2xl font-bold text-red-800 mb-2">
    //               😢 Défaite
    //             </h2>
    //             <p className="text-red-700">
    //               {user.id === game.creator
    //                 ? game.secondPlayer.username
    //                 : game.player1.username}{" "}
    //               a gagné en prenant le dernier bâtonnet.
    //             </p>
    //           </>
    //         )}
    //       </div>
    //     )}
    //     {error && (
    //       <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
    //         {error}
    //       </div>
    //     )}
    //   </div>
    // </div>

    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Jeu de bâtonnets</h1>

        <div className="text-sm text-gray-500 mb-4">
          ID de la partie : {gameId}
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold">Joueur 1:</p>
              <p>{game?.player1?.username || "..."}</p>
            </div>
            <div>
              <p className="font-semibold">Joueur 2:</p>
              <p>{game?.secondPlayer?.username || "En attente..."}</p>
            </div>
          </div>

          {game?.state === "playing" && (
            <div className="mt-4 flex space-x-4 justify-center">
              <button
                onClick={async () => {
                  try {
                    await fetch(`http://localhost:3000/game/${gameId}/save`, {
                      method: "POST",
                      headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                          "token"
                        )}`,
                      },
                    });
                    setError("✅ Partie sauvegardée!");
                  } catch (err) {
                    setError("❌ Erreur lors de la sauvegarde");
                  }
                }}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                💾 Sauvegarder
              </button>

              <button
                onClick={async () => {
                  try {
                    const response = await fetch(
                      `http://localhost:3000/game/${gameId}/load`,
                      {
                        method: "POST",
                        headers: {
                          Authorization: `Bearer ${localStorage.getItem(
                            "token"
                          )}`,
                        },
                      }
                    );
                    const data = await response.json();
                    if (data.error) {
                      setError("❌ " + data.error);
                    } else {
                      setGame(data);
                      setError("✅ Partie chargée!");
                    }
                  } catch (err) {
                    setError("❌ Erreur lors du chargement");
                  }
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                🔄 Charger
              </button>
            </div>
          )}
        </div>

        <div className="mb-6">
          <p className="text-lg mb-2">
            Bâtonnets restants: {game?.sticks || 0}
          </p>
          <div className="flex flex-wrap gap-1">
            {[...Array(game?.sticks || 0)].map((_, i) => (
              <div key={i} className="w-1 h-8 bg-yellow-600" />
            ))}
          </div>
        </div>

        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="font-bold">
            {isMyTurn()
              ? "C'est votre tour !"
              : "En attente de l'adversaire..."}
          </p>
        </div>

        {game?.state === "playing" && isMyTurn() && game.sticks > 0 && (
          <div className="flex items-center space-x-4">
            <select
              value={selectedSticks}
              onChange={(e) => {
                const newValue = Number(e.target.value);
                setSelectedSticks(Math.min(newValue, game.sticks));
              }}
              className="border p-2 rounded"
            >
              {[...Array(Math.min(3, game.sticks))]
                .map((_, i) => i + 1)
                .map((num) => (
                  <option key={num} value={num} disabled={num > game.sticks}>
                    {num} bâtonnet{num > 1 ? "s" : ""}
                  </option>
                ))}
            </select>
            <button
              onClick={() => {
                const sticksToRemove = Math.min(selectedSticks, game.sticks);
                handlePlay(sticksToRemove);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Retirer
            </button>
          </div>
        )}

        {game?.state === "finished" && (
          <div
            className={`text-center p-4 ${
              game.winner === user.id ? "bg-green-100" : "bg-red-100"
            } rounded-lg`}
          >
            {game.winner === user.id ? (
              <>
                <h2 className="text-2xl font-bold text-green-800 mb-2">
                  🎉 Victoire !
                </h2>
                <p className="text-green-700">
                  Félicitations ! Vous avez remporté la partie en prenant le
                  dernier bâtonnet !
                </p>
                <div className="mt-4 text-sm text-gray-600">
                  <p>
                    Vous avez gagné contre{" "}
                    {user.id === game.creator
                      ? game.secondPlayer.username
                      : game.player1.username}
                  </p>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-red-800 mb-2">
                  😢 Défaite
                </h2>
                <p className="text-red-700">
                  {user.id === game.creator
                    ? game.secondPlayer.username
                    : game.player1.username}{" "}
                  a gagné en prenant le dernier bâtonnet.
                </p>
              </>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default Game;
