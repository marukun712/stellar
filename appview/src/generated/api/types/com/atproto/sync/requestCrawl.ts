/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { HeadersMap, XRPCError } from "@atproto/xrpc";
import { ValidationResult, BlobRef } from "@atproto/lexicon";
import { isObj, hasProp } from "../../../../util.js";
import { lexicons } from "../../../../lexicons.js";
import { CID } from "multiformats/cid";

export interface QueryParams {}

export interface InputSchema {
  /** Hostname of the current service (eg, PDS) that is requesting to be crawled. */
  hostname: string;
  [k: string]: unknown;
}

export interface CallOptions {
  signal?: AbortSignal;
  headers?: HeadersMap;
  qp?: QueryParams;
  encoding?: "application/json";
}

export interface Response {
  success: boolean;
  headers: HeadersMap;
}

export function toKnownErr(e: any) {
  return e;
}
