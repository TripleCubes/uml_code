const HtmlJamList = require('./html_create/html_jam_list');
const HtmlLeaderboard = require('./html_create/html_leaderboard');
const HtmlStats = require('./html_create/html_stats');

async function main() {
	let indent_html = false;
	if (process.argv.length >= 3 && process.argv[2] == 'indent') {
		indent_html = true;
	}

	await HtmlJamList.create(indent_html);
	await HtmlLeaderboard.create(indent_html);
	await HtmlStats.create();
}

main();
