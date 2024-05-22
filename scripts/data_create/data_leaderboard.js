const SF = require('../utils/shared_functions');
const File = require('../utils/file');
const Ilscore = require('../utils/ilscore');
const { table } = require('console');

module.exports = {
	create: create,
};

const NUM_OF_JAMMER_PER_PAGE = 100;

const INPUT_MINI_JAM_FOLDER_PATH = '../_scraped_files/mini_jam/';
const INPUT_MAJOR_JAM_FOLDER_PATH = '../_scraped_files/major_jam/';
const INPUT_JAM_LIST_PATH = '../_scraped_files/jam_list/';
const OUTPUT_FOLDER_PATH = '../docs/_data_files/leaderboard_data/';

async function create() {
	let jam_list = await File.readJsonFile(INPUT_JAM_LIST_PATH + 'jam_list.json');

	let table_of_content = [];

	// toc = table of content
	{
		let toc_data = await createFiles(jam_list, 999999, OUTPUT_FOLDER_PATH + 'all/');
		table_of_content = getUpdatedTableOfContent(table_of_content, toc_data, 'all');
	}

	{
		let toc_data = await createFiles(jam_list, 1, OUTPUT_FOLDER_PATH + 'by_game_in_top_1/');
		table_of_content = getUpdatedTableOfContent(table_of_content, toc_data, '_1');
	}

	{
		let toc_data = await createFiles(jam_list, 5, OUTPUT_FOLDER_PATH + 'by_game_in_top_5/');
		table_of_content = getUpdatedTableOfContent(table_of_content, toc_data, '_5');
	}

	{
		let toc_data = await createFiles(jam_list, 10, OUTPUT_FOLDER_PATH + 'by_game_in_top_10/');
		table_of_content = getUpdatedTableOfContent(table_of_content, toc_data, '_10');
	}

	{
		let toc_data = await createFiles(jam_list, 20, OUTPUT_FOLDER_PATH + 'by_game_in_top_20/');
		table_of_content = getUpdatedTableOfContent(table_of_content, toc_data, '_20');
	}

	{
		let toc_data = await createFilesIlscore(jam_list, 999999, OUTPUT_FOLDER_PATH + 'by_ilscore/');
		table_of_content = getUpdatedTableOfContent(table_of_content, toc_data, 'ilscore');
	}

	await File.writeJsonFile(table_of_content, OUTPUT_FOLDER_PATH, 'table_of_content.json');
}


async function createFiles(jam_list, max_rank, output_folder) {
	let jammer_list = [];

	jammer_list = await getUpdatedJammerList(jammer_list, jam_list, max_rank);
	
	for (let i = 0; i < jammer_list.length; i++) {
		let jammer = jammer_list[i];
		jammer.game_list_sorted.sort((a, b) => {
			if (a.rank - b.rank != 0) {
				return a.rank - b.rank;
			}

			return b.score - a.score;
		});
	}

	if (max_rank <= 1000) {
		jammer_list.sort((a, b) => {
			let b_sub_a = b.game_list_sorted.length - a.game_list_sorted.length;
			if (b_sub_a != 0) {
				return b_sub_a;
			}

			let rank_sum_a = 0;
			let rank_sum_b = 0;
			for (let i = 0; i < a.game_list_sorted.length; i++) {
				rank_sum_a += a.game_list_sorted[i].rank;
			}
			for (let i = 0; i < b.game_list_sorted.length; i++) {
				rank_sum_b += b.game_list_sorted[i].rank;
			}
			if (rank_sum_a - rank_sum_b != 0) {
				return rank_sum_a - rank_sum_b;
			}

			let score_sum_a = 0;
			let score_sum_b = 0;
			for (let i = 0; i < a.game_list_sorted.length; i++) {
				score_sum_a += a.game_list_sorted[i].score;
			}
			for (let i = 0; i < b.game_list_sorted.length; i++) {
				score_sum_b += b.game_list_sorted[i].score;
			}
			return score_sum_b - score_sum_a;
		});
	}

	toc_data = await writeFileAndGetTocData(jammer_list, output_folder, -1);

	let other_data = createOtherData(jammer_list, -1);
	await File.writeJsonFile(other_data, output_folder, 'other_data.json');

	return toc_data;
}

async function createFilesIlscore(jam_list, max_rank, output_folder) {
	let jammer_list = [];

	jammer_list = await getUpdatedJammerList(jammer_list, jam_list, max_rank);

	for (let i = 0; i < jammer_list.length; i++) {
		let jammer = jammer_list[i];
		jammer.game_list_sorted.sort((a, b) => {
			return b.ilscore - a.ilscore;
		});
		jammer.total_ilscore = Ilscore.getTotalIlscoreFromJammer(jammer)
	}
	jammer_list.sort((a, b) => {
		return b.total_ilscore - a.total_ilscore;
	});

	toc_data = await writeFileAndGetTocData(jammer_list, output_folder, 20);
	
	let other_data = createOtherData(jammer_list, 20);
	await File.writeJsonFile(other_data, output_folder, 'other_data.json');

	return toc_data;
}

async function writeFileAndGetTocData(jammer_list, output_folder, num_of_page_cap) {
	toc_data = [];

	for (let i = 0; i < Math.ceil(jammer_list.length / NUM_OF_JAMMER_PER_PAGE); i++) {
		let write_list = [];
		for (let j = i*NUM_OF_JAMMER_PER_PAGE; j < (i+1)*NUM_OF_JAMMER_PER_PAGE; j++) {
			if (j >= jammer_list.length) {
				break;
			}
			toc_data.push({
				jammer_link: jammer_list[j].jammer_link,
				page: i,
				index: write_list.length,
			});

			let clone = {
				jammer: jammer_list[j].jammer,
				jammer_link: jammer_list[j].jammer_link,
				total_ilscore: jammer_list[j].total_ilscore,
			};
			if (num_of_page_cap == -1 || i < num_of_page_cap) {
				clone.game_list_sorted = jammer_list[j].game_list_sorted;
			}

			write_list.push(clone);
		}
		await File.writeJsonFile(write_list, output_folder, 'page_' + SF.intToStrFixedWidth(i) + '.json');
	}

	return toc_data;
}

function createOtherData(jammer_list, num_of_page_cap) {
	let num_of_game = 0;
	let num_of_majorjammer = 0;
	let num_of_minijammer = 0;
	for (let i = 0; i < jammer_list.length; i++) {
		let jammer = jammer_list[i];

		num_of_game += jammer_list[i].game_list_sorted.length;

		let major_jam_tagged = false;
		let mini_jam_tagged = false;
		for (let j = 0; j < jammer.game_list_sorted.length; j++) {
			let game = jammer.game_list_sorted[j];
			if (!major_jam_tagged && game.jam_type == 'major_jam') {
				major_jam_tagged = true;
				num_of_majorjammer++;
			}
			if (!mini_jam_tagged && game.jam_type == 'mini_jam') {
				mini_jam_tagged = true;
				num_of_minijammer++;
			}
		}
	}

	let other_data = {
		num_of_jammer: jammer_list.length,
		num_of_majorjammer: num_of_majorjammer,
		num_of_minijammer: num_of_minijammer,
		num_of_game: num_of_game,
		num_of_page: Math.ceil(jammer_list.length / NUM_OF_JAMMER_PER_PAGE),
		num_of_jammer_per_page: NUM_OF_JAMMER_PER_PAGE,
	}

	if (num_of_page_cap != -1) {
		other_data.num_of_page = num_of_page_cap;
	}

	return other_data;
}

function getJamNameAndLink(jam_list, jam_id) {
	let index = jam_list.length - jam_id;
	return {
		jam_name: jam_list[index].jam_name,
		jam_link: jam_list[index].link,
	}
}

async function getUpdatedJammerList(jammer_list, jam_list, max_rank) {
	let num_of_mini_jam = jam_list.mini_jam_list.length;
	let num_of_major_jam = jam_list.major_jam_list.length;

	for (let i = 0; i < num_of_major_jam; i++) {
		let jam_id = i + 1;
		let jam_name_and_link = getJamNameAndLink(jam_list.major_jam_list, jam_id);
		let jam_name = jam_name_and_link.jam_name;
		let jam_link = jam_name_and_link.jam_link;
		jammer_list = await getUpdatedJammerListJamDataAdded(jammer_list, max_rank,
			INPUT_MAJOR_JAM_FOLDER_PATH + 'major_jam_' + SF.intToStrFixedWidth(jam_id), 
			'major_jam', jam_id, jam_name, jam_link);
	}

	for (let i = 0; i < num_of_mini_jam; i++) {
		let jam_id = i + 1;
		let jam_name_and_link = getJamNameAndLink(jam_list.mini_jam_list, jam_id);
		let jam_name = jam_name_and_link.jam_name;
		let jam_link = jam_name_and_link.jam_link;
		jammer_list = await getUpdatedJammerListJamDataAdded(jammer_list, max_rank,
			INPUT_MINI_JAM_FOLDER_PATH + 'mini_jam_' + SF.intToStrFixedWidth(jam_id), 
			'mini_jam', jam_id, jam_name, jam_link);
	}

	return jammer_list;
}

async function getUpdatedJammerListJamDataAdded(jammer_list, max_rank, path, jam_type, jam_id, jam_name, jam_link) {
	let jam = await File.readJsonFile(path + '.json');

	let submission_time_data = null;
	if (File.isFileExist(path + '_submission_time.json')) {
		submission_time_data = await File.readJsonFile(path + '_submission_time.json');
	}

	for (let i = 0; i < jam.length; i++) {
		let game = jam[i];
		if (game.rank > max_rank) {
			continue;
		}
		
		jammer_list = getUpdatedJammerListGameDataAdded(jammer_list, jam, game, submission_time_data,
		                                                jam_type, jam_id, jam_name, jam_link);
	}

	return jammer_list;
}

function getUpdatedJammerListGameDataAdded(jammer_list, jam, game, submission_time_data,
                                           jam_type, jam_id, jam_name, jam_link) {
	for (let j = 0; j < game.by_list.length; j++) {
		let by = game.by_list[j];
		let by_link = game.by_link_list[j];
		let index = findJammerLinkInList(jammer_list, by_link);
		let ilscore = Ilscore.calculateIlscore(game, jam.length)
		let game_push = {
			jam_type: jam_type,
			jam_id: jam_id,
			jam_name: jam_name,
			jam_link: jam_link,
			jam_vs: jam.length,
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
			game_push = getGamePushWithSubmissionTimeDataAdded(game_push, game, submission_time_data);
		}

		if (index == -1) {
			jammer_list.push({
				jammer: by,
				jammer_link: by_link,
				game_list_sorted: [ game_push ],
			});
		} else {
			jammer_list[index].game_list_sorted.push(game_push);
		}
	}

	return jammer_list;
}

function getGamePushWithSubmissionTimeDataAdded(game_push, game, submission_time_data) {
	for (let k = 0; k < submission_time_data.jammer_list.length; k++) {
		let time = submission_time_data.jammer_list[k];
		if (time.link != game.title_link) {
			continue;
		}

		game_push.submission_time_diff = time.time - submission_time_data.vote_start_time;
		break;
	}

	return game_push;
}

function getUpdatedTableOfContent(table_of_content, toc_data, type) {
	for (let i = 0; i < toc_data.length; i++) {
		let jammer = toc_data[i];
		table_of_content = getUpdatedTableOfContentJammerAdded(table_of_content, 
			jammer.jammer_link, type, jammer.page, jammer.index);
	}

	return table_of_content;
}

function getUpdatedTableOfContentJammerAdded(table_of_content, jammer_link, type, page, index) {
	let i = findJammerLinkInList(table_of_content, jammer_link);

	if (i == -1) {
		let data = {
			jammer_link: jammer_link,
		};
		data[type] = {
			page: page,
			index: index,
		};
		table_of_content.push(data);

		return table_of_content;
	}

	table_of_content[i][type] = {
		page: page,
		index: index,
	}

	return table_of_content;
}

function findJammerLinkInList(list, jammer_link) {
	for (let i = 0; i < list.length; i++) {
		if (list[i].jammer_link == jammer_link) {
			return i;
		}
	}
	return -1;
}
