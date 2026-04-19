#!/bin/bash

# Wrapper pour lancer PaperClip en ignorant les erreurs de migration
# sur une base de données existante

set +e  # Ne pas arrêter sur erreur

PAPERCLIP_DIR="/c/Users/TREIGUA/Desktop/WEBSITE/paperclip"

cd "$PAPERCLIP_DIR"

echo "🔄 Tentative de démarrage avec migrations..."
echo ""

# Essayer de lancer avec migrations
pnpm dev 2>&1 &
DEV_PID=$!

# Attendre un peu pour voir si ça démarre
sleep 5

# Vérifier si le processus tourne encore
if kill -0 $DEV_PID 2>/dev/null; then
    echo "✅ Serveur démarré avec succès!"
    wait $DEV_PID
else
    echo ""
    echo "⚠️  Les migrations ont échoué (normal pour une DB existante)"
    echo "🔄 Redémarrage sans migrations..."
    echo ""
    
    # Lancer directement le serveur sans migrations
    cd server
    if [ -f "dist/index.js" ]; then
        exec node dist/index.js
    else
        echo "❌ Serveur non compilé. Compilation..."
        cd ..
        pnpm --filter @paperclipai/server build
        cd server
        exec node dist/index.js
    fi
fi
