// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IJsonLdNodeObject } from "./IJsonLdNodeObject";

/**
 * This is a copy of the types from the npm jsonld package. This is necessary as the JSON schema generators
 * that are used in other packages cannot understand some of the types e.g. OrArray
 */

/**
 * An id map is used to associate an IRI with a value that allows easy programmatic access.
 * @see https://www.w3.org/TR/json-ld11/#id-maps
 */
export interface IJsonLdIdMap {
	[key: string]: IJsonLdNodeObject;
}
