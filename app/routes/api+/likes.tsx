import { Agent } from "@atproto/api";
import { json, LoaderFunction } from "@remix-run/node";
import { getSessionAgent } from "~/utils/auth/session";
import { getParams } from "~/utils/getParams";

export const loader: LoaderFunction = async ({ request }) => {
  const agent: Agent | null = await getSessionAgent(request);
  if (agent == null) return json(null);

  const cursor = getParams(request, "cursor");
  const uri = getParams(request, "uri");

  const likes = await agent.getLikes({
    uri: uri,
    limit: 50,
    cursor: cursor,
  });

  return json({
    data: likes.data.likes,
    cursor: likes.data.cursor,
  });
};
