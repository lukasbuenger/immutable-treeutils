# Changelog

### 1.0.0

This is mainly a backport to good old ES5 in order to definitely get rid of Babel et al. The reasoning behind this is, that 90% of the maintenance work I did on this library was somehow related to runtime environments that the Babel build of TreeUtils was incompatible with.

In **0.1.11** I tried to just enforce a modern enough Node version to keep the generators but [this enforced people to manually add TreeUtils to a list of should-get-transpiled node modules in order to support older runtimes through let's say Webpack](https://github.com/lukasbuenger/immutable-treeutils/issues/9). And that is really not an option.

In the end and given the fact that TreeUtils is actually a very small and single-minded piece of software that doesn't really need the fancy new stuff, it seemed to be more reasonable to take the code back to the least common denominator (Node 0.12, VERY old browsers) than hassling my way through transpiler/build chain hell.


###### Breaking:

The tree method `nodes` returns an Immutable.List instead of an Iterator.

So instead of
```
for (let keyPath of utils.nodes(state)) {
  // ...
}
```
you would
```
utils.nodes(state).forEach(keyPath => {
  // ...
})
```

Other changes:
- Backport to ES5: source, tests and scripts.
- Immutable is now a peer dependency.
- No longer enforce a Node version.

### 0.1.11
- *Requires Node >= 6 or any environment that supports ES6, especially generators.*
- Removed dependencies on all Babel and ESLint related packages and config files.
- File structure flattened.
- Docs: Removed hint regarding the generators issue, removed the babel reference.
- Dependencies updated.




### 0.1.10
- Docs updated.

### 0.1.9
- **API changes**:
	- [TreeUtils](#TreeUtils) constructor accepts a `none` parameter to customize the result of queries with no results.
- ESLint rules changed to a somehow customized version of the well-established [AirBnB](https://github.com/airbnb/javascript) ruleset.
- Code base refactored according to the new linting rules.
- Build tests refactored to ES5.
- Dependencies updated.

### 0.1.8
- Support default export in pre-ES2015 environments courtesy of [Jürgen Schlieber](https://github.com/jschlieber).

### 0.1.7

- Dependencies updated.
- Fix several documentation typos and errors (npm install command :blush:) courtesy of [Jürgen Schlieber](https://github.com/jschlieber) and [Love Luang](https://github.com/luangch).
- Comparator functions used with [find](#TreeUtils-find) or [filter](#TreeUtils-filter) receive the key path to the current node as second parameter courtesy of [Jürgen Schlieber](https://github.com/jschlieber).
- Fix test script to conform [jasmine-spec-reporter](https://github.com/bcaudan/jasmine-spec-reporter/)s new module structure.

### 0.1.6

- Dependencies updated.
- Docs: Fix typos and source links.

### 0.1.5

- Dependencies updated.
- All methods that need to evaluate whether a value exists or not check not only for `undefined` but for `null` as well now. Some methods were broken if you e.g. were using `null` as default value on [Record](http://facebook.github.io/immutable-js/docs/#/Record) definitions, which by some people is considered best practise.

### 0.1.4

- Dependencies updated. Added tests for the transpiled source (trivial).

### 0.1.3

- Minor fixes in API docs. Updated dependencies.

### 0.1.2

- Migration to Babel 6 courtesy of [Kei Takashima](https://github.com/keit).
- README hint to use environment with generators enabled courtesy of [Emanuele Ingrosso](https://github.com/ingro).
- Further updated dependencies, most notably ImmutableJS.
- Added estraverse-fb to devDependencies (https://github.com/eslint/eslint/issues/5476).
