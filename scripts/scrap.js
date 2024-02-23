const ScrapFiles = require('./scrap_files/scrap_files');

const INFINITE = -1;

async function main() {
	let options = ScrapFiles.newOptionObj();

	let max_mini_jam_id = INFINITE;
	if (process.argv.length >= 3) {
		max_mini_jam_id = parseInt(process.argv[2]);
		options.create_major_jam_files = false;
		options.create_jam_list_file = false;
		options.use_jam_list_json = true;
	}

	options.mini_jam_id_max_cap = max_mini_jam_id;

	await ScrapFiles.scrapFiles(options);
}

main();
