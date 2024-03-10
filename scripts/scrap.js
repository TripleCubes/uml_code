const ScrapFiles = require('./scrap_files/scrap_files');
const CliArgv = require('./utils/cli_argv');

const INFINITE = -1;

async function main() {
	if (process.argv.length == 3 && process.argv[2] == '?') {
		let message = '\n';
		message += 'start scraping. all datas are saved to _scraped_files/ folder\n\n';

		message += 'jams that already been scraped and saved wont get scraped\n';
		message += 'again. scraped jam will still get rescraped if a game change\n';
		message += 'its name or url\n\n';

		message += 'arguments:\n';

		message += '    wait (optional):              the wait between https requests\n';
		message += '        type: number\n';
		message += '        default: 6 (secs)\n\n';

		message += 'example:\n';
		message += '    node scrap.js wait=7\n';

		console.log(message);
		return;
	}

	let argv_type_list = [
		{ argv: 'wait', type: 'number' },
	];
	let argv_list = CliArgv.getArgvList(process.argv, argv_type_list, 'scrap.js');
	let wait = CliArgv.getArgv(argv_list, 'wait', 6);

	let options = ScrapFiles.newOptionObj();
	options.wait_between_https_gets = wait;

	await ScrapFiles.scrapFiles(options);
}

main();
