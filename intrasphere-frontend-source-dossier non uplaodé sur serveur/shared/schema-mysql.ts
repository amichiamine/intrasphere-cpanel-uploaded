import { sql } from "drizzle-orm";
import { 
  mysqlTable, 
  varchar, 
  text, 
  timestamp, 
  boolean, 
  int,
  decimal,
  mysqlEnum
} from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = mysqlTable("users", {
  id: varchar("id", { length: 50 }).primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: mysqlEnum("role", ["employee", "admin", "moderator"]).default("employee"),
  avatar: text("avatar"),
  // Extended fields for employee management
  employeeId: varchar("employee_id", { length: 50 }).unique(),
  department: varchar("department", { length: 255 }),
  position: varchar("position", { length: 255 }),
  isActive: boolean("is_active").default(true),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const announcements = mysqlTable("announcements", {
  id: varchar("id", { length: 50 }).primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: mysqlEnum("type", ["info", "important", "event", "formation"]).default("info"),
  authorId: varchar("author_id", { length: 50 }),
  authorName: text("author_name").notNull(),
  imageUrl: text("image_url"),
  icon: varchar("icon", { length: 10 }).default("📢"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  isImportant: boolean("is_important").default(false),
});

export const documents = mysqlTable("documents", {
  id: varchar("id", { length: 50 }).primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: mysqlEnum("category", ["regulation", "policy", "guide", "procedure"]).notNull(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`).notNull(),
  version: varchar("version", { length: 20 }).default("1.0"),
});

export const events = mysqlTable("events", {
  id: varchar("id", { length: 50 }).primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  location: text("location"),
  type: mysqlEnum("type", ["meeting", "training", "social", "other"]).default("meeting"),
  organizerId: varchar("organizer_id", { length: 50 }),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Internal messaging system
export const messages = mysqlTable("messages", {
  id: varchar("id", { length: 50 }).primaryKey(),
  senderId: varchar("sender_id", { length: 50 }).notNull(),
  recipientId: varchar("recipient_id", { length: 50 }).notNull(),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Complaints/Reclamations system
export const complaints = mysqlTable("complaints", {
  id: varchar("id", { length: 50 }).primaryKey(),
  submitterId: varchar("submitter_id", { length: 50 }).notNull(),
  assignedToId: varchar("assigned_to_id", { length: 50 }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: mysqlEnum("type", ["complaint", "suggestion", "technical", "hr", "other"]).default("complaint"),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium"),
  status: mysqlEnum("status", ["open", "in_progress", "resolved", "closed"]).default("open"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

// Training system
export const trainings = mysqlTable("trainings", {
  id: varchar("id", { length: 50 }).primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced"]).default("beginner"),
  duration: int("duration"), // minutes
  instructorId: varchar("instructor_id", { length: 50 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const trainingEnrollments = mysqlTable("training_enrollments", {
  id: varchar("id", { length: 50 }).primaryKey(),
  userId: varchar("user_id", { length: 50 }).notNull(),
  trainingId: varchar("training_id", { length: 50 }).notNull(),
  status: mysqlEnum("status", ["enrolled", "in_progress", "completed", "dropped"]).default("enrolled"),
  progress: decimal("progress", { precision: 5, scale: 2 }).default("0.00"), // 0-100%
  completedAt: timestamp("completed_at"),
  enrolledAt: timestamp("enrolled_at").default(sql`CURRENT_TIMESTAMP`),
});

// Forums system
export const forumCategories = mysqlTable("forum_categories", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  color: varchar("color", { length: 7 }).default("#8B5CF6"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const forumTopics = mysqlTable("forum_topics", {
  id: varchar("id", { length: 50 }).primaryKey(),
  categoryId: varchar("category_id", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  authorId: varchar("author_id", { length: 50 }).notNull(),
  isPinned: boolean("is_pinned").default(false),
  isLocked: boolean("is_locked").default(false),
  viewCount: int("view_count").default(0),
  replyCount: int("reply_count").default(0),
  lastReplyAt: timestamp("last_reply_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const forumPosts = mysqlTable("forum_posts", {
  id: varchar("id", { length: 50 }).primaryKey(),
  topicId: varchar("topic_id", { length: 50 }).notNull(),
  authorId: varchar("author_id", { length: 50 }).notNull(),
  content: text("content").notNull(),
  isEdited: boolean("is_edited").default(false),
  editedAt: timestamp("edited_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const forumLikes = mysqlTable("forum_likes", {
  id: varchar("id", { length: 50 }).primaryKey(),
  userId: varchar("user_id", { length: 50 }).notNull(),
  postId: varchar("post_id", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Permissions system
export const permissions = mysqlTable("permissions", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  module: varchar("module", { length: 100 }), // auth, content, messaging, training, admin
  action: varchar("action", { length: 100 }), // read, write, delete, manage
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const userPermissions = mysqlTable("user_permissions", {
  id: varchar("id", { length: 50 }).primaryKey(),
  userId: varchar("user_id", { length: 50 }).notNull(),
  permissionId: varchar("permission_id", { length: 50 }).notNull(),
  grantedAt: timestamp("granted_at").default(sql`CURRENT_TIMESTAMP`),
  grantedBy: varchar("granted_by", { length: 50 }),
});

// Insert schemas using drizzle-zod
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  createdAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  updatedAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertComplaintSchema = createInsertSchema(complaints).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTrainingSchema = createInsertSchema(trainings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports
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
export type Training = typeof trainings.$inferSelect;
export type InsertTraining = z.infer<typeof insertTrainingSchema>;