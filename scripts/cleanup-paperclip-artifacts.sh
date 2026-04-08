#!/bin/bash

# Move PaperclipAI artifacts to .paperclip folder
# These files are for internal PaperclipAI coordination and should not be at root

echo "📦 Moving PaperclipAI artifacts to .paperclip folder..."
echo ""

# Create .paperclip/scripts directory if it doesn't exist
mkdir -p .paperclip/scripts
mkdir -p .paperclip/data

# Move shell scripts
echo "Moving shell scripts..."
[ -f check-paperclip-status.sh ] && mv check-paperclip-status.sh .paperclip/scripts/
[ -f deploy_update.sh ] && mv deploy_update.sh .paperclip/scripts/
[ -f final_status_update.sh ] && mv final_status_update.sh .paperclip/scripts/
[ -f update_blocked_status.sh ] && mv update_blocked_status.sh .paperclip/scripts/
[ -f checkout.sh ] && mv checkout.sh .paperclip/scripts/

# Move JSON files
echo "Moving JSON artifacts..."
[ -f blocker_comment.json ] && mv blocker_comment.json .paperclip/data/
[ -f deployment_task.json ] && mv deployment_task.json .paperclip/data/

# Move JS scripts
echo "Moving JS scripts..."
[ -f get-metrics.js ] && mv get-metrics.js .paperclip/scripts/
[ -f get-signups.js ] && mv get-signups.js .paperclip/scripts/

echo ""
echo "✅ Move complete!"
echo ""
echo "Files moved to .paperclip:"
echo "  Scripts → .paperclip/scripts/"
echo "    - check-paperclip-status.sh"
echo "    - deploy_update.sh"
echo "    - final_status_update.sh"
echo "    - update_blocked_status.sh"
echo "    - checkout.sh"
echo "    - get-metrics.js"
echo "    - get-signups.js"
echo ""
echo "  Data → .paperclip/data/"
echo "    - blocker_comment.json"
echo "    - deployment_task.json"
echo ""
echo "Next steps:"
echo "1. git add .paperclip/"
echo "2. git add -u  # Stage deletions from root"
echo "3. git commit -m 'chore: organize PaperclipAI artifacts into .paperclip folder'"
echo "4. git push"
