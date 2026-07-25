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
	listStoredSessions,
} from "@atcute/oauth-browser-client";
import "./components/login-form.ts";
import "./components/post-view.ts";

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
		await finalizeAuthorization(params);
		app.replaceChildren(document.createElement("post-view"));
		return;
	}

	if (listStoredSessions().length > 0) {
		app.replaceChildren(document.createElement("post-view"));
		return;
	}

	app.replaceChildren(document.createElement("login-form"));
}

init(app).catch((err) => {
	const p = document.createElement("p");
	p.textContent = String(err);
	app.append(p);
});
