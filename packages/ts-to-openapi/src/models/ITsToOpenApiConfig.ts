// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Configuration for the API.
 */
export interface ITsToOpenApiConfig {
	/**
	 * Title of the API.
	 */
	title: string;

	/**
	 * The version.
	 */
	version: string;

	/**
	 * Description of the API.
	 */
	description: string;

	/**
	 * The license to use.
	 */
	licenseName: string;

	/**
	 * The license URL.
	 */
	licenseUrl: string;

	/**
	 * The servers for the endpoints.
	 */
	servers: string[];

	/**
	 * The authentication method.
	 */
	authMethods?: ("basic" | "jwtBearer" | "jwtCookie" | "apiKeyQuery" | "apiKeyHeader" | string)[];

	/**
	 * The packages containing routes.
	 */
	restRoutes: {
		/**
		 * The package containing the routes.
		 */
		package?: string;

		/**
		 * The version of the package to use, defaults to latest.
		 */
		version?: string;

		/**
		 * To point to a local instance of a package use this property instead of package/version.
		 */
		packageRoot?: string;

		/**
		 * The rest entry points to include, defaults to all exported entry points.
		 */
		entryPointNames?: string[];

		/**
		 * The path for the root of the routes, defaults to nothing.
		 */
		pathRoot?: string;

		/**
		 * If using the same routes on multiple paths use the distinguisher to avoid operationId clashes, will be appended to operationIds.
		 */
		operationIdDistinguisher?: string;
	}[];
}
