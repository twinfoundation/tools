// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IJsonLdNodeObject } from "./IJsonLdNodeObject";
import type { IJsonLdValueObject } from "./IJsonLdValueObject";

/**
 * This is a copy of the types from the npm jsonld package. This is necessary as the JSON schema generators
 * that are used in other packages cannot understand some of the types e.g. OrArray
 */

/**
 * A list or set item can be a null, boolean, number, string, node object, or value object.
 */
export type IJsonLdListOrSetItem =
	| null
	| boolean
	| number
	| string
	| IJsonLdNodeObject
	| IJsonLdValueObject;
