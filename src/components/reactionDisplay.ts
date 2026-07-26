import { Client, simpleFetchHandler } from "@atcute/client";
import { isResourceUri, parseResourceUri } from "@atcute/lexicons";
import * as v from "@atcute/lexicons/validations";
import {
	BlueMicrocosmLinksGetBacklinks,
	BlueMicrocosmRepoGetRecordByUri,
} from "@atcute/microcosm";
import {
	BlueMarilStellarReaction,
	BlueMarilStellarServers,
} from "../lexicons/index.ts";

const CONSTELLATION = "https://constellation.microcosm.blue";
const SLINGSHOT = "https://slingshot.microcosm.blue";
const REACTION_COLLECTION = "blue.maril.stellar.reaction";
const SERVERS_COLLECTION = "blue.maril.stellar.servers";
const SERVERS_RKEY = "self";

const constellation = new Client({
	handler: simpleFetchHandler({ service: CONSTELLATION }),
});
const slingshot = new Client({
	handler: simpleFetchHandler({ service: SLINGSHOT }),
});

type ReactionGroup = { emojiUrl: string; count: number };

export class ReactionDisplay extends HTMLElement {
	static observedAttributes = ["post-uri"];

	private _scheduled = false;

	get postUri() {
		return this.getAttribute("post-uri") ?? undefined;
	}

	connectedCallback() {
		this.scheduleLoad();
	}

	attributeChangedCallback() {
		if (this.isConnected) this.scheduleLoad();
	}

	private scheduleLoad() {
		if (this._scheduled) return;
		this._scheduled = true;
		queueMicrotask(() => {
			this._scheduled = false;
			this.load();
		});
	}

	async load() {
		const { postUri } = this;
		if (!postUri || !isResourceUri(postUri)) return;

		const { repo: authorDid } = parseResourceUri(postUri);

		try {
			const groups = await loadReactions(postUri, authorDid);
			renderGroups(this, groups);
		} catch (e) {
			console.log(e);
		}
	}
}

async function loadReactions(
	postUri: string,
	authorDid: string,
): Promise<ReactionGroup[]> {
	if (!isResourceUri(postUri)) return [];

	const backlinksRes = await constellation.call(
		BlueMicrocosmLinksGetBacklinks,
		{
			params: {
				subject: postUri,
				source: `${REACTION_COLLECTION}:subject.uri`,
				limit: 100,
			},
		},
	);
	if (!backlinksRes.ok) return [];

	const { records } = backlinksRes.data;
	if (records.length === 0) return [];

	const allowedBases = await fetchAllowedBases(authorDid);

	const emojiUrls = await Promise.all(
		records.map(async ({ did, collection, rkey }) => {
			const atUri = `at://${did}/${collection}/${rkey}`;
			if (!isResourceUri(atUri)) return null;
			const res = await slingshot.call(BlueMicrocosmRepoGetRecordByUri, {
				params: { at_uri: atUri },
			});
			if (!res.ok) return null;
			const reaction = v.parse(
				BlueMarilStellarReaction.mainSchema,
				res.data.value,
			);
			return reaction.emoji;
		}),
	);

	const counts = new Map<string, number>();
	for (const url of emojiUrls) {
		if (!url) continue;
		if (!allowedBases.some((base) => url.startsWith(base))) continue;
		counts.set(url, (counts.get(url) ?? 0) + 1);
	}

	return Array.from(counts.entries()).map(([emojiUrl, count]) => ({
		emojiUrl,
		count,
	}));
}

async function fetchAllowedBases(authorDid: string): Promise<string[]> {
	const atUri = `at://${authorDid}/${SERVERS_COLLECTION}/${SERVERS_RKEY}`;
	if (!isResourceUri(atUri)) return [];
	const res = await slingshot.call(BlueMicrocosmRepoGetRecordByUri, {
		params: { at_uri: atUri },
	});
	if (!res.ok) return [];
	const servers = v.parse(BlueMarilStellarServers.mainSchema, res.data.value);
	return servers.url.map((url) => (url.endsWith("/") ? url : `${url}/`));
}

function renderGroups(el: HTMLElement, groups: ReactionGroup[]) {
	el.replaceChildren();
	if (groups.length === 0) return;

	const container = document.createElement("div");
	container.style.cssText = "display:flex;flex-wrap:wrap;gap:0.25rem";

	for (const { emojiUrl, count } of groups) {
		const chip = document.createElement("small");
		chip.style.cssText =
			"display:inline-flex;align-items:center;gap:0.25rem;border:1px solid #ccc;border-radius:0.25rem;padding:0.125rem 0.375rem";

		const img = document.createElement("img");
		img.src = emojiUrl;
		img.alt = "";
		img.style.cssText =
			"width:1.25rem;height:1.25rem;object-fit:contain;vertical-align:middle";

		chip.append(img, String(count));
		container.append(chip);
	}

	el.append(container);
}

customElements.define("reaction-display", ReactionDisplay);
