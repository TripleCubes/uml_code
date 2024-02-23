const ScrapFiles = require('./scrap_files/scrap_files');

async function main() {
	let link = '';
	if (process.argv.length >= 3) {
		link = process.argv[2];
	} else {
		console.log('a link is needed');
		return;
	}

	let options = ScrapFiles.newOptionObj();
	options.rewrite_link_list = [link];

	await ScrapFiles.scrapFiles(options);
}

main();
