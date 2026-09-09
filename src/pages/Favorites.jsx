import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import ListingCard from "../components/ListingCard";
import { getListing, listenFavorites, toggleFavorite } from "../lib/listings";

export default function Favorites() {
  const { user } = useAuth();
  const [ids, setIds] = useState([]);
  const [listings, setListings] = useState([]);

  useEffect(() => {
    if (!user) return;
    return listenFavorites(user.id, setIds);
  }, [user]);

  useEffect(() => {
    Promise.all(ids.map((id) => getListing(id))).then((r) => setListings(r.filter(Boolean)));
  }, [ids]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl mb-8">Mes favoris</h1>
      {listings.length === 0 ? (
        <p className="text-ebene-700/60">Aucune annonce sauvegardée pour l'instant.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} isFavorite={true}
              onToggleFavorite={(id, fav) => toggleFavorite(user.id, id, fav)} />
          ))}
        </div>
      )}
    </div>
  );
}
