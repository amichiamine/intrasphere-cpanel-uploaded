import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("employee"), // employee, admin, moderator
  avatar: text("avatar"),
  // Extended fields for employee management
  employeeId: varchar("employee_id").unique(), // Unique identifier for internal communication
  department: varchar("department"),
  position: varchar("position"),
  isActive: boolean("is_active").default(true),
  phone: varchar("phone"),
  email: varchar("email"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const announcements = pgTable("announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull().default("info"), // info, important, event, formation
  authorId: varchar("author_id").references(() => users.id),
  authorName: text("author_name").notNull(),
  imageUrl: text("image_url"),
  icon: text("icon").default("📢"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isImportant: boolean("is_important").default(false),
});

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(), // regulation, policy, guide, procedure
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  version: text("version").default("1.0"),
});

export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  location: text("location"),
  type: text("type").notNull().default("meeting"), // meeting, training, social, other
  organizerId: varchar("organizer_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Internal messaging system
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").references(() => users.id).notNull(),
  recipientId: varchar("recipient_id").references(() => users.id).notNull(),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Complaints/Reclamations system
export const complaints = pgTable("complaints", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  submitterId: varchar("submitter_id").references(() => users.id).notNull(),
  assignedToId: varchar("assigned_to_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // hr, it, facilities, other
  priority: text("priority").default("medium"), // low, medium, high, urgent
  status: text("status").default("open"), // open, in_progress, resolved, closed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Permission delegations - for admin to delegate content management powers
export const permissions = pgTable("permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  grantedBy: varchar("granted_by").references(() => users.id).notNull(),
  permission: text("permission").notNull(), // manage_announcements, manage_documents, manage_events, manage_users, validate_topics, validate_posts, manage_employee_categories, manage_trainings
  createdAt: timestamp("created_at").defaultNow(),
});

// Training system tables
export const trainings = pgTable("trainings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(), // technical, management, safety, compliance, other
  difficulty: text("difficulty").default("beginner"), // beginner, intermediate, advanced
  duration: integer("duration").notNull(), // duration in minutes
  instructorId: varchar("instructor_id").references(() => users.id),
  instructorName: text("instructor_name").notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  location: text("location"),
  maxParticipants: integer("max_participants"),
  currentParticipants: integer("current_participants").default(0),
  isMandatory: boolean("is_mandatory").default(false),
  isActive: boolean("is_active").default(true),
  isVisible: boolean("is_visible").default(true),
  thumbnailUrl: text("thumbnail_url"),
  documentUrls: text("document_urls").array().default(sql`ARRAY[]::text[]`), // Array of document URLs
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Training participants
export const trainingParticipants = pgTable("training_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trainingId: varchar("training_id").references(() => trainings.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  registeredAt: timestamp("registered_at").defaultNow(),
  status: text("status").default("registered"), // registered, completed, cancelled
  completionDate: timestamp("completion_date"),
  score: integer("score"), // 0-100
  feedback: text("feedback"),
});

// Insert schemas for all tables
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  role: true,
  avatar: true,
  employeeId: true,
  department: true,
  position: true,
  phone: true,
  email: true,
});

export const insertAnnouncementSchema = createInsertSchema(announcements).pick({
  title: true,
  content: true,
  type: true,
  authorName: true,
  isImportant: true,
}).extend({
  imageUrl: z.string().optional(),
  icon: z.string().optional(),
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  title: true,
  description: true,
  category: true,
  fileName: true,
  fileUrl: true,
  version: true,
});

export const insertEventSchema = createInsertSchema(events).pick({
  title: true,
  description: true,
  date: true,
  location: true,
  type: true,
  organizerId: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  senderId: true,
  recipientId: true,
  subject: true,
  content: true,
});

export const insertComplaintSchema = createInsertSchema(complaints).pick({
  submitterId: true,
  assignedToId: true,
  title: true,
  description: true,
  category: true,
  priority: true,
});

// Content table
export const contents = pgTable("contents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  type: text("type").notNull(), // video, image, document, audio
  category: text("category").notNull(),
  description: text("description"),
  fileUrl: text("file_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  duration: text("duration"),
  viewCount: integer("view_count").default(0),
  rating: integer("rating").default(0),
  tags: text("tags").array(),
  isPopular: boolean("is_popular").default(false),
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Categories table
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  icon: text("icon").default("📁"),
  color: text("color").default("#3B82F6"),
  isVisible: boolean("is_visible").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Employee Categories table - for managing employee types and roles
export const employeeCategories = pgTable("employee_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  color: text("color").default("#10B981"),
  permissions: text("permissions").array().default(sql`ARRAY[]::text[]`), // Array of permission codes
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// System Settings table - for forum visibility and other toggles
export const systemSettings = pgTable("system_settings", {
  id: varchar("id").primaryKey().default("settings"),
  showAnnouncements: boolean("show_announcements").default(true),
  showContent: boolean("show_content").default(true),
  showDocuments: boolean("show_documents").default(true),
  showForum: boolean("show_forum").default(true),
  showMessages: boolean("show_messages").default(true),
  showComplaints: boolean("show_complaints").default(true),
  showTraining: boolean("show_training").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPermissionSchema = createInsertSchema(permissions).pick({
  userId: true,
  grantedBy: true,
  permission: true,
});

export const insertContentSchema = createInsertSchema(contents).pick({
  title: true,
  type: true,
  category: true,
  description: true,
  thumbnailUrl: true,
  fileUrl: true,
  duration: true,
  isPopular: true,
  isFeatured: true,
  tags: true,
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  color: true,
  icon: true,
  description: true,
  isVisible: true,
  sortOrder: true,
});

export const insertEmployeeCategorySchema = createInsertSchema(employeeCategories).pick({
  name: true,
  description: true,
  color: true,
  permissions: true,
  isActive: true,
});

export const insertSystemSettingsSchema = createInsertSchema(systemSettings).pick({
  showAnnouncements: true,
  showContent: true,
  showDocuments: true,
  showForum: true,
  showMessages: true,
  showComplaints: true,
  showTraining: true,
});

export const insertTrainingSchema = createInsertSchema(trainings).pick({
  title: true,
  description: true,
  category: true,
  difficulty: true,
  duration: true,
  instructorName: true,
  startDate: true,
  endDate: true,
  location: true,
  maxParticipants: true,
  isMandatory: true,
  isActive: true,
  isVisible: true,
  thumbnailUrl: true,
  documentUrls: true,
});

export const insertTrainingParticipantSchema = createInsertSchema(trainingParticipants).pick({
  trainingId: true,
  userId: true,
  status: true,
  completionDate: true,
  score: true,
  feedback: true,
});

// Types for all tables
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Complaint = typeof complaints.$inferSelect;
export type InsertComplaint = z.infer<typeof insertComplaintSchema>;
export type Permission = typeof permissions.$inferSelect;
export type InsertPermission = z.infer<typeof insertPermissionSchema>;
export type Content = typeof contents.$inferSelect;
export type InsertContent = z.infer<typeof insertContentSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type EmployeeCategory = typeof employeeCategories.$inferSelect;
export type InsertEmployeeCategory = z.infer<typeof insertEmployeeCategorySchema>;
export type SystemSettings = typeof systemSettings.$inferSelect;
export type InsertSystemSettings = z.infer<typeof insertSystemSettingsSchema>;
export type Training = typeof trainings.$inferSelect;
export type InsertTraining = z.infer<typeof insertTrainingSchema>;
export type TrainingParticipant = typeof trainingParticipants.$inferSelect;
export type InsertTrainingParticipant = z.infer<typeof insertTrainingParticipantSchema>;

// E-Learning System Tables

// Training courses/modules
export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(), // technical, compliance, soft-skills, leadership
  difficulty: text("difficulty").notNull().default("beginner"), // beginner, intermediate, advanced
  duration: integer("duration"), // in minutes
  thumbnailUrl: text("thumbnail_url"),
  authorId: varchar("author_id").references(() => users.id),
  authorName: text("author_name").notNull(),
  isPublished: boolean("is_published").default(false),
  isMandatory: boolean("is_mandatory").default(false),
  prerequisites: text("prerequisites"), // JSON array of course IDs
  tags: text("tags"), // JSON array of tags
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Course lessons/chapters
export const lessons = pgTable("lessons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").references(() => courses.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content").notNull(), // HTML content
  order: integer("order").default(0),
  duration: integer("duration"), // in minutes
  videoUrl: text("video_url"),
  documentUrl: text("document_url"),
  isRequired: boolean("is_required").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Quizzes and evaluations
export const quizzes = pgTable("quizzes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").references(() => courses.id),
  lessonId: varchar("lesson_id").references(() => lessons.id),
  title: text("title").notNull(),
  description: text("description"),
  questions: text("questions").notNull(), // JSON array of questions
  passingScore: integer("passing_score").default(70), // percentage
  timeLimit: integer("time_limit"), // in minutes
  allowRetries: boolean("allow_retries").default(true),
  maxAttempts: integer("max_attempts").default(3),
  isRequired: boolean("is_required").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User course enrollments and progress
export const enrollments = pgTable("enrollments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  courseId: varchar("course_id").references(() => courses.id).notNull(),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  progress: integer("progress").default(0), // percentage
  status: text("status").default("enrolled"), // enrolled, in-progress, completed, failed
  certificateUrl: text("certificate_url"),
});

// User lesson progress
export const lessonProgress = pgTable("lesson_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  lessonId: varchar("lesson_id").references(() => lessons.id).notNull(),
  courseId: varchar("course_id").references(() => courses.id).notNull(),
  isCompleted: boolean("is_completed").default(false),
  timeSpent: integer("time_spent").default(0), // in minutes
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Quiz attempts and results
export const quizAttempts = pgTable("quiz_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  quizId: varchar("quiz_id").references(() => quizzes.id).notNull(),
  courseId: varchar("course_id").references(() => courses.id).notNull(),
  answers: text("answers").notNull(), // JSON array of answers
  score: integer("score"), // percentage
  passed: boolean("passed").default(false),
  attemptNumber: integer("attempt_number").default(1),
  timeSpent: integer("time_spent"), // in minutes
  completedAt: timestamp("completed_at").defaultNow(),
});

// Certificates and achievements
export const certificates = pgTable("certificates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  courseId: varchar("course_id").references(() => courses.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  certificateUrl: text("certificate_url"),
  validUntil: timestamp("valid_until"),
  issuedAt: timestamp("issued_at").defaultNow(),
});

// Resource library
export const resources = pgTable("resources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(), // documentation, template, guide, reference
  type: text("type").notNull(), // pdf, video, link, document
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  authorId: varchar("author_id").references(() => users.id),
  authorName: text("author_name").notNull(),
  tags: text("tags"), // JSON array of tags
  downloadCount: integer("download_count").default(0),
  rating: real("rating").default(0),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas for e-learning tables
export const insertCourseSchema = createInsertSchema(courses).pick({
  title: true,
  description: true,
  category: true,
  difficulty: true,
  duration: true,
  thumbnailUrl: true,
  authorName: true,
  isPublished: true,
  isMandatory: true,
  prerequisites: true,
  tags: true,
});

export const insertLessonSchema = createInsertSchema(lessons).pick({
  courseId: true,
  title: true,
  description: true,
  content: true,
  order: true,
  duration: true,
  videoUrl: true,
  documentUrl: true,
  isRequired: true,
});

export const insertQuizSchema = createInsertSchema(quizzes).pick({
  courseId: true,
  lessonId: true,
  title: true,
  description: true,
  questions: true,
  passingScore: true,
  timeLimit: true,
  allowRetries: true,
  maxAttempts: true,
  isRequired: true,
});

export const insertResourceSchema = createInsertSchema(resources).pick({
  title: true,
  description: true,
  category: true,
  type: true,
  url: true,
  thumbnailUrl: true,
  authorName: true,
  tags: true,
  isPublic: true,
});

// E-learning types
export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type Enrollment = typeof enrollments.$inferSelect;
export type LessonProgress = typeof lessonProgress.$inferSelect;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type Certificate = typeof certificates.$inferSelect;
export type Resource = typeof resources.$inferSelect;
export type InsertResource = z.infer<typeof insertResourceSchema>;

// Forum System Tables

// Forum categories/sections
export const forumCategories = pgTable("forum_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").default("#3B82F6"),
  icon: text("icon").default("💬"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  isModerated: boolean("is_moderated").default(false),
  accessLevel: text("access_level").default("all"), // all, employee, moderator, admin
  moderatorIds: text("moderator_ids"), // JSON array of user IDs
  createdAt: timestamp("created_at").defaultNow(),
});

// Forum topics/discussions
export const forumTopics = pgTable("forum_topics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id").references(() => forumCategories.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  authorId: varchar("author_id").references(() => users.id).notNull(),
  authorName: text("author_name").notNull(),
  isPinned: boolean("is_pinned").default(false),
  isLocked: boolean("is_locked").default(false),
  isAnnouncement: boolean("is_announcement").default(false),
  viewCount: integer("view_count").default(0),
  replyCount: integer("reply_count").default(0),
  lastReplyAt: timestamp("last_reply_at"),
  lastReplyBy: varchar("last_reply_by").references(() => users.id),
  lastReplyByName: text("last_reply_by_name"),
  tags: text("tags"), // JSON array of tags
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Forum posts/replies
export const forumPosts = pgTable("forum_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  topicId: varchar("topic_id").references(() => forumTopics.id).notNull(),
  categoryId: varchar("category_id").references(() => forumCategories.id).notNull(),
  authorId: varchar("author_id").references(() => users.id).notNull(),
  authorName: text("author_name").notNull(),
  content: text("content").notNull(),
  isFirstPost: boolean("is_first_post").default(false), // Original topic post
  parentPostId: varchar("parent_post_id"), // For threaded replies - self-reference handled separately
  likeCount: integer("like_count").default(0),
  isEdited: boolean("is_edited").default(false),
  editedAt: timestamp("edited_at"),
  editedBy: varchar("edited_by").references(() => users.id),
  isDeleted: boolean("is_deleted").default(false),
  deletedAt: timestamp("deleted_at"),
  deletedBy: varchar("deleted_by").references(() => users.id),
  attachments: text("attachments"), // JSON array of file URLs
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Forum post likes/reactions
export const forumLikes = pgTable("forum_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").references(() => forumPosts.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  reactionType: text("reaction_type").default("like"), // like, love, laugh, angry, sad
  createdAt: timestamp("created_at").defaultNow(),
});

// Forum user statistics
export const forumUserStats = pgTable("forum_user_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull().unique(),
  postCount: integer("post_count").default(0),
  topicCount: integer("topic_count").default(0),
  likeCount: integer("like_count").default(0),
  reputationScore: integer("reputation_score").default(0),
  badges: text("badges"), // JSON array of earned badges
  joinedAt: timestamp("joined_at").defaultNow(),
  lastActiveAt: timestamp("last_active_at"),
});

// Insert schemas for forum tables
export const insertForumCategorySchema = createInsertSchema(forumCategories).pick({
  name: true,
  description: true,
  color: true,
  icon: true,
  sortOrder: true,
  isActive: true,
  isModerated: true,
  accessLevel: true,
  moderatorIds: true,
});

export const insertForumTopicSchema = createInsertSchema(forumTopics).pick({
  categoryId: true,
  title: true,
  description: true,
  authorId: true,
  authorName: true,
  isPinned: true,
  isLocked: true,
  isAnnouncement: true,
  tags: true,
});

export const insertForumPostSchema = createInsertSchema(forumPosts).pick({
  topicId: true,
  categoryId: true,
  authorId: true,
  authorName: true,
  content: true,
  isFirstPost: true,
  parentPostId: true,
  attachments: true,
});

export const insertForumLikeSchema = createInsertSchema(forumLikes).pick({
  postId: true,
  userId: true,
  reactionType: true,
});

// Forum types
export type ForumCategory = typeof forumCategories.$inferSelect;
export type InsertForumCategory = z.infer<typeof insertForumCategorySchema>;
export type ForumTopic = typeof forumTopics.$inferSelect;
export type InsertForumTopic = z.infer<typeof insertForumTopicSchema>;
export type ForumPost = typeof forumPosts.$inferSelect;
export type InsertForumPost = z.infer<typeof insertForumPostSchema>;
export type ForumLike = typeof forumLikes.$inferSelect;
export type InsertForumLike = z.infer<typeof insertForumLikeSchema>;
export type ForumUserStats = typeof forumUserStats.$inferSelect;
