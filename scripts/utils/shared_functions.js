module.exports = {
	intToStrFixedWidth: intToStrFixedWidth,
	getJamName: getJamName,
	getJammerShortLink: getJammerShortLink,
	msecToStr: msecToStr,
}

function intToStrFixedWidth(num) {
	return ('000000' + num).slice(-4);
};

function getJamName(jam_name, jam_id, jam_type, short_name = false) {
	if (jam_type == 'major_jam') {
		let colon_pos = jam_name.indexOf(':');
		if (colon_pos != -1) {
			jam_name = jam_name.slice(colon_pos + 2, jam_name.length);
		}
	}

	if (short_name) {
		return (jam_type == 'major_jam' ? 'MJ+ ' : 'MJ ') + jam_id + ': ' + jam_name;
	}
	return (jam_type == 'major_jam' ? 'Major Jam ' : 'Mini Jam ') + jam_id + ': ' + jam_name;
}

function getJammerShortLink(link) {
	link = link.replaceAll('https://', '');
	if (link[link.length - 1] == '/') {
		link = link.slice(0, link.length - 1);
	}
	return link;
}

function msecToStr(t_msec) {
	let t_sec = Math.floor(t_msec / (1000));
	let t_sec_remains = t_sec % 60;

	let t_min = Math.floor(t_msec / (1000*60));
	let t_min_remains = t_min % 60;

	let t_hour = Math.floor(t_msec / (1000*60*60));
	let t_day = Math.floor(t_hour / 24);
	let t_hour_remains = t_hour % 24;

	let day_str = '';
	if (t_day != 0) {
		day_str = t_day + 'd ';
	}

	let hour_str = '';
	if (t_day != 0 || t_hour_remains != 0) {
		hour_str = t_hour_remains + 'h ';
	}

	let min_str = '';
	if (t_day == 0 && t_min_remains != 0) {
		min_str = t_min_remains + 'm ';
	}

	let sec_str = '';
	if (t_day == 0 && t_hour == 0) {
		sec_str = t_sec_remains + 's ';
	}

	return day_str + hour_str + min_str + sec_str;
}
