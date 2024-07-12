// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type {
	IAcceptedResponse,
	IBadRequestResponse,
	IConflictResponse,
	ICreatedResponse,
	IForbiddenResponse,
	INoContentResponse,
	INotFoundResponse,
	IOkResponse,
	IUnauthorizedResponse,
	IUnprocessableEntityResponse
} from "@gtsc/api-models";
import { nameof } from "@gtsc/nameof";
import { HttpStatusCodes } from "@gtsc/web";

export const HTTP_STATUS_CODE_MAP: {
	[id: string]: {
		code: HttpStatusCodes;
		responseType: string;
		example?: unknown;
	};
} = {
	OK: {
		code: HttpStatusCodes.OK,
		responseType: nameof<IOkResponse>()
	},
	CREATED: {
		code: HttpStatusCodes.CREATED,
		responseType: nameof<ICreatedResponse>()
	},
	ACCEPTED: {
		code: HttpStatusCodes.ACCEPTED,
		responseType: nameof<IAcceptedResponse>()
	},
	NO_CONTENT: {
		code: HttpStatusCodes.NO_CONTENT,
		responseType: nameof<INoContentResponse>()
	},
	BAD_REQUEST: {
		code: HttpStatusCodes.BAD_REQUEST,
		responseType: nameof<IBadRequestResponse>(),
		example: {
			name: "GeneralError",
			message: "component.error",
			properties: {
				foo: "bar"
			}
		}
	},
	UNAUTHORIZED: {
		code: HttpStatusCodes.UNAUTHORIZED,
		responseType: nameof<IUnauthorizedResponse>(),
		example: {
			name: "UnauthorizedError",
			message: "component.error"
		}
	},
	FORBIDDEN: {
		code: HttpStatusCodes.FORBIDDEN,
		responseType: nameof<IForbiddenResponse>(),
		example: {
			name: "NotImplementedError",
			message: "component.error",
			properties: {
				method: "aMethod"
			}
		}
	},
	NOT_FOUND: {
		code: HttpStatusCodes.NOT_FOUND,
		responseType: nameof<INotFoundResponse>(),
		example: {
			name: "NotFoundError",
			message: "component.error",
			properties: {
				notFoundId: "1"
			}
		}
	},
	CONFLICT: {
		code: HttpStatusCodes.CONFLICT,
		responseType: nameof<IConflictResponse>(),
		example: {
			name: "ConflictError",
			message: "component.error",
			properties: {
				conflicts: ["1"]
			}
		}
	},
	UNPROCESSABLE_ENTITY: {
		code: HttpStatusCodes.UNPROCESSABLE_ENTITY,
		responseType: nameof<IUnprocessableEntityResponse>(),
		example: {
			name: "AlreadyExistsError",
			message: "component.error",
			properties: {
				existingId: "1"
			}
		}
	}
};

/**
 * Get the HTTP status code from the error code type.
 * @param errorCodeType The error code type.
 * @returns The HTTP status code.
 */
export function getHttpStatusCodeFromType(errorCodeType: string): HttpStatusCodes {
	for (const httpStatusCodeType of Object.values(HTTP_STATUS_CODE_MAP)) {
		if (httpStatusCodeType.responseType === errorCodeType) {
			return httpStatusCodeType.code;
		}
	}
	return HttpStatusCodes.OK;
}

/**
 * Get the HTTP example from the error code type.
 * @param errorCodeType The error code type.
 * @returns The example.
 */
export function getHttpExampleFromType(errorCodeType: string): unknown {
	for (const httpStatusCodeType of Object.values(HTTP_STATUS_CODE_MAP)) {
		if (httpStatusCodeType.responseType === errorCodeType) {
			return httpStatusCodeType.example;
		}
	}
}
