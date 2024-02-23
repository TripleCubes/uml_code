const FS = require('fs').promises;
const FsSync = require('fs');

module.exports = {
	isFileExist: isFileExist,
	readJsonFile: readJsonFile,
	writeJsonFile: writeJsonFile,
	writeFileStr: writeFileStr,
};

function isFileExist(path) {
	return FsSync.existsSync(path);
}

async function readJsonFile(path) {
	console.log('    reading ' + path);
	return JSON.parse(await FS.readFile(path, 'utf8'));
}

async function writeJsonFile(object, folder_path, file_name) {
	console.log('writing ' + file_name);

	if (!FsSync.existsSync(folder_path)) {
		FsSync.mkdirSync(folder_path, { recursive: true });
	}

	await FS.writeFile(folder_path + file_name, JSON.stringify(object, null, '\t'), function(err) {
		if (err) {
			console.log('write file error: ' + err);
		}
	});
}

async function writeFileStr(in_string, folder_path, file_name) {
	console.log('writing ' + folder_path + file_name);

	if (!FsSync.existsSync(folder_path)) {
		FsSync.mkdirSync(folder_path, { recursive: true });
	}

	await FS.writeFile(folder_path + file_name, in_string, function(err) {
		if (err) {
			console.log('write file error: ' + err);
		}
	});
}
