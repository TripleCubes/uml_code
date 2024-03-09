module.exports = {
	isInList: isInList,
	findInList: findInList,
};

function isInList(list, v) {
	for (let i = 0; i < list.length; i++) {
		if (list[i] == v) {
			return true;
		}
	}
	return false;
}

function findInList(list, v) {
	for (let i = 0; i < list.length; i++) {
		if (list[i] == v) {
			return i;
		}
	}
	return -1;
}
