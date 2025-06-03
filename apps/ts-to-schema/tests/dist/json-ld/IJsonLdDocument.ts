// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IJsonLdKeyword } from "./IJsonLdKeyword";
import type { IJsonLdNodeObject } from "./IJsonLdNodeObject";

/**
 * This is a copy of the types from the npm jsonld package. This is necessary as the JSON schema generators
 * that are used in other packages cannot understand some of the types e.g. OrArray
 */

/**
 * Types from the jsonld Specification:
 * https://www.w3.org/TR/json-ld11/
 */

/**
 * A JSON-LD document MUST be valid JSON text as described in [RFC8259],
 * or some format that can be represented in the JSON-LD internal representation
 * that is equivalent to valid JSON text.
 * @see https://www.w3.org/TR/json-ld11/#json-ld-grammar
 */
export type IJsonLdDocument =
	| IJsonLdNodeObject
	| IJsonLdNodeObject[]
	| {
			"@context"?: IJsonLdKeyword["@context"] | undefined;
			"@graph"?: IJsonLdKeyword["@graph"] | undefined;
	  };
