-- ============================================================================
-- immo-ci — message de bienvenue automatique à l'inscription
-- À exécuter APRÈS 0001, 0002 et 0003.
-- ============================================================================

-- Envoyé par un compte admin/superadmin existant (le plus ancien) vers chaque
-- nouveau compte, juste après sa création. Sécurisé (security definer) car
-- le nouvel utilisateur, au moment de son inscription, n'a pas le droit
-- d'écrire un message "de la part" d'un autre compte (règle normale de
-- sécurité) — cette fonction contourne volontairement cette règle, mais
-- UNIQUEMENT pour ce message automatique précis.
create or replace function public.send_welcome_message()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_admin_id uuid;
  v_conv_id uuid;
  v_text text := 'Bienvenue sur TerraCI 👋

Ravis de vous compter parmi nous. Quelques infos utiles pour bien démarrer :

• Publier une annonce : depuis votre profil, cliquez sur "Publier" dans le menu — renseignez les infos de votre bien (photos, prix, superficie...) et c''est en ligne en quelques minutes.

• Boosts : envie qu''une annonce soit vue en priorité ? Des boosts payants (24h à 30 jours, optionnels) la font remonter en tête des résultats avec un badge "En avant".

• Abonnements : entièrement optionnels — ils augmentent simplement votre quota d''annonces actives si vous en publiez beaucoup. Le compte gratuit reste utilisable sans jamais s''abonner.

• Signalements : tout signalement fondé (fausse annonce, tentative d''arnaque, propos abusifs...) entraîne le retrait de l''annonce concernée, voire un blocage du compte.

⚠️ Prudence dans vos démarches : ne payez jamais avant d''avoir visité le bien et vérifié les documents (titre foncier, attestation villageoise...). Méfiez-vous de toute demande d''argent urgente ou par un canal inhabituel. En cas de doute, contactez-nous directement via cette messagerie.

Bonnes recherches (ou bonne vente) !
L''équipe TerraCI';
begin
  select id into v_admin_id from public.profiles
  where role in ('admin','superadmin') and id != new.id
  order by created asc limit 1;

  if v_admin_id is null then
    return new; -- aucun admin disponible pour l'instant (ex: tout premier compte créé)
  end if;

  insert into public.conversations (listing, participants, "lastMessage", "lastMessageAt", "unreadFor")
  values (null, array[v_admin_id, new.id], 'Bienvenue sur TerraCI 👋', now(), array[new.id])
  returning id into v_conv_id;

  insert into public.messages (conversation, "fromUser", text)
  values (v_conv_id, v_admin_id, v_text);

  return new;
end;
$$;

create trigger on_profile_created_send_welcome
  after insert on public.profiles
  for each row execute function public.send_welcome_message();
