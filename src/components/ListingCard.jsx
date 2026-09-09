import { Link } from "react-router-dom";
import { getCategory } from "../data/categories";
import { listingPhotoUrl } from "../lib/supabase";

function formatPrix(prix, transaction) {
  const n = Number(prix).toLocaleString("fr-FR");
  return transaction === "location" ? `${n} FCFA / mois` : `${n} FCFA`;
}

export default function ListingCard({ listing, isFavorite, onToggleFavorite }) {
  const cat = getCategory(listing.categorie);
  const isBoosted = listing.boostedUntil && new Date(listing.boostedUntil).getTime() > Date.now();
  const cover = listing.photos?.[0] ? listingPhotoUrl(listing.photos[0]) : null;

  return (
    <div className="fiche rounded-sm overflow-hidden flex flex-col group relative">
      {isBoosted && (
        <span className="absolute top-3 left-3 z-10 stamp text-[10px] bg-or-500 text-ebene-950 px-2 py-1 rounded-sm">
          EN AVANT
        </span>
      )}
      {onToggleFavorite && (
        <button
          onClick={() => onToggleFavorite(listing.id, isFavorite)}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-ebene-950/60 text-latex-50 flex items-center justify-center focus-ring"
          aria-label="Ajouter aux favoris"
        >
          {isFavorite ? "♥" : "♡"}
        </button>
      )}
      <Link to={`/annonces/${listing.id}`} className="block">
        <div className="aspect-[4/3] bg-ebene-800 overflow-hidden">
          {cover ? (
            <img src={cover} alt={listing.titre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-latex-100/40 stamp text-xs">
              PAS DE PHOTO
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 text-[11px] stamp text-palmeraie-600 mb-1.5">
            <span>{cat?.label?.toUpperCase() || listing.categorie}</span>
            <span>·</span>
            <span>{listing.transaction === "location" ? "LOCATION" : "VENTE"}</span>
          </div>
          <h3 className="font-display text-lg leading-snug mb-1 line-clamp-2">{listing.titre}</h3>
          <p className="text-sm text-ebene-700/70 mb-2">
            {listing.commune ? `${listing.commune}, ` : ""}{listing.ville}
            {(() => {
              const taille = listing.specific?.superficie || listing.specific?.superficieTerrain;
              return taille ? ` · ${taille} m²` : "";
            })()}
          </p>
          <p className="font-display text-laterite-600 text-xl">{formatPrix(listing.prix, listing.transaction)}</p>
        </div>
      </Link>
    </div>
  );
}
