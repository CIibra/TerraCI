import { Link } from "react-router-dom";
import { CATEGORIES } from "../data/categories";
import { PAYMENT_INSTRUCTIONS } from "../data/plans";
import { Building2 } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ebene-950 text-latex-100/80 mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-6">
        <div className="col-span-2 sm:col-span-1">
          <p className="font-display text-2xl text-latex-50 mb-3 flex items-center gap-2">
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(90deg, #F77F00 0%, #F77F00 33%, #FFFFFF 33%, #FFFFFF 66%, #009E60 66%, #009E60 100%)" }}
            >
              <Building2 className="w-4 h-4 text-ebene-950" strokeWidth={2} />
            </span>
            <span>Terra<span className="text-laterite-400">CI</span></span>
          </p>
          <p className="text-sm text-latex-100/60 leading-relaxed">
            La plateforme d'annonces immobilières ivoirienne — terrains, maisons,
            appartements, bureaux et plus, publiés avec toutes les informations
            qu'il faut pour décider vite.
          </p>
        </div>

        <div>
          <h3 className="stamp text-xs text-or-400 mb-4">CATÉGORIES</h3>
          <ul className="space-y-2 text-sm">
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <Link to={`/annonces?categorie=${c.id}`} className="hover:text-latex-50 transition-colors">
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="stamp text-xs text-or-400 mb-4">PLATEFORME</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/annonces" className="hover:text-latex-50 transition-colors">Toutes les annonces</Link></li>
            <li><Link to="/publier" className="hover:text-latex-50 transition-colors">Publier une annonce</Link></li>
            <li><Link to="/abonnement#offres" className="hover:text-latex-50 transition-colors">Abonnements & Boost</Link></li>
            <li><Link to="/inscription" className="hover:text-latex-50 transition-colors">Créer un compte</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="stamp text-xs text-or-400 mb-4">PAIEMENT & CONTACT</h3>
          <ul className="space-y-2 text-sm text-latex-100/60">
            <li>Orange Money : <span className="text-latex-100/90">{PAYMENT_INSTRUCTIONS.orangeMoney}</span></li>
            <li>MTN Money : <span className="text-latex-100/90">{PAYMENT_INSTRUCTIONS.mtnMoney}</span></li>
            <li>Wave : <span className="text-latex-100/90">{PAYMENT_INSTRUCTIONS.wave}</span></li>
            <li className="pt-1">
              <Link to="/messages?agence=1" className="text-laterite-400 hover:text-latex-50 transition-colors font-medium">
                ✉️ Un problème ? Écrire à l'agence
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ebene-700/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 text-xs text-latex-100/40 text-center">
          TerraCI est une plateforme de mise en relation entre particuliers et agences : nous ne sommes pas partie
          aux transactions et n'intervenons pas dans la vente ou la location des biens publiés. Faites vos
          vérifications avant tout paiement.
        </div>
      </div>

      <div className="border-t border-ebene-700/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-latex-100/40">
          <p>© {year} TerraCI. Tous droits réservés.</p>
          <p>Fait avec soin en Côte d'Ivoire 🇨🇮</p>
        </div>
      </div>
    </footer>
  );
}
