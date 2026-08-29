"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { TAUX_2026, TypeActivite } from "@/lib/taux-2026";

export default function Onboarding() {
  const router = useRouter();
  const [typeActivite, setTypeActivite] = useState<TypeActivite | "">("");
  const [acreActif, setAcreActif] = useState(false);
  const [dateDebut, setDateDebut] = useState("");
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!typeActivite || !dateDebut) {
      setErreur("Merci de remplir tous les champs.");
      return;
    }
    setLoading(true);
    setErreur("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setErreur("Utilisateur non connecté.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("profils").insert({
      id: user.id,
      type_activite: typeActivite,
      acre_actif: acreActif,
      date_debut_activite: dateDebut,
    });

    setLoading(false);
    if (error) {
      setErreur("Erreur lors de l'enregistrement : " + error.message);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "2rem" }}>
      <h1>Bienvenue 👋</h1>
      <p>Quelques infos pour bien calculer tes cotisations et seuils.</p>

      <form onSubmit={handleSubmit}>
        <label>
          Type d'activité
          <select
            value={typeActivite}
            onChange={(e) => setTypeActivite(e.target.value as TypeActivite)}
          >
            <option value="">-- Choisir --</option>
            {Object.entries(TAUX_2026).map(([key, val]) => (
              <option key={key} value={key}>
                {val.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <input
            type="checkbox"
            checked={acreActif}
            onChange={(e) => setAcreActif(e.target.checked)}
          />
          Je bénéficie de l'ACRE
        </label>

        <label>
          Date de début d'activité
          <input
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
          />
        </label>

        {erreur && <p style={{ color: "red" }}>{erreur}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Enregistrement..." : "Continuer"}
        </button>
      </form>
    </main>
  );
}
