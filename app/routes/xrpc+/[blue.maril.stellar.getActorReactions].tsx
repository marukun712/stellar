import { Reaction } from "@prisma/client";
import { LoaderFunction } from "@remix-run/node";
import { BlueMarilStellarGetActorReactions } from "~/generated/api";
import { prisma } from "~/lib/db/prisma";
import { getParams } from "~/utils/getParams";

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const actor = getParams(request, "actor");
    const cursor = getParams(request, "cursor");
    const limit = parseInt(getParams(request, "limit") ?? "50");

    if (!actor) {
      return new Response(
        JSON.stringify({ error: "Missing required parameter: actor" }),
        { status: 400 }
      );
    }

    if (limit < 1 || limit > 100) {
      return new Response(
        JSON.stringify({ error: "Invalid limit: must be between 1 and 100" }),
        { status: 400 }
      );
    }

    let reactions: Reaction[];

    if (cursor) {
      reactions = await prisma.reaction.findMany({
        where: { authorDid: actor },
        cursor: { rkey: cursor },
        take: limit + 1,
        skip: 1,
        orderBy: { rkey: "desc" },
      });
    } else {
      reactions = await prisma.reaction.findMany({
        where: { authorDid: actor },
        take: limit + 1,
        orderBy: { rkey: "desc" },
      });
    }

    const hasMore = reactions.length > limit;
    if (hasMore) {
      reactions.pop();
    }

    //feedの整形
    const feed = await Promise.all(
      reactions.map(async (reaction) => {
        return {
          subject: { uri: reaction.post_uri, cid: reaction.post_cid },
          reaction: {
            rkey: reaction.rkey,
            subject: {
              uri: reaction.post_uri,
              cid: reaction.post_cid,
            },
            createdAt:
              reaction.createdAt?.toISOString() ?? new Date().toISOString(),
            emojiRef: JSON.parse(reaction.record).emoji,
            emoji: JSON.parse(reaction.emoji),
            actor: JSON.parse(reaction.actor).data,
          },
        };
      })
    );

    const response: BlueMarilStellarGetActorReactions.OutputSchema = {
      feed,
      ...(hasMore && { cursor: reactions[reactions.length - 1].rkey }),
    };

    return Response.json(response);
  } catch (error) {
    console.error("Err:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
      }),
      { status: 500 }
    );
  }
};
