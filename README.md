# Micro-SaaS — Suivi financier auto-entrepreneur (nom à définir)

## Stack
- Next.js (web)
- Supabase (base de données, auth, RLS)
- Stripe (abonnement)

## Ce qui est fait
- `lib/taux-2026.ts` : table des taux de cotisations et seuils 2026 par type d'activité, facilement modifiable chaque année.
- `supabase/schema.sql` : schéma des tables `profils`, `encaissements`, `factures` avec RLS.
- `lib/supabase.ts` : client Supabase (nécessite les variables d'environnement `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- `app/onboarding/page.tsx` : écran de saisie du type d'activité, ACRE, date de début.
- `app/dashboard/page.tsx` : CA du mois, cotisations estimées, jauge de seuil annuel, alerte seuil TVA.

## Prochaines étapes
1. Initialiser un vrai projet Next.js (`create-next-app`) et y intégrer ces fichiers
2. Créer le projet Supabase et exécuter `supabase/schema.sql`
3. Ajouter l'authentification (email/mot de passe ou magic link Supabase)
4. Construire la saisie d'encaissements (formulaire + liste)
5. Générer les factures conformes (PDF)
6. Brancher Stripe pour l'abonnement

## Point de vigilance
Les taux et seuils dans `lib/taux-2026.ts` doivent être revérifiés chaque année (souvent en janvier, parfois en cours d'année en cas de réforme).
