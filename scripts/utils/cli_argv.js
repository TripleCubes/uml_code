module.exports = {
	getArgvList: getArgvList,
	getArgv: getArgv,
};

function getArgvList(process_argv, type_list, js_file_name) {
	let argv_list = _getArgvList(process_argv, js_file_name);
	let argv_list_valid_result = allArgvValid(argv_list, type_list, js_file_name);
	if (!argv_list_valid_result.result) {
		console.log(argv_list_valid_result.err_mess);
		process.exit();
	}
	return argv_list;
}

function getArgv(argv_list, argv, deft) {
	for (let i = 0; i < argv_list.length; i++) {
		if (argv_list[i].argv == argv) {
			return argv_list[i].value;
		}
	}
	return deft;
}


function _getArgvList(process_argv, js_file_name) {
	let result_list = [];

	let argv_str_list = getArgvStrList(process_argv);
	if (argv_str_list.length == 0) {
		return [];
	}

	for (let i = 0; i < argv_str_list.length; i++) {
		let argv_str = argv_str_list[i];

		let equal_sign_pos = argv_str.indexOf('=');
		if (equal_sign_pos == -1) {
			printParseErrorMessage(js_file_name);
			process.exit();
		}

		let argv_name = argv_str.substring(0, equal_sign_pos);
		if (argv_name == '') {
			printParseErrorMessage(js_file_name);
			process.exit();
		}

		let argv_value = argv_str.substring(equal_sign_pos + 1);
		if (argv_value == '') {
			printParseErrorMessage(js_file_name);
			process.exit();
		}

		if (argv_value == 'true') {
			argv_value = true;
		} else if (argv_value == 'false') {
			argv_value = false;
		} else if (isNum(argv_value)) {
			argv_value = parseFloat(argv_value);
		} else {
			argv_value = argv_value.replaceAll('"', '');
		}

		result_list.push({
			argv: argv_name,
			value: argv_value,
		});
	}

	return result_list;
}

function allArgvValid(argv_list, type_list, js_file_name) {
	for (let i = 0; i < argv_list.length; i++) {
		let argv = argv_list[i];
		let index = findArgvInList(type_list, argv);
		if (index == -1) {
			let err_mess = 'invalid argument: ' + argv.argv;
			err_mess += '\n`node ' + js_file_name + ' ?` to see available agruments';
			return {
				result: false,
				err_mess: err_mess,
			};
		}
		if (typeof(argv.value) != type_list[index].type) {
			let err_mess = 'argument [' + argv.argv + '] only accept ' + type_list[index].type;
			err_mess += ', the passed in value has type: ' + typeof(argv.value);
			err_mess += '\n`node ' + js_file_name + ' ?` to see available agruments';
			return {
				result: false,
				err_mess: err_mess
			};
		}
	}
	return {
		result: true,
		err_mess: '',
	};
}

function findArgvInList(list, v) {
	for (let i = 0; i < list.length; i++) {
		if (list[i].argv == v.argv) {
			return i;
		}
	}
	return -1;
}

function getArgvStrList(process_argv) {
	if (process_argv.length <= 2) {
		return [];
	}

	let list = [];
	for (let i = 2; i < process_argv.length; i++) {
		list.push(process_argv[i]);
	}
	return list;
}

function printParseErrorMessage(js_file_name) {
	console.log('invalid commandline agrument syntax. `node ' + js_file_name + ' ?` to see the syntax');
}

function isNum(str) {
	return !isNaN(str);
}
