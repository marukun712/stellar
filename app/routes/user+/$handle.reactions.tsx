import { useOutletContext } from "@remix-run/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScroll from "react-infinite-scroll-component";
import EmojiRender from "~/components/render/emojiRender";
import Post from "~/components/timeline/post";
import Loading from "~/components/ui/loading";
import { ComAtprotoRepoStrongRef } from "@atproto/api";
import { Reaction } from "~/generated/api/types/blue/maril/stellar/getReactions";
import { FeedViewPostWithReaction } from "~/components/timeline/timeline";

export default function Reactions() {
  const { did } = useOutletContext<{ did: string; error: string }>();

  const { data, fetchNextPage, hasNextPage, isLoading, isError } =
    useInfiniteQuery({
      queryKey: ["actorReactions"],
      queryFn: async ({ pageParam }) => {
        let endpoint;

        if (pageParam) {
          endpoint = `/api/getActorReactions?cursor=${pageParam}&did=${did}`;
        } else {
          endpoint = `/api/getActorReactions?did=${did}`;
        }

        const res = await fetch(endpoint);

        const reactions = await res.json();

        return reactions;
      },
      initialPageParam: null,
      getNextPageParam: (lastPage) => lastPage.cursor,
    });

  const posts = data ? data.pages.flatMap((page) => page.feed ?? []) : [];

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <h1 className="text-center">
        リアクションを取得中にエラーが発生しました。
      </h1>
    );
  }

  if (posts.length === 0) {
    return (
      <h1 className="text-center">リアクションが見つかりませんでした。</h1>
    );
  }

  return (
    <InfiniteScroll
      dataLength={posts.length}
      next={() => fetchNextPage()}
      hasMore={!!hasNextPage}
      loader={<Loading />}
    >
      <div className="space-y-4">
        {posts.map(
          (data: {
            post: FeedViewPostWithReaction;
            subject: ComAtprotoRepoStrongRef.Main;
            reaction: Reaction;
          }) => (
            <div key={data.post.post.cid}>
              <div className="space-y-4">
                <div key={data.post.post.cid}>
                  {data.reaction?.emoji.formats.png_128?.ref.$link && (
                    <div>
                      <div className="py-4">
                        <EmojiRender
                          cid={data.reaction.emoji.formats.png_128.ref.$link}
                          repo={data.reaction.emojiRef!.repo}
                          name={data.reaction.emoji.name}
                        />
                      </div>
                      <Post
                        post={data.post.post}
                        reactions={data.post.reactions}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </InfiniteScroll>
  );
}
