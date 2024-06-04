// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { BaseError, Is, ObjectHelper, type ILocale, type ILocaleDictionary } from "@gtsc/core";
import type { IMergeLocalesConfig } from "./models/IMergeLocalesConfig";
import type { IPackageJson } from "./models/IPackageJson";
import { dirExists, findNpmRoot } from "./utils";

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
		console.log("Merge Locales");
		console.log("=============");
		console.log("");

		let config: IMergeLocalesConfig | undefined;
		let configJson = "";

		try {
			if (argv.length === 3) {
				configJson = path.resolve(argv[2]);
				console.log("Config JSON:", configJson);

				console.log("Loading Config JSON:", configJson);

				const configJsonContent = await readFile(configJson, "utf8");
				config = JSON.parse(configJsonContent);
			}
		} catch (err) {
			console.error("Error loading configuration", err);
			return 1;
		}

		try {
			await this.process(process.cwd(), config ?? {});
		} catch (err) {
			console.error(err);
			return 1;
		}

		return 0;
	}

	/**
	 * Process the configuration.
	 * @param workingDirectory The folder the app was run from.
	 * @param config The configuration for the app.
	 * @returns The true if the process was successful.
	 */
	public async process(workingDirectory: string, config: IMergeLocalesConfig): Promise<boolean> {
		try {
			console.log("Working Directory:", workingDirectory);

			const outputDirectory = path.resolve(config.outputDirectory ?? "./dist/locales");
			const locales = config.locales ?? [];
			const includePackages = config.includePackages ?? [];
			const excludePackages = config.excludePackages ?? [];

			if (locales.length === 0) {
				locales.push({ label: "English", code: "en" });
			}
			console.log("Output Directory:", outputDirectory);

			console.log("Creating Output Directory:", outputDirectory);
			try {
				await rm(outputDirectory, { recursive: true });
			} catch {}
			await mkdir(outputDirectory, { recursive: true });

			const npmRoot = await findNpmRoot(workingDirectory);
			console.log("NPM Root:", npmRoot);

			let packageNames: string[] = [];

			const packageJson = await this.findDependencies(
				npmRoot,
				path.join(workingDirectory, "package.json"),
				packageNames
			);

			excludePackages.push("@gtsc/merge-locales");
			excludePackages.push("@gtsc/nameof");
			excludePackages.push("@gtsc/nameof-transformer");

			packageNames = packageNames.filter(pkg => !excludePackages.includes(pkg));
			packageNames.push(...includePackages);

			console.log();
			console.log("Packages:");
			for (const packageName of packageNames) {
				console.log(`\t${packageName}`);
			}
			console.log();

			const localeDictionaries: { [locale: string]: ILocaleDictionary } = {};
			await this.mergePackageLocales(
				path.join(workingDirectory, "locales"),
				packageJson.name,
				locales,
				localeDictionaries
			);

			for (const packageName of packageNames) {
				const packageLocalDirectory = path.join(npmRoot, packageName, "locales");
				await this.mergePackageLocales(
					packageLocalDirectory,
					packageName,
					locales,
					localeDictionaries
				);
			}

			console.log();
			console.log("Writing Merged Locales");

			for (const localeDictionary in localeDictionaries) {
				const localeFile = path.join(outputDirectory, `${localeDictionary}.json`);
				console.log("\tWriting Locale:", localeFile);
				await writeFile(
					localeFile,
					JSON.stringify(localeDictionaries[localeDictionary], null, 2),
					"utf8"
				);
			}

			console.log();
			console.log("Done.");
		} catch (error) {
			const err = BaseError.fromError(error);
			console.error(err.message);
			return false;
		}

		return true;
	}

	/**
	 * Merge the locales for a package.
	 * @param packageLocalDirectory The root of the NPM packages.
	 * @param packageName The name of the package.
	 * @param locales The locales to merge.
	 * @internal
	 */
	private async mergePackageLocales(
		packageLocalDirectory: string,
		packageName: string,
		locales: ILocale[],
		localeDictionaries: { [locale: string]: ILocaleDictionary }
	): Promise<void> {
		console.log("Merging Locales for:", packageName);

		if (await dirExists(packageLocalDirectory)) {
			for (const locale of locales) {
				const localeFile = path.join(packageLocalDirectory, `${locale.code}.json`);
				if (await dirExists(localeFile)) {
					console.log("\tMerging Locale:", locale.code);

					const localeContent = await readFile(localeFile, "utf8");
					const localeDictionary = JSON.parse(localeContent) as ILocaleDictionary;
					if (!localeDictionaries[locale.code]) {
						localeDictionaries[locale.code] = {};
					}
					localeDictionaries[locale.code] = ObjectHelper.merge(
						localeDictionaries[locale.code],
						localeDictionary
					);
				}
			}
		}
	}

	/**
	 * Find dependencies for the package.
	 * @param npmRoot The root of the NPM packages.
	 * @param packageJsonPath The path to the package.json.
	 * @param packageNames The package names to add to.
	 * @returns The package details.
	 * @internal
	 */
	private async findDependencies(
		npmRoot: string,
		packageJsonPath: string,
		packageNames: string[]
	): Promise<IPackageJson> {
		const packageJsonContent = await readFile(packageJsonPath, "utf8");
		const packageJson = JSON.parse(packageJsonContent) as IPackageJson;

		if (Is.objectValue(packageJson.dependencies)) {
			for (const pkg in packageJson.dependencies) {
				if (pkg.startsWith("@gtsc") && !packageNames.includes(pkg)) {
					packageNames.push(pkg);
					const packagePath = path.join(npmRoot, pkg, "package.json");
					await this.findDependencies(npmRoot, packagePath, packageNames);
				}
			}
		}

		return packageJson;
	}
}
