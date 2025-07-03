// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
/* eslint-disable jsdoc/require-jsdoc */
import type { IJsonLdExpandedTermDefinition } from "./IJsonLdExpandedTermDefinition";
import type { IJsonLdKeyword } from "./IJsonLdKeyword";

/**
 * This is a copy of the types from the npm jsonld package. This is necessary as the JSON schema generators
 * that are used in other packages cannot understand some of the types e.g. OrArray
 */

/**
 * A context definition defines a local context in a node object.
 * @see https://www.w3.org/TR/json-ld11/#context-definitions
 */
export interface IJsonLdContextDefinition {
	[key: string]:
		| null
		| string
		| IJsonLdExpandedTermDefinition
		| IJsonLdContextDefinition[keyof IJsonLdContextDefinition];

	"@base"?: IJsonLdKeyword["@base"] | undefined;
	"@direction"?: IJsonLdKeyword["@direction"] | undefined;
	"@import"?: IJsonLdKeyword["@import"] | undefined;
	"@language"?: IJsonLdKeyword["@language"] | undefined;
	"@propagate"?: IJsonLdKeyword["@propagate"] | undefined;
	"@protected"?: IJsonLdKeyword["@protected"] | undefined;
	"@type"?:
		| {
				"@container": "@set";
				"@protected"?: IJsonLdKeyword["@protected"] | undefined;
		  }
		| undefined;
	"@version"?: IJsonLdKeyword["@version"] | undefined;
	"@vocab"?: IJsonLdKeyword["@vocab"] | undefined;
}
