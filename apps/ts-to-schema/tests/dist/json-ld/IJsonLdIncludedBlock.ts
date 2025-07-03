// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IJsonLdNodeObject } from "./IJsonLdNodeObject";

/**
 * This is a copy of the types from the npm jsonld package. This is necessary as the JSON schema generators
 * that are used in other packages cannot understand some of the types e.g. OrArray
 */

/**
 * An included block is used to provide a set of node objects.
 * @see https://www.w3.org/TR/json-ld11/#included-blocks
 */
export type IJsonLdIncludedBlock = IJsonLdNodeObject | IJsonLdNodeObject[];
