// Activités interdites sur la plateforme (contraires aux valeurs souhaitées :
// alcool, jeux d'argent, porc, activités musicales/nocturnes assimilées...).
// Vérification simple par mots-clés sur les champs de texte libre concernés
// (ex: "Activité autorisée" pour les annonces de type Commerce, description).
const FORBIDDEN_ACTIVITY_KEYWORDS = [
  // Alcool
  "bar", "bars", "alcool", "alcoolisé", "alcoolisée", "boisson alcoolisée",
  "brasserie", "cabaret", "buvette", "cave à vin", "cave a vin",
  "débit de boisson", "debit de boisson", "vente d'alcool", "vente d alcool",
  "whisky", "spiritueux", "bière", "biere", "vin ",

  // Musique / vie nocturne
  "night-club", "nightclub", "night club", "boîte de nuit", "boite de nuit",
  "discothèque", "discotheque", "salle de concert", "salle de danse",
  "karaoké", "karaoke", "boîte de jazz",

  // Porc
  "porc", "porcs", "porcherie", "charcuterie de porc", "élevage porcin",
  "elevage porcin", "vente de porc", "viande de porc", "jambon",

  // Jeux d'argent
  "casino", "loterie", "pari sportif", "paris sportifs", "jeux d'argent",
  "jeux d argent", "machine à sous", "machine a sous", "pmu",
];

export function findForbiddenActivity(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  return FORBIDDEN_ACTIVITY_KEYWORDS.find((kw) => lower.includes(kw)) || null;
}

export const FORBIDDEN_ACTIVITY_MESSAGE =
  "Cette activité n'est pas autorisée sur cette plateforme (alcool, porc, jeux d'argent et activités nocturnes/musicales assimilées).";
