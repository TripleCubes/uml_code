module.exports = {
	calculateIlscore: calculateIlscore,
	getTotalIlscoreFromJammer: getTotalIlscoreFromJammer,
};

function calculateIlscore(game, entrants) {
	let base = 25 * Math.log10(entrants + 1) ** 2
	let rating_percent = (game.score / 5.0)
	return Math.floor(base * rating_percent)
}

function getTotalIlscoreFromJammer(jammer) {
	let total_ilscore = 0
	for (let i = 0; i < jammer.game_list_sorted.length; i++) {
		total_ilscore += jammer.game_list_sorted[i].ilscore
	}
	return total_ilscore
}
