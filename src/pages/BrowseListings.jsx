import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ListingCard from "../components/ListingCard";
import { CATEGORIES, TRANSACTION_TYPES, VILLES_CI } from "../data/categories";
import { CategoryIcon } from "../data/categoryIcons";
import { searchListings, toggleFavorite, listenFavorites } from "../lib/listings";
import { useAuth } from "../contexts/AuthContext";

const SORT_OPTIONS = [
  { value: "recent", label: "Plus récentes" },
  { value: "prixAsc", label: "Prix croissant" },
  { value: "prixDesc", label: "Prix décroissant" },
  { value: "superficieDesc", label: "Plus grande superficie" },
];

export default function BrowseListings() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    categorie: searchParams.get("categorie") || "",
    transaction: "", ville: searchParams.get("ville") || "",
    prixMin: "", prixMax: "",
    superficieMin: "", superficieMax: "",
    dateMin: "", dateMax: "",
    sort: "recent",
  });
  const [listings, setListings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  // Se resynchronise à chaque changement d'URL (clic sur un lien de catégorie
  // ou de ville depuis l'accueil/le Footer), même si on est déjà sur la page
  // Annonces — sinon un second clic sur un lien différent ne changeait rien à l'écran.
  useEffect(() => {
    const cat = searchParams.get("categorie") || "";
    const ville = searchParams.get("ville") || "";
    setFilters((f) => (f.categorie === cat && f.ville === ville ? f : { ...f, categorie: cat, ville }));
  }, [searchParams]);

  useEffect(() => {
    if (!user) return;
    return listenFavorites(user.id, setFavorites);
  }, [user]);

  useEffect(() => {
    setLoading(true);
    searchListings(filters).then((r) => { setListings(r); setLoading(false); });
  }, [filters]);

  async function handleToggleFavorite(listingId, isFav) {
    if (!user) return;
    await toggleFavorite(user.id, listingId, isFav);
  }

  const hasActiveFilters = Object.entries(filters).some(([k, v]) => k !== "sort" && v);

  function resetFilters() {
    setFilters({
      categorie: "", transaction: "", ville: "",
      prixMin: "", prixMax: "", superficieMin: "", superficieMax: "",
      dateMin: "", dateMax: "", sort: "recent",
    });
    setSearchParams({});
  }

  function update(patch) {
    setFilters((f) => ({ ...f, ...patch }));
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <h1 className="font-display text-2xl sm:text-3xl mb-6">Annonces</h1>

      {/* Catégories en icônes, scrollables sur mobile */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        <button onClick={() => update({ categorie: "" })}
          className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-full text-sm border ${!filters.categorie ? "bg-ebene-950 text-latex-50 border-ebene-950" : "border-ebene-700/30"}`}>
          Toutes
        </button>
        {CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => update({ categorie: c.id })}
            className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-full text-sm border ${filters.categorie === c.id ? "bg-laterite-500 text-latex-50 border-laterite-500" : "border-ebene-700/30"}`}>
            <CategoryIcon id={c.id} className="w-4 h-4" />
            {c.label}
          </button>
        ))}
        {hasActiveFilters && (
          <button onClick={resetFilters}
            className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-full text-sm border border-laterite-500 text-laterite-600 hover:bg-laterite-500/10">
            ✕ Réinitialiser les filtres
          </button>
        )}
      </div>

      <div className="fiche rounded p-4 mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <select value={filters.transaction} onChange={(e) => update({ transaction: e.target.value })}
            className="border border-ebene-700/30 rounded px-3 py-2 bg-latex-50 text-sm focus-ring">
            <option value="">Vente ou location</option>
            {TRANSACTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select value={filters.ville} onChange={(e) => update({ ville: e.target.value })}
            className="border border-ebene-700/30 rounded px-3 py-2 bg-latex-50 text-sm focus-ring">
            <option value="">Toutes les villes</option>
            {VILLES_CI.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
          <select value={filters.sort} onChange={(e) => update({ sort: e.target.value })}
            className="border border-ebene-700/30 rounded px-3 py-2 bg-latex-50 text-sm focus-ring col-span-2 sm:col-span-1">
            {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <button onClick={() => setShowMoreFilters((v) => !v)}
            className="border border-ebene-700/30 rounded px-3 py-2 text-sm hover:border-laterite-500">
            {showMoreFilters ? "Moins de filtres" : "Prix / superficie"}
          </button>
        </div>

        {showMoreFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-ebene-700/15">
            <input type="number" placeholder="Prix min (FCFA)" value={filters.prixMin}
              onChange={(e) => update({ prixMin: e.target.value })}
              className="border border-ebene-700/30 rounded px-3 py-2 bg-latex-50 text-sm focus-ring" />
            <input type="number" placeholder="Prix max (FCFA)" value={filters.prixMax}
              onChange={(e) => update({ prixMax: e.target.value })}
              className="border border-ebene-700/30 rounded px-3 py-2 bg-latex-50 text-sm focus-ring" />
            <input type="number" placeholder="Superficie min (m²)" value={filters.superficieMin}
              onChange={(e) => update({ superficieMin: e.target.value })}
              className="border border-ebene-700/30 rounded px-3 py-2 bg-latex-50 text-sm focus-ring" />
            <input type="number" placeholder="Superficie max (m²)" value={filters.superficieMax}
              onChange={(e) => update({ superficieMax: e.target.value })}
              className="border border-ebene-700/30 rounded px-3 py-2 bg-latex-50 text-sm focus-ring" />
            <div>
              <label className="block text-[11px] text-ebene-700/50 mb-1">Publiée après le</label>
              <input type="date" value={filters.dateMin}
                onChange={(e) => update({ dateMin: e.target.value })}
                className="w-full border border-ebene-700/30 rounded px-3 py-2 bg-latex-50 text-sm focus-ring" />
            </div>
            <div>
              <label className="block text-[11px] text-ebene-700/50 mb-1">Publiée avant le</label>
              <input type="date" value={filters.dateMax}
                onChange={(e) => update({ dateMax: e.target.value })}
                className="w-full border border-ebene-700/30 rounded px-3 py-2 bg-latex-50 text-sm focus-ring" />
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-ebene-700/60">Chargement...</p>
      ) : listings.length === 0 ? (
        <p className="text-ebene-700/60">Aucune annonce ne correspond à ces critères pour l'instant.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} isFavorite={favorites.includes(l.id)} onToggleFavorite={handleToggleFavorite} />
          ))}
        </div>
      )}
    </div>
  );
}
