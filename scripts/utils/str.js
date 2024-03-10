module.exports = {
	rmBetween: rmBetween,
	getBetween: getBetween,
	onlyNum: onlyNum,

	addToStrAt: addToStrAt,
	findPrev: findPrev,
};

function rmBetween(str, str_start, str_end) {
	let start = str.indexOf(str_start);
	let end = str.indexOf(str_end) + str_end.length;
	return str.slice(0, start) + str.slice(end, str.length);
}

function getBetween(str, str_start, str_end) {
	let start = str.indexOf(str_start);
	let end = str.indexOf(str_end, start + str_start.length) + str_end.length;
	return str.slice(start + str_start.length, end - str_end.length);
}

function onlyNum(s) {
	return s.replace(/\D/g, '');
}

function addToStrAt(str, add, at) {
	return str.substring(0, at) + add + str.substring(at);
}

function findPrev(str, find, cursor) {
	let found = false;
	let local_cursor = -1;
	while (true) {
		let next_cursor = str.indexOf(find, local_cursor + 1);

		if (next_cursor == -1 && !found) {
			return -1;
		}

		if (next_cursor == -1) {
			return local_cursor;
		}

		if (next_cursor > cursor && !found) {
			return -1;
		}

		if (next_cursor > cursor) {
			return local_cursor;
		}
		
		found = true;
		local_cursor = next_cursor;
	}
}
