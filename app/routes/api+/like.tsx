import { Agent } from "@atproto/api";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { getSessionAgent } from "~/lib/auth/session";
import { getParams } from "~/utils/getParams";

export const loader: LoaderFunction = async ({ request }) => {
  const agent: Agent | null = await getSessionAgent(request);
  if (agent == null) return new Response(null, { status: 401 });

  try {
    const cursor = getParams(request, "cursor");
    const uri = getParams(request, "uri");

    const likes = await agent.getLikes({
      uri: uri,
      limit: 50,
      cursor: cursor,
    });

    return Response.json(likes);
  } catch (e) {
    console.log(e);

    return new Response(
      JSON.stringify({ error: "いいねの取得に失敗しました。" }),
      {
        status: 500,
      }
    );
  }
};

export const action: ActionFunction = async ({ request }) => {
  const agent: Agent | null = await getSessionAgent(request);
  if (agent == null) return new Response(null, { status: 401 });

  switch (request.method) {
    //いいね
    case "POST": {
      try {
        const body = await request.json();

        const res = await agent.like(body.uri, body.cid);

        return Response.json({ uri: res.uri });
      } catch (e) {
        console.log(e);

        return new Response(
          JSON.stringify({ error: "いいねに失敗しました。" }),
          {
            status: 500,
          }
        );
      }
    }

    //いいね解除
    case "DELETE": {
      try {
        const body = await request.json();

        await agent.deleteLike(body.likeUri);

        return Response.json({ ok: true });
      } catch (e) {
        console.log(e);

        return new Response(
          JSON.stringify({ error: "いいねの取り消しに失敗しました。" }),
          {
            status: 500,
          }
        );
      }
    }
  }
};
