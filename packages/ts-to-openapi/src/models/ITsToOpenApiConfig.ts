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
		package: string;

		/**
		 * The version of the package to use, defaults to latest.
		 */
		version?: string;

		/**
		 * The name of the routes method in the package, defaults to generateRoutes.
		 */
		routesMethod?: string;

		/**
		 * The tag property exported from the package, defaults to tags.
		 */
		tagProperty?: string;

		/**
		 * The path for the root of the routes, defaults to nothing.
		 */
		pathRoot?: string;
	}[];
}
