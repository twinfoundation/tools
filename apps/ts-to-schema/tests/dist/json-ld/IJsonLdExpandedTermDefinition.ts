// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IJsonLdContextDefinition } from "./IJsonLdContextDefinition";
import type { IJsonLdKeyword } from "./IJsonLdKeyword";

/**
 * This is a copy of the types from the npm jsonld package. This is necessary as the JSON schema generators
 * that are used in other packages cannot understand some of the types e.g. OrArray
 */

/**
 * An expanded term definition is used to describe the mapping between a term
 * and its expanded identifier, as well as other properties of the value
 * associated with the term when it is used as key in a node object.
 * @see https://www.w3.org/TR/json-ld11/#expanded-term-definition
 */
export type IJsonLdExpandedTermDefinition = {
	"@type"?: "@id" | "@json" | "@none" | "@vocab" | string | undefined;
	"@language"?: IJsonLdKeyword["@language"] | undefined;
	"@index"?: IJsonLdKeyword["@index"] | undefined;
	"@context"?: IJsonLdContextDefinition | undefined;
	"@prefix"?: IJsonLdKeyword["@prefix"] | undefined;
	"@propagate"?: IJsonLdKeyword["@propagate"] | undefined;
	"@protected"?: IJsonLdKeyword["@protected"] | undefined;
} & (
	| {
			"@id"?: IJsonLdKeyword["@id"] | null | undefined;
			"@nest"?: "@nest" | string | undefined;
			"@container"?: IJsonLdKeyword["@container"] | undefined;
	  }
	| {
			"@reverse": IJsonLdKeyword["@reverse"];
			"@container"?: "@set" | "@index" | null | undefined;
	  }
);
