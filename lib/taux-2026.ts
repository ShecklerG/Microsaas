// Table de référence — taux et seuils auto-entrepreneur
// Source : URSSAF, à vérifier/mettre à jour chaque année (souvent en janvier)
// Dernière vérification : 29 août 2026

export type TypeActivite = "vente" | "services_bic" | "liberal_bnc" | "liberal_cipav";

export interface TauxActivite {
  label: string;
  tauxCotisations: number; // en % du CA encaissé
  plafondCA: number; // plafond annuel pour rester au régime micro
  seuilTVABase: number; // seuil de franchise TVA (base)
  seuilTVAMajore: number; // seuil de tolérance TVA (majoré)
}

export const TAUX_2026: Record<TypeActivite, TauxActivite> = {
  vente: {
    label: "Vente de marchandises, restauration, hébergement",
    tauxCotisations: 12.3,
    plafondCA: 203100,
    seuilTVABase: 85000,
    seuilTVAMajore: 93500,
  },
  services_bic: {
    label: "Prestations de services (BIC)",
    tauxCotisations: 21.2,
    plafondCA: 83600,
    seuilTVABase: 37500,
    seuilTVAMajore: 41250,
  },
  liberal_bnc: {
    label: "Professions libérales non réglementées (BNC)",
    tauxCotisations: 25.6,
    plafondCA: 83600,
    seuilTVABase: 37500,
    seuilTVAMajore: 41250,
  },
  liberal_cipav: {
    label: "Professions libérales réglementées (CIPAV)",
    tauxCotisations: 23.2,
    plafondCA: 83600,
    seuilTVABase: 37500,
    seuilTVAMajore: 41250,
  },
};

// Réduction ACRE (1ère année d'activité, si éligible)
export const TAUX_REDUCTION_ACRE = 0.25; // 25% de réduction sur les cotisations depuis juillet 2026

export function calculerCotisations(
  ca: number,
  typeActivite: TypeActivite,
  acreActif: boolean = false
): number {
  const taux = TAUX_2026[typeActivite].tauxCotisations;
  const tauxEffectif = acreActif ? taux * (1 - TAUX_REDUCTION_ACRE) : taux;
  return (ca * tauxEffectif) / 100;
}

export function pourcentageSeuil(
  caAnnuelCumule: number,
  typeActivite: TypeActivite
): number {
  const plafond = TAUX_2026[typeActivite].plafondCA;
  return Math.min((caAnnuelCumule / plafond) * 100, 100);
}
