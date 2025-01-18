import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { useEffect, useRef } from "react";
import "yet-another-react-lightbox/styles.css";
import { Ellipsis, MessageCircle, Repeat2, Smile } from "lucide-react";
import {
  PostView,
  ReasonPin,
  ReasonRepost,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import { useSetPost } from "~/state/post";
import { RepostButton } from "../buttons/repostButton";
import { LikeButton } from "../buttons/likeButton";
import { Button } from "../ui/button";
import { useEmojiPicker } from "~/state/emojiPicker";
import { Reaction } from "~/generated/api/types/blue/maril/stellar/getReactions";
import ReactionButtons from "../buttons/reactionButtons";
import FacetRender from "../render/facetRender";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { useProfile } from "~/state/profile";
import { useToast } from "~/hooks/use-toast";
import EmbedRender from "../render/embedRender";

interface PostProps {
  post: PostView;
  reason?: ReasonRepost | ReasonPin | { [k: string]: unknown; $type: string };
  reactions?: Reaction[];
}

export default function Post({ post, reason, reactions }: PostProps) {
  const setState = useSetPost(post.cid);
  const myProfile = useProfile();
  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setState({
      uri: post.uri,
      cid: post.cid,
      isReposted: post.viewer?.repost ? true : false,
      isLiked: post.viewer?.like ? true : false,
      repostCount: post.repostCount ?? 0,
      likeCount: post.likeCount ?? 0,
      reactions: reactions ?? [],
      likeUri: post.viewer?.like ?? "",
      repostUri: post.viewer?.repost ?? "",
    });
  }, [post, setState, reactions]);

  const { toggleEmojiPicker } = useEmojiPicker();

  async function deletePost() {
    try {
      const res = await fetch("/api/post/", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postUri: post.uri }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json = await res.json();

      if (json.error) {
        throw new Error(json.error);
      }

      toast({
        title: "成功",
        description: "投稿を削除しました。",
      });
    } catch (err) {
      toast({
        title: "エラー",
        description: "投稿の削除に失敗しました。",
        variant: "destructive",
      });
    }
  }

  if (!post.record) {
    return (
      <Card className="rounded-none border-stone-700 p-4">
        <p>投稿が見つかりません</p>
      </Card>
    );
  }

  return (
    <div>
      <Card ref={cardRef} className="rounded-none border-stone-700">
        <CardHeader>
          {reason?.by && reason.by.displayName ? (
            <h1 className="font-bold flex">
              <Repeat2 className="mx-3" />
              <h1>{reason.by.displayName + "がリポスト"}</h1>
            </h1>
          ) : (
            ""
          )}

          <div className="flex justify-between">
            <a
              href={`/user/${post.author.handle}/posts`}
              className="hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center space-x-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={post.author.avatar}
                    alt={post.author.displayName}
                  />
                  <AvatarFallback>
                    {post.author.displayName?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">
                    {post.author.displayName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    @{post.author.handle}
                  </p>
                </div>
              </div>
            </a>
            <div>
              {post.author.did === myProfile?.did && (
                <Dialog>
                  <DialogTrigger>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Ellipsis />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>投稿を削除する</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>本当に削除しますか?</DialogTitle>
                      <DialogDescription>
                        この操作を取り消すことはできません。
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-start">
                      <DialogClose>
                        <Button
                          className="bg-red-500 text-white"
                          onClick={deletePost}
                        >
                          削除
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <FacetRender
            text={post.record.text as string}
            facets={post.record.facets}
          />

          {post.embed && (
            <div className="mt-2">
              <EmbedRender content={post.embed} />
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col pt-2 space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <RepostButton post={post} />

              <a href={`/thread?uri=${post.uri}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:text-blue-500 hover:bg-blue-50"
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  <span className="text-xs">{post.replyCount ?? 0}</span>
                </Button>
              </a>

              <LikeButton post={post} />
            </div>
          </div>

          {reactions && (
            <div className="flex flex-wrap items-center gap-4 mt-2 pickerOpen">
              <ReactionButtons cid={post.cid} />

              <button
                onClick={() =>
                  toggleEmojiPicker(post.uri, post.cid, cardRef.current!)
                }
                className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Smile className="w-4 h-4" />
              </button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
