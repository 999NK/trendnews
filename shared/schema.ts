import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  hashtag: text("hashtag").notNull(),
  status: text("status").notNull().default("draft"), // draft, under_review, approved, rejected, published
  image_url: text("image_url"), // Database field name
  banner_image_url: text("banner_image_url"),
  content_image_url: text("content_image_url"),
  meta_description: text("meta_description"),
  seo_keywords: text("seo_keywords"),
  published: boolean("published").default(false),
  published_at: timestamp("published_at"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const trendingTopics = pgTable("trending_topics", {
  id: serial("id").primaryKey(),
  hashtag: text("hashtag").notNull(),
  posts: integer("posts").notNull(),
  rank: integer("rank").notNull(),
  status: text("status").notNull().default("queued"), // queued, processing, completed, failed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const systemLogs = pgTable("system_logs", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  type: text("type").notNull(), // success, error, info, warning
  details: json("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTrendingTopicSchema = createInsertSchema(trendingTopics).omit({
  id: true,
  createdAt: true,
});

export const insertSystemLogSchema = createInsertSchema(systemLogs).omit({
  id: true,
  createdAt: true,
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true,
});

// Base type from database
type ArticleBase = typeof articles.$inferSelect;

// Extended type with camelCase fields for frontend compatibility
export type Article = ArticleBase & {
  imageUrl?: string | null;
  bannerImageUrl?: string | null;
  contentImageUrl?: string | null;
  metaDescription?: string | null;
  seoKeywords?: string | null;
  publishedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  // Include snake_case fields for backward compatibility
  banner_image_url?: string | null;
  content_image_url?: string | null;
  image_url?: string | null;
  meta_description?: string | null;
  seo_keywords?: string | null;
  published_at?: Date | null;
  created_at?: Date;
  updated_at?: Date;
};
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type TrendingTopic = typeof trendingTopics.$inferSelect;
export type InsertTrendingTopic = z.infer<typeof insertTrendingTopicSchema>;
export type SystemLog = typeof systemLogs.$inferSelect;
export type InsertSystemLog = z.infer<typeof insertSystemLogSchema>;
export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
