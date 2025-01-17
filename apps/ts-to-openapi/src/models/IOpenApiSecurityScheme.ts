// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * The Open API config definition for security scheme.
 */
export interface IOpenApiSecurityScheme {
	/**
	 * The type of the security schema.
	 */
	type?: string;

	/**
	 * The scheme method.
	 */
	scheme?: string;

	/**
	 * The bearer format.
	 */
	bearerFormat?: string;

	/**
	 * Where is the token located.
	 */
	in?: string;

	/**
	 * What is the name of the token.
	 */
	name?: string;
}
