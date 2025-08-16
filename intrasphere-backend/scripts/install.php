<?php
/**
 * Installation automatique IntraSphere PHP
 */

echo "🚀 Installation IntraSphere PHP\n";

// 1. Vérifier la version de PHP
if (version_compare(PHP_VERSION, '7.4.0', '<')) {
    die("❌ PHP 7.4+ requis. Version actuelle: " . PHP_VERSION . "\n");
}
echo "✅ PHP " . PHP_VERSION . " OK\n";

// 2. Vérifier les extensions PHP
$required = ['pdo', 'pdo_mysql', 'json', 'mbstring', 'fileinfo', 'zip'];
foreach ($required as $ext) {
    if (!extension_loaded($ext)) {
        die("❌ Extension PHP manquante: $ext\n");
    }
}
echo "✅ Extensions PHP requises chargées\n";

// 3. Vérifier les permissions des dossiers
$dirs = ['public/uploads', 'logs'];
foreach ($dirs as $d) {
    if (!is_dir($d)) mkdir($d, 0755, true);
    if (!is_writable($d)) {
        die("❌ Répertoire non inscriptible : $d\n");
    }
}
echo "✅ Permissions des dossiers OK\n";

// 4. Préparer .env
if (!file_exists(__DIR__ . '/../.env')) {
    if (file_exists(__DIR__ . '/../.env.example')) {
        copy(__DIR__ . '/../.env.example', __DIR__ . '/../.env');
        echo "📝 Fichier .env créé depuis .env.example\n";
        echo "⚠️  N'oubliez pas de configurer .env (DB, APP_URL, etc.)\n";
    } else {
        die("❌ .env.example introuvable\n");
    }
}

// 5. Préparation de la base de données
echo "\n✅ Installation initiale terminée.\n";
echo "📋 Étapes suivantes :\n";
echo " 1. Configurez .env avec vos paramètres de base de données.\n";
echo " 2. Importez database/schema.sql dans MySQL.\n";
echo " 3. Testez l'API : /public/api/health\n";
echo "\n🎉 Prêt à l'emploi !\n";