"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface FactureDetail {
  numero: string;
  montant: number;
  date_facture: string;
  encaissement_id: string | null;
}

interface Profil {
  nom: string;
  adresse: string;
  siret: string;
}

interface Encaissement {
  client: string | null;
  categorie: string | null;
}

export default function DetailFacture() {
  const params = useParams();
  const [facture, setFacture] = useState<FactureDetail | null>(null);
  const [profil, setProfil] = useState<Profil | null>(null);
  const [encaissement, setEncaissement] = useState<Encaissement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function charger() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: factData } = await supabase
        .from("factures")
        .select("numero, montant, date_facture, encaissement_id")
        .eq("id", params.id)
        .single();

      const { data: profilData } = await supabase
        .from("profils")
        .select("nom, adresse, siret")
        .eq("id", user.id)
        .single();

      setFacture(factData);
      setProfil(profilData);

      if (factData?.encaissement_id) {
        const { data: encData } = await supabase
          .from("encaissements")
          .select("client, categorie")
          .eq("id", factData.encaissement_id)
          .single();
        setEncaissement(encData);
      }

      setLoading(false);
    }
    charger();
  }, [params.id]);

  if (loading) return <p>Chargement...</p>;
  if (!facture) return <p>Facture introuvable.</p>;
  if (!profil?.nom || !profil?.siret) {
    return (
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "2rem" }}>
        <p>
          Merci de renseigner tes informations de facturation avant de générer une facture
          (nom, adresse, SIRET).
        </p>
        <a href="/parametres">→ Renseigner mes infos</a>
      </main>
    );
  }

  return (
    <>
      <main
        style={{
          maxWidth: 700,
          margin: "0 auto",
          padding: "2rem",
          fontFamily: "sans-serif",
        }}
      >
        <div className="no-print" style={{ marginBottom: "1.5rem" }}>
          <button onClick={() => window.print()}>Imprimer / Enregistrer en PDF</button>
        </div>

        <h1>Facture {facture.numero}</h1>
        <p>Date : {new Date(facture.date_facture).toLocaleDateString("fr-FR")}</p>

        <hr />

        <div style={{ marginTop: "1.5rem" }}>
          <strong>Émetteur</strong>
          <p style={{ whiteSpace: "pre-line" }}>
            {profil.nom}
            {"\n"}
            {profil.adresse}
            {"\n"}
            SIRET : {profil.siret}
          </p>
        </div>

        {encaissement?.client && (
          <div style={{ marginTop: "1.5rem" }}>
            <strong>Client</strong>
            <p>{encaissement.client}</p>
          </div>
        )}

        <table style={{ width: "100%", marginTop: "2rem", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #000" }}>
              <th style={{ textAlign: "left", padding: "0.5rem 0" }}>Description</th>
              <th style={{ textAlign: "right", padding: "0.5rem 0" }}>Montant</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: "0.5rem 0" }}>{encaissement?.categorie || "Prestation"}</td>
              <td style={{ textAlign: "right", padding: "0.5rem 0" }}>
                {Number(facture.montant).toLocaleString("fr-FR")} €
              </td>
            </tr>
          </tbody>
        </table>

        <p style={{ textAlign: "right", fontSize: "1.2rem", marginTop: "1rem" }}>
          <strong>Total : {Number(facture.montant).toLocaleString("fr-FR")} €</strong>
        </p>

        <div style={{ marginTop: "3rem", fontSize: "0.85rem", color: "#555" }}>
          <p>TVA non applicable, article 293 B du CGI.</p>
          <p>Dispensé d'immatriculation au RCS et au RM (micro-entrepreneur).</p>
        </div>
      </main>

      <style jsx global>{`
        @media print {
          .no-print {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
