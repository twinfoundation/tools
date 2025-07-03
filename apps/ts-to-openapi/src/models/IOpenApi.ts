// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IJsonSchema } from "./IJsonSchema";
import type { IOpenApiPathMethod } from "./IOpenApiPathMethod";
import type { IOpenApiSecurityScheme } from "./IOpenApiSecurityScheme";

/**
 * The Open API config definition.
 */
export interface IOpenApi {
	/**
	 * The open api version.
	 */
	openapi: string;

	/**
	 * Info.
	 */
	info: {
		title: string;
		version: string;
		description: string;
		license?: {
			name: string;
			url: string;
		};
	};

	/**
	 * The servers for the endpoints.
	 */
	servers?: {
		url: string;
	}[];

	/**
	 * Tags for the endpoints.
	 */
	tags?: {
		name: string;
		description: string;
	}[];

	/**
	 * The paths.
	 */
	paths: {
		[path: string]: {
			[method: string]: IOpenApiPathMethod;
		};
	};

	/**
	 * The components.
	 */
	components?: {
		schemas?: IJsonSchema;
		securitySchemes?: {
			[name: string]: IOpenApiSecurityScheme;
		};
	};
}
