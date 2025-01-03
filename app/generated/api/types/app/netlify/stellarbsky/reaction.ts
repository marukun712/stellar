/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { ValidationResult, BlobRef } from '@atproto/lexicon'
import { isObj, hasProp } from '../../../../util'
import { lexicons } from '../../../../lexicons'
import { CID } from 'multiformats/cid'
import * as ComAtprotoRepoStrongRef from '../../../com/atproto/repo/strongRef'
import * as BlueMojiCollectionItem from '../../../blue/moji/collection/item'

export interface Record {
  subject: ComAtprotoRepoStrongRef.Main
  emoji: BlueMojiCollectionItem.ItemView
  authorDid: string
  [k: string]: unknown
}

export function isRecord(v: unknown): v is Record {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    (v.$type === 'app.netlify.stellarbsky.reaction#main' ||
      v.$type === 'app.netlify.stellarbsky.reaction')
  )
}

export function validateRecord(v: unknown): ValidationResult {
  return lexicons.validate('app.netlify.stellarbsky.reaction#main', v)
}
