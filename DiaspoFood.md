# CAHIER DES CHARGES

## Nom du projet

Plateforme de mise en relation entre prestataires de services locaux et clients.

Nom provisoire : TalentHub Italia

---

# 1. CONTEXTE DU PROJET

De nombreuses personnes vivant en Italie proposent des services tels que :

* Cuisine africaine
* Tresses et coiffure
* Couture
* Maquillage
* Photographie
* Réparation informatique
* Soutien scolaire
* Traduction
* Services ménagers
* Transport
* Etc.

Actuellement, ces services sont principalement publiés dans des groupes WhatsApp, Facebook ou Telegram, ce qui limite leur visibilité.

L'objectif est de créer une plateforme web permettant aux prestataires de présenter leurs services à un large public sans passer par les réseaux sociaux.

La plateforme n'est pas un site e-commerce.

Aucun paiement ne sera effectué sur la plateforme.

La plateforme sert uniquement à :

* Présenter les services
* Faciliter la visibilité
* Mettre en relation les clients et les prestataires

---

# 2. OBJECTIFS

Permettre à toute personne :

* de créer un compte prestataire
* de publier ses services
* de gérer ses annonces

Permettre aux visiteurs :

* de consulter librement les services
* de rechercher des prestations
* de contacter directement le prestataire

---

# 3. ZONE GÉOGRAPHIQUE

Version 1 :

* Italie

Version future :

* Europe entière

Le système doit donc être conçu dès le départ pour être multi-pays.

---

# 4. TYPES D'UTILISATEURS

## 4.1 Visiteur

Pas besoin de créer un compte.

Peut :

* consulter les annonces
* effectuer des recherches
* filtrer les résultats
* contacter le prestataire

---

## 4.2 Prestataire

Inscription obligatoire.

Peut :

* créer un profil
* publier des services
* modifier ses annonces
* supprimer ses annonces
* gérer sa disponibilité

---

# 5. CATÉGORIES DE SERVICES

Le système doit être extensible.

Exemples :

## Cuisine

Sous-catégories :

* Camerounaise
* Ivoirienne
* Sénégalaise
* Congolaise
* Nigériane
* Ghanéenne
* Marocaine
* Etc.

---

## Beauté

Sous-catégories :

* Tresses
* Coiffure
* Maquillage
* Onglerie

---

## Couture

Sous-catégories :

* Couture africaine
* Retouches
* Création de vêtements

---

## Services divers

* Informatique
* Réparation
* Traduction
* Soutien scolaire
* Transport
* Ménage

---

# 6. PROFIL PRESTATAIRE

Chaque prestataire possède :

### Informations générales

* Nom
* Prénom
* Photo de profil
* Description
* Pays d'origine
* Ville actuelle
* Région
* Numéro WhatsApp
* Adresse email
* Réseaux sociaux (optionnel)

---

# 7. GESTION DES ANNONCES

Chaque annonce contient :

### Informations obligatoires

* Titre
* Description
* Catégorie
* Sous-catégorie
* Pays d'origine
* Ville
* Photos

---

### Disponibilité

* Disponible
* Indisponible

---

### Informations complémentaires

* Temps de préparation (pour la cuisine)
* Zone de service
* Date de publication

---

# 8. MODULE SPÉCIAL CUISINE

Une annonce de cuisine doit pouvoir contenir :

* Photo du plat
* Nom du plat
* Description
* Origine du plat
* Temps de préparation
* Disponibilité

Exemple :

Titre :
Ndolé Camerounais

Description :
Plat traditionnel à base de feuilles de ndolé, viande et arachides.

Temps de préparation :
2 heures

Disponibilité :
Disponible

---

# 9. MODULE SPÉCIAL COIFFURE / TRESSES

Une annonce coiffure doit contenir :

* Photos des réalisations
* Type de coiffure
* Description
* Temps moyen de réalisation
* Disponibilité

Exemple :

Titre :
Knotless Braids

Description :
Tresses légères adaptées à tous types de cheveux.

Durée :
4 heures

Disponibilité :
Disponible

---

# 10. PAGE D'ACCUEIL

Affichage immédiat des annonces.

Aucune connexion requise.

Sections :

* Dernières annonces
* Services populaires
* Cuisine
* Coiffure
* Couture
* Services divers

---

# 11. RECHERCHE ET FILTRES

Filtres disponibles :

* Pays
* Ville
* Catégorie
* Sous-catégorie
* Nationalité
* Disponibilité

Recherche texte :

* titre
* description

---

# 12. PAGE DÉTAIL D'UNE ANNONCE

Contient :

* Photos
* Description complète
* Informations du prestataire

Boutons :

* Contacter via WhatsApp
* Envoyer un email

Aucun paiement.

Aucune commande.

Aucun panier.

---

# 13. TABLEAU DE BORD PRESTATAIRE

Le prestataire peut :

* Voir ses annonces
* Ajouter une annonce
* Modifier une annonce
* Supprimer une annonce
* Changer sa disponibilité

---

# 14. ADMINISTRATION

L'administrateur peut :

* Gérer les utilisateurs
* Gérer les catégories
* Gérer les sous-catégories
* Modérer les annonces
* Supprimer les contenus inappropriés
* Voir les statistiques

---

# 15. TECHNOLOGIES RECOMMANDÉES

Frontend :

* Next.js

Backend :

* Spring Boot ou Node.js

Base de données :

* PostgreSQL

Stockage des images :

* Cloudinary

Déploiement :

* Vercel
* VPS Hostinger

---

# 16. ÉVOLUTIONS FUTURES

* Application mobile Android
* Application mobile iOS
* Géolocalisation
* Avis et notes
* Favoris
* Messagerie interne
* Abonnements Premium
* Publicité sponsorisée
* Traduction multilingue
* Extension dans toute l'Europe

---

# 17. OBJECTIF FINAL

Créer la plateforme de référence permettant aux personnes vivant en Italie puis en Europe de promouvoir leurs talents et leurs services locaux sans dépendre uniquement des groupes WhatsApp ou Facebook.

La plateforme agit comme un annuaire moderne de services communautaires, sans système de paiement intégré.
