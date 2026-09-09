import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { CATEGORIES } from "../data/categories";
import { CategoryIcon } from "../data/categoryIcons";
import { VILLES_VEDETTES } from "../data/villes";
import { getPlatformStats, searchListings } from "../lib/listings";
import VilleCard from "../components/VilleCard";
import ListingCard from "../components/ListingCard";

const HERO_PHOTO = "https://commons.wikimedia.org/wiki/Special:FilePath/Plateau_2010,_Abidjan.jpg?width=1600";

export default function Home() {
  const [stats, setStats] = useState(null);
  const [aLaUne, setALaUne] = useState([]);
  const [heroError, setHeroError] = useState(false);

  useEffect(() => {
    getPlatformStats().then(setStats).catch(() => {});
    searchListings({ sort: "recent", take: 6 })
      .then((all) => setALaUne(all.slice(0, 6)))
      .catch(() => {});
  }, []);

  return (
    <div>
      <section
        className="relative bg-ebene-950 text-latex-50 bg-cover bg-center"
        style={!heroError ? { backgroundImage: `linear-gradient(to bottom, rgba(21,19,15,0.88), rgba(21,19,15,0.75)), url(${HERO_PHOTO})` } : undefined}
      >
        {/* Image cachée uniquement pour détecter un lien mort et retomber sur le fond uni + motif. */}
        {!heroError && <img src={HERO_PHOTO} alt="" className="hidden" onError={() => setHeroError(true)} />}
        <div className={heroError ? "bg-contour" : ""} style={heroError ? { backgroundSize: "18px 18px" } : undefined}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 grid md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-2">
              <p className="stamp text-or-400 text-[11px] sm:text-xs mb-4">
                TERRAINS · MAISONS · APPARTEMENTS · BUREAUX · IMMEUBLES
              </p>
              <h1 className="font-display text-3xl sm:text-5xl md:text-6xl leading-[1.1] max-w-2xl mb-6">
                Le foncier ivoirien, publié avec précision.
              </h1>
              <p className="text-latex-100/70 max-w-lg mb-8 text-sm sm:text-base">
                Chaque annonce est complète — surface, titre foncier, standing, tout ce qu'il faut pour décider sans se déplacer.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link to="/annonces" className="bg-laterite-500 hover:bg-laterite-400 px-5 sm:px-6 py-3 rounded transition-colors text-sm sm:text-base">
                  Parcourir les annonces
                </Link>
                <Link to="/publier" className="border border-latex-50/30 hover:border-latex-50 px-5 sm:px-6 py-3 rounded transition-colors text-sm sm:text-base">
                  Publier une annonce
                </Link>
              </div>
            </div>

            {stats && stats.totalListings > 0 && (() => {
              const displayed = Math.max(0, stats.totalListings - 1);
              return (
                <div className="text-center md:text-right">
                  <p className="font-display text-6xl sm:text-7xl text-or-400 leading-none">+{displayed}</p>
                  <p className="text-latex-100/60 text-sm sm:text-base mt-2">bien{displayed > 1 ? "s" : ""} disponible{displayed > 1 ? "s" : ""}</p>
                </div>
              );
            })()}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h2 className="font-display text-xl sm:text-2xl mb-6">Explorez par ville</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          {VILLES_VEDETTES.map((v) => (
            <VilleCard key={v.nom} nom={v.nom} accroche={v.accroche} photo={v.photo} />
          ))}
        </div>
        {VILLES_VEDETTES.some((v) => v.credit) && (
          <p className="text-[11px] text-ebene-700/40 mt-3">
            Photos :{" "}
            {VILLES_VEDETTES.filter((v) => v.credit).map((v, i, arr) => (
              <span key={v.nom}>
                {i > 0 && " · "}
                <a href={v.credit.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-ebene-700/70">
                  {v.nom} ({v.credit.licence})
                </a>
              </span>
            ))}
          </p>
        )}
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 border-t border-ebene-950/5">
        <h2 className="font-display text-xl sm:text-2xl mb-6">Catégories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.id}
              to={`/annonces?categorie=${c.id}`}
              className="fiche rounded-lg p-4 sm:p-6 flex flex-col items-center text-center gap-2 sm:gap-3 hover:border-laterite-500 hover:-translate-y-0.5 transition-all"
            >
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-laterite-500/10 text-laterite-600 flex items-center justify-center">
                <CategoryIcon id={c.id} className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <span className="font-display text-sm sm:text-lg leading-tight">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {aLaUne.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 border-t border-ebene-950/5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl sm:text-2xl">À la une</h2>
            <Link to="/annonces" className="text-sm text-laterite-600 hover:text-laterite-500">Voir tout →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {aLaUne.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}

      <section className="bg-latex-100/60 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="font-display text-xl sm:text-2xl mb-8 text-center">Comment ça marche</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { n: "1", title: "Publiez ou parcourez", text: "Créez un compte gratuit et publiez votre bien en quelques minutes, ou parcourez les annonces disponibles." },
              { n: "2", title: "Échangez en toute confiance", text: "Contactez directement le vendeur par message ou téléphone, et consultez son profil et ses avis." },
              { n: "3", title: "Concluez", text: "Visitez, négociez et finalisez la transaction directement avec l'autre partie — sans intermédiaire ni commission cachée." },
            ].map((step) => (
              <div key={step.n} className="text-center">
                <div className="w-10 h-10 rounded-full bg-laterite-500 text-latex-50 font-display text-lg flex items-center justify-center mx-auto mb-3">
                  {step.n}
                </div>
                <h3 className="font-display text-lg mb-1">{step.title}</h3>
                <p className="text-sm text-ebene-700/70">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
