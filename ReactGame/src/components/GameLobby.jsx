// frontend/src/components/GameLobby.jsx
import React, { useState } from "react";
import CreateGame from "./CreateGame";
import JoinGame from "./JoinGame";

function GameLobby() {
  const [activeTab, setActiveTab] = useState("join"); // 'join' ou 'create'

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Salon de jeu</h1>
        </div>

        <div className="bg-white shadow rounded-lg">
          {/* Onglets */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab("join")}
                className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === "join"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Rejoindre une partie
              </button>
              <button
                onClick={() => setActiveTab("create")}
                className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === "create"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Créer une partie
              </button>
            </nav>
          </div>

          {/* Contenu */}
          <div className="p-6">
            {activeTab === "join" ? <JoinGame /> : <CreateGame />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameLobby;
