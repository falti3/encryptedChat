/*
 * Calculates hex from decimal, and returns it
 * 
 * dec: int
 */
function decimalToHex(dec) {
	"use strict"
	var temp = dec;
	var quotient = -1;
	var remainder = -1;
	var hex = []
	while (quotient != 0) {
		quotient = Math.floor(temp / 16);
		remainder = temp % 16;
		switch (remainder) {
			case 10: 
			hex.push("A");
			break;
		case 11: 
			hex.push("B");
			break;
		case 12: 
			hex.push("C");
			break;
		case 13: 
			hex.push("D");
			break;
		case 14: 
			hex.push("E");
			break;
		case 15: 
			hex.push("F");
			break;
		default:
			hex.push(remainder);
			break;
		}
		temp = quotient;
	}
	var toReturn = "";
	for (var i=hex.length-1; i>=0; i--) {
		toReturn += hex[i];
	}
	return toReturn;
}
	
/*
 * creates random int to 255 and returns it
 */
function generateRandomNumberTo255() {
	"use strict";
	return Math.floor((Math.random()*256 +255) /2)
}

/*
 * Creats random color, returns as string
 */
function generateRandomColor() {
	"use strict";
	var threshold = 10;
	var r = generateRandomNumberTo255();
	var g = r;
	var b = r;
	while (Math.abs(g-r) <= threshold) {
		g = generateRandomNumberTo255();
	}
	while (Math.abs(b-r) <= threshold || Math.abs(g-b) <= threshold) {
		b = generateRandomNumberTo255();
	}
	return "#"+decimalToHex(r)+decimalToHex(g)+decimalToHex(b);
}

/*
 * Makes ArrayBuffer to String and returns it
 * 
 * buffer: Buffer
 */
function arrayBufferToString(buffer) {
	"use strict";
	if (buffer == null) {
		return "";
	}
	if (typeof buffer == "string") {
		return buffer;
	}
	return String.fromCharCode.apply(null, new Uint8Array(buffer));
}

/*
 * Transforms string to ArrayBuffer and returns it
 * 
 * string: string
 */
function stringToArrayBuffer(string) {
	"use strict";
	if (string == null || !(typeof string == "string" || string instanceof ArrayBuffer)) {
		return new ArrayBuffer(0);
	}
	if (typeof string == "string" && string.indexOf("FromArrayBuffer_") == 0) {
		string = string.substring(16);
	}
	if (string instanceof ArrayBuffer) {
		return string;
	}
	var buf = new ArrayBuffer(string.length);
	var bufView = new Uint8Array(buf);
	for (var i = 0, strLen = string.length; i < strLen; i++) {
		bufView[i] = string.charCodeAt(i);
	}
	return buf;
}

/*
 * returns buffer from data (as string or json object)
 * 
 * data: string or json-Object
 */
function toBuffer(data) {
	"use strict";
	var dataBuffer = null;
	if (typeof data == "string") {
		dataBuffer = stringToArrayBuffer(data);
	} else if (data instanceof ArrayBuffer || data instanceof Uint8Array) {
		dataBuffer = data;
	} else if (typeof data == "object") {
		dataBuffer = stringToArrayBuffer(JSON.stringify(data));
	} 
    return dataBuffer;
}