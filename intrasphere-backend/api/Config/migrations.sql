-- migrations.sql : Script de migrations SQL pour IntraSphere PHP

-- Exemple de migration : ajout d'une colonne `bio` à la table `users`
-- ALTER TABLE users
-- ADD COLUMN bio TEXT DEFAULT NULL AFTER name;

-- Ajoutez ici vos futures migrations, une par bloc :
-- -- Migration YYYYMMDD_HHMMSS_description
-- -- Votre SQL de modification DDL/ DML
-- Exemple :
-- Migration 20250815_1532_add_bio_to_users
ALTER TABLE users
  ADD COLUMN bio TEXT DEFAULT NULL AFTER name;
