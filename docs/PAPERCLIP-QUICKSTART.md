# 🚀 PaperClip AI - Démarrage Rapide

## ✅ Statut

PaperClip AI est **installé et configuré** pour ce projet.

- 📍 **Installation** : `C:\Users\TREIGUA\Desktop\WEBSITE\paperclip`
- 🔧 **Configuration** : `.paperclip/config.json`
- 🆔 **Instance** : `brolab`
- 🌐 **Port** : `3100`
- 💾 **Base de données** : PostgreSQL embarquée (port 54331)

## 🎯 Lancer PaperClip AI

### Méthode Recommandée : Via npm

```bash
# Depuis le dossier du projet BroLab
npm run paperclip
```

Ce script :
- ✅ Charge automatiquement la configuration de l'instance `brolab`
- ✅ Utilise la base de données existante
- ✅ Démarre le serveur sur le port 3100
- ✅ Préserve tous les agents et données configurés

### Alternative : Directement depuis PaperClip

```bash
# Ouvrir un nouveau terminal
cd C:\Users\TREIGUA\Desktop\WEBSITE\paperclip

# Charger les variables d'environnement du projet
export $(cat "C:/Users/TREIGUA/Desktop/WEBSITE/BroLab MVP/.paperclip/.env" | grep -v '^#' | xargs)

# Lancer le serveur
pnpm dev
```

## 🌐 Accéder à l'Interface

Une fois lancé, ouvrir dans le navigateur :

**http://127.0.0.1:3100**

Vous devriez voir :
- ✅ Votre entreprise existante
- ✅ Tous vos agents configurés (CEO, CTO, CMO, etc.)
- ✅ L'historique des tâches et projets

## ⚠️ Problème : Redirigé vers l'Onboarding ?

Si vous êtes redirigé vers l'onboarding alors que vous avez déjà une instance configurée, c'est que PaperClip ne détecte pas la configuration existante.

### Solution

Utilisez le script `npm run paperclip` qui charge explicitement :
- La variable `PAPERCLIP_CONFIG` pointant vers `.paperclip/config.json`
- La variable `PAPERCLIP_INSTANCE_ID=brolab`
- Toutes les autres variables d'environnement nécessaires

### Vérification Manuelle

```bash
# Vérifier que l'instance existe
ls "C:\Users\TREIGUA\.paperclip-worktrees\instances\brolab"

# Vérifier la configuration
cat .paperclip/config.json

# Vérifier les variables d'environnement
cat .paperclip/.env
```

## 📊 Vérifier le Statut

```bash
# Vérifier si le serveur tourne
curl http://127.0.0.1:3100/health

# Voir les processus PaperClip
ps aux | grep paperclip

# Vérifier le port
netstat -ano | grep ":3100"
```

## 🛑 Arrêter le Serveur

Dans le terminal où PaperClip tourne :

```
Ctrl + C
```

## 📚 Documentation Complète

Pour plus de détails, voir : **[PAPERCLIP-SETUP.md](PAPERCLIP-SETUP.md)**

## 🤖 Agents Configurés

Votre instance `brolab` contient :
- **CEO** - Coordination générale et décisions stratégiques
- **CTO** - Architecture technique et déploiements
- **CMO** - Marketing, croissance et acquisition
- **Lead Engineer** - Développement et implémentation

## 🔍 Structure de l'Instance

```
C:\Users\TREIGUA\.paperclip-worktrees\instances\brolab\
├── db/              # Base de données PostgreSQL
├── data/            # Données et backups
├── logs/            # Logs du serveur
├── secrets/         # Clés de chiffrement
├── companies/       # Entreprises configurées
├── projects/        # Projets en cours
└── workspaces/      # Espaces de travail
```

## 🔗 Liens Utiles

- **Docs** : https://paperclip.ing/docs
- **GitHub** : https://github.com/paperclipai/paperclip
- **Discord** : https://discord.gg/m4HZY7xNG3

---

**Dernière mise à jour** : 18 avril 2026  
**Version** : Instance existante avec base de données
