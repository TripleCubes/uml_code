const SF = require('../utils/shared_functions');
const File = require('../utils/file');

module.exports = {
	create: create,
};

const INPUT_FOLDER_PATH = "../docs/_data_files/leaderboard_data/all/";
const OUTPUT_FOLDER_PATH = "../docs/_data_files/jammer_lookup/";

async function create() {
	let list_result = [];
	let otherdata = await File.readJsonFile(INPUT_FOLDER_PATH + 'other_data.json');
	for (let i = 0; i < otherdata.num_of_page; i++) {
		let jammer_list = await File.readJsonFile(INPUT_FOLDER_PATH + 'page_' + SF.intToStrFixedWidth(i) + '.json');
		for (let j = 0; j < jammer_list.length; j++) {
			let jammer = jammer_list[j];
			list_result.push({
				jammer: jammer.jammer,
				jammer_link: jammer.jammer_link,
			})
		}
	}
	await File.writeJsonFile(list_result, OUTPUT_FOLDER_PATH, 'jammer_lookup.json');
}
