// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
/* eslint-disable jsdoc/require-jsdoc */

/**
 * This is a copy of the types from the npm jsonld package. This is necessary as the JSON schema generators
 * that are used in other packages cannot understand some of the types e.g. OrArray
 */

/**
 * Types from the jsonld Specification:
 * https://www.w3.org/TR/json-ld11/
 */

/**
 * A JSON-LD document MUST be valid JSON text as described in [RFC8259],
 * or some format that can be represented in the JSON-LD internal representation
 * that is equivalent to valid JSON text.
 * @see https://www.w3.org/TR/json-ld11/#json-ld-grammar
 */
export type IJsonLdDocument =
	| IJsonLdNodeObject
	| IJsonLdNodeObject[]
	| {
			"@context"?: IJsonLdKeyword["@context"] | undefined;
			"@graph"?: IJsonLdKeyword["@graph"] | undefined;
	  };

/**
 * A node object represents zero or more properties of a node
 * in the graph serialized by the JSON-LD document.
 * @see https://www.w3.org/TR/json-ld11/#node-objects
 */
export interface IJsonLdNodeObject {
	[key: string]:
		| IJsonLdNodePrimitive
		| IJsonLdNodePrimitive[]
		| IJsonLdLanguageMap
		| IJsonLdIndexMap
		| IJsonLdIncludedBlock
		| IJsonLdIdMap
		| IJsonLdTypeMap
		| IJsonLdNodeObject[keyof IJsonLdNodeObject];

	"@context"?: IJsonLdKeyword["@context"] | undefined;
	"@id"?: IJsonLdKeyword["@id"] | undefined;
	"@included"?: IJsonLdKeyword["@included"] | undefined;
	"@graph"?: IJsonLdNodeObject | IJsonLdNodeObject[] | undefined;
	"@nest"?: IJsonLdJsonObject | IJsonLdJsonObject[] | undefined;
	"@type"?: IJsonLdKeyword["@type"] | IJsonLdKeyword["@type"][] | undefined;
	"@reverse"?: { [key: string]: IJsonLdKeyword["@reverse"] } | undefined;
	"@index"?: IJsonLdKeyword["@index"] | undefined;
}

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

/**
 * A list represents an ordered set of values.
 * @see https://www.w3.org/TR/json-ld11/#lists-and-sets
 */
export interface IJsonLdListObject {
	"@list": IJsonLdKeyword["@list"];
	"@index"?: IJsonLdKeyword["@index"] | undefined;
}

/**
 * A set represents an unordered set of values.
 * @see https://www.w3.org/TR/json-ld11/#lists-and-sets
 */
export interface IJsonLdSetObject {
	"@set": IJsonLdKeyword["@set"];
	"@index"?: IJsonLdKeyword["@index"] | undefined;
}

/**
 * A language map is used to associate a language with a value in a way that allows easy programmatic access.
 * @see https://www.w3.org/TR/json-ld11/#language-maps
 */
export interface IJsonLdLanguageMap {
	[key: string]: null | string | string[];
}

/**
 * An index map allows keys that have no semantic meaning, but should be preserved regardless,
 * to be used in JSON-LD documents.
 * @see https://www.w3.org/TR/json-ld11/#index-maps
 */
export interface IJsonLdIndexMap {
	[key: string]: IJsonLdIndexMapItem | IJsonLdIndexMapItem[];
}

/**
 * The items that can be stored in an index map.
 */
export type IJsonLdIndexMapItem =
	| null
	| boolean
	| number
	| string
	| IJsonLdNodeObject
	| IJsonLdValueObject
	| IJsonLdListObject
	| IJsonLdSetObject;

/**
 * An id map is used to associate an IRI with a value that allows easy programmatic access.
 * @see https://www.w3.org/TR/json-ld11/#id-maps
 */
export interface IJsonLdIdMap {
	[key: string]: IJsonLdNodeObject;
}

/**
 * A type map is used to associate an IRI with a value that allows easy programmatic access.
 * @see https://www.w3.org/TR/json-ld11/#type-maps
 */
export interface IJsonLdTypeMap {
	[key: string]: string | IJsonLdNodeObject;
}

/**
 * An included block is used to provide a set of node objects.
 * @see https://www.w3.org/TR/json-ld11/#included-blocks
 */
export type IJsonLdIncludedBlock = IJsonLdNodeObject | IJsonLdNodeObject[];

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

/**
 * A list of keywords and their types.
 * Only used for internal reference; not an actual interface.
 * Not for export.
 * @see https://www.w3.org/TR/json-ld/#keywords
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type IJsonLdKeyword = {
	"@base": string | null;
	"@container":
		| ("@list" | "@set" | IJsonLdContainerType)
		| ("@list" | "@set" | IJsonLdContainerType)[]
		| IJsonLdContainerTypeArray
		| null;
	"@context":
		| null
		| string
		| IJsonLdContextDefinition
		| (null | string | IJsonLdContextDefinition)[];
	"@direction": "ltr" | "rtl" | null;
	"@graph": IJsonLdValueObject | IJsonLdNodeObject | (IJsonLdValueObject | IJsonLdNodeObject)[];
	"@id": string | string[];
	"@import": string;
	"@included": IJsonLdIncludedBlock;
	"@index": string;
	"@json": "@json";
	"@language": string;
	"@list": IJsonLdListOrSetItem | IJsonLdListOrSetItem[];
	"@nest": object;
	"@none": "@none";
	"@prefix": boolean;
	"@propagate": boolean;
	"@protected": boolean;
	"@reverse": string;
	"@set": IJsonLdListOrSetItem | IJsonLdListOrSetItem[];
	"@type": string;
	"@value": null | boolean | number | string;
	"@version": "1.1";
	"@vocab": string | null;
};

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

/*
 * Helper Types
 */
export type IJsonLdContainerType = "@language" | "@index" | "@id" | "@graph" | "@type";
export type IJsonLdContainerTypeArray =
	| ["@graph", "@id"]
	| ["@id", "@graph"]
	| ["@set", "@graph", "@id"]
	| ["@set", "@id", "@graph"]
	| ["@graph", "@set", "@id"]
	| ["@id", "@set", "@graph"]
	| ["@graph", "@id", "@set"]
	| ["@id", "@graph", "@set"]
	| ["@set", IJsonLdContainerType]
	| [IJsonLdContainerType, "@set"];

/*
 * JSON Types
 */
export type IJsonLdJsonPrimitive = string | number | boolean | null;
export type IJsonLdJsonArray = IJsonLdJsonValue[];
export interface IJsonLdJsonObject {
	[key: string]: IJsonLdJsonValue | undefined;
}
export type IJsonLdJsonValue = IJsonLdJsonPrimitive | IJsonLdJsonArray | IJsonLdJsonObject;
