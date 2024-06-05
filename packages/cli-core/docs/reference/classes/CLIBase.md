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

***

### rootAction()

> `protected` **rootAction**(`program`, `opts`): `Promise`\<`void`\>

Root action.

#### Parameters

• **program**: `Command`

The main program to handling the command.

• **opts**: `unknown`

The root options.

#### Returns

`Promise`\<`void`\>

***

### getCommands()

> `protected` **getCommands**(`program`): `Command`[]

Get the commands for the CLI.

#### Parameters

• **program**: `Command`

The main program that the commands will be added to.

#### Returns

`Command`[]

The commands for the CLI.
