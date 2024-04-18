# How to use the Tableau Extensions API type definitions

The Tableau Extensions API type definitions enable you to write your extension source code in
TypeScript. You can use the TypeScript compiler (tsc) to transpile the TypeScript source code to
JavaScript for use with your extension.

1.  Install the Extensions API type definitions. The following command installs the Extensions API
    type definitions (`@tableau/extensions-api-types`) in the `node_modules` folder of the current
    directory.

```cmd
npm install @tableau/extensions-api-types
```

2.  Import the type definitions into your TypeScript source files. You can import modules or type
    definitions. For example, to import the module, `Parameter`, you would use the following:

```javascript
import { Parameter } from '@tableau/extensions-api-types';
```

If you want to use Tableau enumerations as parameters to functions, or as a member variables inside
class definitions, you need to import the type definitions from `@tableau/extensions-api-types`. You
can then declare parameters or variables of that type. For example, to be able to use the `DataType`
enum as a parameter to a function, you need to use the following import statement:

```javascript
import { DataType } from '@tableau/extensions-api-types';
```

You can then use `DataType` as a type for a parameter in a class method. You can't use the fully
qualified name as a parameter type (`tableau.DataType`), even though you can use the fully qualified
name within a method.

```javascript
 private foo(value: DataType) {

 switch (value) {
     case tableau.DataType.String:
         console.log(value);
         break;
     // ... do other things
 }
}

```

Please note that `@tableau/extension-api-types` submodules are subject to change. Import only from
`@tableau/extensions-api-types`.

3.  Configure the TypeScript compiler options for your project. Set the `typeRoots` option to the
    location where you have installed the Extensions API type definitions. For example, the
    [Samples-TypeScript](https://github.com/tableau/extensions-api/tree/master/Samples-Typescript?=target="_blank")
    extensions on GitHub use webpack and Node.js to build the samples.

```json
{
  "compilerOptions": {
    /* Basic Options */
    "target": "esnext",
    "module": "commonjs",
    "sourceMap": true,
    "alwaysStrict": true,
    "baseUrl": "./Samples-Typescript",
    "typeRoots": ["./node_modules/@tableau", "./node_modules/@types"]
  }
}
```

4.  Write your extension and compile your code with the TypeScript compiler. If you need to install
    the compiler, see
    [TypeScript in Visual Studio Code](https://code.visualstudio.com/docs/languages/typescript?=target="_blank").
    Visual Studio Code supports TypeScript, but does not automatically include the TypeScript
    compiler (`tsc`).

5)  Link to the compiled JavaScript output in your extension. The TypeScript compiler transpiles the
    TypeScript source code to JavaScript. In your extension HTML code, link to the JavaScript file,
    and not your TypeScript source file.

```html
<!-- Extensions Library  -->
<script src="../../lib/tableau.extensions.1.latest.js"></script>

<!-- The  extension code -->
<script src="./datasources.js"></script>
```

## For more information

See
[Use TypeScript with the Extensions API](https://tableau.github.io/extensions-api/docs/trex_typescript.html).
