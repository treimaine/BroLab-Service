# PaperClip AI - Guide de Configuration et Lancement

## 📍 Installation

PaperClip AI est installé dans : `C:\Users\TREIGUA\Desktop\WEBSITE\paperclip`

## ✅ Statut de Configuration

### Configuration Actuelle

Le projet **BroLab Entertainment** est déjà configuré pour utiliser PaperClip AI :

- ✅ Dossier `.paperclip/` présent avec configuration
- ✅ `config.json` configuré avec base de données PostgreSQL embarquée
- ✅ Variables d'environnement définies dans `.paperclip/.env`
- ✅ Instance ID : `brolab`
- ✅ Port serveur : `3100`
- ✅ Mode : `local_trusted` (accès localhost uniquement)

### Fichiers de Configuration

```
.paperclip/
├── config.json          # Configuration principale
├── .env                 # Variables d'environnement
├── data/                # Données et scripts
└── scripts/             # Scripts de coordination
```

## 🚀 Comment Lancer PaperClip AI

### Option 1 : Depuis le Dossier PaperClip (Recommandé)

```bash
# Ouvrir un nouveau terminal
cd C:\Users\TREIGUA\Desktop\WEBSITE\paperclip

# Lancer le serveur en mode développement
pnpm dev

# Ou lancer en mode watch (auto-reload)
pnpm dev:watch
```

### Option 2 : Via npx (Si installé globalement)

```bash
# Depuis n'importe quel dossier
npx paperclipai start
```

### Option 3 : Lancer depuis le Projet BroLab

```bash
# Depuis le dossier du projet BroLab
cd "C:\Users\TREIGUA\Desktop\WEBSITE\BroLab MVP"

# Utiliser le CLI PaperClip (si lié)
node "C:\Users\TREIGUA\Desktop\WEBSITE\paperclip\cli\dist\index.js" start
```

## 🌐 Accès à l'Interface

Une fois le serveur lancé :

- **URL** : http://127.0.0.1:3100
- **Mode** : Local trusted (pas d'authentification requise en local)
- **UI** : Interface React pour gérer les agents

## 📊 Vérifier le Statut

### Vérifier si le serveur tourne

```bash
# Vérifier le port 3100
netstat -ano | grep ":3100"

# Tester la santé du serveur
curl http://127.0.0.1:3100/health

# Voir les processus PaperClip
ps aux | grep paperclip
```

### Arrêter le serveur

```bash
# Depuis le terminal où pnpm dev tourne
Ctrl + C

# Ou via le CLI
pnpm dev:stop
```

## 🔧 Configuration du Projet BroLab

### Base de Données

- **Type** : PostgreSQL embarqué
- **Port** : `54331`
- **Dossier** : `C:\Users\TREIGUA\.paperclip-worktrees\instances\brolab\db`
- **Backups** : Activés (toutes les 60 minutes, rétention 30 jours)

### Stockage

- **Provider** : Local disk
- **Dossier** : `C:\Users\TREIGUA\.paperclip-worktrees\instances\brolab\data\storage`

### Logs

- **Mode** : File
- **Dossier** : `C:\Users\TREIGUA\.paperclip-worktrees\instances\brolab\logs`

### Secrets

- **Provider** : Local encrypted
- **Clé** : `C:\Users\TREIGUA\.paperclip-worktrees\instances\brolab\secrets\master.key`

## 🤖 Agents Configurés

D'après les fichiers dans `.paperclip/`, les agents suivants sont configurés :

- **CEO** - Coordination générale
- **CTO** - Déploiement et technique
- **CMO** - Marketing et croissance
- **Lead Engineer** - Développement

## 📝 Fichiers de Coordination

Les fichiers dans `.paperclip/` sont utilisés pour la coordination entre agents :

- `CEO-*.md` - Rapports et décisions CEO
- `CTO-*.md` - Statuts techniques et déploiements
- `CMO-*.md` - Plans marketing et exécution
- `BRO-*.md` - Tâches et checklists spécifiques
- `*.json` - Données structurées pour l'API
- `*.sh` - Scripts bash pour automatisation

## 🔍 Commandes Utiles

### Lister les agents

```bash
bash .paperclip/list_agents.sh
```

### Voir les tâches ouvertes

```bash
bash .paperclip/open_tasks.sh
```

### Vérifier le dashboard

```bash
bash .paperclip/dashboard.sh
```

### Obtenir l'inbox

```bash
bash .paperclip/get_inbox.sh
```

## ⚠️ Notes Importantes

1. **Ne pas commiter** : Le dossier `.paperclip/` est dans `.gitignore` (fichiers de coordination internes)
2. **Backups automatiques** : La base de données est sauvegardée toutes les heures
3. **Mode local** : Le serveur n'est accessible que depuis `127.0.0.1` (sécurité)
4. **Télémétrie** : Activée (peut être désactivée dans `config.json`)

## 🐛 Dépannage

### Le serveur ne démarre pas

```bash
# Vérifier les dépendances
cd C:\Users\TREIGUA\Desktop\WEBSITE\paperclip
pnpm install

# Vérifier la configuration
cat .paperclip/config.json

# Vérifier les logs
cat C:\Users\TREIGUA\.paperclip-worktrees\instances\brolab\logs\*.log
```

### Port 3100 déjà utilisé

```bash
# Trouver le processus
netstat -ano | grep ":3100"

# Tuer le processus (remplacer PID)
taskkill /PID <PID> /F

# Ou changer le port dans config.json
```

### Base de données corrompue

```bash
# Restaurer depuis un backup
cd C:\Users\TREIGUA\.paperclip-worktrees\instances\brolab\data\backups
# Copier le dernier backup vers le dossier db
```

## 📚 Documentation

- **Docs officielles** : https://paperclip.ing/docs
- **GitHub** : https://github.com/paperclipai/paperclip
- **Discord** : https://discord.gg/m4HZY7xNG3

## 🎯 Workflow Recommandé

1. **Lancer PaperClip AI** : `cd C:\Users\TREIGUA\Desktop\WEBSITE\paperclip && pnpm dev`
2. **Ouvrir l'UI** : http://127.0.0.1:3100
3. **Travailler sur BroLab** : Dans un autre terminal
4. **Coordonner via agents** : Utiliser l'UI PaperClip pour assigner des tâches
5. **Arrêter proprement** : `Ctrl + C` dans le terminal PaperClip

---

**Dernière mise à jour** : 18 avril 2026  
**Version PaperClip** : Open-source (self-hosted)  
**Instance** : `brolab`
