const SF = require('../utils/shared_functions');
const File = require('../utils/file');
const HtmlIndent = require('../html/html_indent');
const HtmlCreateSF = require('../html_create/shared_functions/html_create_shared_functions');

module.exports = {
	create: create,
}

const INPUT_FOLDER_PATH = '../docs/_data_files/leaderboard_data/';
const OUTPUT_FOLDER_PATH = '../docs/leaderboard/';

const ILSCORE_OUTPUT_FILENAME_FORMAT = 'leaderboard_ilscore_page_';

async function create(indent_html) {
	await createLeaderboardHtmlFiles(INPUT_FOLDER_PATH + 'by_game_in_top_1/', 'leaderboard_1_page_', indent_html);
	await createLeaderboardHtmlFiles(INPUT_FOLDER_PATH + 'by_game_in_top_5/', 'leaderboard_5_page_', indent_html);
	await createLeaderboardHtmlFiles(INPUT_FOLDER_PATH + 'by_game_in_top_10/', 'leaderboard_10_page_', indent_html);
	await createLeaderboardHtmlFiles(INPUT_FOLDER_PATH + 'by_game_in_top_20/', 'leaderboard_20_page_', indent_html);
	await createLeaderboardHtmlFiles(INPUT_FOLDER_PATH + 'by_ilscore/', ILSCORE_OUTPUT_FILENAME_FORMAT, indent_html);
}


async function createLeaderboardHtmlFiles(input_folder, output_filename_format, indent_html) {
	let other_data = await File.readJsonFile(input_folder + 'other_data.json');
	for (let i = 0; i < other_data.num_of_page; i++) {
		let jammer_list = await File.readJsonFile(input_folder + 'page_' + SF.intToStrFixedWidth(i) + '.json');
		await createHtmlFile(i, other_data.num_of_page, other_data.num_of_jammer_per_page, 
		                     jammer_list, output_filename_format, indent_html);
	}
}

async function createHtmlFile(page, num_of_page, num_of_jammer_per_page, 
                              jammer_list, output_filename_format, indent_html) {
	let str_before = HtmlCreateSF.navStr(true)
		+ '<h1>Unofficial Mini Jam Leaderboard</h1>'
		+ htmlGamesThatGotInTop(output_filename_format)
		+ htmlPageLink(num_of_page, page, output_filename_format)
		+ '<div id="result">';
	let str_after = '</div>'
		+ htmlPageLink(num_of_page, page, output_filename_format);

	let str_middle = '';
	for (let i = 0; i < jammer_list.length; i++) {
		let jammer = jammer_list[i];

		let jammer_link_attribs = 'class="jammer_link" href="' + jammer.jammer_link + '"';
		let jammer_link_html = HtmlCreateSF.tagStr('a', (i+1 + page*num_of_jammer_per_page) + '. ' + jammer.jammer,
		                                   jammer_link_attribs);
		str_middle += jammer_link_html;

		let jammer_page_link_attribs = 'class="jammer_page" href="' + '../jammer.html?jammer=%22'
		                                + getJammerShortLink(jammer.jammer_link) + '%22"';
		let jammer_page_link_html = HtmlCreateSF.tagStr('a', 'Jammer page', jammer_page_link_attribs);
		
		str_middle += jammer_page_link_html;


		if (output_filename_format == ILSCORE_OUTPUT_FILENAME_FORMAT) {
			str_middle += HtmlCreateSF.tagStr('span', 'Total ilScore: ' + jammer.total_ilscore, 'class="total_ilscore"');
		} else {
			str_middle += htmlRankList(jammer.game_list_sorted);
		}

		str_middle += htmlGameList(jammer.jammer_link, jammer.game_list_sorted);
	}

	let full_html_str = HtmlCreateSF.addPageTopBottom(str_before + str_middle + str_after, 
	                                           ['../_css/jammer_leaderboard.css']);
	if (indent_html) {
		full_html_str = HtmlIndent.getIndented(full_html_str);
	}
	full_html_str = '<!DOCTYPE html>\n' + full_html_str;
	await File.writeFileStr(full_html_str, OUTPUT_FOLDER_PATH, 
							output_filename_format + SF.intToStrFixedWidth(page) + '.html');
}

function htmlRankList(game_list) {
	let str_html = '';
	for (let i = 0; i < game_list.length; i++) {
		str_html += '<span>' + game_list[i].rank + '</span>';
	}
	return HtmlCreateSF.tagStr('div', str_html, 'class="rank_list"');
}

function htmlGameList(jammer_link, game_list) {
	let game_list_inner_html = '';
	game_list_inner_html += htmlTableTitleRow();

	for (let i = 0; i < game_list.length; i++) {
		let game = game_list[i];

		let title_link_html = HtmlCreateSF.tagStr('a', game.title, 'href="' + game.title_link + '"');
		let title_inner_html = title_link_html;
		if (game.jam_type == 'major_jam') {
			title_inner_html += HtmlCreateSF.majorJamTagStr();
		}
		let title_html = HtmlCreateSF.tagStr('span', title_inner_html, 'class="title"');

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

		let teamed_with_list_list_html = '';
		let rm_index = game.by_link_list.indexOf(jammer_link);
		game.by_link_list.splice(rm_index, 1);
		game.by_list.splice(rm_index, 1);
		for (let j = 0; j < game.by_list.length; j++) {
			let by = game.by_list[j];
			let by_link = game.by_link_list[j];
			teamed_with_list_list_html += HtmlCreateSF.tagStr('a', by, 'href="../jammer.html?jammer=%22' 
														+ SF.getJammerShortLink(by_link) 
														+ '%22"');
			if (j != game.by_list.length - 1) {
				teamed_with_list_list_html += ', ';
			}
		}
		let by_list_attribs = 'class="teamed_with"'
		if (game.by_list.length == 0) {
			by_list_attribs = 'class="teamed_with teamed_with_blank"'
		}
		let teamed_with_list_html = HtmlCreateSF.tagStr('span', teamed_with_list_list_html, by_list_attribs);

		let jam_link_html = HtmlCreateSF.tagStr('a', SF.getJamName(game.jam_name, game.jam_id, game.jam_type, true),
										'href="' + game.jam_link + '"');
		let jam_html = HtmlCreateSF.tagStr('span', jam_link_html, 'class="jam"');

		let vs_html = HtmlCreateSF.tagStr('span', game.jam_vs, 'class="vs"');

		let rank_html = HtmlCreateSF.tagStr('span', game.rank, 'class="rank"');

		let ratings_html = HtmlCreateSF.tagStr('span', game.ratings, 'class="ratings"');

		let ilscore_html = HtmlCreateSF.tagStr('span', game.ilscore, 'class="ilscore"');

		let game_html = HtmlCreateSF.tagStr('span', title_html + time_tag_html + teamed_with_list_html + jam_html 
											+ vs_html + rank_html + ratings_html + ilscore_html,
											'class="game"');

		game_list_inner_html += game_html;
	}

	return HtmlCreateSF.tagStr('div', game_list_inner_html, 'class="game_list"');
}

function htmlTableTitleRow() {
	let str_html = '';
	str_html += HtmlCreateSF.tagStr('span', 'Game Title', 'class="title"');
	str_html += HtmlCreateSF.tagStr('span', 'Time', 'class="time_tag"');
	str_html += HtmlCreateSF.tagStr('span', 'Teamed with', 'class="teamed_with"');
	str_html += HtmlCreateSF.tagStr('span', 'Jam', 'class="jam"');
	str_html += HtmlCreateSF.tagStr('span', 'Vs', 'class="vs" title="Number of games in jam"');
	str_html += HtmlCreateSF.tagStr('span', 'Rk', 'class="rank" title="Rank"');
	str_html += HtmlCreateSF.tagStr('span', 'Rt', 'class="ratings" title="Number of ratings"');
	str_html += HtmlCreateSF.tagStr('span', 'ilScr', 'class="ilscore" title="ilscore = ((num_of_games_in_jam - rank) + 1)*2 * (score/5)"');
	
	return HtmlCreateSF.tagStr('span', str_html, 'class="game"');
}

function htmlGamesThatGotInTop(output_filename_format) {
	if (output_filename_format == 'leaderboard_1_page_') {
		return `
			<div id="games_that_got_in_top">
				<span>Games that got in top: </span>
				<a href="./leaderboard_1_page_0000.html" class="link_highlight">1</a>
				<a href="./leaderboard_5_page_0000.html">5</a>
				<a href="./leaderboard_10_page_0000.html">10</a>
				<a href="./leaderboard_20_page_0000.html">20</a>
				<a href="./leaderboard_ilscore_page_0000.html">ilScore</a>
			</div>`;
	}
	if (output_filename_format == 'leaderboard_5_page_') {
		return `
			<div id="games_that_got_in_top">
				<span>Games that got in top: </span>
				<a href="./leaderboard_1_page_0000.html">1</a>
				<a href="./leaderboard_5_page_0000.html" class="link_highlight">5</a>
				<a href="./leaderboard_10_page_0000.html">10</a>
				<a href="./leaderboard_20_page_0000.html">20</a>
				<a href="./leaderboard_ilscore_page_0000.html">ilScore</a>
			</div>`;
	}
	if (output_filename_format == 'leaderboard_10_page_') {
		return `
			<div id="games_that_got_in_top">
				<span>Games that got in top: </span>
				<a href="./leaderboard_1_page_0000.html">1</a>
				<a href="./leaderboard_5_page_0000.html">5</a>
				<a href="./leaderboard_10_page_0000.html" class="link_highlight">10</a>
				<a href="./leaderboard_20_page_0000.html">20</a>
				<a href="./leaderboard_ilscore_page_0000.html">ilScore</a>
			</div>`;
	}
	if (output_filename_format == 'leaderboard_20_page_') {
		return `
			<div id="games_that_got_in_top">
				<span>Games that got in top: </span>
				<a href="./leaderboard_1_page_0000.html">1</a>
				<a href="./leaderboard_5_page_0000.html">5</a>
				<a href="./leaderboard_10_page_0000.html">10</a>
				<a href="./leaderboard_20_page_0000.html" class="link_highlight">20</a>
				<a href="./leaderboard_ilscore_page_0000.html">ilScore</a>
			</div>`;
	}
	if (output_filename_format == 'leaderboard_ilscore_page_') {
		return `
			<div id="games_that_got_in_top">
				<span>Games that got in top: </span>
				<a href="./leaderboard_1_page_0000.html">1</a>
				<a href="./leaderboard_5_page_0000.html">5</a>
				<a href="./leaderboard_10_page_0000.html">10</a>
				<a href="./leaderboard_20_page_0000.html">20</a>
				<a href="./leaderboard_ilscore_page_0000.html" class="link_highlight">ilScore</a>
			</div>`;
	}
}

function htmlPageLink(num_of_page, page, output_filename_format) {
	let str_html = '';
	for (let i = 0; i < num_of_page; i++) {
		let link = './' + output_filename_format + SF.intToStrFixedWidth(i) + '.html';
		let attribs = 'href="' + link + '"';
		if (page == i) {
			attribs += ' class="link_highlight"';
		}
		let a = HtmlCreateSF.tagStr('a', i.toString(), attribs, 3);
		str_html += a;
	}
	return HtmlCreateSF.tagStr('div', str_html, 'class="page_links"', 2, true);
}

function getJammerShortLink(link) {
    link = link.replaceAll('https://', '');
    if (link[link.length - 1] == '/') {
        link = link.slice(0, link.length - 1);
    }
    return link;
}
