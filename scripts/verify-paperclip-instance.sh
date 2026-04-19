#!/bin/bash

# Script de vérification de l'instance PaperClip AI
# Vérifie que toutes les données sont présentes et intactes

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INSTANCE_DIR="/c/Users/TREIGUA/.paperclip-worktrees/instances/brolab"
CONFIG_FILE="$PROJECT_DIR/.paperclip/config.json"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║         Vérification Instance PaperClip AI                 ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Fonction pour vérifier un élément
check_item() {
    local item=$1
    local path=$2
    
    if [ -e "$path" ]; then
        echo "   ✅ $item"
        return 0
    else
        echo "   ❌ $item (introuvable)"
        return 1
    fi
}

# Fonction pour compter les fichiers
count_items() {
    local path=$1
    if [ -d "$path" ]; then
        local count=$(find "$path" -maxdepth 1 -type f 2>/dev/null | wc -l)
        echo "$count"
    else
        echo "0"
    fi
}

echo "📂 Configuration du Projet"
check_item "Fichier config.json" "$CONFIG_FILE"
check_item "Dossier .paperclip" "$PROJECT_DIR/.paperclip"
check_item "Variables d'environnement" "$PROJECT_DIR/.paperclip/.env"
echo ""

echo "📂 Instance BroLab"
check_item "Dossier instance" "$INSTANCE_DIR"
echo ""

if [ -d "$INSTANCE_DIR" ]; then
    echo "📊 Contenu de l'Instance"
    check_item "Base de données" "$INSTANCE_DIR/db"
    check_item "Données" "$INSTANCE_DIR/data"
    check_item "Logs" "$INSTANCE_DIR/logs"
    check_item "Secrets" "$INSTANCE_DIR/secrets"
    check_item "Entreprises" "$INSTANCE_DIR/companies"
    check_item "Projets" "$INSTANCE_DIR/projects"
    check_item "Workspaces" "$INSTANCE_DIR/workspaces"
    check_item "Skills" "$INSTANCE_DIR/skills"
    echo ""
    
    echo "📈 Statistiques"
    
    # Compter les entreprises
    if [ -d "$INSTANCE_DIR/companies" ]; then
        company_count=$(find "$INSTANCE_DIR/companies" -maxdepth 1 -type d 2>/dev/null | wc -l)
        echo "   📊 Entreprises: $((company_count - 1))"
    fi
    
    # Compter les projets
    if [ -d "$INSTANCE_DIR/projects" ]; then
        project_count=$(find "$INSTANCE_DIR/projects" -maxdepth 1 -type d 2>/dev/null | wc -l)
        echo "   📊 Projets: $((project_count - 1))"
    fi
    
    # Compter les workspaces
    if [ -d "$INSTANCE_DIR/workspaces" ]; then
        workspace_count=$(find "$INSTANCE_DIR/workspaces" -maxdepth 1 -type d 2>/dev/null | wc -l)
        echo "   📊 Workspaces: $((workspace_count - 1))"
    fi
    
    # Taille de la base de données
    if [ -d "$INSTANCE_DIR/db" ]; then
        db_size=$(du -sh "$INSTANCE_DIR/db" 2>/dev/null | cut -f1)
        echo "   💾 Taille DB: $db_size"
    fi
    
    # Dernière sauvegarde
    if [ -d "$INSTANCE_DIR/data/backups" ]; then
        last_backup=$(ls -t "$INSTANCE_DIR/data/backups" 2>/dev/null | head -1)
        if [ -n "$last_backup" ]; then
            echo "   💾 Dernier backup: $last_backup"
        fi
    fi
    
    echo ""
fi

# Vérifier la configuration
if [ -f "$CONFIG_FILE" ]; then
    echo "🔧 Configuration Serveur"
    
    port=$(grep -oP '"port":\s*\K\d+' "$CONFIG_FILE" 2>/dev/null || echo "inconnu")
    mode=$(grep -oP '"deploymentMode":\s*"\K[^"]+' "$CONFIG_FILE" 2>/dev/null || echo "inconnu")
    host=$(grep -oP '"host":\s*"\K[^"]+' "$CONFIG_FILE" 2>/dev/null || echo "inconnu")
    
    echo "   🌐 Port: $port"
    echo "   🔒 Mode: $mode"
    echo "   🖥️  Host: $host"
    echo ""
fi

# Vérifier si le serveur tourne
echo "🔍 État du Serveur"
if [ -f "$CONFIG_FILE" ]; then
    port=$(grep -oP '"port":\s*\K\d+' "$CONFIG_FILE" 2>/dev/null || echo "3100")
    if curl -s "http://127.0.0.1:$port/health" &> /dev/null 2>&1; then
        echo "   ✅ Serveur actif sur http://127.0.0.1:$port"
    else
        echo "   ⏸️  Serveur arrêté"
        echo "   💡 Lancez avec: npm run paperclip"
    fi
else
    echo "   ⚠️  Configuration introuvable"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Vérification terminée"
echo ""
