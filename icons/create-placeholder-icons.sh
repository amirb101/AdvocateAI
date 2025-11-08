#!/bin/bash
# Create simple placeholder icons using ImageMagick or sips (macOS)

for size in 16 48 128; do
  if command -v convert &> /dev/null; then
    # ImageMagick
    convert -size ${size}x${size} xc:'#667eea' -fill white -gravity center -pointsize $((size/2)) -annotate +0+0 'A' icons/icon${size}.png
  elif command -v sips &> /dev/null; then
    # macOS sips - create solid color square
    sips -s format png --setProperty formatOptions low -z ${size} ${size} --out icons/icon${size}.png < /dev/null 2>/dev/null || echo "Could not create icon${size}.png"
  else
    echo "No image tool found. Please create icons manually or use icons/generate.html"
    exit 1
  fi
done
echo "Icons created!"
