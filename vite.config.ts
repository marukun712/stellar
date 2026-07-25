import { defineConfig } from "vite";
import metadata from "./public/oauth-client-metadata.json" with {
	type: "json",
};

const SERVER_HOST = "127.0.0.1";
const SERVER_PORT = 5173;

export default defineConfig({
	base: "/stellar/",
	server: { host: SERVER_HOST, port: SERVER_PORT },
	build: {
		rollupOptions: {
			input: {
				main: "index.html",
				post: "post.html",
			},
		},
	},
	plugins: [
		{
			name: "oauth-envs",
			config(_conf, { command }) {
				if (command === "build") {
					Deno.env.set("VITE_OAUTH_CLIENT_ID", metadata.client_id);
					Deno.env.set("VITE_OAUTH_REDIRECT_URI", metadata.redirect_uris[0]);
				} else {
					const redirectUri = `http://${SERVER_HOST}:${SERVER_PORT}${
						new URL(metadata.redirect_uris[0]).pathname
					}`;
					Deno.env.set(
						"VITE_OAUTH_CLIENT_ID",
						`http://localhost?redirect_uri=${encodeURIComponent(redirectUri)}` +
							`&scope=${encodeURIComponent(metadata.scope)}`,
					);
					Deno.env.set("VITE_OAUTH_REDIRECT_URI", redirectUri);
				}
				Deno.env.set("VITE_OAUTH_SCOPE", metadata.scope);
			},
		},
	],
});
