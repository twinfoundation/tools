// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { exec } from "node:child_process";
import { access } from "node:fs/promises";

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
