// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { ITag } from "@gtsc/api-models";
import type { IInputPath } from "./IInputPath";

/**
 * The set of path results for a package.
 */
export interface IInputResult {
	/**
	 * The paths.
	 */
	paths: IInputPath[];

	/**
	 * The tags.
	 */
	tags: ITag[];
}
