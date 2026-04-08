#!/bin/bash

# Generate favicon.ico from logo.png
# This script requires ImageMagick to be installed

echo "🎨 Generating favicon.ico from public/logo.png..."

# Check if ImageMagick is installed
if ! command -v magick &> /dev/null && ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick not found!"
    echo ""
    echo "Please install ImageMagick:"
    echo "  - Windows: choco install imagemagick"
    echo "  - macOS: brew install imagemagick"
    echo "  - Linux: sudo apt-get install imagemagick"
    echo ""
    echo "Or use an online tool:"
    echo "  https://favicon.io/favicon-converter/"
    echo ""
    exit 1
fi

# Check if logo.png exists
if [ ! -f "public/logo.png" ]; then
    echo "❌ public/logo.png not found!"
    exit 1
fi

# Generate favicon.ico (16x16 and 32x32 sizes)
if command -v magick &> /dev/null; then
    # ImageMagick 7+
    magick convert "public/logo.png" -resize 32x32 -background transparent -gravity center -extent 32x32 "public/favicon-32.png"
    magick convert "public/logo.png" -resize 16x16 -background transparent -gravity center -extent 16x16 "public/favicon-16.png"
    magick convert "public/favicon-16.png" "public/favicon-32.png" "public/favicon.ico"
    rm "public/favicon-16.png" "public/favicon-32.png"
else
    # ImageMagick 6
    convert "public/logo.png" -resize 32x32 -background transparent -gravity center -extent 32x32 "public/favicon-32.png"
    convert "public/logo.png" -resize 16x16 -background transparent -gravity center -extent 16x16 "public/favicon-16.png"
    convert "public/favicon-16.png" "public/favicon-32.png" "public/favicon.ico"
    rm "public/favicon-16.png" "public/favicon-32.png"
fi

echo "✅ favicon.ico generated successfully!"
echo ""
echo "Next steps:"
echo "1. git add public/favicon.ico"
echo "2. git commit -m 'feat: add generated favicon.ico'"
echo "3. git push"
