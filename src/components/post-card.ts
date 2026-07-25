export interface PostView {
	uri: string;
	author: { displayName?: string; handle: string; avatar?: string };
	record: { text: string; createdAt: string };
}

class PostCard extends HTMLElement {
	set post(value: PostView) {
		this.replaceChildren();

		const article = document.createElement("article");

		const header = document.createElement("header");
		header.style.cssText = "display:flex;align-items:center;gap:0.75rem";

		if (value.author.avatar) {
			const img = document.createElement("img");
			img.src = value.author.avatar;
			img.alt = value.author.handle;
			img.style.cssText =
				"width:3rem;height:3rem;border-radius:50%;object-fit:cover;flex-shrink:0";
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

		const body = document.createElement("p");
		body.textContent = value.record.text;
		article.append(body);

		const footer = document.createElement("footer");
		const time = document.createElement("time");
		time.dateTime = value.record.createdAt;
		time.textContent = new Date(value.record.createdAt).toLocaleString();
		footer.append(time);
		article.append(footer);

		this.append(article);
	}
}

customElements.define("post-card", PostCard);
