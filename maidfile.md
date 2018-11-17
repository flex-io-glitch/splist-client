## serve

Start a parcel dev server on port 8080.

```bash
yarn parcel serve src/index.html --port 8080
```

## lint

Uses TSLint to ensure code quality.

```bash
yarn tslint --project .
```

## clean:parcel

Removes all parcel generated files/folders. Only used when needed.

```bash
rm -r dist
rm -r .cache
```

## clean:yarn

Removes all yarn generated files/folders. Only used when needed.

```bash
rm yarn-error.log
rm -rf node_modules
```
