// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Configuration for the API.
 */
export interface ITsToOpenApiConfigEntryPoint {
	/**
	 * Match the name of the exported entry point.
	 */
	name: string;

	/**
	 * The base route path to use, defaults to the one in the entry point.
	 */
	baseRoutePath?: string;

	/**
	 * If using the same routes on multiple paths use the distinguisher to avoid operationId clashes, will be appended to operationIds.
	 */
	operationIdDistinguisher?: string;
}
