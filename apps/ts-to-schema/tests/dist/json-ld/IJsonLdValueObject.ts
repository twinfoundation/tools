// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IJsonLdJsonArray } from "./IJsonLdJsonArray";
import type { IJsonLdJsonObject } from "./IJsonLdJsonObject";
import type { IJsonLdKeyword } from "./IJsonLdKeyword";

/**
 * This is a copy of the types from the npm jsonld package. This is necessary as the JSON schema generators
 * that are used in other packages cannot understand some of the types e.g. OrArray
 */

/**
 * A value object is used to explicitly associate a type or a language with a value
 * to create a typed value or a language-tagged string and possibly associate a base direction.
 * @see https://www.w3.org/TR/json-ld11/#value-objects
 */
export type IJsonLdValueObject = {
	"@index"?: IJsonLdKeyword["@index"] | undefined;
	"@context"?: IJsonLdKeyword["@context"] | undefined;
} & (
	| {
			"@value": IJsonLdKeyword["@value"];
			"@language"?: IJsonLdKeyword["@language"] | undefined;
			"@direction"?: IJsonLdKeyword["@direction"] | undefined;
	  }
	| {
			"@value": IJsonLdKeyword["@value"];
			"@type": IJsonLdKeyword["@type"];
	  }
	| {
			"@value": IJsonLdKeyword["@value"] | IJsonLdJsonObject | IJsonLdJsonArray;
			"@type": "@json";
	  }
);
