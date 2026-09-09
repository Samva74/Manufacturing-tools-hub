# LithoMaker - Générateur Corian & Lithophane

Application web 100% locale (offline) pour transformer n'importe quelle photo en relief 3D imprimable ou usinable CNC.

Créé pour le projet ruelle en pierre -> Corian rétroéclairé.

## ✨ Fonctionnalités

- **Upload image** (drag & drop)
- **Matériaux prédéfinis** adaptés à la lithophanie :
  - Corian Glacier White 12mm (base 3mm / max 10mm) - recommandé rétroéclairé
  - Corian 6mm (1.5mm / 5mm)
  - Plexiglas opale 8mm (1.2mm / 6.5mm)
  - Plexiglas 5mm (1mm / 4.5mm)
  - PLA Lithophane 3D (0.8mm / 3.2mm)
  - Custom
- **Dimensions** en mm avec conservation du ratio
- **Résolution** réglable 80-300px
- **Prévisualisation temps réel** : depth map + simulation rétroéclairage LED 3000K
- **Génération STL** ASCII côté client (top + bottom + parois latérales étanches)
- **Fiche technique CNC** auto-générée (fraise, passes, vitesses, ponçage, distance LED)

## 🚀 Utilisation

1. Ouvrir `index.html` dans Chrome/Edge/Firefox (pas besoin de serveur)
2. Déposer votre image
3. Choisir matériau et dimensions
4. Cliquer "Générer & Télécharger STL"
5. Télécharger aussi la fiche technique TXT

Tout tourne en local, aucune image n'est envoyée.

## 📦 Structure

- `index.html` - App complète (HTML/CSS/JS vanilla)
- `src/` - Version modulaire (si vous voulez développer)
- `examples/` - Exemples STL générés (ruelle)

## 🔧 Technique

- Conversion image -> grayscale -> heightMap = base + normalized * (max-base)
- STL ASCII : surface supérieure triangulée + fond plat + 4 parois latérales
- Pas de dépendances externes

## 📄 Licence

MIT - libre d'utilisation pour projets perso et pro.

---
Généré avec Meta AI - Projet Ruelle Corian
