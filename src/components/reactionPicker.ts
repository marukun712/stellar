import {
	ComAtprotoRepoCreateRecord,
	ComAtprotoRepoGetRecord,
} from "@atcute/atproto";
import { Client } from "@atcute/client";
import * as v from "@atcute/lexicons/validations";
import type { OAuthUserAgent } from "@atcute/oauth-browser-client";
import { BlueMarilStellarServers } from "../lexicons/index.ts";

const SERVERS_COLLECTION = "blue.maril.stellar.servers";
const SERVERS_RKEY = "self";
const REACTION_COLLECTION = "blue.maril.stellar.reaction";

type EmojiEntry = { name: string; imageUrl: string };

export class ReactionPicker extends HTMLElement {
	agent?: OAuthUserAgent;
	postUri?: string;
	postCid?: string;

	connectedCallback() {
		const button = document.createElement("button");
		button.type = "button";
		button.textContent = "React";

		const dialog = document.createElement("dialog");

		const grid = document.createElement("article");
		grid.style.cssText = "display:flex;flex-wrap:wrap;gap:0.25rem";

		const error = document.createElement("p");

		dialog.append(grid, error);
		this.append(button, dialog);

		dialog.addEventListener("click", (e) => {
			if (e.target === dialog) dialog.close();
		});

		button.addEventListener("click", async () => {
			const { agent, postUri, postCid } = this;
			if (!agent || !postUri || !postCid) return;
			button.setAttribute("aria-busy", "true");
			error.textContent = "";
			try {
				const emojis = await fetchAllEmojis(agent);
				renderGrid(grid, emojis, async (emojiUrl) => {
					dialog.close();
					await createReaction(agent, postUri, postCid, emojiUrl);
				});
				dialog.showModal();
			} catch (err) {
				error.textContent = String(err);
			} finally {
				button.removeAttribute("aria-busy");
			}
		});
	}
}

async function fetchAllEmojis(agent: OAuthUserAgent): Promise<EmojiEntry[]> {
	const urls = await fetchServerUrls(agent);
	const results = await Promise.all(urls.map(fetchEmojisFromServer));
	return results.flat();
}

async function fetchServerUrls(agent: OAuthUserAgent): Promise<string[]> {
	const client = new Client({ handler: agent });
	const res = await client.call(ComAtprotoRepoGetRecord, {
		params: {
			repo: agent.sub,
			collection: SERVERS_COLLECTION,
			rkey: SERVERS_RKEY,
		},
	});
	if (!res.ok) {
		if (res.status === 404) return [];
		throw new Error(`HTTP ${res.status}`);
	}
	const record = v.parse(BlueMarilStellarServers.mainSchema, res.data.value);
	return record.url;
}

async function fetchEmojisFromServer(serverUrl: string): Promise<EmojiEntry[]> {
	const base = serverUrl.endsWith("/") ? serverUrl : `${serverUrl}/`;
	const emojiListUrl = new URL("emojis.json", base).href;
	const res = await fetch(emojiListUrl);
	if (!res.ok) throw new Error(`Failed to fetch emoji list from ${serverUrl}`);
	const data: { emojis: string[] } = await res.json();
	return data.emojis.map((name) => ({
		name,
		imageUrl: new URL(`emoji/${name}.png`, base).href,
	}));
}

function renderGrid(
	grid: HTMLElement,
	emojis: EmojiEntry[],
	onSelect: (emojiUrl: string) => void,
) {
	grid.replaceChildren();
	for (const emoji of emojis) {
		const btn = document.createElement("button");
		btn.type = "button";
		btn.title = emoji.name;
		btn.style.cssText =
			"background:none;border:none;padding:0.25rem;cursor:pointer;border-radius:0.25rem";
		const img = document.createElement("img");
		img.src = emoji.imageUrl;
		img.alt = emoji.name;
		img.style.cssText =
			"width:2rem;height:2rem;object-fit:contain;display:block";
		btn.append(img);
		btn.addEventListener("click", () => onSelect(emoji.imageUrl));
		grid.append(btn);
	}
}

async function createReaction(
	agent: OAuthUserAgent,
	postUri: string,
	postCid: string,
	emojiUrl: string,
) {
	const client = new Client({ handler: agent });
	const res = await client.call(ComAtprotoRepoCreateRecord, {
		params: {},
		input: {
			repo: agent.sub,
			collection: REACTION_COLLECTION,
			record: {
				$type: REACTION_COLLECTION,
				subject: { uri: postUri, cid: postCid },
				createdAt: new Date().toISOString(),
				emoji: emojiUrl,
			},
		},
	});
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

customElements.define("reaction-picker", ReactionPicker);
