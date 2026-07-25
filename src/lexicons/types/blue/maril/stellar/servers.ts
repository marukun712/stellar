import type {} from "@atcute/lexicons";
import type {} from "@atcute/lexicons/ambient";
import * as v from "@atcute/lexicons/validations";

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal("blue.maril.stellar.servers"),
		url: /*#__PURE__*/ v.array(/*#__PURE__*/ v.genericUriString()),
	}),
);
type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}
export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
declare module "@atcute/lexicons/ambient" {
	interface Records {
		"blue.maril.stellar.servers": mainSchema;
	}
}
