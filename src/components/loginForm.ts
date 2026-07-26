import { isActorIdentifier } from "@atcute/lexicons/syntax";
import { createAuthorizationUrl } from "@atcute/oauth-browser-client";

export class LoginForm extends HTMLElement {
	connectedCallback() {
		const main = document.createElement("main");
		const article = document.createElement("article");

		const h1 = document.createElement("h1");
		h1.textContent = "Stellar";

		const form = document.createElement("form");

		const label = document.createElement("label");
		label.textContent = "Handle";

		const input = document.createElement("input");
		input.type = "text";
		input.placeholder = "user.bsky.social";
		input.required = true;
		label.append(input);

		const button = document.createElement("button");
		button.type = "submit";
		button.textContent = "Sign in";

		const guide = document.createElement("article");
		const span = document.createElement("span");
		const link = document.createElement("a");
		link.href = "./example.html";
		link.textContent = "こちらから";
		span.append(link);
		guide.textContent = "リアクション表示コンポーネントの導入は";
		guide.append(span);

		const error = document.createElement("p");

		form.append(label, button);
		article.append(h1, form, error);
		main.append(article, guide);
		this.append(main);

		form.addEventListener("submit", async (e) => {
			e.preventDefault();
			button.setAttribute("aria-busy", "true");
			error.textContent = "";

			try {
				const identifier = input.value.trim();
				if (!isActorIdentifier(identifier)) throw new Error("Invalid handle.");
				const authUrl = await createAuthorizationUrl({
					target: { type: "account", identifier },
					scope: "atproto transition:generic",
				});
				await new Promise((r) => setTimeout(r, 200));
				location.assign(authUrl);
			} catch (err) {
				error.textContent = String(err);
				button.removeAttribute("aria-busy");
			}
		});
	}
}

customElements.define("login-form", LoginForm);
