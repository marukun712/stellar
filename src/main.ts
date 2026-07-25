import {
	CompositeDidDocumentResolver,
	LocalActorResolver,
	PlcDidDocumentResolver,
	WebDidDocumentResolver,
	XrpcHandleResolver,
} from "@atcute/identity-resolver";
import {
	configureOAuth,
	finalizeAuthorization,
	getSession,
	listStoredSessions,
	OAuthUserAgent,
} from "@atcute/oauth-browser-client";
import { LoginForm } from "./components/loginForm.ts";
import { PostView } from "./components/postView.ts";

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

const app = document.getElementById("app");
if (!app) throw new Error("missing #app");

async function init(app: HTMLElement) {
	if (location.hash.includes("state=")) {
		const params = new URLSearchParams(location.hash.slice(1));
		history.replaceState(null, "", location.pathname + location.search);
		const { session } = await finalizeAuthorization(params);
		showPostView(app, new OAuthUserAgent(session));
		return;
	}

	const [did] = listStoredSessions();
	if (did) {
		const session = await getSession(did, { allowStale: true });
		showPostView(app, new OAuthUserAgent(session));
		return;
	}

	app.replaceChildren(new LoginForm());
}

function showPostView(app: HTMLElement, agent: OAuthUserAgent) {
	const el = new PostView();
	el.agent = agent;
	app.replaceChildren(el);
}

init(app).catch((err) => {
	const p = document.createElement("p");
	p.textContent = String(err);
	app.append(p);
});
