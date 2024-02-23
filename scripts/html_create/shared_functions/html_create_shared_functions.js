module.exports = {
	addPageTopBottom: addPageTopBottom,
	tagStr: tagStr,
	navStr: navStr,
	majorJamTagStr: majorJamTagStr,
	lateTagStr: lateTagStr,
	earlyTagStr: earlyTagStr,
	timeUnknowTagStr: timeUnknowTagStr,
}

function addPageTopBottom(html_str, list_additional_css) {
	let top_0 =  `
		<html lang="en">
		<head>
			<meta charset="UTF-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<title>Unofficial Mini Jam Leaderboard</title>
			<link rel="stylesheet" href="../_css/main.css" />`;
	let top_2 = `	
			<link rel="shortcut icon" href="#" />
		</head>
		<body>
			<div id="content">`;
	let bottom = `
			</div>
		</body>
		</html>`;
	let top_1 = '';
	for (let i = 0; i < list_additional_css.length; i++) {
		top_1 += '<link rel="stylesheet" href="' + list_additional_css[i] + '" />';
	}

	return top_0 + top_1 + top_2 + html_str + bottom;
}

function tagStr(tag, inner_html, attribs) {
	let str = '<' + tag + ' ' + attribs + '>' + inner_html;
	str += '</' + tag + `>`;
	
	return str;
}

function navStr(up_folder) {
	if (!up_folder) {
		return `
			<div id="nav">
				<a href="./leaderboard/leaderboard_10_page_0000.html">Leaderboard</a>
				<a href="./jam_list/mini_jam_page_0000.html">Jam list</a>
				<a href="./jammer_search.html">Jammer search</a>
				<a href="./stats/stats.html">Stats</a>
				<a href="https://github.com/TripleCubes/uml">Github</a>
			</div>`;
	}

	return `
		<div id="nav">
			<a href="../leaderboard/leaderboard_10_page_0000.html">Leaderboard</a>
			<a href="../jam_list/mini_jam_page_0000.html">Jam list</a>
			<a href="../jammer_search.html">Jammer search</a>
			<a href="../stats/stats.html">Stats</a>
			<a href="https://github.com/TripleCubes/uml">Github</a>
		</div>`;
}

function majorJamTagStr() {
	return '<span class="major_jam_tag"></span>';
}

function lateTagStr(str) {
	return '<span class="late">' + str + '</span>';
}

function earlyTagStr(str) {
	return '<span class="early">' + str + '</span>';
}

function timeUnknowTagStr() {
	return '<span class="time_unknown"></span>';
}
