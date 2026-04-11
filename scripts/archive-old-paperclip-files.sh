#!/bin/bash

# Archive old Paperclip files (older than 7 days)
# Usage: bash scripts/archive-old-paperclip-files.sh

set -e

PAPERCLIP_DIR=".paperclip"
ARCHIVE_DIR=".paperclip/archive"
DAYS_OLD=7

echo "🗂️  Archiving Paperclip files older than ${DAYS_OLD} days..."

# Create archive directory if it doesn't exist
mkdir -p "$ARCHIVE_DIR"

# Find and move files older than 7 days
find "$PAPERCLIP_DIR" -maxdepth 1 -type f -mtime +${DAYS_OLD} -exec mv {} "$ARCHIVE_DIR/" \;

# Count archived files
ARCHIVED_COUNT=$(find "$ARCHIVE_DIR" -type f | wc -l)

echo "✅ Archived ${ARCHIVED_COUNT} files to ${ARCHIVE_DIR}/"
echo ""
echo "📊 Current Paperclip directory status:"
echo "   Active files: $(find "$PAPERCLIP_DIR" -maxdepth 1 -type f | wc -l)"
echo "   Archived files: ${ARCHIVED_COUNT}"
echo ""
echo "💡 To permanently delete archived files:"
echo "   rm -rf ${ARCHIVE_DIR}"
