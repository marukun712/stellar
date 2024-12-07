import { Reaction } from "@prisma/client";
import { ProfileView } from "~/generated/api/types/app/bsky/actor/defs";
import { FeedViewPost } from "~/generated/api/types/app/bsky/feed/defs";

export type Session = { did: string };

export type TimelineOptions = {
  id: string;
  type: "home" | "user";
  did: string | null;
};

export type DataWithCursor = {
  data: any[];
  cursor: string | undefined;
};

export type Cursor = {
  id: string;
  cursor: string;
};

export type toggleEmojiPicker = (
  postId: string,
  uri: string,
  cid: string,
  element: HTMLDivElement
) => void;

export type ReactionData = { reaction: Reaction; author: ProfileView };

export type PostData = {
  reaction: ReactionData[];
  post: FeedViewPost;
};

export type UserData = {
  profile: ProfileView;
  avatarUrl: string;
  follow: DataWithCursor;
  follower: DataWithCursor;
};
