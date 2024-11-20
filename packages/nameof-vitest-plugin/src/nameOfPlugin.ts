// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { Plugin } from "vitest/config";

// eslint-disable-next-line @typescript-eslint/naming-convention
export const NameOfPlugin: Plugin = {
	name: "name-of",
	enforce: "pre",
	transform: (code, id): string => {
		if (typeof code === "string") {
			const typeRegExp = /nameof<(.*?)>\(\)/g;
			code = code.replace(typeRegExp, '"$1"');

			const paramRegExp = /nameof\((.*?)\)/g;
			code = code.replace(paramRegExp, '"$1"');
		}
		return code;
	}
};
