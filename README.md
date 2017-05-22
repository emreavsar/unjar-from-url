[![Build Status](https://travis-ci.org/emreavsar/unjar-from-url.svg?branch=master)](https://travis-ci.org/emreavsar/unjar-from-url)

[![Coverage Status](https://coveralls.io/repos/github/emreavsar/unjar-from-url/badge.svg?branch=master)](https://coveralls.io/github/emreavsar/unjar-from-url?branch=master)

# unjar-from-url
Downloads JAR files from urls and unzipps them right away from your package.json or command line arguments

## Installation

`npm install unjar-from-url --save-dev` if you want to use it in your project

`npm install unjar-from-url --global` if you want to use it globally on command line

## Usage

### In your project (package.json)
In your `package.json`:
```
"scripts": {
    // in case of you want to download jars after the install process
    "postinstall": "unjar-from-url"
},
// ...
"unjar-from-url-config": [
    {
        "directory": "selenium-server-standalone":
        "url": "http://selenium-release.storage.googleapis.com/2.43/selenium-server-standalone-2.43.1.jar",
    }
]
```

Run with `npm run-script unjar`.

This will download and uncompress the jar files into folder `node_modules/unjar-from-url/node_modules/selenium-server-standalone`.

### Command line (no package.json)
In your command line:

```
unjar-from-url \
--urls http://selenium-release.storage.googleapis.com/2.43/selenium-server-standalone-2.43.1.jar  \
--download-dirs selenium-server-standalone  \
--destination-dirs=/tmp
```

This will download and uncompress the jar files into folder `/tmp/selenium-server-standalone`.

## Tests

`npm test`

## Contributing

TBD.

## License

MIT