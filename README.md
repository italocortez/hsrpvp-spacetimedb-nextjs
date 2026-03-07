# hsrpvp-spacetimedb
A drafting interface for different pvp modes for the gamee Honkai Star Rail

# This project uses pnpm as its package manager
To install it if you already have npm:
```bash
npm install -g pnpm
```

To install dependancies:
```bash 
npnm install
```

To very build
```bash
pnpm build
```

To clean up your current dependencies:
```bash
pnpm store prune
```

# SpacetimeDB stuff

Hard Database Reset:

```bash
spacetime publish <your-db-name> --clear-database
```

Update the code but keep the data:

```bash
spacetime publish <your-db-name> --module-path spacetimedb
```

Generate Client frontend types:
```bash
spacetime generate --lang typescript --out-dir src/module_bindings --module-path spacetimedb
```