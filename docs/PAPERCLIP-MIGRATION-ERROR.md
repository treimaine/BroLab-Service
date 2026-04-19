# PaperClip AI - Erreur de Migration

## 🐛 Problème Rencontré

Lors du lancement de PaperClip AI avec `npm run paperclip`, l'erreur suivante apparaît :

```
PostgresError: relation "agent_runtime_state" already exists
```

## 🔍 Cause

PaperClip essaie d'appliquer des migrations sur une base de données qui **existe déjà** et contient toutes les tables nécessaires.

C'est normal car l'instance `brolab` a déjà été configurée et utilisée auparavant.

## ✅ Solutions

### Solution 1 : Lancer Directement depuis PaperClip (Recommandé)

Au lieu d'utiliser le script, lancer PaperClip directement depuis son dossier :

```bash
# 1. Ouvrir un terminal
cd C:\Users\TREIGUA\Desktop\WEBSITE\paperclip

# 2. Charger les variables d'environnement
export PAPERCLIP_CONFIG="C:/Users/TREIGUA/Desktop/WEBSITE/BroLab MVP/.paperclip/config.json"
export PAPERCLIP_INSTANCE_ID="brolab"
export PAPERCLIP_HOME="C:/Users/TREIGUA/.paperclip-worktrees"

# 3. Lancer le serveur
pnpm dev
```

**Note** : L'erreur de migration apparaîtra mais le serveur devrait quand même démarrer après.

### Solution 2 : Utiliser le CLI PaperClip

```bash
cd C:\Users\TREIGUA\Desktop\WEBSITE\paperclip

# Lancer avec le CLI
node cli/dist/index.js start --config "C:/Users/TREIGUA/Desktop/WEBSITE/BroLab MVP/.paperclip/config.json"
```

### Solution 3 : Skip les Migrations (Si supporté)

Vérifier dans la documentation PaperClip s'il existe une variable d'environnement pour skip les migrations :

```bash
export SKIP_MIGRATIONS=true
# ou
export NO_MIGRATE=true
# ou
export PAPERCLIP_SKIP_MIGRATIONS=true
```

Puis lancer normalement.

### Solution 4 : Réinitialiser les Migrations (⚠️ Risqué)

**ATTENTION** : Cette solution peut causer une perte de données !

```bash
# 1. Arrêter PaperClip
# 2. Aller dans le dossier de l'instance
cd "C:\Users\TREIGUA\.paperclip-worktrees\instances\brolab"

# 3. Sauvegarder la base de données
cp -r db db_backup_$(date +%Y%m%d_%H%M%S)

# 4. Supprimer le fichier de tracking des migrations (si existe)
rm -f db/migrations.lock
rm -f db/.migrations

# 5. Relancer PaperClip
```

## 📞 Contacter le Support PaperClip

Si aucune solution ne fonctionne, contacter l'équipe PaperClip :

- **Discord** : https://discord.gg/m4HZY7xNG3
- **GitHub Issues** : https://github.com/paperclipai/paperclip/issues
- **Documentation** : https://paperclip.ing/docs

**Question à poser** :
> "Comment démarrer PaperClip avec une instance existante sans réappliquer les migrations ? J'obtiens l'erreur 'relation already exists' car ma base de données est déjà configurée."

## 🔄 Workaround Temporaire

En attendant une solution officielle, utiliser PaperClip directement depuis son dossier d'installation :

```bash
cd C:\Users\TREIGUA\Desktop\WEBSITE\paperclip
export PAPERCLIP_CONFIG="C:/Users/TREIGUA/Desktop/WEBSITE/BroLab MVP/.paperclip/config.json"
pnpm dev
```

Ignorer l'erreur de migration - le serveur devrait démarrer quand même et être accessible sur http://127.0.0.1:3100

## 📊 Vérifier que les Données sont Intactes

Après le démarrage (même avec l'erreur), vérifier :

```bash
# Vérifier l'instance
npm run paperclip:verify

# Accéder à l'interface
# Ouvrir http://127.0.0.1:3100
# Vérifier que vos 2 entreprises, 1 projet, et 12 workspaces sont présents
```

Si tout est là, l'erreur de migration peut être ignorée.

---

**Dernière mise à jour** : 18 avril 2026  
**Statut** : En attente de solution officielle PaperClip
