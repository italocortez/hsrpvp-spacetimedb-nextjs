# hsrpvp-spacetimedb
A drafting interface for different pvp modes for the gamee Honkai Star Rail

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