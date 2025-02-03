// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { CLIDisplay, CLIUtils } from "@twin.org/cli-core";
import { GeneralError, I18n, Is, StringHelper } from "@twin.org/core";
import type { Command } from "commander";
import type { JSONSchema7 } from "json-schema";
import { createGenerator } from "ts-json-schema-generator";
import type { ITsToSchemaConfig } from "../models/ITsToSchemaConfig";

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

	CLIDisplay.task(I18n.formatMessage("commands.ts-to-schema.progress.generatingSchemas"));
	const schemas = await generateSchemas(config.sources, config.types, workingDirectory);

	CLIDisplay.break();
	CLIDisplay.task(I18n.formatMessage("commands.ts-to-schema.progress.writingSchemas"));
	for (const type of config.types) {
		if (Is.empty(schemas[type])) {
			throw new GeneralError("commands", "commands.ts-to-schema.schemaNotFound", { type });
		}
		let content = JSON.stringify(schemas[type], undefined, "\t");

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
		CLIDisplay.value(
			I18n.formatMessage("commands.ts-to-schema.progress.models"),
			files.replace(/\\/g, "/"),
			1
		);
		const generator = createGenerator({
			path: files.replace(/\\/g, "/"),
			type: "*",
			tsconfig: path.join(outputWorkingDir, "tsconfig.json"),
			skipTypeCheck: true,
			expose: "all"
		});

		const schema = generator.createSchema("*");

		if (schema.definitions) {
			for (const def in schema.definitions) {
				// Remove the partial markers
				let defSub = def.replace(/^Partial<(.*?)>/g, "$1");
				// Cleanup the generic markers
				defSub = defSub.replace(/</g, "%3C").replace(/>/g, "%3E");
				allSchemas[defSub] = schema.definitions[def] as JSONSchema7;
			}
		}
	}

	const referencedSchemas: { [id: string]: JSONSchema7 } = {};

	extractTypes(allSchemas, types, referencedSchemas);

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
function extractTypes(
	allSchemas: { [id: string]: JSONSchema7 },
	requiredTypes: string[],
	referencedSchemas: { [id: string]: JSONSchema7 }
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
	allTypes: { [id: string]: JSONSchema7 },
	schema: JSONSchema7,
	output: { [id: string]: JSONSchema7 }
): void {
	const additionalTypes = [];

	if (Is.stringValue(schema.$ref)) {
		additionalTypes.push(
			schema.$ref.replace("#/definitions/", "").replace(/^Partial%3C(.*?)%3E/g, "$1")
		);
	} else if (Is.object<JSONSchema7>(schema.items)) {
		if (Is.arrayValue<JSONSchema7>(schema.items)) {
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
				if (Is.object<JSONSchema7>(p)) {
					extractTypesFromSchema(allTypes, p, output);
				}
			}
		}
		if (Is.object(schema.additionalProperties)) {
			extractTypesFromSchema(allTypes, schema.additionalProperties, output);
		}
	} else if (Is.arrayValue(schema.anyOf)) {
		for (const prop of schema.anyOf) {
			if (Is.object<JSONSchema7>(prop)) {
				extractTypesFromSchema(allTypes, prop, output);
			}
		}
	} else if (Is.arrayValue(schema.oneOf)) {
		for (const prop of schema.oneOf) {
			if (Is.object<JSONSchema7>(prop)) {
				extractTypesFromSchema(allTypes, prop, output);
			}
		}
	}

	if (additionalTypes.length > 0) {
		extractTypes(allTypes, additionalTypes, output);
	}
}
