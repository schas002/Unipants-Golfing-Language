var stack, nested, cond, input, index, returns, temp,
	ACTIONS = Object.freeze({
		i: ()=>stack.push(parseInt(input[index++])),
		I: ()=>stack.push(input.charCodeAt(index++)),
		o: ()=>(temp=stack.pop()) && stack.push(temp) && returns += temp,
		O: ()=>(temp=stack.pop()) && stack.push(temp) && returns += String.fromCharCode(temp),
		c: ()=>stack.push(0),
		_: ()=>stack.pop(),
		u: ()=>stack.push(stack.pop()+1),
		d: ()=>stack.push(stack.pop()-1),
		'+': ()=>stack.push(stack.pop()+stack.pop()),
		'-': ()=>stack.push(-stack.pop()+stack.pop()),
		'*': ()=>stack.push(stack.pop()*stack.pop()),
		'/': ()=>(temp=[stack.pop(), stack.pop()]) && stack.push(temp[1]%temp[0]) && stack.push(parseInt(temp[1]/temp[0])),
		'$': ()=>(temp=stack.pop()) && stack.push(temp) && stack.push(temp),
		'%': ()=>(temp=[stack.pop(),stack.pop()]) && stack.push(temp[0]) && stack.push(temp[1]),
		'@': ()=>stack=[stack.pop()].concat(stack),
		'^': ()=>(temp=[stack.pop(),stack.pop()]) && stack.push(temp[1]) && stack.push(temp[0]) && stack.push(temp[1])
	})

//TODO: implement nesting

function ugl(code, finput, isNested) {
	if (!isNested) {
		stack = [];
		input = finput;
		returns = '';
	}
	index = 0;
	var fnested = '';
	for(let  i = 0; i < code.length; i++) {
		if (code[i].type) {
			fnested = nested;
			switch (code[i].type) {
				case 'if':  //?
					cond = stack.pop()
					stack.push(cond)
					if (cond)
						ugl(fnested, input, true);
					break;
				case 'while': //l
					do {
						ugl(fnested, input, true);
						cond = stack.pop()
						stack.push(cond)
					} while (cond);
					break;
			}
		}
		ACTIONS[code[i]]();
	}
	return returns;
}