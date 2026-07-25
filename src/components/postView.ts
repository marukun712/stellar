import { parseCanonicalResourceUri } from "@atcute/lexicons/syntax";
import * as v from "@atcute/lexicons/validations";
import type { OAuthUserAgent } from "@atcute/oauth-browser-client";
import { ServerSettings } from "./serverSettings.ts";

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

		form.append(label, button);
		article.append(h1, form, error);

		const settings = new ServerSettings();
		settings.agent = this.agent;

		main.append(article, settings);
		this.append(main);

		form.addEventListener("submit", (e) => {
			e.preventDefault();
			try {
				parseCanonicalResourceUri(input.value.trim());
				const uri = v.parse(v.resourceUriString(), input.value.trim());
				location.href = `post.html?uri=${encodeURIComponent(uri)}`;
			} catch (err) {
				error.textContent = String(err);
			}
		});
	}
}

customElements.define("post-view", PostView);
