-- ============================================================================
-- immo-ci — quota mensuel gratuit anti-contournement
-- À exécuter APRÈS 0001_init.sql (SQL Editor Supabase, ou `supabase db push`).
-- ============================================================================

-- Journal de toutes les publications d'annonces, jamais supprimé même si
-- l'annonce elle-même est ensuite supprimée ou vendue — c'est justement ce qui
-- empêche de contourner le quota gratuit mensuel en supprimant/revendant puis
-- republiant. Volontairement SANS clé étrangère vers "listings" : la ligne ici
-- doit survivre à la suppression de l'annonce.
create table public."listingPublishes" (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references public.profiles(id) on delete cascade,
  listing uuid, -- simple référence informative, pas de contrainte FK (voir ci-dessus)
  created timestamptz not null default now()
);

create index "listingPublishes_owner_idx" on public."listingPublishes"(owner, created);

alter table public."listingPublishes" enable row level security;

create policy "listingPublishes insert own" on public."listingPublishes"
  for insert with check (auth.uid() is not null and owner = auth.uid());
create policy "listingPublishes select own or admin" on public."listingPublishes"
  for select using (owner = auth.uid() or public.current_role() in ('admin','superadmin'));
