// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type {
	IAcceptedResponse,
	IBadRequestResponse,
	IConflictResponse,
	ICreatedResponse,
	IForbiddenResponse,
	IInternalServerErrorResponse,
	INoContentResponse,
	INotFoundResponse,
	IOkResponse,
	IUnauthorizedResponse,
	IUnprocessableEntityResponse
} from "@gtsc/api-models";
import { nameof } from "@gtsc/nameof";
import { HttpStatusCode } from "@gtsc/web";

export const HTTP_STATUS_CODE_MAP: {
	[id: string]: {
		code: HttpStatusCode;
		responseType: string;
		example?: unknown;
	};
} = {
	ok: {
		code: HttpStatusCode.ok,
		responseType: nameof<IOkResponse>()
	},
	created: {
		code: HttpStatusCode.created,
		responseType: nameof<ICreatedResponse>()
	},
	accepted: {
		code: HttpStatusCode.accepted,
		responseType: nameof<IAcceptedResponse>()
	},
	noContent: {
		code: HttpStatusCode.noContent,
		responseType: nameof<INoContentResponse>()
	},
	badRequest: {
		code: HttpStatusCode.badRequest,
		responseType: nameof<IBadRequestResponse>(),
		example: {
			name: "GeneralError",
			message: "component.error",
			properties: {
				foo: "bar"
			}
		}
	},
	unauthorized: {
		code: HttpStatusCode.unauthorized,
		responseType: nameof<IUnauthorizedResponse>(),
		example: {
			name: "UnauthorizedError",
			message: "component.error"
		}
	},
	forbidden: {
		code: HttpStatusCode.forbidden,
		responseType: nameof<IForbiddenResponse>(),
		example: {
			name: "NotImplementedError",
			message: "component.error",
			properties: {
				method: "aMethod"
			}
		}
	},
	notFound: {
		code: HttpStatusCode.notFound,
		responseType: nameof<INotFoundResponse>(),
		example: {
			name: "NotFoundError",
			message: "component.error",
			properties: {
				notFoundId: "1"
			}
		}
	},
	conflict: {
		code: HttpStatusCode.conflict,
		responseType: nameof<IConflictResponse>(),
		example: {
			name: "ConflictError",
			message: "component.error",
			properties: {
				conflicts: ["1"]
			}
		}
	},
	internalServerError: {
		code: HttpStatusCode.internalServerError,
		responseType: nameof<IInternalServerErrorResponse>(),
		example: {
			name: "InternalServerError",
			message: "component.error"
		}
	},
	unprocessableEntity: {
		code: HttpStatusCode.unprocessableEntity,
		responseType: nameof<IUnprocessableEntityResponse>(),
		example: {
			name: "UnprocessableError",
			message: "component.error"
		}
	}
};

/**
 * Get the HTTP status code from the error code type.
 * @param errorCodeType The error code type.
 * @returns The HTTP status code.
 */
export function getHttpStatusCodeFromType(errorCodeType: string): HttpStatusCode {
	for (const httpStatusCodeType of Object.values(HTTP_STATUS_CODE_MAP)) {
		if (httpStatusCodeType.responseType === errorCodeType) {
			return httpStatusCodeType.code;
		}
	}
	return HttpStatusCode.ok;
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
