// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IOpenApiExample } from "./IOpenApiExample";
import type { IOpenApiHeader } from "./IOpenApiHeader";

/**
 * The Open API config definition.
 */
export interface IOpenApiResponse {
	/**
	 * Descriptions for the response.
	 */
	description?: string;

	/**
	 * Content for the response.
	 */
	content?: {
		[contentType: string]: {
			schema: {
				type?: string;
				format?: string;
				$ref?: string;
			};
			examples?: {
				[id: string]: IOpenApiExample;
			};
		};
	};

	/**
	 * The headers for the response.
	 */
	headers?: {
		[id: string]: IOpenApiHeader;
	};
}
