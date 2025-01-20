import {
  FeedViewPost,
  PostView,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import { ReactionXrpc } from "../reaction/reactionXrpc";
import { FeedViewPostWithReaction } from "~/components/timeline/timeline";

//feedにリアクションデータをつけて返す
export default async function feedWithReaction(
  feed: FeedViewPost[] | PostView[]
): Promise<FeedViewPostWithReaction[]> {
  const xrpc = new ReactionXrpc();

  const data = await Promise.all(
    feed.map(async (item: FeedViewPost | PostView) => {
      if (item.post) {
        const post = item as FeedViewPost;

        const reactions = await xrpc.getReactions(
          post.post.uri,
          post.post.cid,
          50
        );

        const result: FeedViewPostWithReaction = {
          ...post,
          reactions: reactions.data.reactions ?? [],
        };

        return result;
      } else {
        const post = item as PostView;
        const reactions = await xrpc.getReactions(post.uri, post.cid, 50);

        const result: FeedViewPostWithReaction = {
          post: post,
          reactions: reactions.data.reactions ?? [],
        };

        return result;
      }
    })
  );

  return data;
}
