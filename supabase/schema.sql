-- Schéma initial — à exécuter dans l'éditeur SQL Supabase

create table profils (
  id uuid references auth.users on delete cascade primary key,
  type_activite text not null check (type_activite in ('vente', 'services_bic', 'liberal_bnc', 'liberal_cipav')),
  acre_actif boolean default false,
  date_debut_activite date not null,
  created_at timestamp with time zone default now()
);

create table encaissements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  montant numeric(10,2) not null,
  date_encaissement date not null,
  client text,
  categorie text,
  created_at timestamp with time zone default now()
);

create table factures (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  encaissement_id uuid references encaissements on delete set null,
  numero text not null,
  montant numeric(10,2) not null,
  date_facture date not null,
  pdf_url text,
  created_at timestamp with time zone default now()
);

-- Row Level Security : chaque utilisateur ne voit que ses propres données
alter table profils enable row level security;
alter table encaissements enable row level security;
alter table factures enable row level security;

create policy "Chacun voit son propre profil" on profils
  for all using (auth.uid() = id);

create policy "Chacun voit ses propres encaissements" on encaissements
  for all using (auth.uid() = user_id);

create policy "Chacun voit ses propres factures" on factures
  for all using (auth.uid() = user_id);
