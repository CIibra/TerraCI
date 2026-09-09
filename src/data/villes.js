// Villes mises en avant sur la page d'accueil, avec une vraie photo
// représentative de chacune. Pour ajouter une ville plus tard : ajouter une
// entrée ici (photo dans public/villes/ ou URL externe), rien d'autre à
// changer (voir Home.jsx). Sans "photo", la carte retombe automatiquement
// sur un joli dégradé + initiale (voir VilleCard.jsx).
export const VILLES_VEDETTES = [
  {
    nom: "Abidjan",
    accroche: "Le Plateau, quartier des affaires",
    photo: "https://commons.wikimedia.org/wiki/Special:FilePath/Plateau_2010,_Abidjan.jpg?width=900",
    credit: { texte: "Wikimedia Commons", licence: "CC BY-SA 3.0", url: "https://commons.wikimedia.org/wiki/File:Plateau_2010,_Abidjan.jpg" },
  },
  {
    nom: "Yamoussoukro",
    accroche: "Hôtel Président",
    photo: "/villes/yamoussoukro.jpg",
    credit: null,
  },
  {
    nom: "Grand-Bassam",
    accroche: "Patrimoine mondial de l'UNESCO",
    photo: "/villes/grand-bassam.jpg",
    credit: null, // photo fournie directement par l'agence
  },
  {
    nom: "Man",
    accroche: "La Dent de Man, pays des 18 Montagnes",
    photo: "/villes/man.jpg",
    credit: null,
  },
  {
    nom: "Kong",
    accroche: "Grande Mosquée soudanaise (UNESCO)",
    photo: "/villes/kong.jpg",
    credit: null,
  },
];
