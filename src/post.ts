import { AppBskyFeedGetPosts } from "@atcute/bluesky";
import { Client, ok, simpleFetchHandler } from "@atcute/client";
import {
	CompositeDidDocumentResolver,
	LocalActorResolver,
	PlcDidDocumentResolver,
	WebDidDocumentResolver,
	XrpcHandleResolver,
} from "@atcute/identity-resolver";
import { isResourceUri } from "@atcute/lexicons";
import {
	configureOAuth,
	finalizeAuthorization,
	getSession,
	listStoredSessions,
	OAuthUserAgent,
} from "@atcute/oauth-browser-client";
import { PostCard } from "./components/postCard.ts";

configureOAuth({
	metadata: {
		client_id: import.meta.env.VITE_OAUTH_CLIENT_ID,
		redirect_uri: import.meta.env.VITE_OAUTH_REDIRECT_URI,
	},
	identityResolver: new LocalActorResolver({
		handleResolver: new XrpcHandleResolver({
			serviceUrl: "https://public.api.bsky.app",
		}),
		didDocumentResolver: new CompositeDidDocumentResolver({
			methods: {
				plc: new PlcDidDocumentResolver(),
				web: new WebDidDocumentResolver(),
			},
		}),
	}),
});

const publicClient = new Client({
	handler: simpleFetchHandler({ service: "https://public.api.bsky.app" }),
});

const app = document.getElementById("app");
if (!app) throw new Error("missing #app");

async function init(app: HTMLElement) {
	if (location.hash.includes("state=")) {
		const params = new URLSearchParams(location.hash.slice(1));
		history.replaceState(null, "", location.pathname + location.search);
		const { session } = await finalizeAuthorization(params);
		showPost(app, new OAuthUserAgent(session));
		return;
	}

	const [did] = listStoredSessions();
	if (did) {
		const session = await getSession(did, { allowStale: true });
		showPost(app, new OAuthUserAgent(session));
		return;
	}

	showPost(app, null);
}

async function showPost(app: HTMLElement, agent: OAuthUserAgent | null) {
	const uri = new URLSearchParams(location.search).get("uri");
	if (!uri || !isResourceUri(uri)) {
		const p = document.createElement("p");
		p.textContent = "uri parameter is missing.";
		app.append(p);
		return;
	}

	const main = document.createElement("main");
	const error = document.createElement("p");
	main.append(error);
	app.append(main);

	try {
		const { posts } = await ok(
			publicClient.call(AppBskyFeedGetPosts, {
				params: { uris: [uri] },
			}),
		);
		if (!posts.length) throw new Error("Post not found.");

		const card = new PostCard();
		if (agent) card.agent = agent;
		card.post = posts[0];
		main.append(card);
	} catch (err) {
		error.textContent = String(err);
	}
}

init(app).catch((err) => {
	const p = document.createElement("p");
	p.textContent = String(err);
	app.append(p);
});
