import { parse } from "@std/path";

const emojis: string[] = [];

for await (const entry of Deno.readDir("public/emoji")) {
	if (entry.isFile) {
		emojis.push(parse(entry.name).name);
	}
}

await Deno.mkdir("public/.well-known", { recursive: true });
await Deno.writeTextFile(
	"public/.well-known/emojis.json",
	JSON.stringify({ emojis }, null, 2),
);

console.log(`wrote ${emojis.length} emojis`);
