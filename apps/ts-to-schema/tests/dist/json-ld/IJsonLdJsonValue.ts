// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IJsonLdJsonArray } from "./IJsonLdJsonArray";
import type { IJsonLdJsonObject } from "./IJsonLdJsonObject";
import type { IJsonLdJsonPrimitive } from "./IJsonLdJsonPrimitive";

/**
 * This is a copy of the types from the npm jsonld package. This is necessary as the JSON schema generators
 * that are used in other packages cannot understand some of the types e.g. OrArray
 */

/**
 * JSON Value.
 */
export type IJsonLdJsonValue = IJsonLdJsonPrimitive | IJsonLdJsonArray | IJsonLdJsonObject;
