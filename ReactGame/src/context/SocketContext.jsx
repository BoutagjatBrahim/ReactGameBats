// frontend/src/context/SocketContext.jsx

import React, { createContext, useEffect, useState, useContext } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext";

// Créer le contexte Socket
export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { token } = useContext(AuthContext); // Obtenir le token depuis AuthContext
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (token) {
      // Se connecter à Socket.io seulement si l'utilisateur est authentifié
      const newSocket = io("http://localhost:3000", {
        query: { token }, // Envoyer le token lors de la connexion
      });

      setSocket(newSocket);

      // Nettoyage lors du démontage du composant
      return () => newSocket.close();
    }
  }, [token]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
