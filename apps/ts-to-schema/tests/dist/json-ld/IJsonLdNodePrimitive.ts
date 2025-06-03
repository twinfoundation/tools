// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IJsonLdGraphObject } from "./IJsonLdGraphObject";
import type { IJsonLdListObject } from "./IJsonLdListObject";
import type { IJsonLdNodeObject } from "./IJsonLdNodeObject";
import type { IJsonLdSetObject } from "./IJsonLdSetObject";
import type { IJsonLdValueObject } from "./IJsonLdValueObject";

/**
 * This is a copy of the types from the npm jsonld package. This is necessary as the JSON schema generators
 * that are used in other packages cannot understand some of the types e.g. OrArray
 */

/**
 * A node primitive is a JSON-LD value which is not one of the defined NodeObject properties.
 */
export type IJsonLdNodePrimitive =
	| null
	| boolean
	| number
	| string
	| IJsonLdNodeObject
	| IJsonLdGraphObject
	| IJsonLdValueObject
	| IJsonLdListObject
	| IJsonLdSetObject;
