# INSTRUCTIONS DÉTAILLÉES CPANEL
===============================

## ÉTAPE 1: Préparation Locale

### 1.1 Dans votre frontend local:
```bash
# Appliquer les adaptations
cp enhanced-api-adapted.ts src/core/lib/enhanced-api.ts
cp vite.config-adapted.ts vite.config.ts  
cp env.production-adapted .env.production

# Modifier websocket-client.ts (ligne ~20):
# Ajouter: const forceDisable = true;
```

### 1.2 Build du projet:
```bash
npm install
npm run build
```

### 1.3 Vérifier le build:
```bash
ls dist/
# Doit contenir: index.html, assets/, favicon.ico
```

## ÉTAPE 2: Upload via cPanel

### 2.1 Connexion cPanel File Manager
- Ouvrir File Manager
- Naviguer vers: /public_html/intrasphere/

### 2.2 Préparer le dossier frontend
- Supprimer l'ancien: intrasphere-frontend/
- Créer nouveau dossier: intrasphere-frontend/

### 2.3 Upload des fichiers
- Sélectionner TOUS les fichiers dans dist/
- Upload vers: intrasphere-frontend/
- Structure finale:
  ```
  intrasphere-frontend/
  ├── index.html
  ├── assets/
  │   ├── index-[hash].css
  │   └── index-[hash].js
  └── favicon.ico
  ```

## ÉTAPE 3: Tests de Validation

### 3.1 Test Frontend
- URL: https://stacgate.com/intrasphere/
- Attendu: Interface React chargée

### 3.2 Test API (Console F12)
- Plus d'erreurs 404 sur /api/auth/me
- Réponses JSON propres

### 3.3 Test Fonctionnel
- Navigation entre pages
- Login/logout
- Thème glassmorphism visible

## ALTERNATIVE: Upload ZIP

Si trop de fichiers:
1. Créer ZIP du contenu de dist/
2. Upload ZIP vers intrasphere-frontend/
3. Extraire dans cPanel
4. Supprimer le ZIP

## DÉPANNAGE cPanel

### Erreur: "Fichiers non visibles"
- Ctrl+F5 pour vider cache
- Vérifier permissions: 644 pour fichiers, 755 pour dossiers

### Erreur: "API 404"  
- Vérifier .htaccess principal existe
- Appliquer corrections Router PHP précédentes

### Erreur: "Interface basique"
- F12 → Console → chercher erreurs JavaScript
- Vérifier chemins assets corrects

---

**Support**: En cas de problème, vérifier console F12 et logs d'erreur cPanel.
