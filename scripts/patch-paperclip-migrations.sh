#!/bin/bash

# Script pour patcher PaperClip et ignorer les erreurs de migration "already exists"

set -e

PAPERCLIP_DIR="/c/Users/TREIGUA/Desktop/WEBSITE/paperclip"
MIGRATE_FILE="$PAPERCLIP_DIR/packages/db/src/migrate.ts"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║         Patch PaperClip Migrations                         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

if [ ! -f "$MIGRATE_FILE" ]; then
    echo "❌ Fichier de migration introuvable: $MIGRATE_FILE"
    exit 1
fi

# Sauvegarder l'original
if [ ! -f "$MIGRATE_FILE.backup" ]; then
    echo "💾 Sauvegarde de l'original..."
    cp "$MIGRATE_FILE" "$MIGRATE_FILE.backup"
    echo "   ✓ Sauvegardé: $MIGRATE_FILE.backup"
fi

echo ""
echo "🔧 Application du patch..."
echo ""

# Créer un patch qui ignore les erreurs "already exists"
cat > /tmp/migrate-patch.ts << 'EOF'
// Patch: Ignorer les erreurs "already exists" (code 42P07)
try {
  // Code de migration original ici
} catch (error: any) {
  if (error.code === '42P07') {
    console.log(`⚠️  Relation already exists (ignored): ${error.message}`);
    // Continuer sans erreur
  } else {
    throw error;
  }
}
EOF

echo "📝 Patch créé"
echo ""
echo "⚠️  IMPORTANT:"
echo "   Ce script nécessite une modification manuelle du fichier:"
echo "   $MIGRATE_FILE"
echo ""
echo "📋 Instructions:"
echo ""
echo "1. Ouvrir le fichier dans un éditeur:"
echo "   code \"$MIGRATE_FILE\""
echo ""
echo "2. Trouver la boucle de migration (chercher 'for' ou 'forEach')"
echo ""
echo "3. Entourer le code de migration avec un try-catch:"
echo ""
echo "   try {"
echo "     await sql.file(migrationPath);"
echo "   } catch (error: any) {"
echo "     if (error.code === '42P07') {"
echo "       console.log(\`⚠️  Skipped (already exists): \${migration}\`);"
echo "     } else {"
echo "       throw error;"
echo "     }"
echo "   }"
echo ""
echo "4. Sauvegarder et relancer: pnpm dev"
echo ""
echo "💡 Pour restaurer l'original:"
echo "   cp \"$MIGRATE_FILE.backup\" \"$MIGRATE_FILE\""
echo ""
