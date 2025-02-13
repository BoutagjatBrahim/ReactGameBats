// components/CreateGame.jsx
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function CreateGame() {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: `Partie de ${user?.username || "Joueur"}`,
    maxPlayers: 2,
    gameType: "normal",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreateGame = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      console.log("Tentative de création de partie avec:", formData);

      const response = await fetch("http://localhost:3000/game", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          userId: user.id,
          maxPlayers: parseInt(formData.maxPlayers),
          gameType: formData.gameType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Erreur lors de la création de la partie"
        );
      }

      const data = await response.json();
      console.log("Partie créée avec succès:", data);

      alert(`Partie créée avec succès! ID: ${data.id}`);
      navigate(`/game/${data.id}`);
    } catch (error) {
      console.error("Erreur:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Créer une nouvelle partie
          </h2>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Retour
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="text-red-700">{error}</div>
          </div>
        )}

        <form onSubmit={handleCreateGame} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Nom de la partie
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="maxPlayers"
                className="block text-sm font-medium text-gray-700"
              >
                Nombre de joueurs
              </label>
              <select
                id="maxPlayers"
                name="maxPlayers"
                value={formData.maxPlayers}
                onChange={handleChange}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value={2}>2 joueurs</option>
              </select>
            </div>

            <div className="mb-4">
              <label
                htmlFor="gameType"
                className="block text-sm font-medium text-gray-700"
              >
                Type de partie
              </label>
              <select
                id="gameType"
                name="gameType"
                value={formData.gameType}
                onChange={handleChange}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="normal">Normal</option>
                <option value="ranked">Classé</option>
              </select>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              }`}
            >
              {isLoading ? (
                <span className="flex items-center">
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
                  Création en cours...
                </span>
              ) : (
                "Créer la partie"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateGame;
