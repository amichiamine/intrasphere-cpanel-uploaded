<?php
/**
 * Script de déploiement automatique IntraSphere PHP
 * Usage: php scripts/deploy.php [environment]
 */

$env = $argv[1] ?? 'production';
echo "🚀 Déploiement IntraSphere PHP - Environnement: $env\n";

// Configuration d’environnement
$config = [
    'production' => ['backup'=>true,'optimize'=>true],
    'staging'    => ['backup'=>true,'optimize'=>false],
    'development'=> ['backup'=>false,'optimize'=>false]
];
$c = $config[$env] ?? $config['production'];

// 1. Backup si nécessaire
if ($c['backup']) {
    $bdir = __DIR__ . '/../backups/' . date('Ymd-His');
    mkdir(dirname($bdir),0755,true);
    mkdir($bdir);
    exec("cp -r ../api ../public ../.env $bdir");
    echo "💾 Sauvegarde créée: $bdir\n";
}

// 2. Vérifier prérequis
echo "🔍 Vérification requise...\n";
if (version_compare(PHP_VERSION,'7.4.0','<')) die("❌ PHP 7.4+ requis\n");
foreach(['pdo','pdo_mysql','json','mbstring'] as $ext) {
    if (!extension_loaded($ext)) die("❌ Extension manquante: $ext\n");
}
echo "✅ Environnement OK\n";

// 3. Installer / Mettre à jour la base de données si besoin
echo "⚙️  Assurez-vous d'importer database/schema.sql si nécessaire\n";

// 4. Optimisations production
if ($c['optimize']) {
    echo "⚡ Optimisations pour production...\n";
    ini_set('display_errors',0);
}

// 5. Tester l’API
$url = ($_ENV['APP_URL'] ?? 'http://localhost') . '/public/api/health';
$response = @file_get_contents($url);
if ($response) {
    echo "✅ API opérationnelle: $url\n";
} else {
    echo "⚠️  API non atteignable: $url\n";
}

echo "\n🎉 Déploiement terminé.\n";