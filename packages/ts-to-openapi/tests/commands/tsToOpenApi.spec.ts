// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { CLIDisplay } from "@gtsc/cli-core";
import { I18n } from "@gtsc/core";
import { tsToOpenApi } from "../../src/commands/tsToOpenApi";
import type { ITsToOpenApiConfig } from "../../src/models/ITsToOpenApiConfig";

const TEST_DATA_LOCATION = path.resolve(path.join(__dirname, ".tmp"));
const TEST_CONFIG_LOCATION = path.join(TEST_DATA_LOCATION, "config");
const TEST_WORKING_LOCATION = path.join(TEST_DATA_LOCATION, "work");
const TEST_OUTPUT_FILE2 = path.join(TEST_DATA_LOCATION, "output2.json");
let writeBuffer: string[] = [];
let errorBuffer: string[] = [];

describe("TSToOpenApi", () => {
	beforeAll(async () => {
		await rm(TEST_DATA_LOCATION, { recursive: true, force: true });
		await mkdir(TEST_CONFIG_LOCATION, { recursive: true });
		await mkdir(TEST_WORKING_LOCATION, { recursive: true });

		I18n.addDictionary("en", await import("../../dist/locales/en.json"));
	});

	afterAll(async () => {
		await rm(TEST_CONFIG_LOCATION, { recursive: true, force: true });
		await rm(TEST_WORKING_LOCATION, { recursive: true, force: true });
	});

	beforeEach(() => {
		writeBuffer = [];
		errorBuffer = [];

		CLIDisplay.write = (buffer: string | Uint8Array): void => {
			writeBuffer.push(...buffer.toString().split("\n"));
		};

		CLIDisplay.writeError = (buffer: string | Uint8Array): void => {
			errorBuffer.push(...buffer.toString().split("\n"));
		};
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
				}
				// {
				// 	package: "@gtsc/identity-service",
				// 	version: "next",
				// 	pathRoot: "/identity"
				// }
			]
		};

		const res = await tsToOpenApi(config, TEST_OUTPUT_FILE2, TEST_WORKING_LOCATION);
		expect(res).toEqual(undefined);
	});
});
