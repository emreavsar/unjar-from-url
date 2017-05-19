[![Build Status](https://travis-ci.org/emreavsar/unjar-from-url.svg?branch=master)](https://travis-ci.org/emreavsar/unjar-from-url)

[![Coverage Status](https://coveralls.io/repos/github/emreavsar/unjar-from-url/badge.svg?branch=master)](https://coveralls.io/github/emreavsar/unjar-from-url?branch=master)

# unjar-from-url
Downloads JAR files from urls and unzipps them right away from your package.json

## Installation

`npm install unjar-from-url`

## Usage

In your `package.json`:
```
"fileDependencies": {
    "selenium-server-standalone":
    "http://selenium-release.storage.googleapis.com/2.43/selenium-server-standalone-2.43.1.jar",
}
```  
  
This will download and uncompress the jar files into folder `node_modules/unjar-from-url/selenium-server-standalone`.

## Tests

`npm test`

## Contributing

TBD.

## License

MIT