"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Parametres() {
  const [nom, setNom] = useState("");
  const [adresse, setAdresse] = useState("");
  const [siret, setSiret] = useState("");
  const [loading, setLoading] = useState(true);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState(false);

  useEffect(() => {
    async function charger() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profils")
        .select("nom, adresse, siret")
        .eq("id", user.id)
        .single();

      if (data) {
        setNom(data.nom || "");
        setAdresse(data.adresse || "");
        setSiret(data.siret || "");
      }
      setLoading(false);
    }
    charger();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    setSucces(false);

    if (!nom || !adresse || !siret) {
      setErreur("Merci de remplir tous les champs — ils sont obligatoires sur une facture.");
      return;
    }

    setEnvoi(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setErreur("Utilisateur non connecté.");
      setEnvoi(false);
      return;
    }

    const { error } = await supabase
      .from("profils")
      .update({ nom, adresse, siret })
      .eq("id", user.id);

    setEnvoi(false);
    if (error) {
      setErreur("Erreur lors de l'enregistrement : " + error.message);
      return;
    }
    setSucces(true);
  }

  if (loading) return <p>Chargement...</p>;

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "2rem" }}>
      <h1>Informations de facturation</h1>
      <p>Ces infos sont obligatoires sur toute facture française.</p>

      <form onSubmit={handleSubmit}>
        <label>
          Nom / Raison sociale
          <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} />
        </label>

        <label>
          Adresse complète
          <input type="text" value={adresse} onChange={(e) => setAdresse(e.target.value)} />
        </label>

        <label>
          Numéro SIRET
          <input type="text" value={siret} onChange={(e) => setSiret(e.target.value)} />
        </label>

        {erreur && <p style={{ color: "red" }}>{erreur}</p>}
        {succes && <p style={{ color: "green" }}>Enregistré !</p>}

        <button type="submit" disabled={envoi}>
          {envoi ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>
    </main>
  );
}
