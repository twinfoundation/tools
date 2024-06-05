# Class: `abstract` CLIBase

The main entry point for the CLI.

## Constructors

### new CLIBase()

> **new CLIBase**(): [`CLIBase`](CLIBase.md)

#### Returns

[`CLIBase`](CLIBase.md)

## Methods

### execute()

> **execute**(`options`, `argv`): `Promise`\<`number`\>

Execute the command line processing.

#### Parameters

• **options**: [`ICliOptions`](../interfaces/ICliOptions.md)

The options for the CLI.

• **argv**: `string`[]

The process arguments.

#### Returns

`Promise`\<`number`\>

The exit code.
