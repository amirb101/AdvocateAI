// Simple script to create placeholder icons
// Run with: node create-icons.js

const fs = require('fs');
const { createCanvas } = require('canvas');

// If canvas is not available, create simple placeholder files
try {
  const sizes = [16, 48, 128];
  sizes.forEach(size => {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    // Draw brain emoji
    ctx.fillStyle = 'white';
    ctx.font = `bold ${Math.floor(size * 0.6)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🧠', size / 2, size / 2);
    
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(`icons/icon${size}.png`, buffer);
    console.log(`Created icon${size}.png`);
  });
} catch (error) {
  console.log('Canvas not available. Creating placeholder note...');
  console.log('Please create icon files manually or use icons/generate.html');
}

