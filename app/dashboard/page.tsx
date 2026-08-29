"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  TAUX_2026,
  TypeActivite,
  calculerCotisations,
  pourcentageSeuil,
} from "@/lib/taux-2026";

interface Profil {
  type_activite: TypeActivite;
  acre_actif: boolean;
  date_debut_activite: string;
}

export default function Dashboard() {
  const [profil, setProfil] = useState<Profil | null>(null);
  const [caduMois, setCaduMois] = useState(0);
  const [caCumulAnnuel, setCaCumulAnnuel] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function charger() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profilData } = await supabase
        .from("profils")
        .select("type_activite, acre_actif, date_debut_activite")
        .eq("id", user.id)
        .single();

      setProfil(profilData);

      const debutMois = new Date();
      debutMois.setDate(1);
      const debutAnnee = new Date(new Date().getFullYear(), 0, 1);

      const { data: encaissementsMois } = await supabase
        .from("encaissements")
        .select("montant")
        .eq("user_id", user.id)
        .gte("date_encaissement", debutMois.toISOString());

      const { data: encaissementsAnnee } = await supabase
        .from("encaissements")
        .select("montant")
        .eq("user_id", user.id)
        .gte("date_encaissement", debutAnnee.toISOString());

      setCaduMois(
        (encaissementsMois || []).reduce((acc, e) => acc + Number(e.montant), 0)
      );
      setCaCumulAnnuel(
        (encaissementsAnnee || []).reduce((acc, e) => acc + Number(e.montant), 0)
      );
      setLoading(false);
    }
    charger();
  }, []);

  if (loading) return <p>Chargement...</p>;
  if (!profil) return <p>Profil introuvable — merci de compléter l'onboarding.</p>;

  const infosActivite = TAUX_2026[profil.type_activite];
  const cotisationsMois = calculerCotisations(
    caduMois,
    profil.type_activite,
    profil.acre_actif
  );
  const pourcentagePlafond = pourcentageSeuil(caCumulAnnuel, profil.type_activite);
  const approcheSeuilTVA = caCumulAnnuel >= infosActivite.seuilTVABase * 0.8;

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "2rem" }}>
      <h1>Tableau de bord</h1>
      <p>
        <Link href="/encaissements">→ Gérer mes encaissements</Link>
      </p>

      <section>
        <h2>CA du mois</h2>
        <p style={{ fontSize: "2rem" }}>{caduMois.toLocaleString("fr-FR")} €</p>
      </section>

      <section>
        <h2>Cotisations estimées à provisionner (ce mois)</h2>
        <p style={{ fontSize: "1.5rem" }}>
          {cotisationsMois.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} €
        </p>
        <small>Taux appliqué : {infosActivite.tauxCotisations}%{profil.acre_actif ? " (réduit ACRE)" : ""}</small>
      </section>

      <section>
        <h2>Cumul annuel</h2>
        <p>{caCumulAnnuel.toLocaleString("fr-FR")} € / {infosActivite.plafondCA.toLocaleString("fr-FR")} €</p>
        <div style={{ background: "#eee", borderRadius: 8, overflow: "hidden", height: 12 }}>
          <div
            style={{
              width: `${pourcentagePlafond}%`,
              background: pourcentagePlafond > 90 ? "#e74c3c" : "#2ecc71",
              height: "100%",
            }}
          />
        </div>
        <small>{pourcentagePlafond.toFixed(1)}% du plafond annuel atteint</small>
      </section>

      {approcheSeuilTVA && (
        <section style={{ background: "#fff3cd", padding: "1rem", borderRadius: 8 }}>
          ⚠️ Tu approches ou as dépassé le seuil de franchise TVA
          ({infosActivite.seuilTVABase.toLocaleString("fr-FR")} €). Vérifie tes obligations de facturation.
        </section>
      )}
    </main>
  );
}
