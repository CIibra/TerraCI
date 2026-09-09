// Schéma des catégories immobilières et de leurs champs spécifiques.
// Chaque catégorie définit les champs additionnels demandés dans le formulaire
// de publication, en plus des champs communs (voir CommonFields dans PublishListing).

export const TRANSACTION_TYPES = [
  { value: "vente", label: "Vente" },
  { value: "location", label: "Location" },
];

export const VILLES_CI = [
  "Abidjan", "Bouaké", "Daloa", "Yamoussoukro", "San-Pédro",
  "Korhogo", "Man", "Divo", "Gagnoa", "Abengourou",
  "Grand-Bassam", "Bingerville", "Anyama", "Soubré", "Kong", "Autre",
];

export const COMMUNES_ABIDJAN = [
  "Cocody", "Plateau", "Marcory", "Treichville", "Yopougon",
  "Abobo", "Adjamé", "Koumassi", "Port-Bouët", "Attécoubé", "Bingerville", "Songon",
];

// Quartiers/communes indicatifs pour les villes hors Abidjan. Liste non
// exhaustive — l'utilisateur peut toujours préciser via le champ "complément".
// Une ville absente de cet objet (ex: Soubré) n'affichera pas de liste : seul
// le champ complément (libre) sera proposé.
export const COMMUNES_BY_VILLE = {
  "Abidjan": COMMUNES_ABIDJAN,
  "Bouaké": ["Air France", "Belleville", "Dar-es-Salam", "Kennedy", "Koko", "N'Gattakro", "Sokoura", "Zone Industrielle"],
  "Daloa": ["Lobia", "Tazibouo", "Gbeuliville", "Commerce", "Orly", "Abattoir"],
  "Yamoussoukro": ["Habitat", "Millionnaire", "Kokrenou", "N'Zuessy", "Dioulakro"],
  "San-Pédro": ["Bardo", "Cité", "Balmer", "Séwéké", "Zimmermann", "Lac"],
  "Korhogo": ["Petit Paris", "Koko", "Haoussabougou", "Résidentiel", "Soba"],
  "Man": ["Dioulabougou", "Libreville", "Bienvenue", "Domoraud", "Grand-Gbapleu"],
  "Divo": ["Résidentiel", "Quartier Baoulé", "Belleville"],
  "Gagnoa": ["Dioulabougou", "Centre-ville", "Bassa"],
  "Abengourou": ["Zongo", "Résidentiel", "Commerce"],
  "Grand-Bassam": ["Quartier France", "Impérial", "Moossou", "N'Zima"],
  "Anyama": ["Anyama-centre", "Akromiabla", "Adjamé-Anyama"],
};

export const CATEGORIES = [
  {
    id: "terrain",
    label: "Terrain",
    icon: "terrain",
    fields: [
      { name: "superficie", label: "Superficie (m²)", type: "number", required: true },
      { name: "titreFoncier", label: "Titre foncier", type: "select",
        options: ["Titre définitif", "ACD", "Lettre d'attribution", "En cours", "Non disponible"], required: true },
      { name: "viabilise", label: "Viabilisé (eau/électricité)", type: "boolean" },
      { name: "typeTerrain", label: "Type de terrain", type: "select",
        options: ["Résidentiel", "Agricole", "Commercial", "Industriel"], required: true },
      { name: "borne", label: "Terrain borné", type: "boolean" },
    ],
  },
  {
    id: "maison",
    label: "Maison / Villa",
    icon: "house",
    fields: [
      { name: "superficie", label: "Superficie habitable (m²)", type: "number", required: true },
      { name: "superficieTerrain", label: "Superficie du terrain (m²)", type: "number" },
      { name: "chambres", label: "Nombre de chambres", type: "number", required: true },
      { name: "sallesDeBain", label: "Salles de bain", type: "number", required: true },
      { name: "meuble", label: "Meublé", type: "boolean" },
      { name: "cloture", label: "Clôturé", type: "boolean" },
      { name: "piscine", label: "Piscine", type: "boolean" },
      { name: "parking", label: "Places de parking", type: "number" },
      { name: "standing", label: "Standing", type: "select", options: ["Économique", "Moyen standing", "Haut standing"] },
    ],
  },
  {
    id: "appartement",
    label: "Appartement",
    icon: "building",
    fields: [
      { name: "superficie", label: "Superficie (m²)", type: "number", required: true },
      { name: "chambres", label: "Nombre de chambres", type: "number", required: true },
      { name: "sallesDeBain", label: "Salles de bain", type: "number", required: true },
      { name: "etage", label: "Étage", type: "text" },
      { name: "meuble", label: "Meublé", type: "boolean" },
      { name: "ascenseur", label: "Immeuble avec ascenseur", type: "boolean" },
      { name: "parking", label: "Place de parking incluse", type: "boolean" },
      { name: "standing", label: "Standing", type: "select", options: ["Économique", "Moyen standing", "Haut standing"] },
    ],
  },
  {
    id: "commerce",
    label: "Bureau / Commerce",
    icon: "store",
    fields: [
      { name: "superficie", label: "Superficie (m²)", type: "number", required: true },
      { name: "typeActivite", label: "Activité autorisée", type: "text" },
      { name: "vitrine", label: "Vitrine sur rue", type: "boolean" },
      { name: "climatise", label: "Climatisé", type: "boolean" },
      { name: "parking", label: "Parking disponible", type: "boolean" },
    ],
  },
  {
    id: "immeuble",
    label: "Immeuble",
    icon: "buildings",
    fields: [
      { name: "nbEtages", label: "Nombre d'étages", type: "number", required: true },
      { name: "nbAppartements", label: "Nombre d'appartements/logements", type: "number", required: true },
      { name: "revenuLocatifMensuel", label: "Revenu locatif mensuel estimé (FCFA)", type: "number" },
      { name: "superficieTerrain", label: "Superficie du terrain (m²)", type: "number" },
    ],
  },
  {
    id: "hangar",
    label: "Hangar / Entrepôt",
    icon: "warehouse",
    fields: [
      { name: "superficie", label: "Superficie (m²)", type: "number", required: true },
      { name: "hauteur", label: "Hauteur sous plafond (m)", type: "number" },
      { name: "accesPoidsLourd", label: "Accès poids lourds", type: "boolean" },
      { name: "quaiChargement", label: "Quai de chargement", type: "boolean" },
    ],
  },
];

export function getCategory(id) {
  return CATEGORIES.find((c) => c.id === id);
}
