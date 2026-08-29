"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Encaissement {
  id: string;
  montant: number;
  date_encaissement: string;
  client: string | null;
}

interface Facture {
  id: string;
  numero: string;
  montant: number;
  date_facture: string;
  encaissement_id: string | null;
}

export default function Factures() {
  const router = useRouter();
  const [encaissements, setEncaissements] = useState<Encaissement[]>([]);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");

  async function charger() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: encData } = await supabase
      .from("encaissements")
      .select("id, montant, date_encaissement, client")
      .eq("user_id", user.id)
      .order("date_encaissement", { ascending: false });

    const { data: factData } = await supabase
      .from("factures")
      .select("id, numero, montant, date_facture, encaissement_id")
      .eq("user_id", user.id)
      .order("date_facture", { ascending: false });

    setEncaissements(encData || []);
    setFactures(factData || []);
    setLoading(false);
  }

  useEffect(() => {
    charger();
  }, []);

  const idsFactures = new Set(factures.map((f) => f.encaissement_id));
  const encaissementsSansFacture = encaissements.filter((e) => !idsFactures.has(e.id));

  async function genererFacture(encaissement: Encaissement) {
    setErreur("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Numéro de facture séquentiel : F-ANNÉE-000X
    const annee = new Date(encaissement.date_encaissement).getFullYear();
    const numeroSequence = factures.filter((f) => f.numero.includes(`F-${annee}`)).length + 1;
    const numero = `F-${annee}-${String(numeroSequence).padStart(4, "0")}`;

    const { data, error } = await supabase
      .from("factures")
      .insert({
        user_id: user.id,
        encaissement_id: encaissement.id,
        numero,
        montant: encaissement.montant,
        date_facture: encaissement.date_encaissement,
      })
      .select()
      .single();

    if (error) {
      setErreur("Erreur : " + error.message);
      return;
    }
    router.push(`/factures/${data.id}`);
  }

  if (loading) return <p>Chargement...</p>;

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "2rem" }}>
      <h1>Factures</h1>
      <p>
        <Link href="/parametres">→ Renseigner mes infos de facturation</Link>
      </p>

      {erreur && <p style={{ color: "red" }}>{erreur}</p>}

      <h2>Encaissements sans facture</h2>
      {encaissementsSansFacture.length === 0 ? (
        <p>Tous tes encaissements ont une facture.</p>
      ) : (
        <ul>
          {encaissementsSansFacture.map((e) => (
            <li key={e.id} style={{ marginBottom: "0.5rem" }}>
              {new Date(e.date_encaissement).toLocaleDateString("fr-FR")} — {e.client || "Client non renseigné"} — {Number(e.montant).toLocaleString("fr-FR")} €{" "}
              <button onClick={() => genererFacture(e)}>Générer la facture</button>
            </li>
          ))}
        </ul>
      )}

      <h2>Factures générées</h2>
      {factures.length === 0 ? (
        <p>Aucune facture pour l'instant.</p>
      ) : (
        <ul>
          {factures.map((f) => (
            <li key={f.id}>
              <Link href={`/factures/${f.id}`}>
                {f.numero} — {new Date(f.date_facture).toLocaleDateString("fr-FR")} — {Number(f.montant).toLocaleString("fr-FR")} €
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
