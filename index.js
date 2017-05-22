#!/usr/bin/env node

'use strict';

/**
 * Downloads a list of jar files, and unzippes them inside the node_modules directory.
 * @return {boolean} result when download was ok
 * @author Emre Avsar <emre.avsar92@gmail.com>
 */
module.exports = function () {
	var unjarConfigFromPackageJsonFile = getUnjarConfigurationFromPackageJson(module);
	// var unjarConfigFromArguments = getUnjarConfigurationFromArguments(args);

	var unjarConfigFromArguments = getUnjarConfigurationFromArgs();
	// put both configurations together:
	var unjarConfig = unjarConfigFromArguments.concat(unjarConfigFromPackageJsonFile);

	for (var i = 0; i < unjarConfig.length; i++) {
		downloadJar(unjarConfig[i]['nodeModulesDir'], unjarConfig[i]['directory'], unjarConfig[i]['url']);
	}

	return
};

/**
 * Finds the configuration passed by command line arguments.
 * 
 * CLI args are limited, thus one have to pass the following CLI arguments:
 * 	--urls = list of urls to download the jars from
 *  --download-dirs = names of the directories to put the jars into (uncompress jar into this directory)
 *  --destination-dirs = names of the directories where the directory (download-dirs) will be
 * 
 * Example for usage with command line args:
 * <pre><code>
 * --urls http://selenium-release.storage.googleapis.com/2.43/selenium-server-standalone-2.43.1.jar 
 * --download-dirs selenium-server-standalone 
 * --destination-dirs=/data
 * --urls http://otherurl.com/file.jar 
 * --download-dirs otherurl-directory 
 * --destination-dirs=/tmp 
 * </pre></code>
 * 
 * This would download the selenium server standalone 2.4.32.1 jar into /data/selenium-server-standalone/  and uncompress the jar there 
 * and file.jar downloaded from http://otherurl.com/file.jar into /tmp/otherurl-directory/  and uncompress the jar there
 * 
 * Important: the order does matter (first urls argument matches to first download-dirs and destination-dirs etc.)
 */
var getUnjarConfigurationFromArgs = function () {
	// looking for keys passed as cli arguments with urls and download-dirs
	const urlsKey = "urls";
	const downloadDirsKey = "download-dirs";
	const destinationDir = "destination-dirs";

	// keys used in the array (same as in configuration via package.json) for each item (so urls => url)
	const confUrlsKey = "url";
	const confDownloadDirsKey = "directory";
	const confDestinationDir = "nodeModulesDir";

	// getting cli arguments
	var argv = require('minimist')(process.argv.slice(2));

	var unjarConfigFromArguments = [];

	if (argv[urlsKey] != null) {
		// only 1 object passed
		if (typeof argv[urlsKey] === 'string') {
			// put into an array, so as it can be used the same way as multiple args
			argv[urlsKey] = [argv[urlsKey]];
			argv[downloadDirsKey] = [argv[downloadDirsKey]];
			argv[destinationDir] = [argv[destinationDir]];
		}

		// put them together so that the array has a object with the attributes: nodeModulesDir, directory, url
		for (var i = 0; i < argv[urlsKey].length; i++) {
			var configItem = {};
			configItem[confUrlsKey] = argv[urlsKey][i];
			configItem[confDownloadDirsKey] = argv[downloadDirsKey][i];
			configItem[confDestinationDir] = argv[destinationDir][i];
			unjarConfigFromArguments.push(configItem);
		}
	}

	return unjarConfigFromArguments;
}

/**
 * Searches the unjar configuration inside the highest parent's package.json. This is typically used when this module is used inside another project
 * which has the configuration inside the package.json of the project itself.
 * 
 * Returns unjar configuration as a js object.
 * 
 * Example for configuration:
 * <pre><code>
 * // package.json of your project
 * ...
 * unjar-config: [
 * 		{
 * 			"directory": "selenium-server-standalone",
 * 			"url": "http://selenium-release.storage.googleapis.com/2.43/selenium-server-standalone-2.43.1.jar"
 * 		},
 * 		{
 * 			// other jars
 * 		}
 * ]
 * </pre></code>
 * 
 * @param {module} module to start searching the configuration file 
 */
var getUnjarConfigurationFromPackageJson = function (module) {
	const configKey = 'unjar-from-url-config';

	if (module == null) {
		return [];
	}

	var highestParent;
	if (module.parent != null) {
		highestParent = module.parent;
	} else {
		highestParent = module;
	}


	var parentFound = false;

	// iterate up to all parents, until parent is undefined => root of all
	while (!parentFound) {
		parentFound = highestParent.parent == undefined || highestParent.parent == null;
		// go to upper parent
		if (!parentFound) {
			highestParent = highestParent.parent;
		}
	}

	// get the path to project itself (where the package.json is)
	var pathToNodeModules = highestParent.paths[0].split("node_modules")[0];

	// read the package json
	var packageJson = require(pathToNodeModules + "package.json");

	var unjarFromUrlConfig;
	if (packageJson != null && packageJson[configKey] != null) {
		unjarFromUrlConfig = packageJson[configKey];
	}

	if (unjarFromUrlConfig != null) {
		// add the highest parent path (used as nodeModulesDir later) to each item
		var nodeModulesDir = highestParent.paths != null ? highestParent.paths[0] : '';
		unjarFromUrlConfig.forEach(function (item) {
			item.nodeModulesDir = nodeModulesDir
		});
	} else {
		console.warn("No config found in package.json: ", pathToNodeModules + "package.json");
		unjarFromUrlConfig = [];
	}

	return unjarFromUrlConfig;
}

/**
 * Downloads and uncompresses a jar from given url into node_modules directory.
 * @param {string} nodeModulesDir absolute path to node_modules directory where a directory gets created where the jar gets uncompressed
 * @param {string} unzipDirectory name of the directory where the jar file gets uncompressed in
 * @param {string} url to jar to download
 */
var downloadJar = function (nodeModulesDir, unzipDirectory, url) {
	const download = require('download');
	const fs = require('fs');
	const zlib = require('zlib');
	var exec = require('child_process').exec,
		child;
	var path = require("path");

	// extracting filename from url
	var filename = path.basename(url);
	var fileDirectory = nodeModulesDir + "/" + unzipDirectory;

	console.log("nodeModules directory = ", nodeModulesDir);
	console.log("downloading file from url=", url);
	console.log("unzipping to directory=", unzipDirectory);
	console.log("fileDriectory=", fileDirectory);
	console.log("filename = ", filename);

	// makes programming easier (create the directory anyway)
	if (!fs.existsSync(fileDirectory)) {
		// mkdir -p fileDirectory
		fileDirectory.split('/').forEach((dir, index, splits) => {
			const parent = splits.slice(0, index).join('/');
			const dirPath = path.resolve(parent, dir);
			if (!fs.existsSync(dirPath)) {
				fs.mkdirSync(dirPath);
			}
		});
	}

	// delete directory with file in it, and after that download the file into newly created folder
	exec('rm -r ' + fileDirectory, function (err, stdout, stderr) {
		fs.mkdirSync(fileDirectory);
		// fs.writeFileSync(fileDirectory + "/download.jar", content);

		// download process
		download(url, fileDirectory).then(() => {
			console.log("downloaded file successful. unzipping...");

			var DecompressZip = require('decompress-zip');
			console.log("file to decompress: " + fileDirectory + "/" + filename);
			var unzipper = new DecompressZip(fileDirectory + "/" + filename);

			unzipper.on('error', function (err) {
				console.log('Caught an error', err);
			});

			unzipper.on('extract', function (log) {
				console.log('Finished extracting');
			});

			unzipper.on('progress', function (fileIndex, fileCount) {
				console.log('Extracted file ' + (fileIndex + 1) + ' of ' + fileCount);
			});

			unzipper.extract({
				path: fileDirectory,
				filter: function (file) {
					return file.type !== "SymbolicLink";
				}
			});
		});
	});
};

module.exports()