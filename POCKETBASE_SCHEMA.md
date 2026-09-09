# Schéma des collections PocketBase

## ⚠️ Si les actions admin échouent ("resource not found", "rien ne se passe")

C'est presque toujours une **règle d'accès (API Rule) trop restrictive** sur une
collection. PocketBase a un comportement piégeux : si tu n'as pas le droit de
**voir** (View rule) un enregistrement, essayer de le modifier ou le supprimer
renvoie "introuvable" au lieu de "interdit" — ça donne l'impression que rien ne
fonctionne, alors que c'est juste une permission.

**Solution rapide pour débloquer (recommandée tant que tu es en développement local) :**
Pour chaque collection `users`, `listings`, `subscriptionRequests`, `boostRequests`,
`conversations`, `messages` :
1. Ouvre la collection dans l'admin PocketBase → onglet **"API Rules"**.
2. Pour **List/Search**, **View**, **Create**, **Update**, **Delete** : clique sur
   chaque règle. Si le cadenas est **fermé** (verrouillé = réservé aux superusers
   PocketBase), clique dessus pour l'**ouvrir**. Laisse le champ de texte **vide**
   pour l'instant (= tout le monde peut faire l'action, pas de restriction).
3. Sauvegarde. Recharge l'app.

Ça retire toute restriction temporairement — largement suffisant pour développer
et tester en local. Une fois que tout fonctionne, tu pourras remettre des règles
plus strictes (voir le détail par collection plus bas) une par une, en testant
après chaque changement.

---

À créer dans l'interface admin de PocketBase (`http://127.0.0.1:8090/_/`) après
avoir lancé le serveur. Crée-les dans cet ordre (certaines dépendent des autres
via des champs "Relation").

## 1. `users` (collection d'authentification — déjà créée par défaut)

Va dans la collection `users` existante et ajoute ces champs personnalisés :

| Champ          | Type     | Notes                                      |
|----------------|----------|---------------------------------------------|
| nom            | Text     | requis                                      |
| telephone      | Text     | requis                                      |
| role           | Select   | valeurs: `user`, `admin`, `superadmin` — défaut `user` |
| plan           | Select   | valeurs: `starter`, `pro10`, `illimite`     |
| planActive     | Bool     |                                              |
| planExpiresAt  | Date     |                                              |
| suspended      | Bool     |                                              |

**Règles d'accès (onglet "API Rules") — ATTENTION, c'est la cause la plus fréquente de
"rien ne se passe" dans le panneau admin : une règle laissée sur le cadenas fermé
(verrouillée = réservée aux superusers PocketBase) bloque silencieusement l'app.
Clique sur chaque règle et tape le texte ci-dessous (même vide, il faut que le
cadenas soit OUVERT) :**
- List/Search rule : `@request.auth.id != ""` (connecté = peut lister, nécessaire pour l'admin)
- View rule : (vide = public) ou `@request.auth.id != ""`
- Create rule : (vide = tout le monde peut s'inscrire)
- Update rule : `id = @request.auth.id || @request.auth.role = "admin" || @request.auth.role = "superadmin"`
- Delete rule : `@request.auth.role = "admin" || @request.auth.role = "superadmin"`

**Rôles** : `user` (par défaut) < `admin` (staff, promu par un superadmin) <
`superadmin` (contrôle total, y compris suppression de comptes et attribution
manuelle d'abonnements). Passe ton tout premier compte en `superadmin`
directement dans PocketBase — c'est lui qui pourra ensuite promouvoir d'autres
comptes en `admin` depuis le panneau `/admin` de l'app.

## 2. `listings`

| Champ             | Type              | Notes                                             |
|--------------------|-------------------|----------------------------------------------------|
| owner               | Relation → users  | requis, une seule valeur                          |
| categorie            | Select            | terrain, maison, appartement, commerce, immeuble, hangar |
| transaction           | Select            | vente, location                                    |
| titre                  | Text              | requis                                              |
| description             | Editor / Text     | requis                                              |
| prix                     | Number            | requis                                              |
| ville                     | Text              | requis                                              |
| commune                    | Text              |                                                      |
| complement                   | Text              | optionnel — précision d'adresse libre               |
| contactNom                  | Text              | requis                                              |
| contactTelephone              | Text              | requis                                              |
| specific                        | JSON              | champs spécifiques à la catégorie                   |
| photos                            | File (multiple)   | max 8 Mo/fichier, images uniquement                 |
| status                              | Select            | disponible, vendu, loue, suspendu                   |
| boostedUntil                          | Date              |                                                      |
| views                                    | Number            | défaut 0                                            |

**Règles d'accès :**
- List/Search : (vide = public)
- View : (vide = public)
- Create : `@request.auth.id != "" && @request.data.owner = @request.auth.id`
- Update/Delete : `owner = @request.auth.id || @request.auth.role = "admin" || @request.auth.role = "superadmin"`

## 3. `favorites`

| Champ    | Type             |
|----------|------------------|
| user     | Relation → users |
| listing  | Relation → listings |

**Règles d'accès :** toutes les règles (list/view/create/delete) : `user = @request.auth.id`

## 4. `subscriptionRequests`

| Champ            | Type              |
|-------------------|-------------------|
| user                | Relation → users  |
| planId               | Text (ou Select: pro10, illimite) |
| transactionRef        | Text              |
| status                  | Select: en_attente, validee, refusee |
| validatedAt               | Date              |

**Règles d'accès :**
- Create : `@request.auth.id != "" && @request.data.user = @request.auth.id`
- List/View : `user = @request.auth.id || @request.auth.role = "admin" || @request.auth.role = "superadmin"`
- Update : `@request.auth.role = "admin" || @request.auth.role = "superadmin"`

## 5. `boostRequests`

| Champ            | Type                 |
|-------------------|----------------------|
| user                | Relation → users     |
| listing              | Relation → listings   |
| planId                | Text (ou Select: boost3, boost10, boost30) |
| transactionRef          | Text                 |
| status                    | Select: en_attente, validee, refusee |
| validatedAt                 | Date                 |

**Règles d'accès :** identiques à `subscriptionRequests`.

## 6. `conversations`

| Champ          | Type                        |
|-----------------|-----------------------------|
| listing           | Relation → listings          | **NON requis** — vide pour un message "Écrire à l'agence" (support) |
| participants        | Relation → users (multiple) |
| lastMessage            | Text                         |
| lastMessageAt            | Date                         |
| unreadFor                  | Relation → users (multiple) | utilisateur(s) qui n'ont pas encore lu le dernier message |

**Règles d'accès :**
- List/View/Create/Update : `@request.auth.id != "" && participants ~ @request.auth.id`

## 7. `messages`

| Champ         | Type                |
|----------------|---------------------|
| conversation     | Relation → conversations |
| fromUser           | Relation → users     |
| text                 | Text                 |

**Règles d'accès :**
- List/View/Create : `@request.auth.id != "" && conversation.participants ~ @request.auth.id`

---

Une fois les 7 collections créées avec ces règles, l'application fonctionne
telle quelle — aucune autre config côté code n'est nécessaire, à part l'URL du
serveur dans `src/lib/pocketbase.js`.

---

## Réglages supplémentaires (mot de passe oublié + photos)

- **Champ `photos` sur `listings`** : repasse son "Max select" à **5** (au lieu de 12) pour matcher la limite de 5 photos maintenant appliquée côté formulaire.
- **Réinitialisation de mot de passe** : par défaut, l'email envoyé par PocketBase pointe vers son propre panneau admin. Pour que le lien ouvre plutôt l'app :
  1. Menu de gauche → **Settings** (réglages globaux, pas une collection) → **Mail templates** → modèle "Reset password"
  2. Dans le HTML du template, remplace le lien `{APP_URL}/_/#/auth/confirm-password-reset/{TOKEN}` par `http://localhost:5173/reinitialiser-mot-de-passe/{TOKEN}` en dev (ton domaine en prod)
  3. Sauvegarde. Le lien reçu par email ouvrira alors la bonne page de l'app.

---

## 8. `reviews` (nouvelle collection — avis sur les utilisateurs)

| Champ        | Type              | Notes                          |
|---------------|-------------------|----------------------------------|
| targetUser      | Relation → users  | requis — la personne notée         |
| fromUser          | Relation → users  | requis — l'auteur de l'avis          |
| rating              | Number            | requis, 1 à 5                          |
| comment                | Text              | optionnel                                |

**Règles d'accès :**
- List/View : (vide = public, pour que tout le monde voie les avis reçus)
- Create : `@request.auth.id != "" && @request.body.fromUser = @request.auth.id`
- Update/Delete : `@request.auth.role = "admin" || @request.auth.role = "superadmin"` (les avis ne sont pas modifiables par leur auteur, seul l'admin peut retirer un avis abusif)

N'oublie pas d'activer "Cascade delete" sur `targetUser` et `fromUser` (comme pour les autres collections) pour que supprimer un compte nettoie aussi ses avis.
