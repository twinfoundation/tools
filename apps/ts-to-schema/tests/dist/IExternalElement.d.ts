// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IJsonLdNodeObject } from "./IJsonLdDocument";

/**
 * Object with an external schema type.
 */
export interface IExternalElement {
	/**
	 * The metadata to associate with the element as JSON-LD.
	 */
	metadata?: IJsonLdNodeObject;
}
