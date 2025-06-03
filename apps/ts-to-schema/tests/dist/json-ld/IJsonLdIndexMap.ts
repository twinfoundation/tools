// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IJsonLdIndexMapItem } from "./IJsonLdIndexMapItem";

/**
 * This is a copy of the types from the npm jsonld package. This is necessary as the JSON schema generators
 * that are used in other packages cannot understand some of the types e.g. OrArray
 */

/**
 * An index map allows keys that have no semantic meaning, but should be preserved regardless,
 * to be used in JSON-LD documents.
 * @see https://www.w3.org/TR/json-ld11/#index-maps
 */
export interface IJsonLdIndexMap {
	[key: string]: IJsonLdIndexMapItem | IJsonLdIndexMapItem[];
}
