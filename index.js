'use strict';

/**
 * Downloads a list of jar files, and unzippes them inside the node_modules directory.
 * @return {boolean} result when download was ok
 */
 module.exports = function() {

 	var highestParent = module.parent;
 	var parentFound = false;

	// iterate up to all parents, until parent is undefined => root of all
	while(!parentFound) {
		parentFound = highestParent.parent == undefined;
		// go to upper parent
		if(!parentFound) {
			highestParent = highestParent.parent;
		}
	}

	// get the path to project itself (where the package.json is)
	var pathToNodeModules = highestParent.paths[0].split("node_modules")[0];

	// read the package json
	var packageJson = require(pathToNodeModules + "package.json");


	var unjarFromUrlConfig = packageJson['config'];

	for(var i = 0; i<unjarFromUrlConfig.length; i++) {
		downloadJar(highestParent.paths[0], unjarFromUrlConfig[i]['directory'], unjarFromUrlConfig[i]['url']);
	}

	return
};

/**
 * Downloads and uncompresses a jar from given url into node_modules directory.
 * @param {string} nodeModulesDir absolute path to node_modules directory where a directory gets created where the jar gets uncompressed
 * @param {string} unzipDirectory name of the directory where the jar file gets uncompressed in
 * @param {string} url to jar to download
 */
var downloadJar = function(nodeModulesDir, unzipDirectory, url) {
	const download = require('download');
	const fs = require('fs');
	const zlib = require('zlib');
	var exec = require('child_process').exec,child;
	var path = require("path");

	// extracting filename from url
	var filename = path.basename(url);
	var fileDirectory = nodeModulesDir + "/" + unzipDirectory;

	console.log("nodeModules directory = ", nodeModulesDir);
	console.log("downloading file from url=", url);
	console.log("unzipping to directory=", unzipDirectory);
	console.log("filename = ", filename);

	// makes programming easier (create the directory anyway)
	if(!fs.existsSync(fileDirectory)) {
		fs.mkdirSync(fileDirectory);
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