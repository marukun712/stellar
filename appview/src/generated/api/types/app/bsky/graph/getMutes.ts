/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { HeadersMap, XRPCError } from "@atproto/xrpc";
import { ValidationResult, BlobRef } from "@atproto/lexicon";
import { isObj, hasProp } from "../../../../util.js";
import { lexicons } from "../../../../lexicons.js";
import { CID } from "multiformats/cid";
import * as AppBskyActorDefs from "../actor/defs.js";

export interface QueryParams {
  limit?: number;
  cursor?: string;
}

export type InputSchema = undefined;

export interface OutputSchema {
  cursor?: string;
  mutes: AppBskyActorDefs.ProfileView[];
  [k: string]: unknown;
}

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
