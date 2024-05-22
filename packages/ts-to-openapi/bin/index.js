#!/usr/bin/env node
// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
process.title = 'TypeScript to OpenAPI';

import { CLI } from '../dist/esm/index.mjs';

const cli = new CLI();
const result = await cli.run(process.argv);
process.exit(result);
