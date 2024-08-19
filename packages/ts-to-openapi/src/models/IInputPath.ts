// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { HttpMethod, HttpStatusCode } from "@gtsc/web";

/**
 * The resulting details for a REST path.
 */
export interface IInputPath {
	/**
	 * The path.
	 */
	path: string;

	/**
	 * The REST method.
	 */
	method: HttpMethod;

	/**
	 * The parameters contained in the path.
	 */
	pathParameters: string[];

	/**
	 * The id of the operation.
	 */
	operationId: string;

	/**
	 * Summary of what task the operation performs.
	 */
	summary: string;

	/**
	 * Tags for the operation.
	 */
	tag: string;

	/**
	 * The request type.
	 */
	requestType?: string;

	/**
	 * The request mime type.
	 */
	requestMimeType?: string;

	/**
	 * Example objects for the request.
	 */
	requestExamples?: {
		id: string;
		description?: string;
		request: unknown;
	}[];

	/**
	 * The response type.
	 */
	responseType: {
		statusCode: HttpStatusCode;
		type: string;
		mimeType?: string;
		description?: string;
		examples?: {
			id: string;
			description?: string;
			response: unknown;
		}[];
	}[];

	/**
	 * Response codes.
	 */
	responseCodes: string[];

	/**
	 * Skip authentication for this path.
	 */
	skipAuth: boolean;
}
