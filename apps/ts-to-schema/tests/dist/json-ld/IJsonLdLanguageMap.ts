// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * This is a copy of the types from the npm jsonld package. This is necessary as the JSON schema generators
 * that are used in other packages cannot understand some of the types e.g. OrArray
 */

/**
 * A language map is used to associate a language with a value in a way that allows easy programmatic access.
 * @see https://www.w3.org/TR/json-ld11/#language-maps
 */
export interface IJsonLdLanguageMap {
	[key: string]: null | string | string[];
}
