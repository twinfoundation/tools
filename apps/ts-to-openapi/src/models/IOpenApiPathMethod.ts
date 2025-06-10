// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { Json } from "@hyperjump/json-pointer";
import type { JsonSchemaType } from "@hyperjump/json-schema";
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
			type?: JsonSchemaType | JsonSchemaType[];
			enum?: Json[];
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
