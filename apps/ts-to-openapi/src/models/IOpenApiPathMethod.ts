// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { JSONSchema7Type, JSONSchema7TypeName } from "json-schema";
import type { IOpenApiExample } from "./IOpenApiExample";
import type { IOpenApiResponse } from "./IOpenApiResponse";

/**
 * The Open API config definition.
 */
export interface IOpenApiPathMethod {
	/**
	 * The operation id.
	 */
	operationId: string;

	/**
	 * Summary.
	 */
	summary: string;

	/**
	 * Tags.
	 */
	tags?: string[];

	/**
	 * Parameters.
	 */
	parameters?: {
		name: string;
		in: string;
		description?: string;
		required: boolean;
		schema: {
			type?: JSONSchema7TypeName | JSONSchema7TypeName[];
			enum?: JSONSchema7Type[];
			$ref?: string;
		};
		style?: string;
	}[];

	/**
	 * Request body.
	 */
	requestBody?: {
		required: boolean;
		description?: string;
		content?: {
			[contentType: string]: {
				schema: {
					$ref: string;
				};
				examples?: {
					[id: string]: IOpenApiExample;
				};
			};
		};
	};

	/**
	 * Response body.
	 */
	responses?: {
		[code: string]: IOpenApiResponse;
	};

	/**
	 * Security model for the API.
	 */
	security?: {
		[name: string]: string[];
	}[];
}
