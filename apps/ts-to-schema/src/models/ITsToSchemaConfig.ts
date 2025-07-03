// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IJsonSchema } from "./IJsonSchema";

/**
 * Configuration for the tool.
 */
export interface ITsToSchemaConfig {
	/**
	 * The base url for the type references e.g. https://schema.twindev.org/my-namespace/.
	 */
	baseUrl: string;

	/**
	 * The source files to generate the types from.
	 */
	types: string[];

	/**
	 * External type references
	 */
	externalReferences?: { [id: string]: string };

	/**
	 * Override for specific types, to be used when the type cannot be generated automatically, or is generated incorrectly.
	 */
	overrides?: {
		[id: string]: IJsonSchema;
	};
}
