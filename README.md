# TWIN Tools

This mono-repository contains some of the tooling packages that the rest of the TWIN packages depend on.

## Packages

- [nameof-transformer](packages/nameof-transformer/README.md) - A TypeScript transformer which converts types and properties to their actual name for use at runtime.
- [nameof](packages/nameof/README.md) - Provides the definitions for the methods which are processed by the `nameof-transformer`.
- [merge-locales](packages/merge-locales/README.md) - Tool to merge locales from the dependencies of a package.
- [ts-to-openapi](packages/ts-to-openapi/README.md) - Tool to convert TypeScript REST route definitions to OpenAPI Specifications.
- [ts-to-schema](packages/ts-to-schema/README.md) - Tool to convert TypeScript types to JSON Schemas.

## Contributing

To contribute to this package see the guidelines for building and publishing in [CONTRIBUTING](./CONTRIBUTING.md)
