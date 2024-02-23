const Str = require('../utils/str');

module.exports = {
	getIndented: getIndented,
};

function getIndented(html_str) {
	let result = rmNewLinesAndTabs(html_str);
	
	result = result.replaceAll('<', '< ');
	result = result.replaceAll('< /', '</');

	let cursor = 6;
	let tag_type = OPEN_TAG;
	let indent = 0;
	while (true) {
		let next_tag = nextTag(result, cursor);
		let next_next_tag = nextTag(result, next_tag.cursor_pos);
		
		if (next_tag.tag_type == END_OF_HTML) {
			break;
		}

		if (next_tag.tag_type == OPEN_TAG) {
			indent += 1;
			result = Str.addToStrAt(result, '\n' + strIndent(indent), next_tag.cursor_pos);
			next_tag.cursor_pos += indent + 1;

			let content_pos = result.indexOf('>', next_tag.cursor_pos) + 1;
			if (result.charAt(content_pos - 2) == '/') {
				indent -= 1;
			}

			if (next_next_tag.tag_type == OPEN_TAG) {
				if (result.charAt(content_pos) != '<') {
					result = Str.addToStrAt(result, '\n' + strIndent(indent+1), content_pos);
				}
			}
		} else {
			indent -= 1;
		}

		tag_type = next_tag.tag_type;
		cursor = next_tag.cursor_pos;
	}

	cursor = result.length - 8;
	tag_type = CLOSE_TAG;
	indent = 0;
	result = Str.addToStrAt(result, '\n', result.length - 7);
	while (true) {
		let prev_tag = prevTag(result, cursor);
		let prev_prev_tag = prevTag(result, prev_tag.cursor_pos);
		
		if (prev_tag.tag_type == END_OF_HTML) {
			break;
		}

		let content_pos = result.indexOf('>', prev_prev_tag.cursor_pos) + 1;

		if (prev_tag.tag_type == CLOSE_TAG) {
			indent += 1;

			if (result.charAt(content_pos-2) == '/') {
				result = Str.addToStrAt(result, '\n' + strIndent(indent), prev_tag.cursor_pos);
				indent += 1;
			}

			if (prev_prev_tag.tag_type == CLOSE_TAG) {
				result = Str.addToStrAt(result, '\n' + strIndent(indent), prev_tag.cursor_pos);
			}

			end_pos = result.indexOf('>', prev_tag.cursor_pos) + 1;
			if (result.charAt(end_pos) != '\n') {
				result = Str.addToStrAt(result, '\n' + strIndent(indent), end_pos);
			}
		} else {
			if (result.charAt(content_pos-2) == '/') {
				indent += 1;
			}
			indent -= 1;
		}

		tag_type = prev_tag.tag_type;
		cursor = prev_tag.cursor_pos;
	}

	result = result.replaceAll('< ', '<');
	return result;
}


function rmNewLinesAndTabs(html_str) {
	let s = html_str.replaceAll('\t', '');
	s = s.replaceAll('\n', '');
	return s;
}

OPEN_TAG = 0;
CLOSE_TAG = 1;
END_OF_HTML = 2;

function nextTag(html_str, cursor) {
	let open_tag_pos = html_str.indexOf('< ', cursor + 1);
	let close_tag_pos = html_str.indexOf('</', cursor + 1);

	if (open_tag_pos == -1 && close_tag_pos == -1) {
		return {
			tag_type: END_OF_HTML, 
			cursor_pos: -1,
		};
	}

	if (open_tag_pos == -1) {
		return {
			tag_type: CLOSE_TAG, 
			cursor_pos: close_tag_pos,
		};
	}

	if (close_tag_pos == -1) {
		return {
			tag_type: OPEN_TAG, 
			cursor_pos: open_tag_pos,
		};
	}

	if (open_tag_pos > close_tag_pos) {
		return {
			tag_type: CLOSE_TAG, 
			cursor_pos: close_tag_pos,
		};
	}

	return {
		tag_type: OPEN_TAG, 
		cursor_pos: open_tag_pos,
	};
}
	
function prevTag(html_str, cursor) {
	let open_tag_pos = Str.findPrev(html_str, '< ', cursor - 1);
	let close_tag_pos = Str.findPrev(html_str, '</', cursor - 1);

	if (open_tag_pos == -1 && close_tag_pos == -1) {
		return {
			tag_type: END_OF_HTML, 
			cursor_pos: -1,
		};
	}

	if (open_tag_pos == -1) {
		return {
			tag_type: CLOSE_TAG, 
			cursor_pos: close_tag_pos,
		};
	}

	if (close_tag_pos == -1) {
		return {
			tag_type: OPEN_TAG, 
			cursor_pos: open_tag_pos,
		};
	}

	if (open_tag_pos < close_tag_pos) {
		return {
			tag_type: CLOSE_TAG, 
			cursor_pos: close_tag_pos,
		};
	}

	return {
		tag_type: OPEN_TAG, 
		cursor_pos: open_tag_pos,
	}
}
		
function strIndent(n) {
	let s = '';
	for (let i = 0; i < n; i++) {
		s = s + '\t';
	}
	return s;
}
