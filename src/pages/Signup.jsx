import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import PasswordInput from "../components/PasswordInput";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    setLoading(true);
    try {
      await signup(nom, telephone, email, password);
      navigate("/");
    } catch (err) {
      const data = err?.response?.data;
      if (data?.email) {
        setError("Vous avez déjà un compte avec cet email, veuillez vous connecter.");
      } else {
        const firstFieldError = data && Object.values(data)[0]?.message;
        setError(firstFieldError || err?.message || "Impossible de créer le compte, réessayez.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="font-display text-3xl mb-2">Créer un compte</h1>
      <p className="text-ebene-700/70 mb-8">
        Agence ou particulier, tout le monde peut publier. 3 annonces gratuites pour commencer.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Nom / Raison sociale</label>
          <input required value={nom} onChange={(e) => setNom(e.target.value)}
            className="w-full border border-ebene-700/30 rounded px-3 py-2 focus-ring bg-latex-50" />
        </div>
        <div>
          <label className="block text-sm mb-1">Téléphone</label>
          <input required value={telephone} onChange={(e) => setTelephone(e.target.value)}
            placeholder="+225 07 00 00 00 00"
            className="w-full border border-ebene-700/30 rounded px-3 py-2 focus-ring bg-latex-50" />
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-ebene-700/30 rounded px-3 py-2 focus-ring bg-latex-50" />
        </div>
        <div>
          <label className="block text-sm mb-1">Mot de passe (8 caractères minimum)</label>
          <PasswordInput required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && (
          <p className="text-laterite-600 text-sm">
            {error} {error.includes("déjà un compte") && <Link to="/connexion" className="underline">Se connecter</Link>}
          </p>
        )}
        <button disabled={loading} type="submit"
          className="w-full bg-laterite-500 text-latex-50 py-3 rounded hover:bg-laterite-600 transition-colors disabled:opacity-50">
          {loading ? "Création..." : "Créer mon compte"}
        </button>
      </form>
    </div>
  );
}
