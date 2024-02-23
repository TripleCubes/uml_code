const File = require('../utils/file');

module.exports = {
	create: create,
};

async function create() {
	let jam_list_other_data = await File.readJsonFile('../_jam_list_data/other_data.json');
	let leaderboard_other_data = await File.readJsonFile('../docs/_data_files/leaderboard_data/all/other_data.json');

	let stats = {
		num_of_major_jam: jam_list_other_data.num_of_major_jam,
		num_of_mini_jam: jam_list_other_data.num_of_mini_jam,
		major_jam_num_of_game: jam_list_other_data.major_jam_num_of_game,
		mini_jam_num_of_game: jam_list_other_data.mini_jam_num_of_game,

		num_of_jammer: leaderboard_other_data.num_of_jammer,
		num_of_majorjammer: leaderboard_other_data.num_of_majorjammer,
		num_of_minijammer: leaderboard_other_data.num_of_minijammer,
	}

	await File.writeJsonFile(stats, '../_stats_data/', 'stats.json');
} 
