import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { listenUnreadCount, listenMyListings, listenFavorites } from "../lib/listings";
import { isAtLeastAdmin } from "../lib/roles";
import { Building2, Menu, X } from "lucide-react";

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [myListingsCount, setMyListingsCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = isAtLeastAdmin(profile?.role);

  useEffect(() => {
    if (!user) { setUnread(0); return; }
    return listenUnreadCount(user.id, setUnread);
  }, [user]);

  useEffect(() => {
    if (!user) { setMyListingsCount(0); setFavoritesCount(0); return; }
    const u1 = listenMyListings(user.id, (list) => setMyListingsCount(list.filter((l) => l.status !== "supprime").length));
    const u2 = listenFavorites(user.id, (list) => setFavoritesCount(list.length));
    return () => { u1(); u2(); };
  }, [user]);

  function closeMenu() { setMenuOpen(false); }

  return (
    <header className="sticky top-0 z-30 bg-ebene-950 text-latex-50 border-b border-ebene-700">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="font-display text-2xl tracking-tight flex items-center gap-2" onClick={closeMenu}>
          <span
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(90deg, #F77F00 0%, #F77F00 33%, #FFFFFF 33%, #FFFFFF 66%, #009E60 66%, #009E60 100%)" }}
          >
            <Building2 className="w-4.5 h-4.5 text-ebene-950" strokeWidth={2} />
          </span>
          <span>Terra<span className="text-laterite-400">CI</span></span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link to="/annonces" className="hover:text-laterite-400 transition-colors">Annonces</Link>
          {user && <Link to="/publier" className="hover:text-laterite-400 transition-colors">Publier</Link>}
          {user && <Link to="/mes-annonces" className="hover:text-laterite-400 transition-colors">Mes annonces{myListingsCount > 0 ? ` (${myListingsCount})` : ""}</Link>}
          {user && <Link to="/favoris" className="hover:text-laterite-400 transition-colors">Favoris{favoritesCount > 0 ? ` (${favoritesCount})` : ""}</Link>}
          {user && (
            <Link to="/messages" className="relative hover:text-laterite-400 transition-colors">
              Messages
              {unread > 0 && (
                <span className="absolute -top-2 -right-3 bg-laterite-500 text-latex-50 text-[10px] leading-none rounded-full w-4 h-4 flex items-center justify-center">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" className="hover:text-or-400 transition-colors stamp text-xs border border-or-400/50 px-2 py-1 rounded">
              ADMIN
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {!isAdmin && (
                <Link to="/abonnement#offres" className="hidden sm:inline text-xs stamp px-3 py-1.5 border border-laterite-400 text-laterite-400 rounded hover:bg-laterite-400 hover:text-ebene-950 transition-colors">
                  Profil
                </Link>
              )}
              <button
                onClick={async () => { await logout(); navigate("/"); }}
                className="hidden md:inline text-sm text-latex-100/70 hover:text-latex-50 focus-ring"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link to="/connexion" className="text-sm hover:text-laterite-400">Connexion</Link>
              <Link to="/inscription" className="text-sm bg-laterite-500 hover:bg-laterite-400 text-latex-50 px-4 py-2 rounded transition-colors">
                Créer un compte
              </Link>
            </div>
          )}

          <button className="md:hidden p-2 -mr-2" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="md:hidden border-t border-ebene-700 bg-ebene-950 px-4 py-3 flex flex-col gap-1 text-sm">
          <Link to="/annonces" onClick={closeMenu} className="py-2.5 hover:text-laterite-400">Annonces</Link>
          {user && <Link to="/publier" onClick={closeMenu} className="py-2.5 hover:text-laterite-400">Publier</Link>}
          {user && <Link to="/mes-annonces" onClick={closeMenu} className="py-2.5 hover:text-laterite-400">Mes annonces{myListingsCount > 0 ? ` (${myListingsCount})` : ""}</Link>}
          {user && <Link to="/favoris" onClick={closeMenu} className="py-2.5 hover:text-laterite-400">Favoris{favoritesCount > 0 ? ` (${favoritesCount})` : ""}</Link>}
          {user && (
            <Link to="/messages" onClick={closeMenu} className="py-2.5 hover:text-laterite-400 flex items-center gap-2">
              Messages
              {unread > 0 && (
                <span className="bg-laterite-500 text-latex-50 text-[10px] leading-none rounded-full w-4 h-4 flex items-center justify-center">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>
          )}
          {user && !isAdmin && (
            <Link to="/abonnement" onClick={closeMenu} className="py-2.5 hover:text-laterite-400">
              Profil
            </Link>
          )}
          {user && isAdmin && <Link to="/abonnement" onClick={closeMenu} className="py-2.5 hover:text-laterite-400">Profil</Link>}
          {isAdmin && (
            <Link to="/admin" onClick={closeMenu} className="py-2.5 text-or-400">Administration</Link>
          )}
          <div className="border-t border-ebene-700/60 mt-2 pt-2">
            {user ? (
              <button onClick={async () => { await logout(); closeMenu(); navigate("/"); }} className="py-2.5 text-latex-100/70">
                Déconnexion
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <Link to="/connexion" onClick={closeMenu} className="py-2.5">Connexion</Link>
                <Link to="/inscription" onClick={closeMenu} className="bg-laterite-500 text-latex-50 px-4 py-2.5 rounded text-center">
                  Créer un compte
                </Link>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
