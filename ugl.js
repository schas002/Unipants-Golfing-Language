var handle, iter, stack, nested, cond, input, index, returns, temp, rindex,
	Strict = false,
	skipNewlines = function() {
		while (input[index] === '\n')
			index++;
	},
	registers = [],
	maxi = 1000,
	ACTIONS = Object.freeze({
		i: function() {skipNewlines()||input[index]?(function(s){stack.push(parseInt(s))&(index+=s.length)})(/^-?[0-9]+/.exec(input.slice(index))):stack.push(0)},
		I: function() {skipNewlines()||stack.push(input[index]?input.charCodeAt(index++):0)},
		o: function() {stack.length && (returns += stack.pop())},
		O: function() {stack.length && (returns += String.fromCharCode(stack.pop()))},
		c: function() {stack.push(0)},
		_: function() {stack.length && stack.pop()},
		u: function() {stack.length && stack[stack.length - 1]++},
		d: function() {stack.length && stack[stack.length - 1]--},
		'=': function() {stack.push(+(stack.pop() === stack.pop()))},
		'+': function() {stack.push(stack.length > 1 ? stack.pop()+stack.pop() : 0)},
		'-': function() {stack.push(stack.length > 1 ? -stack.pop()+stack.pop() : 0)},
		'*': function() {stack.push(stack.length > 1 ? stack.pop()*stack.pop() : 0)},
		'/': function() {stack.length > 1 ? (temp=[stack.pop(), stack.pop()]) && (temp[0] ? (stack.push(temp[1]%temp[0]) && stack.push(parseInt(temp[1]/temp[0]))): stack.push(0)) : stack.push(0)},
		'$': function() {stack.length && stack.push(stack[stack.length - 1])},
		'%': function() {stack.length > 1 && (temp=[stack.pop(),stack.pop()]) && stack.push(temp[0]) && stack.push(temp[1])},
		'@': function() {stack.length && (stack=[stack.pop()].concat(stack))},
		'^': function() {stack.length > 1 && (temp=[stack.pop(),stack.pop()]) && stack.push(temp[1]) && stack.push(temp[0]) && stack.push(temp[1])},
		r: function() {stack.push(registers[rindex]||0)},
		R: function() {registers[rindex]=(stack.pop()||0)},
		s: function() {rindex=(stack.pop()||0)}
	}),
	ACTION_KEYS = [],
	EXAMPLES = Object.freeze({
		'Select Example': '',
		Countdown: 'il$od:|10',
		N_Countdown:'il$l%$o%d:_d:|10',
		Factorial: 'il$d:_l*:_o|10',
		Cat: 'IlOI:|Hello, World!',
		Reverse: 'IlI:_lO:|Hello, World!',
		Print_in_binary: 'ilcuu/%u%:_ldo:|65536',
		Print_in_base: 'iRilr/%u%:_ldo:|3\n729',
		Fibonacci: 'ccui$Rl_$o%^+rd$R:|5',
		Fancy_Fibonacci: 'ccui$Rl_$ocuu$$*$**O%^+rd$R:|5',
		Ackermann: 'iiRuldr%l%lR$d%rd:u%d:%+uRu:ro|2\n5',
		Truth_Machine: 'i?l$o::c=?do:|1',
		Hello_World: '\
cuu$$$$$u$$@****O # H\n\
@+*$*$u$O         # e\n\
cuu$$**d+$$OO     # ll\n\
$uuu$$$$O         # o\n\
cuu$$$$****$      # create \' \'\n\
cuu$$u**+O        # ,\n\
$@O_              # \' \', add \' \' to end\n\
cuu$$$u***-O	  # W\n\
O                 # o\n\
uuuO              # r\n\
O                 # l\n\
O                 # d\n\
uO                # !\
|',
		Prime_Checker: '\
i$\n\
cu #6 1\n\
^d^-l #while not equal\n\ 
_ #6 1\n\
u #6 2\n\
^^/% #6 2 3 0\n\
cu%?%d%:_ #6 2 3 "true"\n\
?coc$d$$: #print false; return -1\n\
__ #else: 6 2\n\
^d^-:_ #while not equal\n\
u? #if stack.pop() != -1:\n\\n\
cuo: #print true|43'
	}),
	Type = Object.freeze({
		IF: 0,
		WHILE: 1
	})

function decode(string) {
	return decodeURIComponent(escape(atob(unescape(string).replace(/-/g, "+").replace(/_/g, "/"))));
}

function encode(string) {
	return btoa(unescape(encodeURIComponent(string))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function loadPermalink($code, $input) {
	var data = (window.location.href.split('?')[1] || '').split('&'),
		obj = {};
	for (var i = 0; i < data.length; i++) {
		var pair = data[i].split('=');
		obj[pair[0]] = pair[1];
	}
	$code.value = decode(obj.code || '');
	$input.value = decode(obj.input || '');
}

function getPermalink(code, input) {
	return window.location.href.split('?')[0] + '?code=' + encode(code) + '&input=' + encode(input);
}

for (let i in ACTIONS) 
	ACTIONS.hasOwnProperty(i) && ACTION_KEYS.push(i);

/*var alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
	operators = ['iIoOc_ud=+-/$%@^rRs'], //asterisk3 slash
	latest = operators[operators.length - 1];

function load(cc) {
	var href = {};
	document.location.href.split('?').slice(-1)[0].split('#')[0].split('&').map(s=>s.split('=')).forEach(function(_) {
		href[_[0]]=_[1];
	});
	href = {
		c: cc,
		v: 0
	}
	let code = href.c,
		decoded = '',
		decoder = operators[href.v],
		len = decoder.length;
	codehash = Array.from(code).reduce(function(p,c) {return p*62 + alphabet.indexOf(c)}, 0);
	decoded = decoder[codehash%len];
	codehash = ~~(codehash/len);
	while(codehash) {
		decoded = decoder[(codehash-1)%len] + decoded;
		codehash = ~~(codehash/len);
	}
	return {
		code: decoded
	};
}

function save(code) {
	let codehash = Array.from(code).reduce(function(p,c) {return p*latest.length + (latest.indexOf(c) + 1)}, 0) - 1,
		encoded = '';
	do {
		encoded = alphabet[codehash%62] + encoded;
		codehash = ~~(codehash/62);
	} while (codehash);
	return {
		c: encoded,
		v: operators.length - 1
	};
}*/

function ugl(code, finput) {
	if (!code || !code.length) return ['', 'Error: No code'];
	if (code && code.replace) code = code.replace(/#.+$|\s+/gm, '');
	var sanitized = code;
	if (finput !== true) {
		stack = [];
		registers = [];
		input = finput;
		returns = '';
		iter = 0;
		rindex = 0;
		index = 0;
		var tempcode = nest(code);
		if (!tempcode || !tempcode.length) return ['', 'Error: Open loop\n' + code + '\n' + ' '.repeat(tempcode) + '^'];
		else code = tempcode;
	}
	for(let instruction of code) {
		console.log('stack', stack);
		if (iter++ > maxi) return [sanitized, returns + '...\nError: Maximum iterations exceeded'];
		if (instruction.type !== undefined)
			switch (instruction.type) {
				case Type.IF:
					if (stack[stack.length - 1])
						ugl(instruction, true);
					break;
				case Type.WHILE:
					if (stack[stack.length - 1]) do {
						ugl(instruction, true);
						if (iter++ > maxi) return [sanitized, returns + '...\nError: Maximum iterations exceeded'];
					} while (stack[stack.length - 1]);
					break;
			}
		else if (ACTION_KEYS.includes(instruction))
			ACTIONS[instruction]();
		else if (!Strict)
			if (typeof sanitized === 'string')
				sanitized = sanitized.replace(new RegExp(instruction, 'g'), '');
		else
			return ['', 'Error: Invalid character: ' + instruction];
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
	if (difference > 0) return nests[difference - 1].index;
	else if (difference < 0) return ends[difference - 1];
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
			newcode[i] = [];
			newcode[i].len = len;
			while (len) {
				if (iter++ > maxi) return 0;
				let newchar = newcode.splice(i + 1, 1)[0];
				if (!newchar) break;
				newcode[i].push(newchar);
				len -= newchar.len ? newchar.len + 2 : 1;
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
			option.innerText = prop.replace(/_/g, ' ');
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
