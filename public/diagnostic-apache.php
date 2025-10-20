<?php
// Diagnostic Apache pour React SPA sur Plesk
// Accédez à ce fichier via: votre-domaine.com/diagnostic-apache.php

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Diagnostic Apache - React SPA</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .success { color: green; }
        .error { color: red; }
        .warning { color: orange; }
        .info { background: #f0f0f0; padding: 10px; margin: 10px 0; }
    </style>
</head>
<body>
    <h1>Diagnostic Apache pour React SPA</h1>
    
    <h2>1. Modules Apache</h2>
    <?php
    $required_modules = ['mod_rewrite', 'mod_expires', 'mod_deflate', 'mod_headers'];
    
    if (function_exists('apache_get_modules')) {
        $loaded_modules = apache_get_modules();
        foreach ($required_modules as $module) {
            if (in_array($module, $loaded_modules)) {
                echo "<div class='success'>✓ $module est activé</div>";
            } else {
                echo "<div class='error'>✗ $module n'est PAS activé</div>";
            }
        }
    } else {
        echo "<div class='warning'>⚠ Impossible de vérifier les modules Apache</div>";
    }
    ?>
    
    <h2>2. Configuration PHP</h2>
    <div class="info">
        <strong>Version PHP:</strong> <?php echo phpversion(); ?><br>
        <strong>Serveur:</strong> <?php echo $_SERVER['SERVER_SOFTWARE'] ?? 'Non disponible'; ?><br>
        <strong>Document Root:</strong> <?php echo $_SERVER['DOCUMENT_ROOT'] ?? 'Non disponible'; ?>
    </div>
    
    <h2>3. Test de Réécriture d'URL</h2>
    <?php
    // Test si .htaccess fonctionne
    $htaccess_path = __DIR__ . '/.htaccess';
    if (file_exists($htaccess_path)) {
        echo "<div class='success'>✓ Fichier .htaccess trouvé</div>";
        echo "<div class='info'>Contenu du .htaccess:<br><pre>" . htmlspecialchars(file_get_contents($htaccess_path)) . "</pre></div>";
    } else {
        echo "<div class='error'>✗ Fichier .htaccess non trouvé</div>";
    }
    ?>
    
    <h2>4. Test des Fichiers React</h2>
    <?php
    $react_files = ['index.html', 'static/js', 'static/css'];
    foreach ($react_files as $file) {
        $path = __DIR__ . '/' . $file;
        if (file_exists($path)) {
            echo "<div class='success'>✓ $file trouvé</div>";
        } else {
            echo "<div class='error'>✗ $file non trouvé</div>";
        }
    }
    ?>
    
    <h2>5. Variables d'Environnement</h2>
    <div class="info">
        <strong>REQUEST_URI:</strong> <?php echo $_SERVER['REQUEST_URI'] ?? 'Non disponible'; ?><br>
        <strong>SCRIPT_NAME:</strong> <?php echo $_SERVER['SCRIPT_NAME'] ?? 'Non disponible'; ?><br>
        <strong>HTTP_HOST:</strong> <?php echo $_SERVER['HTTP_HOST'] ?? 'Non disponible'; ?><br>
    </div>
    
    <h2>6. Instructions de Résolution</h2>
    <div class="info">
        <h3>Si mod_rewrite n'est pas activé:</h3>
        <p>Contactez votre hébergeur Plesk pour activer mod_rewrite</p>
        
        <h3>Si les fichiers React ne sont pas trouvés:</h3>
        <p>Assurez-vous que le build React est dans le bon répertoire</p>
        
        <h3>Test de routage:</h3>
        <p>Essayez d'accéder à: <a href="/mon-espace-tcf">/mon-espace-tcf</a> (devrait rediriger vers index.html)</p>
    </div>
    
    <p><em>Supprimez ce fichier après diagnostic pour des raisons de sécurité.</em></p>
</body>
</html>