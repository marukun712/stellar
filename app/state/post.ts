import { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import { atomFamily, useRecoilValue, useSetRecoilState } from "recoil";
import { BlueMojiCollectionItem } from "~/generated/api";
import { Reaction } from "~/generated/api/types/blue/maril/stellar/getReaction";
import { useToast } from "~/hooks/use-toast";

export const postState = atomFamily<
  {
    uri: string;
    cid: string;
    isLiked: boolean;
    isReposted: boolean;
    likeCount: number;
    repostCount: number;
    reactions: Reaction[];
    likeUri: string;
    repostUri: string;
  },
  string
>({
  key: "post",
  default: {
    uri: "",
    cid: "",
    isLiked: false,
    isReposted: false,
    likeCount: 0,
    repostCount: 0,
    reactions: [],
    likeUri: "",
    repostUri: "",
  },
});

export const usePost = (id: string) => useRecoilValue(postState(id));
export const useSetPost = (id: string) => useSetRecoilState(postState(id));

export const useLike = (postId: string) => {
  const state = usePost(postId);
  const setState = useSetPost(postId);
  const { toast } = useToast();

  async function like() {
    if (!state.likeUri) {
      //楽観的UI
      setState((prev) => ({
        ...prev,
        isLiked: true,
        likeCount: prev.likeCount + 1,
      }));

      const res = await fetch("/api/like/", {
        method: "POST",
        body: JSON.stringify({ uri: state.uri, cid: state.cid }),
      });

      const json = await res.json();

      if (json.error) {
        toast({
          title: "Error",
          description: json.error,
          variant: "destructive",
        });
      }

      //あとからuriをSet
      setState((prev) => ({
        ...prev,
        likeUri: json.uri,
      }));
      return res;
    }
  }

  async function cancelLike() {
    if (state.likeUri) {
      setState((prev) => ({
        ...prev,
        isLiked: false,
        likeUri: "",
        likeCount: prev.likeCount - 1,
      }));

      const res = await fetch("/api/like/", {
        method: "DELETE",
        body: JSON.stringify({ likeUri: state.likeUri }),
      });

      const json = await res.json();

      if (json.error) {
        toast({
          title: "Error",
          description: json.error,
          variant: "destructive",
        });
      }

      return res;
    }
  }

  return { like, cancelLike };
};

export const useRepost = (postId: string) => {
  const state = usePost(postId);
  const setState = useSetPost(postId);
  const { toast } = useToast();

  async function repost() {
    if (!state.repostUri) {
      //楽観的UI
      setState((prev) => ({
        ...prev,
        isReposted: true,
        repostCount: prev.repostCount + 1,
      }));

      const res = await fetch("/api/repost/", {
        method: "POST",
        body: JSON.stringify({ uri: state.uri, cid: state.cid }),
      });
      const json = await res.json();

      if (json.error) {
        toast({
          title: "Error",
          description: json.error,
          variant: "destructive",
        });
      }

      //あとからuriをSet
      setState((prev) => ({
        ...prev,
        repostUri: json.uri,
      }));

      toast({
        title: "Error",
        description: json.error,
        variant: "destructive",
      });

      toast({
        title: "リポストしました。",
      });
    }
  }

  async function cancelRepost() {
    if (state.repostUri) {
      setState((prev) => ({
        ...prev,
        isReposted: false,
        repostUri: "",
        repostCount: prev.repostCount - 1,
      }));

      const res = await fetch("/api/repost/", {
        method: "DELETE",
        body: JSON.stringify({ repostUri: state.repostUri }),
      });

      const json = await res.json();

      if (json.error) {
        toast({
          title: "Error",
          description: json.error,
          variant: "destructive",
        });
      }

      toast({
        title: "リポストを取り消しました。",
      });
    }
  }

  return { repost, cancelRepost };
};

export const useReaction = (postId: string) => {
  const post = usePost(postId);
  const setState = useSetPost(postId);
  const { toast } = useToast();

  async function reaction(
    rkey: string,
    repo: string,
    emoji: BlueMojiCollectionItem.ItemView,
    actor: ProfileView
  ) {
    const tempId = `temp-${Date.now()}`;

    //楽観的UI
    setState((prev) => ({
      ...prev,
      reactions: [
        ...prev.reactions,
        {
          rkey: tempId,
          subject: {
            uri: post.uri,
            cid: post.cid,
          },
          createdAt: new Date().toISOString(),
          emojiRef: {
            rkey,
            repo,
          },
          emoji,
          actor,
        },
      ],
    }));

    const res = await fetch("/api/reaction/", {
      method: "POST",
      body: JSON.stringify({
        subject: { uri: post.uri, cid: post.cid },
        rkey,
        repo,
      }),
    });

    const json = await res.json();

    if (json.error) {
      toast({
        title: "Error",
        description: json.error,
        variant: "destructive",
      });
    }

    //IDを更新
    setState((prev) => ({
      ...prev,
      reactions: prev.reactions.map((r) =>
        r.id === tempId ? { ...r, rkey: json.rkey } : r
      ),
    }));
  }

  async function cancelReaction(r: Reaction) {
    setState((prev) => ({
      ...prev,
      reactions: prev.reactions.filter((reaction) => reaction.rkey !== r.rkey),
    }));

    const res = await fetch("/api/reaction/", {
      method: "DELETE",
      body: JSON.stringify({
        rkey: r.rkey,
      }),
    });

    const json = await res.json();

    if (json.error) {
      toast({
        title: "Error",
        description: json.error,
        variant: "destructive",
      });
    }
  }
  return { reaction, cancelReaction };
};
