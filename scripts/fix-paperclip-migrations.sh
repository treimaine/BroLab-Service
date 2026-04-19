#!/bin/bash

# Script pour marquer toutes les migrations PaperClip comme appliquées
# Cela permet de démarrer le serveur sans réappliquer les migrations

set -e

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║         Fix Migrations PaperClip                           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

DB_DIR="/c/Users/TREIGUA/.paperclip-worktrees/instances/brolab/db"
PAPERCLIP_DIR="/c/Users/TREIGUA/Desktop/WEBSITE/paperclip"

if [ ! -d "$DB_DIR" ]; then
    echo "❌ Base de données introuvable: $DB_DIR"
    exit 1
fi

if [ ! -d "$PAPERCLIP_DIR" ]; then
    echo "❌ PaperClip introuvable: $PAPERCLIP_DIR"
    exit 1
fi

echo "📂 Base de données: $DB_DIR"
echo "📂 PaperClip: $PAPERCLIP_DIR"
echo ""

# Compter les fichiers de migration
cd "$PAPERCLIP_DIR/packages/db/migrations"
MIGRATION_COUNT=$(ls -1 *.sql 2>/dev/null | wc -l)

echo "📊 Migrations trouvées: $MIGRATION_COUNT"
echo ""

# Créer un script SQL pour marquer toutes les migrations comme appliquées
echo "🔧 Création du script SQL..."

cat > /tmp/mark_migrations.sql << 'EOF'
-- Créer la table de migrations si elle n'existe pas
CREATE TABLE IF NOT EXISTS _paperclip_migrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Marquer toutes les migrations comme appliquées
EOF

# Ajouter chaque migration
for migration in $(ls -1 *.sql 2>/dev/null); do
    migration_name="${migration%.sql}"
    echo "INSERT INTO _paperclip_migrations (name) VALUES ('$migration_name') ON CONFLICT (name) DO NOTHING;" >> /tmp/mark_migrations.sql
done

echo "✅ Script SQL créé"
echo ""

# Afficher le script
echo "📄 Contenu du script (premiers 10 lignes):"
head -10 /tmp/mark_migrations.sql
echo "..."
echo ""

echo "🚀 Application du script à la base de données..."
echo ""

# Se connecter à la base de données et exécuter le script
# Note: Vous devrez peut-être ajuster la commande selon votre configuration PostgreSQL
psql -h localhost -p 54331 -U postgres -d paperclip -f /tmp/mark_migrations.sql 2>&1

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migrations marquées comme appliquées!"
    echo ""
    echo "🎯 Vous pouvez maintenant lancer PaperClip:"
    echo "   cd C:\\Users\\TREIGUA\\Desktop\\WEBSITE\\paperclip"
    echo "   pnpm dev"
else
    echo ""
    echo "❌ Erreur lors de l'application du script"
    echo ""
    echo "💡 Solution alternative:"
    echo "   1. Démarrer PostgreSQL sur le port 54331"
    echo "   2. Exécuter manuellement: psql -h localhost -p 54331 -U postgres -d paperclip -f /tmp/mark_migrations.sql"
fi

echo ""
