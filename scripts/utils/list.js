module.exports = {
	isInList: isInList,
};

function isInList(list, v) {
	for (let i = 0; i < list.length; i++) {
		if (list[i] == v) {
			return true;
		}
	}
	return false;
}
