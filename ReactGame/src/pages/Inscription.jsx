import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Inscription() {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Vérifier que les emails correspondent
    if (email !== confirmEmail) {
      setError("Les emails ne correspondent pas");
      return;
    }

    // Vérifier que les mots de passe correspondent
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    // Réinitialiser les erreurs
    setError("");

    // Créer l'objet userDatas
    const userDatas = {
      firstname,
      lastname,
      username,
      email,
      password,
    };

    try {
      // Envoyer les données au serveur
      const response = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userDatas),
      });

      const data = await response.json();

      if (response.ok) {
        // Afficher le message de succès
        setSuccessMessage(data.message);
      } else {
        setError(data.error || "Une erreur est survenue");
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      setError("Une erreur est survenue. Veuillez réessayer.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Inscription</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Prénom"
          className="input input-bordered w-full"
          value={firstname}
          onChange={(e) => setFirstname(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Nom"
          className="input input-bordered w-full"
          value={lastname}
          onChange={(e) => setLastname(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Nom d'utilisateur"
          className="input input-bordered w-full"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="input input-bordered w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Confirmez votre email"
          className="input input-bordered w-full"
          value={confirmEmail}
          onChange={(e) => setConfirmEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          className="input input-bordered w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirmez votre mot de passe"
          className="input input-bordered w-full"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        {error && <p className="text-red-500">{error}</p>}
        <button className="btn btn-primary" type="submit">
          S'inscrire
        </button>
      </form>
      {successMessage && <p className="text-green-500">{successMessage}</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}

export default Inscription;
