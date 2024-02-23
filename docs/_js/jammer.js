const INPUT_FOLDER_PATH = './_data_files/leaderboard_data/';

const RANK = 0;
const ILSCORE = 1;
const JAM = 2;
let sorting_by = RANK;
let jammer_data = {};

async function main() {
	let url = window.location.href;
	if (url.indexOf('?jammer=') == -1) {
		window.location.replace('./jammer_search.html');
		return;
	}
	
	let jammer_name_h1 = document.querySelector('#jammer_name');
	let jammer_link_a = document.querySelector('#jammer_link');
	let result_div = document.querySelector('#result');

	let toc = await getJson(INPUT_FOLDER_PATH + 'table_of_content.json');
	let jammer_link = getJammerLinkFromPageLink();
	let page_ref = getPageRef(toc, jammer_link);
	
	if (page_ref == -1) {
		jammer_name_h1.innerHTML = 'Not found';
		return;
	}

	let other_data = await getJson(INPUT_FOLDER_PATH + 'all/other_data.json');
	let jammer_page = await getJson(INPUT_FOLDER_PATH + 'all/page_' + intToStrFixedWidth(page_ref.all.page) + '.json');
	jammer_data = jammer_page[page_ref.all.index];
	jammer_name_h1.innerHTML = jammer_data.jammer;
	jammer_link_a.innerHTML = getJammerShortLink(jammer_data.jammer_link);
	jammer_link_a.href = jammer_data.jammer_link;

	if (page_ref.hasOwnProperty('_1')) {
		await createLeaderboadHeaderAndData(page_ref._1.page, page_ref._1.index, 
		                                    other_data.num_of_jammer_per_page,
		                                    INPUT_FOLDER_PATH + 'by_game_in_top_1/',
		                                    'Rank by game in top 1', false);
	}
	if (page_ref.hasOwnProperty('_5')) {
		await createLeaderboadHeaderAndData(page_ref._5.page, page_ref._5.index, 
		                                    other_data.num_of_jammer_per_page,
		                                    INPUT_FOLDER_PATH + 'by_game_in_top_5/',
		                                    'Rank by game in top 5', false);
	}
	if (page_ref.hasOwnProperty('_10')) {
		await createLeaderboadHeaderAndData(page_ref._10.page, page_ref._10.index, 
		                                    other_data.num_of_jammer_per_page,
		                                    INPUT_FOLDER_PATH + 'by_game_in_top_10/',
		                                    'Rank by game in top 10', false);
	}
	if (page_ref.hasOwnProperty('_20')) {
		await createLeaderboadHeaderAndData(page_ref._20.page, page_ref._20.index, 
		                                    other_data.num_of_jammer_per_page,
		                                    INPUT_FOLDER_PATH + 'by_game_in_top_20/',
		                                    'Rank by game in top 20', false);
	}
	if (page_ref.hasOwnProperty('ilscore')) {
		await createLeaderboadHeaderAndData(page_ref.ilscore.page, page_ref.ilscore.index, 
		                                    other_data.num_of_jammer_per_page,
		                                    INPUT_FOLDER_PATH + 'by_ilscore/',
		                                    'Rank by ilScore', true);
	}

	let games_header_and_sort_btn = document.createElement('span');
	games_header_and_sort_btn.classList.add('games_header_and_sort_btn');

	let games_header = document.createElement('h3');
	games_header.innerHTML = 'Games';
	games_header.classList.add('games_header');
	games_header_and_sort_btn.append(games_header);

	games_header_and_sort_btn.append(getSortButton());

	result_div.append(games_header_and_sort_btn);

	createGameListSorted(jammer_data, sorting_by);
}

main();



function switchSortingBy(in_sorting_by) {
	if (in_sorting_by == RANK) {
		return ILSCORE;
	}
	if (in_sorting_by == ILSCORE) {
		return JAM;
	}
	if (in_sorting_by == JAM) {
		return RANK;
	}
}

function getSortButton() {
	let btn = document.createElement('button');
	btn.classList.add('sort_btn');
	btn.innerHTML = 'Sorting by rank';
	btn.onclick = function() {
		sorting_by = switchSortingBy(sorting_by);
		if (sorting_by == RANK) {
			this.innerHTML = 'Sorting by rank';
		} else if (sorting_by == ILSCORE) {
			this.innerHTML = 'Sorting by ilscore';
		} else if (sorting_by == JAM) {
			this.innerHTML = 'Sorting by jam';
		}
		createGameListSorted(jammer_data, sorting_by);
	}
	return btn;
}

function gameListFirstRow(game_list) {
	let game = document.createElement('span');
	game.classList.add('game');

	game.append(span('Title', 'title'));
	game.append(span('Time', 'time_tag'));
	game.append(span('Teamed with', 'teamed_with'));
	game.append(span('Jam', 'jam'));
	game.append(span('Vs', 'vs', 'Number of games in jam'));
	game.append(span('Rk', 'rank', 'Rank'));
	game.append(span('Rt', 'ratings', 'Number of ratings'));
	game.append(span('Score', 'score'));
	game.append(span('ilScr', 'ilscore', 'ilscore = ((num_of_games_in_jam - rank) + 1)*2 * (score/5)'));

	game_list.append(game);
}

function createGameListSorted(jammer_data, sorting_by) {
	let game_data_list = getGameDataList(jammer_data);
	if (sorting_by == ILSCORE) {
		game_data_list.sort(function(a, b) {
			return b.ilscore - a.ilscore;
		})
	} else if (sorting_by == JAM) {
		game_data_list.sort(function(a, b) {
			if (a.jam_type == 'mini_jam' && b.jam_type == 'major_jam') {
				return 1;
			} else if (a.jam_type == 'major_jam' && b.jam_type == 'mini_jam') {
				return -1;
			}
			return b.jam_id - a.jam_id;
		})
	}

	let game_list_element = document.querySelector('.game_list');
	if (game_list_element != null) {
		game_list_element.remove();
	}

	createGameList(jammer_data.jammer_link, game_data_list);
}

function getGameDataList(jammer_data) {
	let list = [];
	for (let i = 0; i < jammer_data.game_list_sorted.length; i++) {
		let obj_game = jammer_data.game_list_sorted[i];
		list.push(obj_game);
	}
	return list;
}

function createGameList(jammer_link, game_data_list) {
	let result_div = document.querySelector('#result');

	let game_list = document.createElement('div');
	game_list.classList.add('game_list');
	gameListFirstRow(game_list);

	for (let i = 0; i < game_data_list.length; i++) {
		let obj_game = game_data_list[i];

		let game = document.createElement('span');
		game.classList.add('game');

		let title_link = document.createElement('a');
		title_link.append(obj_game.title);
		title_link.href = obj_game.title_link;
		let title = span(title_link, 'title');

		if (obj_game.jam_type == 'major_jam') {
			title.append(span('', 'major_jam_tag'));
		}

		let time_tag = span('', 'time_tag');
		if (obj_game.hasOwnProperty('submission_time_diff')) {
			if (obj_game.submission_time_diff > 0) {
				time_tag.append(span(msecToStr(obj_game.submission_time_diff), 'late'));
			} else {
				time_tag.append(span(msecToStr(-obj_game.submission_time_diff), 'early'));
			}
		} else {
			time_tag.append(span('', 'time_unknown'));
		}

		let teamed_with_list = document.createElement('span');
		teamed_with_list.classList.add('teamed_with');
		let rm_index = obj_game.by_link_list.indexOf(jammer_link)
		if (rm_index != -1) {
			obj_game.by_link_list.splice(rm_index, 1);
			obj_game.by_list.splice(rm_index, 1);
		}
		if (obj_game.by_list.length == 0) {
			teamed_with_list.classList.add('teamed_with_blank');
		}
		for (let i = 0; i < obj_game.by_list.length; i++) {
			let by = obj_game.by_list[i];
			let by_link = obj_game.by_link_list[i];

			let a = document.createElement('a');
			a.innerHTML = by;
			a.href = './jammer.html?jammer="' + getJammerShortLink(by_link) + '"';
			teamed_with_list.append(a);
			if (i != obj_game.by_list.length - 1) {
				teamed_with_list.append(', ');
			}
		}

		let jam_link = document.createElement('a');
		jam_link.innerHTML = getJamName(obj_game.jam_name, obj_game.jam_id, obj_game.jam_type);
		jam_link.href = obj_game.jam_link;
		let jam = span(jam_link, 'jam');

		let vs = span(obj_game.jam_vs, 'vs');

		let rank = span(obj_game.rank, 'rank');

		let ratings = span(obj_game.ratings, 'ratings');

		let score = span(obj_game.score, 'score');

		let ilscore = span(obj_game.ilscore, 'ilscore');

		game.append(title);
		game.append(time_tag);
		game.append(teamed_with_list);
		game.append(jam);
		game.append(vs);
		game.append(rank);
		game.append(ratings);
		game.append(score);
		game.append(ilscore);

		game_list.append(game);
	}

	result_div.append(game_list);
}

function span(append, class_name, title = '') {
	let span = document.createElement('span');
	span.classList.add(class_name);
	span.title = title;
	span.append(append);
	return span;
}

async function createLeaderboadHeaderAndData(page, index, num_of_jammer_per_page, 
                                             input_folder_path, h3_text, ilscore) {
	let result_div = document.querySelector('#result');
	let jammer_page = await getJson(input_folder_path + 'page_' + intToStrFixedWidth(page) + '.json');
	let jammer_data = jammer_page[index];

	let h3 = document.createElement('h3');
	h3.innerHTML = h3_text;
	result_div.append(h3);

	let p = document.createElement('p');
	p.innerHTML = 'Rank: ' + (num_of_jammer_per_page*page + index + 1);
	result_div.append(p);

	if (!ilscore) {
		result_div.append(getRankList(jammer_data));
	} else {
		total_ilscore = document.createElement('p');
		total_ilscore.innerHTML = 'Total ilscore: ' + jammer_data.total_ilscore;
		result_div.append(total_ilscore);
	}
}

function getRankList(jammer_data) {
	let rank_list = document.createElement('span');
	rank_list.classList.add('rank_list');

	for (let i = 0; i < jammer_data.game_list_sorted.length; i++) {
		let game = jammer_data.game_list_sorted[i];
		let span = document.createElement('span');
		span.innerHTML = game.rank;
		rank_list.append(span);
	}

	return rank_list;
}

function getPageRef(toc, jammer_link) {
	for (let i = 0; i < toc.length; i++) {
		let jammer = toc[i];
		if (getJammerShortLink(jammer.jammer_link) == jammer_link) {
			return jammer;
		}
	}

	return -1;
}

function getJammerShortLink(link) {
	link = link.replaceAll('https://', '');
	if (link[link.length - 1] == '/') {
		link = link.slice(0, link.length - 1);
	}
	return link;
}

function getJammerLinkFromPageLink() {
	let url = window.location.href;
	let index = url.indexOf('jammer=') + 7;
	if (index - 7 == -1) {
		return 0;
	}
	return url.slice(index, url.length).replaceAll('%22', '');
}

async function getJson(link) {
	let data = [];

	await fetch(link)
	.then(res => res.json())
	.then(out => data = out)
	.catch(err => { throw err });

	return data;
}

function intToStrFixedWidth(num) {
	return ('000000' + num).slice(-4);
};

function getJamName(jam_name, jam_id, jam_type) {
	if (jam_type == 'major_jam') {
		let colon_pos = jam_name.indexOf(':');
		if (colon_pos != -1) {
			jam_name = jam_name.slice(colon_pos + 2, jam_name.length);
		}
	}

	return (jam_type == 'major_jam' ? 'MJ+ ' : 'MJ ') + jam_id + ': ' + jam_name;
}

function msecToStr(t_msec) {
	let t_sec = Math.floor(t_msec / (1000));
	let t_sec_remains = t_sec % 60;

	let t_min = Math.floor(t_msec / (1000*60));
	let t_min_remains = t_min % 60;

	let t_hour = Math.floor(t_msec / (1000*60*60));
	let t_day = Math.floor(t_hour / 24);
	let t_hour_remains = t_hour % 24;

	let day_str = '';
	if (t_day != 0) {
		day_str = t_day + 'd ';
	}

	let hour_str = '';
	if (t_day != 0 || t_hour_remains != 0) {
		hour_str = t_hour_remains + 'h ';
	}

	let min_str = '';
	if (t_day == 0 && t_min_remains != 0) {
		min_str = t_min_remains + 'm ';
	}

	let sec_str = '';
	if (t_day == 0 && t_hour == 0) {
		sec_str = t_sec_remains + 's ';
	}

	return day_str + hour_str + min_str + sec_str;
}
