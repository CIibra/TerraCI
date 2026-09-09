import PocketBase, { BaseAuthStore } from "pocketbase";

// ⚠️ Remplace par l'URL de ton serveur PocketBase (local en dev, domaine en prod).
// Ex: "https://api.terraci.ci" une fois déployé sur ton VPS.
export const POCKETBASE_URL = "http://127.0.0.1:8090";

// BaseAuthStore garde la session UNIQUEMENT en mémoire (pas dans le navigateur) :
// l'utilisateur reste connecté tant qu'il navigue dans l'app, mais un
// rechargement complet de la page (F5) ou une relance de l'app déconnecte,
// comme demandé.
export const pb = new PocketBase(POCKETBASE_URL, new BaseAuthStore());

// Ne conserve pas les requêtes en attente d'annulation entre navigations rapides.
pb.autoCancellation(false);

export function fileUrl(record, filename, thumb) {
  if (!record || !filename) return null;
  return pb.files.getURL(record, filename, thumb ? { thumb } : {});
}
