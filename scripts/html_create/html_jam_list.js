const SF = require('../utils/shared_functions');
const File = require('../utils/file');
const HtmlIndent = require('../html/html_indent');
const HtmlCreateSF = require('../html_create/shared_functions/html_create_shared_functions');

module.exports = {
	create: create,
}

const INPUT_MAJOR_JAM_FOLDER_PATH = '../_jam_list_data/major_jam/';
const INPUT_MINI_JAM_FOLDER_PATH = '../_jam_list_data/mini_jam/';
const INPUT_OTHER_DATA_FOLDER_PATH = '../_jam_list_data/';
const OUTPUT_FOLDER_PATH = '../docs/jam_list/';

async function create(indent_html) {
	let other_data = await File.readJsonFile(INPUT_OTHER_DATA_FOLDER_PATH + 'other_data.json');
	for (let i = 0; i < other_data.major_jam_num_of_page; i++) {
		let jam_list = await File.readJsonFile(INPUT_MAJOR_JAM_FOLDER_PATH 
											+ 'major_jam_list_page_' + SF.intToStrFixedWidth(i) + '.json');
		createHtmlFile(other_data.major_jam_num_of_page, i, jam_list, 'major_jam', indent_html);
	}
	for (let i = 0; i < other_data.mini_jam_num_of_page; i++) {
		let jam_list = await File.readJsonFile(INPUT_MINI_JAM_FOLDER_PATH 
											+ 'mini_jam_list_page_' + SF.intToStrFixedWidth(i) + '.json');
		createHtmlFile(other_data.mini_jam_num_of_page, i, jam_list, 'mini_jam', indent_html);
	}
}


async function createHtmlFile(num_of_page, page, jam_list, jam_type, indent_html) {
	let str_before = HtmlCreateSF.navStr(true) + '<h1>List of all jams</h1>'
	str_before += htmlMiniMajorLink(jam_type);
	str_before += htmlPageLinks(num_of_page, page, jam_type);
	str_before += '<div id="result">';
	let str_after = '</div>' + htmlPageLinks(num_of_page, page, jam_type);

	let str_middle = '';
	for (let i = 0; i < jam_list.length; i++) {
		let jam = jam_list[i];

		let attribs = 'class="jam_title" href="' + jam.link + '"';
		str_middle += HtmlCreateSF.tagStr('a', SF.getJamName(jam.jam_name, jam.id, jam_type), attribs);

		str_middle += HtmlCreateSF.tagStr('span', jam.num_of_game + ' games', 'class="num_of_game"');
		str_middle += HtmlCreateSF.tagStr('span', jam.num_of_jammer + ' jammers', 'class="num_of_jammer"');
		str_middle += HtmlCreateSF.tagStr('span', jam.num_of_new_jammer + ' new jammers', 'class="num_of_new_jammer"');

		str_middle += htmlGameList(jam.game_list);
	}

	let full_html_str = HtmlCreateSF.addPageTopBottom(str_before + str_middle + str_after, ['../_css/jam_list.css']);
	if (indent_html) {
		full_html_str = HtmlIndent.getIndented(full_html_str);
	}
	full_html_str = '<!DOCTYPE html>\n' + full_html_str;
	await File.writeFileStr(full_html_str, OUTPUT_FOLDER_PATH, 
	                           jam_type + '_page_' + SF.intToStrFixedWidth(page) + '.html');
}

function htmlGameList(game_list) {
	let game_list_inner_html = '';
	game_list_inner_html += htmlTableTitleRow();

	for (let i = 0; i < game_list.length; i++) {
		let game = game_list[i];

		let rank_html = HtmlCreateSF.tagStr('span', game.rank, 'class="rank"');

		let title_rank_html = HtmlCreateSF.tagStr('span', game.rank + '. ', 'class="title_rank"');
		let title_link_html = HtmlCreateSF.tagStr('a', title_rank_html + game.title, 'href="' + game.title_link + '"');
		let title_html = HtmlCreateSF.tagStr('span', title_link_html, 'class="title"');

		let time_tag_inner_html = '';
		if (game.hasOwnProperty('submission_time_diff')) {
			if (game.submission_time_diff > 0) {
				time_tag_inner_html = HtmlCreateSF.lateTagStr(SF.msecToStr(game.submission_time_diff));
			} else {
				time_tag_inner_html = HtmlCreateSF.earlyTagStr(SF.msecToStr(-game.submission_time_diff));
			}
		} else {
			time_tag_inner_html = HtmlCreateSF.timeUnknowTagStr();
		}
		let time_tag_html = HtmlCreateSF.tagStr('span', time_tag_inner_html, 'class="time_tag"');

		let by_list_list_html = '';
		for (let j = 0; j < game.by_list.length; j++) {
			let by = game.by_list[j];
			let by_link = game.by_link_list[j];
			by_list_list_html += HtmlCreateSF.tagStr('a', by, 'href="../jammer.html?jammer=%22' 
			                                                   + SF.getJammerShortLink(by_link) 
			                                                   + '%22"');
			if (j != game.by_list.length - 1) {
				by_list_list_html += ', ';
			}
		}
		let by_list_html = HtmlCreateSF.tagStr('span', by_list_list_html, 'class="by_list"');

		let ratings_html = HtmlCreateSF.tagStr('span', game.ratings, 'class="ratings"');

		let score_html = HtmlCreateSF.tagStr('span', game.score, 'class="score"');
		
		let ilscore_html = HtmlCreateSF.tagStr('span', game.ilscore, 'class="ilscore"');

		let game_html = HtmlCreateSF.tagStr('span', rank_html + title_html + time_tag_html + by_list_html 
										+ ratings_html + score_html + ilscore_html,
										'class="game"', 4, true);

		game_list_inner_html += game_html;
	}

	return HtmlCreateSF.tagStr('div', game_list_inner_html, 'class="game_list"');
}

function htmlTableTitleRow() {
	let str_html = '';
	str_html += HtmlCreateSF.tagStr('span', 'Rk', 'class="rank" title="Rank"');
	str_html += HtmlCreateSF.tagStr('span', 'Title', 'class="title"');
	str_html += HtmlCreateSF.tagStr('span', 'Time', 'class="time_tag"');
	str_html += HtmlCreateSF.tagStr('span', 'By', 'class="by_list"');
	str_html += HtmlCreateSF.tagStr('span', 'Rt', 'class="ratings" title="Number of ratings"');
	str_html += HtmlCreateSF.tagStr('span', 'Score', 'class="score"');
	str_html += HtmlCreateSF.tagStr('span', 'ilScr', 'class="ilscore" title="ilscore = (25 * log10(num_of_games_in_jam+1)^2) * (score/5)"');
	return HtmlCreateSF.tagStr('span', str_html, 'class="game"');
}

function htmlPageLinks(num_of_page, page, jam_type) {
	let html_str = '';
	for (let i = 0; i < num_of_page; i++) {
		let link = './' + jam_type + '_page_' + SF.intToStrFixedWidth(i) + '.html';
		let attribs = 'href="' + link + '"';
		if (page == i) {
			attribs += ' class="link_highlight"';
		}
		let a = HtmlCreateSF.tagStr('a', i.toString(), attribs);
		html_str += a;
	}
	return HtmlCreateSF.tagStr('div', html_str, 'class="page_links"');
}

function htmlMiniMajorLink(jam_type) {
	if (jam_type == 'major_jam') {
		return `
			<div id="jam_type">
				<a href="./mini_jam_page_0000.html">Mini Jam</a>
				<a href="./major_jam_page_0000.html" class="link_highlight">Major Jam</a>
			</div>`;
	}

	return `
		<div id="jam_type">
			<a href="./mini_jam_page_0000.html" class="link_highlight">Mini Jam</a>
			<a href="./major_jam_page_0000.html">Major Jam</a>
		</div>`;
}
