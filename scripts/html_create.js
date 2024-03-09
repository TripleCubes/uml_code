const HtmlJamList = require('./html_create/html_jam_list');
const HtmlLeaderboard = require('./html_create/html_leaderboard');
const HtmlStats = require('./html_create/html_stats');
const CliArgv = require('./utils/cli_argv');

async function main() {
	if (process.argv.length == 3 && process.argv[2] == '?') {
		let message = '\n';
		message += 'create html files from data files created from data_create command.\n';
		message += 'the created html is placed in docs/jam_list/, docs/leaderboard/ and docs/stats/\n\n';

		message += 'arguments:\n';
		message += '    indent (optional):    if true, the created html files\n';
		message += '        type: boolean     will have proper indentation\n';
		message += '        default: false\n';
		message += '                          creating html files with proper\n';
		message += '                          indentation is really slow, so prefer\n';
		message += '                          leaving this agrument to false\n\n';

		message += 'example:\n';
		message += '    node html_create.js indent=true';
		console.log(message);
		return;
	}

	let argv_type_list = [
		{ argv: 'indent', type: 'boolean' },
	];
	let argv_list = CliArgv.getArgvList(process.argv, argv_type_list, 'html_create.js');

	let indent_html = CliArgv.getArgv(argv_list, 'indent', false);

	await HtmlJamList.create(indent_html);
	await HtmlLeaderboard.create(indent_html);
	await HtmlStats.create();
}

main();
