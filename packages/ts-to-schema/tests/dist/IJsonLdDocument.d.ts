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
	| INodeObject
	| INodeObject[]
	| {
			"@context"?: Keyword["@context"] | undefined;
			"@graph"?: Keyword["@graph"] | undefined;
	  };
/**
 * A node object represents zero or more properties of a node
 * in the graph serialized by the JSON-LD document.
 * @see https://www.w3.org/TR/json-ld11/#node-objects
 */
export interface INodeObject {
	[key: string]:
		| INodePrimitive
		| INodePrimitive[]
		| ILanguageMap
		| IIndexMap
		| IIncludedBlock
		| IIdMap
		| ITypeMap
		| INodeObject[keyof INodeObject];
	"@context"?: Keyword["@context"] | undefined;
	"@id"?: Keyword["@id"] | undefined;
	"@included"?: Keyword["@included"] | undefined;
	"@graph"?: INodeObject | INodeObject[] | undefined;
	"@nest"?: IJsonObject | IJsonObject[] | undefined;
	"@type"?: Keyword["@type"] | Keyword["@type"][] | undefined;
	"@reverse"?:
		| {
				[key: string]: Keyword["@reverse"];
		  }
		| undefined;
	"@index"?: Keyword["@index"] | undefined;
}
export type INodePrimitive =
	| null
	| boolean
	| number
	| string
	| INodeObject
	| IGraphObject
	| IValueObject
	| IListObject
	| ISetObject;
/**
 * A graph object represents a named graph, which MAY include an explicit graph name.
 * @see https://www.w3.org/TR/json-ld11/#graph-objects
 */
export interface IGraphObject {
	"@graph": INodeObject | INodeObject[];
	"@index"?: Keyword["@index"] | undefined;
	"@id"?: Keyword["@id"] | undefined;
	"@context"?: Keyword["@context"] | undefined;
}
/**
 * A value object is used to explicitly associate a type or a language with a value
 * to create a typed value or a language-tagged string and possibly associate a base direction.
 * @see https://www.w3.org/TR/json-ld11/#value-objects
 */
export type IValueObject = {
	"@index"?: Keyword["@index"] | undefined;
	"@context"?: Keyword["@context"] | undefined;
} & (
	| {
			"@value": Keyword["@value"];
			"@language"?: Keyword["@language"] | undefined;
			"@direction"?: Keyword["@direction"] | undefined;
	  }
	| {
			"@value": Keyword["@value"];
			"@type": Keyword["@type"];
	  }
	| {
			"@value": Keyword["@value"] | IJsonObject | JsonArray;
			"@type": "@json";
	  }
);
/**
 * A list represents an ordered set of values.
 * @see https://www.w3.org/TR/json-ld11/#lists-and-sets
 */
export interface IListObject {
	"@list": Keyword["@list"];
	"@index"?: Keyword["@index"] | undefined;
}
/**
 * A set represents an unordered set of values.
 * @see https://www.w3.org/TR/json-ld11/#lists-and-sets
 */
export interface ISetObject {
	"@set": Keyword["@set"];
	"@index"?: Keyword["@index"] | undefined;
}
/**
 * A language map is used to associate a language with a value in a way that allows easy programmatic access.
 * @see https://www.w3.org/TR/json-ld11/#language-maps
 */
export interface ILanguageMap {
	[key: string]: null | string | string[];
}
/**
 * An index map allows keys that have no semantic meaning, but should be preserved regardless,
 * to be used in JSON-LD documents.
 * @see https://www.w3.org/TR/json-ld11/#index-maps
 */
export interface IIndexMap {
	[key: string]: IIndexMapItem | IIndexMapItem[];
}
/**
 * The items that can be stored in an index map.
 */
export type IIndexMapItem =
	| null
	| boolean
	| number
	| string
	| INodeObject
	| IValueObject
	| IListObject
	| ISetObject;
/**
 * An id map is used to associate an IRI with a value that allows easy programmatic access.
 * @see https://www.w3.org/TR/json-ld11/#id-maps
 */
export interface IIdMap {
	[key: string]: INodeObject;
}
/**
 * A type map is used to associate an IRI with a value that allows easy programmatic access.
 * @see https://www.w3.org/TR/json-ld11/#type-maps
 */
export interface ITypeMap {
	[key: string]: string | INodeObject;
}
/**
 * An included block is used to provide a set of node objects.
 * @see https://www.w3.org/TR/json-ld11/#included-blocks
 */
export type IIncludedBlock = INodeObject | INodeObject[];
/**
 * A context definition defines a local context in a node object.
 * @see https://www.w3.org/TR/json-ld11/#context-definitions
 */
export interface IContextDefinition {
	[key: string]:
		| null
		| string
		| IExpandedTermDefinition
		| IContextDefinition[keyof IContextDefinition];
	"@base"?: Keyword["@base"] | undefined;
	"@direction"?: Keyword["@direction"] | undefined;
	"@import"?: Keyword["@import"] | undefined;
	"@language"?: Keyword["@language"] | undefined;
	"@propagate"?: Keyword["@propagate"] | undefined;
	"@protected"?: Keyword["@protected"] | undefined;
	"@type"?:
		| {
				"@container": "@set";
				"@protected"?: Keyword["@protected"] | undefined;
		  }
		| undefined;
	"@version"?: Keyword["@version"] | undefined;
	"@vocab"?: Keyword["@vocab"] | undefined;
}
/**
 * An expanded term definition is used to describe the mapping between a term
 * and its expanded identifier, as well as other properties of the value
 * associated with the term when it is used as key in a node object.
 * @see https://www.w3.org/TR/json-ld11/#expanded-term-definition
 */
export type IExpandedTermDefinition = {
	"@type"?: "@id" | "@json" | "@none" | "@vocab" | string | undefined;
	"@language"?: Keyword["@language"] | undefined;
	"@index"?: Keyword["@index"] | undefined;
	"@context"?: IContextDefinition | undefined;
	"@prefix"?: Keyword["@prefix"] | undefined;
	"@propagate"?: Keyword["@propagate"] | undefined;
	"@protected"?: Keyword["@protected"] | undefined;
} & (
	| {
			"@id"?: Keyword["@id"] | null | undefined;
			"@nest"?: "@nest" | string | undefined;
			"@container"?: Keyword["@container"] | undefined;
	  }
	| {
			"@reverse": Keyword["@reverse"];
			"@container"?: "@set" | "@index" | null | undefined;
	  }
);
/**
 * A list of keywords and their types.
 * Only used for internal reference; not an actual interface.
 * Not for export.
 * @see https://www.w3.org/TR/json-ld/#keywords
 */
export type Keyword = {
	"@base": string | null;
	"@container":
		| ("@list" | "@set" | ContainerType)
		| ("@list" | "@set" | ContainerType)[]
		| ContainerTypeArray
		| null;
	"@context": null | string | IContextDefinition | (null | string | IContextDefinition)[];
	"@direction": "ltr" | "rtl" | null;
	"@graph": IValueObject | INodeObject | (IValueObject | INodeObject)[];
	"@id": string | string[];
	"@import": string;
	"@included": IIncludedBlock;
	"@index": string;
	"@json": "@json";
	"@language": string;
	"@list": ListOrSetItem | ListOrSetItem[];
	"@nest": object;
	"@none": "@none";
	"@prefix": boolean;
	"@propagate": boolean;
	"@protected": boolean;
	"@reverse": string;
	"@set": ListOrSetItem | ListOrSetItem[];
	"@type": string;
	"@value": null | boolean | number | string;
	"@version": "1.1";
	"@vocab": string | null;
};
/**
 * A list or set item can be a null, boolean, number, string, node object, or value object.
 */
export type ListOrSetItem = null | boolean | number | string | INodeObject | IValueObject;
export type ContainerType = "@language" | "@index" | "@id" | "@graph" | "@type";
export type ContainerTypeArray =
	| ["@graph", "@id"]
	| ["@id", "@graph"]
	| ["@set", "@graph", "@id"]
	| ["@set", "@id", "@graph"]
	| ["@graph", "@set", "@id"]
	| ["@id", "@set", "@graph"]
	| ["@graph", "@id", "@set"]
	| ["@id", "@graph", "@set"]
	| ["@set", ContainerType]
	| [ContainerType, "@set"];
export type JsonPrimitive = string | number | boolean | null;
export type JsonArray = JsonValue[];
export interface IJsonObject {
	[key: string]: JsonValue | undefined;
}
export type JsonValue = JsonPrimitive | JsonArray | IJsonObject;
