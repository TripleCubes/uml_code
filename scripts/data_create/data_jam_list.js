const SF = require('../utils/shared_functions');
const File = require('../utils/file');
const List = require('../utils/list');
const Ilscore = require('../utils/ilscore');

module.exports = {
	create: create,
};

const NUM_OF_JAM_PER_PAGE = 10;

const INPUT_MINI_JAM_FOLDER_PATH = '../_scraped_files/mini_jam/';
const INPUT_MAJOR_JAM_FOLDER_PATH = '../_scraped_files/major_jam/';
const INPUT_JAM_LIST_PATH = '../_scraped_files/jam_list/';
const OUTPUT_MINI_JAM_FOLDER_PATH = '../_jam_list_data/mini_jam/';
const OUTPUT_MAJOR_JAM_FOLDER_PATH = '../_jam_list_data/major_jam/';
const OUTPUT_FOLDER_PATH = '../_jam_list_data/';

const CREATE_MAJOR_JAM_FILES = true;
const CREATE_MINI_JAM_FILES = true;
const NUM_OF_GAME_SHOWN = 20;

async function create() {
	let jam_list = await File.readJsonFile(INPUT_JAM_LIST_PATH + 'jam_list.json');

	let mini_jam_num_of_page = Math.ceil(jam_list.mini_jam_list.length / NUM_OF_JAM_PER_PAGE);
	let mini_jam_num_of_game = 0;
	let major_jam_num_of_page = Math.ceil(jam_list.major_jam_list.length / NUM_OF_JAM_PER_PAGE);
	let major_jam_num_of_game = 0;
	
	if (CREATE_MAJOR_JAM_FILES) {
		let jammer_link_total_list = []; 
		for (let i = major_jam_num_of_page - 1; i >= 0 ; i--) {
			major_jam_num_of_game += await createFiles(i, jam_list.major_jam_list,
				INPUT_MAJOR_JAM_FOLDER_PATH + 'major_jam_',
				OUTPUT_MAJOR_JAM_FOLDER_PATH, 
				'major_jam_list_page_' + SF.intToStrFixedWidth(i) + '.json',
				jammer_link_total_list);
		}
	}

	if (CREATE_MINI_JAM_FILES) {
		let jammer_link_total_list = [];
		for (let i = mini_jam_num_of_page - 1; i >= 0 ; i--) {
			mini_jam_num_of_game += await createFiles(i, jam_list.mini_jam_list,
				INPUT_MINI_JAM_FOLDER_PATH + 'mini_jam_',
				OUTPUT_MINI_JAM_FOLDER_PATH, 
				'mini_jam_list_page_' + SF.intToStrFixedWidth(i) + '.json',
				jammer_link_total_list);
		}
	}

	let other_data = {
		major_jam_num_of_page: major_jam_num_of_page,
		mini_jam_num_of_page: mini_jam_num_of_page,

		num_of_major_jam: jam_list.major_jam_list.length,
		num_of_mini_jam: jam_list.mini_jam_list.length,

		major_jam_num_of_game: major_jam_num_of_game,
		mini_jam_num_of_game: mini_jam_num_of_game,

		num_of_game_shown: NUM_OF_GAME_SHOWN,
	}
	await File.writeJsonFile(other_data, OUTPUT_FOLDER_PATH, 'other_data.json');
}


async function createFiles(page, jam_list, input_path_format, output_folder, output_file_name, 
                           jammer_link_total_list) {
	let num_of_game = 0;
	let result_list = [];
	for (let i = (page+1)*NUM_OF_JAM_PER_PAGE - 1; i >= page*NUM_OF_JAM_PER_PAGE; i--) {
		if (i >= jam_list.length) {
			continue;
		}

		let jam = jam_list[i];
		let game_list = await File.readJsonFile(input_path_format + SF.intToStrFixedWidth(jam.id) + '.json');

		let submission_time_data_json_path = input_path_format + SF.intToStrFixedWidth(jam.id) 
		                                                    + '_submission_time.json';
		let submission_time_data = null;
		if (File.isFileExist(submission_time_data_json_path)) {
			submission_time_data = await File.readJsonFile(submission_time_data_json_path);
		}

		num_of_game += game_list.length;

		result_list.push(getJamPushData(jam, game_list, submission_time_data, jammer_link_total_list));
	}

	result_list.sort(function(a, b) {
		return b.id - a.id;
	});

	await File.writeJsonFile(result_list, output_folder, output_file_name);

	return num_of_game;
}

function getJamPushData(jam, game_list, submission_time_data, jammer_link_total_list) {
	let jammer_link_list = [];
	let new_jammer_list = [];

	let game_list_of_jam = [];
	for (let i = 0; i < game_list.length; i++) {
		let game = game_list[i];

		for (let j = 0; j < game.by_link_list.length; j++) {
			let by_link = game.by_link_list[j];
			let by = game.by_list[j];
			if (!List.isInList(jammer_link_total_list, by_link)) {
				jammer_link_total_list.push(by_link);
				new_jammer_list.push({
					by: by,
					by_link: by_link,
				});
			}
			if (!List.isInList(jammer_link_list, by_link)) {
				jammer_link_list.push(by_link);
			}
		}

		if (i >= NUM_OF_GAME_SHOWN) {
			continue;
		}
		
		let ilscore = Ilscore.calculateIlscore(game, game_list.length)

		let push_data = {
			title: game.title,
			title_link: game.title_link,
			submission_page_link: game.submission_page_link,
			by_list: game.by_list,
			by_link_list: game.by_link_list,
			rank: game.rank,
			ratings: game.ratings,
			score: game.score,
			ilscore: ilscore,
		};

		if (submission_time_data != null) {
			for (let j = 0; j < submission_time_data.jammer_list.length; j++) {
				let time = submission_time_data.jammer_list[j];
				if (time.link != game.title_link) {
					continue;
				}

				push_data.submission_time_diff = time.time - submission_time_data.vote_start_time;
				break;
			}
		}
		
		game_list_of_jam.push(push_data)
	}

	return {
		id: jam.id,
		jam_name: jam.jam_name,
		link: jam.link,
		num_of_game: game_list.length,
		num_of_jammer: jammer_link_list.length,
		num_of_new_jammer: new_jammer_list.length,
		game_list: game_list_of_jam,
	};
}
