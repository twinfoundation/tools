// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
/* eslint-disable jsdoc/require-jsdoc */
import type { IJsonLdKeyword } from "./IJsonLdKeyword";
import type { IJsonLdNodeObject } from "./IJsonLdNodeObject";

/**
 * This is a copy of the types from the npm jsonld package. This is necessary as the JSON schema generators
 * that are used in other packages cannot understand some of the types e.g. OrArray
 */

/**
 * A graph object represents a named graph, which MAY include an explicit graph name.
 * @see https://www.w3.org/TR/json-ld11/#graph-objects
 */
export interface IJsonLdGraphObject {
	"@graph": IJsonLdNodeObject | IJsonLdNodeObject[];
	"@index"?: IJsonLdKeyword["@index"] | undefined;
	"@id"?: IJsonLdKeyword["@id"] | undefined;
	"@context"?: IJsonLdKeyword["@context"] | undefined;
}
