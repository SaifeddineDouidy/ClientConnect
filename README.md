# 📱 ClientConnect

<div align="center">
  <img src="https://img.shields.io/badge/React%20Native-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Native">
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo">
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
</div>

<div align="center">
  <h3>🚀 Application mobile CRM moderne pour la gestion commerciale</h3>
  <p>Centralisez vos clients, opportunités et interactions dans une interface mobile intuitive</p>
</div>

---

## 📋 Table des matières

- [✨ Fonctionnalités](#-fonctionnalités)
- [🛠️ Technologies utilisées](#️-technologies-utilisées)
- [📋 Prérequis](#-prérequis)
- [⚡ Installation rapide](#-installation-rapide)
- [🔧 Configuration Firebase](#-configuration-firebase)
- [📁 Structure du projet](#-structure-du-projet)
- [📱 Captures d'écran](#-captures-décran)
- [🚀 Démarrage](#-démarrage)
- [🤝 Contribution](#-contribution)
- [📄 Licence](#-licence)

---

## ✨ Fonctionnalités

### 👥 Gestion des clients
- 📝 Ajout, modification et suppression de clients
- 🏢 Informations détaillées (nom, entreprise, contact, statut)
- 📝 Notes et commentaires personnalisés
- 🔍 Recherche et filtrage avancés

### 💼 Opportunités commerciales
- 📊 Suivi du pipeline de ventes
- 💰 Gestion de la valeur et probabilité de clôture
- 📈 Tableau de bord des performances
- 🔗 Liaison avec les clients concernés

### ✅ Tâches et rappels
- 📞 Planification d'appels et emails
- ⏰ Notifications automatiques
- 📅 Calendrier intégré
- 🎯 Suivi des objectifs

### 📋 Historique des interactions
- 💬 Journal complet des échanges
- 📞 Appels, emails, réunions
- 🕒 Horodatage automatique
- 🔍 Recherche dans l'historique

### ☁️ Synchronisation temps réel
- 🔐 Authentification sécurisée Firebase
- 🔄 Synchronisation multi-appareils
- 💾 Sauvegarde automatique
- 🌐 Accès hors ligne

---

## 🛠️ Technologies utilisées

| Technologie | Version | Description |
|-------------|---------|-------------|
| **React Native** | Latest | Framework mobile cross-platform |
| **Expo** | SDK 49+ | Plateforme de développement |
| **TypeScript** | 5.0+ | Typage statique |
| **Firebase** | 9.0+ | Backend as a Service |
| **Zustand** | 4.0+ | Gestion d'état |
| **Expo Router** | Latest | Navigation native |

---

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- 📦 **Node.js** >= 18.x ([Télécharger](https://nodejs.org/))
- 🛠️ **Expo CLI** ([Guide d'installation](https://docs.expo.dev/get-started/installation/))
- 🔥 **Compte Firebase** ([Console Firebase](https://console.firebase.google.com/))
- 📱 **Expo Go** sur votre appareil mobile (optionnel)

---

## ⚡ Installation rapide

### 1️⃣ Cloner le projet
```bash
git clone https://github.com/SaifeddineDouidy/ClientConnect.git
cd ClientConnect
git checkout amine
```

### 2️⃣ Installer les dépendances
```bash
npm install
# ou
yarn install
```

### 3️⃣ Lancer l'application
```bash
npx expo start
```

> 📱 **Astuce** : Scannez le QR code avec Expo Go ou utilisez un émulateur

---

## 🔧 Configuration Firebase

### 📋 Étapes de configuration

1. **Créer un projet Firebase**
   - Rendez-vous sur [Firebase Console](https://console.firebase.google.com/)
   - Cliquez sur "Créer un projet"
   - Suivez les étapes de configuration

2. **Ajouter une application Web**
   - Dans votre projet Firebase, cliquez sur "Ajouter une application"
   - Sélectionnez "Web" (icône `</>`
   - Donnez un nom à votre application

3. **Récupérer la configuration**
   ```javascript
   // Exemple de configuration Firebase
   const firebaseConfig = {
     apiKey: "votre-api-key",
     authDomain: "votre-projet.firebaseapp.com",
     projectId: "votre-projet-id",
     storageBucket: "votre-projet.appspot.com",
     messagingSenderId: "123456789",
     appId: "votre-app-id"
   };
   ```

4. **Configurer le fichier**
   - Créez/modifiez le fichier `config/firebase.ts`
   - Collez votre configuration Firebase

5. **Activer les services**
   - 🔐 **Authentication** : Email/mot de passe
   - 🗄️ **Firestore Database** : Mode test puis production
   - 📁 **Storage** : Règles par défaut

---

## 📁 Structure du projet

```
ClientConnect/
├── 📂 app/                    # Écrans et composants principaux
│   ├── 👤 auth/              # Authentification
│   ├── 👥 clients/           # Gestion des clients
│   ├── 💼 opportunities/     # Opportunités commerciales
│   ├── ✅ tasks/             # Tâches et rappels
│   └── 📋 interactions/      # Historique des interactions
├── 📂 stores/                # Stores Zustand
│   ├── clientStore.ts
│   ├── opportunityStore.ts
│   ├── taskStore.ts
│   └── authStore.ts
├── 📂 types/                 # Types TypeScript
│   ├── index.ts
├── 📂 services/                 # Services Firebase
│   ├── firestore.ts
├── 📂 config/                # Configuration
│   └── firebase.ts
├── 📂 components/            # Composants réutilisables
└── 📂 assets/               # Images et ressources
```

---

## 🚀 Démarrage

### 🔄 Commandes utiles

```bash
# Démarrer en mode développement
npm start

# Construire pour production
expo build

# Lancer les tests
npm test

# Linter le code
npm run lint
```

### 🐛 Résolution des problèmes courants

**❌ Erreur de dépendances**
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
```

**❌ Problème Firebase**
- Vérifiez votre configuration dans `config/firebase.ts`
- Assurez-vous que les services Firebase sont activés

**❌ Erreur Expo**
```bash
# Nettoyer le cache Expo
expo r -c
```

---

## 🤝 Contribution

Nous accueillons chaleureusement les contributions ! 

### 📝 Comment contribuer

1. 🍴 **Fork** le projet
2. 🌿 Créez une **branche** pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. 💾 **Commitez** vos changements (`git commit -m 'Add some AmazingFeature'`)
4. 📤 **Poussez** vers la branche (`git push origin feature/AmazingFeature`)
5. 🔃 Ouvrez une **Pull Request**

### 🐛 Signaler un bug

Utilisez les [Issues GitHub](https://github.com/SaifeddineDouidy/ClientConnect/issues) pour signaler des bugs ou demander des fonctionnalités.


---

## 📄 Licence

Ce projet est sous licence **MIT** - voir le fichier [LICENSE](LICENSE) pour plus de détails.

---


<div align="center">
  
  [![GitHub stars](https://img.shields.io/github/stars/SaifeddineDouidy/ClientConnect?style=social)](https://github.com/SaifeddineDouidy/ClientConnect)
  [![GitHub forks](https://img.shields.io/github/forks/SaifeddineDouidy/ClientConnect?style=social)](https://github.com/SaifeddineDouidy/ClientConnect)
  
</div>
