// Modèle économique : freemium + abonnements + boost à la carte.
//
// Compte GRATUIT : 3 publications par MOIS CALENDAIRE (10 pendant la promo de
// lancement), pas un quota d'annonces "actives en même temps" — supprimer ou
// vendre une annonce ne libère PAS de nouvelle publication ce mois-ci (sinon
// on pourrait publier→vendre→supprimer→republier en boucle pour contourner la
// limite). Le compteur se réinitialise automatiquement le 1er de chaque mois.
// Une fois le quota du mois atteint, il faut soit attendre le mois suivant,
// soit s'abonner (l'abonnement lève cette limite mensuelle, voir plus bas).
//
// Compte ABONNÉ (Pro/Premium) : plus de limite mensuelle — à la place, un
// quota CONCURRENT (annonces actives en même temps) de 3 + le quota du plan
// (ex. Pro => 3 + 20 = 23). "Actives" exclut les annonces vendues/louées : les
// marquer comme telles libère bien de la place pour en publier une nouvelle.
//
// Aucun paiement ne transite par la plateforme (Orange/MTN Money, Wave,
// directement sur le numéro de la plateforme) donc l'activation est manuelle,
// faite par un admin après vérification de la réception du paiement.

// Quota gratuit — ajustable automatiquement pour une promo de lancement.
// Change UNIQUEMENT ces deux lignes le jour où tu veux démarrer/arrêter la
// promo : aucune autre modification, aucun rebuild à refaire ensuite, ça
// bascule tout seul à la date indiquée à chaque fois que l'app se recharge.
const LAUNCH_PROMO_QUOTA = 10; // quota pendant la promo de lancement
const LAUNCH_PROMO_END = new Date("2026-09-30T00:00:00"); // fin de la promo (ajuste cette date)
const NORMAL_QUOTA = 3; // quota habituel une fois la promo terminée

export const FREE_LISTING_QUOTA = Date.now() < LAUNCH_PROMO_END.getTime() ? LAUNCH_PROMO_QUOTA : NORMAL_QUOTA;

export const SUBSCRIPTION_PLANS = [
  {
    id: "starter",
    label: "Gratuit",
    additionalQuota: 0,
    price: 0,
    description: "Pour découvrir la plateforme.",
  },
  {
    id: "pro",
    label: "Pro",
    additionalQuota: 20,
    price: 15000,
    duration: "1 mois",
    // 5 boosts de 30 jours (1 mois) inclus chaque mois, sur les annonces de son choix.
    boostCredits: 5,
    boostCreditDays: 30,
    description: "Jusqu'à 23 annonces actives (3 gratuites + 20). 5 boosts d'1 mois inclus chaque mois.",
  },
  {
    id: "premium",
    label: "Premium",
    additionalQuota: 40,
    price: 25000,
    duration: "1 mois",
    // 10 boosts de 30 jours inclus chaque mois — le choix, c'est QUELLES annonces
    // en profitent parmi les 43 possibles, pas la durée (fixe, comme pour Pro).
    boostCredits: 10,
    boostCreditDays: 30,
    description: "Jusqu'à 43 annonces actives (3 gratuites + 40). 10 boosts de 30 jours inclus chaque mois.",
  },
];

export const BOOST_PLANS = [
  { id: "boost1", label: "Boost 24 heures", days: 1, price: 1000, bonusHours: 0 },
  { id: "boost3", label: "Boost 3 jours", days: 3, price: 2500, bonusHours: 1 },
  { id: "boost7", label: "Boost 7 jours", days: 7, price: 5000, bonusHours: 3 },
  { id: "boost30", label: "Boost 30 jours", days: 30, price: 12000, bonusHours: 24 },
];

export const PAYMENT_INSTRUCTIONS = {
  orangeMoney: "+225 07 77 33 65 94",
  mtnMoney: "+225 05 06 86 17 82",
  wave: "+225 05 85 99 93 13",
  note: "Indiquez la référence du paiement ci-dessous. Activation sous peu après vérification.",
};

export function getSubscriptionPlan(id) {
  return SUBSCRIPTION_PLANS.find((p) => p.id === id) || SUBSCRIPTION_PLANS[0];
}
export function getBoostPlan(id) {
  return BOOST_PLANS.find((p) => p.id === id);
}

// Un abonnement payant actif et non expiré (indépendamment du rôle admin,
// géré à part). Utilisé à la fois pour le quota d'annonces concurrentes et
// pour savoir si le compteur mensuel gratuit s'applique ou non.
export function isPlanActive(profile) {
  return !!(
    profile?.plan &&
    profile.plan !== "starter" &&
    profile.planActive &&
    (!profile.planExpiresAt || new Date(profile.planExpiresAt).getTime() > Date.now())
  );
}

// Quota CONCURRENT (annonces actives en même temps) — ne s'applique qu'aux
// comptes avec un abonnement payant actif : 3 gratuites + quota du plan.
// Les comptes gratuits ne sont PAS limités par ce quota concurrent : ils sont
// limités par le compteur MENSUEL (voir checkPublishEligibility dans lib/listings.js),
// qui ne se contourne pas en supprimant/revendant une annonce.
export function getTotalQuota(profile) {
  if (!profile) return FREE_LISTING_QUOTA;
  if (profile.role === "admin" || profile.role === "superadmin") return Infinity;
  if (!isPlanActive(profile)) return FREE_LISTING_QUOTA;
  const plan = getSubscriptionPlan(profile.plan);
  return plan.additionalQuota === Infinity ? Infinity : FREE_LISTING_QUOTA + plan.additionalQuota;
}
