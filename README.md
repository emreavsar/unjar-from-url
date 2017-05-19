# unjar-from-url
Downloads JAR files from urls and unzipps them right away from your package.json

## Installation

`npm install @jdaudier/number-formatter`

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