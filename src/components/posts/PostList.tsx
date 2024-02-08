"use client";

import { startTransition, useState } from "react";
import Link from "next/link";

import { Action, cn } from "@/lib/utils";
import { type Post, CompletePost } from "@/lib/db/schema/posts";
import Modal from "@/components/shared/Modal";
import usePartySocket from "partysocket/react";

import { useOptimisticPosts } from "@/app/posts/useOptimisticPosts";
import { Button } from "@/components/ui/button";
import PostForm from "./PostForm";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { env } from "@/lib/env.mjs";

type TOpenModal = (post?: Post) => void;

export default function PostList({
  posts: initialPosts,
}: {
  posts: CompletePost[];
}) {
  const [posts, setPosts] = useState();
  const { optimisticPosts, addOptimisticPost } =
    useOptimisticPosts(initialPosts);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [activePost, setActivePost] = useState<Post | null>(null);
  const openModal = (post?: Post) => {
    setOpen(true);
    post ? setActivePost(post) : setActivePost(null);
  };
  const closeModal = () => setOpen(false);

  const socket = usePartySocket({
    host: env.NEXT_PUBLIC_PARTYKIT_HOST,
    room: "posts",
    onMessage(event) {
      const newPost = JSON.parse(event.data) as { data: Post; action: Action };
      console.log(newPost);
      startTransition(() => {
        addOptimisticPost(newPost);
      });
      router.refresh();
    },
  });

  return (
    <div>
      <Modal
        open={open}
        setOpen={setOpen}
        title={activePost ? "Edit Post" : "Create Posts"}
      >
        <PostForm
          post={activePost}
          addOptimistic={addOptimisticPost}
          openModal={openModal}
          closeModal={closeModal}
          socket={socket}
        />
      </Modal>
      <div className="absolute right-0 top-0 ">
        <Button onClick={() => openModal()} variant={"outline"}>
          +
        </Button>
      </div>
      {optimisticPosts.length === 0 ? (
        <EmptyState openModal={openModal} />
      ) : (
        <ul>
          {optimisticPosts.map((post) => (
            <Post post={post} key={post.id} openModal={openModal} />
          ))}
        </ul>
      )}
    </div>
  );
}

const Post = ({
  post,
  openModal,
}: {
  post: CompletePost;
  openModal: TOpenModal;
}) => {
  const optimistic = post.id === "optimistic";
  const deleting = post.id === "delete";
  const mutating = optimistic || deleting;
  return (
    <li
      className={cn(
        "flex justify-between my-2",
        mutating ? "opacity-30 animate-pulse" : "",
        deleting ? "text-destructive" : "",
      )}
    >
      <div className="w-full">
        <div>{post.name}</div>
      </div>
      <Button variant={"link"} asChild>
        <Link href={"/posts/" + post.id}>Edit</Link>
      </Button>
    </li>
  );
};

const EmptyState = ({ openModal }: { openModal: TOpenModal }) => {
  return (
    <div className="text-center">
      <h3 className="mt-2 text-sm font-semibold text-secondary-foreground">
        No posts
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get started by creating a new post.
      </p>
      <div className="mt-6">
        <Button onClick={() => openModal()}>
          <PlusIcon className="h-4" /> New Posts{" "}
        </Button>
      </div>
    </div>
  );
};
