# Hxgen

Generative art emitter by Graham

## Overview

Hxgen is a command line utility for packaging single-page HTML files, with a focus on the needs of generative artists e.g. me.

Basic usage:

```
$ ./hxgen
```

To start the dev server:

```
$ ./hxgen -d
```

The dev server runs on port 8080 but this can be overriden with the PORT environment variable.

By default Hxgen compiles `src/default.js` using `src/template.html`. To specify another entrypoint simply provide the filename as an argument, e.g.:

```
$ ./hxgn src/examples/webgl.js
```

See the files in this directory for examples of how to use e.g. the provided WebGL classes.

Run `./hxgn -h` or `./hxgen --help` to print a list of complete command line options.

By convention user files should be placed in the `user` directory, which is ignored by git. But do whatever you want.