const Https = require('https');
const Jsdom = require('jsdom');
const SF = require('../utils/shared_functions');
const Str = require('../utils/str');
const File = require('../utils/file');

module.exports = {
	newOptionObj: newOptionObj,
	scrapFiles: scrapFiles,
};

const API_LINK = 'https://minijamofficial.com/api/fetchMiniJams?n=';

const OUTPUT_JAM_LIST_FOLDER_PATH = '../_scraped_files/jam_list/';
const OUTPUT_MAJOR_JAM_FOLDER_PATH = '../_scraped_files/major_jam/';
const OUTPUT_MINI_JAM_FOLDER_PATH = '../_scraped_files/mini_jam/';

let options = {};
let failed_https_get_list = [];


const INFINITE = -1;

function newOptionObj() {
	return {
		wait_between_https_gets: 6,
		use_jam_list_json: false,
		create_jam_list_file: true,
		create_major_jam_files: true,
		create_mini_jam_files: true,
		create_jam_result_files: true,
		create_submission_time_files: true,
		mini_jam_id_max_cap: INFINITE,
		rewrite_link_list: [],
	}
}

async function scrapFiles(in_options) {
	options = in_options;

	let major_jam_list = getMajorJamList();
	let mini_jam_list = [];
	if (options.use_jam_list_json) {
		mini_jam_list = await getMiniJamListFromJson();
	} else {
		mini_jam_list = await getMiniJamListFromApi(await firstMiniJamInApiResultAvailable());
	}

	if (!options.use_jam_list_json && options.create_jam_list_file && options.mini_jam_id_max_cap == INFINITE) {
		File.writeJsonFile({
			major_jam_list: major_jam_list,
			mini_jam_list: mini_jam_list,
		}, OUTPUT_JAM_LIST_FOLDER_PATH, 'jam_list.json');
	}

	await createResultAndSubmissionTimeFiles(options, major_jam_list, mini_jam_list);

	console.log('number of failed https get: ' + failed_https_get_list.length);
	for (let i = 0; i < failed_https_get_list.length; i++) {
		console.log('    link: ' + failed_https_get_list[i].link);
		console.log('    raw headers: ' + failed_https_get_list[i].raw_headers);
		console.log();
	}
	console.log('SCRIPT FINISHED');
}


async function createResultAndSubmissionTimeFiles(options, major_jam_list, mini_jam_list) {
	if (options.rewrite_link_list.length == 0) {
		await createResultAndSubmissionTimeFilesNormally(options, major_jam_list, mini_jam_list);
	} else {
		await createResultAndSubmissionTimeFilesFromList(options.rewrite_link_list, major_jam_list, mini_jam_list);
	}
}

async function createResultAndSubmissionTimeFilesNormally(options, major_jam_list, mini_jam_list) {
	if (options.create_major_jam_files && options.mini_jam_id_max_cap == INFINITE) {
		console.log('creating major jam files');
		for (let i = 0; i < major_jam_list.length; i++) {
			let file_name = 'major_jam_' + SF.intToStrFixedWidth(major_jam_list[i].id);
			await createFile(major_jam_list[i].link, OUTPUT_MAJOR_JAM_FOLDER_PATH, file_name);
		}
	}

	if (options.create_mini_jam_files) {
		console.log('creating mini jam files');
		for (let i = 0; i < mini_jam_list.length; i++) {
			let file_name = 'mini_jam_' + SF.intToStrFixedWidth(mini_jam_list[i].id);
			await createFile(mini_jam_list[i].link, OUTPUT_MINI_JAM_FOLDER_PATH, file_name);
		}
	}
}

async function createResultAndSubmissionTimeFilesFromList(rewrite_link_list, major_jam_list, mini_jam_list) {
	for (let i = 0; i < rewrite_link_list.length; i++) {
		let rewrite_link = rewrite_link_list[i];
		let jam_info = getJamInfoFromLink(major_jam_list, mini_jam_list, rewrite_link);

		let folder_path = OUTPUT_MAJOR_JAM_FOLDER_PATH;
		if (jam_info.type == 'mini_jam') {
			folder_path = OUTPUT_MINI_JAM_FOLDER_PATH;
		}

		await createFile(rewrite_link, folder_path, 
		                  jam_info.type + '_' + SF.intToStrFixedWidth(jam_info.id));
	}
}

async function firstMiniJamInApiResultAvailable() {
	let first_jam_info = JSON.parse(await httpsGet(API_LINK + '0'));
	let page_str = await httpsGet(first_jam_info.jamLink[0]);
	let page_dom = new Jsdom.JSDOM(page_str);

	let tab_list = Array.from(page_dom.window.document.querySelectorAll('.header_tabs > *'));
	for (let i = 0; i < tab_list.length; i++) {
		if (tab_list[i].innerHTML == 'Results') {
			return true;
		}
	}
	
	return false;
}

function getJamInfoFromLink(major_jam_list, mini_jam_list, link) {
	for (let i = 0; i < major_jam_list.length; i++) {
		let jam = major_jam_list[i];

		if (jam.link != link) {
			continue;
		}

		return {
			type: 'major_jam',
			id: jam.id,
			jam_name: jam.jam_name,
			link: jam.link,
		};
	}

	for (let i = 0; i < mini_jam_list.length; i++) {
		let jam = mini_jam_list[i];
		
		if (jam.link != link) {
			continue;
		}

		return {
			type: 'mini_jam',
			id: jam.id,
			jam_name: jam.jam_name,
			link: jam.link,
		};
	}

	console.log(link + ' not found');
	return null;
}

function getMajorJamList() {
	let list = [];

	let add = function(id, jam_name, link) {
		list.push({
			id: id,
			jam_name: jam_name,
			link: link,
		});
	}

	add(6, 'Major Jam 6: Life', 'https://itch.io/jam/major-jam-6-life');
	add(5, 'Major Jam 5: Legends', 'https://itch.io/jam/major-jam-5');
	add(4, 'Major Jam 4: Cosmic', 'https://itch.io/jam/major-jam-4-cosmic');
	add(3, 'Major Jam 3: Retro', 'https://itch.io/jam/major-jam-3');
	add(2, 'Major Jam 2: Love', 'https://itch.io/jam/major-jam-2');
	add(1, 'Major Jam: Isolation', 'https://itch.io/jam/major-jam-isolation');

	return list;
}

async function getMiniJamListFromApi(get_first_minijam_in_api) {
	let mini_jam_id_max_cap = options.mini_jam_id_max_cap;
	if (options.rewrite_link_list.length != 0 || options.mini_jam_id_max_cap == INFINITE) {
		mini_jam_id_max_cap = 9999999;
	}

	let first_data_page_num = get_first_minijam_in_api ? '0' : '1';
	let first_data = JSON.parse(await httpsGet(API_LINK + first_data_page_num));
	let i_page_start = get_first_minijam_in_api ? 1 : 2;

	let max_jam_id = first_data.jamId[0];
	let max_page = Math.ceil(max_jam_id/9);

	let result_list = [];

	for (let i = 0; i < first_data.jamId.length; i++) {
		if (first_data.jamId[i] > mini_jam_id_max_cap) {
			continue;
		}
		result_list.push({
			id: first_data.jamId[i],
			jam_name: first_data.jamName[i].replaceAll('\r', ''),
			link: first_data.jamLink[i].replaceAll('\r', ''),
			image_link: first_data.jamImage[i],
		});
	}

	for (let i_page = i_page_start; i_page <= max_page; i_page++) {
		let data = JSON.parse(await httpsGet(API_LINK + i_page));
		for (let i = 0; i < data.jamId.length; i++) {
			if (data.jamId[i] > mini_jam_id_max_cap) {
				continue;
			}
			result_list.push({
				id: data.jamId[i],
				jam_name: data.jamName[i].replaceAll('\r', ''),
				link: data.jamLink[i].replaceAll('\r', ''),
				image_link: data.jamImage[i],
			});
		}
	}

	console.log('----------------------------------------------------');
	console.log('number of jams: ' + result_list.length);
	console.log('----------------------------------------------------');

	return result_list;
}

async function getMiniJamListFromJson() {
	let mini_jam_id_max_cap = options.mini_jam_id_max_cap;
	if (options.rewrite_link_list.length != 0 || options.mini_jam_id_max_cap == INFINITE) {
		mini_jam_id_max_cap = 9999999;
	}

	let result_list = [];
	let jam_list = await File.readJsonFile(OUTPUT_JAM_LIST_FOLDER_PATH + 'jam_list.json');

	for (let i = 0; i < jam_list.mini_jam_list.length; i++) {
		let jam = jam_list.mini_jam_list[i];
		if (jam.id > mini_jam_id_max_cap) {
			continue;
		}
		result_list.push({
			id: jam.id,
			jam_name: jam.jam_name,
			link: jam.link,
		});
	}

	return result_list;
}

async function httpsGet(link) {
	await delay(options.wait_between_https_gets);
	return new Promise((resolve) => {
		Https.get(link, { timeout: 0 }, async function(res) {
			let str_data = '';

			if (res.statusCode != 200) {
				console.log('----------------------------------------------------');
			}
			console.log('    ' + link + '  status code: ' + res.statusCode);
			if (res.statusCode != 200) {
				console.log(res.rawHeaders);
				console.log('----------------------------------------------------');
			}

			if (res.statusCode != 200) {
				failed_https_get_list.push({
					link: link,
					raw_headers: res.rawHeaders,
				});
				console.log('retrying')
				resolve(await httpsGet(link));
				return;
			}

			res.setEncoding('utf8');
			res.on('data', function(data) {
				str_data = str_data + data;
			});
			res.on('end', function() {
				resolve(str_data);
			});
		}).on('error', async function(err) {
			if (err instanceof AggregateError) {
				console.log('http get error: aggregate error:' + err.message);
				console.log(err.errors);
				return;
			}
			console.log('http get error: ' + err);
			console.log('retrying');
			resolve(await httpsGet(link));
			return;
		});
	});
}

async function delay(time_sec) {
	return new Promise((resolve) => {
		setTimeout(function() { resolve(); }, time_sec*1000);
	});
}

async function createFile(link, folder_path, file_name) {
	console.log('\n\n' + link + ' --------------------');

	let game_dom_list = [];
	let vote_start_time = 0;

	let entries = await entriesPage_getEntriesData(link + '/entries');

	let jam_result = [];
	let result_page_scrap_needed = !File.isFileExist(folder_path + file_name + '.json');
	if (!result_page_scrap_needed) {
		jam_result = await File.readJsonFile(folder_path + file_name + '.json');
		result_page_scrap_needed = compareAndEdit(entries, jam_result);
	}
	
	if (result_page_scrap_needed && options.create_jam_result_files) {
		console.log('scraping result pages');
		let a = await resultPage_getGameDomListAndVoteStartTime(link + '/results');
		game_dom_list = a.game_dom_list;
		vote_start_time = a.vote_start_time;
	} else {
		vote_start_time = await resultPage_getJamVoteStartTimeFromLink(link + '/results');
	}

	if (result_page_scrap_needed && options.create_jam_result_files) {
		data_list = [];
	
		for (let i = 0; i < game_dom_list.length; i++) {
			data_list.push(resultPage_getGameData(game_dom_list[i]));
		}
	
		await File.writeJsonFile(data_list, folder_path, file_name + '.json');
	}

	if (!result_page_scrap_needed && options.create_jam_result_files) {
		await File.writeJsonFile(jam_result, folder_path, file_name + '.json');
	}


	if (options.create_submission_time_files) {
		let game_submission_time_list = await getGameSubmissionTimeList(entries);
		await File.writeJsonFile({
			vote_start_time: vote_start_time, 
			jammer_list: game_submission_time_list,
		}, folder_path, file_name + '_submission_time.json');
	}
}

async function entriesPage_getEntriesData(link) {
	const randomizer_url_search_str = 'randomizer?jam_id=';
	let entries_page_dom_str = await httpsGet(link);
	let entries_json_id = Str.getBetween(entries_page_dom_str, randomizer_url_search_str, '"');
	let entries_json_link = 'https://itch.io/jam/' + entries_json_id + '/entries.json';
	let entries_json_str = await httpsGet(entries_json_link);
	let entries = JSON.parse(entries_json_str);
	return entries;
}

function compareAndEdit(entries, jam_result) {
	let result_page_rescrap_needed = false;
	for (let i = 0; i < entries.jam_games.length; i++) {
		let entries_game = entries.jam_games[i];

		if (entries_game.rating_count == 0) {
			continue;
		}

		let result_game_index = getGameIndexFromJamResultData(jam_result, entries_game);
		if (result_game_index == -1) {
			let m = '        > added: ' + entries_game.game.title + ' (' + entries_game.game.url + ')';
			m += ', jam rescrap needed';
			console.log(m);
			result_page_rescrap_needed = true;
			continue;
		}
		let result_game = jam_result[result_game_index];

		let entries_by_list = [];
		let entries_by_link_list = [];
		if (entries_game.hasOwnProperty('contributors')) {
			for (let j = 0; j < entries_game.contributors.length; j++) {
				let contributor = entries_game.contributors[j];
				entries_by_list.push(contributor.name);
				entries_by_link_list.push(contributor.url + '/');
			}
		} else {
			entries_by_list = [ entries_game.game.user.name ];
			entries_by_link_list = [ entries_game.game.user.url + '/' ];
		}

		for (let j = 0; j < entries_by_list.length; j++) {
			let entries_by = entries_by_list[j];
			let entries_by_link = entries_by_link_list[j];
			let result_by_index = result_game.by_list.indexOf(replaceAllSpecialChars(entries_by));
			let result_by_link_index = result_game.by_link_list.indexOf(entries_by_link);
			if (result_by_index != -1 && result_by_link_index != -1) {
				continue;
			}
			
			let m = '        > game: ' + result_game.title + ' (' + result_game.title_link + ')';
			m += ': jammers name/url changed from:'
			console.log(m);
			for (let k = 0; k < result_game.by_list.length; k++) {
				let by = result_game.by_list[k];
				let by_link = result_game.by_link_list[k];
				console.log('            ' + by + ' (' + by_link + ')');
			}
			console.log('        to');
			for (let k = 0; k < entries_by_list.length; k++) {
				let by = entries_by_list[k];
				let by_link = entries_by_link_list[k];
				console.log('            ' + by + ' (' + by_link + ')');
			}
			result_game.by_list = entries_by_list;
			result_game.by_link_list = entries_by_link_list;
			break;
		}
	}
	
	for (let i = jam_result.length - 1; i >= 0; i--) {
		let result_game = jam_result[i];
		let entries_game_index = getGameIndexFromJamEntriesData(entries, result_game);
		if (entries_game_index != -1) {
			continue;
		}

		console.log('        > removed: ' + result_game.title + ' (' + result_game.title_link + ')');
		jam_result.splice(i, 1);
	}

	return result_page_rescrap_needed;
}

function getGameIndexFromJamResultData(jam_result, entries_game) {
	for (let i = 0; i < jam_result.length; i++) {
		if (jam_result[i].title == replaceAllSpecialChars(entries_game.game.title)
		&& jam_result[i].title_link == entries_game.game.url) {
			return i;
		}
	}
	return -1;
}

function getGameIndexFromJamEntriesData(entries, result_game) {
	for (let i = 0; i < entries.jam_games.length; i++) {
		if (replaceAllSpecialChars(entries.jam_games[i].game.title) == result_game.title
		&& entries.jam_games[i].game.url == result_game.title_link) {
			return i;
		}
	}
	return -1;
}

function replaceAllSpecialChars(s) {
	s = s.replaceAll('&', '&amp;');
	s = s.replaceAll('<', '&lt;');
	s = s.replaceAll('>', '&gt;');
	return s;
}

async function getGameSubmissionTimeList(entries) {
	let result_list = [];
	for (let i = 0; i < entries.jam_games.length; i++) {
		let game = entries.jam_games[i];
		result_list.push({
			time: Date.parse(game.created_at + ' UTC'),
			link: game.game.url,
		});
	}
	return result_list;
}

async function resultPage_getJamVoteStartTimeFromLink(link) {
	let page_0_dom_str = await httpsGet(link);
	let page_0_dom = new Jsdom.JSDOM(page_0_dom_str);
	let vote_start_time = resultPage_getJamVoteStartTimeFromDom(page_0_dom);
	return vote_start_time;
}

async function resultPage_getGameDomListAndVoteStartTime(link) {
	let page_0_dom_str = await httpsGet(link);
	let page_0_dom = new Jsdom.JSDOM(page_0_dom_str);
	let max_num_page = resultPage_getMaxNumPage(page_0_dom);
	let vote_start_time = resultPage_getJamVoteStartTimeFromDom(page_0_dom);
	let game_dom_list = [];

	game_dom_list = game_dom_list.concat(Array.from(page_0_dom.window.document.querySelectorAll('.game_rank')));

	for (let i = 2; i <= max_num_page; i++) {
		let paged_link = link + '?page=' + i;
		let dom_str = await httpsGet(paged_link);
		let dom = new Jsdom.JSDOM(dom_str);
		game_dom_list = game_dom_list.concat(Array.from(dom.window.document.querySelectorAll('.game_rank')));
	}

	return {
		vote_start_time: vote_start_time,
		game_dom_list: game_dom_list,
	};
}

function resultPage_getMaxNumPage(dom) {
	let element = dom.window.document.querySelector('.pager_label a');

	if (element != null) {
		return parseInt(element.innerHTML);
	}

	return 0;
}

function resultPage_getJamVoteStartTimeFromDom(dom) {
	let element = Array.from(dom.window.document.querySelectorAll('.jam_summary .date_format'))[1];
	return Date.parse(element.innerHTML + ' UTC');
}

function resultPage_getGameData(game) {
	let summary = game.querySelector('.game_summary');
	let table = game.querySelector('.ranking_results_table');

	let data = {
		title: summary.querySelector('h2 a').innerHTML,
		title_link: summary.querySelector('h2 a').href,
		submission_page_link: 'https://itch.io' + summary.querySelector('p a').href,
		by_list: gameData_getByList(summary.querySelector('h3')),
		by_link_list: gameData_getByLinkList(summary.querySelector('h3')),
		rank: gameData_getRank(summary.querySelectorAll('h3')[1].innerHTML),
		ratings: gameData_getNumOfRating(summary.querySelectorAll('h3')[1].innerHTML),
		score: gameData_getScore(summary.querySelectorAll('h3')[1].textContent),

		table: gameData_getTableData(table),
	};

	return data;
}

function gameData_getTableData(table) {
	let get_row_data = function(tr) {
		let td_list = Array.from(tr.querySelectorAll('td'));
		let has_a = td_list[0].querySelector('a') != null;

		let row_data = {
			criteria: gameData_getCriteria(has_a, td_list[0].innerHTML),
			rank: parseInt(td_list[1].innerHTML.replaceAll('#', '')),
			score: parseFloat(td_list[2].innerHTML),
			raw_score: parseFloat(td_list[3].innerHTML),
		}

		return row_data;
	}

	let tr_list = Array.from(table.querySelectorAll('tr'));
	let table_data = [];
	
	for (let i = 1; i < tr_list.length; i++) {
		table_data.push(get_row_data(tr_list[i]));
	}

	return table_data;
}

function gameData_getCriteria(has_a, str) {
	if (has_a) {
		str = Str.rmBetween(str, '<', '>');
		str = Str.rmBetween(str, '<', '>');
		str = str.replaceAll('<', '');
		str = str.replaceAll('>', '');
	}
	return str;
}

function gameData_getByList(element) {
	let list = [];
	let list_a = Array.from(element.querySelectorAll('a'));
	for (let i = 0; i < list_a.length; i++) {
		list.push(list_a[i].innerHTML);
	}
	return list;
}

function gameData_getByLinkList(element) {
	let list = [];
	let list_a = Array.from(element.querySelectorAll('a'));
	for (let i = 0; i < list_a.length; i++) {
		list.push(list_a[i].href);
	}
	return list;
}

function gameData_getRank(str) {
	str = Str.getBetween(str, 'Ranked', '</strong>');
	str = Str.onlyNum(str);
	return parseInt(str);
}

function gameData_getNumOfRating(str) {
	str = strRmTag(str, 'strong');
	str = Str.rmBetween(str, '(', ')');
	str = str.replaceAll('Ranked', '');
	str = str.replaceAll('with', '');
	str = str.replaceAll('ratings', '');
	str = str.replaceAll('rating', '');
	str = str.replaceAll(' ', '');
	return parseInt(str);
}

function gameData_getScore(str) {
	str = Str.getBetween(str, '(', ')');
	str = str.replaceAll('Score:', '');
	str = str.replaceAll(' ', '');
	return parseFloat(str);
}

function strRmTag(str, tag) {
	let start = str.indexOf('<' + tag);
	let end = str.indexOf('</' + tag + '>') + tag.length + 3;
	return str.slice(0, start) + str.slice(end, str.length);
}
