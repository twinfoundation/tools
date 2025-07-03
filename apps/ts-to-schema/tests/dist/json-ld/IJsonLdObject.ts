// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
/* eslint-disable jsdoc/require-jsdoc */
import type { IJsonLdJsonObject } from "./IJsonLdJsonObject";
import type { IJsonLdKeyword } from "./IJsonLdKeyword";
import type { IJsonLdNodeObject } from "./IJsonLdNodeObject";

/**
 * This is a copy of the types from the npm jsonld package. This is necessary as the JSON schema generators
 * that are used in other packages cannot understand some of the types e.g. OrArray
 */

/**
 * An object represents the pre-defined properties of the node object
 * in the graph serialized by the JSON-LD document.
 * @see https://www.w3.org/TR/json-ld11/#node-objects
 */
export interface IJsonLdObject {
	"@context"?: IJsonLdKeyword["@context"] | undefined;
	"@id"?: IJsonLdKeyword["@id"] | undefined;
	"@included"?: IJsonLdKeyword["@included"] | undefined;
	"@graph"?: IJsonLdNodeObject | IJsonLdNodeObject[] | undefined;
	"@nest"?: IJsonLdJsonObject | IJsonLdJsonObject[] | undefined;
	"@type"?: IJsonLdKeyword["@type"] | IJsonLdKeyword["@type"][] | undefined;
	"@reverse"?: { [key: string]: IJsonLdKeyword["@reverse"] } | undefined;
	"@index"?: IJsonLdKeyword["@index"] | undefined;
}
