// src/components/Navbar.jsx

import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext"; // Assurez-vous que le chemin est correct
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const { theme, setTheme } = useContext(ThemeContext);
  const { isAuthenticated, logout } = useContext(AuthContext);

  const handleThemeChange = (e) => {
    setTheme(e.target.value);
  };

  return (
    <nav className="navbar bg-base-100 fixed top-0 left-0 w-full">
      <div className="flex-1">
        <Link to="/" className="normal-case text-xl text-base-content">
          Mon Projet
        </Link>
      </div>
      <div className="flex-none gap-2">
        <select
          className="select select-bordered "
          onChange={handleThemeChange}
          value={theme}
        >
          <option value="light">Clair</option>
          <option value="dark">Sombre</option>
        </select>
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="btn btn-ghost text-base-content">
              Dashboard
            </Link>
            {isAuthenticated && (
              <button onClick={logout} className="btn btn-ghost">
                Déconnexion
              </button>
            )}
          </>
        ) : (
          <>
            <Link to="/connexion" className="btn btn-ghost text-base-content">
              Connexion
            </Link>
            <Link to="/inscription" className="btn btn-ghost text-base-content">
              Inscription
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
