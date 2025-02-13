// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback } from "react";
import io from "socket.io-client";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem("token");
        const storedUser = JSON.parse(localStorage.getItem("user"));

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
          setIsAuthenticated(true);
          // Reconnect socket if needed
          connectSocket(storedToken);
        }
      } catch (error) {
        console.error("Erreur d'initialisation:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const connectSocket = useCallback((token) => {
    try {
      const newSocket = io("http://localhost:3000", {
        path: "/socket.io/",
        transports: ["websocket", "polling"],
        query: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      newSocket.on("connect", () => {
        console.log("Connecté à Socket.IO, ID:", newSocket.id);
      });

      newSocket.on("connect_error", (error) => {
        console.error("Erreur de connexion Socket.IO:", error.message);
      });

      newSocket.on("disconnect", (reason) => {
        console.log("Déconnecté de Socket.IO:", reason);
      });

      setSocket(newSocket);
      return newSocket;
    } catch (error) {
      console.error(
        "Erreur lors de la création de la connexion Socket.IO:",
        error
      );
      throw error;
    }
  }, []);

  const handleLogin = useCallback(
    async (email, password, navigate) => {
      try {
        const response = await fetch("http://localhost:3000/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
          credentials: "include",
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Erreur lors de la connexion");
        }

        const data = await response.json();
        const newToken = data.token;
        const userData = data.user || { email };

        // Mettre à jour le stockage
        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(userData));

        // Mettre à jour l'état
        setToken(newToken);
        setUser(userData);
        setIsAuthenticated(true);

        // Connecter Socket.IO
        const newSocket = connectSocket(newToken);
        console.log("Socket connecté:", newSocket.id);

        // Redirection avec replacement de l'historique
        navigate("/dashboard", { replace: true });
      } catch (error) {
        console.error("Erreur lors de la connexion:", error);
        throw error;
      }
    },
    [connectSocket]
  );

  const logout = useCallback(
    (navigate) => {
      // Déconnecter le socket
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }

      // Nettoyer les états
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);

      // Nettoyer le stockage
      // localStorage.removeItem("token");
      // localStorage.removeItem("user");
      localStorage.clear();

      // Rediriger vers la page de connexion
      if (navigate) {
        navigate("/connexion", { replace: true });
      }
    },
    [socket]
  );

  const contextValue = {
    isAuthenticated,
    user,
    token,
    socket,
    loading,
    handleLogin,
    logout,
  };

  if (loading) {
    return <div>Chargement...</div>; // Ou votre composant de chargement
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
