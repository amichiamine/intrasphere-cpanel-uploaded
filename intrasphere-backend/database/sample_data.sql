-- sample_data.sql : Données exemples pour tests

-- Utilisateur admin
INSERT INTO users (id, username, password, name, email, role, is_active)
VALUES
('admin-001','admin','$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeVMBYXXfq0zKvKvS','Administrateur','admin@example.com','admin',1);

-- Catégories contenu
INSERT INTO categories (id,name,type,sort_order)
VALUES
('cat-001','Général','content',1),
('cat-002','RH','document',2),
('cat-003','IT','document',3);

-- Annonces test
INSERT INTO announcements (id,title,content,author_id,author_name,is_published)
VALUES
('ann-001','Bienvenue','Bienvenue sur IntraSphere','admin-001','Administrateur',1);

-- Documents test
INSERT INTO documents (id,title,file_name,file_url)
VALUES
('doc-001','Spec.pdf','spec.pdf','/public/uploads/documents/spec.pdf');

-- Événement test
INSERT INTO events (id,title,date,start_time,organizer_id,organizer_name)
VALUES
('evt-001','Réunion Q1','2025-09-01','09:00:00','admin-001','Administrateur');

-- Participants événement
INSERT INTO event_participants (id,event_id,user_id)
VALUES
('ep-001','evt-001','admin-001');

-- Forum catégories & topics
INSERT INTO forum_categories (id,name,sort_order) VALUES
('fc-001','Général',1);
INSERT INTO forum_topics (id,title,content,category_id,author_id,author_name)
VALUES
('ft-001','Sujet test','Contenu du sujet','fc-001','admin-001','Administrateur');

-- Forum posts
INSERT INTO forum_posts (id,topic_id,content,author_id,author_name)
VALUES
('fp-001','ft-001','Réponse test','admin-001','Administrateur');

-- Réclamations test
INSERT INTO complaints (id,submitter_id,submitter_name,title,description,category)
VALUES
('cmp-001','admin-001','Administrateur','Problème test','Description test','technical');

-- Trainings
INSERT INTO trainings (id,title,trainer,start_date,end_date,status)
VALUES
('tr-001','Formation X','Formateur','2025-10-01 09:00:00','2025-10-01 17:00:00','scheduled');

-- Courses & lessons
INSERT INTO courses (id,title,category,difficulty_level,is_published)
VALUES
('crs-001','Cours A','general','beginner',1);
INSERT INTO lessons (id,course_id,title,order_index)
VALUES
('les-001','Leçon 1','crs-001',1);

-- Course enrollments
INSERT INTO course_enrollments (id,course_id,user_id)
VALUES
('ce-001','crs-001','admin-001');

-- Resources
INSERT INTO resources (id,title,type,url,course_id)
VALUES
('res-001','Ressource X','link','https://example.com','crs-001');

-- Certificates
INSERT INTO certificates (id,user_id,course_id,course_name,certificate_number,earned_at,valid_until)
VALUES
('cert-001','admin-001','crs-001','Cours A','CERT-ABCD1234',NOW(),DATE_ADD(NOW(),INTERVAL 1 YEAR));

-- Permissions
INSERT INTO permissions (id,user_id,permission,granted_by)
VALUES
('perm-001','admin-001','manage_users','admin-001');

-- Employee categories
INSERT INTO employee_categories (id,name,department,level)
VALUES
('ec-001','Ingénieur','IT',2);

-- User settings
INSERT INTO user_settings (id,user_id,`key`,`value`)
VALUES
('us-001','admin-001','theme','\"dark\"');

-- System settings
INSERT INTO system_settings (id,`key`,`value`)
VALUES
('ss-001','app_name','\"IntraSphere\"');
