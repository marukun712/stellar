import { parseCanonicalResourceUri } from "@atcute/lexicons/syntax";
import type { PostView as PostViewData } from "./post-card.ts";
import "./post-card.ts";

class PostView extends HTMLElement {
	connectedCallback() {
		const main = document.createElement("main");
		const article = document.createElement("article");

		const h1 = document.createElement("h1");
		h1.textContent = "stellar";

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
		main.append(article);
		this.append(main);

		form.addEventListener("submit", async (e) => {
			e.preventDefault();
			button.setAttribute("aria-busy", "true");
			error.textContent = "";
			result.replaceChildren();

			try {
				parseCanonicalResourceUri(input.value.trim());

				const qs = new URLSearchParams({ uris: input.value.trim() });
				const res = await fetch(
					`https://public.api.bsky.app/xrpc/app.bsky.feed.getPosts?${qs}`,
				);
				if (!res.ok) throw new Error(`HTTP ${res.status}`);

				const { posts } = await res.json();
				if (!posts?.length) throw new Error("Post not found.");

				const card = document.createElement("post-card") as HTMLElement & {
					post: PostViewData;
				};
				card.post = posts[0];
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
