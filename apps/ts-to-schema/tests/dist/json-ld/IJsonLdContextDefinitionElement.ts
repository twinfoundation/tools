// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IJsonLdContextDefinition } from "./IJsonLdContextDefinition";

/**
 * This is a copy of the types from the npm jsonld package. This is necessary as the JSON schema generators
 * that are used in other packages cannot understand some of the types e.g. OrArray
 */

/**
 * A context definition element is used to define the types of a context definition.
 */
export type IJsonLdContextDefinitionElement = null | string | IJsonLdContextDefinition;
