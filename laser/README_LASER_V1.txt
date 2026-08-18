Laser Calculator V1 - Supabase

Fichiers prêts pour GitHub/Vercel :
- laser/index.html
- laser/manifest.json
- laser/icon-192.png
- laser/icon-512.png
- laser/apple-touch-icon.png
- laser/laser_v1_setup.sql

Installation :
1. Copier le dossier /laser dans le même dépôt que le hub, au même niveau que /cnc et /hot-stamping.
2. Dans Supabase > SQL Editor, exécuter laser/laser_v1_setup.sql.
3. Dans le index.html du portail, ajouter une entrée dans APPS :
   { name: 'Laser', path: '/laser/', icon: 'laser/icon-192.png' }
4. Commit changes dans GitHub.
5. Ouvrir /laser/ après redéploiement Vercel.

Notes importantes :
- Les valeurs intégrées sont des points de départ. Toujours tester sur une chute matière.
- Les matières à risque ou interdites sont signalées dans l'app.
- Le fichier utilise ../auth-guard.js pour garder la connexion partagée avec le portail.
