# Micro-SaaS — Suivi financier auto-entrepreneur (nom à définir)

## Stack
- Next.js (web)
- Supabase (base de données, auth, RLS)
- Stripe (abonnement)

## Ce qui est fait
- Projet Next.js initialisé (`package.json`, `tsconfig.json`, `next.config.js`)
- `lib/taux-2026.ts` : table des taux de cotisations et seuils 2026 par type d'activité, facilement modifiable chaque année.
- `supabase/schema.sql` : schéma des tables `profils`, `encaissements`, `factures` avec RLS.
- `lib/supabase.ts` : client Supabase (nécessite les variables d'environnement, voir `.env.local.example`).
- `app/connexion/page.tsx` : connexion par lien magique (email, via Supabase Auth).
- `app/page.tsx` : redirige vers connexion, onboarding ou dashboard selon l'état de l'utilisateur.
- `app/onboarding/page.tsx` : écran de saisie du type d'activité, ACRE, date de début.
- `app/dashboard/page.tsx` : CA du mois, cotisations estimées, jauge de seuil annuel, alerte seuil TVA.

## Comment démarrer (une fois cloné en local ou dans un environnement de dev)
1. `npm install`
2. Créer `.env.local` à partir de `.env.local.example` avec tes clés Supabase
3. Exécuter `supabase/schema.sql` dans l'éditeur SQL de ton projet Supabase
4. Dans Supabase, activer l'authentification par email (magic link) : Authentication > Providers > Email
5. `npm run dev`

## Prochaines étapes
1. Construire la saisie d'encaissements (formulaire + liste)
2. Générer les factures conformes (PDF)
3. Brancher Stripe pour l'abonnement
4. Déployer (Vercel recommandé pour Next.js)

## Point de vigilance
Les taux et seuils dans `lib/taux-2026.ts` doivent être revérifiés chaque année (souvent en janvier, parfois en cours d'année en cas de réforme).
