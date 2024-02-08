import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";

import { getPostById } from "@/lib/api/posts/queries";
import OptimisticPost from "./OptimisticPost";


import { Button } from "@/components/ui/button";
import { ChevronLeftIcon } from "lucide-react";
import Loading from "@/app/loading";


export const revalidate = 0;

export default async function PostPage({
  params,
}: {
  params: { postId: string };
}) {

  return (
    <main className="overflow-auto">
      <Post id={params.postId} />
    </main>
  );
}

const Post = async ({ id }: { id: string }) => {
  
  const { post } = await getPostById(id);
  

  if (!post) notFound();
  return (
    <Suspense fallback={<Loading />}>
      <div className="relative">
        <Button asChild variant="ghost">
          <Link href="/posts">
            <ChevronLeftIcon />
          </Link>
        </Button>
        <OptimisticPost post={post}  />
      </div>
    </Suspense>
  );
};
