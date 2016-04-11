var handle, iter, stack, nested, cond, input, index, returns, temp,
	maxi = 1000,
	ACTIONS = Object.freeze({
		i: ()=>stack.push(input[index]?parseInt(input[index++]):0),
		I: ()=>stack.push(input[index]?input.charCodeAt(index++):0),
		o: ()=>stack.length && (returns += stack.pop()),
		O: ()=>stack.length && (returns += String.fromCharCode(stack.pop())),
		c: ()=>stack.push(0),
		_: ()=>stack.length && stack.pop(),
		u: ()=>stack.length && stack[stack.length - 1]++,
		d: ()=>stack.length && stack[stack.length - 1]--,
		'+': ()=>stack.length > 1 && stack.push(stack.pop()+stack.pop()),
		'-': ()=>stack.length > 1 && stack.push(-stack.pop()+stack.pop()),
		'*': ()=>stack.length > 1 && stack.push(stack.pop()*stack.pop()),
		'/': ()=>stack.length > 1 && stack[stack.length - 1] && (temp=[stack.pop(), stack.pop()]) && stack.push(temp[1]%temp[0]) && stack.push(parseInt(temp[1]/temp[0])),
		'$': ()=>stack.length && (temp=stack.pop()) && stack.push(temp) && stack.push(temp),
		'%': ()=>stack.length > 1 && (temp=[stack.pop(),stack.pop()]) && stack.push(temp[0]) && stack.push(temp[1]),
		'@': ()=>stack.length && (stack=[stack.pop()].concat(stack)),
		'^': ()=>stack.length > 1 && (temp=[stack.pop(),stack.pop()]) && stack.push(temp[1]) && stack.push(temp[0]) && stack.push(temp[1])
	}),
	ACTION_KEYS = [],
	EXAMPLES = Object.freeze({
		'Select Example': '',
		Countdown: 'il$od:|1', //n_countdown:'ili$l%$o%d:_d:'
		Cat: 'IlOI:|Hello, World!',
		Reverse: 'IlI:_lO:|Hello, World!',
		Hello_World: `\
cuu$$$u$****$ # create H
O			 # H
cuuuuu$u*d+$O # e
cuu$$**d+$$OO # ll
$$uuu$$$$O	# o
cuu$$$$****$  # create ' '
cuu$$u**+O	# ,
$@O_		  # ' ', add ' ' to end
cuu$$$u***-O  # W
O			 # o
uuuO		  # r
O			 # l
cuu$$**-O	 # d
uO			# !
|`
	}),
	Type = Object.freeze({
		IF: 0,
		WHILE: 1
	})

for (let i in ACTIONS) 
	ACTIONS.hasOwnProperty(i) && ACTION_KEYS.push(i);

function ugl(code, finput) {
	if (!code || !code.length) return ['', 'Error: No code'];
	if (code && code.replace) code = code.replace(/\s*#.+$|\s+/gm, '');
	var sanitized = code;
	if (finput !== true) {
		stack = [];
		input = finput;
		returns = '';
		iter = 0;
		index = 0;
	}
	var tempcode = nest(code);
	if (!tempcode || !tempcode.length) return ['', 'Error: Open loop\n' + code + '\n' + ' '.repeat(tempcode) + '^'];
	else code = tempcode;
	for(let i = 0; i < code.length; i++) {
		if (iter++ > maxi) return ['', 'Error: Too many iterations'];
		if (code[i].type !== undefined)
			switch (code[i].type) {
				case Type.IF:
					if (stack[stack.length - 1])
						ugl(code[i], true);
					break;
				case Type.WHILE:
					var ncode = code[i];
					if (stack[stack.length - 1]) do {
						ugl(ncode, true);
						if (iter++ > maxi) return ['', 'Error: Too many iterations'];
					} while (stack[stack.length - 1]);
					break;
			}
		else if (ACTION_KEYS.includes(code[i]))
			ACTIONS[code[i]]();
		else return ['', 'Error: Invalid character: ' + code[i]]
	}
	return [sanitized, returns];
}

function nest(code) {
	var nests = [],
		ends = [],
		newcode = [],
		iter = 0;
	for (let i = 0; i < code.length; i++) {
		newcode.push(code[i]);
		switch (code[i]) {
			case '?':
				nests.push({type:Type.IF, index:i});
				break;
			case 'l':
				nests.push({type:Type.WHILE, index:i});
				break;
			case ':':
				ends.push(i);
				break;
		}
	}
	var difference = nests.length - ends.length;
	if (difference > 0) return nests[difference].index;
	else if (difference < 0) return ends[difference];
	while (ends.length) {
		let end = ends[0];
		for (let i = nests.length - 1; nests[i]; i--) {
			if (iter++ > maxi) return 0;
			let start = nests[i];
			if (start.index < end) {
				start.len = end - start.index - 1;
				newcode[start.index] = start;
				delete start.index;
				nests.splice(i,1);
				ends = ends.slice(1);
				break;
			}
		}
	}
	for (let i = newcode.length - 1; newcode[i]; i--) {
		if (iter++ > maxi) return 0;
		let item = newcode[i];
		if (item.len) {
			let len = item.len;
			newcode[i] = []
			while (len) {
				if (iter++ > maxi) return 0;
				let newchar = newcode.splice(i + 1, 1)[0];
				if (!newchar) break;
				newcode[i].push(newchar);
				len -= newchar.length || 1;
				newcode[i].type = item.type;
			}
			newcode.splice(i + 1, 1);
		}
	}
	return newcode;
}

function loadExamples($el) {
	for (prop in EXAMPLES) {
		if (EXAMPLES.hasOwnProperty(prop)) {
			let option = document.createElement('option');
			option.value = EXAMPLES[prop];
			option.innerText = prop.replace('_', ' ');
			$el.appendChild(option);
		}
	}
}

//from http://stackoverflow.com/questions/985272/selecting-text-in-an-element-akin-to-highlighting-with-your-mouse
function copy(text) {
	var range,
		selection;	
	if (text.select) {
		text.select();
		document.execCommand('copy');
	}
}