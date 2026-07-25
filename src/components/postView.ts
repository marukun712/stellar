import { AppBskyFeedGetPosts, AppBskyFeedPost } from "@atcute/bluesky";
import { Client, ok, simpleFetchHandler } from "@atcute/client";
import { parseCanonicalResourceUri } from "@atcute/lexicons/syntax";
import * as v from "@atcute/lexicons/validations";
import type { OAuthUserAgent } from "@atcute/oauth-browser-client";
import { PostCard } from "./postCard.ts";
import { ServerSettings } from "./serverSettings.ts";

const publicClient = new Client({
	handler: simpleFetchHandler({ service: "https://public.api.bsky.app" }),
});

export class PostView extends HTMLElement {
	agent?: OAuthUserAgent;

	connectedCallback() {
		const main = document.createElement("main");
		const article = document.createElement("article");

		const h1 = document.createElement("h1");
		h1.textContent = "Stellar";

		const form = document.createElement("form");

		const label = document.createElement("label");
		label.textContent = "AT URI";

		const input = document.createElement("input");
		input.type = "text";
		input.placeholder = "at://did:plc:.../app.bsky.feed.post/...";
		input.required = true;
		label.append(input);

		const button = document.createElement("button");
		button.type = "submit";
		button.textContent = "Fetch";

		const error = document.createElement("p");
		const result = document.createElement("div");

		form.append(label, button);
		article.append(h1, form, error, result);

		const settings = new ServerSettings();
		settings.agent = this.agent;

		main.append(article, settings);
		this.append(main);

		form.addEventListener("submit", async (e) => {
			e.preventDefault();
			button.setAttribute("aria-busy", "true");
			error.textContent = "";
			result.replaceChildren();

			try {
				parseCanonicalResourceUri(input.value.trim());
				const uri = v.parse(v.resourceUriString(), input.value.trim());

				const { posts } = await ok(
					publicClient.call(AppBskyFeedGetPosts, {
						params: { uris: [uri] },
					}),
				);
				if (!posts.length) throw new Error("Post not found.");

				const postView = posts[0];
				const record = v.parse(AppBskyFeedPost.mainSchema, postView.record);

				const card = new PostCard();
				card.post = { uri: postView.uri, author: postView.author, record };
				result.append(card);
			} catch (err) {
				error.textContent = String(err);
			} finally {
				button.removeAttribute("aria-busy");
			}
		});
	}
}

customElements.define("post-view", PostView);
