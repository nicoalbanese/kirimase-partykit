import { db } from "@/lib/db/index";
import { asc, desc, eq } from "drizzle-orm";
import { type PostId, postIdSchema, posts } from "@/lib/db/schema/posts";

export const getPosts = async () => {
  const p = await db.select().from(posts).orderBy(asc(posts.createdAt));
  return { posts: p };
};

export const getPostById = async (id: PostId) => {
  const { id: postId } = postIdSchema.parse({ id });
  const [p] = await db.select().from(posts).where(eq(posts.id, postId));
  return { post: p };
};
