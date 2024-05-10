#!/usr/bin/env node
// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
process.title = 'TypeScript to OpenAPI';

import('../dist/esm/index.mjs')
	.then(m => {
		const cli = new m.CLI();
		return cli.run(process.argv);
	})
	.catch(err => {
		console.error(err);
	});
