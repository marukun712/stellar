import type { AppBskyFeedDefs, AppBskyFeedPost } from "@atcute/bluesky";
import type { OAuthUserAgent } from "@atcute/oauth-browser-client";
import { ReactionDisplay } from "./reactionDisplay.ts";
import { ReactionPicker } from "./reactionPicker.ts";

export class PostCard extends HTMLElement {
	agent?: OAuthUserAgent;

	set post(value: AppBskyFeedDefs.PostView) {
		this.replaceChildren();

		const article = document.createElement("article");

		const header = document.createElement("header");
		header.style.cssText = "display:flex;align-items:center;gap:0.75rem";

		if (value.author.avatar) {
			const img = document.createElement("img");
			img.src = value.author.avatar;
			img.alt = value.author.handle;
			img.style.cssText =
				"width:3rem;height:3rem;border-radius:50%;object-fit:cover;";
			header.append(img);
		}

		const hgroup = document.createElement("hgroup");
		const name = document.createElement("p");
		name.textContent = value.author.displayName ?? value.author.handle;
		const handle = document.createElement("p");
		handle.textContent = `@${value.author.handle}`;
		hgroup.append(name, handle);
		header.append(hgroup);
		article.append(header);

		const record = value.record as AppBskyFeedPost.Main;

		const body = document.createElement("p");
		body.textContent = record.text;
		article.append(body);

		const display = new ReactionDisplay();
		display.postUri = value.uri;
		display.authorDid = value.author.did;
		article.append(display);

		const footer = document.createElement("footer");
		footer.style.cssText =
			"display:flex;align-items:center;justify-content:space-between";

		const time = document.createElement("time");
		time.dateTime = record.createdAt;
		time.textContent = new Date(record.createdAt).toLocaleString();
		footer.append(time);

		if (this.agent) {
			const picker = new ReactionPicker();
			picker.agent = this.agent;
			picker.postUri = value.uri;
			picker.postCid = value.cid;
			footer.append(picker);
		}

		article.append(footer);

		this.append(article);
	}
}

customElements.define("post-card", PostCard);
