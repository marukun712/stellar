import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ComAtprotoRepoStrongRef from "../../../com/atproto/repo/strongRef.js";

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object(
		{
			"$type": /*#__PURE__*/ v.literal("blue.maril.stellar.reaction"),
			"createdAt": /*#__PURE__*/ v.datetimeString(),
			"emoji": /*#__PURE__*/ v.genericUriString(),
			get "subject"() {
				return ComAtprotoRepoStrongRef.mainSchema
			},
			get "via"() {
				return /*#__PURE__*/ v.optional(ComAtprotoRepoStrongRef.mainSchema)
			},
		}
	)
);
type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}
export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
declare module '@atcute/lexicons/ambient' {
	interface Records {
		"blue.maril.stellar.reaction": mainSchema;
	}
}
