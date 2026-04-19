#!/bin/bash

# Script pour démarrer le serveur PaperClip sans migrations
# Utilise directement le serveur compilé

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PAPERCLIP_DIR="/c/Users/TREIGUA/Desktop/WEBSITE/paperclip"
CONFIG_FILE="$PROJECT_DIR/.paperclip/config.json"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║         PaperClip AI - Démarrage Direct                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Vérifications
if [ ! -d "$PAPERCLIP_DIR" ]; then
    echo "❌ PaperClip AI introuvable: $PAPERCLIP_DIR"
    exit 1
fi

if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Configuration introuvable: $CONFIG_FILE"
    exit 1
fi

# Variables d'environnement
export PAPERCLIP_HOME="/c/Users/TREIGUA/.paperclip-worktrees"
export PAPERCLIP_INSTANCE_ID="brolab"
export PAPERCLIP_CONFIG="$CONFIG_FILE"
export PAPERCLIP_CONTEXT="/c/Users/TREIGUA/.paperclip-worktrees/context.json"
export PAPERCLIP_IN_WORKTREE="true"
export PAPERCLIP_WORKTREE_NAME="main"
export PAPERCLIP_WORKSPACE_CWD="$PROJECT_DIR"
export PAPERCLIP_WORKSPACE_SOURCE="repo"

PAPERCLIP_PORT=$(grep -oP '"port":\s*\K\d+' "$CONFIG_FILE" 2>/dev/null || echo "3100")

echo "✅ Configuration chargée"
echo "   Instance: brolab"
echo "   Port: $PAPERCLIP_PORT"
echo ""

# Vérifier si déjà actif
if curl -s "http://127.0.0.1:$PAPERCLIP_PORT/health" &> /dev/null 2>&1; then
    echo "✅ PaperClip AI est déjà actif!"
    echo "   🌐 http://127.0.0.1:$PAPERCLIP_PORT"
    exit 0
fi

cd "$PAPERCLIP_DIR"

# Vérifier si le serveur est compilé
if [ ! -d "server/dist" ]; then
    echo "📦 Compilation du serveur..."
    pnpm --filter @paperclipai/server build
    echo ""
fi

echo "🚀 Démarrage du serveur..."
echo ""
echo "   🌐 Interface: http://127.0.0.1:$PAPERCLIP_PORT"
echo "   📊 Instance: brolab (données préservées)"
echo "   ⏹️  Arrêter: Ctrl+C"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Lancer le serveur directement (sans migrations)
cd server
exec node dist/index.js
