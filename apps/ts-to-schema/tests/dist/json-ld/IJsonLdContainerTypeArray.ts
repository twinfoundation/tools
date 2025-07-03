// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IJsonLdContainerType } from "./IJsonLdContainerType";

/**
 * This is a copy of the types from the npm jsonld package. This is necessary as the JSON schema generators
 * that are used in other packages cannot understand some of the types e.g. OrArray
 */

/**
 * Helper Types.
 */
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
