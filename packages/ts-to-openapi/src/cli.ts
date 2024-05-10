// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

import { spawn } from "node:child_process";
import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
	ICreatedResponse,
	IHttpRequest,
	IHttpResponse,
	INoContentResponse,
	IOkResponse,
	IRestRoute,
	ITag,
	IUnauthorizedResponse
} from "@gtsc/api-models";
import { Coerce, Is, StringHelper } from "@gtsc/core";
import { nameof } from "@gtsc/nameof";
import { HttpStatusCodes } from "@gtsc/web";
import type { JSONSchema7 } from "json-schema";
import { createGenerator } from "./customSchemeGenerator";
import {
	HTTP_STATUS_CODE_MAP,
	getHttpExampleFromType,
	getHttpStatusCodeFromType
} from "./httpStatusCodeMap";
import type { IInputPath } from "./models/IInputPath";
import type { IInputResult } from "./models/IInputResult";
import type { IOpenApi } from "./models/IOpenApi";
import type { IOpenApiExample } from "./models/IOpenApiExample";
import type { IOpenApiHeader } from "./models/IOpenApiHeader";
import type { IOpenApiResponse } from "./models/IOpenApiResponse";
import type { IOpenApiSecurityScheme } from "./models/IOpenApiSecurityScheme";
import type { IPackageJson } from "./models/IPackageJson";
import type { ITsToOpenApiConfig } from "./models/ITsToOpenApiConfig";

/**
 * The main entry point for the CLI.
 */
export class CLI {
	/**
	 * Run the app.
	 * @param argv The process arguments.
	 * @returns The exit code.
	 */
	public async run(argv: string[]): Promise<number> {
		console.log("TypeScript to OpenAPI");
		console.log("=====================");
		console.log("");

		if (argv.length < 4) {
			console.log("Usage:");
			console.log("\tts-to-openapi <config-json> <output-api-json>");
			if (argv.length < 3) {
				console.error("Error: You must specify the config json");
			} else if (argv.length < 4) {
				console.error("Error: You must specify the output api json");
			}
			return 1;
		}

		let tsToOpenApiConfig: ITsToOpenApiConfig;
		let configJson = "";
		let outputApiJson = "";
		let outputWorkingDir = "";
		try {
			configJson = path.resolve(argv[2]);
			console.log("Config JSON:", configJson);

			outputApiJson = path.resolve(argv[3]);
			console.log("Output API JSON:", outputApiJson);

			outputWorkingDir = path.join(path.dirname(outputApiJson), "working");
			await mkdir(outputWorkingDir, { recursive: true });

			console.log("Loading Config JSON:", configJson);

			const configJsonContent = await readFile(configJson, "utf8");
			tsToOpenApiConfig = JSON.parse(configJsonContent);
		} catch (err) {
			console.error("Error loading configuration", err);
			return 1;
		}

		try {
			await this.process(tsToOpenApiConfig, outputApiJson, outputWorkingDir);
		} catch (err) {
			console.error(err);
			return 1;
		} finally {
			try {
				await rm(outputWorkingDir, { recursive: true });
			} catch {}
		}

		return 0;
	}

	/**
	 * Process the configuration.
	 * @param tsToOpenApiConfig The API Configuration
	 * @param outputApiJson The json file to output the API to.
	 * @param outputWorkingDir The working directory.
	 * @returns The true if the process was successful.
	 */
	public async process(
		tsToOpenApiConfig: ITsToOpenApiConfig,
		outputApiJson: string,
		outputWorkingDir: string
	): Promise<boolean> {
		await writeFile(
			path.join(outputWorkingDir, "package.json"),
			JSON.stringify(
				{
					version: "1.0.0",
					name: "ts-to-openapi-working",
					dependencies: {}
				},
				undefined,
				"\t"
			)
		);

		await writeFile(
			path.join(outputWorkingDir, "tsconfig.json"),
			JSON.stringify(
				{
					compilerOptions: {}
				},
				undefined,
				"\t"
			)
		);

		const openApi: IOpenApi = {
			openapi: "3.1.0",
			info: {
				title: tsToOpenApiConfig.title,
				description: tsToOpenApiConfig.description,
				version: tsToOpenApiConfig.version,
				license: {
					name: tsToOpenApiConfig.licenseName,
					url: tsToOpenApiConfig.licenseUrl
				}
			},
			servers: Is.arrayValue(tsToOpenApiConfig.servers)
				? tsToOpenApiConfig.servers.map(s => ({ url: s }))
				: undefined,
			tags: [],
			paths: {}
		};

		console.log("Creating security schemas");
		const pathSecurity: { [name: string]: string[] }[] = [];
		const securitySchemes: { [name: string]: IOpenApiSecurityScheme } = {};

		if (Is.arrayValue(tsToOpenApiConfig.authMethods)) {
			for (const authMethod of tsToOpenApiConfig.authMethods) {
				const security: { [name: string]: string[] } = {};
				if (authMethod === "basic") {
					securitySchemes.basicAuthScheme = {
						type: "http",
						scheme: "basic"
					};
					security.basicAuthScheme = [];
				} else if (authMethod === "jwtBearer") {
					securitySchemes.jwtBearerAuthScheme = {
						type: "http",
						scheme: "bearer",
						bearerFormat: "JWT"
					};
					security.jwtBearerAuthScheme = [];
				} else if (authMethod === "jwtCookie") {
					securitySchemes.jwtCookieAuthScheme = {
						type: "apiKey",
						in: "cookie",
						name: "auth_token"
					};
					security.jwtCookieAuthScheme = [];
				} else if (authMethod === "apiKeyQuery") {
					securitySchemes.apiKeyQueryAuthScheme = {
						type: "apiKey",
						in: "query",
						name: "X-Api-Key"
					};
					security.apiKeyQueryAuthScheme = [];
				} else if (authMethod === "apiKeyHeader") {
					securitySchemes.apiKeyHeaderAuthScheme = {
						type: "apiKey",
						in: "header",
						name: "X-Api-Key"
					};
					security.apiKeyHeaderAuthScheme = [];
				}
				pathSecurity.push(security);
			}
		}

		const types: string[] = Object.values(HTTP_STATUS_CODE_MAP).map(h => h.responseType);

		const responseCodes: string[] = [];

		const inputResults: IInputResult[] = [];

		const typeRoots: string[] = [];

		const restRoutes = await this.loadPackages(tsToOpenApiConfig, outputWorkingDir, typeRoots);

		for (const restRoute of restRoutes) {
			const result = await this.processPackageRestDetails(restRoute);
			inputResults.push(result);

			for (const inputPath of result.paths) {
				if (inputPath.requestType && !types.includes(inputPath.requestType)) {
					types.push(inputPath.requestType);
				}

				if (inputPath.responseType) {
					const rt = inputPath.responseType.map(i => i.type);
					for (const r of rt) {
						if (r && inputPath.responseType && !types.includes(r)) {
							types.push(r);
						}
					}
				}
			}
		}

		console.log();
		console.log("Generating Schemas");
		const schemas = await this.generateSchemas(typeRoots, types, outputWorkingDir);

		const usedCommonResponseTypes: string[] = ["IErrorResponse"];

		for (let i = 0; i < inputResults.length; i++) {
			const result = inputResults[i];
			for (const tag of result.tags) {
				openApi.tags?.push(tag);
			}

			for (const inputPath of result.paths) {
				const responses: ({ code?: HttpStatusCodes } & IOpenApiResponse)[] = [];

				const responseTypes = inputPath.responseType;

				if (pathSecurity.length > 0) {
					responseTypes.push({
						statusCode: HttpStatusCodes.UNAUTHORIZED,
						type: nameof<IUnauthorizedResponse>()
					});
				}

				for (const r of responseTypes) {
					if (r.type) {
						if (schemas[r.type]) {
							let headers: { [id: string]: IOpenApiHeader } | undefined;
							let examples: { [id: string]: IOpenApiExample } | undefined;

							if (Is.arrayValue(r.examples)) {
								for (const example of r.examples) {
									if (Is.object<IHttpResponse>(example.response)) {
										if (Is.objectValue(example.response.headers)) {
											headers ??= {};
											const headersSchema = schemas[r.type].properties?.headers as JSONSchema7;
											for (const header in example.response.headers) {
												const headerValue = example.response.headers[header];
												const propertySchema = headersSchema.properties?.[header];
												const schemaType = Is.object<JSONSchema7>(propertySchema)
													? propertySchema?.type
													: undefined;
												headers[header] = {
													schema: {
														type: Is.string(schemaType) ? schemaType : "string"
													},
													description: `e.g. ${
														Is.array(headerValue) ? headerValue.join(",") : headerValue
													}`
												};
											}
										}
										if (!Is.undefined(example.response.body)) {
											examples ??= {};
											examples[example.id] = {
												summary: example.description,
												value: example.response.body
											};
										}
									}
								}
							} else {
								const statusExample = getHttpExampleFromType(r.type);
								if (statusExample) {
									examples = {};
									examples.exampleResponse = {
										value: statusExample
									};
								}
							}

							responses.push({
								code: r.statusCode,
								description: schemas[r.type]?.description,
								content:
									r.type === nameof<ICreatedResponse>() || r.type === nameof<INoContentResponse>()
										? undefined
										: {
												"application/json": {
													schema: {
														$ref: `#/definitions/${r.type}`
													},
													examples
												}
											},
								headers
							});
						}
						if (!usedCommonResponseTypes.includes(r.type)) {
							usedCommonResponseTypes.push(r.type);
						}
					} else if (r.mimeType) {
						const resp: { code: number } & IOpenApiResponse = {
							code: HttpStatusCodes.OK,
							description: r.description,
							content: {}
						};

						resp.content ??= {};
						resp.content[r.mimeType] = {
							schema: {
								type: "string",
								format: r.mimeType === "application/octet-stream" ? "binary" : undefined
							}
						};

						responses.push(resp);
					}
				}

				if (inputPath.responseCodes.length > 0) {
					for (const responseCode of inputPath.responseCodes) {
						const responseCodeDetails = HTTP_STATUS_CODE_MAP[responseCode];
						// Only include the response code if it hasn't already been
						// included with a specific response
						if (!responseTypes.some(r => r.statusCode === responseCodeDetails.code)) {
							if (!responseCodes.includes(responseCode)) {
								responseCodes.push(responseCode);
							}

							let examples: { [id: string]: IOpenApiExample } | undefined;

							if (responseCodeDetails.example) {
								examples = {
									exampleResponse: {
										value: responseCodeDetails.example
									}
								};
							}

							if (schemas[responseCodeDetails.responseType]) {
								responses.push({
									code: responseCodeDetails.code,
									description: schemas[responseCodeDetails.responseType].description,
									content: {
										"application/json": {
											schema: {
												$ref: `#/definitions/${responseCodeDetails.responseType}`
											},
											examples
										}
									}
								});
							}

							if (!usedCommonResponseTypes.includes(responseCodeDetails.responseType)) {
								usedCommonResponseTypes.push(responseCodeDetails.responseType);
							}
						}
					}
				}

				const pathOrQueryParams: {
					name: string;
					description?: string;
					required: boolean;
					in: "path" | "query";
					type: string;
					style?: string;
					example?: unknown;
				}[] = inputPath.pathParameters.map(p => ({
					name: p,
					description: "",
					required: true,
					type: "string",
					in: "path",
					style: "simple"
				}));

				const requestExample: IHttpRequest | undefined = inputPath.requestExamples?.[0]
					?.request as IHttpRequest;

				if (Is.object(requestExample.path)) {
					for (const pathOrQueryParam of pathOrQueryParams) {
						if (requestExample.path[pathOrQueryParam.name]) {
							pathOrQueryParam.example = requestExample.path[pathOrQueryParam.name];
						}
					}
				}

				let requestObject: JSONSchema7 | undefined = inputPath.requestType
					? schemas[inputPath.requestType]
					: undefined;

				if (requestObject?.properties) {
					// If there is a path object convert these to params
					if (Is.object<JSONSchema7>(requestObject.properties.path)) {
						for (const pathParam of pathOrQueryParams) {
							const prop = requestObject.properties.path.properties?.[pathParam.name];
							if (Is.object<JSONSchema7>(prop)) {
								pathParam.description = prop.description ?? pathParam.description;
								pathParam.type = (prop.type as string) ?? pathParam.type;
								pathParam.required = true;
								delete requestObject.properties.path.properties?.[pathParam.name];
							}
						}
						delete requestObject.properties.path;
					}

					// If there is a query object convert these to params as well
					if (Is.object<JSONSchema7>(requestObject.properties.query)) {
						for (const prop in requestObject.properties.query.properties) {
							const queryProp = requestObject.properties.query.properties[prop];
							if (Is.object<JSONSchema7>(queryProp)) {
								let example: unknown;
								if (Is.object(requestExample.query) && requestExample.query[prop]) {
									example = requestExample.query[prop];
								}

								pathOrQueryParams.push({
									name: prop,
									description: queryProp.description,
									required: Boolean(requestObject.required?.includes(prop)),
									type: queryProp.type as string,
									in: "query",
									example
								});
								delete requestObject.properties.query.properties[prop];
							}
						}
						delete requestObject.properties.query;
					}

					// If we have used all the properties from the object in the
					// path we should remove it.
					if (Object.keys(requestObject.properties).length === 0 && inputPath.requestType) {
						delete schemas[inputPath.requestType];
						requestObject = undefined;
					}
				}

				if (tsToOpenApiConfig.restRoutes) {
					let fullPath = StringHelper.trimTrailingSlashes(inputPath.path);
					if (fullPath.length === 0) {
						fullPath = "/";
					}
					openApi.paths[fullPath] = openApi.paths[fullPath] ?? {};

					const method = inputPath.method.toLowerCase();
					openApi.paths[fullPath][method] = {
						operationId: inputPath.operationId,
						summary: inputPath.summary,
						tags: [inputPath.tag],
						parameters:
							pathOrQueryParams.length > 0
								? pathOrQueryParams.map(p => ({
										name: p.name,
										description: p.description,
										in: p.in,
										required: p.required,
										schema: {
											type: p.type
										},
										style: p.style,
										example: p.example
									}))
								: undefined
					};

					if (pathSecurity.length > 0) {
						openApi.paths[fullPath][method].security = pathSecurity;
					}

					if (responses.length > 0) {
						const openApiResponses: { [code: string]: IOpenApiResponse } = {};
						for (const response of responses) {
							const code = response.code;
							if (code) {
								delete response.code;
								openApiResponses[code as number] = response;
							}
						}
						openApi.paths[fullPath][method].responses = openApiResponses;
					}

					if (requestObject && inputPath.requestType) {
						let examples: { [id: string]: IOpenApiExample } | undefined;
						if (Is.arrayValue(inputPath.requestExamples)) {
							for (const example of inputPath.requestExamples) {
								if (
									Is.object<{ body: unknown }>(example.request) &&
									!Is.undefined(example.request.body)
								) {
									examples ??= {};
									examples[example.id] = {
										summary: example.description,
										value: example.request.body
									};
								}
							}
						}
						openApi.paths[fullPath][method].requestBody = {
							description: requestObject.description,
							required: true,
							content: {
								"application/json": {
									schema: {
										$ref: `#/definitions/${inputPath.requestType}`
									},
									examples
								}
							}
						};
					}
				}
			}
		}

		// Remove the response codes that we haven't used
		for (const httpStatusCode in HTTP_STATUS_CODE_MAP) {
			if (!usedCommonResponseTypes.includes(HTTP_STATUS_CODE_MAP[httpStatusCode].responseType)) {
				delete schemas[HTTP_STATUS_CODE_MAP[httpStatusCode].responseType];
			}
		}

		console.log();
		console.log("Finalising Schemas");

		const substituteSchemas: { from: string; to: string }[] = [];

		// Remove the I, < and > from names
		const finalSchemas: {
			[id: string]: JSONSchema7;
		} = {};
		for (const schema in schemas) {
			const props = schemas[schema].properties;

			if (Is.object(props)) {
				this.tidySchemaProperties(props);

				// Promote any schemas with just a single body property to the top level
				if (Is.object<JSONSchema7>(props.body) && Object.keys(props).length === 1) {
					schemas[schema] = props.body;
				}
			}

			// If the final schema has no properties and is just a ref to another object type
			// then replace the references with that of the referenced type
			const ref = schemas[schema].$ref;
			if (!Is.arrayValue(schemas[schema].properties) && Is.stringValue(ref)) {
				substituteSchemas.push({ from: schema, to: ref });
			} else {
				let finalName = schema;

				// If the type has an interface name e.g. ISomething then strip the I
				if (/I[A-Z]/.test(finalName)) {
					finalName = finalName.slice(1);
				}

				finalName = finalName.replace("<", "_").replace(">", "_");

				if (finalName.endsWith("[]")) {
					finalName = `ListOf${finalName.slice(0, -2)}`;
				}

				finalSchemas[finalName] = schemas[schema];
			}
		}

		openApi.components = {
			schemas: finalSchemas,
			securitySchemes
		};

		let json = JSON.stringify(openApi, undefined, "    ");

		// Remove the reference only schemas, repeating until no more substitutions
		let performedSubstitution;
		do {
			performedSubstitution = false;
			for (const substituteSchema of substituteSchemas) {
				const schemaParts = substituteSchema.to.split("/");
				const find = new RegExp(`#/definitions/${substituteSchema.from}`, "g");
				if (find.test(json)) {
					json = json.replace(find, `#/definitions/${schemaParts[schemaParts.length - 1]}`);
					performedSubstitution = true;
				}
			}
		} while (performedSubstitution);

		// Update the location of the components
		json = json.replace(/#\/definitions\//g, "#/components/schemas/");

		// Remove the I from the type names as long as they are interfaces
		json = json.replace(/#\/components\/schemas\/I([A-Z].*)/g, "#/components/schemas/$1");

		// Remove the array [] from the type names
		// eslint-disable-next-line unicorn/better-regex
		json = json.replace(/#\/components\/schemas\/(.*)\[\]/g, "#/components/schemas/ListOf$1");

		// Cleanup the generic markers
		json = json.replace(/%3Cunknown%3E/g, "");

		console.log("Writing Output:", outputApiJson);
		try {
			await mkdir(path.dirname(outputApiJson), { recursive: true });
		} catch {}
		await writeFile(outputApiJson, json);

		return true;
	}

	/**
	 * Process the REST details for a package.
	 * @param baseDir The base directory other locations are relative to.
	 * @param prefix The prefix.
	 * @param restDetails The package details.
	 * @returns The paths and schemas for the input.
	 * @internal
	 */
	private async processPackageRestDetails(packageDetails: {
		restRoutes: IRestRoute[];
		tags: ITag[];
	}): Promise<IInputResult> {
		const result: IInputResult = {
			paths: [],
			tags: []
		};

		for (const route of packageDetails.restRoutes) {
			console.log("\tRoute", route.operationId, route.method, route.path);
			const pathParameters: string[] = [];

			const pathPaths = route.path.split("/");
			const finalPathParts = [];
			for (const part of pathPaths) {
				if (part.startsWith(":")) {
					finalPathParts.push(`{${part.slice(1)}}`);
					pathParameters.push(part.slice(1));
				} else {
					finalPathParts.push(part);
				}
			}

			const responseType: {
				statusCode: HttpStatusCodes;
				type?: string;
				mimeType?: string;
				description?: string;
				examples?: {
					id: string;
					description?: string;
					response: unknown;
				}[];
			}[] = [];

			if (route.responseContentType) {
				for (const contentType of route.responseContentType) {
					responseType.push({
						statusCode: HttpStatusCodes.OK,
						description: contentType.description,
						mimeType: contentType.mimeType
					});
				}
			}

			// If there is no response type automatically add a success
			if (Is.empty(route.responseType)) {
				// But only if we haven't got a response already for different content type
				if (responseType.length === 0) {
					responseType.push({
						type: nameof<IOkResponse>(),
						statusCode: HttpStatusCodes.OK
					});
				}
			} else if (Is.array(route.responseType)) {
				// Find the response codes for the response types
				for (const rt of route.responseType) {
					const responseCode = getHttpStatusCodeFromType(rt.type);
					responseType.push({
						...rt,
						statusCode: responseCode,
						examples: rt.examples
					});
				}
			}

			const inputPath: IInputPath = {
				path: finalPathParts.join("/"),
				method: route.method,
				pathParameters,
				operationId: route.operationId,
				tag: route.tag,
				summary: route.summary,
				requestType: route.requestType?.type,
				requestExamples: route.requestType?.examples,
				responseType,
				responseCodes: ["BAD_REQUEST"]
			};

			const handlerSource = route.handler.toString();

			let match;
			const re = /HttpStatusCodes\.([A-Z_]*)/g;
			while ((match = re.exec(handlerSource)) !== null) {
				inputPath.responseCodes.push(match[1]);
			}

			result.paths.push(inputPath);
		}

		return result;
	}

	/**
	 * Generate schemas for the models.
	 * @param modelDirWildcards The filenames for all the models.
	 * @param types The types of the schema objects.
	 * @param outputWorkingDir The working directory.
	 * @returns Nothing.
	 * @internal
	 */
	private async generateSchemas(
		modelDirWildcards: string[],
		types: string[],
		outputWorkingDir: string
	): Promise<{
		[id: string]: JSONSchema7;
	}> {
		const allSchemas: { [id: string]: JSONSchema7 } = {};

		const arraySingularTypes: string[] = [];
		for (const type of types) {
			if (type.endsWith("[]")) {
				const singularType = type.slice(0, -2);
				arraySingularTypes.push(singularType);
				if (!types.includes(singularType)) {
					types.push(singularType);
				}
			}
		}

		for (const files of modelDirWildcards) {
			console.log("Processing Models", files.replace(/\\/g, "/"));
			const generator = createGenerator({
				path: files.replace(/\\/g, "/"),
				type: "*",
				tsconfig: path.join(outputWorkingDir, "tsconfig.json"),
				skipTypeCheck: true
			});

			const schema = generator.createSchema("*");

			if (schema.definitions) {
				for (const def in schema.definitions) {
					// Cleanup the generic markers
					const defSub = def.replace(/</g, "%3C").replace(/>/g, "%3E");
					allSchemas[defSub] = schema.definitions[def] as JSONSchema7;
				}
			}
		}

		const referencedSchemas: { [id: string]: JSONSchema7 } = {};

		this.extractTypes(allSchemas, types, referencedSchemas);

		for (const arraySingularType of arraySingularTypes) {
			referencedSchemas[`${arraySingularType}[]`] = {
				type: "array",
				items: {
					$ref: `#/components/schemas/${arraySingularType}`
				}
			};
		}

		return referencedSchemas;
	}

	/**
	 * Extract the required types from all the known schemas.
	 * @param allSchemas All the known schemas.
	 * @param requiredTypes The required types.
	 * @param referencedSchemas The references schemas.
	 * @internal
	 */
	private extractTypes(
		allSchemas: { [id: string]: JSONSchema7 },
		requiredTypes: string[],
		referencedSchemas: { [id: string]: JSONSchema7 }
	): void {
		for (const type of requiredTypes) {
			if (allSchemas[type] && !referencedSchemas[type]) {
				referencedSchemas[type] = allSchemas[type];

				this.extractTypesFromSchema(allSchemas, allSchemas[type], referencedSchemas);
			}
		}
	}

	/**
	 * Extract type from properties definition.
	 * @param allTypes All the known types.
	 * @param schema The schema to extract from.
	 * @param output The output types.
	 * @internal
	 */
	private extractTypesFromSchema(
		allTypes: { [id: string]: JSONSchema7 },
		schema: JSONSchema7,
		output: { [id: string]: JSONSchema7 }
	): void {
		const additionalTypes = [];

		if (Is.stringValue(schema.$ref)) {
			additionalTypes.push(schema.$ref.replace("#/definitions/", ""));
		} else if (Is.object<JSONSchema7>(schema.items)) {
			if (Is.arrayValue<JSONSchema7>(schema.items)) {
				for (const itemSchema of schema.items) {
					this.extractTypesFromSchema(allTypes, itemSchema, output);
				}
			} else {
				this.extractTypesFromSchema(allTypes, schema.items, output);
			}
		} else if (Is.object(schema.properties)) {
			for (const prop in schema.properties) {
				const p = schema.properties[prop];
				if (Is.object<JSONSchema7>(p)) {
					this.extractTypesFromSchema(allTypes, p, output);
				}
			}
		} else if (Is.arrayValue(schema.anyOf)) {
			for (const prop of schema.anyOf) {
				if (Is.object<JSONSchema7>(prop)) {
					this.extractTypesFromSchema(allTypes, prop, output);
				}
			}
		}

		if (additionalTypes.length > 0) {
			this.extractTypes(allTypes, additionalTypes, output);
		}
	}

	/**
	 * Tidy up the schemas for use in OpenAPI context.
	 * @param props The properties to tidy up.
	 * @internal
	 */
	private tidySchemaProperties(props: { [id: string]: JSONSchema7 | boolean }): void {
		for (const prop in props) {
			const p = props[prop];
			if (Is.object<JSONSchema7>(p)) {
				// For OpenAPI we don't include a description for
				// items that have refs
				if (p.$ref) {
					delete p.description;
				}

				if (p.properties) {
					this.tidySchemaProperties(p.properties);
				}

				if (
					p.items &&
					Is.object<JSONSchema7>(p.items) &&
					Is.object<JSONSchema7>(p.items.properties)
				) {
					this.tidySchemaProperties(p.items.properties);
				}
			}
		}
	}

	/**
	 * Load the packages from config and get the routes and tags from them.
	 * @param tsToOpenApiConfig The app config.
	 * @param outputWorkingDir The working directory.
	 * @param typeRoots The model roots.
	 * @returns The routes and tags for each package.
	 * @internal
	 */
	private async loadPackages(
		tsToOpenApiConfig: ITsToOpenApiConfig,
		outputWorkingDir: string,
		typeRoots: string[]
	): Promise<
		{
			restRoutes: IRestRoute[];
			tags: ITag[];
		}[]
	> {
		const restRoutes: {
			restRoutes: IRestRoute[];
			tags: ITag[];
		}[] = [];

		const packages: string[] = [];
		for (const configRestRoutes of tsToOpenApiConfig.restRoutes) {
			const version = configRestRoutes.version ?? "latest";
			packages.push(`${configRestRoutes.package}@${version}`);
		}

		console.log("Loading Modules:", packages.join(" "));
		await this.runShellCmd("npm", ["install", ...packages], outputWorkingDir);

		console.log();
		for (const configRestRoutes of tsToOpenApiConfig.restRoutes) {
			console.log("Reading Package JSON:", configRestRoutes.package);
			const pkgJsonContent = await readFile(
				path.join(outputWorkingDir, "node_modules", configRestRoutes.package, "package.json"),
				"utf8"
			);
			const pkgJson: IPackageJson = JSON.parse(pkgJsonContent);

			const modelsDir = path.join(
				outputWorkingDir,
				"node_modules",
				configRestRoutes.package,
				"dist",
				"types",
				"models"
			);
			if (await this.dirExists(modelsDir)) {
				typeRoots.push(path.join(modelsDir, "**/*.ts"));
			}
			const errorDir = path.join(
				outputWorkingDir,
				"node_modules",
				configRestRoutes.package,
				"dist",
				"types",
				"errors"
			);
			if (await this.dirExists(errorDir)) {
				typeRoots.push(path.join(errorDir, "**/*.ts"));
			}

			if (pkgJson.dependencies) {
				for (const dep in pkgJson.dependencies) {
					if (dep.startsWith("@gtsc")) {
						const modelsDirDep = path.join(
							outputWorkingDir,
							"node_modules",
							dep,
							"dist",
							"types",
							"models"
						);
						if (await this.dirExists(modelsDirDep)) {
							typeRoots.push(path.join(modelsDirDep, "**/*.ts"));
						}

						const errorDirDep = path.join(
							outputWorkingDir,
							"node_modules",
							dep,
							"dist",
							"types",
							"errors"
						);
						if (await this.dirExists(errorDirDep)) {
							typeRoots.push(path.join(errorDirDep, "**/*.ts"));
						}
					}
				}
			}

			console.log("Importing Module:", configRestRoutes.package);
			const pkg = await import(
				`file://${path.join(outputWorkingDir, "node_modules", configRestRoutes.package, "dist/esm/index.mjs")}`
			);
			const generateMethod = configRestRoutes.routesMethod ?? "generateRestRoutes";
			const tagsProperty = configRestRoutes.tagProperty ?? "tags";
			restRoutes.push({
				restRoutes: pkg[generateMethod](configRestRoutes.pathRoot ?? "", "dummy-service"),
				tags: pkg[tagsProperty]
			});
		}

		return restRoutes;
	}

	/**
	 * Run a shell app.
	 * @param app The app to run in the shell.
	 * @param args The args for the app.
	 * @param cwd The working directory to execute the command in.
	 * @returns Promise to wait for command execution to complete.
	 * @internal
	 */
	private async runShellCmd(app: string, args: string[], cwd: string): Promise<void> {
		return new Promise((resolve, reject) => {
			const osCommand = process.platform.startsWith("win") ? `${app}.cmd` : app;

			const sp = spawn(osCommand, args, {
				stdio: "inherit",
				shell: true,
				cwd
			});

			sp.on("exit", (exitCode, signals) => {
				if (Coerce.number(exitCode) !== 0 || signals?.length) {
					// eslint-disable-next-line no-restricted-syntax
					reject(new Error("Run failed"));
				} else {
					resolve();
				}
			});
		});
	}

	/**
	 * Check if the dir exists.
	 * @param dir The directory to check.
	 * @returns True if the dir exists.
	 * @internal
	 */
	private async dirExists(dir: string): Promise<boolean> {
		try {
			await access(dir);
			return true;
		} catch {
			return false;
		}
	}
}
