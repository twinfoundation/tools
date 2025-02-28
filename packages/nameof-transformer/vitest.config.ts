// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["./tests/**/*.spec.ts"],
		globals: true,
		testTimeout: 300000,
		hookTimeout: 300000,
		bail: 1,
		coverage: {
			reporter: ["text", "lcov"],
			include: ["src/**/*.ts"],
			exclude: ["**/index.ts", "**/models/**/*.ts"]
		},
		fileParallelism: false
	}
});
