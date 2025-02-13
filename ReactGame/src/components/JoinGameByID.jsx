// components/JoinGameByID.jsx
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function JoinGameByID() {
  const [gameId, setGameId] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!gameId.trim()) {
  //     setError("Veuillez entrer un ID de partie");
  //     return;
  //   }

  //   setIsLoading(true);
  //   setError("");

  //   try {
  //     // Première étape : Vérification de l'existence de la partie
  //     console.log("Vérification de la partie:", gameId);
  //     const checkResponse = await fetch(
  //       `http://localhost:3000/game/${gameId}`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     const gameData = await checkResponse.json();

  //     if (!checkResponse.ok) {
  //       throw new Error(gameData.error || "Partie non trouvée");
  //     }

  //     // Vérifications supplémentaires
  //     if (gameData.state !== "pending") {
  //       throw new Error("Cette partie n'est plus disponible");
  //     }

  //     if (gameData.creator === user.id) {
  //       throw new Error("Vous ne pouvez pas rejoindre votre propre partie");
  //     }

  //     if (gameData.player2) {
  //       throw new Error("Cette partie est déjà complète");
  //     }

  //     // Deuxième étape : Tentative de rejoindre la partie
  //     console.log("Tentative de rejoindre la partie");
  //     const response = await fetch(
  //       `http://localhost:3000/game/join/${gameId}`,
  //       {
  //         method: "PATCH",
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({}),
  //       }
  //     );

  //     const data = await response.json();

  //     if (!response.ok) {
  //       throw new Error(data.error || "Impossible de rejoindre la partie");
  //     }

  //     console.log("Partie rejointe avec succès");
  //     navigate(`/game/${gameId}`);
  //   } catch (error) {
  //     console.error(
  //       "Erreur lors de la tentative de rejoindre la partie:",
  //       error
  //     );
  //     setError(error.message);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // JoinGameByID.jsx
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      console.log("Tentative de rejoindre la partie avec l'ID:", gameId);

      // Première étape : Vérification
      const checkResponse = await fetch(
        `http://localhost:3000/game/${gameId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!checkResponse.ok) {
        const errorData = await checkResponse.json();
        throw new Error(errorData.error || "Partie non trouvée");
      }

      const gameData = await checkResponse.json();
      console.log("Données de la partie:", gameData);

      if (gameData.creator === user.id) {
        throw new Error("Vous ne pouvez pas rejoindre votre propre partie");
      }

      // Deuxième étape : Rejoindre
      console.log("Tentative de rejoindre...");
      const joinResponse = await fetch(
        `http://localhost:3000/game/join/${gameId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      // Vérifier si la réponse est OK avant de parser le JSON
      if (!joinResponse.ok) {
        const errorText = await joinResponse.text(); // D'abord obtenir le texte brut
        console.error("Réponse d'erreur brute:", errorText);

        let errorMessage;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error;
        } catch (e) {
          errorMessage = "Erreur lors de la tentative de rejoindre la partie";
        }

        throw new Error(errorMessage);
      }

      const data = await joinResponse.json();
      console.log("Réponse de jointure:", data);

      navigate(`/game/${gameId}`);
    } catch (error) {
      console.error("Erreur complète:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Rejoindre une partie
          </h2>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            <span className="mr-1">←</span> Retour
          </button>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="gameId" className="sr-only">
                ID de la partie
              </label>
              <input
                id="gameId"
                type="text"
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Entrez l'ID de la partie"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              }`}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    ></path>
                  </svg>
                  Vérification en cours...
                </>
              ) : (
                "Rejoindre la partie"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default JoinGameByID;
