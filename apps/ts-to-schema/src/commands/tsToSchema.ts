// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { CLIDisplay, CLIUtils } from "@twin.org/cli-core";
import { ArrayHelper, GeneralError, I18n, Is, StringHelper } from "@twin.org/core";
import type { Command } from "commander";
import { createGenerator } from "ts-json-schema-generator";
import type { IJsonSchema } from "../models/IJsonSchema";
import type { ITsToSchemaConfig } from "../models/ITsToSchemaConfig";

const SCHEMA_VERSION = "https://json-schema.org/draft/2020-12/schema";

/**
 * Build the root command to be consumed by the CLI.
 * @param program The command to build on.
 */
export function buildCommandTsToSchema(program: Command): void {
	program
		.argument(
			I18n.formatMessage("commands.ts-to-schema.options.config.param"),
			I18n.formatMessage("commands.ts-to-schema.options.config.description")
		)
		.argument(
			I18n.formatMessage("commands.ts-to-schema.options.output-folder.param"),
			I18n.formatMessage("commands.ts-to-schema.options.output-folder.description")
		)
		.action(async (config, outputFolder, opts) => {
			await actionCommandTsToSchema(config, outputFolder, opts);
		});
}

/**
 * Action the root command.
 * @param configFile The optional configuration file.
 * @param outputFolder The output folder for the schemas.
 * @param opts The options for the command.
 */
export async function actionCommandTsToSchema(
	configFile: string,
	outputFolder: string,
	opts: unknown
): Promise<void> {
	let outputWorkingDir: string | undefined;
	try {
		let config: ITsToSchemaConfig | undefined;

		const fullConfigFile = path.resolve(configFile);
		const fullOutputFolder = path.resolve(outputFolder);
		outputWorkingDir = path.join(fullOutputFolder, "working");

		CLIDisplay.value(I18n.formatMessage("commands.ts-to-schema.labels.configJson"), fullConfigFile);
		CLIDisplay.value(
			I18n.formatMessage("commands.ts-to-schema.labels.outputFolder"),
			fullOutputFolder
		);
		CLIDisplay.value(
			I18n.formatMessage("commands.ts-to-schema.labels.outputWorkingDir"),
			outputWorkingDir
		);
		CLIDisplay.break();

		try {
			CLIDisplay.task(I18n.formatMessage("commands.ts-to-schema.progress.loadingConfigJson"));
			CLIDisplay.break();

			config = await CLIUtils.readJsonFile<ITsToSchemaConfig>(fullConfigFile);
		} catch (err) {
			throw new GeneralError("commands", "commands.ts-to-schema.configFailed", undefined, err);
		}

		if (Is.empty(config)) {
			throw new GeneralError("commands", "commands.ts-to-schema.configFailed");
		}

		CLIDisplay.task(I18n.formatMessage("commands.ts-to-schema.progress.creatingWorkingDir"));
		await mkdir(outputWorkingDir, { recursive: true });
		CLIDisplay.break();

		await tsToSchema(config ?? {}, fullOutputFolder, outputWorkingDir);

		CLIDisplay.break();
		CLIDisplay.done();
	} finally {
		try {
			if (outputWorkingDir) {
				await rm(outputWorkingDir, { recursive: true });
			}
		} catch {}
	}
}

/**
 * Convert the TypeScript definitions to JSON Schemas.
 * @param config The configuration for the app.
 * @param outputFolder The location of the folder to output the JSON schemas.
 * @param workingDirectory The folder the app was run from.
 */
export async function tsToSchema(
	config: ITsToSchemaConfig,
	outputFolder: string,
	workingDirectory: string
): Promise<void> {
	await writeFile(
		path.join(workingDirectory, "tsconfig.json"),
		JSON.stringify(
			{
				compilerOptions: {}
			},
			undefined,
			"\t"
		)
	);

	CLIDisplay.break();
	CLIDisplay.task(I18n.formatMessage("commands.ts-to-schema.progress.writingSchemas"));
	for (const typeSource of config.types) {
		const typeSourceParts = typeSource.split("/");
		const type = StringHelper.pascalCase(
			typeSourceParts[typeSourceParts.length - 1].replace(/(\.d)?\.ts$/, ""),
			false
		);

		let schemaObject;
		if (Is.object<IJsonSchema>(config.overrides?.[type])) {
			CLIDisplay.task(I18n.formatMessage("commands.ts-to-schema.progress.overridingSchema"));
			schemaObject = config.overrides?.[type];
		} else {
			CLIDisplay.task(I18n.formatMessage("commands.ts-to-schema.progress.generatingSchema"));

			const schemas = await generateSchemas(typeSource, type, workingDirectory);
			if (Is.empty(schemas[type])) {
				throw new GeneralError("commands", "commands.ts-to-schema.schemaNotFound", { type });
			}
			schemaObject = schemas[type];
		}

		schemaObject = finaliseSchema(schemaObject, config.baseUrl, type);

		let content = JSON.stringify(schemaObject, undefined, "\t");

		if (Is.objectValue(config.externalReferences)) {
			for (const external in config.externalReferences) {
				content = content.replace(
					new RegExp(`#/definitions/${external}`, "g"),
					config.externalReferences[external]
				);
			}
		}

		// First replace all types that start with II to a single I with the new base url
		content = content.replace(/#\/definitions\/II(.*)/g, `${config.baseUrl}I$1`);

		// Then other types starting with capitals (optionally interfaces starting with I)
		content = content.replace(/#\/definitions\/I?([A-Z].*)/g, `${config.baseUrl}$1`);

		const filename = path.join(outputFolder, `${StringHelper.stripPrefix(type)}.json`);
		CLIDisplay.value(
			I18n.formatMessage("commands.ts-to-schema.progress.writingSchema"),
			filename,
			1
		);
		await writeFile(filename, `${content}\n`);
	}
}

/**
 * Generate schemas for the models.
 * @param modelDirWildcards The filenames for all the models.
 * @param types The types of the schema objects.
 * @param outputWorkingDir The working directory.
 * @returns Nothing.
 * @internal
 */
async function generateSchemas(
	typeSource: string,
	type: string,
	outputWorkingDir: string
): Promise<{
	[id: string]: IJsonSchema;
}> {
	const allSchemas: { [id: string]: IJsonSchema } = {};

	CLIDisplay.value(I18n.formatMessage("commands.ts-to-schema.progress.models"), typeSource, 1);
	const generator = createGenerator({
		path: typeSource,
		type,
		tsconfig: path.join(outputWorkingDir, "tsconfig.json"),
		skipTypeCheck: true,
		expose: "all"
	});

	const schema = generator.createSchema("*");

	if (schema.definitions) {
		for (const def in schema.definitions) {
			const defSub = normaliseTypeName(def);
			allSchemas[defSub] = schema.definitions[def] as IJsonSchema;
		}
	}

	const referencedSchemas: { [id: string]: IJsonSchema } = {};

	extractTypes(allSchemas, [type], referencedSchemas);

	return referencedSchemas;
}

/**
 * Extract the required types from all the known schemas.
 * @param allSchemas All the known schemas.
 * @param requiredTypes The required types.
 * @param referencedSchemas The references schemas.
 * @internal
 */
function extractTypes(
	allSchemas: { [id: string]: IJsonSchema },
	requiredTypes: string[],
	referencedSchemas: { [id: string]: IJsonSchema }
): void {
	for (const type of requiredTypes) {
		if (allSchemas[type] && !referencedSchemas[type]) {
			referencedSchemas[type] = allSchemas[type];

			extractTypesFromSchema(allSchemas, allSchemas[type], referencedSchemas);
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
function extractTypesFromSchema(
	allTypes: { [id: string]: IJsonSchema },
	schema: IJsonSchema,
	output: { [id: string]: IJsonSchema }
): void {
	const additionalTypes = [];

	if (Is.stringValue(schema.$ref)) {
		additionalTypes.push(
			schema.$ref.replace("#/definitions/", "").replace(/^Partial%3C(.*?)%3E/g, "$1")
		);
	} else if (Is.object<IJsonSchema>(schema.items)) {
		if (Is.arrayValue<IJsonSchema>(schema.items)) {
			for (const itemSchema of schema.items) {
				extractTypesFromSchema(allTypes, itemSchema, output);
			}
		} else {
			extractTypesFromSchema(allTypes, schema.items, output);
		}
	} else if (Is.object(schema.properties) || Is.object(schema.additionalProperties)) {
		if (Is.object(schema.properties)) {
			for (const prop in schema.properties) {
				const p = schema.properties[prop];
				if (Is.object<IJsonSchema>(p)) {
					extractTypesFromSchema(allTypes, p, output);
				}
			}
		}
		if (Is.object(schema.additionalProperties)) {
			extractTypesFromSchema(allTypes, schema.additionalProperties, output);
		}
	} else if (Is.arrayValue(schema.anyOf)) {
		for (const prop of schema.anyOf) {
			if (Is.object<IJsonSchema>(prop)) {
				extractTypesFromSchema(allTypes, prop, output);
			}
		}
	} else if (Is.arrayValue(schema.oneOf)) {
		for (const prop of schema.oneOf) {
			if (Is.object<IJsonSchema>(prop)) {
				extractTypesFromSchema(allTypes, prop, output);
			}
		}
	}

	if (additionalTypes.length > 0) {
		extractTypes(allTypes, additionalTypes, output);
	}
}

/**
 * Process the schema object to ensure it has the correct properties.
 * @param schemaObject The schema object to process.
 * @param baseUrl The base URL for the schema references.
 * @param type The type of the schema object.
 * @returns The finalised schema object.
 */
function finaliseSchema(schemaObject: IJsonSchema, baseUrl: string, type: string): IJsonSchema {
	processArrays(schemaObject);
	const { description, ...rest } = schemaObject;
	return {
		$schema: SCHEMA_VERSION,
		$id: `${baseUrl}${StringHelper.stripPrefix(type)}`,
		description,
		...rest
	};
}

/**
 * Process arrays in the schema object.
 * @param schemaObject The schema object to process.
 */
function processArrays(schemaObject?: IJsonSchema): void {
	if (Is.object<IJsonSchema>(schemaObject)) {
		// latest specs have singular items in `items` property
		// and multiple items in prefixItems, so update the schema accordingly
		// https://www.learnjsonschema.com/2020-12/applicator/items/
		// https://www.learnjsonschema.com/2020-12/applicator/prefixitems/
		const schemaItems = schemaObject.items;
		if (Is.array<IJsonSchema>(schemaItems) || Is.object<IJsonSchema>(schemaItems)) {
			schemaObject.prefixItems = ArrayHelper.fromObjectOrArray<IJsonSchema>(schemaItems);
			schemaObject.items = false;
		}
		const additionalItems = schemaObject.additionalItems;
		if (Is.array<IJsonSchema>(additionalItems) || Is.object<IJsonSchema>(additionalItems)) {
			schemaObject.items = ArrayHelper.fromObjectOrArray<IJsonSchema>(additionalItems)[0];
			delete schemaObject.additionalItems;
		}

		processSchemaDictionary(schemaObject.properties);
		processArrays(schemaObject.additionalProperties);
		processSchemaArray(schemaObject.allOf);
		processSchemaArray(schemaObject.anyOf);
		processSchemaArray(schemaObject.oneOf);
	}
}

/**
 * Process arrays in the schema object.
 * @param schemaDictionary The schema object to process.
 */
function processSchemaDictionary(schemaDictionary?: { [key: string]: IJsonSchema }): void {
	if (Is.object(schemaDictionary)) {
		for (const item of Object.values(schemaDictionary)) {
			if (Is.object<IJsonSchema>(item)) {
				processArrays(item);
			}
		}
	}
}

/**
 * Process arrays in the schema object.
 * @param schemaArray The schema object to process.
 */
function processSchemaArray(schemaArray?: IJsonSchema[]): void {
	if (Is.arrayValue(schemaArray)) {
		for (const item of schemaArray) {
			if (Is.object<IJsonSchema>(item)) {
				processArrays(item);
			}
		}
	}
}

/**
 * Cleanup TypeScript markers from the type name.
 * @param typeName The definition string to clean up.
 * @returns The cleaned up definition string.
 */
function normaliseTypeName(typeName: string): string {
	// Remove the partial markers
	let sTypeName = typeName.replace(/^Partial<(.*?)>/g, "$1");
	sTypeName = sTypeName.replace(/Partial%3CI(.*?)%3E/g, "$1");

	// Remove the omit markers
	sTypeName = sTypeName.replace(/^Omit<(.*?),.*>/g, "$1");
	sTypeName = sTypeName.replace(/Omit%3CI(.*?)%2C.*%3E/g, "$1");

	// Remove the pick markers
	sTypeName = sTypeName.replace(/^Pick<(.*?),.*>/g, "$1");
	sTypeName = sTypeName.replace(/Pick%3CI(.*?)%2C.*%3E/g, "$1");

	// Cleanup the generic markers
	sTypeName = sTypeName.replace(/</g, "%3C").replace(/>/g, "%3E");
	sTypeName = sTypeName.replace(/%3Cunknown%3E/g, "");

	return sTypeName;
}
