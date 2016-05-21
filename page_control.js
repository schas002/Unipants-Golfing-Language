// minxomat's wonderful getURIParameter function
// http://www.minxomat.space/taking-request-parameters-on-an-html-file
function getURIParameter(name) {
	return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null;
}

function decode(string) {
	return decodeURIComponent(escape(atob(unescape(string).replace(/-/g, "+").replace(/_/g, "/"))));
}

function encode(string) {
	return btoa(unescape(encodeURIComponent(string))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
cTemp = getURIParameter("code");
if (cTemp !== null) document.getElementById("code").innerHTML = decode(cTemp);
iTemp = getURIParameter("input");
if (iTemp !== null) document.getElementById("input").innerHTML = decode(iTemp);

function create_permalink() {
	plink = "http://schas002.github.io/Unipants-Golfing-Language/?code=" + encode(document.getElementById("code").innerText) + "&input=" + encode(document.getElementById("input").innerText);
	document.getElementById("permalink").innerHTML = plink;
}

function loadExamples($el) {
	for (prop in EXAMPLES) {
		if (!EXAMPLES.hasOwnProperty(prop)) {
			continue;
		}
		var option = document.createElement('option');
		option.value = EXAMPLES[prop];
		option.innerText = prop.replace(/_/g, ' ');
		$el.appendChild(option);
	}
}

//from http://stackoverflow.com/q/985272
function copy(text) {
	var range;
	var selection;
	if (text.select) {
		text.select();
		document.execCommand('copy');
	}
}
function openOptionsPanel(event){
	if (event.target.value){
		var parts = event.target.value.split('|');
		var code = document.getElementById('code');
		code.innerHTML  = parts[0];
		adjustByteCount();
		var input = document.getElementById('input');
		input.innerHTML = parts[1];
		adjustInputByteCount();
	}
}
var addedBrTag = false;
function adjustByteCount(){
	var event = document.getElementById('code');
	if (!addedBrTag && event.innerHTML.includes("<br>")){
		addedBrTag = true;
	}
	document.getElementById('bytecount').innerHTML = event.innerText.length - (addedBrTag ? 1 : 0);
}
function adjustInputByteCount(){
	var event = document.getElementById('input');
	if (!addedBrTag && event.innerHTML.includes("<br>")){
		addedBrTag = true;
	}
	document.getElementById('input_bytecount').innerHTML = event.innerText.length - (addedBrTag ? 1 : 0);
}
function adjustStrictMode(event){
	localStorage.setItem('strict', event.target.checked);
	Strict = event.target.checked;
}
function adjustRangeControls(event){
	maxi = event.target.value;
	document.getElementById('maxi_num').value = maxi;
	document.getElementById('maxi_range').value = maxi;
}
function runCode(){
	var output = document.getElementById('output');
	var sanitized = document.getElementById('sanitized');
	var code = document.getElementById('code');
	var input = document.getElementById('input');
	var byteCount = document.getElementById('sanitized_bytecount');
	var codeExecutionValues = ugl(code.innerText, input.innerText);
	sanitized.innerHTML = codeExecutionValues[0];
	output.innerHTML = codeExecutionValues[1];
	byteCount.innerHTML = sanitized.innerText.length;
}
window.onload = function(){
	loadExamples(document.getElementById('examples'));
	document.getElementById('strict_mode').checked = localStorage.getItem('strict');
	document.getElementById('examples').addEventListener('change', openOptionsPanel);
	document.getElementById('run').addEventListener('click', runCode);
	document.getElementById('code').addEventListener('input', adjustByteCount);
	document.getElementById('input').addEventListener('input', adjustInputByteCount);
	document.getElementById('strict_mode').addEventListener('change', adjustStrictMode);
	document.getElementById('maxi_range').addEventListener('input', adjustRangeControls);
	document.getElementById('maxi_num').addEventListener('input', adjustRangeControls);
	document.getElementById('permalink').addEventListener('click', create_permalink);
	if (cTemp !== null) document.getElementById("code").innerHTML = decode(cTemp);
	if (iTemp !== null) document.getElementById("input").innerHTML = decode(iTemp);
};
