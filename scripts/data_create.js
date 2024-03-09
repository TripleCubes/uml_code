const DataJamList = require('./data_create/data_jam_list');
const DataLeaderboard = require('./data_create/data_leaderboard');
const JammerLookup = require('./data_create/jammer_lookup');
const DataStats = require('./data_create/data_stats');

async function main() {
	if (process.argv.length == 3 && process.argv[2] == '?') {
		let message = '\n';
		message += 'create json data files from the data from _scraped_files/ folder.\n';
		message += 'this data is needed to create the html files. The created data is\n';
		message += 'placed in _jam_list_data/, _stats_data/ and docs/_data_files/\n\n';

		message += 'this command have no agrument\n';
		console.log(message);
		return;
	}

	await DataJamList.create();
	await DataLeaderboard.create();
	await JammerLookup.create();
	await DataStats.create();
}

main();
