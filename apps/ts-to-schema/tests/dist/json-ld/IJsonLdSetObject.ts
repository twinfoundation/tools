// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
/* eslint-disable jsdoc/require-jsdoc */
import type { IJsonLdKeyword } from "./IJsonLdKeyword";

/**
 * This is a copy of the types from the npm jsonld package. This is necessary as the JSON schema generators
 * that are used in other packages cannot understand some of the types e.g. OrArray
 */

/**
 * A set represents an unordered set of values.
 * @see https://www.w3.org/TR/json-ld11/#lists-and-sets
 */
export interface IJsonLdSetObject {
	"@set": IJsonLdKeyword["@set"];
	"@index"?: IJsonLdKeyword["@index"] | undefined;
}
