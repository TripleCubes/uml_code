const DataJamList = require('./data_create/data_jam_list');
const DataLeaderboard = require('./data_create/data_leaderboard');
const JammerLookup = require('./data_create/jammer_lookup');
const DataStats = require('./data_create/data_stats');

async function main() {
	await DataJamList.create();
	await DataLeaderboard.create();
	await JammerLookup.create();
	await DataStats.create();
}

main();
