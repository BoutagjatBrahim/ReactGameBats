// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const location = useLocation();

  // Si l'authentification est en cours de vérification
  if (loading) {
    return <div>Chargement...</div>;
  }

  // Si non authentifié, rediriger vers la page de connexion
  if (!isAuthenticated) {
    return <Navigate to="/connexion" state={{ from: location }} replace />;
  }

  // Si authentifié, afficher le composant enfant
  return children;
};

export default ProtectedRoute;
