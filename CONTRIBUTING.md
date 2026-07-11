# Contributing

Use Node 22, pnpm 10 and the platform toolchain documented in `toolchains.md`. Create a feature branch, add a failing contract or behavior test, implement the smallest cross-platform slice, and add a Changeset for user-visible changes.

Run `pnpm test`, `pnpm docs:build` and the affected native Catalog before opening a pull request. Do not add visual constants directly to platform components; add DTCG tokens and regenerate outputs instead. New interactive APIs must include controlled value, event, accessibility label and semantic icon support on every platform.

By contributing, you agree that your work is licensed under Apache-2.0.
