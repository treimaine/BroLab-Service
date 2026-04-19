#!/bin/bash

# Script robuste pour lancer PaperClip AI avec l'instance BroLab existante
# Préserve toutes les données, agents, et configuration

set -e

# Chemins absolus (format Unix pour bash)
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PAPERCLIP_DIR="/c/Users/TREIGUA/Desktop/WEBSITE/paperclip"
INSTANCE_DIR="/c/Users/TREIGUA/.paperclip-worktrees/instances/brolab"
CONFIG_FILE="$PROJECT_DIR/.paperclip/config.json"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║         PaperClip AI - Instance BroLab                     ║"
echo "║         Préservation des données existantes                ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Vérifications critiques
if [ ! -d "$PAPERCLIP_DIR" ]; then
    echo "❌ ERREUR: PaperClip AI introuvable"
    echo "   Chemin attendu: $PAPERCLIP_DIR"
    exit 1
fi

if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ ERREUR: Configuration introuvable"
    echo "   Fichier attendu: $CONFIG_FILE"
    exit 1
fi

if [ ! -d "$INSTANCE_DIR" ]; then
    echo "❌ ERREUR: Instance 'brolab' introuvable"
    echo "   Dossier attendu: $INSTANCE_DIR"
    echo ""
    echo "💡 Vos données sont peut-être dans un autre emplacement."
    echo "   Vérifiez le dossier .paperclip-worktrees"
    exit 1
fi

# Vérifier pnpm
if ! command -v pnpm &> /dev/null; then
    echo "❌ ERREUR: pnpm non installé"
    echo "   Installez avec: npm install -g pnpm"
    exit 1
fi

echo "✅ Vérifications réussies"
echo ""
echo "📂 Projet: $PROJECT_DIR"
echo "📂 PaperClip: $PAPERCLIP_DIR"
echo "📂 Instance: $INSTANCE_DIR"
echo "🔧 Config: $CONFIG_FILE"
echo ""

# Extraire le port de la configuration
PAPERCLIP_PORT=$(grep -oP '"port":\s*\K\d+' "$CONFIG_FILE" 2>/dev/null || echo "3100")

# Vérifier si le serveur tourne déjà
if curl -s "http://127.0.0.1:$PAPERCLIP_PORT/health" &> /dev/null 2>&1; then
    echo "✅ PaperClip AI est déjà actif!"
    echo ""
    echo "   🌐 Interface: http://127.0.0.1:$PAPERCLIP_PORT"
    echo ""
    echo "💡 Pour arrêter: Trouvez le processus avec 'ps aux | grep paperclip'"
    exit 0
fi

# Définir les variables d'environnement critiques
echo "🔧 Configuration des variables d'environnement..."

# Chemins Unix pour bash
export PAPERCLIP_HOME="/c/Users/TREIGUA/.paperclip-worktrees"
export PAPERCLIP_INSTANCE_ID="brolab"
export PAPERCLIP_CONFIG="$CONFIG_FILE"
export PAPERCLIP_CONTEXT="/c/Users/TREIGUA/.paperclip-worktrees/context.json"
export PAPERCLIP_IN_WORKTREE="true"
export PAPERCLIP_WORKTREE_NAME="main"
export PAPERCLIP_WORKSPACE_CWD="$PROJECT_DIR"
export PAPERCLIP_WORKSPACE_SOURCE="repo"

# Skip migrations car la base de données existe déjà
export SKIP_MIGRATIONS="true"

echo "   ✓ PAPERCLIP_INSTANCE_ID=brolab"
echo "   ✓ PAPERCLIP_CONFIG=$CONFIG_FILE"
echo "   ✓ PAPERCLIP_HOME=$PAPERCLIP_HOME"
echo ""

# Vérifier l'intégrité de l'instance
echo "🔍 Vérification de l'instance..."
if [ -d "$INSTANCE_DIR/db" ]; then
    echo "   ✓ Base de données trouvée"
fi
if [ -d "$INSTANCE_DIR/companies" ]; then
    echo "   ✓ Entreprises trouvées"
fi
if [ -d "$INSTANCE_DIR/projects" ]; then
    echo "   ✓ Projets trouvés"
fi
echo ""

# Aller dans le dossier PaperClip
cd "$PAPERCLIP_DIR"

# Vérifier les dépendances
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances PaperClip..."
    pnpm install
    echo ""
fi

echo "🚀 Démarrage du serveur PaperClip AI..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "   🌐 Interface Web: http://127.0.0.1:$PAPERCLIP_PORT"
echo "   📊 Instance: brolab (données préservées)"
echo "   ⏹️  Arrêter: Ctrl+C"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 Vos agents, entreprises et projets sont intacts!"
echo ""

# Note: Si vous voyez des erreurs "relation already exists", c'est normal
# pour une instance existante. Le serveur démarrera quand même.

exec pnpm dev
