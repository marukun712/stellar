import { ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import { OutputSchema } from "@atproto/api/dist/client/types/app/bsky/feed/getAuthorFeed";

export type Session = { did: string };

export type ProfileData = {
  profile: ProfileViewDetailed;
  avatarUrl: string | null;
  posts: OutputSchema;
};

export type PostType = {
  post: {
    cid: string;
    author: {
      avatar?: string;
      displayName: string;
      handle: string;
    };
    record: {
      text: string;
    };
  };
};
