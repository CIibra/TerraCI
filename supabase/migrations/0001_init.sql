-- ============================================================================
-- immo-ci — schéma Supabase (remplace PocketBase)
-- Les noms de colonnes reprennent volontairement le camelCase des collections
-- PocketBase (entre guillemets) pour minimiser les changements côté frontend.
-- À exécuter dans Supabase (SQL Editor) ou via `supabase db push`.
-- ============================================================================

create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ----------------------------------------------------------------------------
-- Fonction utilitaire : bascule "updated" à chaque UPDATE (équivalent du
-- champ "updated" auto-géré par PocketBase sur chaque collection).
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_column()
returns trigger language plpgsql as $$
begin
  new.updated = now();
  return new;
end;
$$;

-- ============================================================================
-- 1. profiles (remplace la collection "users" de PocketBase)
--    auth.users gère email + mot de passe ; profiles porte les champs custom.
-- ============================================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nom text not null,
  telephone text not null,
  role text not null default 'user' check (role in ('user','admin','superadmin')),
  plan text not null default 'starter' check (plan in ('starter','pro','premium')),
  "planActive" boolean not null default true,
  "planExpiresAt" timestamptz,
  suspended boolean not null default false,
  avatar text,
  "pushToken" text,
  "pushPlatform" text,
  "boostCredits" integer not null default 0,
  "boostCreditDays" integer,
  created timestamptz not null default now(),
  updated timestamptz not null default now()
);

create trigger profiles_set_updated before update on public.profiles
  for each row execute function public.set_updated_column();

-- Rôle de l'utilisateur courant, en security definer pour être utilisable
-- dans les policies des AUTRES tables sans provoquer de récursion RLS.
create or replace function public.current_role()
returns text language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Crée automatiquement la ligne profiles à l'inscription (équivalent du
-- fait que PocketBase stocke nos champs custom directement sur le record
-- d'auth). nom/telephone sont passés via `options.data` de supabase.auth.signUp().
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nom, telephone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nom', ''),
    coalesce(new.raw_user_meta_data->>'telephone', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Recherche l'email associé à un numéro de téléphone, pour permettre la
-- connexion par téléphone (Supabase Auth exige un email). security definer
-- car les clients n'ont normalement pas accès à auth.users.
create or replace function public.get_email_for_phone(p_phone text)
returns text language sql stable security definer set search_path = public as $$
  select u.email::text
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.telephone = p_phone
  limit 1;
$$;

-- Supprime un compte (auth.users + profiles, via ON DELETE CASCADE), réservé
-- aux admins/superadmins. Nécessaire car contrairement à PocketBase, où la
-- collection "users" EST le compte d'auth, supprimer une ligne "profiles" ne
-- supprime pas l'accès de connexion Supabase Auth correspondant.
create or replace function public.admin_delete_user(p_user_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if public.current_role() not in ('admin','superadmin') then
    raise exception 'Non autorisé';
  end if;
  delete from auth.users where id = p_user_id;
end;
$$;

alter table public.profiles enable row level security;

create policy "profiles select public" on public.profiles
  for select using (true);
create policy "profiles insert self" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles update self or admin" on public.profiles
  for update using (id = auth.uid() or public.current_role() in ('admin','superadmin'));
create policy "profiles delete admin" on public.profiles
  for delete using (public.current_role() in ('admin','superadmin'));

-- ============================================================================
-- 2. listings
-- ============================================================================
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references public.profiles(id) on delete cascade,
  categorie text not null check (categorie in ('terrain','maison','appartement','commerce','immeuble','hangar')),
  transaction text not null check (transaction in ('vente','location')),
  titre text not null,
  description text not null,
  prix numeric not null,
  ville text not null,
  commune text,
  complement text,
  "contactNom" text not null,
  "contactTelephone" text not null,
  specific jsonb not null default '{}'::jsonb,
  photos text[] not null default '{}',
  status text not null default 'disponible' check (status in ('disponible','vendu','loue','suspendu')),
  "boostedUntil" timestamptz,
  views integer not null default 0,
  "freeBoostUsed" boolean not null default false,
  created timestamptz not null default now(),
  updated timestamptz not null default now()
);

create index listings_owner_idx on public.listings(owner);
create index listings_status_idx on public.listings(status);

create trigger listings_set_updated before update on public.listings
  for each row execute function public.set_updated_column();

alter table public.listings enable row level security;

create policy "listings select public" on public.listings
  for select using (true);
create policy "listings insert own" on public.listings
  for insert with check (auth.uid() is not null and owner = auth.uid());
create policy "listings update own or admin" on public.listings
  for update using (owner = auth.uid() or public.current_role() in ('admin','superadmin'));
create policy "listings delete own or admin" on public.listings
  for delete using (owner = auth.uid() or public.current_role() in ('admin','superadmin'));

-- ============================================================================
-- 3. favorites
-- ============================================================================
create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  "user" uuid not null references public.profiles(id) on delete cascade,
  listing uuid not null references public.listings(id) on delete cascade,
  created timestamptz not null default now(),
  unique ("user", listing)
);

alter table public.favorites enable row level security;

create policy "favorites all own" on public.favorites
  for all using ("user" = auth.uid()) with check ("user" = auth.uid());

-- ============================================================================
-- 4. subscriptionRequests
-- ============================================================================
create table public."subscriptionRequests" (
  id uuid primary key default gen_random_uuid(),
  "user" uuid not null references public.profiles(id) on delete cascade,
  "planId" text not null,
  "transactionRef" text,
  status text not null default 'en_attente' check (status in ('en_attente','validee','refusee')),
  "validatedAt" timestamptz,
  created timestamptz not null default now(),
  updated timestamptz not null default now()
);

create trigger subscriptionRequests_set_updated before update on public."subscriptionRequests"
  for each row execute function public.set_updated_column();

alter table public."subscriptionRequests" enable row level security;

create policy "subReq insert own" on public."subscriptionRequests"
  for insert with check (auth.uid() is not null and "user" = auth.uid());
create policy "subReq select own or admin" on public."subscriptionRequests"
  for select using ("user" = auth.uid() or public.current_role() in ('admin','superadmin'));
create policy "subReq update admin" on public."subscriptionRequests"
  for update using (public.current_role() in ('admin','superadmin'));

-- ============================================================================
-- 5. boostRequests
-- ============================================================================
create table public."boostRequests" (
  id uuid primary key default gen_random_uuid(),
  "user" uuid not null references public.profiles(id) on delete cascade,
  listing uuid not null references public.listings(id) on delete cascade,
  "planId" text not null,
  "transactionRef" text,
  status text not null default 'en_attente' check (status in ('en_attente','validee','refusee')),
  "validatedAt" timestamptz,
  created timestamptz not null default now(),
  updated timestamptz not null default now()
);

create trigger boostRequests_set_updated before update on public."boostRequests"
  for each row execute function public.set_updated_column();

alter table public."boostRequests" enable row level security;

create policy "boostReq insert own" on public."boostRequests"
  for insert with check (auth.uid() is not null and "user" = auth.uid());
create policy "boostReq select own or admin" on public."boostRequests"
  for select using ("user" = auth.uid() or public.current_role() in ('admin','superadmin'));
create policy "boostReq update admin" on public."boostRequests"
  for update using (public.current_role() in ('admin','superadmin'));

-- ============================================================================
-- 6. conversations
-- ============================================================================
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing uuid references public.listings(id) on delete cascade,
  participants uuid[] not null,
  "lastMessage" text,
  "lastMessageAt" timestamptz,
  "unreadFor" uuid[] not null default '{}',
  created timestamptz not null default now(),
  updated timestamptz not null default now()
);

create index conversations_participants_idx on public.conversations using gin (participants);

create trigger conversations_set_updated before update on public.conversations
  for each row execute function public.set_updated_column();

alter table public.conversations enable row level security;

create policy "conversations all participant" on public.conversations
  for all
  using (auth.uid() is not null and participants @> array[auth.uid()])
  with check (auth.uid() is not null and participants @> array[auth.uid()]);

-- ============================================================================
-- 7. messages
-- ============================================================================
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation uuid not null references public.conversations(id) on delete cascade,
  "fromUser" uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  created timestamptz not null default now()
);

create index messages_conversation_idx on public.messages(conversation);

alter table public.messages enable row level security;

create policy "messages select participant" on public.messages
  for select using (
    auth.uid() is not null and exists (
      select 1 from public.conversations c
      where c.id = conversation and c.participants @> array[auth.uid()]
    )
  );
create policy "messages insert participant" on public.messages
  for insert with check (
    auth.uid() is not null and "fromUser" = auth.uid() and exists (
      select 1 from public.conversations c
      where c.id = conversation and c.participants @> array[auth.uid()]
    )
  );

-- ============================================================================
-- 8. reviews
-- ============================================================================
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  "targetUser" uuid not null references public.profiles(id) on delete cascade,
  "fromUser" uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created timestamptz not null default now()
);

alter table public.reviews enable row level security;

create policy "reviews select public" on public.reviews
  for select using (true);
create policy "reviews insert own" on public.reviews
  for insert with check (auth.uid() is not null and "fromUser" = auth.uid());
create policy "reviews update admin" on public.reviews
  for update using (public.current_role() in ('admin','superadmin'));
create policy "reviews delete admin" on public.reviews
  for delete using (public.current_role() in ('admin','superadmin'));

-- ============================================================================
-- Realtime (remplace pb.collection(...).subscribe("*", ...))
-- ============================================================================
alter publication supabase_realtime add table
  public.profiles,
  public.listings,
  public.favorites,
  public."subscriptionRequests",
  public."boostRequests",
  public.conversations,
  public.messages;

-- ============================================================================
-- Storage : buckets pour les photos d'annonces et les avatars
-- ============================================================================
insert into storage.buckets (id, name, public, file_size_limit)
values ('listings-photos', 'listings-photos', true, 8388608)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit)
values ('avatars', 'avatars', true, 8388608)
on conflict (id) do nothing;

-- listings-photos : chemin attendu "{listingId}/{filename}" — seul le
-- propriétaire de l'annonce peut écrire dans son propre dossier.
create policy "listings-photos public read" on storage.objects
  for select using (bucket_id = 'listings-photos');
create policy "listings-photos owner write" on storage.objects
  for insert with check (
    bucket_id = 'listings-photos' and auth.uid() is not null and exists (
      select 1 from public.listings l
      where l.id::text = (storage.foldername(name))[1] and l.owner = auth.uid()
    )
  );
create policy "listings-photos owner update" on storage.objects
  for update using (
    bucket_id = 'listings-photos' and auth.uid() is not null and exists (
      select 1 from public.listings l
      where l.id::text = (storage.foldername(name))[1] and l.owner = auth.uid()
    )
  );
create policy "listings-photos owner delete" on storage.objects
  for delete using (
    bucket_id = 'listings-photos' and auth.uid() is not null and exists (
      select 1 from public.listings l
      where l.id::text = (storage.foldername(name))[1] and l.owner = auth.uid()
    )
  );

-- avatars : chemin attendu "{userId}/{filename}".
create policy "avatars public read" on storage.objects
  for select using (bucket_id = 'avatars');
create policy "avatars owner write" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "avatars owner update" on storage.objects
  for update using (
    bucket_id = 'avatars' and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "avatars owner delete" on storage.objects
  for delete using (
    bucket_id = 'avatars' and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );
