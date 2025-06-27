const fs = require('fs');
const path = require('path');

// Crear un ícono SVG simple basado en el concepto de accesibilidad
const createIconSVG = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
  <line x1="8" y1="21" x2="16" y2="21"/>
  <line x1="12" y1="17" x2="12" y2="21"/>
  <circle cx="12" cy="10" r="3"/>
  <path d="M12 10v4"/>
  <path d="M10 10h4"/>
</svg>
`;

// Crear iconos en diferentes tamaños
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

sizes.forEach(size => {
  const svgContent = createIconSVG(size);
  fs.writeFileSync(path.join(__dirname, 'public', `icon-${size}x${size}.svg`), svgContent);
  console.log(`Creado icon-${size}x${size}.svg`);
});

// También crear los archivos maskable
const maskableContent = createIconSVG(192);
fs.writeFileSync(path.join(__dirname, 'public', 'icon-192x192-maskable.svg'), maskableContent);
fs.writeFileSync(path.join(__dirname, 'public', 'icon-512x512-maskable.svg'), createIconSVG(512));

// Cleanup any remaining canvases
activeCanvases.forEach(cleanupCanvas);

console.log('Iconos SVG creados exitosamente!');
