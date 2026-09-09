import { Link } from "react-router-dom";
import { useState } from "react";

// Carte "vitrine" pour une ville — photo + nom, purement décorative/navigation :
// aucun lien avec une annonce précise. Le clic renvoie vers la recherche
// filtrée sur cette ville. Si la photo ne charge pas (lien cassé), on retombe
// sur un dégradé + initiale plutôt que de casser la mise en page.
export default function VilleCard({ nom, accroche, photo }) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      to={`/annonces?ville=${encodeURIComponent(nom)}`}
      className="group relative rounded-lg overflow-hidden aspect-[4/5] sm:aspect-[3/4] block"
    >
      {photo && !imgError ? (
        <img
          src={photo}
          alt={nom}
          loading="lazy"
          onError={() => setImgError(true)}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-ebene-800 to-laterite-700 flex items-center justify-center">
          <span className="font-display text-5xl text-latex-50/30">{nom[0]}</span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-ebene-950/90 via-ebene-950/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
        <p className="font-display text-latex-50 text-lg sm:text-xl leading-tight">{nom}</p>
        {accroche && <p className="text-latex-100/70 text-xs mt-0.5 hidden sm:block">{accroche}</p>}
      </div>
    </Link>
  );
}
