# Docs

## ERD

The `ERD.svg` in this directory is auto-generated from the Prisma schema.

To regenerate after any schema change:

```bash
cd apps/api
npx prisma generate
```

The `prisma-erd-generator` runs as part of `prisma generate` and writes `docs/ERD.svg`.
