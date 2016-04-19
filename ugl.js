var handle, iter, stack, nested, cond, input, index, returns, temp, rindex,
	registers = [],
	maxi = 1000,
	ACTIONS = Object.freeze({
		i: ()=>input[index]?(s=>stack.push(parseInt(s))&(index+=s.length))(/^[0-9]+/.exec(input.slice(index))):stack.push(0),
		I: ()=>stack.push(input[index]?input.charCodeAt(index++):0),
		o: ()=>stack.length && (returns += stack.pop()),
		O: ()=>stack.length && (returns += String.fromCharCode(stack.pop())),
		c: ()=>stack.push(0),
		_: ()=>stack.length && stack.pop(),
		u: ()=>stack.length && stack[stack.length - 1]++,
		d: ()=>stack.length && stack[stack.length - 1]--,
		'=': ()=>stack.push((stack.pop() == stack.pop())+0),
		'+': ()=>stack.push(stack.length > 1 ? stack.pop()+stack.pop() : 0),
		'-': ()=>stack.push(stack.length > 1 ? -stack.pop()+stack.pop() : 0),
		'*': ()=>stack.push(stack.length > 1 ? stack.pop()*stack.pop() : 0),
		'/': ()=>stack.length > 1 ? (temp=[stack.pop(), stack.pop()]) && (temp[0] ? (stack.push(temp[1]%temp[0]) && stack.push(parseInt(temp[1]/temp[0]))): stack.push(0)) : stack.push(0),
		'$': ()=>stack.length && stack.push(stack[stack.length - 1]),
		'%': ()=>stack.length > 1 && (temp=[stack.pop(),stack.pop()]) && stack.push(temp[0]) && stack.push(temp[1]),
		'@': ()=>stack.length && (stack=[stack.pop()].concat(stack)),
		'^': ()=>stack.length > 1 && (temp=[stack.pop(),stack.pop()]) && stack.push(temp[1]) && stack.push(temp[0]) && stack.push(temp[1]),
		r: ()=>stack.push(registers[rindex]||0),
		R: ()=>registers[rindex]=(stack.pop()||0),
		s: ()=>rindex=(stack.pop()||0)
	}),
	ACTION_KEYS = [],
	EXAMPLES = Object.freeze({
		'Select Example': '',
		Countdown: 'il$od:|10',
		N_Countdown:'il$l%$o%d:_d:|10',
		Factorial: 'il$d:_l*:_o|10',
		Cat: 'IlOI:|Hello, World!',
		Reverse: 'IlI:_lO:|Hello, World!',
		Hello_World: `\
cuu$$$$$u$$@****O # H
@+*$*$u$O         # e
cuu$$**d+$$OO     # ll
$uuu$$$$O         # o
cuu$$$$****$      # create ' '
cuu$$u**+O        # ,
$@O_              # ' ', add ' ' to end
cuu$$$u***-O      # W
O                 # o
uuuO              # r
O                 # l
O                 # d
uO                # !\
|`,
		Prime_Checker: `\
i$ 
cu #6 1 
^d^-l #while not equal 
_ #6 1 
u #6 2 
^^/% #6 2 3 0 
cu%?%d%:_ #6 2 3 "true" 
?coc$d$$: #print false; return -1 
__ #else: 6 2 
^d^-:_ #while not equal 
u? #if stack.pop() != -1: 
cuo: #print true|43`
	}),
	Type = Object.freeze({
		IF: 0,
		WHILE: 1
	})

for (let i in ACTIONS) 
	ACTIONS.hasOwnProperty(i) && ACTION_KEYS.push(i);

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
		if (iter++ > maxi) return ['', 'Error: Maximum iterations exceeded'];
		if (instruction.type !== undefined)
			switch (instruction.type) {
				case Type.IF:
					if (stack[stack.length - 1])
						ugl(instruction, true);
					break;
				case Type.WHILE:
					if (stack[stack.length - 1]) do {
						ugl(instruction, true);
						if (iter++ > maxi) return ['', 'Error: Maximum iterations exceeded'];
					} while (stack[stack.length - 1]);
					break;
			}
		else if (ACTION_KEYS.includes(instruction))
			ACTIONS[instruction]();
		else return ['', 'Error: Invalid character: ' + instruction]
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
				len -= newchar instanceof Array ? newchar.length + 2 : 1;
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
