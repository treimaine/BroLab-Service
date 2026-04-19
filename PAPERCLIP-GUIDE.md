# 🚀 Guide PaperClip AI - BroLab Entertainment

## ✅ Statut de l'Installation

PaperClip AI est **installé localement** avec une instance existante contenant toutes vos données.

- 📍 **Installation** : `C:\Users\TREIGUA\Desktop\WEBSITE\paperclip`
- 🆔 **Instance** : `brolab`
- 💾 **Base de données** : PostgreSQL embarquée (175 MB)
- 🌐 **Port serveur** : `3100`
- 📂 **Données** : `C:\Users\TREIGUA\.paperclip-worktrees\instances\brolab`

**⚠️ Important** : PaperClip AI est un outil de **développement local uniquement**. Il n'est **pas déployé** sur Vercel.

## 🎯 Lancer PaperClip AI

### Commande Principale

```bash
npm run paperclip
```

### ⚠️ Erreur de Migration ?

Si vous voyez l'erreur `relation "agent_runtime_state" already exists`, c'est **normal** pour une instance existante.

**Solution temporaire** : Lancer directement depuis PaperClip

```bash
cd C:\Users\TREIGUA\Desktop\WEBSITE\paperclip
export PAPERCLIP_CONFIG="C:/Users/TREIGUA/Desktop/WEBSITE/BroLab MVP/.paperclip/config.json"
export PAPERCLIP_INSTANCE_ID="brolab"
pnpm dev
```

L'erreur apparaîtra mais le serveur devrait démarrer quand même.

**Documentation complète** : [docs/PAPERCLIP-MIGRATION-ERROR.md](docs/PAPERCLIP-MIGRATION-ERROR.md)

### Vérifier l'Instance

```bash
npm run paperclip:verify
```

## 🌐 Accéder à l'Interface

Une fois lancé : **http://127.0.0.1:3100**

Vous verrez :
- ✅ 2 entreprises configurées
- ✅ 1 projet en cours
- ✅ 12 workspaces actifs
- ✅ Tous vos agents (CEO, CTO, CMO, Lead Engineer)

## 🛑 Arrêter le Serveur

Dans le terminal où PaperClip tourne : `Ctrl + C`

## 📊 Contenu de l'Instance

```
C:\Users\TREIGUA\.paperclip-worktrees\instances\brolab\
├── db/              # Base de données PostgreSQL (175 MB)
├── companies/       # 2 entreprises
├── projects/        # 1 projet
├── workspaces/      # 12 workspaces
└── data/backups/    # Backups automatiques (toutes les heures)
```

## 🚀 Déploiement Vercel

**PaperClip AI n'est PAS déployé sur Vercel.**

Les fichiers suivants sont exclus du déploiement (`.vercelignore`) :
- ✅ `.paperclip/` - Configuration locale
- ✅ `scripts/launch-paperclip.sh` - Script de lancement
- ✅ `scripts/verify-paperclip-instance.sh` - Script de vérification
- ✅ Documentation PaperClip

Le déploiement Vercel reste **100% fonctionnel** et ne sera **jamais affecté** par PaperClip.

## 🔒 Sécurité

- ✅ `.paperclip/` dans `.gitignore` (jamais commité)
- ✅ `.paperclip/` dans `.vercelignore` (jamais déployé)
- ✅ Scripts PaperClip exclus du déploiement
- ✅ Backups automatiques toutes les heures (rétention 30 jours)

## 🤖 Agents Configurés

| Agent | Rôle | Responsabilités |
|-------|------|-----------------|
| **CEO** | Direction | Stratégie, décisions, coordination |
| **CTO** | Technique | Architecture, déploiements |
| **CMO** | Marketing | Croissance, acquisition |
| **Lead Engineer** | Dev | Implémentation, code |

## 📚 Documentation

- **Setup complet** : [docs/PAPERCLIP-SETUP.md](docs/PAPERCLIP-SETUP.md)
- **Quick start** : [docs/PAPERCLIP-QUICKSTART.md](docs/PAPERCLIP-QUICKSTART.md)
- **Docs officielles** : https://paperclip.ing/docs

## 🎯 Workflow

1. **Vérifier** : `npm run paperclip:verify`
2. **Lancer** : `npm run paperclip`
3. **Accéder** : http://127.0.0.1:3100
4. **Travailler** : Coordonner vos agents
5. **Arrêter** : `Ctrl + C`

---

**Dernière mise à jour** : 18 avril 2026  
**Instance ID** : `brolab`  
**Environnement** : Local uniquement (non déployé)
