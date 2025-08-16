<?php
/**
 * Générateur de package de déploiement IntraSphere PHP
 */
echo "📦 Création du package de déploiement...\n";

$packageDir = __DIR__ . '/../deploy-package';
$zipFile    = __DIR__ . '/../intrasphere-php-' . date('Ymd-His') . '.zip';

// 1. Nettoyer l’ancien package
if (is_dir($packageDir)) {
    exec("rm -rf " . escapeshellarg($packageDir));
}
mkdir($packageDir);

// 2. Copier la structure essentielle
$items = [
    '../api'      => 'api',
    '../public'   => 'public',
    '../database' => 'database',
    '../scripts'  => 'scripts',
    '../.env.example' => '.env.example',
    '../.htaccess'    => '.htaccess',
    '../index.php'    => 'index.php',
    '../composer.json'=> 'composer.json',
    '../README.md'    => 'README.md',
    '../INSTALL.md'   => 'INSTALL.md'
];
foreach ($items as $src => $dest) {
    $srcPath  = realpath(__DIR__ . "/$src");
    $destPath = "$packageDir/$dest";
    if (is_dir($srcPath)) {
        exec("cp -r " . escapeshellarg($srcPath) . " " . escapeshellarg($destPath));
    } else {
        copy($srcPath, $destPath);
    }
}

// 3. Créer l’archive ZIP
$zip = new ZipArchive();
if ($zip->open($zipFile, ZipArchive::CREATE) !== true) {
    die("❌ Impossible de créer l'archive $zipFile\n");
}
$files = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($packageDir),
    RecursiveIteratorIterator::LEAVES_ONLY
);
foreach ($files as $file) {
    if (!$file->isDir()) {
        $filePath     = $file->getRealPath();
        $relativePath = substr($filePath, strlen(realpath($packageDir)) + 1);
        $zip->addFile($filePath, $relativePath);
    }
}
$zip->close();

// 4. Nettoyer le dossier temporaire
exec("rm -rf " . escapeshellarg($packageDir));

echo "✅ Package créé : $zipFile\n";
echo "\nÉtapes de déploiement :\n";
echo " 1. Uploadez $zipFile sur votre serveur.\n";
echo " 2. Extrayez-le dans le répertoire racine.\n";
echo " 3. Suivez INSTALL.md\n";