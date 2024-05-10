// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import path from "node:path";
import { glob } from "glob";
import {
	type Config,
	SchemaGenerator,
	createParser,
	createFormatter,
	DEFAULT_CONFIG,
	ts,
	DiagnosticError,
	LogicError,
	NoTSConfigError,
	NoRootNamesError,
	type CompletedConfig
} from "ts-json-schema-generator";
import type { ParsedCommandLine } from "typescript";

// Local fix until https://github.com/vega/ts-json-schema-generator/pull/1942 is merged.

/**
 * Override for the default schema generator.
 * @param config The configuration for the schema generator.
 * @returns The schema generator.
 */
export function createGenerator(config: Config): SchemaGenerator {
	const completedConfig = { ...DEFAULT_CONFIG, ...config };
	const program = createProgram(completedConfig);
	const parser = createParser(program, completedConfig);
	const formatter = createFormatter(completedConfig);

	return new SchemaGenerator(program, parser, formatter, completedConfig);
}

/**
 * Override for the default schema generator.
 * @param configFile The configuration file for the schema generator.
 * @returns The tsconfig.
 * @throws {DiagnosticError} When the configuration file has errors.
 */
function loadTsConfigFile(configFile: string): ParsedCommandLine {
	const raw = ts.sys.readFile(configFile);
	if (raw) {
		const config = ts.parseConfigFileTextToJson(configFile, raw);

		if (config.error) {
			throw new DiagnosticError([config.error]);
		} else if (!config.config) {
			throw new LogicError(`Invalid parsed config file "${configFile}"`);
		}

		const parseResult = ts.parseJsonConfigFileContent(
			config.config,
			ts.sys,
			path.resolve(path.dirname(configFile)),
			{},
			configFile
		);
		parseResult.options.noEmit = true;
		delete parseResult.options.out;
		delete parseResult.options.outDir;
		delete parseResult.options.outFile;
		delete parseResult.options.declaration;
		delete parseResult.options.declarationDir;
		delete parseResult.options.declarationMap;

		return parseResult;
	}
	throw new NoTSConfigError();
}

/**
 * Override for the default schema generator.
 * @param config The configuration for the schema generator.
 * @returns The tsconfig.
 */
function getTsConfig(config: Config): ParsedCommandLine {
	if (config.tsconfig) {
		return loadTsConfigFile(config.tsconfig);
	}

	return {
		fileNames: [],
		options: {
			noEmit: true,
			emitDecoratorMetadata: true,
			experimentalDecorators: true,
			target: ts.ScriptTarget.ES5,
			module: ts.ModuleKind.CommonJS,
			strictNullChecks: false
		}
	} as unknown as ParsedCommandLine;
}

/**
 * Override for the default schema generator.
 * @param config The configuration for the schema generator.
 * @returns The program.
 * @throws {NoRootNamesError} When no root names are found.
 */
export function createProgram(config: CompletedConfig): ts.Program {
	const rootNamesFromPath = config.path
		? glob.sync(normalize(path.resolve(config.path))).map(rootName => normalize(rootName))
		: [];
	const tsconfig = getTsConfig(config);
	const rootNames = rootNamesFromPath.length ? rootNamesFromPath : tsconfig.fileNames;

	if (!rootNames.length) {
		throw new NoRootNamesError();
	}

	const program: ts.Program = ts.createProgram(rootNames, tsconfig.options);

	if (!config.skipTypeCheck) {
		const diagnostics = ts.getPreEmitDiagnostics(program);
		if (diagnostics.length) {
			throw new DiagnosticError(diagnostics);
		}
	}

	return program;
}

/**
 * Normalize the path.
 * @param pathPath The path to normalize.
 * @returns The normalized path.
 */
function normalize(pathPath: string): string {
	return pathPath.replace(/\\/g, "/");
}
