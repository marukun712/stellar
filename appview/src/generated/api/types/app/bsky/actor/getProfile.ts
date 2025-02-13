/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { HeadersMap, XRPCError } from "@atproto/xrpc";
import { ValidationResult, BlobRef } from "@atproto/lexicon";
import { isObj, hasProp } from "../../../../util.js";
import { lexicons } from "../../../../lexicons.js";
import { CID } from "multiformats/cid";
import * as AppBskyActorDefs from "./defs.js";

export interface QueryParams {
  /** Handle or DID of account to fetch profile of. */
  actor: string;
}

export type InputSchema = undefined;
export type OutputSchema = AppBskyActorDefs.ProfileViewDetailed;

export interface CallOptions {
  signal?: AbortSignal;
  headers?: HeadersMap;
}

export interface Response {
  success: boolean;
  headers: HeadersMap;
  data: OutputSchema;
}

export function toKnownErr(e: any) {
  return e;
}
