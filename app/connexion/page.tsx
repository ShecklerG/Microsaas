"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Connexion() {
  const [email, setEmail] = useState("");
  const [envoye, setEnvoye] = useState(false);
  const [erreur, setErreur] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErreur("");

    const { error } = await supabase.auth.signInWithOtp({ email });

    setLoading(false);
    if (error) {
      setErreur("Erreur : " + error.message);
      return;
    }
    setEnvoye(true);
  }

  return (
    <main style={{ maxWidth: 400, margin: "0 auto", padding: "2rem" }}>
      <h1>Connexion</h1>
      {envoye ? (
        <p>Un lien de connexion t'a été envoyé par email. Clique dessus pour continuer.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          {erreur && <p style={{ color: "red" }}>{erreur}</p>}
          <button type="submit" disabled={loading}>
            {loading ? "Envoi..." : "Recevoir le lien de connexion"}
          </button>
        </form>
      )}
    </main>
  );
}
