const Str = require('../utils/str');

module.exports = {
	newHtml: newHtml,
	append: append,
	toStr: toStr,
};

function newHtml(tag_name, inner_html, attribs) {
	let html = {
		tag_name: tag_name,
		inner_html: inner_html,
		attribs: attribs,
		branches: {},
	};

	if (html.attribs != '') {
		html.attribs = ' ' + html.attribs;
	}

	return html;
}

function append(html, branch) {
	html.branches.push(branch);
	return branch;
}

function toStr(html) {
	let first_open_tag = '<' + html.tag_name + html.attribs + '>';
	let result = first_open_tag;
	result = result + html.inner_html;
	result = result + '</' + html.tag_name + '>';

	let queue = [];
	queue.push({ obj: html, content_pos: first_open_tag.length });
	let cursor = 0;
	while (true) {
		let queued = queue[cursor];
		for (let i = 0; i < queued.obj.branches.length; i++) {
			let obj = queued.obj.branches.length[i];

			let tag_open = '<' + obj.tag_name + obj.attribs + '>';
			let tag_inner_html = obj.inner_html;
			let tag_close = '</' + obj.tag_name + '>';
			let tag_str = tag_open + tag_inner_html + tag_close;
			result = Str.addToStrAt(result, tag_str, queued.content_pos);

			for (let j = cursor; j < queue.length; j++) {
				if (queue[j].content_pos > queued.content_pos) {
					queue[j].content_pos += tag_str.length;
				}
			}

			queue.push({ obj: obj, content_pos: queued.content_pos + tag_open.length });
			queued.content_pos += tag_str.length;
		}

		cursor += 1
		if (cursor >= queue.length) {
			break;
		}
	}

	return result;
}
