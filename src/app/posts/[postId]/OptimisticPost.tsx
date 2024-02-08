"use client";

import { startTransition, useOptimistic, useState } from "react";
import { TAddOptimistic } from "@/app/posts/useOptimisticPosts";
import { type Post } from "@/lib/db/schema/posts";
import { cn } from "@/lib/utils";
import usePartySocket from "partysocket/react";

import { Button } from "@/components/ui/button";
import Modal from "@/components/shared/Modal";
import PostForm from "@/components/posts/PostForm";
import { useRouter } from "next/navigation";
import { env } from "@/lib/env.mjs";

export default function OptimisticPost({ post }: { post: Post }) {
  const [open, setOpen] = useState(false);
  const openModal = (_?: Post) => {
    setOpen(true);
  };
  const closeModal = () => setOpen(false);
  const [optimisticPost, setOptimisticPost] = useOptimistic(post);
  const router = useRouter();

  const socket = usePartySocket({
    host: env.NEXT_PUBLIC_PARTYKIT_HOST,
    room: "posts",
    onMessage(event) {
      const newPost = JSON.parse(event.data) as { data: Post };
      console.log(newPost);
      startTransition(() => {
        console.log(newPost.data);
        setOptimisticPost({
          ...newPost.data,
        });
      });
      router.refresh();
    },
  });
  const updatePost: TAddOptimistic = (input) => {
    console.log("updating", input);
    setOptimisticPost({ ...input.data });
  };

  return (
    <div className="m-4">
      <Modal open={open} setOpen={setOpen}>
        <PostForm
          post={post}
          closeModal={closeModal}
          openModal={openModal}
          addOptimistic={updatePost}
          socket={socket}
        />
      </Modal>
      <div className="flex justify-between items-end mb-4">
        <h1 className="font-semibold text-2xl">{post.name}</h1>
        <Button className="" onClick={() => setOpen(true)}>
          Edit
        </Button>
      </div>
      <pre
        className={cn(
          "bg-secondary p-4 rounded-lg break-all text-wrap",
          optimisticPost.id === "optimistic" ? "animate-pulse" : "",
        )}
      >
        {JSON.stringify(optimisticPost, null, 2)}
      </pre>
    </div>
  );
}
