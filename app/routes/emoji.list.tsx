import { Emoji } from "@prisma/client";
import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { getSessionAgent } from "~/lib/auth/session";
import { prisma } from "~/lib/db/prisma";
import EmojiRender from "~/components/render/emojiRender";
import { Card, CardContent } from "~/components/ui/card";
import { BlueMojiCollectionItem } from "~/generated/api";

export const loader: LoaderFunction = async ({ request }) => {
  const agent = await getSessionAgent(request);
  if (!agent) return redirect("/login");

  const emojis = await prisma.emoji.findMany({
    where: { repo: agent.assertDid },
  });

  return { emojis };
};

export const action: ActionFunction = async ({ request }) => {
  const agent = await getSessionAgent(request);
  if (!agent) return redirect("/login");

  const body = await request.json();

  await agent.com.atproto.repo.deleteRecord({
    collection: "blue.moji.collection.item",
    repo: agent.assertDid,
    rkey: body.rkey,
  });

  return null;
};

export default function EmojiList() {
  const { emojis: initialEmojis } = useLoaderData<typeof loader>();
  const [emojis, setEmojis] = useState<Emoji[]>(initialEmojis);

  const handleDelete = async (rkey: string) => {
    setEmojis((prev: Emoji[]) => prev.filter((emoji) => emoji.rkey !== rkey));

    await fetch("/emoji/list/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rkey }),
    });
  };

  return (
    <Card>
      <CardContent className="p-6 shadow-md rounded-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">
          アップロードしたBluemoji
        </h1>

        {emojis.length === 0 ? (
          <p className="text-center py-8 rounded-lg shadow-sm border border-gray-300">
            Bluemojiがまだありません
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {emojis.map((emoji: Emoji) => {
              const data = JSON.parse(
                emoji.record
              ) as BlueMojiCollectionItem.ItemView;

              return (
                <div
                  key={emoji.rkey}
                  className="flex flex-col items-center justify-center p-4 rounded-lg shadow-md hover:shadow-lg"
                >
                  <EmojiRender
                    cid={data.formats.png_128!.ref.$link}
                    repo={emoji.repo}
                    alt={data.alt!}
                  />
                  <p className="text-center text-sm mt-2">{emoji.rkey}</p>
                  <button
                    onClick={() => handleDelete(emoji.rkey)}
                    className="mt-4 px-4 py-2 text-sm bg-red-500 rounded hover:bg-red-600"
                  >
                    削除
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
