# Class: CLI

The main entry point for the CLI.

## Constructors

### new CLI()

> **new CLI**(): [`CLI`](CLI.md)

#### Returns

[`CLI`](CLI.md)

## Methods

### run()

> **run**(`argv`): `Promise`\<`number`\>

Run the app.

#### Parameters

• **argv**: `string`[]

The process arguments.

#### Returns

`Promise`\<`number`\>

The exit code.

***

### process()

> **process**(`workingDirectory`, `config`): `Promise`\<`boolean`\>

Process the configuration.

#### Parameters

• **workingDirectory**: `string`

The folder the app was run from.

• **config**: [`IMergeLocalesConfig`](../interfaces/IMergeLocalesConfig.md)

The configuration for the app.

#### Returns

`Promise`\<`boolean`\>

The true if the process was successful.
