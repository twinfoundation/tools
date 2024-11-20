// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { manual } from "../src/manual";

describe("Manual", () => {
	test("can transform code with nameof generics in it", () => {
		let code = "const name = nameof<MyType>();";

		code = manual(code);

		expect(code).toEqual('const name = "MyType";');
	});

	test("can transform code with nameof generics subtype in it", () => {
		let code = "const name = nameof<MyType<TypeB>>();";

		code = manual(code);

		expect(code).toEqual('const name = "MyType";');
	});

	test("can transform code with nameof param in it", () => {
		let code = "const name = nameof(MyType);";

		code = manual(code);

		expect(code).toEqual('const name = "MyType";');
	});

	test("can transform code with nameof import", () => {
		let code = 'import { nameof } from "@twin.org/nameof";';

		code = manual(code);

		expect(code).toEqual("");
	});
});
