// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * The Open API config definition.
 */
export interface IOpenApiHeader {
	/**
	 * The schema of the header.
	 */
	schema?: {
		type: string;
	};

	/**
	 * The description of the header.
	 */
	description?: string;

	/**
	 * The format of the header.
	 */
	format?: string;
}
