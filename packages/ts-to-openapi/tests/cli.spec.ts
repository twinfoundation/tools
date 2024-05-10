// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { rm, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { CLI } from "../src/cli";
import type { ITsToOpenApiConfig } from "../src/models/ITsToOpenApiConfig";

const TEST_DATA_LOCATION = path.resolve(path.join(__dirname, ".tmp"));
const TEST_CONFIG_LOCATION = path.join(TEST_DATA_LOCATION, "config");
const TEST_WORKING_LOCATION = path.join(TEST_DATA_LOCATION, "work");
const TEST_OUTPUT_FILE = path.join(TEST_DATA_LOCATION, "output.json");
const TEST_OUTPUT_FILE2 = path.join(TEST_DATA_LOCATION, "output2.json");

describe("CLI", () => {
	beforeAll(async () => {
		await rm(TEST_DATA_LOCATION, { recursive: true, force: true });
		await mkdir(TEST_CONFIG_LOCATION, { recursive: true });
		await mkdir(TEST_WORKING_LOCATION, { recursive: true });
	});

	afterAll(async () => {
		await rm(TEST_CONFIG_LOCATION, { recursive: true, force: true });
		await rm(TEST_WORKING_LOCATION, { recursive: true, force: true });
	});

	test("Can fail to run with no command line arguments", async () => {
		const cli = new CLI();
		const res = await cli.run([]);
		expect(res).toEqual(1);
	});

	test("Can fail to run with 3 command line arguments and invalid config", async () => {
		const cli = new CLI();
		const res = await cli.run(["node", "script", "config"]);
		expect(res).toEqual(1);
	});

	test("Can run with command line arguments and valid empty config", async () => {
		const cli = new CLI();
		const config: ITsToOpenApiConfig = {
			title: "Global Trade and Supply Chain - Test Endpoints",
			version: "1.0.0",
			description: "REST API for Global Trade and Supply Chain - Test Endpoints.",
			licenseName: "Apache 2.0 License",
			licenseUrl: "https://opensource.org/licenses/Apache-2.0",
			servers: ["https://localhost"],
			authMethods: ["jwtBearer"],
			restRoutes: []
		};

		const configFile = path.join(TEST_CONFIG_LOCATION, "config.json");
		await writeFile(configFile, JSON.stringify(config, undefined, "\t"));
		const res = await cli.run(["node", "script", configFile, TEST_OUTPUT_FILE]);
		expect(res).toEqual(0);
	});

	test("Can run using process directly valid config", async () => {
		const config: ITsToOpenApiConfig = {
			title: "Global Trade and Supply Chain - Test Endpoints",
			version: "1.0.0",
			description: "REST API for Global Trade and Supply Chain - Test Endpoints.",
			licenseName: "Apache 2.0 License",
			licenseUrl: "https://opensource.org/licenses/Apache-2.0",
			servers: ["https://localhost"],
			authMethods: ["jwtBearer"],
			restRoutes: [
				{
					package: "@gtsc/logging-service",
					version: "next",
					pathRoot: "/logging"
				},
				{
					package: "@gtsc/identity-service",
					version: "next",
					pathRoot: "/identity"
				}
			]
		};

		const cli = new CLI();
		const res = await cli.process(config, TEST_OUTPUT_FILE2, TEST_WORKING_LOCATION);
		expect(res).toEqual(true);
	});
});
