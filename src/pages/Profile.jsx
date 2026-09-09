import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { listenMyListings, listenConversations } from "../lib/listings";
import { getTotalQuota, getSubscriptionPlan } from "../data/plans";

export default function Profile() {
  const { user, profile } = useAuth();
  const [listings, setListings] = useState([]);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    if (!user) return;
    const unsub1 = listenMyListings(user.id, setListings);
    const unsub2 = listenConversations(user.id, setConversations);
    return () => { unsub1(); unsub2(); };
  }, [user]);

  if (!user) return <div className="max-w-2xl mx-auto px-4 py-16">Connectez-vous pour voir votre profil.</div>;

  const active = listings.filter((l) => l.status !== "supprime");
  const vendus = listings.filter((l) => l.status === "vendu" || l.status === "loue");
  const boosted = listings.filter((l) => l.boostedUntil && new Date(l.boostedUntil).getTime() > Date.now());
  const totalVues = listings.reduce((s, l) => s + (l.views || 0), 0);
  const quota = getTotalQuota(profile);
  const plan = getSubscriptionPlan(profile?.plan);

  const stats = [
    { label: "Annonces actives", value: `${active.length}/${quota === Infinity ? "∞" : quota}` },
    { label: "Annonces publiées (total)", value: listings.length },
    { label: "Vendues / Louées", value: vendus.length },
    { label: "En avant (boostées)", value: boosted.length },
    { label: "Vues cumulées", value: totalVues },
    { label: "Conversations", value: conversations.length },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-display text-3xl mb-1">{profile?.nom || user.displayName}</h1>
      <p className="text-ebene-700/70 mb-8">{profile?.email} · {profile?.telephone}</p>

      <div className="fiche rounded p-5 mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm text-ebene-700/60">Plan actuel</p>
          <p className="font-display text-xl">{plan.label}</p>
        </div>
        <a href="/abonnement" className="text-sm border border-laterite-500 text-laterite-600 px-4 py-2 rounded hover:bg-laterite-500 hover:text-latex-50">
          Gérer mon abonnement
        </a>
      </div>

      <h2 className="font-display text-xl mb-4">Statistiques</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="fiche rounded p-4">
            <p className="font-display text-2xl text-laterite-600">{s.value}</p>
            <p className="text-xs text-ebene-700/60 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
