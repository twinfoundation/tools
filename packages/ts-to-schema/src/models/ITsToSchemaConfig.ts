// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Configuration for the tool.
 */
export interface ITsToSchemaConfig {
	/**
	 * The base url for the type references e.g. https://schema.gtsc.io/v2/.
	 */
	baseUrl: string;

	/**
	 * The list of glob sources that can be used to generate the schemas.
	 */
	sources: string[];

	/**
	 * The list of types to output.
	 */
	types: string[];
}
