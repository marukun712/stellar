import {
	ComAtprotoRepoGetRecord,
	ComAtprotoRepoPutRecord,
} from "@atcute/atproto";
import { Client } from "@atcute/client";
import * as v from "@atcute/lexicons/validations";
import type { OAuthUserAgent } from "@atcute/oauth-browser-client";
import { BlueMarilStellarServers } from "../lexicons/index.ts";

const COLLECTION = "blue.maril.stellar.servers";
const RKEY = "self";

export class ServerSettings extends HTMLElement {
	agent?: OAuthUserAgent;

	async connectedCallback() {
		const article = document.createElement("article");

		const h2 = document.createElement("h2");
		h2.textContent = "Server Settings";
		article.append(h2);

		const table = document.createElement("table");
		const thead = document.createElement("thead");
		const headerRow = document.createElement("tr");
		const thUrl = document.createElement("th");
		thUrl.textContent = "URL";
		const thAction = document.createElement("th");
		thAction.textContent = "Action";
		headerRow.append(thUrl, thAction);
		thead.append(headerRow);
		const tbody = document.createElement("tbody");
		table.append(thead, tbody);

		const form = document.createElement("form");
		const error = document.createElement("p");
		article.append(table, form, error);
		this.append(article);

		const label = document.createElement("label");
		label.textContent = "URL";
		const input = document.createElement("input");
		input.type = "url";
		input.placeholder = "https://example.com";
		input.required = true;
		label.append(input);

		const button = document.createElement("button");
		button.type = "submit";
		button.textContent = "Add";
		form.append(label, button);

		let urls: string[] = [];

		form.addEventListener("submit", async (e) => {
			e.preventDefault();
			const { agent } = this;
			if (!agent) return;
			button.setAttribute("aria-busy", "true");
			error.textContent = "";

			try {
				const next = [...urls, input.value.trim()];
				await saveUrls(agent, next);
				urls.push(input.value.trim());
				input.value = "";
				renderList(tbody, urls, agent, error);
			} catch (err) {
				error.textContent = String(err);
			} finally {
				button.removeAttribute("aria-busy");
			}
		});

		const { agent } = this;
		if (!agent) return;
		urls = await fetchUrls(agent);
		renderList(tbody, urls, agent, error);
	}
}

async function fetchUrls(agent: OAuthUserAgent): Promise<string[]> {
	const client = new Client({ handler: agent });
	const res = await client.call(ComAtprotoRepoGetRecord, {
		params: { repo: agent.sub, collection: COLLECTION, rkey: RKEY },
	});
	if (!res.ok) {
		if (res.status === 404) return [];
		throw new Error(`HTTP ${res.status}`);
	}
	const record = v.parse(BlueMarilStellarServers.mainSchema, res.data.value);
	return record.url;
}

async function saveUrls(agent: OAuthUserAgent, urls: string[]): Promise<void> {
	const client = new Client({ handler: agent });
	const res = await client.call(ComAtprotoRepoPutRecord, {
		params: {},
		input: {
			repo: agent.sub,
			collection: COLLECTION,
			rkey: RKEY,
			record: { $type: COLLECTION, url: urls },
		},
	});
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

function renderList(
	tbody: HTMLTableSectionElement,
	urls: string[],
	agent: OAuthUserAgent,
	error: HTMLParagraphElement,
) {
	tbody.replaceChildren();
	for (const url of urls) {
		const tr = document.createElement("tr");
		const tdUrl = document.createElement("td");
		tdUrl.textContent = url;

		const tdAction = document.createElement("td");
		const del = document.createElement("button");
		del.type = "button";
		del.textContent = "Delete";
		del.addEventListener("click", async () => {
			error.textContent = "";
			try {
				const next = urls.filter((u) => u !== url);
				await saveUrls(agent, next);
				urls.splice(urls.indexOf(url), 1);
				renderList(tbody, urls, agent, error);
			} catch (err) {
				error.textContent = String(err);
			}
		});

		tdAction.append(del);
		tr.append(tdUrl, tdAction);
		tbody.append(tr);
	}
}

customElements.define("server-settings", ServerSettings);
