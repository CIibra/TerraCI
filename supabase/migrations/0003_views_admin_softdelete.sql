-- ============================================================================
-- immo-ci — vues, liste admin avec email, retrait admin d'une annonce,
-- désactivation de compte (sans suppression brutale)
-- À exécuter APRÈS 0001_init.sql et 0002_publish_quota.sql.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Compteur de vues : sécurisé et atomique, callable par n'importe qui (y
-- compris anonyme) sans avoir besoin d'une policy RLS "UPDATE" ouverte à tous
-- sur "listings" (qui serait dangereuse — n'importe qui pourrait alors
-- modifier n'importe quel champ). La fonction, elle, ne touche QUE "views".
-- ----------------------------------------------------------------------------
create or replace function public.increment_listing_views(p_listing_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.listings set views = views + 1 where id = p_listing_id;
$$;
grant execute on function public.increment_listing_views(uuid) to anon, authenticated;

-- ----------------------------------------------------------------------------
-- Annonce retirée par l'admin : on ne la supprime plus vraiment (le
-- propriétaire doit pouvoir la revoir et savoir pourquoi). Elle disparaît des
-- résultats publics via ce champ, sans jamais être effacée de la base.
-- ----------------------------------------------------------------------------
alter table public.listings add column "removedByAdmin" boolean not null default false;

-- ----------------------------------------------------------------------------
-- Désactivation de compte par l'admin : remplace la suppression brutale du
-- compte d'authentification. Permet d'afficher un message clair ("compte
-- désactivé, contactez l'agence") au lieu du message générique "identifiants
-- incorrects" que Supabase Auth renvoie pour un compte qui n'existe plus.
-- ----------------------------------------------------------------------------
alter table public.profiles add column deleted boolean not null default false;

-- ----------------------------------------------------------------------------
-- Liste des comptes pour le tableau de bord admin, avec l'email — qui vit
-- dans auth.users (inaccessible aux clients) et pas dans "profiles". Ne
-- renvoie des lignes que si l'appelant est admin/superadmin.
-- ----------------------------------------------------------------------------
create or replace function public.admin_list_users()
returns table (
  id uuid, nom text, telephone text, role text, plan text,
  "planActive" boolean, "planExpiresAt" timestamptz, suspended boolean, deleted boolean,
  avatar text, "boostCredits" integer, "boostCreditDays" integer,
  created timestamptz, updated timestamptz, email text
)
language sql stable security definer set search_path = public as $$
  select p.id, p.nom, p.telephone, p.role, p.plan, p."planActive", p."planExpiresAt",
         p.suspended, p.deleted, p.avatar, p."boostCredits", p."boostCreditDays", p.created, p.updated,
         u.email::text
  from public.profiles p
  join auth.users u on u.id = p.id
  where public.current_role() in ('admin','superadmin');
$$;
grant execute on function public.admin_list_users() to authenticated;
