// frontend/src/components/VerifyEmail.jsx

import React, { useEffect, useState } from "react";

function VerifyEmail() {
  const [message, setMessage] = useState("Vérification en cours...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      fetch(`http://localhost:<port_backend>/verify-email?token=${token}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.message) {
            setMessage(data.message);
          } else {
            setMessage(data.error || "Une erreur est survenue.");
          }
        })
        .catch(() => {
          setMessage("Une erreur est survenue.");
        });
    } else {
      setMessage("Token de vérification manquant.");
    }
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Vérification de l'e-mail</h1>
      <p>{message}</p>
    </div>
  );
}

export default VerifyEmail;
