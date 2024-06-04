// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

import { exec, spawn } from "node:child_process";
import { access } from "node:fs/promises";
import { Coerce } from "@gtsc/core";

/**
 * Run a shell app.
 * @param app The app to run in the shell.
 * @param args The args for the app.
 * @param cwd The working directory to execute the command in.
 * @returns Promise to wait for command execution to complete.
 * @internal
 */
export async function runShellCmd(app: string, args: string[], cwd: string): Promise<void> {
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
export async function dirExists(dir: string): Promise<boolean> {
	try {
		await access(dir);
		return true;
	} catch {
		return false;
	}
}

/**
 * Find the NPM root based on a package.json path.
 * @param rootFolder The path to the package.json.
 * @returns The root path.
 * @internal
 */
export async function findNpmRoot(rootFolder: string): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		exec("npm root", { cwd: rootFolder }, (error, stdout, stderr) => {
			if (error) {
				reject(error);
			}
			resolve(stdout.trim());
		});
	});
}
