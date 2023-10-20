# xparse-ignore

Parse directory obeying gitignore rules (with extras).

```bash
$ npm run dev -- "/example/dir/path" #paths not ignored 
$ npm run dev -- "/example/dir/path" --ignored #ignored paths
```

Running compiled js 

```bash
$ node ./dist/index.js "/example/dir/path" #paths not ignored 
$ node ./dist/index.js "/example/dir/path" --ignored #ignored paths
```