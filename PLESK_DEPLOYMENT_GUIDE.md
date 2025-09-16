# Guide de Déploiement Plesk Apache pour Application React SPA

## Problème Résolu

Ce guide résout le problème de routage des Single Page Applications (SPA) React sur les serveurs Plesk avec Apache, y compris les erreurs 404 dues à mod_rewrite non activé.

## Solutions Implémentées

### Configuration Apache (.htaccess)

Le fichier `.htaccess` a été optimisé spécifiquement pour Apache avec :
- **Gestion avancée du routage SPA React** : Support complet des sous-liens et routes imbriquées
- **Exclusion des routes API** : Protection des endpoints backend
- **Support des paramètres de requête (QSA)** : Préservation des query parameters
- **Exclusion précise des fichiers statiques** : Inclut les source maps (.map)
- **Règles multiples de fallback** : Gestion robuste des sous-dossiers profonds
- **Optimisation de la mise en cache** : Performance améliorée
- **Compression Gzip activée** : Réduction de la bande passante
- **Headers de sécurité renforcés** : Protection contre les attaques
- **Protection des fichiers sensibles** : Sécurité renforcée

### 3. Configuration Package.json
Ajout de `"homepage": "./"` pour assurer les chemins relatifs corrects.

## Étapes de Déploiement sur Plesk

### Étape 1: Build de Production
```bash
cd /Users/user/Documents/reussir-tcfcanada/frontend
npm run build
```

### Étape 2: Upload des Fichiers
1. Uploadez tout le contenu du dossier `build/` vers le dossier racine de votre domaine dans Plesk
2. Assurez-vous que les fichiers `.htaccess` et `web.config` sont bien présents

### Étape 3: Configuration Plesk

#### Pour Apache :
1. **Activer mod_rewrite** :
   - Allez dans Outils & Paramètres > Paramètres du serveur web Apache.
   - Vérifiez que "rewrite" est coché dans la liste des modules. Si non, cochez-le et appliquez.
   - Alternative via SSH : Connectez-vous en SSH et exécutez `plesk sbin httpd_modules_ctl -e rewrite`.
2. Assurez-vous que les fichiers `.htaccess` sont autorisés.
3. Dans Plesk > Domaines > [Votre domaine] > Hébergement & DNS > Paramètres Apache et nginx :
   - Ajoutez des directives Apache supplémentaires si nécessaire, comme `RewriteEngine On` pour tester.
   - Activez "Autoriser la substitution par .htaccess".

#### Pour Nginx (si utilisé) :
Ajoutez cette configuration dans les directives Nginx additionnelles :
```nginx
location / {
    try_files $uri $uri/ /index.html;
}

# Gestion des fichiers statiques
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Headers de sécurité
add_header X-Content-Type-Options nosniff;
add_header X-Frame-Options DENY;
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "strict-origin-when-cross-origin";
```

### Étape 4: Vérification DNS et SSL
1. Vérifiez que le DNS pointe correctement vers votre serveur
2. Activez SSL/TLS si nécessaire
3. Configurez les redirections HTTP vers HTTPS si souhaité

### Étape 5: Test des Routes
Testez ces URLs pour vérifier le bon fonctionnement :
- `https://votre-domaine.com/` (page d'accueil)
- `https://votre-domaine.com/authentication/sign-in` (page de connexion)
- `https://votre-domaine.com/authentication/sign-up` (page d'inscription)
- `https://votre-domaine.com/dashboard` (tableau de bord)

## Problèmes Courants et Solutions

### 1. Erreur 404 sur les routes
**Cause :** Configuration serveur incorrecte ou mod_rewrite non activé
**Solution :** Vérifiez que `.htaccess` est correct et activez mod_rewrite comme décrit ci-dessus.

### 2. Ressources statiques non trouvées
**Cause :** Chemins absolus au lieu de relatifs
**Solution :** Vérifiez que `"homepage": "./"` est dans package.json

### 3. Erreurs CORS
**Cause :** Configuration API backend
**Solution :** Configurez les headers CORS sur votre API backend

### 4. Problèmes de cache
**Cause :** Anciens fichiers en cache
**Solution :** Videz le cache du navigateur et du serveur

## Commandes de Diagnostic

### Vérifier la configuration Apache :
```bash
sudo apache2ctl -t
sudo systemctl status apache2
```

### Vérifier les logs d'erreur :
```bash
sudo tail -f /var/log/apache2/error.log
sudo tail -f /var/log/nginx/error.log
```

### Tester les règles de réécriture :
```bash
curl -I https://votre-domaine.com/une-route-inexistante
```

## Configuration Backend

Assurez-vous que votre backend API :
1. Accepte les requêtes depuis votre domaine
2. A les headers CORS configurés correctement
3. Utilise HTTPS si le frontend l'utilise

## Support

Si les problèmes persistent :
1. Vérifiez les logs d'erreur du serveur
2. Testez avec les outils de développement du navigateur
3. Contactez le support Plesk si nécessaire

## Fichiers Modifiés
- `public/.htaccess` - Configuration Apache optimisée
- `public/web.config` - Configuration IIS
- `package.json` - Ajout de la propriété homepage
- `public/_redirects` - Configuration Netlify (existant)