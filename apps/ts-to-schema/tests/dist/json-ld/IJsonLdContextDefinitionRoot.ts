// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IJsonLdContextDefinitionElement } from "./IJsonLdContextDefinitionElement";

/**
 * This is a copy of the types from the npm jsonld package. This is necessary as the JSON schema generators
 * that are used in other packages cannot understand some of the types e.g. OrArray
 */

/**
 * A context definition root is used to define the root of a context definition.
 */
export type IJsonLdContextDefinitionRoot =
	| IJsonLdContextDefinitionElement
	| IJsonLdContextDefinitionElement[];
