import { parse } from "@std/path";

const emojis: string[] = [];

for await (const entry of Deno.readDir("public/emoji")) {
	if (entry.isFile) {
		emojis.push(parse(entry.name).name);
	}
}

await Deno.writeTextFile(
	"public/emojis.json",
	JSON.stringify({ emojis }, null, 2),
);

console.log(`wrote ${emojis.length} emojis`);
