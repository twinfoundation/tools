// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CLIBase } from "@gtsc/cli-core";
import type { Command } from "commander";
import { buildCommandTsToSchema } from "./commands/tsToSchema";

/**
 * The main entry point for the CLI.
 */
export class CLI extends CLIBase {
	/**
	 * Run the app.
	 * @param argv The process arguments.
	 * @param localesDirectory The directory for the locales, default to relative to the script.
	 * @returns The exit code.
	 */
	public async run(argv: string[], localesDirectory?: string): Promise<number> {
		return this.execute(
			{
				title: "GTSC TypeScript To Schema",
				appName: "ts-to-schema",
				version: "0.0.5-next.8",
				icon: "⚙️ ",
				supportsEnvFiles: false
			},
			localesDirectory ?? path.join(path.dirname(fileURLToPath(import.meta.url)), "../locales"),
			argv
		);
	}

	/**
	 * Configure any options or actions at the root program level.
	 * @param program The root program command.
	 */
	protected configureRoot(program: Command): void {
		buildCommandTsToSchema(program);
	}
}
