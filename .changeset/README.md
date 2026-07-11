# Changesets

Changesets record user-visible change notes only. They never calculate or apply package versions.

`contracts/release.json` is the sole version authority. Run `pnpm version-packages` to synchronize handwritten manifests from that contract and regenerate derived files.
