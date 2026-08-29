"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Encaissement {
  id: string;
  montant: number;
  date_encaissement: string;
  client: string | null;
  categorie: string | null;
}

export default function Encaissements() {
  const [encaissements, setEncaissements] = useState<Encaissement[]>([]);
  const [montant, setMontant] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [client, setClient] = useState("");
  const [categorie, setCategorie] = useState("");
  const [loading, setLoading] = useState(true);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");

  async function charger() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("encaissements")
      .select("id, montant, date_encaissement, client, categorie")
      .eq("user_id", user.id)
      .order("date_encaissement", { ascending: false });

    if (!error && data) setEncaissements(data);
    setLoading(false);
  }

  useEffect(() => {
    charger();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");

    const montantNum = parseFloat(montant.replace(",", "."));
    if (!montantNum || montantNum <= 0 || !date) {
      setErreur("Merci de renseigner un montant valide et une date.");
      return;
    }

    setEnvoi(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setErreur("Utilisateur non connecté.");
      setEnvoi(false);
      return;
    }

    const { error } = await supabase.from("encaissements").insert({
      user_id: user.id,
      montant: montantNum,
      date_encaissement: date,
      client: client || null,
      categorie: categorie || null,
    });

    setEnvoi(false);
    if (error) {
      setErreur("Erreur lors de l'enregistrement : " + error.message);
      return;
    }

    setMontant("");
    setClient("");
    setCategorie("");
    setDate(new Date().toISOString().split("T")[0]);
    charger();
  }

  async function handleSupprimer(id: string) {
    const { error } = await supabase.from("encaissements").delete().eq("id", id);
    if (!error) charger();
  }

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "2rem" }}>
      <h1>Encaissements</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
        <label>
          Montant (€)
          <input
            type="text"
            inputMode="decimal"
            value={montant}
            onChange={(e) => setMontant(e.target.value)}
            placeholder="ex: 350"
          />
        </label>

        <label>
          Date
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>

        <label>
          Client (optionnel)
          <input
            type="text"
            value={client}
            onChange={(e) => setClient(e.target.value)}
          />
        </label>

        <label>
          Catégorie (optionnel)
          <input
            type="text"
            value={categorie}
            onChange={(e) => setCategorie(e.target.value)}
            placeholder="ex: Prestation, Vente..."
          />
        </label>

        {erreur && <p style={{ color: "red" }}>{erreur}</p>}

        <button type="submit" disabled={envoi}>
          {envoi ? "Enregistrement..." : "Ajouter l'encaissement"}
        </button>
      </form>

      <h2>Historique</h2>
      {loading ? (
        <p>Chargement...</p>
      ) : encaissements.length === 0 ? (
        <p>Aucun encaissement pour l'instant.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Date</th>
              <th style={{ textAlign: "left" }}>Client</th>
              <th style={{ textAlign: "left" }}>Catégorie</th>
              <th style={{ textAlign: "right" }}>Montant</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {encaissements.map((e) => (
              <tr key={e.id}>
                <td>{new Date(e.date_encaissement).toLocaleDateString("fr-FR")}</td>
                <td>{e.client || "-"}</td>
                <td>{e.categorie || "-"}</td>
                <td style={{ textAlign: "right" }}>{Number(e.montant).toLocaleString("fr-FR")} €</td>
                <td>
                  <button onClick={() => handleSupprimer(e.id)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
