import { sql } from "drizzle-orm";
import { varchar, timestamp, pgTable } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { type getPosts } from "@/lib/api/posts/queries";

import { nanoid, timestamps } from "@/lib/utils";


export const posts = pgTable('posts', {
  id: varchar("id", { length: 191 }).primaryKey().$defaultFn(() => nanoid()),
  name: varchar("name", { length: 256 }).notNull(),
    createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`),

});


// Schema for posts - used to validate API requests
const baseSchema = createSelectSchema(posts).omit(timestamps)

export const insertPostSchema = createInsertSchema(posts).omit(timestamps);
export const insertPostParams = baseSchema.extend({}).omit({ 
  id: true
});

export const updatePostSchema = baseSchema;
export const updatePostParams = baseSchema.extend({})
export const postIdSchema = baseSchema.pick({ id: true });

// Types for posts - used to type API request params and within Components
export type Post = typeof posts.$inferSelect;
export type NewPost = z.infer<typeof insertPostSchema>;
export type NewPostParams = z.infer<typeof insertPostParams>;
export type UpdatePostParams = z.infer<typeof updatePostParams>;
export type PostId = z.infer<typeof postIdSchema>["id"];
    
// this type infers the return from getPosts() - meaning it will include any joins
export type CompletePost = Awaited<ReturnType<typeof getPosts>>["posts"][number];

