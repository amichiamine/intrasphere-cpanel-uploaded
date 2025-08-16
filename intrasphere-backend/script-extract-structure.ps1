# Chemin du dossier à analyser
$rootPath = "C:\xampp\htdocs\inrasphere-react-blackbox\intrasphere-php"

# Fonction récursive pour afficher la structure avec indentation
function Show-FolderStructure {
    param (
        [string]$path,
        [int]$level = 0
    )
    $indent = " " * ($level * 2)
    # Affiche le dossier actuel
    Write-Output "$indent- $(Split-Path $path -Leaf)\"
    # Affiche les fichiers du dossier
    Get-ChildItem -Path $path -File | ForEach-Object {
        Write-Output "$indent  - $($_.Name)"
    }
    # Parcourt les sous-dossiers
    Get-ChildItem -Path $path -Directory | ForEach-Object {
        Show-FolderStructure -path $_.FullName -level ($level + 1)
    }
}

# Lance la fonction
Show-FolderStructure -path $rootPath | Out-File "structure_dossiers_intrasphere-php.md" -Encoding UTF8

