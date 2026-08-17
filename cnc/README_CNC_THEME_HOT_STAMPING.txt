CNC theme Hot Stamping grey/noir

Objectif : aligner les couleurs du CNC avec l'app Hot Stamping sans toucher au moteur, aux calculs, aux tables Supabase, ni aux bibliothèques.

Installation :
1. Placer cnc-theme-hotstamping.css dans le dossier /cnc du dépôt GitHub.
2. Ouvrir /cnc/index.html.
3. Dans la balise <head>, juste avant </head>, ajouter :
   <link rel="stylesheet" href="cnc-theme-hotstamping.css">
4. Remplacer les icônes dans /cnc par les fichiers icon-192.png, icon-512.png et apple-touch-icon.png fournis si tu veux aussi harmoniser l'icône.
5. Commit changes.
6. Attendre le redéploiement Vercel puis faire Ctrl + Shift + R.

Ce patch ne modifie pas le JavaScript existant.
