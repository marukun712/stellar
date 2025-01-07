import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { BlueMojiCollectionItem } from "~/generated/api";
import { usePost, useReaction } from "~/state/post";
import { useProfile } from "~/state/profile";
import EmojiRender from "../render/emojiRender";
import { Reaction } from "~/generated/api/types/app/netlify/stellarbsky/getReaction";

export default function ReactionButtons({ cid }: { cid: string }) {
  const post = usePost(cid);
  const profile = useProfile();

  const { reaction, cancelReaction } = useReaction(cid);

  const groupedReactions = new Map();
  post.reactions.forEach((r: Reaction) => {
    const key = r.emojiRef!.rkey + ":" + r.emojiRef!.repo;

    if (!groupedReactions.has(key)) {
      groupedReactions.set(key, { count: 0, group: [] });
    }

    groupedReactions.get(key).count++;
    groupedReactions.get(key).group.push(r);
  });

  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-2">
        {[...groupedReactions.values()].map(({ count, group }) => {
          const emoji: BlueMojiCollectionItem.ItemView = group[0].emoji;

          //自分のしたリアクションをフィルター
          const myReactions = group.filter(
            (r: Reaction) => r.actor.did === profile?.did
          );

          return (
            <Tooltip key={group[0].rkey}>
              <TooltipTrigger>
                <button
                  onClick={() =>
                    myReactions.length > 0
                      ? cancelReaction(myReactions[0])
                      : reaction(
                          group[0].emojiRef!.rkey,
                          group[0].emojiRef!.repo,
                          group[0].emoji,
                          profile!
                        )
                  }
                  className={`relative flex items-center space-x-2 px-2 py-1 rounded-lg text-sm font-medium transition-all ${
                    myReactions.length > 0
                      ? "bg-purple-900 text-white border-2 border-purple-400"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  <p>
                    <EmojiRender
                      cid={group[0].emoji.formats.png_128.ref.$link}
                      repo={group[0].emojiRef!.repo}
                      alt={group[0].emoji.alt}
                    />
                  </p>
                  <span className="ml-1">{count}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center">{emoji.name}</div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
