import * as _syscalls2_0 from "spacetime:sys@2.0";
import { moduleHooks } from "spacetime:sys@2.0";

//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/node_modules/headers-polyfill/lib/index.mjs
var __create$1 = Object.create;
var __defProp$1 = Object.defineProperty;
var __getOwnPropDesc$1 = Object.getOwnPropertyDescriptor;
var __getOwnPropNames$1 = Object.getOwnPropertyNames;
var __getProtoOf$1 = Object.getPrototypeOf;
var __hasOwnProp$1 = Object.prototype.hasOwnProperty;
var __commonJS$1 = (cb, mod) => function __require() {
	return mod || (0, cb[__getOwnPropNames$1(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps$1 = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") {
		for (let key of __getOwnPropNames$1(from)) if (!__hasOwnProp$1.call(to, key) && key !== except) __defProp$1(to, key, {
			get: () => from[key],
			enumerable: !(desc = __getOwnPropDesc$1(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM$1 = (mod, isNodeMode, target) => (target = mod != null ? __create$1(__getProtoOf$1(mod)) : {}, __copyProps$1(isNodeMode || !mod || !mod.__esModule ? __defProp$1(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
var import_set_cookie_parser = __toESM$1(__commonJS$1({ "node_modules/set-cookie-parser/lib/set-cookie.js"(exports, module) {
	"use strict";
	var defaultParseOptions = {
		decodeValues: true,
		map: false,
		silent: false
	};
	function isNonEmptyString(str) {
		return typeof str === "string" && !!str.trim();
	}
	function parseString(setCookieValue, options) {
		var parts = setCookieValue.split(";").filter(isNonEmptyString);
		var parsed = parseNameValuePair(parts.shift());
		var name = parsed.name;
		var value = parsed.value;
		options = options ? Object.assign({}, defaultParseOptions, options) : defaultParseOptions;
		try {
			value = options.decodeValues ? decodeURIComponent(value) : value;
		} catch (e) {
			console.error("set-cookie-parser encountered an error while decoding a cookie with value '" + value + "'. Set options.decodeValues to false to disable this feature.", e);
		}
		var cookie = {
			name,
			value
		};
		parts.forEach(function(part) {
			var sides = part.split("=");
			var key = sides.shift().trimLeft().toLowerCase();
			var value2 = sides.join("=");
			if (key === "expires") cookie.expires = new Date(value2);
			else if (key === "max-age") cookie.maxAge = parseInt(value2, 10);
			else if (key === "secure") cookie.secure = true;
			else if (key === "httponly") cookie.httpOnly = true;
			else if (key === "samesite") cookie.sameSite = value2;
			else cookie[key] = value2;
		});
		return cookie;
	}
	function parseNameValuePair(nameValuePairStr) {
		var name = "";
		var value = "";
		var nameValueArr = nameValuePairStr.split("=");
		if (nameValueArr.length > 1) {
			name = nameValueArr.shift();
			value = nameValueArr.join("=");
		} else value = nameValuePairStr;
		return {
			name,
			value
		};
	}
	function parse(input, options) {
		options = options ? Object.assign({}, defaultParseOptions, options) : defaultParseOptions;
		if (!input) if (!options.map) return [];
		else return {};
		if (input.headers) if (typeof input.headers.getSetCookie === "function") input = input.headers.getSetCookie();
		else if (input.headers["set-cookie"]) input = input.headers["set-cookie"];
		else {
			var sch = input.headers[Object.keys(input.headers).find(function(key) {
				return key.toLowerCase() === "set-cookie";
			})];
			if (!sch && input.headers.cookie && !options.silent) console.warn("Warning: set-cookie-parser appears to have been called on a request object. It is designed to parse Set-Cookie headers from responses, not Cookie headers from requests. Set the option {silent: true} to suppress this warning.");
			input = sch;
		}
		if (!Array.isArray(input)) input = [input];
		options = options ? Object.assign({}, defaultParseOptions, options) : defaultParseOptions;
		if (!options.map) return input.filter(isNonEmptyString).map(function(str) {
			return parseString(str, options);
		});
		else return input.filter(isNonEmptyString).reduce(function(cookies2, str) {
			var cookie = parseString(str, options);
			cookies2[cookie.name] = cookie;
			return cookies2;
		}, {});
	}
	function splitCookiesString2(cookiesString) {
		if (Array.isArray(cookiesString)) return cookiesString;
		if (typeof cookiesString !== "string") return [];
		var cookiesStrings = [];
		var pos = 0;
		var start;
		var ch;
		var lastComma;
		var nextStart;
		var cookiesSeparatorFound;
		function skipWhitespace() {
			while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) pos += 1;
			return pos < cookiesString.length;
		}
		function notSpecialChar() {
			ch = cookiesString.charAt(pos);
			return ch !== "=" && ch !== ";" && ch !== ",";
		}
		while (pos < cookiesString.length) {
			start = pos;
			cookiesSeparatorFound = false;
			while (skipWhitespace()) {
				ch = cookiesString.charAt(pos);
				if (ch === ",") {
					lastComma = pos;
					pos += 1;
					skipWhitespace();
					nextStart = pos;
					while (pos < cookiesString.length && notSpecialChar()) pos += 1;
					if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
						cookiesSeparatorFound = true;
						pos = nextStart;
						cookiesStrings.push(cookiesString.substring(start, lastComma));
						start = pos;
					} else pos = lastComma + 1;
				} else pos += 1;
			}
			if (!cookiesSeparatorFound || pos >= cookiesString.length) cookiesStrings.push(cookiesString.substring(start, cookiesString.length));
		}
		return cookiesStrings;
	}
	module.exports = parse;
	module.exports.parse = parse;
	module.exports.parseString = parseString;
	module.exports.splitCookiesString = splitCookiesString2;
} })());
var HEADERS_INVALID_CHARACTERS = /[^a-z0-9\-#$%&'*+.^_`|~]/i;
function normalizeHeaderName(name) {
	if (HEADERS_INVALID_CHARACTERS.test(name) || name.trim() === "") throw new TypeError("Invalid character in header field name");
	return name.trim().toLowerCase();
}
var charCodesToRemove = [
	String.fromCharCode(10),
	String.fromCharCode(13),
	String.fromCharCode(9),
	String.fromCharCode(32)
];
var HEADER_VALUE_REMOVE_REGEXP = new RegExp(`(^[${charCodesToRemove.join("")}]|$[${charCodesToRemove.join("")}])`, "g");
function normalizeHeaderValue(value) {
	return value.replace(HEADER_VALUE_REMOVE_REGEXP, "");
}
function isValidHeaderName(value) {
	if (typeof value !== "string") return false;
	if (value.length === 0) return false;
	for (let i = 0; i < value.length; i++) {
		const character = value.charCodeAt(i);
		if (character > 127 || !isToken(character)) return false;
	}
	return true;
}
function isToken(value) {
	return ![
		127,
		32,
		"(",
		")",
		"<",
		">",
		"@",
		",",
		";",
		":",
		"\\",
		"\"",
		"/",
		"[",
		"]",
		"?",
		"=",
		"{",
		"}"
	].includes(value);
}
function isValidHeaderValue(value) {
	if (typeof value !== "string") return false;
	if (value.trim() !== value) return false;
	for (let i = 0; i < value.length; i++) {
		const character = value.charCodeAt(i);
		if (character === 0 || character === 10 || character === 13) return false;
	}
	return true;
}
var NORMALIZED_HEADERS = Symbol("normalizedHeaders");
var RAW_HEADER_NAMES = Symbol("rawHeaderNames");
var HEADER_VALUE_DELIMITER = ", ";
var _a, _b, _c;
var Headers = class _Headers {
	constructor(init) {
		this[_a] = {};
		this[_b] = /* @__PURE__ */ new Map();
		this[_c] = "Headers";
		if (["Headers", "HeadersPolyfill"].includes(init?.constructor.name) || init instanceof _Headers || typeof globalThis.Headers !== "undefined" && init instanceof globalThis.Headers) init.forEach((value, name) => {
			this.append(name, value);
		}, this);
		else if (Array.isArray(init)) init.forEach(([name, value]) => {
			this.append(name, Array.isArray(value) ? value.join(HEADER_VALUE_DELIMITER) : value);
		});
		else if (init) Object.getOwnPropertyNames(init).forEach((name) => {
			const value = init[name];
			this.append(name, Array.isArray(value) ? value.join(HEADER_VALUE_DELIMITER) : value);
		});
	}
	[(_a = NORMALIZED_HEADERS, _b = RAW_HEADER_NAMES, _c = Symbol.toStringTag, Symbol.iterator)]() {
		return this.entries();
	}
	*keys() {
		for (const [name] of this.entries()) yield name;
	}
	*values() {
		for (const [, value] of this.entries()) yield value;
	}
	*entries() {
		let sortedKeys = Object.keys(this[NORMALIZED_HEADERS]).sort((a, b) => a.localeCompare(b));
		for (const name of sortedKeys) if (name === "set-cookie") for (const value of this.getSetCookie()) yield [name, value];
		else yield [name, this.get(name)];
	}
	/**
	* Returns a boolean stating whether a `Headers` object contains a certain header.
	*/
	has(name) {
		if (!isValidHeaderName(name)) throw new TypeError(`Invalid header name "${name}"`);
		return this[NORMALIZED_HEADERS].hasOwnProperty(normalizeHeaderName(name));
	}
	/**
	* Returns a `ByteString` sequence of all the values of a header with a given name.
	*/
	get(name) {
		if (!isValidHeaderName(name)) throw TypeError(`Invalid header name "${name}"`);
		return this[NORMALIZED_HEADERS][normalizeHeaderName(name)] ?? null;
	}
	/**
	* Sets a new value for an existing header inside a `Headers` object, or adds the header if it does not already exist.
	*/
	set(name, value) {
		if (!isValidHeaderName(name) || !isValidHeaderValue(value)) return;
		const normalizedName = normalizeHeaderName(name);
		const normalizedValue = normalizeHeaderValue(value);
		this[NORMALIZED_HEADERS][normalizedName] = normalizeHeaderValue(normalizedValue);
		this[RAW_HEADER_NAMES].set(normalizedName, name);
	}
	/**
	* Appends a new value onto an existing header inside a `Headers` object, or adds the header if it does not already exist.
	*/
	append(name, value) {
		if (!isValidHeaderName(name) || !isValidHeaderValue(value)) return;
		const normalizedName = normalizeHeaderName(name);
		const normalizedValue = normalizeHeaderValue(value);
		let resolvedValue = this.has(normalizedName) ? `${this.get(normalizedName)}, ${normalizedValue}` : normalizedValue;
		this.set(name, resolvedValue);
	}
	/**
	* Deletes a header from the `Headers` object.
	*/
	delete(name) {
		if (!isValidHeaderName(name)) return;
		if (!this.has(name)) return;
		const normalizedName = normalizeHeaderName(name);
		delete this[NORMALIZED_HEADERS][normalizedName];
		this[RAW_HEADER_NAMES].delete(normalizedName);
	}
	/**
	* Traverses the `Headers` object,
	* calling the given callback for each header.
	*/
	forEach(callback, thisArg) {
		for (const [name, value] of this.entries()) callback.call(thisArg, value, name, this);
	}
	/**
	* Returns an array containing the values
	* of all Set-Cookie headers associated
	* with a response
	*/
	getSetCookie() {
		const setCookieHeader = this.get("set-cookie");
		if (setCookieHeader === null) return [];
		if (setCookieHeader === "") return [""];
		return (0, import_set_cookie_parser.splitCookiesString)(setCookieHeader);
	}
};
function headersToList(headers) {
	const headersList = [];
	headers.forEach((value, name) => {
		const resolvedValue = value.includes(",") ? value.split(",").map((value2) => value2.trim()) : value;
		headersList.push([name, resolvedValue]);
	});
	return headersList;
}

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/node_modules/spacetimedb/dist/server/index.mjs
typeof globalThis !== "undefined" && (globalThis.global = globalThis.global || globalThis, globalThis.window = globalThis.window || globalThis);
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
	return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
	return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
};
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") {
		for (let key of __getOwnPropNames(from)) if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: () => from[key],
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(__defProp(target, "default", {
	value: mod,
	enumerable: true
}), mod));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var require_base64_js = __commonJS({ "../../node_modules/.pnpm/base64-js@1.5.1/node_modules/base64-js/index.js"(exports) {
	exports.byteLength = byteLength;
	exports.toByteArray = toByteArray;
	exports.fromByteArray = fromByteArray2;
	var lookup = [];
	var revLookup = [];
	var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
	var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	for (i = 0, len = code.length; i < len; ++i) {
		lookup[i] = code[i];
		revLookup[code.charCodeAt(i)] = i;
	}
	var i;
	var len;
	revLookup["-".charCodeAt(0)] = 62;
	revLookup["_".charCodeAt(0)] = 63;
	function getLens(b64) {
		var len2 = b64.length;
		if (len2 % 4 > 0) throw new Error("Invalid string. Length must be a multiple of 4");
		var validLen = b64.indexOf("=");
		if (validLen === -1) validLen = len2;
		var placeHoldersLen = validLen === len2 ? 0 : 4 - validLen % 4;
		return [validLen, placeHoldersLen];
	}
	function byteLength(b64) {
		var lens = getLens(b64);
		var validLen = lens[0];
		var placeHoldersLen = lens[1];
		return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
	}
	function _byteLength(b64, validLen, placeHoldersLen) {
		return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
	}
	function toByteArray(b64) {
		var tmp;
		var lens = getLens(b64);
		var validLen = lens[0];
		var placeHoldersLen = lens[1];
		var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
		var curByte = 0;
		var len2 = placeHoldersLen > 0 ? validLen - 4 : validLen;
		var i2;
		for (i2 = 0; i2 < len2; i2 += 4) {
			tmp = revLookup[b64.charCodeAt(i2)] << 18 | revLookup[b64.charCodeAt(i2 + 1)] << 12 | revLookup[b64.charCodeAt(i2 + 2)] << 6 | revLookup[b64.charCodeAt(i2 + 3)];
			arr[curByte++] = tmp >> 16 & 255;
			arr[curByte++] = tmp >> 8 & 255;
			arr[curByte++] = tmp & 255;
		}
		if (placeHoldersLen === 2) {
			tmp = revLookup[b64.charCodeAt(i2)] << 2 | revLookup[b64.charCodeAt(i2 + 1)] >> 4;
			arr[curByte++] = tmp & 255;
		}
		if (placeHoldersLen === 1) {
			tmp = revLookup[b64.charCodeAt(i2)] << 10 | revLookup[b64.charCodeAt(i2 + 1)] << 4 | revLookup[b64.charCodeAt(i2 + 2)] >> 2;
			arr[curByte++] = tmp >> 8 & 255;
			arr[curByte++] = tmp & 255;
		}
		return arr;
	}
	function tripletToBase64(num) {
		return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
	}
	function encodeChunk(uint8, start, end) {
		var tmp;
		var output = [];
		for (var i2 = start; i2 < end; i2 += 3) {
			tmp = (uint8[i2] << 16 & 16711680) + (uint8[i2 + 1] << 8 & 65280) + (uint8[i2 + 2] & 255);
			output.push(tripletToBase64(tmp));
		}
		return output.join("");
	}
	function fromByteArray2(uint8) {
		var tmp;
		var len2 = uint8.length;
		var extraBytes = len2 % 3;
		var parts = [];
		var maxChunkLength = 16383;
		for (var i2 = 0, len22 = len2 - extraBytes; i2 < len22; i2 += maxChunkLength) parts.push(encodeChunk(uint8, i2, i2 + maxChunkLength > len22 ? len22 : i2 + maxChunkLength));
		if (extraBytes === 1) {
			tmp = uint8[len2 - 1];
			parts.push(lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "==");
		} else if (extraBytes === 2) {
			tmp = (uint8[len2 - 2] << 8) + uint8[len2 - 1];
			parts.push(lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "=");
		}
		return parts.join("");
	}
} });
var require_codes = __commonJS({ "../../node_modules/.pnpm/statuses@2.0.2/node_modules/statuses/codes.json"(exports, module) {
	module.exports = {
		"100": "Continue",
		"101": "Switching Protocols",
		"102": "Processing",
		"103": "Early Hints",
		"200": "OK",
		"201": "Created",
		"202": "Accepted",
		"203": "Non-Authoritative Information",
		"204": "No Content",
		"205": "Reset Content",
		"206": "Partial Content",
		"207": "Multi-Status",
		"208": "Already Reported",
		"226": "IM Used",
		"300": "Multiple Choices",
		"301": "Moved Permanently",
		"302": "Found",
		"303": "See Other",
		"304": "Not Modified",
		"305": "Use Proxy",
		"307": "Temporary Redirect",
		"308": "Permanent Redirect",
		"400": "Bad Request",
		"401": "Unauthorized",
		"402": "Payment Required",
		"403": "Forbidden",
		"404": "Not Found",
		"405": "Method Not Allowed",
		"406": "Not Acceptable",
		"407": "Proxy Authentication Required",
		"408": "Request Timeout",
		"409": "Conflict",
		"410": "Gone",
		"411": "Length Required",
		"412": "Precondition Failed",
		"413": "Payload Too Large",
		"414": "URI Too Long",
		"415": "Unsupported Media Type",
		"416": "Range Not Satisfiable",
		"417": "Expectation Failed",
		"418": "I'm a Teapot",
		"421": "Misdirected Request",
		"422": "Unprocessable Entity",
		"423": "Locked",
		"424": "Failed Dependency",
		"425": "Too Early",
		"426": "Upgrade Required",
		"428": "Precondition Required",
		"429": "Too Many Requests",
		"431": "Request Header Fields Too Large",
		"451": "Unavailable For Legal Reasons",
		"500": "Internal Server Error",
		"501": "Not Implemented",
		"502": "Bad Gateway",
		"503": "Service Unavailable",
		"504": "Gateway Timeout",
		"505": "HTTP Version Not Supported",
		"506": "Variant Also Negotiates",
		"507": "Insufficient Storage",
		"508": "Loop Detected",
		"509": "Bandwidth Limit Exceeded",
		"510": "Not Extended",
		"511": "Network Authentication Required"
	};
} });
var require_statuses = __commonJS({ "../../node_modules/.pnpm/statuses@2.0.2/node_modules/statuses/index.js"(exports, module) {
	var codes = require_codes();
	module.exports = status2;
	status2.message = codes;
	status2.code = createMessageToStatusCodeMap(codes);
	status2.codes = createStatusCodeList(codes);
	status2.redirect = {
		300: true,
		301: true,
		302: true,
		303: true,
		305: true,
		307: true,
		308: true
	};
	status2.empty = {
		204: true,
		205: true,
		304: true
	};
	status2.retry = {
		502: true,
		503: true,
		504: true
	};
	function createMessageToStatusCodeMap(codes2) {
		var map = {};
		Object.keys(codes2).forEach(function forEachCode(code) {
			var message = codes2[code];
			var status3 = Number(code);
			map[message.toLowerCase()] = status3;
		});
		return map;
	}
	function createStatusCodeList(codes2) {
		return Object.keys(codes2).map(function mapCode(code) {
			return Number(code);
		});
	}
	function getStatusCode(message) {
		var msg = message.toLowerCase();
		if (!Object.prototype.hasOwnProperty.call(status2.code, msg)) throw new Error("invalid status message: \"" + message + "\"");
		return status2.code[msg];
	}
	function getStatusMessage(code) {
		if (!Object.prototype.hasOwnProperty.call(status2.message, code)) throw new Error("invalid status code: " + code);
		return status2.message[code];
	}
	function status2(code) {
		if (typeof code === "number") return getStatusMessage(code);
		if (typeof code !== "string") throw new TypeError("code must be a number or string");
		var n = parseInt(code, 10);
		if (!isNaN(n)) return getStatusMessage(n);
		return getStatusCode(code);
	}
} });
var util_stub_exports = {};
__export(util_stub_exports, { inspect: () => inspect });
var inspect;
var init_util_stub = __esm({ "src/util-stub.ts"() {
	inspect = {};
} });
var require_util_inspect = __commonJS({ "../../node_modules/.pnpm/object-inspect@1.13.4/node_modules/object-inspect/util.inspect.js"(exports, module) {
	module.exports = (init_util_stub(), __toCommonJS(util_stub_exports)).inspect;
} });
var require_object_inspect = __commonJS({ "../../node_modules/.pnpm/object-inspect@1.13.4/node_modules/object-inspect/index.js"(exports, module) {
	var hasMap = typeof Map === "function" && Map.prototype;
	var mapSizeDescriptor = Object.getOwnPropertyDescriptor && hasMap ? Object.getOwnPropertyDescriptor(Map.prototype, "size") : null;
	var mapSize = hasMap && mapSizeDescriptor && typeof mapSizeDescriptor.get === "function" ? mapSizeDescriptor.get : null;
	var mapForEach = hasMap && Map.prototype.forEach;
	var hasSet = typeof Set === "function" && Set.prototype;
	var setSizeDescriptor = Object.getOwnPropertyDescriptor && hasSet ? Object.getOwnPropertyDescriptor(Set.prototype, "size") : null;
	var setSize = hasSet && setSizeDescriptor && typeof setSizeDescriptor.get === "function" ? setSizeDescriptor.get : null;
	var setForEach = hasSet && Set.prototype.forEach;
	var weakMapHas = typeof WeakMap === "function" && WeakMap.prototype ? WeakMap.prototype.has : null;
	var weakSetHas = typeof WeakSet === "function" && WeakSet.prototype ? WeakSet.prototype.has : null;
	var weakRefDeref = typeof WeakRef === "function" && WeakRef.prototype ? WeakRef.prototype.deref : null;
	var booleanValueOf = Boolean.prototype.valueOf;
	var objectToString = Object.prototype.toString;
	var functionToString = Function.prototype.toString;
	var $match = String.prototype.match;
	var $slice = String.prototype.slice;
	var $replace = String.prototype.replace;
	var $toUpperCase = String.prototype.toUpperCase;
	var $toLowerCase = String.prototype.toLowerCase;
	var $test = RegExp.prototype.test;
	var $concat = Array.prototype.concat;
	var $join = Array.prototype.join;
	var $arrSlice = Array.prototype.slice;
	var $floor = Math.floor;
	var bigIntValueOf = typeof BigInt === "function" ? BigInt.prototype.valueOf : null;
	var gOPS = Object.getOwnPropertySymbols;
	var symToString = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? Symbol.prototype.toString : null;
	var hasShammedSymbols = typeof Symbol === "function" && typeof Symbol.iterator === "object";
	var toStringTag = typeof Symbol === "function" && Symbol.toStringTag && (typeof Symbol.toStringTag === hasShammedSymbols ? "object" : "symbol") ? Symbol.toStringTag : null;
	var isEnumerable = Object.prototype.propertyIsEnumerable;
	var gPO = (typeof Reflect === "function" ? Reflect.getPrototypeOf : Object.getPrototypeOf) || ([].__proto__ === Array.prototype ? function(O) {
		return O.__proto__;
	} : null);
	function addNumericSeparator(num, str) {
		if (num === Infinity || num === -Infinity || num !== num || num && num > -1e3 && num < 1e3 || $test.call(/e/, str)) return str;
		var sepRegex = /[0-9](?=(?:[0-9]{3})+(?![0-9]))/g;
		if (typeof num === "number") {
			var int = num < 0 ? -$floor(-num) : $floor(num);
			if (int !== num) {
				var intStr = String(int);
				var dec = $slice.call(str, intStr.length + 1);
				return $replace.call(intStr, sepRegex, "$&_") + "." + $replace.call($replace.call(dec, /([0-9]{3})/g, "$&_"), /_$/, "");
			}
		}
		return $replace.call(str, sepRegex, "$&_");
	}
	var utilInspect = require_util_inspect();
	var inspectCustom = utilInspect.custom;
	var inspectSymbol = isSymbol(inspectCustom) ? inspectCustom : null;
	var quotes = {
		__proto__: null,
		"double": "\"",
		single: "'"
	};
	var quoteREs = {
		__proto__: null,
		"double": /(["\\])/g,
		single: /(['\\])/g
	};
	module.exports = function inspect_(obj, options, depth, seen) {
		var opts = options || {};
		if (has(opts, "quoteStyle") && !has(quotes, opts.quoteStyle)) throw new TypeError("option \"quoteStyle\" must be \"single\" or \"double\"");
		if (has(opts, "maxStringLength") && (typeof opts.maxStringLength === "number" ? opts.maxStringLength < 0 && opts.maxStringLength !== Infinity : opts.maxStringLength !== null)) throw new TypeError("option \"maxStringLength\", if provided, must be a positive integer, Infinity, or `null`");
		var customInspect = has(opts, "customInspect") ? opts.customInspect : true;
		if (typeof customInspect !== "boolean" && customInspect !== "symbol") throw new TypeError("option \"customInspect\", if provided, must be `true`, `false`, or `'symbol'`");
		if (has(opts, "indent") && opts.indent !== null && opts.indent !== "	" && !(parseInt(opts.indent, 10) === opts.indent && opts.indent > 0)) throw new TypeError("option \"indent\" must be \"\\t\", an integer > 0, or `null`");
		if (has(opts, "numericSeparator") && typeof opts.numericSeparator !== "boolean") throw new TypeError("option \"numericSeparator\", if provided, must be `true` or `false`");
		var numericSeparator = opts.numericSeparator;
		if (typeof obj === "undefined") return "undefined";
		if (obj === null) return "null";
		if (typeof obj === "boolean") return obj ? "true" : "false";
		if (typeof obj === "string") return inspectString(obj, opts);
		if (typeof obj === "number") {
			if (obj === 0) return Infinity / obj > 0 ? "0" : "-0";
			var str = String(obj);
			return numericSeparator ? addNumericSeparator(obj, str) : str;
		}
		if (typeof obj === "bigint") {
			var bigIntStr = String(obj) + "n";
			return numericSeparator ? addNumericSeparator(obj, bigIntStr) : bigIntStr;
		}
		var maxDepth = typeof opts.depth === "undefined" ? 5 : opts.depth;
		if (typeof depth === "undefined") depth = 0;
		if (depth >= maxDepth && maxDepth > 0 && typeof obj === "object") return isArray(obj) ? "[Array]" : "[Object]";
		var indent = getIndent(opts, depth);
		if (typeof seen === "undefined") seen = [];
		else if (indexOf(seen, obj) >= 0) return "[Circular]";
		function inspect3(value, from, noIndent) {
			if (from) {
				seen = $arrSlice.call(seen);
				seen.push(from);
			}
			if (noIndent) {
				var newOpts = { depth: opts.depth };
				if (has(opts, "quoteStyle")) newOpts.quoteStyle = opts.quoteStyle;
				return inspect_(value, newOpts, depth + 1, seen);
			}
			return inspect_(value, opts, depth + 1, seen);
		}
		if (typeof obj === "function" && !isRegExp(obj)) {
			var name = nameOf(obj);
			var keys = arrObjKeys(obj, inspect3);
			return "[Function" + (name ? ": " + name : " (anonymous)") + "]" + (keys.length > 0 ? " { " + $join.call(keys, ", ") + " }" : "");
		}
		if (isSymbol(obj)) {
			var symString = hasShammedSymbols ? $replace.call(String(obj), /^(Symbol\(.*\))_[^)]*$/, "$1") : symToString.call(obj);
			return typeof obj === "object" && !hasShammedSymbols ? markBoxed(symString) : symString;
		}
		if (isElement(obj)) {
			var s = "<" + $toLowerCase.call(String(obj.nodeName));
			var attrs = obj.attributes || [];
			for (var i = 0; i < attrs.length; i++) s += " " + attrs[i].name + "=" + wrapQuotes(quote(attrs[i].value), "double", opts);
			s += ">";
			if (obj.childNodes && obj.childNodes.length) s += "...";
			s += "</" + $toLowerCase.call(String(obj.nodeName)) + ">";
			return s;
		}
		if (isArray(obj)) {
			if (obj.length === 0) return "[]";
			var xs = arrObjKeys(obj, inspect3);
			if (indent && !singleLineValues(xs)) return "[" + indentedJoin(xs, indent) + "]";
			return "[ " + $join.call(xs, ", ") + " ]";
		}
		if (isError(obj)) {
			var parts = arrObjKeys(obj, inspect3);
			if (!("cause" in Error.prototype) && "cause" in obj && !isEnumerable.call(obj, "cause")) return "{ [" + String(obj) + "] " + $join.call($concat.call("[cause]: " + inspect3(obj.cause), parts), ", ") + " }";
			if (parts.length === 0) return "[" + String(obj) + "]";
			return "{ [" + String(obj) + "] " + $join.call(parts, ", ") + " }";
		}
		if (typeof obj === "object" && customInspect) {
			if (inspectSymbol && typeof obj[inspectSymbol] === "function" && utilInspect) return utilInspect(obj, { depth: maxDepth - depth });
			else if (customInspect !== "symbol" && typeof obj.inspect === "function") return obj.inspect();
		}
		if (isMap(obj)) {
			var mapParts = [];
			if (mapForEach) mapForEach.call(obj, function(value, key) {
				mapParts.push(inspect3(key, obj, true) + " => " + inspect3(value, obj));
			});
			return collectionOf("Map", mapSize.call(obj), mapParts, indent);
		}
		if (isSet(obj)) {
			var setParts = [];
			if (setForEach) setForEach.call(obj, function(value) {
				setParts.push(inspect3(value, obj));
			});
			return collectionOf("Set", setSize.call(obj), setParts, indent);
		}
		if (isWeakMap(obj)) return weakCollectionOf("WeakMap");
		if (isWeakSet(obj)) return weakCollectionOf("WeakSet");
		if (isWeakRef(obj)) return weakCollectionOf("WeakRef");
		if (isNumber(obj)) return markBoxed(inspect3(Number(obj)));
		if (isBigInt(obj)) return markBoxed(inspect3(bigIntValueOf.call(obj)));
		if (isBoolean(obj)) return markBoxed(booleanValueOf.call(obj));
		if (isString(obj)) return markBoxed(inspect3(String(obj)));
		if (typeof window !== "undefined" && obj === window) return "{ [object Window] }";
		if (typeof globalThis !== "undefined" && obj === globalThis || typeof global !== "undefined" && obj === global) return "{ [object globalThis] }";
		if (!isDate(obj) && !isRegExp(obj)) {
			var ys = arrObjKeys(obj, inspect3);
			var isPlainObject = gPO ? gPO(obj) === Object.prototype : obj instanceof Object || obj.constructor === Object;
			var protoTag = obj instanceof Object ? "" : "null prototype";
			var stringTag = !isPlainObject && toStringTag && Object(obj) === obj && toStringTag in obj ? $slice.call(toStr(obj), 8, -1) : protoTag ? "Object" : "";
			var tag = (isPlainObject || typeof obj.constructor !== "function" ? "" : obj.constructor.name ? obj.constructor.name + " " : "") + (stringTag || protoTag ? "[" + $join.call($concat.call([], stringTag || [], protoTag || []), ": ") + "] " : "");
			if (ys.length === 0) return tag + "{}";
			if (indent) return tag + "{" + indentedJoin(ys, indent) + "}";
			return tag + "{ " + $join.call(ys, ", ") + " }";
		}
		return String(obj);
	};
	function wrapQuotes(s, defaultStyle, opts) {
		var quoteChar = quotes[opts.quoteStyle || defaultStyle];
		return quoteChar + s + quoteChar;
	}
	function quote(s) {
		return $replace.call(String(s), /"/g, "&quot;");
	}
	function canTrustToString(obj) {
		return !toStringTag || !(typeof obj === "object" && (toStringTag in obj || typeof obj[toStringTag] !== "undefined"));
	}
	function isArray(obj) {
		return toStr(obj) === "[object Array]" && canTrustToString(obj);
	}
	function isDate(obj) {
		return toStr(obj) === "[object Date]" && canTrustToString(obj);
	}
	function isRegExp(obj) {
		return toStr(obj) === "[object RegExp]" && canTrustToString(obj);
	}
	function isError(obj) {
		return toStr(obj) === "[object Error]" && canTrustToString(obj);
	}
	function isString(obj) {
		return toStr(obj) === "[object String]" && canTrustToString(obj);
	}
	function isNumber(obj) {
		return toStr(obj) === "[object Number]" && canTrustToString(obj);
	}
	function isBoolean(obj) {
		return toStr(obj) === "[object Boolean]" && canTrustToString(obj);
	}
	function isSymbol(obj) {
		if (hasShammedSymbols) return obj && typeof obj === "object" && obj instanceof Symbol;
		if (typeof obj === "symbol") return true;
		if (!obj || typeof obj !== "object" || !symToString) return false;
		try {
			symToString.call(obj);
			return true;
		} catch (e) {}
		return false;
	}
	function isBigInt(obj) {
		if (!obj || typeof obj !== "object" || !bigIntValueOf) return false;
		try {
			bigIntValueOf.call(obj);
			return true;
		} catch (e) {}
		return false;
	}
	var hasOwn2 = Object.prototype.hasOwnProperty || function(key) {
		return key in this;
	};
	function has(obj, key) {
		return hasOwn2.call(obj, key);
	}
	function toStr(obj) {
		return objectToString.call(obj);
	}
	function nameOf(f) {
		if (f.name) return f.name;
		var m = $match.call(functionToString.call(f), /^function\s*([\w$]+)/);
		if (m) return m[1];
		return null;
	}
	function indexOf(xs, x) {
		if (xs.indexOf) return xs.indexOf(x);
		for (var i = 0, l = xs.length; i < l; i++) if (xs[i] === x) return i;
		return -1;
	}
	function isMap(x) {
		if (!mapSize || !x || typeof x !== "object") return false;
		try {
			mapSize.call(x);
			try {
				setSize.call(x);
			} catch (s) {
				return true;
			}
			return x instanceof Map;
		} catch (e) {}
		return false;
	}
	function isWeakMap(x) {
		if (!weakMapHas || !x || typeof x !== "object") return false;
		try {
			weakMapHas.call(x, weakMapHas);
			try {
				weakSetHas.call(x, weakSetHas);
			} catch (s) {
				return true;
			}
			return x instanceof WeakMap;
		} catch (e) {}
		return false;
	}
	function isWeakRef(x) {
		if (!weakRefDeref || !x || typeof x !== "object") return false;
		try {
			weakRefDeref.call(x);
			return true;
		} catch (e) {}
		return false;
	}
	function isSet(x) {
		if (!setSize || !x || typeof x !== "object") return false;
		try {
			setSize.call(x);
			try {
				mapSize.call(x);
			} catch (m) {
				return true;
			}
			return x instanceof Set;
		} catch (e) {}
		return false;
	}
	function isWeakSet(x) {
		if (!weakSetHas || !x || typeof x !== "object") return false;
		try {
			weakSetHas.call(x, weakSetHas);
			try {
				weakMapHas.call(x, weakMapHas);
			} catch (s) {
				return true;
			}
			return x instanceof WeakSet;
		} catch (e) {}
		return false;
	}
	function isElement(x) {
		if (!x || typeof x !== "object") return false;
		if (typeof HTMLElement !== "undefined" && x instanceof HTMLElement) return true;
		return typeof x.nodeName === "string" && typeof x.getAttribute === "function";
	}
	function inspectString(str, opts) {
		if (str.length > opts.maxStringLength) {
			var remaining = str.length - opts.maxStringLength;
			var trailer = "... " + remaining + " more character" + (remaining > 1 ? "s" : "");
			return inspectString($slice.call(str, 0, opts.maxStringLength), opts) + trailer;
		}
		var quoteRE = quoteREs[opts.quoteStyle || "single"];
		quoteRE.lastIndex = 0;
		return wrapQuotes($replace.call($replace.call(str, quoteRE, "\\$1"), /[\x00-\x1f]/g, lowbyte), "single", opts);
	}
	function lowbyte(c) {
		var n = c.charCodeAt(0);
		var x = {
			8: "b",
			9: "t",
			10: "n",
			12: "f",
			13: "r"
		}[n];
		if (x) return "\\" + x;
		return "\\x" + (n < 16 ? "0" : "") + $toUpperCase.call(n.toString(16));
	}
	function markBoxed(str) {
		return "Object(" + str + ")";
	}
	function weakCollectionOf(type) {
		return type + " { ? }";
	}
	function collectionOf(type, size, entries, indent) {
		var joinedEntries = indent ? indentedJoin(entries, indent) : $join.call(entries, ", ");
		return type + " (" + size + ") {" + joinedEntries + "}";
	}
	function singleLineValues(xs) {
		for (var i = 0; i < xs.length; i++) if (indexOf(xs[i], "\n") >= 0) return false;
		return true;
	}
	function getIndent(opts, depth) {
		var baseIndent;
		if (opts.indent === "	") baseIndent = "	";
		else if (typeof opts.indent === "number" && opts.indent > 0) baseIndent = $join.call(Array(opts.indent + 1), " ");
		else return null;
		return {
			base: baseIndent,
			prev: $join.call(Array(depth + 1), baseIndent)
		};
	}
	function indentedJoin(xs, indent) {
		if (xs.length === 0) return "";
		var lineJoiner = "\n" + indent.prev + indent.base;
		return lineJoiner + $join.call(xs, "," + lineJoiner) + "\n" + indent.prev;
	}
	function arrObjKeys(obj, inspect3) {
		var isArr = isArray(obj);
		var xs = [];
		if (isArr) {
			xs.length = obj.length;
			for (var i = 0; i < obj.length; i++) xs[i] = has(obj, i) ? inspect3(obj[i], obj) : "";
		}
		var syms = typeof gOPS === "function" ? gOPS(obj) : [];
		var symMap;
		if (hasShammedSymbols) {
			symMap = {};
			for (var k = 0; k < syms.length; k++) symMap["$" + syms[k]] = syms[k];
		}
		for (var key in obj) {
			if (!has(obj, key)) continue;
			if (isArr && String(Number(key)) === key && key < obj.length) continue;
			if (hasShammedSymbols && symMap["$" + key] instanceof Symbol) continue;
			else if ($test.call(/[^\w$]/, key)) xs.push(inspect3(key, obj) + ": " + inspect3(obj[key], obj));
			else xs.push(key + ": " + inspect3(obj[key], obj));
		}
		if (typeof gOPS === "function") {
			for (var j = 0; j < syms.length; j++) if (isEnumerable.call(obj, syms[j])) xs.push("[" + inspect3(syms[j]) + "]: " + inspect3(obj[syms[j]], obj));
		}
		return xs;
	}
} });
var TimeDuration = class _TimeDuration {
	__time_duration_micros__;
	static MICROS_PER_MILLIS = 1000n;
	/**
	* Get the algebraic type representation of the {@link TimeDuration} type.
	* @returns The algebraic type representation of the type.
	*/
	static getAlgebraicType() {
		return AlgebraicType.Product({ elements: [{
			name: "__time_duration_micros__",
			algebraicType: AlgebraicType.I64
		}] });
	}
	static isTimeDuration(algebraicType) {
		if (algebraicType.tag !== "Product") return false;
		const elements = algebraicType.value.elements;
		if (elements.length !== 1) return false;
		const microsElement = elements[0];
		return microsElement.name === "__time_duration_micros__" && microsElement.algebraicType.tag === "I64";
	}
	get micros() {
		return this.__time_duration_micros__;
	}
	get millis() {
		return Number(this.micros / _TimeDuration.MICROS_PER_MILLIS);
	}
	constructor(micros) {
		this.__time_duration_micros__ = micros;
	}
	static fromMillis(millis) {
		return new _TimeDuration(BigInt(millis) * _TimeDuration.MICROS_PER_MILLIS);
	}
	/** This outputs the same string format that we use in the host and in Rust modules */
	toString() {
		const micros = this.micros;
		const sign = micros < 0 ? "-" : "+";
		const pos = micros < 0 ? -micros : micros;
		const secs = pos / 1000000n;
		const micros_remaining = pos % 1000000n;
		return `${sign}${secs}.${String(micros_remaining).padStart(6, "0")}`;
	}
};
var Timestamp = class _Timestamp {
	__timestamp_micros_since_unix_epoch__;
	static MICROS_PER_MILLIS = 1000n;
	get microsSinceUnixEpoch() {
		return this.__timestamp_micros_since_unix_epoch__;
	}
	constructor(micros) {
		this.__timestamp_micros_since_unix_epoch__ = micros;
	}
	/**
	* Get the algebraic type representation of the {@link Timestamp} type.
	* @returns The algebraic type representation of the type.
	*/
	static getAlgebraicType() {
		return AlgebraicType.Product({ elements: [{
			name: "__timestamp_micros_since_unix_epoch__",
			algebraicType: AlgebraicType.I64
		}] });
	}
	static isTimestamp(algebraicType) {
		if (algebraicType.tag !== "Product") return false;
		const elements = algebraicType.value.elements;
		if (elements.length !== 1) return false;
		const microsElement = elements[0];
		return microsElement.name === "__timestamp_micros_since_unix_epoch__" && microsElement.algebraicType.tag === "I64";
	}
	/**
	* The Unix epoch, the midnight at the beginning of January 1, 1970, UTC.
	*/
	static UNIX_EPOCH = new _Timestamp(0n);
	/**
	* Get a `Timestamp` representing the execution environment's belief of the current moment in time.
	*/
	static now() {
		return _Timestamp.fromDate(/* @__PURE__ */ new Date());
	}
	/** Convert to milliseconds since Unix epoch. */
	toMillis() {
		return this.microsSinceUnixEpoch / 1000n;
	}
	/**
	* Get a `Timestamp` representing the same point in time as `date`.
	*/
	static fromDate(date) {
		const millis = date.getTime();
		return new _Timestamp(BigInt(millis) * _Timestamp.MICROS_PER_MILLIS);
	}
	/**
	* Get a `Date` representing approximately the same point in time as `this`.
	*
	* This method truncates to millisecond precision,
	* and throws `RangeError` if the `Timestamp` is outside the range representable as a `Date`.
	*/
	toDate() {
		const millis = this.__timestamp_micros_since_unix_epoch__ / _Timestamp.MICROS_PER_MILLIS;
		if (millis > BigInt(Number.MAX_SAFE_INTEGER) || millis < BigInt(Number.MIN_SAFE_INTEGER)) throw new RangeError("Timestamp is outside of the representable range of JS's Date");
		return new Date(Number(millis));
	}
	/**
	* Get an ISO 8601 / RFC 3339 formatted string representation of this timestamp with microsecond precision.
	*
	* This method preserves the full microsecond precision of the timestamp,
	* and throws `RangeError` if the `Timestamp` is outside the range representable in ISO format.
	*
	* @returns ISO 8601 formatted string with microsecond precision (e.g., '2025-02-17T10:30:45.123456Z')
	*/
	toISOString() {
		const micros = this.__timestamp_micros_since_unix_epoch__;
		const millis = micros / _Timestamp.MICROS_PER_MILLIS;
		if (millis > BigInt(Number.MAX_SAFE_INTEGER) || millis < BigInt(Number.MIN_SAFE_INTEGER)) throw new RangeError("Timestamp is outside of the representable range for ISO string formatting");
		const isoBase = new Date(Number(millis)).toISOString();
		const microsRemainder = Math.abs(Number(micros % 1000000n));
		const fractionalPart = String(microsRemainder).padStart(6, "0");
		return isoBase.replace(/\.\d{3}Z$/, `.${fractionalPart}Z`);
	}
	since(other) {
		return new TimeDuration(this.__timestamp_micros_since_unix_epoch__ - other.__timestamp_micros_since_unix_epoch__);
	}
};
var Uuid = class _Uuid {
	__uuid__;
	/**
	* The nil UUID (all zeros).
	*
	* @example
	* ```ts
	* const uuid = Uuid.NIL;
	* console.assert(
	*   uuid.toString() === "00000000-0000-0000-0000-000000000000"
	* );
	* ```
	*/
	static NIL = new _Uuid(0n);
	static MAX_UUID_BIGINT = 340282366920938463463374607431768211455n;
	/**
	* The max UUID (all ones).
	*
	* @example
	* ```ts
	* const uuid = Uuid.MAX;
	* console.assert(
	*   uuid.toString() === "ffffffff-ffff-ffff-ffff-ffffffffffff"
	* );
	* ```
	*/
	static MAX = new _Uuid(_Uuid.MAX_UUID_BIGINT);
	/**
	* Create a UUID from a raw 128-bit value.
	*
	* @param u - Unsigned 128-bit integer
	* @throws {Error} If the value is outside the valid UUID range
	*/
	constructor(u) {
		if (u < 0n || u > _Uuid.MAX_UUID_BIGINT) throw new Error("Invalid UUID: must be between 0 and `MAX_UUID_BIGINT`");
		this.__uuid__ = u;
	}
	/**
	* Create a UUID `v4` from explicit random bytes.
	*
	* This method assumes the bytes are already sufficiently random.
	* It only sets the appropriate bits for the UUID version and variant.
	*
	* @param bytes - Exactly 16 random bytes
	* @returns A UUID `v4`
	* @throws {Error} If `bytes.length !== 16`
	*
	* @example
	* ```ts
	* const randomBytes = new Uint8Array(16);
	* const uuid = Uuid.fromRandomBytesV4(randomBytes);
	*
	* console.assert(
	*   uuid.toString() === "00000000-0000-4000-8000-000000000000"
	* );
	* ```
	*/
	static fromRandomBytesV4(bytes) {
		if (bytes.length !== 16) throw new Error("UUID v4 requires 16 bytes");
		const arr = new Uint8Array(bytes);
		arr[6] = arr[6] & 15 | 64;
		arr[8] = arr[8] & 63 | 128;
		return new _Uuid(_Uuid.bytesToBigInt(arr));
	}
	/**
	* Generate a UUID `v7` using a monotonic counter from `0` to `2^31 - 1`,
	* a timestamp, and 4 random bytes.
	*
	* The counter wraps around on overflow.
	*
	* The UUID `v7` is structured as follows:
	*
	* ```ascii
	* ┌───────────────────────────────────────────────┬───────────────────┐
	* | B0  | B1  | B2  | B3  | B4  | B5              |         B6        |
	* ├───────────────────────────────────────────────┼───────────────────┤
	* |                 unix_ts_ms                    |      version 7    |
	* └───────────────────────────────────────────────┴───────────────────┘
	* ┌──────────────┬─────────┬──────────────────┬───────────────────────┐
	* | B7           | B8      | B9  | B10 | B11  | B12 | B13 | B14 | B15 |
	* ├──────────────┼─────────┼──────────────────┼───────────────────────┤
	* | counter_high | variant |    counter_low   |        random         |
	* └──────────────┴─────────┴──────────────────┴───────────────────────┘
	* ```
	*
	* @param counter - Mutable monotonic counter (31-bit)
	* @param now - Timestamp since the Unix epoch
	* @param randomBytes - Exactly 4 random bytes
	* @returns A UUID `v7`
	*
	* @throws {Error} If the `counter` is negative
	* @throws {Error} If the `timestamp` is before the Unix epoch
	* @throws {Error} If `randomBytes.length !== 4`
	*
	* @example
	* ```ts
	* const now = Timestamp.fromMillis(1_686_000_000_000n);
	* const counter = { value: 1 };
	* const randomBytes = new Uint8Array(4);
	*
	* const uuid = Uuid.fromCounterV7(counter, now, randomBytes);
	*
	* console.assert(
	*   uuid.toString() === "0000647e-5180-7000-8000-000200000000"
	* );
	* ```
	*/
	static fromCounterV7(counter, now, randomBytes) {
		if (randomBytes.length !== 4) throw new Error("`fromCounterV7` requires `randomBytes.length == 4`");
		if (counter.value < 0) throw new Error("`fromCounterV7` uuid `counter` must be non-negative");
		if (now.__timestamp_micros_since_unix_epoch__ < 0) throw new Error("`fromCounterV7` `timestamp` before unix epoch");
		const counterVal = counter.value;
		counter.value = counterVal + 1 & 2147483647;
		const tsMs = now.toMillis() & 281474976710655n;
		const bytes = new Uint8Array(16);
		bytes[0] = Number(tsMs >> 40n & 255n);
		bytes[1] = Number(tsMs >> 32n & 255n);
		bytes[2] = Number(tsMs >> 24n & 255n);
		bytes[3] = Number(tsMs >> 16n & 255n);
		bytes[4] = Number(tsMs >> 8n & 255n);
		bytes[5] = Number(tsMs & 255n);
		bytes[7] = counterVal >>> 23 & 255;
		bytes[9] = counterVal >>> 15 & 255;
		bytes[10] = counterVal >>> 7 & 255;
		bytes[11] = (counterVal & 127) << 1 & 255;
		bytes[12] |= randomBytes[0] & 127;
		bytes[13] = randomBytes[1];
		bytes[14] = randomBytes[2];
		bytes[15] = randomBytes[3];
		bytes[6] = bytes[6] & 15 | 112;
		bytes[8] = bytes[8] & 63 | 128;
		return new _Uuid(_Uuid.bytesToBigInt(bytes));
	}
	/**
	* Parse a UUID from a string representation.
	*
	* @param s - UUID string
	* @returns Parsed UUID
	* @throws {Error} If the string is not a valid UUID
	*
	* @example
	* ```ts
	* const s = "01888d6e-5c00-7000-8000-000000000000";
	* const uuid = Uuid.parse(s);
	*
	* console.assert(uuid.toString() === s);
	* ```
	*/
	static parse(s) {
		const hex = s.replace(/-/g, "");
		if (hex.length !== 32) throw new Error("Invalid hex UUID");
		let v = 0n;
		for (let i = 0; i < 32; i += 2) v = v << 8n | BigInt(parseInt(hex.slice(i, i + 2), 16));
		return new _Uuid(v);
	}
	/** Convert to string (hyphenated form). */
	toString() {
		const hex = [..._Uuid.bigIntToBytes(this.__uuid__)].map((b) => b.toString(16).padStart(2, "0")).join("");
		return hex.slice(0, 8) + "-" + hex.slice(8, 12) + "-" + hex.slice(12, 16) + "-" + hex.slice(16, 20) + "-" + hex.slice(20);
	}
	/** Convert to bigint (u128). */
	asBigInt() {
		return this.__uuid__;
	}
	/** Return a `Uint8Array` of 16 bytes. */
	toBytes() {
		return _Uuid.bigIntToBytes(this.__uuid__);
	}
	static bytesToBigInt(bytes) {
		let result = 0n;
		for (const b of bytes) result = result << 8n | BigInt(b);
		return result;
	}
	static bigIntToBytes(value) {
		const bytes = new Uint8Array(16);
		for (let i = 15; i >= 0; i--) {
			bytes[i] = Number(value & 255n);
			value >>= 8n;
		}
		return bytes;
	}
	/**
	* Returns the version of this UUID.
	*
	* This represents the algorithm used to generate the value.
	*
	* @returns A `UuidVersion`
	* @throws {Error} If the version field is not recognized
	*/
	getVersion() {
		const version = this.toBytes()[6] >> 4 & 15;
		switch (version) {
			case 4: return "V4";
			case 7: return "V7";
			default:
				if (this == _Uuid.NIL) return "Nil";
				if (this == _Uuid.MAX) return "Max";
				throw new Error(`Unsupported UUID version: ${version}`);
		}
	}
	/**
	* Extract the monotonic counter from a UUIDv7.
	*
	* Intended for testing and diagnostics.
	* Behavior is undefined if called on a non-V7 UUID.
	*
	* @returns 31-bit counter value
	*/
	getCounter() {
		const bytes = this.toBytes();
		const high = bytes[7];
		const mid1 = bytes[9];
		const mid2 = bytes[10];
		const low = bytes[11] >>> 1;
		return high << 23 | mid1 << 15 | mid2 << 7 | low | 0;
	}
	compareTo(other) {
		if (this.__uuid__ < other.__uuid__) return -1;
		if (this.__uuid__ > other.__uuid__) return 1;
		return 0;
	}
	static getAlgebraicType() {
		return AlgebraicType.Product({ elements: [{
			name: "__uuid__",
			algebraicType: AlgebraicType.U128
		}] });
	}
};
var BinaryReader = class {
	/**
	* The DataView used to read values from the binary data.
	*
	* Note: The DataView's `byteOffset` is relative to the beginning of the
	* underlying ArrayBuffer, not the start of the provided Uint8Array input.
	* This `BinaryReader`'s `#offset` field is used to track the current read position
	* relative to the start of the provided Uint8Array input.
	*/
	view;
	/**
	* Represents the offset (in bytes) relative to the start of the DataView
	* and provided Uint8Array input.
	*
	* Note: This is *not* the absolute byte offset within the underlying ArrayBuffer.
	*/
	offset = 0;
	constructor(input) {
		this.view = input instanceof DataView ? input : new DataView(input.buffer, input.byteOffset, input.byteLength);
		this.offset = 0;
	}
	reset(view) {
		this.view = view;
		this.offset = 0;
	}
	get remaining() {
		return this.view.byteLength - this.offset;
	}
	/** Ensure we have at least `n` bytes left to read */
	#ensure(n) {
		if (this.offset + n > this.view.byteLength) throw new RangeError(`Tried to read ${n} byte(s) at relative offset ${this.offset}, but only ${this.remaining} byte(s) remain`);
	}
	readUInt8Array() {
		const length = this.readU32();
		this.#ensure(length);
		return this.readBytes(length);
	}
	readBool() {
		const value = this.view.getUint8(this.offset);
		this.offset += 1;
		return value !== 0;
	}
	readByte() {
		const value = this.view.getUint8(this.offset);
		this.offset += 1;
		return value;
	}
	readBytes(length) {
		const array = new Uint8Array(this.view.buffer, this.view.byteOffset + this.offset, length);
		this.offset += length;
		return array;
	}
	readI8() {
		const value = this.view.getInt8(this.offset);
		this.offset += 1;
		return value;
	}
	readU8() {
		return this.readByte();
	}
	readI16() {
		const value = this.view.getInt16(this.offset, true);
		this.offset += 2;
		return value;
	}
	readU16() {
		const value = this.view.getUint16(this.offset, true);
		this.offset += 2;
		return value;
	}
	readI32() {
		const value = this.view.getInt32(this.offset, true);
		this.offset += 4;
		return value;
	}
	readU32() {
		const value = this.view.getUint32(this.offset, true);
		this.offset += 4;
		return value;
	}
	readI64() {
		const value = this.view.getBigInt64(this.offset, true);
		this.offset += 8;
		return value;
	}
	readU64() {
		const value = this.view.getBigUint64(this.offset, true);
		this.offset += 8;
		return value;
	}
	readU128() {
		const lowerPart = this.view.getBigUint64(this.offset, true);
		const upperPart = this.view.getBigUint64(this.offset + 8, true);
		this.offset += 16;
		return (upperPart << BigInt(64)) + lowerPart;
	}
	readI128() {
		const lowerPart = this.view.getBigUint64(this.offset, true);
		const upperPart = this.view.getBigInt64(this.offset + 8, true);
		this.offset += 16;
		return (upperPart << BigInt(64)) + lowerPart;
	}
	readU256() {
		const p0 = this.view.getBigUint64(this.offset, true);
		const p1 = this.view.getBigUint64(this.offset + 8, true);
		const p2 = this.view.getBigUint64(this.offset + 16, true);
		const p3 = this.view.getBigUint64(this.offset + 24, true);
		this.offset += 32;
		return (p3 << BigInt(192)) + (p2 << BigInt(128)) + (p1 << BigInt(64)) + p0;
	}
	readI256() {
		const p0 = this.view.getBigUint64(this.offset, true);
		const p1 = this.view.getBigUint64(this.offset + 8, true);
		const p2 = this.view.getBigUint64(this.offset + 16, true);
		const p3 = this.view.getBigInt64(this.offset + 24, true);
		this.offset += 32;
		return (p3 << BigInt(192)) + (p2 << BigInt(128)) + (p1 << BigInt(64)) + p0;
	}
	readF32() {
		const value = this.view.getFloat32(this.offset, true);
		this.offset += 4;
		return value;
	}
	readF64() {
		const value = this.view.getFloat64(this.offset, true);
		this.offset += 8;
		return value;
	}
	readString() {
		const uint8Array = this.readUInt8Array();
		return new TextDecoder("utf-8").decode(uint8Array);
	}
};
var import_base64_js = __toESM(require_base64_js());
var ArrayBufferPrototypeTransfer = ArrayBuffer.prototype.transfer ?? function(newByteLength) {
	if (newByteLength === void 0) return this.slice();
	else if (newByteLength <= this.byteLength) return this.slice(0, newByteLength);
	else {
		const copy = new Uint8Array(newByteLength);
		copy.set(new Uint8Array(this));
		return copy.buffer;
	}
};
var ResizableBuffer = class {
	buffer;
	view;
	constructor(init) {
		this.buffer = typeof init === "number" ? new ArrayBuffer(init) : init;
		this.view = new DataView(this.buffer);
	}
	get capacity() {
		return this.buffer.byteLength;
	}
	grow(newSize) {
		if (newSize <= this.buffer.byteLength) return;
		this.buffer = ArrayBufferPrototypeTransfer.call(this.buffer, newSize);
		this.view = new DataView(this.buffer);
	}
};
var BinaryWriter = class {
	buffer;
	offset = 0;
	constructor(init) {
		this.buffer = typeof init === "number" ? new ResizableBuffer(init) : init;
	}
	reset(buffer) {
		this.buffer = buffer;
		this.offset = 0;
	}
	expandBuffer(additionalCapacity) {
		const minCapacity = this.offset + additionalCapacity + 1;
		if (minCapacity <= this.buffer.capacity) return;
		let newCapacity = this.buffer.capacity * 2;
		if (newCapacity < minCapacity) newCapacity = minCapacity;
		this.buffer.grow(newCapacity);
	}
	toBase64() {
		return (0, import_base64_js.fromByteArray)(this.getBuffer());
	}
	getBuffer() {
		return new Uint8Array(this.buffer.buffer, 0, this.offset);
	}
	get view() {
		return this.buffer.view;
	}
	writeUInt8Array(value) {
		const length = value.length;
		this.expandBuffer(4 + length);
		this.writeU32(length);
		new Uint8Array(this.buffer.buffer, this.offset).set(value);
		this.offset += length;
	}
	writeBool(value) {
		this.expandBuffer(1);
		this.view.setUint8(this.offset, value ? 1 : 0);
		this.offset += 1;
	}
	writeByte(value) {
		this.expandBuffer(1);
		this.view.setUint8(this.offset, value);
		this.offset += 1;
	}
	writeI8(value) {
		this.expandBuffer(1);
		this.view.setInt8(this.offset, value);
		this.offset += 1;
	}
	writeU8(value) {
		this.expandBuffer(1);
		this.view.setUint8(this.offset, value);
		this.offset += 1;
	}
	writeI16(value) {
		this.expandBuffer(2);
		this.view.setInt16(this.offset, value, true);
		this.offset += 2;
	}
	writeU16(value) {
		this.expandBuffer(2);
		this.view.setUint16(this.offset, value, true);
		this.offset += 2;
	}
	writeI32(value) {
		this.expandBuffer(4);
		this.view.setInt32(this.offset, value, true);
		this.offset += 4;
	}
	writeU32(value) {
		this.expandBuffer(4);
		this.view.setUint32(this.offset, value, true);
		this.offset += 4;
	}
	writeI64(value) {
		this.expandBuffer(8);
		this.view.setBigInt64(this.offset, value, true);
		this.offset += 8;
	}
	writeU64(value) {
		this.expandBuffer(8);
		this.view.setBigUint64(this.offset, value, true);
		this.offset += 8;
	}
	writeU128(value) {
		this.expandBuffer(16);
		const lowerPart = value & BigInt("0xFFFFFFFFFFFFFFFF");
		const upperPart = value >> BigInt(64);
		this.view.setBigUint64(this.offset, lowerPart, true);
		this.view.setBigUint64(this.offset + 8, upperPart, true);
		this.offset += 16;
	}
	writeI128(value) {
		this.expandBuffer(16);
		const lowerPart = value & BigInt("0xFFFFFFFFFFFFFFFF");
		const upperPart = value >> BigInt(64);
		this.view.setBigInt64(this.offset, lowerPart, true);
		this.view.setBigInt64(this.offset + 8, upperPart, true);
		this.offset += 16;
	}
	writeU256(value) {
		this.expandBuffer(32);
		const low_64_mask = BigInt("0xFFFFFFFFFFFFFFFF");
		const p0 = value & low_64_mask;
		const p1 = value >> BigInt(64) & low_64_mask;
		const p2 = value >> BigInt(128) & low_64_mask;
		const p3 = value >> BigInt(192);
		this.view.setBigUint64(this.offset + 0, p0, true);
		this.view.setBigUint64(this.offset + 8, p1, true);
		this.view.setBigUint64(this.offset + 16, p2, true);
		this.view.setBigUint64(this.offset + 24, p3, true);
		this.offset += 32;
	}
	writeI256(value) {
		this.expandBuffer(32);
		const low_64_mask = BigInt("0xFFFFFFFFFFFFFFFF");
		const p0 = value & low_64_mask;
		const p1 = value >> BigInt(64) & low_64_mask;
		const p2 = value >> BigInt(128) & low_64_mask;
		const p3 = value >> BigInt(192);
		this.view.setBigUint64(this.offset + 0, p0, true);
		this.view.setBigUint64(this.offset + 8, p1, true);
		this.view.setBigUint64(this.offset + 16, p2, true);
		this.view.setBigInt64(this.offset + 24, p3, true);
		this.offset += 32;
	}
	writeF32(value) {
		this.expandBuffer(4);
		this.view.setFloat32(this.offset, value, true);
		this.offset += 4;
	}
	writeF64(value) {
		this.expandBuffer(8);
		this.view.setFloat64(this.offset, value, true);
		this.offset += 8;
	}
	writeString(value) {
		const encodedString = new TextEncoder().encode(value);
		this.writeUInt8Array(encodedString);
	}
};
function uint8ArrayToHexString(array) {
	return Array.prototype.map.call(array.reverse(), (x) => ("00" + x.toString(16)).slice(-2)).join("");
}
function uint8ArrayToU128(array) {
	if (array.length != 16) throw new Error(`Uint8Array is not 16 bytes long: ${array}`);
	return new BinaryReader(array).readU128();
}
function uint8ArrayToU256(array) {
	if (array.length != 32) throw new Error(`Uint8Array is not 32 bytes long: [${array}]`);
	return new BinaryReader(array).readU256();
}
function hexStringToUint8Array(str) {
	if (str.startsWith("0x")) str = str.slice(2);
	const matches = str.match(/.{1,2}/g) || [];
	return Uint8Array.from(matches.map((byte) => parseInt(byte, 16))).reverse();
}
function hexStringToU128(str) {
	return uint8ArrayToU128(hexStringToUint8Array(str));
}
function hexStringToU256(str) {
	return uint8ArrayToU256(hexStringToUint8Array(str));
}
function u128ToUint8Array(data) {
	const writer = new BinaryWriter(16);
	writer.writeU128(data);
	return writer.getBuffer();
}
function u128ToHexString(data) {
	return uint8ArrayToHexString(u128ToUint8Array(data));
}
function u256ToUint8Array(data) {
	const writer = new BinaryWriter(32);
	writer.writeU256(data);
	return writer.getBuffer();
}
function u256ToHexString(data) {
	return uint8ArrayToHexString(u256ToUint8Array(data));
}
function toPascalCase(s) {
	const str = toCamelCase(s);
	return str.charAt(0).toUpperCase() + str.slice(1);
}
function toCamelCase(s) {
	const str = s.replace(/[-_]+/g, "_").replace(/_([a-zA-Z0-9])/g, (_, c) => c.toUpperCase());
	return str.charAt(0).toLowerCase() + str.slice(1);
}
function bsatnBaseSize(typespace, ty) {
	const assumedArrayLength = 4;
	while (ty.tag === "Ref") ty = typespace.types[ty.value];
	if (ty.tag === "Product") {
		let sum = 0;
		for (const { algebraicType: elem } of ty.value.elements) sum += bsatnBaseSize(typespace, elem);
		return sum;
	} else if (ty.tag === "Sum") {
		let min = Infinity;
		for (const { algebraicType: vari } of ty.value.variants) {
			const vSize = bsatnBaseSize(typespace, vari);
			if (vSize < min) min = vSize;
		}
		if (min === Infinity) min = 0;
		return 4 + min;
	} else if (ty.tag == "Array") return 4 + assumedArrayLength * bsatnBaseSize(typespace, ty.value);
	return {
		String: 4 + assumedArrayLength,
		Sum: 1,
		Bool: 1,
		I8: 1,
		U8: 1,
		I16: 2,
		U16: 2,
		I32: 4,
		U32: 4,
		F32: 4,
		I64: 8,
		U64: 8,
		F64: 8,
		I128: 16,
		U128: 16,
		I256: 32,
		U256: 32
	}[ty.tag];
}
var hasOwn = Object.hasOwn;
var ConnectionId = class _ConnectionId {
	__connection_id__;
	/**
	* Creates a new `ConnectionId`.
	*/
	constructor(data) {
		this.__connection_id__ = data;
	}
	/**
	* Get the algebraic type representation of the {@link ConnectionId} type.
	* @returns The algebraic type representation of the type.
	*/
	static getAlgebraicType() {
		return AlgebraicType.Product({ elements: [{
			name: "__connection_id__",
			algebraicType: AlgebraicType.U128
		}] });
	}
	isZero() {
		return this.__connection_id__ === BigInt(0);
	}
	static nullIfZero(addr) {
		if (addr.isZero()) return null;
		else return addr;
	}
	static random() {
		function randomU8() {
			return Math.floor(Math.random() * 255);
		}
		let result = BigInt(0);
		for (let i = 0; i < 16; i++) result = result << BigInt(8) | BigInt(randomU8());
		return new _ConnectionId(result);
	}
	/**
	* Compare two connection IDs for equality.
	*/
	isEqual(other) {
		return this.__connection_id__ == other.__connection_id__;
	}
	/**
	* Check if two connection IDs are equal.
	*/
	equals(other) {
		return this.isEqual(other);
	}
	/**
	* Print the connection ID as a hexadecimal string.
	*/
	toHexString() {
		return u128ToHexString(this.__connection_id__);
	}
	/**
	* Convert the connection ID to a Uint8Array.
	*/
	toUint8Array() {
		return u128ToUint8Array(this.__connection_id__);
	}
	/**
	* Parse a connection ID from a hexadecimal string.
	*/
	static fromString(str) {
		return new _ConnectionId(hexStringToU128(str));
	}
	static fromStringOrNull(str) {
		const addr = _ConnectionId.fromString(str);
		if (addr.isZero()) return null;
		else return addr;
	}
};
var Identity = class _Identity {
	__identity__;
	/**
	* Creates a new `Identity`.
	*
	* `data` can be a hexadecimal string or a `bigint`.
	*/
	constructor(data) {
		this.__identity__ = typeof data === "string" ? hexStringToU256(data) : data;
	}
	/**
	* Get the algebraic type representation of the {@link Identity} type.
	* @returns The algebraic type representation of the type.
	*/
	static getAlgebraicType() {
		return AlgebraicType.Product({ elements: [{
			name: "__identity__",
			algebraicType: AlgebraicType.U256
		}] });
	}
	/**
	* Check if two identities are equal.
	*/
	isEqual(other) {
		return this.toHexString() === other.toHexString();
	}
	/**
	* Check if two identities are equal.
	*/
	equals(other) {
		return this.isEqual(other);
	}
	/**
	* Print the identity as a hexadecimal string.
	*/
	toHexString() {
		return u256ToHexString(this.__identity__);
	}
	/**
	* Convert the address to a Uint8Array.
	*/
	toUint8Array() {
		return u256ToUint8Array(this.__identity__);
	}
	/**
	* Parse an Identity from a hexadecimal string.
	*/
	static fromString(str) {
		return new _Identity(str);
	}
	/**
	* Zero identity (0x0000000000000000000000000000000000000000000000000000000000000000)
	*/
	static zero() {
		return new _Identity(0n);
	}
	toString() {
		return this.toHexString();
	}
};
var SERIALIZERS = /* @__PURE__ */ new Map();
var DESERIALIZERS = /* @__PURE__ */ new Map();
var AlgebraicType = {
	Ref: (value) => ({
		tag: "Ref",
		value
	}),
	Sum: (value) => ({
		tag: "Sum",
		value
	}),
	Product: (value) => ({
		tag: "Product",
		value
	}),
	Array: (value) => ({
		tag: "Array",
		value
	}),
	String: { tag: "String" },
	Bool: { tag: "Bool" },
	I8: { tag: "I8" },
	U8: { tag: "U8" },
	I16: { tag: "I16" },
	U16: { tag: "U16" },
	I32: { tag: "I32" },
	U32: { tag: "U32" },
	I64: { tag: "I64" },
	U64: { tag: "U64" },
	I128: { tag: "I128" },
	U128: { tag: "U128" },
	I256: { tag: "I256" },
	U256: { tag: "U256" },
	F32: { tag: "F32" },
	F64: { tag: "F64" },
	makeSerializer(ty, typespace) {
		if (ty.tag === "Ref") {
			if (!typespace) throw new Error("cannot serialize refs without a typespace");
			while (ty.tag === "Ref") ty = typespace.types[ty.value];
		}
		switch (ty.tag) {
			case "Product": return ProductType.makeSerializer(ty.value, typespace);
			case "Sum": return SumType.makeSerializer(ty.value, typespace);
			case "Array": if (ty.value.tag === "U8") return serializeUint8Array;
			else {
				const serialize = AlgebraicType.makeSerializer(ty.value, typespace);
				return (writer, value) => {
					writer.writeU32(value.length);
					for (const elem of value) serialize(writer, elem);
				};
			}
			default: return primitiveSerializers[ty.tag];
		}
	},
	serializeValue(writer, ty, value, typespace) {
		AlgebraicType.makeSerializer(ty, typespace)(writer, value);
	},
	makeDeserializer(ty, typespace) {
		if (ty.tag === "Ref") {
			if (!typespace) throw new Error("cannot deserialize refs without a typespace");
			while (ty.tag === "Ref") ty = typespace.types[ty.value];
		}
		switch (ty.tag) {
			case "Product": return ProductType.makeDeserializer(ty.value, typespace);
			case "Sum": return SumType.makeDeserializer(ty.value, typespace);
			case "Array": if (ty.value.tag === "U8") return deserializeUint8Array;
			else {
				const deserialize = AlgebraicType.makeDeserializer(ty.value, typespace);
				return (reader) => {
					const length = reader.readU32();
					const result = Array(length);
					for (let i = 0; i < length; i++) result[i] = deserialize(reader);
					return result;
				};
			}
			default: return primitiveDeserializers[ty.tag];
		}
	},
	deserializeValue(reader, ty, typespace) {
		return AlgebraicType.makeDeserializer(ty, typespace)(reader);
	},
	intoMapKey: function(ty, value) {
		switch (ty.tag) {
			case "U8":
			case "U16":
			case "U32":
			case "U64":
			case "U128":
			case "U256":
			case "I8":
			case "I16":
			case "I32":
			case "I64":
			case "I128":
			case "I256":
			case "F32":
			case "F64":
			case "String":
			case "Bool": return value;
			case "Product": return ProductType.intoMapKey(ty.value, value);
			default: {
				const writer = new BinaryWriter(10);
				AlgebraicType.serializeValue(writer, ty, value);
				return writer.toBase64();
			}
		}
	}
};
function bindCall(f) {
	return Function.prototype.call.bind(f);
}
var primitiveSerializers = {
	Bool: bindCall(BinaryWriter.prototype.writeBool),
	I8: bindCall(BinaryWriter.prototype.writeI8),
	U8: bindCall(BinaryWriter.prototype.writeU8),
	I16: bindCall(BinaryWriter.prototype.writeI16),
	U16: bindCall(BinaryWriter.prototype.writeU16),
	I32: bindCall(BinaryWriter.prototype.writeI32),
	U32: bindCall(BinaryWriter.prototype.writeU32),
	I64: bindCall(BinaryWriter.prototype.writeI64),
	U64: bindCall(BinaryWriter.prototype.writeU64),
	I128: bindCall(BinaryWriter.prototype.writeI128),
	U128: bindCall(BinaryWriter.prototype.writeU128),
	I256: bindCall(BinaryWriter.prototype.writeI256),
	U256: bindCall(BinaryWriter.prototype.writeU256),
	F32: bindCall(BinaryWriter.prototype.writeF32),
	F64: bindCall(BinaryWriter.prototype.writeF64),
	String: bindCall(BinaryWriter.prototype.writeString)
};
Object.freeze(primitiveSerializers);
var serializeUint8Array = bindCall(BinaryWriter.prototype.writeUInt8Array);
var primitiveDeserializers = {
	Bool: bindCall(BinaryReader.prototype.readBool),
	I8: bindCall(BinaryReader.prototype.readI8),
	U8: bindCall(BinaryReader.prototype.readU8),
	I16: bindCall(BinaryReader.prototype.readI16),
	U16: bindCall(BinaryReader.prototype.readU16),
	I32: bindCall(BinaryReader.prototype.readI32),
	U32: bindCall(BinaryReader.prototype.readU32),
	I64: bindCall(BinaryReader.prototype.readI64),
	U64: bindCall(BinaryReader.prototype.readU64),
	I128: bindCall(BinaryReader.prototype.readI128),
	U128: bindCall(BinaryReader.prototype.readU128),
	I256: bindCall(BinaryReader.prototype.readI256),
	U256: bindCall(BinaryReader.prototype.readU256),
	F32: bindCall(BinaryReader.prototype.readF32),
	F64: bindCall(BinaryReader.prototype.readF64),
	String: bindCall(BinaryReader.prototype.readString)
};
Object.freeze(primitiveDeserializers);
var deserializeUint8Array = bindCall(BinaryReader.prototype.readUInt8Array);
var primitiveSizes = {
	Bool: 1,
	I8: 1,
	U8: 1,
	I16: 2,
	U16: 2,
	I32: 4,
	U32: 4,
	I64: 8,
	U64: 8,
	I128: 16,
	U128: 16,
	I256: 32,
	U256: 32,
	F32: 4,
	F64: 8
};
var fixedSizePrimitives = new Set(Object.keys(primitiveSizes));
var isFixedSizeProduct = (ty) => ty.elements.every(({ algebraicType }) => fixedSizePrimitives.has(algebraicType.tag));
var productSize = (ty) => ty.elements.reduce((acc, { algebraicType }) => acc + primitiveSizes[algebraicType.tag], 0);
var primitiveJSName = {
	Bool: "Uint8",
	I8: "Int8",
	U8: "Uint8",
	I16: "Int16",
	U16: "Uint16",
	I32: "Int32",
	U32: "Uint32",
	I64: "BigInt64",
	U64: "BigUint64",
	F32: "Float32",
	F64: "Float64"
};
var specialProductDeserializers = {
	__time_duration_micros__: (reader) => new TimeDuration(reader.readI64()),
	__timestamp_micros_since_unix_epoch__: (reader) => new Timestamp(reader.readI64()),
	__identity__: (reader) => new Identity(reader.readU256()),
	__connection_id__: (reader) => new ConnectionId(reader.readU128()),
	__uuid__: (reader) => new Uuid(reader.readU128())
};
Object.freeze(specialProductDeserializers);
var unitDeserializer = () => ({});
var getElementInitializer = (element) => {
	let init;
	switch (element.algebraicType.tag) {
		case "String":
			init = "''";
			break;
		case "Bool":
			init = "false";
			break;
		case "I8":
		case "U8":
		case "I16":
		case "U16":
		case "I32":
		case "U32":
			init = "0";
			break;
		case "I64":
		case "U64":
		case "I128":
		case "U128":
		case "I256":
		case "U256":
			init = "0n";
			break;
		case "F32":
		case "F64":
			init = "0.0";
			break;
		default: init = "undefined";
	}
	return `${element.name}: ${init}`;
};
var ProductType = {
	makeSerializer(ty, typespace) {
		let serializer = SERIALIZERS.get(ty);
		if (serializer != null) return serializer;
		if (isFixedSizeProduct(ty)) {
			const body2 = `"use strict";
writer.expandBuffer(${productSize(ty)});
const view = writer.view;
${ty.elements.map(({ name, algebraicType: { tag } }) => tag in primitiveJSName ? `view.set${primitiveJSName[tag]}(writer.offset, value.${name}, ${primitiveSizes[tag] > 1 ? "true" : ""});
writer.offset += ${primitiveSizes[tag]};` : `writer.write${tag}(value.${name});`).join("\n")}`;
			serializer = Function("writer", "value", body2);
			SERIALIZERS.set(ty, serializer);
			return serializer;
		}
		const serializers = {};
		const body = "\"use strict\";\n" + ty.elements.map((element) => `this.${element.name}(writer, value.${element.name});`).join("\n");
		serializer = Function("writer", "value", body).bind(serializers);
		SERIALIZERS.set(ty, serializer);
		for (const { name, algebraicType } of ty.elements) serializers[name] = AlgebraicType.makeSerializer(algebraicType, typespace);
		Object.freeze(serializers);
		return serializer;
	},
	serializeValue(writer, ty, value, typespace) {
		ProductType.makeSerializer(ty, typespace)(writer, value);
	},
	makeDeserializer(ty, typespace) {
		switch (ty.elements.length) {
			case 0: return unitDeserializer;
			case 1: {
				const fieldName = ty.elements[0].name;
				if (hasOwn(specialProductDeserializers, fieldName)) return specialProductDeserializers[fieldName];
			}
		}
		let deserializer = DESERIALIZERS.get(ty);
		if (deserializer != null) return deserializer;
		if (isFixedSizeProduct(ty)) {
			const body = `"use strict";
const result = { ${ty.elements.map(getElementInitializer).join(", ")} };
const view = reader.view;
${ty.elements.map(({ name, algebraicType: { tag } }) => tag in primitiveJSName ? `result.${name} = view.get${primitiveJSName[tag]}(reader.offset, ${primitiveSizes[tag] > 1 ? "true" : ""});
reader.offset += ${primitiveSizes[tag]};` : `result.${name} = reader.read${tag}();`).join("\n")}
return result;`;
			deserializer = Function("reader", body);
			DESERIALIZERS.set(ty, deserializer);
			return deserializer;
		}
		const deserializers = {};
		deserializer = Function("reader", `"use strict";
const result = { ${ty.elements.map(getElementInitializer).join(", ")} };
${ty.elements.map(({ name }) => `result.${name} = this.${name}(reader);`).join("\n")}
return result;`).bind(deserializers);
		DESERIALIZERS.set(ty, deserializer);
		for (const { name, algebraicType } of ty.elements) deserializers[name] = AlgebraicType.makeDeserializer(algebraicType, typespace);
		Object.freeze(deserializers);
		return deserializer;
	},
	deserializeValue(reader, ty, typespace) {
		return ProductType.makeDeserializer(ty, typespace)(reader);
	},
	intoMapKey(ty, value) {
		if (ty.elements.length === 1) {
			const fieldName = ty.elements[0].name;
			if (hasOwn(specialProductDeserializers, fieldName)) return value[fieldName];
		}
		const writer = new BinaryWriter(10);
		AlgebraicType.serializeValue(writer, AlgebraicType.Product(ty), value);
		return writer.toBase64();
	}
};
var SumType = {
	makeSerializer(ty, typespace) {
		if (ty.variants.length == 2 && ty.variants[0].name === "some" && ty.variants[1].name === "none") {
			const serialize = AlgebraicType.makeSerializer(ty.variants[0].algebraicType, typespace);
			return (writer, value) => {
				if (value !== null && value !== void 0) {
					writer.writeByte(0);
					serialize(writer, value);
				} else writer.writeByte(1);
			};
		} else if (ty.variants.length == 2 && ty.variants[0].name === "ok" && ty.variants[1].name === "err") {
			const serializeOk = AlgebraicType.makeSerializer(ty.variants[0].algebraicType, typespace);
			const serializeErr = AlgebraicType.makeSerializer(ty.variants[0].algebraicType, typespace);
			return (writer, value) => {
				if ("ok" in value) {
					writer.writeU8(0);
					serializeOk(writer, value.ok);
				} else if ("err" in value) {
					writer.writeU8(1);
					serializeErr(writer, value.err);
				} else throw new TypeError("could not serialize result: object had neither a `ok` nor an `err` field");
			};
		} else {
			let serializer = SERIALIZERS.get(ty);
			if (serializer != null) return serializer;
			const serializers = {};
			const body = `switch (value.tag) {
${ty.variants.map(({ name }, i) => `  case ${JSON.stringify(name)}:
    writer.writeByte(${i});
    return this.${name}(writer, value.value);`).join("\n")}
  default:
    throw new TypeError(
      \`Could not serialize sum type; unknown tag \${value.tag}\`
    )
}
`;
			serializer = Function("writer", "value", body).bind(serializers);
			SERIALIZERS.set(ty, serializer);
			for (const { name, algebraicType } of ty.variants) serializers[name] = AlgebraicType.makeSerializer(algebraicType, typespace);
			Object.freeze(serializers);
			return serializer;
		}
	},
	serializeValue(writer, ty, value, typespace) {
		SumType.makeSerializer(ty, typespace)(writer, value);
	},
	makeDeserializer(ty, typespace) {
		if (ty.variants.length == 2 && ty.variants[0].name === "some" && ty.variants[1].name === "none") {
			const deserialize = AlgebraicType.makeDeserializer(ty.variants[0].algebraicType, typespace);
			return (reader) => {
				const tag = reader.readU8();
				if (tag === 0) return deserialize(reader);
				else if (tag === 1) return;
				else throw `Can't deserialize an option type, couldn't find ${tag} tag`;
			};
		} else if (ty.variants.length == 2 && ty.variants[0].name === "ok" && ty.variants[1].name === "err") {
			const deserializeOk = AlgebraicType.makeDeserializer(ty.variants[0].algebraicType, typespace);
			const deserializeErr = AlgebraicType.makeDeserializer(ty.variants[1].algebraicType, typespace);
			return (reader) => {
				const tag = reader.readByte();
				if (tag === 0) return { ok: deserializeOk(reader) };
				else if (tag === 1) return { err: deserializeErr(reader) };
				else throw `Can't deserialize a result type, couldn't find ${tag} tag`;
			};
		} else {
			let deserializer = DESERIALIZERS.get(ty);
			if (deserializer != null) return deserializer;
			const deserializers = {};
			deserializer = Function("reader", `switch (reader.readU8()) {
${ty.variants.map(({ name }, i) => `case ${i}: return { tag: ${JSON.stringify(name)}, value: this.${name}(reader) };`).join("\n")} }`).bind(deserializers);
			DESERIALIZERS.set(ty, deserializer);
			for (const { name, algebraicType } of ty.variants) deserializers[name] = AlgebraicType.makeDeserializer(algebraicType, typespace);
			Object.freeze(deserializers);
			return deserializer;
		}
	},
	deserializeValue(reader, ty, typespace) {
		return SumType.makeDeserializer(ty, typespace)(reader);
	}
};
var Option = { getAlgebraicType(innerType) {
	return AlgebraicType.Sum({ variants: [{
		name: "some",
		algebraicType: innerType
	}, {
		name: "none",
		algebraicType: AlgebraicType.Product({ elements: [] })
	}] });
} };
var Result = { getAlgebraicType(okType, errType) {
	return AlgebraicType.Sum({ variants: [{
		name: "ok",
		algebraicType: okType
	}, {
		name: "err",
		algebraicType: errType
	}] });
} };
var ScheduleAt = {
	interval(value) {
		return Interval(value);
	},
	time(value) {
		return Time(value);
	},
	getAlgebraicType() {
		return AlgebraicType.Sum({ variants: [{
			name: "Interval",
			algebraicType: TimeDuration.getAlgebraicType()
		}, {
			name: "Time",
			algebraicType: Timestamp.getAlgebraicType()
		}] });
	},
	isScheduleAt(algebraicType) {
		if (algebraicType.tag !== "Sum") return false;
		const variants = algebraicType.value.variants;
		if (variants.length !== 2) return false;
		const intervalVariant = variants.find((v) => v.name === "Interval");
		const timeVariant = variants.find((v) => v.name === "Time");
		if (!intervalVariant || !timeVariant) return false;
		return TimeDuration.isTimeDuration(intervalVariant.algebraicType) && Timestamp.isTimestamp(timeVariant.algebraicType);
	}
};
var Interval = (micros) => ({
	tag: "Interval",
	value: new TimeDuration(micros)
});
var Time = (microsSinceUnixEpoch) => ({
	tag: "Time",
	value: new Timestamp(microsSinceUnixEpoch)
});
var schedule_at_default = ScheduleAt;
function set(x, t2) {
	return {
		...x,
		...t2
	};
}
var TypeBuilder = class {
	/**
	* The TypeScript phantom type. This is not stored at runtime,
	* but is visible to the compiler
	*/
	type;
	/**
	* The SpacetimeDB algebraic type (run‑time value). In addition to storing
	* the runtime representation of the `AlgebraicType`, it also captures
	* the TypeScript type information of the `AlgebraicType`. That is to say
	* the value is not merely an `AlgebraicType`, but is constructed to be
	* the corresponding concrete `AlgebraicType` for the TypeScript type `Type`.
	*
	* e.g. `string` corresponds to `AlgebraicType.String`
	*/
	algebraicType;
	constructor(algebraicType) {
		this.algebraicType = algebraicType;
	}
	optional() {
		return new OptionBuilder(this);
	}
	serialize(writer, value) {
		(this.serialize = AlgebraicType.makeSerializer(this.algebraicType))(writer, value);
	}
	deserialize(reader) {
		return (this.deserialize = AlgebraicType.makeDeserializer(this.algebraicType))(reader);
	}
};
var U8Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.U8);
	}
	index(algorithm = "btree") {
		return new U8ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new U8ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new U8ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new U8ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new U8ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new U8ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var U16Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.U16);
	}
	index(algorithm = "btree") {
		return new U16ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new U16ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new U16ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new U16ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new U16ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new U16ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var U32Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.U32);
	}
	index(algorithm = "btree") {
		return new U32ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new U32ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new U32ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new U32ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new U32ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new U32ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var U64Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.U64);
	}
	index(algorithm = "btree") {
		return new U64ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new U64ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new U64ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new U64ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new U64ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new U64ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var U128Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.U128);
	}
	index(algorithm = "btree") {
		return new U128ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new U128ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new U128ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new U128ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new U128ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new U128ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var U256Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.U256);
	}
	index(algorithm = "btree") {
		return new U256ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new U256ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new U256ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new U256ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new U256ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new U256ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var I8Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.I8);
	}
	index(algorithm = "btree") {
		return new I8ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new I8ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new I8ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new I8ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new I8ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new I8ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var I16Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.I16);
	}
	index(algorithm = "btree") {
		return new I16ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new I16ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new I16ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new I16ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new I16ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new I16ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var I32Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.I32);
	}
	index(algorithm = "btree") {
		return new I32ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new I32ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new I32ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new I32ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new I32ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new I32ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var I64Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.I64);
	}
	index(algorithm = "btree") {
		return new I64ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new I64ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new I64ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new I64ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new I64ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new I64ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var I128Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.I128);
	}
	index(algorithm = "btree") {
		return new I128ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new I128ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new I128ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new I128ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new I128ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new I128ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var I256Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.I256);
	}
	index(algorithm = "btree") {
		return new I256ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new I256ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new I256ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new I256ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new I256ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new I256ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var F32Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.F32);
	}
	default(value) {
		return new F32ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new F32ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var F64Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.F64);
	}
	default(value) {
		return new F64ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new F64ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var BoolBuilder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.Bool);
	}
	index(algorithm = "btree") {
		return new BoolColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new BoolColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new BoolColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	default(value) {
		return new BoolColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new BoolColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var StringBuilder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.String);
	}
	index(algorithm = "btree") {
		return new StringColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new StringColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new StringColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	default(value) {
		return new StringColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new StringColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var ArrayBuilder = class extends TypeBuilder {
	element;
	constructor(element) {
		super(AlgebraicType.Array(element.algebraicType));
		this.element = element;
	}
	default(value) {
		return new ArrayColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new ArrayColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var ByteArrayBuilder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.Array(AlgebraicType.U8));
	}
	default(value) {
		return new ByteArrayColumnBuilder(set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new ByteArrayColumnBuilder(set(defaultMetadata, { name }));
	}
};
var OptionBuilder = class extends TypeBuilder {
	value;
	constructor(value) {
		super(Option.getAlgebraicType(value.algebraicType));
		this.value = value;
	}
	default(value) {
		return new OptionColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new OptionColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var ProductBuilder = class extends TypeBuilder {
	typeName;
	elements;
	constructor(elements, name) {
		function elementsArrayFromElementsObj(obj) {
			return Object.keys(obj).map((key) => ({
				name: key,
				get algebraicType() {
					return obj[key].algebraicType;
				}
			}));
		}
		super(AlgebraicType.Product({ elements: elementsArrayFromElementsObj(elements) }));
		this.typeName = name;
		this.elements = elements;
	}
	default(value) {
		return new ProductColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new ProductColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var ResultBuilder = class extends TypeBuilder {
	ok;
	err;
	constructor(ok, err) {
		super(Result.getAlgebraicType(ok.algebraicType, err.algebraicType));
		this.ok = ok;
		this.err = err;
	}
	default(value) {
		return new ResultColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
};
var UnitBuilder = class extends TypeBuilder {
	constructor() {
		super({
			tag: "Product",
			value: { elements: [] }
		});
	}
};
var RowBuilder = class extends TypeBuilder {
	row;
	typeName;
	constructor(row, name) {
		const mappedRow = Object.fromEntries(Object.entries(row).map(([colName, builder]) => [colName, builder instanceof ColumnBuilder ? builder : new ColumnBuilder(builder, {})]));
		const elements = Object.keys(mappedRow).map((name2) => ({
			name: name2,
			get algebraicType() {
				return mappedRow[name2].typeBuilder.algebraicType;
			}
		}));
		super(AlgebraicType.Product({ elements }));
		this.row = mappedRow;
		this.typeName = name;
	}
};
var SumBuilderImpl = class extends TypeBuilder {
	variants;
	typeName;
	constructor(variants, name) {
		function variantsArrayFromVariantsObj(variants2) {
			return Object.keys(variants2).map((key) => ({
				name: key,
				get algebraicType() {
					return variants2[key].algebraicType;
				}
			}));
		}
		super(AlgebraicType.Sum({ variants: variantsArrayFromVariantsObj(variants) }));
		this.variants = variants;
		this.typeName = name;
		for (const key of Object.keys(variants)) {
			const desc = Object.getOwnPropertyDescriptor(variants, key);
			const isAccessor = !!desc && (typeof desc.get === "function" || typeof desc.set === "function");
			let isUnit2 = false;
			if (!isAccessor) isUnit2 = variants[key] instanceof UnitBuilder;
			if (isUnit2) {
				const constant = this.create(key);
				Object.defineProperty(this, key, {
					value: constant,
					writable: false,
					enumerable: true,
					configurable: false
				});
			} else {
				const fn = ((value) => this.create(key, value));
				Object.defineProperty(this, key, {
					value: fn,
					writable: false,
					enumerable: true,
					configurable: false
				});
			}
		}
	}
	create(tag, value) {
		return value === void 0 ? { tag } : {
			tag,
			value
		};
	}
	default(value) {
		return new SumColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new SumColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var SumBuilder = SumBuilderImpl;
var SimpleSumBuilderImpl = class extends SumBuilderImpl {
	index(algorithm = "btree") {
		return new SimpleSumColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	primaryKey() {
		return new SimpleSumColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
};
var ScheduleAtBuilder = class extends TypeBuilder {
	constructor() {
		super(schedule_at_default.getAlgebraicType());
	}
	default(value) {
		return new ScheduleAtColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new ScheduleAtColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var IdentityBuilder = class extends TypeBuilder {
	constructor() {
		super(Identity.getAlgebraicType());
	}
	index(algorithm = "btree") {
		return new IdentityColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new IdentityColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new IdentityColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new IdentityColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new IdentityColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new IdentityColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var ConnectionIdBuilder = class extends TypeBuilder {
	constructor() {
		super(ConnectionId.getAlgebraicType());
	}
	index(algorithm = "btree") {
		return new ConnectionIdColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new ConnectionIdColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new ConnectionIdColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new ConnectionIdColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new ConnectionIdColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new ConnectionIdColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var TimestampBuilder = class extends TypeBuilder {
	constructor() {
		super(Timestamp.getAlgebraicType());
	}
	index(algorithm = "btree") {
		return new TimestampColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new TimestampColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new TimestampColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new TimestampColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new TimestampColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new TimestampColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var TimeDurationBuilder = class extends TypeBuilder {
	constructor() {
		super(TimeDuration.getAlgebraicType());
	}
	index(algorithm = "btree") {
		return new TimeDurationColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new TimeDurationColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new TimeDurationColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new TimeDurationColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new TimeDurationColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new TimeDurationColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var UuidBuilder = class extends TypeBuilder {
	constructor() {
		super(Uuid.getAlgebraicType());
	}
	index(algorithm = "btree") {
		return new UuidColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new UuidColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new UuidColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new UuidColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new UuidColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new UuidColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var defaultMetadata = {};
var ColumnBuilder = class {
	typeBuilder;
	columnMetadata;
	constructor(typeBuilder, metadata) {
		this.typeBuilder = typeBuilder;
		this.columnMetadata = metadata;
	}
	serialize(writer, value) {
		this.typeBuilder.serialize(writer, value);
	}
	deserialize(reader) {
		return this.typeBuilder.deserialize(reader);
	}
};
var U8ColumnBuilder = class _U8ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _U8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _U8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _U8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _U8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _U8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _U8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var U16ColumnBuilder = class _U16ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _U16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _U16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _U16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _U16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _U16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _U16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var U32ColumnBuilder = class _U32ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _U32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _U32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _U32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _U32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _U32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _U32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var U64ColumnBuilder = class _U64ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _U64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _U64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _U64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _U64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _U64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _U64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var U128ColumnBuilder = class _U128ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _U128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _U128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _U128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _U128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _U128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _U128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var U256ColumnBuilder = class _U256ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _U256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _U256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _U256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _U256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _U256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _U256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var I8ColumnBuilder = class _I8ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _I8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _I8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _I8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _I8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _I8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _I8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var I16ColumnBuilder = class _I16ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _I16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _I16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _I16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _I16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _I16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _I16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var I32ColumnBuilder = class _I32ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _I32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _I32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _I32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _I32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _I32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _I32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var I64ColumnBuilder = class _I64ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _I64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _I64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _I64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _I64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _I64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _I64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var I128ColumnBuilder = class _I128ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _I128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _I128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _I128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _I128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _I128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _I128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var I256ColumnBuilder = class _I256ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _I256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _I256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _I256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _I256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _I256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _I256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var F32ColumnBuilder = class _F32ColumnBuilder extends ColumnBuilder {
	default(value) {
		return new _F32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _F32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var F64ColumnBuilder = class _F64ColumnBuilder extends ColumnBuilder {
	default(value) {
		return new _F64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _F64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var BoolColumnBuilder = class _BoolColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _BoolColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _BoolColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _BoolColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	default(value) {
		return new _BoolColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _BoolColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var StringColumnBuilder = class _StringColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _StringColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _StringColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _StringColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	default(value) {
		return new _StringColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _StringColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var ArrayColumnBuilder = class _ArrayColumnBuilder extends ColumnBuilder {
	default(value) {
		return new _ArrayColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _ArrayColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var ByteArrayColumnBuilder = class _ByteArrayColumnBuilder extends ColumnBuilder {
	constructor(metadata) {
		super(new TypeBuilder(AlgebraicType.Array(AlgebraicType.U8)), metadata);
	}
	default(value) {
		return new _ByteArrayColumnBuilder(set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _ByteArrayColumnBuilder(set(this.columnMetadata, { name }));
	}
};
var OptionColumnBuilder = class _OptionColumnBuilder extends ColumnBuilder {
	default(value) {
		return new _OptionColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _OptionColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var ResultColumnBuilder = class _ResultColumnBuilder extends ColumnBuilder {
	constructor(typeBuilder, metadata) {
		super(typeBuilder, metadata);
	}
	default(value) {
		return new _ResultColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
};
var ProductColumnBuilder = class _ProductColumnBuilder extends ColumnBuilder {
	default(value) {
		return new _ProductColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _ProductColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var SumColumnBuilder = class _SumColumnBuilder extends ColumnBuilder {
	default(value) {
		return new _SumColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _SumColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var SimpleSumColumnBuilder = class _SimpleSumColumnBuilder extends SumColumnBuilder {
	index(algorithm = "btree") {
		return new _SimpleSumColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	primaryKey() {
		return new _SimpleSumColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
};
var ScheduleAtColumnBuilder = class _ScheduleAtColumnBuilder extends ColumnBuilder {
	default(value) {
		return new _ScheduleAtColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _ScheduleAtColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var IdentityColumnBuilder = class _IdentityColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _IdentityColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _IdentityColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _IdentityColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	default(value) {
		return new _IdentityColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _IdentityColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var ConnectionIdColumnBuilder = class _ConnectionIdColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _ConnectionIdColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _ConnectionIdColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _ConnectionIdColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	default(value) {
		return new _ConnectionIdColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _ConnectionIdColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var TimestampColumnBuilder = class _TimestampColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _TimestampColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _TimestampColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _TimestampColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	default(value) {
		return new _TimestampColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _TimestampColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var TimeDurationColumnBuilder = class _TimeDurationColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _TimeDurationColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _TimeDurationColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _TimeDurationColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	default(value) {
		return new _TimeDurationColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _TimeDurationColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var UuidColumnBuilder = class _UuidColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _UuidColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _UuidColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _UuidColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	default(value) {
		return new _UuidColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _UuidColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var RefBuilder = class extends TypeBuilder {
	ref;
	/** The phantom type of the pointee of this ref. */
	__spacetimeType;
	constructor(ref) {
		super(AlgebraicType.Ref(ref));
		this.ref = ref;
	}
};
var enumImpl = ((nameOrObj, maybeObj) => {
	let obj = nameOrObj;
	let name = void 0;
	if (typeof nameOrObj === "string") {
		if (!maybeObj) throw new TypeError("When providing a name, you must also provide the variants object or array.");
		obj = maybeObj;
		name = nameOrObj;
	}
	if (Array.isArray(obj)) {
		const simpleVariantsObj = {};
		for (const variant of obj) simpleVariantsObj[variant] = new UnitBuilder();
		return new SimpleSumBuilderImpl(simpleVariantsObj, name);
	}
	return new SumBuilder(obj, name);
});
var t = {
	bool: () => new BoolBuilder(),
	string: () => new StringBuilder(),
	number: () => new F64Builder(),
	i8: () => new I8Builder(),
	u8: () => new U8Builder(),
	i16: () => new I16Builder(),
	u16: () => new U16Builder(),
	i32: () => new I32Builder(),
	u32: () => new U32Builder(),
	i64: () => new I64Builder(),
	u64: () => new U64Builder(),
	i128: () => new I128Builder(),
	u128: () => new U128Builder(),
	i256: () => new I256Builder(),
	u256: () => new U256Builder(),
	f32: () => new F32Builder(),
	f64: () => new F64Builder(),
	object: ((nameOrObj, maybeObj) => {
		if (typeof nameOrObj === "string") {
			if (!maybeObj) throw new TypeError("When providing a name, you must also provide the object.");
			return new ProductBuilder(maybeObj, nameOrObj);
		}
		return new ProductBuilder(nameOrObj, void 0);
	}),
	row: ((nameOrObj, maybeObj) => {
		const [obj, name] = typeof nameOrObj === "string" ? [maybeObj, nameOrObj] : [nameOrObj, void 0];
		return new RowBuilder(obj, name);
	}),
	array(e) {
		return new ArrayBuilder(e);
	},
	enum: enumImpl,
	unit() {
		return new UnitBuilder();
	},
	lazy(thunk) {
		let cached = null;
		const get = () => cached ??= thunk();
		return new Proxy({}, {
			get(_t, prop, recv) {
				const target = get();
				const val = Reflect.get(target, prop, recv);
				return typeof val === "function" ? val.bind(target) : val;
			},
			set(_t, prop, value, recv) {
				return Reflect.set(get(), prop, value, recv);
			},
			has(_t, prop) {
				return prop in get();
			},
			ownKeys() {
				return Reflect.ownKeys(get());
			},
			getOwnPropertyDescriptor(_t, prop) {
				return Object.getOwnPropertyDescriptor(get(), prop);
			},
			getPrototypeOf() {
				return Object.getPrototypeOf(get());
			}
		});
	},
	scheduleAt: () => {
		return new ScheduleAtBuilder();
	},
	option(value) {
		return new OptionBuilder(value);
	},
	result(ok, err) {
		return new ResultBuilder(ok, err);
	},
	identity: () => {
		return new IdentityBuilder();
	},
	connectionId: () => {
		return new ConnectionIdBuilder();
	},
	timestamp: () => {
		return new TimestampBuilder();
	},
	timeDuration: () => {
		return new TimeDurationBuilder();
	},
	uuid: () => {
		return new UuidBuilder();
	},
	byteArray: () => {
		return new ByteArrayBuilder();
	}
};
var AlgebraicType2 = t.enum("AlgebraicType", {
	Ref: t.u32(),
	get Sum() {
		return SumType2;
	},
	get Product() {
		return ProductType2;
	},
	get Array() {
		return AlgebraicType2;
	},
	String: t.unit(),
	Bool: t.unit(),
	I8: t.unit(),
	U8: t.unit(),
	I16: t.unit(),
	U16: t.unit(),
	I32: t.unit(),
	U32: t.unit(),
	I64: t.unit(),
	U64: t.unit(),
	I128: t.unit(),
	U128: t.unit(),
	I256: t.unit(),
	U256: t.unit(),
	F32: t.unit(),
	F64: t.unit()
});
var CaseConversionPolicy = t.enum("CaseConversionPolicy", {
	None: t.unit(),
	SnakeCase: t.unit()
});
var ExplicitNameEntry = t.enum("ExplicitNameEntry", {
	get Table() {
		return NameMapping;
	},
	get Function() {
		return NameMapping;
	},
	get Index() {
		return NameMapping;
	}
});
var ExplicitNames = t.object("ExplicitNames", { get entries() {
	return t.array(ExplicitNameEntry);
} });
var FunctionVisibility = t.enum("FunctionVisibility", {
	Private: t.unit(),
	ClientCallable: t.unit()
});
var HttpHeaderPair = t.object("HttpHeaderPair", {
	name: t.string(),
	value: t.byteArray()
});
var HttpHeaders = t.object("HttpHeaders", { get entries() {
	return t.array(HttpHeaderPair);
} });
var HttpMethod = t.enum("HttpMethod", {
	Get: t.unit(),
	Head: t.unit(),
	Post: t.unit(),
	Put: t.unit(),
	Delete: t.unit(),
	Connect: t.unit(),
	Options: t.unit(),
	Trace: t.unit(),
	Patch: t.unit(),
	Extension: t.string()
});
var HttpRequest = t.object("HttpRequest", {
	get method() {
		return HttpMethod;
	},
	get headers() {
		return HttpHeaders;
	},
	timeout: t.option(t.timeDuration()),
	uri: t.string(),
	get version() {
		return HttpVersion;
	}
});
var HttpResponse = t.object("HttpResponse", {
	get headers() {
		return HttpHeaders;
	},
	get version() {
		return HttpVersion;
	},
	code: t.u16()
});
var HttpVersion = t.enum("HttpVersion", {
	Http09: t.unit(),
	Http10: t.unit(),
	Http11: t.unit(),
	Http2: t.unit(),
	Http3: t.unit()
});
var IndexType = t.enum("IndexType", {
	BTree: t.unit(),
	Hash: t.unit()
});
var Lifecycle = t.enum("Lifecycle", {
	Init: t.unit(),
	OnConnect: t.unit(),
	OnDisconnect: t.unit()
});
var MiscModuleExport = t.enum("MiscModuleExport", { get TypeAlias() {
	return TypeAlias;
} });
var NameMapping = t.object("NameMapping", {
	sourceName: t.string(),
	canonicalName: t.string()
});
var ProductType2 = t.object("ProductType", { get elements() {
	return t.array(ProductTypeElement);
} });
var ProductTypeElement = t.object("ProductTypeElement", {
	name: t.option(t.string()),
	get algebraicType() {
		return AlgebraicType2;
	}
});
var RawColumnDefV8 = t.object("RawColumnDefV8", {
	colName: t.string(),
	get colType() {
		return AlgebraicType2;
	}
});
var RawColumnDefaultValueV10 = t.object("RawColumnDefaultValueV10", {
	colId: t.u16(),
	value: t.byteArray()
});
var RawColumnDefaultValueV9 = t.object("RawColumnDefaultValueV9", {
	table: t.string(),
	colId: t.u16(),
	value: t.byteArray()
});
var RawConstraintDataV9 = t.enum("RawConstraintDataV9", { get Unique() {
	return RawUniqueConstraintDataV9;
} });
var RawConstraintDefV10 = t.object("RawConstraintDefV10", {
	sourceName: t.option(t.string()),
	get data() {
		return RawConstraintDataV9;
	}
});
var RawConstraintDefV8 = t.object("RawConstraintDefV8", {
	constraintName: t.string(),
	constraints: t.u8(),
	columns: t.array(t.u16())
});
var RawConstraintDefV9 = t.object("RawConstraintDefV9", {
	name: t.option(t.string()),
	get data() {
		return RawConstraintDataV9;
	}
});
var RawIndexAlgorithm = t.enum("RawIndexAlgorithm", {
	BTree: t.array(t.u16()),
	Hash: t.array(t.u16()),
	Direct: t.u16()
});
var RawIndexDefV10 = t.object("RawIndexDefV10", {
	sourceName: t.option(t.string()),
	accessorName: t.option(t.string()),
	get algorithm() {
		return RawIndexAlgorithm;
	}
});
var RawIndexDefV8 = t.object("RawIndexDefV8", {
	indexName: t.string(),
	isUnique: t.bool(),
	get indexType() {
		return IndexType;
	},
	columns: t.array(t.u16())
});
var RawIndexDefV9 = t.object("RawIndexDefV9", {
	name: t.option(t.string()),
	accessorName: t.option(t.string()),
	get algorithm() {
		return RawIndexAlgorithm;
	}
});
var RawLifeCycleReducerDefV10 = t.object("RawLifeCycleReducerDefV10", {
	get lifecycleSpec() {
		return Lifecycle;
	},
	functionName: t.string()
});
var RawMiscModuleExportV9 = t.enum("RawMiscModuleExportV9", {
	get ColumnDefaultValue() {
		return RawColumnDefaultValueV9;
	},
	get Procedure() {
		return RawProcedureDefV9;
	},
	get View() {
		return RawViewDefV9;
	}
});
var RawModuleDef = t.enum("RawModuleDef", {
	get V8BackCompat() {
		return RawModuleDefV8;
	},
	get V9() {
		return RawModuleDefV9;
	},
	get V10() {
		return RawModuleDefV10;
	}
});
var RawModuleDefV10 = t.object("RawModuleDefV10", { get sections() {
	return t.array(RawModuleDefV10Section);
} });
var RawModuleDefV10Section = t.enum("RawModuleDefV10Section", {
	get Typespace() {
		return Typespace;
	},
	get Types() {
		return t.array(RawTypeDefV10);
	},
	get Tables() {
		return t.array(RawTableDefV10);
	},
	get Reducers() {
		return t.array(RawReducerDefV10);
	},
	get Procedures() {
		return t.array(RawProcedureDefV10);
	},
	get Views() {
		return t.array(RawViewDefV10);
	},
	get Schedules() {
		return t.array(RawScheduleDefV10);
	},
	get LifeCycleReducers() {
		return t.array(RawLifeCycleReducerDefV10);
	},
	get RowLevelSecurity() {
		return t.array(RawRowLevelSecurityDefV9);
	},
	get CaseConversionPolicy() {
		return CaseConversionPolicy;
	},
	get ExplicitNames() {
		return ExplicitNames;
	}
});
var RawModuleDefV8 = t.object("RawModuleDefV8", {
	get typespace() {
		return Typespace;
	},
	get tables() {
		return t.array(TableDesc);
	},
	get reducers() {
		return t.array(ReducerDef);
	},
	get miscExports() {
		return t.array(MiscModuleExport);
	}
});
var RawModuleDefV9 = t.object("RawModuleDefV9", {
	get typespace() {
		return Typespace;
	},
	get tables() {
		return t.array(RawTableDefV9);
	},
	get reducers() {
		return t.array(RawReducerDefV9);
	},
	get types() {
		return t.array(RawTypeDefV9);
	},
	get miscExports() {
		return t.array(RawMiscModuleExportV9);
	},
	get rowLevelSecurity() {
		return t.array(RawRowLevelSecurityDefV9);
	}
});
var RawProcedureDefV10 = t.object("RawProcedureDefV10", {
	sourceName: t.string(),
	get params() {
		return ProductType2;
	},
	get returnType() {
		return AlgebraicType2;
	},
	get visibility() {
		return FunctionVisibility;
	}
});
var RawProcedureDefV9 = t.object("RawProcedureDefV9", {
	name: t.string(),
	get params() {
		return ProductType2;
	},
	get returnType() {
		return AlgebraicType2;
	}
});
var RawReducerDefV10 = t.object("RawReducerDefV10", {
	sourceName: t.string(),
	get params() {
		return ProductType2;
	},
	get visibility() {
		return FunctionVisibility;
	},
	get okReturnType() {
		return AlgebraicType2;
	},
	get errReturnType() {
		return AlgebraicType2;
	}
});
var RawReducerDefV9 = t.object("RawReducerDefV9", {
	name: t.string(),
	get params() {
		return ProductType2;
	},
	get lifecycle() {
		return t.option(Lifecycle);
	}
});
var RawRowLevelSecurityDefV9 = t.object("RawRowLevelSecurityDefV9", { sql: t.string() });
var RawScheduleDefV10 = t.object("RawScheduleDefV10", {
	sourceName: t.option(t.string()),
	tableName: t.string(),
	scheduleAtCol: t.u16(),
	functionName: t.string()
});
var RawScheduleDefV9 = t.object("RawScheduleDefV9", {
	name: t.option(t.string()),
	reducerName: t.string(),
	scheduledAtColumn: t.u16()
});
var RawScopedTypeNameV10 = t.object("RawScopedTypeNameV10", {
	scope: t.array(t.string()),
	sourceName: t.string()
});
var RawScopedTypeNameV9 = t.object("RawScopedTypeNameV9", {
	scope: t.array(t.string()),
	name: t.string()
});
var RawSequenceDefV10 = t.object("RawSequenceDefV10", {
	sourceName: t.option(t.string()),
	column: t.u16(),
	start: t.option(t.i128()),
	minValue: t.option(t.i128()),
	maxValue: t.option(t.i128()),
	increment: t.i128()
});
var RawSequenceDefV8 = t.object("RawSequenceDefV8", {
	sequenceName: t.string(),
	colPos: t.u16(),
	increment: t.i128(),
	start: t.option(t.i128()),
	minValue: t.option(t.i128()),
	maxValue: t.option(t.i128()),
	allocated: t.i128()
});
var RawSequenceDefV9 = t.object("RawSequenceDefV9", {
	name: t.option(t.string()),
	column: t.u16(),
	start: t.option(t.i128()),
	minValue: t.option(t.i128()),
	maxValue: t.option(t.i128()),
	increment: t.i128()
});
var RawTableDefV10 = t.object("RawTableDefV10", {
	sourceName: t.string(),
	productTypeRef: t.u32(),
	primaryKey: t.array(t.u16()),
	get indexes() {
		return t.array(RawIndexDefV10);
	},
	get constraints() {
		return t.array(RawConstraintDefV10);
	},
	get sequences() {
		return t.array(RawSequenceDefV10);
	},
	get tableType() {
		return TableType;
	},
	get tableAccess() {
		return TableAccess;
	},
	get defaultValues() {
		return t.array(RawColumnDefaultValueV10);
	},
	isEvent: t.bool()
});
var RawTableDefV8 = t.object("RawTableDefV8", {
	tableName: t.string(),
	get columns() {
		return t.array(RawColumnDefV8);
	},
	get indexes() {
		return t.array(RawIndexDefV8);
	},
	get constraints() {
		return t.array(RawConstraintDefV8);
	},
	get sequences() {
		return t.array(RawSequenceDefV8);
	},
	tableType: t.string(),
	tableAccess: t.string(),
	scheduled: t.option(t.string())
});
var RawTableDefV9 = t.object("RawTableDefV9", {
	name: t.string(),
	productTypeRef: t.u32(),
	primaryKey: t.array(t.u16()),
	get indexes() {
		return t.array(RawIndexDefV9);
	},
	get constraints() {
		return t.array(RawConstraintDefV9);
	},
	get sequences() {
		return t.array(RawSequenceDefV9);
	},
	get schedule() {
		return t.option(RawScheduleDefV9);
	},
	get tableType() {
		return TableType;
	},
	get tableAccess() {
		return TableAccess;
	}
});
var RawTypeDefV10 = t.object("RawTypeDefV10", {
	get sourceName() {
		return RawScopedTypeNameV10;
	},
	ty: t.u32(),
	customOrdering: t.bool()
});
var RawTypeDefV9 = t.object("RawTypeDefV9", {
	get name() {
		return RawScopedTypeNameV9;
	},
	ty: t.u32(),
	customOrdering: t.bool()
});
var RawUniqueConstraintDataV9 = t.object("RawUniqueConstraintDataV9", { columns: t.array(t.u16()) });
var RawViewDefV10 = t.object("RawViewDefV10", {
	sourceName: t.string(),
	index: t.u32(),
	isPublic: t.bool(),
	isAnonymous: t.bool(),
	get params() {
		return ProductType2;
	},
	get returnType() {
		return AlgebraicType2;
	}
});
var RawViewDefV9 = t.object("RawViewDefV9", {
	name: t.string(),
	index: t.u32(),
	isPublic: t.bool(),
	isAnonymous: t.bool(),
	get params() {
		return ProductType2;
	},
	get returnType() {
		return AlgebraicType2;
	}
});
var ReducerDef = t.object("ReducerDef", {
	name: t.string(),
	get args() {
		return t.array(ProductTypeElement);
	}
});
var SumType2 = t.object("SumType", { get variants() {
	return t.array(SumTypeVariant);
} });
var SumTypeVariant = t.object("SumTypeVariant", {
	name: t.option(t.string()),
	get algebraicType() {
		return AlgebraicType2;
	}
});
var TableAccess = t.enum("TableAccess", {
	Public: t.unit(),
	Private: t.unit()
});
var TableDesc = t.object("TableDesc", {
	get schema() {
		return RawTableDefV8;
	},
	data: t.u32()
});
var TableType = t.enum("TableType", {
	System: t.unit(),
	User: t.unit()
});
var TypeAlias = t.object("TypeAlias", {
	name: t.string(),
	ty: t.u32()
});
var Typespace = t.object("Typespace", { get types() {
	return t.array(AlgebraicType2);
} });
var ViewResultHeader = t.enum("ViewResultHeader", {
	RowData: t.unit(),
	RawSql: t.string()
});
function tableToSchema(accName, schema2, tableDef) {
	const getColName = (i) => schema2.rowType.algebraicType.value.elements[i].name;
	return {
		sourceName: schema2.tableName || accName,
		accessorName: accName,
		columns: schema2.rowType.row,
		rowType: schema2.rowSpacetimeType,
		constraints: tableDef.constraints.map((c) => ({
			name: c.sourceName,
			constraint: "unique",
			columns: c.data.value.columns.map(getColName)
		})),
		indexes: tableDef.indexes.map((idx) => {
			const columnIds = idx.algorithm.tag === "Direct" ? [idx.algorithm.value] : idx.algorithm.value;
			return {
				name: idx.accessorName,
				unique: tableDef.constraints.some((c) => c.data.value.columns.every((col) => columnIds.includes(col))),
				algorithm: idx.algorithm.tag.toLowerCase(),
				columns: columnIds.map(getColName)
			};
		}),
		tableDef,
		...tableDef.isEvent ? { isEvent: true } : {}
	};
}
var ModuleContext = class {
	#compoundTypes = /* @__PURE__ */ new Map();
	/**
	* The global module definition that gets populated by calls to `reducer()` and lifecycle hooks.
	*/
	#moduleDef = {
		typespace: { types: [] },
		tables: [],
		reducers: [],
		types: [],
		rowLevelSecurity: [],
		schedules: [],
		procedures: [],
		views: [],
		lifeCycleReducers: [],
		caseConversionPolicy: { tag: "SnakeCase" },
		explicitNames: { entries: [] }
	};
	get moduleDef() {
		return this.#moduleDef;
	}
	rawModuleDefV10() {
		const sections = [];
		const push = (s) => {
			if (s) sections.push(s);
		};
		const module = this.#moduleDef;
		push(module.typespace && {
			tag: "Typespace",
			value: module.typespace
		});
		push(module.types && {
			tag: "Types",
			value: module.types
		});
		push(module.tables && {
			tag: "Tables",
			value: module.tables
		});
		push(module.reducers && {
			tag: "Reducers",
			value: module.reducers
		});
		push(module.procedures && {
			tag: "Procedures",
			value: module.procedures
		});
		push(module.views && {
			tag: "Views",
			value: module.views
		});
		push(module.schedules && {
			tag: "Schedules",
			value: module.schedules
		});
		push(module.lifeCycleReducers && {
			tag: "LifeCycleReducers",
			value: module.lifeCycleReducers
		});
		push(module.rowLevelSecurity && {
			tag: "RowLevelSecurity",
			value: module.rowLevelSecurity
		});
		push(module.explicitNames && {
			tag: "ExplicitNames",
			value: module.explicitNames
		});
		push(module.caseConversionPolicy && {
			tag: "CaseConversionPolicy",
			value: module.caseConversionPolicy
		});
		return { sections };
	}
	/**
	* Set the case conversion policy for this module.
	* Called by the settings mechanism.
	*/
	setCaseConversionPolicy(policy) {
		this.#moduleDef.caseConversionPolicy = policy;
	}
	get typespace() {
		return this.#moduleDef.typespace;
	}
	/**
	* Resolves the actual type of a TypeBuilder by following its references until it reaches a non-ref type.
	* @param typespace The typespace to resolve types against.
	* @param typeBuilder The TypeBuilder to resolve.
	* @returns The resolved algebraic type.
	*/
	resolveType(typeBuilder) {
		let ty = typeBuilder.algebraicType;
		while (ty.tag === "Ref") ty = this.typespace.types[ty.value];
		return ty;
	}
	/**
	* Adds a type to the module definition's typespace as a `Ref` if it is a named compound type (Product or Sum).
	* Otherwise, returns the type as is.
	* @param name
	* @param ty
	* @returns
	*/
	registerTypesRecursively(typeBuilder) {
		if (typeBuilder instanceof ProductBuilder && !isUnit(typeBuilder) || typeBuilder instanceof SumBuilder || typeBuilder instanceof RowBuilder) return this.#registerCompoundTypeRecursively(typeBuilder);
		else if (typeBuilder instanceof OptionBuilder) return new OptionBuilder(this.registerTypesRecursively(typeBuilder.value));
		else if (typeBuilder instanceof ResultBuilder) return new ResultBuilder(this.registerTypesRecursively(typeBuilder.ok), this.registerTypesRecursively(typeBuilder.err));
		else if (typeBuilder instanceof ArrayBuilder) return new ArrayBuilder(this.registerTypesRecursively(typeBuilder.element));
		else return typeBuilder;
	}
	#registerCompoundTypeRecursively(typeBuilder) {
		const ty = typeBuilder.algebraicType;
		const name = typeBuilder.typeName;
		if (name === void 0) throw new Error(`Missing type name for ${typeBuilder.constructor.name ?? "TypeBuilder"} ${JSON.stringify(typeBuilder)}`);
		let r = this.#compoundTypes.get(ty);
		if (r != null) return r;
		const newTy = typeBuilder instanceof RowBuilder || typeBuilder instanceof ProductBuilder ? {
			tag: "Product",
			value: { elements: [] }
		} : {
			tag: "Sum",
			value: { variants: [] }
		};
		r = new RefBuilder(this.#moduleDef.typespace.types.length);
		this.#moduleDef.typespace.types.push(newTy);
		this.#compoundTypes.set(ty, r);
		if (typeBuilder instanceof RowBuilder) for (const [name2, elem] of Object.entries(typeBuilder.row)) newTy.value.elements.push({
			name: name2,
			algebraicType: this.registerTypesRecursively(elem.typeBuilder).algebraicType
		});
		else if (typeBuilder instanceof ProductBuilder) for (const [name2, elem] of Object.entries(typeBuilder.elements)) newTy.value.elements.push({
			name: name2,
			algebraicType: this.registerTypesRecursively(elem).algebraicType
		});
		else if (typeBuilder instanceof SumBuilder) for (const [name2, variant] of Object.entries(typeBuilder.variants)) newTy.value.variants.push({
			name: name2,
			algebraicType: this.registerTypesRecursively(variant).algebraicType
		});
		this.#moduleDef.types.push({
			sourceName: splitName(name),
			ty: r.ref,
			customOrdering: true
		});
		return r;
	}
};
function isUnit(typeBuilder) {
	return typeBuilder.typeName == null && typeBuilder.algebraicType.value.elements.length === 0;
}
function splitName(name) {
	const scope = name.split(".");
	return {
		sourceName: scope.pop(),
		scope
	};
}
var import_statuses = __toESM(require_statuses());
var Range = class {
	#from;
	#to;
	constructor(from, to) {
		this.#from = from ?? { tag: "unbounded" };
		this.#to = to ?? { tag: "unbounded" };
	}
	get from() {
		return this.#from;
	}
	get to() {
		return this.#to;
	}
};
function table(opts, row, ..._) {
	const { name, public: isPublic = false, indexes: userIndexes = [], scheduled, event: isEvent = false } = opts;
	const colIds = /* @__PURE__ */ new Map();
	const colNameList = [];
	if (!(row instanceof RowBuilder)) row = new RowBuilder(row);
	row.algebraicType.value.elements.forEach((elem, i) => {
		colIds.set(elem.name, i);
		colNameList.push(elem.name);
	});
	const pk = [];
	const indexes = [];
	const constraints = [];
	const sequences = [];
	let scheduleAtCol;
	const defaultValues = [];
	for (const [name2, builder] of Object.entries(row.row)) {
		const meta = builder.columnMetadata;
		if (meta.isPrimaryKey) pk.push(colIds.get(name2));
		const isUnique = meta.isUnique || meta.isPrimaryKey;
		if (meta.indexType || isUnique) {
			const algo = meta.indexType ?? "btree";
			const id = colIds.get(name2);
			let algorithm;
			switch (algo) {
				case "btree":
					algorithm = RawIndexAlgorithm.BTree([id]);
					break;
				case "hash":
					algorithm = RawIndexAlgorithm.Hash([id]);
					break;
				case "direct":
					algorithm = RawIndexAlgorithm.Direct(id);
					break;
			}
			indexes.push({
				sourceName: void 0,
				accessorName: name2,
				algorithm
			});
		}
		if (isUnique) constraints.push({
			sourceName: void 0,
			data: {
				tag: "Unique",
				value: { columns: [colIds.get(name2)] }
			}
		});
		if (meta.isAutoIncrement) sequences.push({
			sourceName: void 0,
			start: void 0,
			minValue: void 0,
			maxValue: void 0,
			column: colIds.get(name2),
			increment: 1n
		});
		if (meta.defaultValue) {
			const writer = new BinaryWriter(16);
			builder.serialize(writer, meta.defaultValue);
			defaultValues.push({
				colId: colIds.get(name2),
				value: writer.getBuffer()
			});
		}
		if (scheduled) {
			const algebraicType = builder.typeBuilder.algebraicType;
			if (schedule_at_default.isScheduleAt(algebraicType)) scheduleAtCol = colIds.get(name2);
		}
	}
	for (const indexOpts of userIndexes ?? []) {
		let algorithm;
		switch (indexOpts.algorithm) {
			case "btree":
				algorithm = {
					tag: "BTree",
					value: indexOpts.columns.map((c) => colIds.get(c))
				};
				break;
			case "hash":
				algorithm = {
					tag: "Hash",
					value: indexOpts.columns.map((c) => colIds.get(c))
				};
				break;
			case "direct":
				algorithm = {
					tag: "Direct",
					value: colIds.get(indexOpts.column)
				};
				break;
		}
		indexes.push({
			sourceName: void 0,
			accessorName: indexOpts.accessor,
			algorithm,
			canonicalName: indexOpts.name
		});
	}
	for (const constraintOpts of opts.constraints ?? []) if (constraintOpts.constraint === "unique") {
		const data = {
			tag: "Unique",
			value: { columns: constraintOpts.columns.map((c) => colIds.get(c)) }
		};
		constraints.push({
			sourceName: constraintOpts.name,
			data
		});
		continue;
	}
	const productType = row.algebraicType.value;
	return {
		rowType: row,
		tableName: name,
		rowSpacetimeType: productType,
		tableDef: (ctx, accName) => {
			const tableName = name ?? accName;
			if (row.typeName === void 0) row.typeName = toPascalCase(tableName);
			for (const index of indexes) {
				const sourceName = index.sourceName = `${accName}_${(index.algorithm.tag === "Direct" ? [index.algorithm.value] : index.algorithm.value).map((i) => colNameList[i]).join("_")}_idx_${index.algorithm.tag.toLowerCase()}`;
				const { canonicalName } = index;
				if (canonicalName !== void 0) ctx.moduleDef.explicitNames.entries.push(ExplicitNameEntry.Index({
					sourceName,
					canonicalName
				}));
			}
			return {
				sourceName: accName,
				productTypeRef: ctx.registerTypesRecursively(row).ref,
				primaryKey: pk,
				indexes,
				constraints,
				sequences,
				tableType: { tag: "User" },
				tableAccess: { tag: isPublic ? "Public" : "Private" },
				defaultValues,
				isEvent
			};
		},
		idxs: {},
		constraints,
		schedule: scheduled && scheduleAtCol !== void 0 ? {
			scheduleAtCol,
			reducer: scheduled
		} : void 0
	};
}
var QueryBrand = Symbol("QueryBrand");
var isRowTypedQuery = (val) => !!val && typeof val === "object" && QueryBrand in val;
function toSql(q) {
	return q.toSql();
}
var SemijoinImpl = class _SemijoinImpl {
	constructor(sourceQuery, filterQuery, joinCondition) {
		this.sourceQuery = sourceQuery;
		this.filterQuery = filterQuery;
		this.joinCondition = joinCondition;
		if (sourceQuery.table.sourceName === filterQuery.table.sourceName) throw new Error("Cannot semijoin a table to itself");
	}
	[QueryBrand] = true;
	type = "semijoin";
	build() {
		return this;
	}
	where(predicate) {
		return new _SemijoinImpl(this.sourceQuery.where(predicate), this.filterQuery, this.joinCondition);
	}
	toSql() {
		const left = this.filterQuery;
		const right = this.sourceQuery;
		const leftTable = quoteIdentifier(left.table.sourceName);
		const rightTable = quoteIdentifier(right.table.sourceName);
		let sql = `SELECT ${rightTable}.* FROM ${leftTable} JOIN ${rightTable} ON ${booleanExprToSql(this.joinCondition)}`;
		const clauses = [];
		if (left.whereClause) clauses.push(booleanExprToSql(left.whereClause));
		if (right.whereClause) clauses.push(booleanExprToSql(right.whereClause));
		if (clauses.length > 0) {
			const whereSql = clauses.length === 1 ? clauses[0] : clauses.map(wrapInParens).join(" AND ");
			sql += ` WHERE ${whereSql}`;
		}
		return sql;
	}
};
var FromBuilder = class _FromBuilder {
	constructor(table2, whereClause) {
		this.table = table2;
		this.whereClause = whereClause;
	}
	[QueryBrand] = true;
	where(predicate) {
		const newCondition = predicate(this.table.cols);
		const nextWhere = this.whereClause ? this.whereClause.and(newCondition) : newCondition;
		return new _FromBuilder(this.table, nextWhere);
	}
	rightSemijoin(right, on) {
		const sourceQuery = new _FromBuilder(right);
		const joinCondition = on(this.table.indexedCols, right.indexedCols);
		return new SemijoinImpl(sourceQuery, this, joinCondition);
	}
	leftSemijoin(right, on) {
		const filterQuery = new _FromBuilder(right);
		const joinCondition = on(this.table.indexedCols, right.indexedCols);
		return new SemijoinImpl(this, filterQuery, joinCondition);
	}
	toSql() {
		return renderSelectSqlWithJoins(this.table, this.whereClause);
	}
	build() {
		return this;
	}
};
var TableRefImpl = class {
	[QueryBrand] = true;
	type = "table";
	sourceName;
	accessorName;
	cols;
	indexedCols;
	tableDef;
	get columns() {
		return this.tableDef.columns;
	}
	get indexes() {
		return this.tableDef.indexes;
	}
	get rowType() {
		return this.tableDef.rowType;
	}
	get constraints() {
		return this.tableDef.constraints;
	}
	constructor(tableDef) {
		this.sourceName = tableDef.sourceName;
		this.accessorName = tableDef.accessorName;
		this.cols = createRowExpr(tableDef);
		this.indexedCols = this.cols;
		this.tableDef = tableDef;
		Object.freeze(this);
	}
	asFrom() {
		return new FromBuilder(this);
	}
	rightSemijoin(other, on) {
		return this.asFrom().rightSemijoin(other, on);
	}
	leftSemijoin(other, on) {
		return this.asFrom().leftSemijoin(other, on);
	}
	build() {
		return this.asFrom().build();
	}
	toSql() {
		return this.asFrom().toSql();
	}
	where(predicate) {
		return this.asFrom().where(predicate);
	}
};
function createTableRefFromDef(tableDef) {
	return new TableRefImpl(tableDef);
}
function makeQueryBuilder(schema2) {
	const qb = /* @__PURE__ */ Object.create(null);
	for (const table2 of Object.values(schema2.tables)) {
		const ref = createTableRefFromDef(table2);
		qb[table2.accessorName] = ref;
	}
	return Object.freeze(qb);
}
function createRowExpr(tableDef) {
	const row = {};
	for (const columnName of Object.keys(tableDef.columns)) {
		const columnBuilder = tableDef.columns[columnName];
		const column = new ColumnExpression(tableDef.sourceName, columnName, columnBuilder.typeBuilder.algebraicType);
		row[columnName] = Object.freeze(column);
	}
	return Object.freeze(row);
}
function renderSelectSqlWithJoins(table2, where, extraClauses = []) {
	const sql = `SELECT * FROM ${quoteIdentifier(table2.sourceName)}`;
	const clauses = [];
	if (where) clauses.push(booleanExprToSql(where));
	clauses.push(...extraClauses);
	if (clauses.length === 0) return sql;
	return `${sql} WHERE ${clauses.length === 1 ? clauses[0] : clauses.map(wrapInParens).join(" AND ")}`;
}
var ColumnExpression = class {
	type = "column";
	column;
	table;
	tsValueType;
	spacetimeType;
	constructor(table2, column, spacetimeType) {
		this.table = table2;
		this.column = column;
		this.spacetimeType = spacetimeType;
	}
	eq(x) {
		return new BooleanExpr({
			type: "eq",
			left: this,
			right: normalizeValue(x)
		});
	}
	ne(x) {
		return new BooleanExpr({
			type: "ne",
			left: this,
			right: normalizeValue(x)
		});
	}
	lt(x) {
		return new BooleanExpr({
			type: "lt",
			left: this,
			right: normalizeValue(x)
		});
	}
	lte(x) {
		return new BooleanExpr({
			type: "lte",
			left: this,
			right: normalizeValue(x)
		});
	}
	gt(x) {
		return new BooleanExpr({
			type: "gt",
			left: this,
			right: normalizeValue(x)
		});
	}
	gte(x) {
		return new BooleanExpr({
			type: "gte",
			left: this,
			right: normalizeValue(x)
		});
	}
};
function literal(value) {
	return {
		type: "literal",
		value
	};
}
function normalizeValue(val) {
	if (val.type === "literal") return val;
	if (typeof val === "object" && val != null && "type" in val && val.type === "column") return val;
	return literal(val);
}
var BooleanExpr = class _BooleanExpr {
	constructor(data) {
		this.data = data;
	}
	and(other) {
		return new _BooleanExpr({
			type: "and",
			clauses: [this.data, other.data]
		});
	}
	or(other) {
		return new _BooleanExpr({
			type: "or",
			clauses: [this.data, other.data]
		});
	}
	not() {
		return new _BooleanExpr({
			type: "not",
			clause: this.data
		});
	}
};
function booleanExprToSql(expr, tableAlias) {
	const data = expr instanceof BooleanExpr ? expr.data : expr;
	switch (data.type) {
		case "eq": return `${valueExprToSql(data.left)} = ${valueExprToSql(data.right)}`;
		case "ne": return `${valueExprToSql(data.left)} <> ${valueExprToSql(data.right)}`;
		case "gt": return `${valueExprToSql(data.left)} > ${valueExprToSql(data.right)}`;
		case "gte": return `${valueExprToSql(data.left)} >= ${valueExprToSql(data.right)}`;
		case "lt": return `${valueExprToSql(data.left)} < ${valueExprToSql(data.right)}`;
		case "lte": return `${valueExprToSql(data.left)} <= ${valueExprToSql(data.right)}`;
		case "and": return data.clauses.map((c) => booleanExprToSql(c)).map(wrapInParens).join(" AND ");
		case "or": return data.clauses.map((c) => booleanExprToSql(c)).map(wrapInParens).join(" OR ");
		case "not": return `NOT ${wrapInParens(booleanExprToSql(data.clause))}`;
	}
}
function wrapInParens(sql) {
	return `(${sql})`;
}
function valueExprToSql(expr, tableAlias) {
	if (isLiteralExpr(expr)) return literalValueToSql(expr.value);
	const table2 = expr.table;
	return `${quoteIdentifier(table2)}.${quoteIdentifier(expr.column)}`;
}
function literalValueToSql(value) {
	if (value === null || value === void 0) return "NULL";
	if (value instanceof Identity || value instanceof ConnectionId) return `0x${value.toHexString()}`;
	if (value instanceof Timestamp) return `'${value.toISOString()}'`;
	switch (typeof value) {
		case "number":
		case "bigint": return String(value);
		case "boolean": return value ? "TRUE" : "FALSE";
		case "string": return `'${value.replace(/'/g, "''")}'`;
		default: return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
	}
}
function quoteIdentifier(name) {
	return `"${name.replace(/"/g, "\"\"")}"`;
}
function isLiteralExpr(expr) {
	return expr.type === "literal";
}
function makeViewExport(ctx, opts, params, ret, fn) {
	const viewExport = fn.bind();
	viewExport[exportContext] = ctx;
	viewExport[registerExport] = (ctx2, exportName) => {
		registerView(ctx2, opts, exportName, false, params, ret, fn);
	};
	return viewExport;
}
function makeAnonViewExport(ctx, opts, params, ret, fn) {
	const viewExport = fn.bind();
	viewExport[exportContext] = ctx;
	viewExport[registerExport] = (ctx2, exportName) => {
		registerView(ctx2, opts, exportName, true, params, ret, fn);
	};
	return viewExport;
}
function registerView(ctx, opts, exportName, anon, params, ret, fn) {
	const paramsBuilder = new RowBuilder(params, toPascalCase(exportName));
	let returnType = ctx.registerTypesRecursively(ret).algebraicType;
	const { typespace } = ctx;
	const { value: paramType } = ctx.resolveType(ctx.registerTypesRecursively(paramsBuilder));
	ctx.moduleDef.views.push({
		sourceName: exportName,
		index: (anon ? ctx.anonViews : ctx.views).length,
		isPublic: opts.public,
		isAnonymous: anon,
		params: paramType,
		returnType
	});
	if (opts.name != null) ctx.moduleDef.explicitNames.entries.push({
		tag: "Function",
		value: {
			sourceName: exportName,
			canonicalName: opts.name
		}
	});
	if (returnType.tag == "Sum") {
		const originalFn = fn;
		fn = ((ctx2, args) => {
			const ret2 = originalFn(ctx2, args);
			return ret2 == null ? [] : [ret2];
		});
		returnType = AlgebraicType.Array(returnType.value.variants[0].algebraicType);
	}
	(anon ? ctx.anonViews : ctx.views).push({
		fn,
		deserializeParams: ProductType.makeDeserializer(paramType, typespace),
		serializeReturn: AlgebraicType.makeSerializer(returnType, typespace),
		returnTypeBaseSize: bsatnBaseSize(typespace, returnType)
	});
}
var SenderError = class extends Error {
	constructor(message) {
		super(message);
	}
	get name() {
		return "SenderError";
	}
};
var SpacetimeHostError = class extends Error {
	constructor(message) {
		super(message);
	}
	get name() {
		return "SpacetimeHostError";
	}
};
var errorData = {
	HostCallFailure: 1,
	NotInTransaction: 2,
	BsatnDecodeError: 3,
	NoSuchTable: 4,
	NoSuchIndex: 5,
	NoSuchIter: 6,
	NoSuchConsoleTimer: 7,
	NoSuchBytes: 8,
	NoSpace: 9,
	BufferTooSmall: 11,
	UniqueAlreadyExists: 12,
	ScheduleAtDelayTooLong: 13,
	IndexNotUnique: 14,
	NoSuchRow: 15,
	AutoIncOverflow: 16,
	WouldBlockTransaction: 17,
	TransactionNotAnonymous: 18,
	TransactionIsReadOnly: 19,
	TransactionIsMut: 20,
	HttpError: 21
};
function mapEntries(x, f) {
	return Object.fromEntries(Object.entries(x).map(([k, v]) => [k, f(k, v)]));
}
var errnoToClass = /* @__PURE__ */ new Map();
var errors = Object.freeze(mapEntries(errorData, (name, code) => {
	const cls = Object.defineProperty(class extends SpacetimeHostError {
		get name() {
			return name;
		}
	}, "name", {
		value: name,
		writable: false
	});
	errnoToClass.set(code, cls);
	return cls;
}));
function getErrorConstructor(code) {
	return errnoToClass.get(code) ?? SpacetimeHostError;
}
var SBigInt = typeof BigInt !== "undefined" ? BigInt : void 0;
var One = typeof BigInt !== "undefined" ? BigInt(1) : void 0;
var ThirtyTwo = typeof BigInt !== "undefined" ? BigInt(32) : void 0;
var NumValues = typeof BigInt !== "undefined" ? BigInt(4294967296) : void 0;
function unsafeUniformBigIntDistribution(from, to, rng) {
	var diff = to - from + One;
	var FinalNumValues = NumValues;
	var NumIterations = 1;
	while (FinalNumValues < diff) {
		FinalNumValues <<= ThirtyTwo;
		++NumIterations;
	}
	var value = generateNext(NumIterations, rng);
	if (value < diff) return value + from;
	if (value + diff < FinalNumValues) return value % diff + from;
	var MaxAcceptedRandom = FinalNumValues - FinalNumValues % diff;
	while (value >= MaxAcceptedRandom) value = generateNext(NumIterations, rng);
	return value % diff + from;
}
function generateNext(NumIterations, rng) {
	var value = SBigInt(rng.unsafeNext() + 2147483648);
	for (var num = 1; num < NumIterations; ++num) {
		var out = rng.unsafeNext();
		value = (value << ThirtyTwo) + SBigInt(out + 2147483648);
	}
	return value;
}
function unsafeUniformIntDistributionInternal(rangeSize, rng) {
	var MaxAllowed = rangeSize > 2 ? ~~(4294967296 / rangeSize) * rangeSize : 4294967296;
	var deltaV = rng.unsafeNext() + 2147483648;
	while (deltaV >= MaxAllowed) deltaV = rng.unsafeNext() + 2147483648;
	return deltaV % rangeSize;
}
function fromNumberToArrayInt64(out, n) {
	if (n < 0) {
		var posN = -n;
		out.sign = -1;
		out.data[0] = ~~(posN / 4294967296);
		out.data[1] = posN >>> 0;
	} else {
		out.sign = 1;
		out.data[0] = ~~(n / 4294967296);
		out.data[1] = n >>> 0;
	}
	return out;
}
function substractArrayInt64(out, arrayIntA, arrayIntB) {
	var lowA = arrayIntA.data[1];
	var highA = arrayIntA.data[0];
	var signA = arrayIntA.sign;
	var lowB = arrayIntB.data[1];
	var highB = arrayIntB.data[0];
	var signB = arrayIntB.sign;
	out.sign = 1;
	if (signA === 1 && signB === -1) {
		var low_1 = lowA + lowB;
		var high = highA + highB + (low_1 > 4294967295 ? 1 : 0);
		out.data[0] = high >>> 0;
		out.data[1] = low_1 >>> 0;
		return out;
	}
	var lowFirst = lowA;
	var highFirst = highA;
	var lowSecond = lowB;
	var highSecond = highB;
	if (signA === -1) {
		lowFirst = lowB;
		highFirst = highB;
		lowSecond = lowA;
		highSecond = highA;
	}
	var reminderLow = 0;
	var low = lowFirst - lowSecond;
	if (low < 0) {
		reminderLow = 1;
		low = low >>> 0;
	}
	out.data[0] = highFirst - highSecond - reminderLow;
	out.data[1] = low;
	return out;
}
function unsafeUniformArrayIntDistributionInternal(out, rangeSize, rng) {
	var rangeLength = rangeSize.length;
	while (true) {
		for (var index = 0; index !== rangeLength; ++index) out[index] = unsafeUniformIntDistributionInternal(index === 0 ? rangeSize[0] + 1 : 4294967296, rng);
		for (var index = 0; index !== rangeLength; ++index) {
			var current = out[index];
			var currentInRange = rangeSize[index];
			if (current < currentInRange) return out;
			else if (current > currentInRange) break;
		}
	}
}
var safeNumberMaxSafeInteger = Number.MAX_SAFE_INTEGER;
var sharedA = {
	sign: 1,
	data: [0, 0]
};
var sharedB = {
	sign: 1,
	data: [0, 0]
};
var sharedC = {
	sign: 1,
	data: [0, 0]
};
var sharedData = [0, 0];
function uniformLargeIntInternal(from, to, rangeSize, rng) {
	var rangeSizeArrayIntValue = rangeSize <= safeNumberMaxSafeInteger ? fromNumberToArrayInt64(sharedC, rangeSize) : substractArrayInt64(sharedC, fromNumberToArrayInt64(sharedA, to), fromNumberToArrayInt64(sharedB, from));
	if (rangeSizeArrayIntValue.data[1] === 4294967295) {
		rangeSizeArrayIntValue.data[0] += 1;
		rangeSizeArrayIntValue.data[1] = 0;
	} else rangeSizeArrayIntValue.data[1] += 1;
	unsafeUniformArrayIntDistributionInternal(sharedData, rangeSizeArrayIntValue.data, rng);
	return sharedData[0] * 4294967296 + sharedData[1] + from;
}
function unsafeUniformIntDistribution(from, to, rng) {
	var rangeSize = to - from;
	if (rangeSize <= 4294967295) return unsafeUniformIntDistributionInternal(rangeSize + 1, rng) + from;
	return uniformLargeIntInternal(from, to, rangeSize, rng);
}
var XoroShiro128Plus = (function() {
	function XoroShiro128Plus2(s01, s00, s11, s10) {
		this.s01 = s01;
		this.s00 = s00;
		this.s11 = s11;
		this.s10 = s10;
	}
	XoroShiro128Plus2.prototype.clone = function() {
		return new XoroShiro128Plus2(this.s01, this.s00, this.s11, this.s10);
	};
	XoroShiro128Plus2.prototype.next = function() {
		var nextRng = new XoroShiro128Plus2(this.s01, this.s00, this.s11, this.s10);
		return [nextRng.unsafeNext(), nextRng];
	};
	XoroShiro128Plus2.prototype.unsafeNext = function() {
		var out = this.s00 + this.s10 | 0;
		var a0 = this.s10 ^ this.s00;
		var a1 = this.s11 ^ this.s01;
		var s00 = this.s00;
		var s01 = this.s01;
		this.s00 = s00 << 24 ^ s01 >>> 8 ^ a0 ^ a0 << 16;
		this.s01 = s01 << 24 ^ s00 >>> 8 ^ a1 ^ (a1 << 16 | a0 >>> 16);
		this.s10 = a1 << 5 ^ a0 >>> 27;
		this.s11 = a0 << 5 ^ a1 >>> 27;
		return out;
	};
	XoroShiro128Plus2.prototype.jump = function() {
		var nextRng = new XoroShiro128Plus2(this.s01, this.s00, this.s11, this.s10);
		nextRng.unsafeJump();
		return nextRng;
	};
	XoroShiro128Plus2.prototype.unsafeJump = function() {
		var ns01 = 0;
		var ns00 = 0;
		var ns11 = 0;
		var ns10 = 0;
		var jump = [
			3639956645,
			3750757012,
			1261568508,
			386426335
		];
		for (var i = 0; i !== 4; ++i) for (var mask = 1; mask; mask <<= 1) {
			if (jump[i] & mask) {
				ns01 ^= this.s01;
				ns00 ^= this.s00;
				ns11 ^= this.s11;
				ns10 ^= this.s10;
			}
			this.unsafeNext();
		}
		this.s01 = ns01;
		this.s00 = ns00;
		this.s11 = ns11;
		this.s10 = ns10;
	};
	XoroShiro128Plus2.prototype.getState = function() {
		return [
			this.s01,
			this.s00,
			this.s11,
			this.s10
		];
	};
	return XoroShiro128Plus2;
})();
function fromState(state) {
	if (!(state.length === 4)) throw new Error("The state must have been produced by a xoroshiro128plus RandomGenerator");
	return new XoroShiro128Plus(state[0], state[1], state[2], state[3]);
}
var xoroshiro128plus = Object.assign(function(seed) {
	return new XoroShiro128Plus(-1, ~seed, seed | 0, 0);
}, { fromState });
var { asUintN } = BigInt;
function pcg32(state) {
	state = asUintN(64, state * 6364136223846793005n + 11634580027462260723n);
	const xorshifted = Number(asUintN(32, (state >> 18n ^ state) >> 27n));
	const rot = Number(asUintN(32, state >> 59n));
	return xorshifted >> rot | xorshifted << 32 - rot;
}
function generateFloat64(rng) {
	const g1 = unsafeUniformIntDistribution(0, (1 << 26) - 1, rng);
	const g2 = unsafeUniformIntDistribution(0, (1 << 27) - 1, rng);
	return (g1 * Math.pow(2, 27) + g2) * Math.pow(2, -53);
}
function makeRandom(seed) {
	const rng = xoroshiro128plus(pcg32(seed.microsSinceUnixEpoch));
	const random = () => generateFloat64(rng);
	random.fill = (array) => {
		const elem = array.at(0);
		if (typeof elem === "bigint") {
			const upper = (1n << BigInt(array.BYTES_PER_ELEMENT * 8)) - 1n;
			for (let i = 0; i < array.length; i++) array[i] = unsafeUniformBigIntDistribution(0n, upper, rng);
		} else if (typeof elem === "number") {
			const upper = (1 << array.BYTES_PER_ELEMENT * 8) - 1;
			for (let i = 0; i < array.length; i++) array[i] = unsafeUniformIntDistribution(0, upper, rng);
		}
		return array;
	};
	random.uint32 = () => rng.unsafeNext();
	random.integerInRange = (min, max) => unsafeUniformIntDistribution(min, max, rng);
	random.bigintInRange = (min, max) => unsafeUniformBigIntDistribution(min, max, rng);
	return random;
}
var { freeze } = Object;
var sys = _syscalls2_0;
function parseJsonObject(json) {
	let value;
	try {
		value = JSON.parse(json);
	} catch {
		throw new Error("Invalid JSON: failed to parse string");
	}
	if (value === null || typeof value !== "object" || Array.isArray(value)) throw new Error("Expected a JSON object at the top level");
	return value;
}
var JwtClaimsImpl = class {
	/**
	* Creates a new JwtClaims instance.
	* @param rawPayload The JWT payload as a raw JSON string.
	* @param identity The identity for this JWT. We are only taking this because we don't have a blake3 implementation (which we need to compute it).
	*/
	constructor(rawPayload, identity) {
		this.rawPayload = rawPayload;
		this.fullPayload = parseJsonObject(rawPayload);
		this._identity = identity;
	}
	fullPayload;
	_identity;
	get identity() {
		return this._identity;
	}
	get subject() {
		return this.fullPayload["sub"];
	}
	get issuer() {
		return this.fullPayload["iss"];
	}
	get audience() {
		const aud = this.fullPayload["aud"];
		if (aud == null) return [];
		return typeof aud === "string" ? [aud] : aud;
	}
};
var AuthCtxImpl = class _AuthCtxImpl {
	isInternal;
	_jwtSource;
	_initializedJWT = false;
	_jwtClaims;
	_senderIdentity;
	constructor(opts) {
		this.isInternal = opts.isInternal;
		this._jwtSource = opts.jwtSource;
		this._senderIdentity = opts.senderIdentity;
	}
	_initializeJWT() {
		if (this._initializedJWT) return;
		this._initializedJWT = true;
		const token = this._jwtSource();
		if (!token) this._jwtClaims = null;
		else this._jwtClaims = new JwtClaimsImpl(token, this._senderIdentity);
		Object.freeze(this);
	}
	/** Lazily compute whether a JWT exists and is parseable. */
	get hasJWT() {
		this._initializeJWT();
		return this._jwtClaims !== null;
	}
	/** Lazily parse the JwtClaims only when accessed. */
	get jwt() {
		this._initializeJWT();
		return this._jwtClaims;
	}
	/** Create a context representing internal (non-user) requests. */
	static internal() {
		return new _AuthCtxImpl({
			isInternal: true,
			jwtSource: () => null,
			senderIdentity: Identity.zero()
		});
	}
	/** If there is a connection id, look up the JWT payload from the system tables. */
	static fromSystemTables(connectionId, sender) {
		if (connectionId === null) return new _AuthCtxImpl({
			isInternal: false,
			jwtSource: () => null,
			senderIdentity: sender
		});
		return new _AuthCtxImpl({
			isInternal: false,
			jwtSource: () => {
				const payloadBuf = sys.get_jwt_payload(connectionId.__connection_id__);
				if (payloadBuf.length === 0) return null;
				return new TextDecoder().decode(payloadBuf);
			},
			senderIdentity: sender
		});
	}
};
var ReducerCtxImpl = class ReducerCtx {
	#identity;
	#senderAuth;
	#uuidCounter;
	#random;
	sender;
	timestamp;
	connectionId;
	db;
	constructor(sender, timestamp, connectionId, dbView) {
		Object.seal(this);
		this.sender = sender;
		this.timestamp = timestamp;
		this.connectionId = connectionId;
		this.db = dbView;
	}
	/** Reset the `ReducerCtx` to be used for a new transaction */
	static reset(me, sender, timestamp, connectionId) {
		me.sender = sender;
		me.timestamp = timestamp;
		me.connectionId = connectionId;
		me.#uuidCounter = void 0;
		me.#senderAuth = void 0;
	}
	get identity() {
		return this.#identity ??= new Identity(sys.identity());
	}
	get senderAuth() {
		return this.#senderAuth ??= AuthCtxImpl.fromSystemTables(this.connectionId, this.sender);
	}
	get random() {
		return this.#random ??= makeRandom(this.timestamp);
	}
	/**
	* Create a new random {@link Uuid} `v4` using this `ReducerCtx`'s RNG.
	*/
	newUuidV4() {
		const bytes = this.random.fill(new Uint8Array(16));
		return Uuid.fromRandomBytesV4(bytes);
	}
	/**
	* Create a new sortable {@link Uuid} `v7` using this `ReducerCtx`'s RNG, counter,
	* and timestamp.
	*/
	newUuidV7() {
		const bytes = this.random.fill(new Uint8Array(4));
		const counter = this.#uuidCounter ??= { value: 0 };
		return Uuid.fromCounterV7(counter, this.timestamp, bytes);
	}
};
var callUserFunction = function __spacetimedb_end_short_backtrace(fn, ...args) {
	return fn(...args);
};
var makeHooks = (schema2) => new ModuleHooksImpl(schema2);
var ModuleHooksImpl = class {
	#schema;
	#dbView_;
	#reducerArgsDeserializers;
	/** Cache the `ReducerCtx` object to avoid allocating anew for ever reducer call. */
	#reducerCtx_;
	constructor(schema2) {
		this.#schema = schema2;
		this.#reducerArgsDeserializers = schema2.moduleDef.reducers.map(({ params }) => ProductType.makeDeserializer(params, schema2.typespace));
	}
	get #dbView() {
		return this.#dbView_ ??= freeze(Object.fromEntries(Object.values(this.#schema.schemaType.tables).map((table2) => [table2.accessorName, makeTableView(this.#schema.typespace, table2.tableDef)])));
	}
	get #reducerCtx() {
		return this.#reducerCtx_ ??= new ReducerCtxImpl(Identity.zero(), Timestamp.UNIX_EPOCH, null, this.#dbView);
	}
	__describe_module__() {
		const writer = new BinaryWriter(128);
		RawModuleDef.serialize(writer, RawModuleDef.V10(this.#schema.rawModuleDefV10()));
		return writer.getBuffer();
	}
	__get_error_constructor__(code) {
		return getErrorConstructor(code);
	}
	get __sender_error_class__() {
		return SenderError;
	}
	__call_reducer__(reducerId, sender, connId, timestamp, argsBuf) {
		const moduleCtx = this.#schema;
		const deserializeArgs = this.#reducerArgsDeserializers[reducerId];
		BINARY_READER.reset(argsBuf);
		const args = deserializeArgs(BINARY_READER);
		const senderIdentity = new Identity(sender);
		const ctx = this.#reducerCtx;
		ReducerCtxImpl.reset(ctx, senderIdentity, new Timestamp(timestamp), ConnectionId.nullIfZero(new ConnectionId(connId)));
		callUserFunction(moduleCtx.reducers[reducerId], ctx, args);
	}
	__call_view__(id, sender, argsBuf) {
		const moduleCtx = this.#schema;
		const { fn, deserializeParams, serializeReturn, returnTypeBaseSize } = moduleCtx.views[id];
		const ret = callUserFunction(fn, freeze({
			sender: new Identity(sender),
			db: this.#dbView,
			from: makeQueryBuilder(moduleCtx.schemaType)
		}), deserializeParams(new BinaryReader(argsBuf)));
		const retBuf = new BinaryWriter(returnTypeBaseSize);
		if (isRowTypedQuery(ret)) {
			const query = toSql(ret);
			ViewResultHeader.serialize(retBuf, ViewResultHeader.RawSql(query));
		} else {
			ViewResultHeader.serialize(retBuf, ViewResultHeader.RowData);
			serializeReturn(retBuf, ret);
		}
		return { data: retBuf.getBuffer() };
	}
	__call_view_anon__(id, argsBuf) {
		const moduleCtx = this.#schema;
		const { fn, deserializeParams, serializeReturn, returnTypeBaseSize } = moduleCtx.anonViews[id];
		const ret = callUserFunction(fn, freeze({
			db: this.#dbView,
			from: makeQueryBuilder(moduleCtx.schemaType)
		}), deserializeParams(new BinaryReader(argsBuf)));
		const retBuf = new BinaryWriter(returnTypeBaseSize);
		if (isRowTypedQuery(ret)) {
			const query = toSql(ret);
			ViewResultHeader.serialize(retBuf, ViewResultHeader.RawSql(query));
		} else {
			ViewResultHeader.serialize(retBuf, ViewResultHeader.RowData);
			serializeReturn(retBuf, ret);
		}
		return { data: retBuf.getBuffer() };
	}
	__call_procedure__(id, sender, connection_id, timestamp, args) {
		return callProcedure(this.#schema, id, new Identity(sender), ConnectionId.nullIfZero(new ConnectionId(connection_id)), new Timestamp(timestamp), args, () => this.#dbView);
	}
};
var BINARY_WRITER = new BinaryWriter(0);
var BINARY_READER = new BinaryReader(new Uint8Array());
function makeTableView(typespace, table2) {
	const table_id = sys.table_id_from_name(table2.sourceName);
	const rowType = typespace.types[table2.productTypeRef];
	if (rowType.tag !== "Product") throw "impossible";
	const serializeRow = AlgebraicType.makeSerializer(rowType, typespace);
	const deserializeRow = AlgebraicType.makeDeserializer(rowType, typespace);
	const sequences = table2.sequences.map((seq) => {
		const col = rowType.value.elements[seq.column];
		const colType = col.algebraicType;
		let sequenceTrigger;
		switch (colType.tag) {
			case "U8":
			case "I8":
			case "U16":
			case "I16":
			case "U32":
			case "I32":
				sequenceTrigger = 0;
				break;
			case "U64":
			case "I64":
			case "U128":
			case "I128":
			case "U256":
			case "I256":
				sequenceTrigger = 0n;
				break;
			default: throw new TypeError("invalid sequence type");
		}
		return {
			colName: col.name,
			sequenceTrigger,
			deserialize: AlgebraicType.makeDeserializer(colType, typespace)
		};
	});
	const hasAutoIncrement = sequences.length > 0;
	const iter = () => tableIterator(sys.datastore_table_scan_bsatn(table_id), deserializeRow);
	const integrateGeneratedColumns = hasAutoIncrement ? (row, ret_buf) => {
		BINARY_READER.reset(ret_buf);
		for (const { colName, deserialize, sequenceTrigger } of sequences) if (row[colName] === sequenceTrigger) row[colName] = deserialize(BINARY_READER);
	} : null;
	const tableMethods = {
		count: () => sys.datastore_table_row_count(table_id),
		iter,
		[Symbol.iterator]: () => iter(),
		insert: (row) => {
			const buf = LEAF_BUF;
			BINARY_WRITER.reset(buf);
			serializeRow(BINARY_WRITER, row);
			sys.datastore_insert_bsatn(table_id, buf.buffer, BINARY_WRITER.offset);
			const ret = { ...row };
			integrateGeneratedColumns?.(ret, buf.view);
			return ret;
		},
		delete: (row) => {
			const buf = LEAF_BUF;
			BINARY_WRITER.reset(buf);
			BINARY_WRITER.writeU32(1);
			serializeRow(BINARY_WRITER, row);
			return sys.datastore_delete_all_by_eq_bsatn(table_id, buf.buffer, BINARY_WRITER.offset) > 0;
		}
	};
	const tableView = Object.assign(/* @__PURE__ */ Object.create(null), tableMethods);
	for (const indexDef of table2.indexes) {
		const index_id = sys.index_id_from_name(indexDef.sourceName);
		let column_ids;
		let isHashIndex = false;
		switch (indexDef.algorithm.tag) {
			case "Hash":
				isHashIndex = true;
				column_ids = indexDef.algorithm.value;
				break;
			case "BTree":
				column_ids = indexDef.algorithm.value;
				break;
			case "Direct":
				column_ids = [indexDef.algorithm.value];
				break;
		}
		const numColumns = column_ids.length;
		const columnSet = new Set(column_ids);
		const isUnique = table2.constraints.filter((x) => x.data.tag === "Unique").some((x) => columnSet.isSubsetOf(new Set(x.data.value.columns)));
		const isPrimaryKey = isUnique && column_ids.length === table2.primaryKey.length && column_ids.every((id, i) => table2.primaryKey[i] === id);
		const indexSerializers = column_ids.map((id) => AlgebraicType.makeSerializer(rowType.value.elements[id].algebraicType, typespace));
		const serializePoint = (buffer, colVal) => {
			BINARY_WRITER.reset(buffer);
			for (let i = 0; i < numColumns; i++) indexSerializers[i](BINARY_WRITER, colVal[i]);
			return BINARY_WRITER.offset;
		};
		const serializeSingleElement = numColumns === 1 ? indexSerializers[0] : null;
		const serializeSinglePoint = serializeSingleElement && ((buffer, colVal) => {
			BINARY_WRITER.reset(buffer);
			serializeSingleElement(BINARY_WRITER, colVal);
			return BINARY_WRITER.offset;
		});
		let index;
		if (isUnique && serializeSinglePoint) {
			const base = {
				find: (colVal) => {
					const buf = LEAF_BUF;
					const point_len = serializeSinglePoint(buf, colVal);
					return tableIterateOne(sys.datastore_index_scan_point_bsatn(index_id, buf.buffer, point_len), deserializeRow);
				},
				delete: (colVal) => {
					const buf = LEAF_BUF;
					const point_len = serializeSinglePoint(buf, colVal);
					return sys.datastore_delete_by_index_scan_point_bsatn(index_id, buf.buffer, point_len) > 0;
				}
			};
			if (isPrimaryKey) base.update = (row) => {
				const buf = LEAF_BUF;
				BINARY_WRITER.reset(buf);
				serializeRow(BINARY_WRITER, row);
				sys.datastore_update_bsatn(table_id, index_id, buf.buffer, BINARY_WRITER.offset);
				integrateGeneratedColumns?.(row, buf.view);
				return row;
			};
			index = base;
		} else if (isUnique) {
			const base = {
				find: (colVal) => {
					if (colVal.length !== numColumns) throw new TypeError("wrong number of elements");
					const buf = LEAF_BUF;
					const point_len = serializePoint(buf, colVal);
					return tableIterateOne(sys.datastore_index_scan_point_bsatn(index_id, buf.buffer, point_len), deserializeRow);
				},
				delete: (colVal) => {
					if (colVal.length !== numColumns) throw new TypeError("wrong number of elements");
					const buf = LEAF_BUF;
					const point_len = serializePoint(buf, colVal);
					return sys.datastore_delete_by_index_scan_point_bsatn(index_id, buf.buffer, point_len) > 0;
				}
			};
			if (isPrimaryKey) base.update = (row) => {
				const buf = LEAF_BUF;
				BINARY_WRITER.reset(buf);
				serializeRow(BINARY_WRITER, row);
				sys.datastore_update_bsatn(table_id, index_id, buf.buffer, BINARY_WRITER.offset);
				integrateGeneratedColumns?.(row, buf.view);
				return row;
			};
			index = base;
		} else if (serializeSinglePoint) {
			const rawIndex = {
				filter: (range) => {
					const buf = LEAF_BUF;
					const point_len = serializeSinglePoint(buf, range);
					return tableIterator(sys.datastore_index_scan_point_bsatn(index_id, buf.buffer, point_len), deserializeRow);
				},
				delete: (range) => {
					const buf = LEAF_BUF;
					const point_len = serializeSinglePoint(buf, range);
					return sys.datastore_delete_by_index_scan_point_bsatn(index_id, buf.buffer, point_len);
				}
			};
			if (isHashIndex) index = rawIndex;
			else index = rawIndex;
		} else if (isHashIndex) index = {
			filter: (range) => {
				const buf = LEAF_BUF;
				const point_len = serializePoint(buf, range);
				return tableIterator(sys.datastore_index_scan_point_bsatn(index_id, buf.buffer, point_len), deserializeRow);
			},
			delete: (range) => {
				const buf = LEAF_BUF;
				const point_len = serializePoint(buf, range);
				return sys.datastore_delete_by_index_scan_point_bsatn(index_id, buf.buffer, point_len);
			}
		};
		else {
			const serializeRange = (buffer, range) => {
				if (range.length > numColumns) throw new TypeError("too many elements");
				BINARY_WRITER.reset(buffer);
				const writer = BINARY_WRITER;
				const prefix_elems = range.length - 1;
				for (let i = 0; i < prefix_elems; i++) indexSerializers[i](writer, range[i]);
				const rstartOffset = writer.offset;
				const term = range[range.length - 1];
				const serializeTerm = indexSerializers[range.length - 1];
				if (term instanceof Range) {
					const writeBound = (bound) => {
						writer.writeU8({
							included: 0,
							excluded: 1,
							unbounded: 2
						}[bound.tag]);
						if (bound.tag !== "unbounded") serializeTerm(writer, bound.value);
					};
					writeBound(term.from);
					const rstartLen = writer.offset - rstartOffset;
					writeBound(term.to);
					return [
						rstartOffset,
						prefix_elems,
						rstartLen,
						writer.offset - rstartLen
					];
				} else {
					writer.writeU8(0);
					serializeTerm(writer, term);
					return [
						rstartOffset,
						prefix_elems,
						writer.offset,
						0
					];
				}
			};
			index = {
				filter: (range) => {
					if (range.length === numColumns) {
						const buf = LEAF_BUF;
						const point_len = serializePoint(buf, range);
						return tableIterator(sys.datastore_index_scan_point_bsatn(index_id, buf.buffer, point_len), deserializeRow);
					} else {
						const buf = LEAF_BUF;
						const args = serializeRange(buf, range);
						return tableIterator(sys.datastore_index_scan_range_bsatn(index_id, buf.buffer, ...args), deserializeRow);
					}
				},
				delete: (range) => {
					if (range.length === numColumns) {
						const buf = LEAF_BUF;
						const point_len = serializePoint(buf, range);
						return sys.datastore_delete_by_index_scan_point_bsatn(index_id, buf.buffer, point_len);
					} else {
						const buf = LEAF_BUF;
						const args = serializeRange(buf, range);
						return sys.datastore_delete_by_index_scan_range_bsatn(index_id, buf.buffer, ...args);
					}
				}
			};
		}
		if (Object.hasOwn(tableView, indexDef.accessorName)) freeze(Object.assign(tableView[indexDef.accessorName], index));
		else tableView[indexDef.accessorName] = freeze(index);
	}
	return freeze(tableView);
}
function* tableIterator(id, deserialize) {
	using iter = new IteratorHandle(id);
	const iterBuf = takeBuf();
	try {
		let amt;
		while (amt = iter.advance(iterBuf)) {
			const reader = new BinaryReader(iterBuf.view);
			while (reader.offset < amt) yield deserialize(reader);
		}
	} finally {
		returnBuf(iterBuf);
	}
}
function tableIterateOne(id, deserialize) {
	const buf = LEAF_BUF;
	if (advanceIterRaw(id, buf) !== 0) {
		BINARY_READER.reset(buf.view);
		return deserialize(BINARY_READER);
	}
	return null;
}
function advanceIterRaw(id, buf) {
	while (true) try {
		return 0 | sys.row_iter_bsatn_advance(id, buf.buffer);
	} catch (e) {
		if (e && typeof e === "object" && hasOwn(e, "__buffer_too_small__")) {
			buf.grow(e.__buffer_too_small__);
			continue;
		}
		throw e;
	}
}
var DEFAULT_BUFFER_CAPACITY = 32 * 1024 * 2;
var ITER_BUFS = [new ResizableBuffer(DEFAULT_BUFFER_CAPACITY)];
var ITER_BUF_COUNT = 1;
function takeBuf() {
	return ITER_BUF_COUNT ? ITER_BUFS[--ITER_BUF_COUNT] : new ResizableBuffer(DEFAULT_BUFFER_CAPACITY);
}
function returnBuf(buf) {
	ITER_BUFS[ITER_BUF_COUNT++] = buf;
}
var LEAF_BUF = new ResizableBuffer(DEFAULT_BUFFER_CAPACITY);
var IteratorHandle = class _IteratorHandle {
	#id;
	static #finalizationRegistry = new FinalizationRegistry(sys.row_iter_bsatn_close);
	constructor(id) {
		this.#id = id;
		_IteratorHandle.#finalizationRegistry.register(this, id, this);
	}
	/** Unregister this object with the finalization registry and return the id */
	#detach() {
		const id = this.#id;
		this.#id = -1;
		_IteratorHandle.#finalizationRegistry.unregister(this);
		return id;
	}
	/** Call `row_iter_bsatn_advance`, returning 0 if this iterator has been exhausted. */
	advance(buf) {
		if (this.#id === -1) return 0;
		const ret = advanceIterRaw(this.#id, buf);
		if (ret <= 0) this.#detach();
		return ret < 0 ? -ret : ret;
	}
	[Symbol.dispose]() {
		if (this.#id >= 0) {
			const id = this.#detach();
			sys.row_iter_bsatn_close(id);
		}
	}
};
var { freeze: freeze2 } = Object;
var textEncoder = new TextEncoder();
var textDecoder = new TextDecoder("utf-8");
var makeResponse = Symbol("makeResponse");
var SyncResponse = class _SyncResponse {
	#body;
	#inner;
	constructor(body, init) {
		if (body == null) this.#body = null;
		else if (typeof body === "string") this.#body = body;
		else this.#body = new Uint8Array(body).buffer;
		this.#inner = {
			headers: new Headers(init?.headers),
			status: init?.status ?? 200,
			statusText: init?.statusText ?? "",
			type: "default",
			url: null,
			aborted: false
		};
	}
	static [makeResponse](body, inner) {
		const me = new _SyncResponse(body);
		me.#inner = inner;
		return me;
	}
	get headers() {
		return this.#inner.headers;
	}
	get status() {
		return this.#inner.status;
	}
	get statusText() {
		return this.#inner.statusText;
	}
	get ok() {
		return 200 <= this.#inner.status && this.#inner.status <= 299;
	}
	get url() {
		return this.#inner.url ?? "";
	}
	get type() {
		return this.#inner.type;
	}
	arrayBuffer() {
		return this.bytes().buffer;
	}
	bytes() {
		if (this.#body == null) return new Uint8Array();
		else if (typeof this.#body === "string") return textEncoder.encode(this.#body);
		else return new Uint8Array(this.#body);
	}
	json() {
		return JSON.parse(this.text());
	}
	text() {
		if (this.#body == null) return "";
		else if (typeof this.#body === "string") return this.#body;
		else return textDecoder.decode(this.#body);
	}
};
var requestBaseSize = bsatnBaseSize({ types: [] }, HttpRequest.algebraicType);
var methods = /* @__PURE__ */ new Map([
	["GET", { tag: "Get" }],
	["HEAD", { tag: "Head" }],
	["POST", { tag: "Post" }],
	["PUT", { tag: "Put" }],
	["DELETE", { tag: "Delete" }],
	["CONNECT", { tag: "Connect" }],
	["OPTIONS", { tag: "Options" }],
	["TRACE", { tag: "Trace" }],
	["PATCH", { tag: "Patch" }]
]);
function fetch(url, init = {}) {
	const method = methods.get(init.method?.toUpperCase() ?? "GET") ?? {
		tag: "Extension",
		value: init.method
	};
	const headers = { entries: headersToList(new Headers(init.headers)).flatMap(([k, v]) => Array.isArray(v) ? v.map((v2) => [k, v2]) : [[k, v]]).map(([name, value]) => ({
		name,
		value: textEncoder.encode(value)
	})) };
	const uri = "" + url;
	const request = freeze2({
		method,
		headers,
		timeout: init.timeout,
		uri,
		version: { tag: "Http11" }
	});
	const requestBuf = new BinaryWriter(requestBaseSize);
	HttpRequest.serialize(requestBuf, request);
	const body = init.body == null ? new Uint8Array() : typeof init.body === "string" ? init.body : new Uint8Array(init.body);
	const [responseBuf, responseBody] = sys.procedure_http_request(requestBuf.getBuffer(), body);
	const response = HttpResponse.deserialize(new BinaryReader(responseBuf));
	return SyncResponse[makeResponse](responseBody, {
		type: "basic",
		url: uri,
		status: response.code,
		statusText: (0, import_statuses.default)(response.code),
		headers: new Headers(),
		aborted: false
	});
}
freeze2(fetch);
var httpClient = freeze2({ fetch });
function makeProcedureExport(ctx, opts, params, ret, fn) {
	const name = opts?.name;
	const procedureExport = (...args) => fn(...args);
	procedureExport[exportContext] = ctx;
	procedureExport[registerExport] = (ctx2, exportName) => {
		registerProcedure(ctx2, name ?? exportName, params, ret, fn);
		ctx2.functionExports.set(procedureExport, name ?? exportName);
	};
	return procedureExport;
}
var TransactionCtxImpl = class TransactionCtx extends ReducerCtxImpl {};
function registerProcedure(ctx, exportName, params, ret, fn, opts) {
	ctx.defineFunction(exportName);
	const paramsType = { elements: Object.entries(params).map(([n, c]) => ({
		name: n,
		algebraicType: ctx.registerTypesRecursively("typeBuilder" in c ? c.typeBuilder : c).algebraicType
	})) };
	const returnType = ctx.registerTypesRecursively(ret).algebraicType;
	ctx.moduleDef.procedures.push({
		sourceName: exportName,
		params: paramsType,
		returnType,
		visibility: FunctionVisibility.ClientCallable
	});
	const { typespace } = ctx;
	ctx.procedures.push({
		fn,
		deserializeArgs: ProductType.makeDeserializer(paramsType, typespace),
		serializeReturn: AlgebraicType.makeSerializer(returnType, typespace),
		returnTypeBaseSize: bsatnBaseSize(typespace, returnType)
	});
}
function callProcedure(moduleCtx, id, sender, connectionId, timestamp, argsBuf, dbView) {
	const { fn, deserializeArgs, serializeReturn, returnTypeBaseSize } = moduleCtx.procedures[id];
	const args = deserializeArgs(new BinaryReader(argsBuf));
	const ret = callUserFunction(fn, new ProcedureCtxImpl(sender, timestamp, connectionId, dbView), args);
	const retBuf = new BinaryWriter(returnTypeBaseSize);
	serializeReturn(retBuf, ret);
	return retBuf.getBuffer();
}
var ProcedureCtxImpl = class ProcedureCtx {
	constructor(sender, timestamp, connectionId, dbView) {
		this.sender = sender;
		this.timestamp = timestamp;
		this.connectionId = connectionId;
		this.#dbView = dbView;
	}
	#identity;
	#uuidCounter;
	#random;
	#dbView;
	get identity() {
		return this.#identity ??= new Identity(sys.identity());
	}
	get random() {
		return this.#random ??= makeRandom(this.timestamp);
	}
	get http() {
		return httpClient;
	}
	withTx(body) {
		const run = () => {
			const timestamp = sys.procedure_start_mut_tx();
			try {
				return body(new TransactionCtxImpl(this.sender, new Timestamp(timestamp), this.connectionId, this.#dbView()));
			} catch (e) {
				sys.procedure_abort_mut_tx();
				throw e;
			}
		};
		let res = run();
		try {
			sys.procedure_commit_mut_tx();
			return res;
		} catch {}
		console.warn("committing anonymous transaction failed");
		res = run();
		try {
			sys.procedure_commit_mut_tx();
			return res;
		} catch (e) {
			throw new Error("transaction retry failed again", { cause: e });
		}
	}
	newUuidV4() {
		const bytes = this.random.fill(new Uint8Array(16));
		return Uuid.fromRandomBytesV4(bytes);
	}
	newUuidV7() {
		const bytes = this.random.fill(new Uint8Array(4));
		const counter = this.#uuidCounter ??= { value: 0 };
		return Uuid.fromCounterV7(counter, this.timestamp, bytes);
	}
};
function makeReducerExport(ctx, opts, params, fn, lifecycle) {
	const reducerExport = (...args) => fn(...args);
	reducerExport[exportContext] = ctx;
	reducerExport[registerExport] = (ctx2, exportName) => {
		registerReducer(ctx2, exportName, params, fn, opts, lifecycle);
		ctx2.functionExports.set(reducerExport, exportName);
	};
	return reducerExport;
}
function registerReducer(ctx, exportName, params, fn, opts, lifecycle) {
	ctx.defineFunction(exportName);
	if (!(params instanceof RowBuilder)) params = new RowBuilder(params);
	if (params.typeName === void 0) params.typeName = toPascalCase(exportName);
	const ref = ctx.registerTypesRecursively(params);
	const paramsType = ctx.resolveType(ref).value;
	const isLifecycle = lifecycle != null;
	ctx.moduleDef.reducers.push({
		sourceName: exportName,
		params: paramsType,
		visibility: FunctionVisibility.ClientCallable,
		okReturnType: AlgebraicType.Product({ elements: [] }),
		errReturnType: AlgebraicType.String
	});
	if (opts?.name != null) ctx.moduleDef.explicitNames.entries.push({
		tag: "Function",
		value: {
			sourceName: exportName,
			canonicalName: opts.name
		}
	});
	if (isLifecycle) ctx.moduleDef.lifeCycleReducers.push({
		lifecycleSpec: lifecycle,
		functionName: exportName
	});
	if (!fn.name) Object.defineProperty(fn, "name", {
		value: exportName,
		writable: false
	});
	ctx.reducers.push(fn);
}
var SchemaInner = class extends ModuleContext {
	schemaType;
	existingFunctions = /* @__PURE__ */ new Set();
	reducers = [];
	procedures = [];
	views = [];
	anonViews = [];
	/**
	* Maps ReducerExport objects to the name of the reducer.
	* Used for resolving the reducers of scheduled tables.
	*/
	functionExports = /* @__PURE__ */ new Map();
	pendingSchedules = [];
	constructor(getSchemaType) {
		super();
		this.schemaType = getSchemaType(this);
	}
	defineFunction(name) {
		if (this.existingFunctions.has(name)) throw new TypeError(`There is already a reducer or procedure with the name '${name}'`);
		this.existingFunctions.add(name);
	}
	resolveSchedules() {
		for (const { reducer, scheduleAtCol, tableName } of this.pendingSchedules) {
			const functionName = this.functionExports.get(reducer());
			if (functionName === void 0) {
				const msg = `Table ${tableName} defines a schedule, but it seems like the associated function was not exported.`;
				throw new TypeError(msg);
			}
			this.moduleDef.schedules.push({
				sourceName: void 0,
				tableName,
				scheduleAtCol,
				functionName
			});
		}
	}
};
var Schema = class {
	#ctx;
	constructor(ctx) {
		this.#ctx = ctx;
	}
	[moduleHooks](exports) {
		const registeredSchema = this.#ctx;
		for (const [name, moduleExport] of Object.entries(exports)) {
			if (name === "default") continue;
			if (!isModuleExport(moduleExport)) throw new TypeError("exporting something that is not a spacetime export");
			checkExportContext(moduleExport, registeredSchema);
			moduleExport[registerExport](registeredSchema, name);
		}
		registeredSchema.resolveSchedules();
		return makeHooks(registeredSchema);
	}
	get schemaType() {
		return this.#ctx.schemaType;
	}
	get moduleDef() {
		return this.#ctx.moduleDef;
	}
	get typespace() {
		return this.#ctx.typespace;
	}
	reducer(...args) {
		let opts, params = {}, fn;
		switch (args.length) {
			case 1:
				[fn] = args;
				break;
			case 2: {
				let arg1;
				[arg1, fn] = args;
				if (typeof arg1.name === "string") opts = arg1;
				else params = arg1;
				break;
			}
			case 3:
				[opts, params, fn] = args;
				break;
		}
		return makeReducerExport(this.#ctx, opts, params, fn);
	}
	init(...args) {
		let opts, fn;
		switch (args.length) {
			case 1:
				[fn] = args;
				break;
			case 2:
				[opts, fn] = args;
				break;
		}
		return makeReducerExport(this.#ctx, opts, {}, fn, Lifecycle.Init);
	}
	clientConnected(...args) {
		let opts, fn;
		switch (args.length) {
			case 1:
				[fn] = args;
				break;
			case 2:
				[opts, fn] = args;
				break;
		}
		return makeReducerExport(this.#ctx, opts, {}, fn, Lifecycle.OnConnect);
	}
	clientDisconnected(...args) {
		let opts, fn;
		switch (args.length) {
			case 1:
				[fn] = args;
				break;
			case 2:
				[opts, fn] = args;
				break;
		}
		return makeReducerExport(this.#ctx, opts, {}, fn, Lifecycle.OnDisconnect);
	}
	view(opts, ret, fn) {
		return makeViewExport(this.#ctx, opts, {}, ret, fn);
	}
	anonymousView(opts, ret, fn) {
		return makeAnonViewExport(this.#ctx, opts, {}, ret, fn);
	}
	procedure(...args) {
		let opts, params = {}, ret, fn;
		switch (args.length) {
			case 2:
				[ret, fn] = args;
				break;
			case 3: {
				let arg1;
				[arg1, ret, fn] = args;
				if (typeof arg1.name === "string") opts = arg1;
				else params = arg1;
				break;
			}
			case 4:
				[opts, params, ret, fn] = args;
				break;
		}
		return makeProcedureExport(this.#ctx, opts, params, ret, fn);
	}
	/**
	* Bundle multiple reducers, procedures, etc into one value to export.
	* The name they will be exported with is their corresponding key in the `exports` argument.
	*/
	exportGroup(exports) {
		return {
			[exportContext]: this.#ctx,
			[registerExport](ctx, _exportName) {
				for (const [exportName, moduleExport] of Object.entries(exports)) {
					checkExportContext(moduleExport, ctx);
					moduleExport[registerExport](ctx, exportName);
				}
			}
		};
	}
	clientVisibilityFilter = { sql: (filter) => ({
		[exportContext]: this.#ctx,
		[registerExport](ctx, _exportName) {
			ctx.moduleDef.rowLevelSecurity.push({ sql: filter });
		}
	}) };
};
var registerExport = Symbol("SpacetimeDB.registerExport");
var exportContext = Symbol("SpacetimeDB.exportContext");
function isModuleExport(x) {
	return (typeof x === "function" || typeof x === "object") && x !== null && registerExport in x;
}
function checkExportContext(exp, schema2) {
	if (exp[exportContext] != null && exp[exportContext] !== schema2) throw new TypeError("multiple schemas are not supported");
}
function schema(tables, moduleSettings) {
	return new Schema(new SchemaInner((ctx2) => {
		if (moduleSettings?.CASE_CONVERSION_POLICY != null) ctx2.setCaseConversionPolicy(moduleSettings.CASE_CONVERSION_POLICY);
		const tableSchemas = {};
		for (const [accName, table2] of Object.entries(tables)) {
			const tableDef = table2.tableDef(ctx2, accName);
			tableSchemas[accName] = tableToSchema(accName, table2, tableDef);
			ctx2.moduleDef.tables.push(tableDef);
			if (table2.schedule) ctx2.pendingSchedules.push({
				...table2.schedule,
				tableName: tableDef.sourceName
			});
			if (table2.tableName) ctx2.moduleDef.explicitNames.entries.push({
				tag: "Table",
				value: {
					sourceName: accName,
					canonicalName: table2.tableName
				}
			});
		}
		return { tables: tableSchemas };
	}));
}
var import_object_inspect = __toESM(require_object_inspect());
var fmtLog = (...data) => data.map((x) => typeof x === "string" ? x : (0, import_object_inspect.default)(x)).join(" ");
var console_level_error = 0;
var console_level_warn = 1;
var console_level_info = 2;
var console_level_debug = 3;
var console_level_trace = 4;
var timerMap = /* @__PURE__ */ new Map();
var console2 = {
	__proto__: {},
	[Symbol.toStringTag]: "console",
	assert: (condition = false, ...data) => {
		if (!condition) sys.console_log(console_level_error, fmtLog(...data));
	},
	clear: () => {},
	debug: (...data) => {
		sys.console_log(console_level_debug, fmtLog(...data));
	},
	error: (...data) => {
		sys.console_log(console_level_error, fmtLog(...data));
	},
	info: (...data) => {
		sys.console_log(console_level_info, fmtLog(...data));
	},
	log: (...data) => {
		sys.console_log(console_level_info, fmtLog(...data));
	},
	table: (tabularData, _properties) => {
		sys.console_log(console_level_info, fmtLog(tabularData));
	},
	trace: (...data) => {
		sys.console_log(console_level_trace, fmtLog(...data));
	},
	warn: (...data) => {
		sys.console_log(console_level_warn, fmtLog(...data));
	},
	dir: (_item, _options) => {},
	dirxml: (..._data) => {},
	count: (_label = "default") => {},
	countReset: (_label = "default") => {},
	group: (..._data) => {},
	groupCollapsed: (..._data) => {},
	groupEnd: () => {},
	time: (label = "default") => {
		if (timerMap.has(label)) {
			sys.console_log(console_level_warn, `Timer '${label}' already exists.`);
			return;
		}
		timerMap.set(label, sys.console_timer_start(label));
	},
	timeLog: (label = "default", ...data) => {
		sys.console_log(console_level_info, fmtLog(label, ...data));
	},
	timeEnd: (label = "default") => {
		const spanId = timerMap.get(label);
		if (spanId === void 0) {
			sys.console_log(console_level_warn, `Timer '${label}' does not exist.`);
			return;
		}
		sys.console_timer_end(spanId);
		timerMap.delete(label);
	},
	timeStamp: () => {},
	profile: () => {},
	profileEnd: () => {}
};
globalThis.console = console2;

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/types/enums.ts
const Role = t.enum("Role", {
	Admin: t.unit(),
	TournamentHost: t.unit(),
	User: t.unit()
});
const Path = t.enum("Path", {
	Abundance: t.unit(),
	Destruction: t.unit(),
	Erudition: t.unit(),
	Harmony: t.unit(),
	Hunt: t.unit(),
	Nihility: t.unit(),
	Preservation: t.unit(),
	Remembrance: t.unit(),
	Elation: t.unit()
});
const Element = t.enum("Element", {
	Fire: t.unit(),
	Ice: t.unit(),
	Imaginary: t.unit(),
	Lightning: t.unit(),
	Physical: t.unit(),
	Quantum: t.unit(),
	Wind: t.unit()
});
const CharRole = t.enum("CharRole", {
	Dps: t.unit(),
	Sustain: t.unit(),
	Support: t.unit()
});
const GameMode = t.enum("GameMode", {
	MemoryOfChaos: t.unit(),
	ApocalypticShadow: t.unit(),
	AnomalyArbitration: t.unit()
});
const DraftMode = t.enum("DraftMode", {
	Classic: t.unit(),
	Auction: t.unit()
});
const BanMode = t.enum("BanMode", {
	None: t.unit(),
	Two: t.unit(),
	Four: t.unit(),
	Six: t.unit()
});
const LobbyStage = t.enum("LobbyStage", {
	Waiting: t.unit(),
	Drafting: t.unit(),
	Finished: t.unit()
});
const ParticipationRole = t.enum("ParticipationRole", {
	Player: t.unit(),
	Spectator: t.unit()
});
const TeamLabel = t.enum("TeamLabel", {
	Spectator: t.unit(),
	Blue: t.unit(),
	Red: t.unit()
});
const MatchResult = t.enum("MatchResult", {
	BlueWins: t.unit(),
	RedWins: t.unit(),
	Draw: t.unit(),
	Aborted: t.unit()
});
const ActionType = t.enum("ActionType", {
	Pick: t.unit(),
	Ban: t.unit(),
	Nominate: t.unit(),
	Bid: t.unit(),
	AuctionSold: t.unit(),
	Pause: t.unit(),
	Undo: t.unit()
});

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/tables/user.ts
const User = table({
	name: "user",
	public: true,
	indexes: [{
		name: "user_discord_id",
		accessor: "user_discord_id",
		algorithm: "btree",
		columns: ["discordId"]
	}]
}, {
	id: t.u32().primaryKey().autoInc(),
	username: t.string().unique(),
	displayName: t.string(),
	isGuest: t.bool(),
	lastLoginAt: t.timestamp(),
	role: Role,
	discordId: t.string().optional(),
	avatarCharacterName: t.string()
});

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/tables/userIdentity.ts
/**
* Maps SpacetimeDB identities (per-device) to persistent User IDs (many-to-one).
* Each device/browser generates a unique identity; this table links them all
* back to a single User record.
*/
const UserIdentity = table({
	name: "user_identity",
	public: true,
	indexes: [{
		name: "user_identity_user_id",
		accessor: "user_identity_user_id",
		algorithm: "btree",
		columns: ["userId"]
	}]
}, {
	identity: t.identity().primaryKey(),
	userId: t.u32(),
	lastSeenAt: t.timestamp()
});

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/tables/serverIdentity.ts
/**
* Stores the trusted server identity (Next.js API server).
* Only one row should ever exist. The server identity is the only caller
* allowed to invoke server_link_discord (which links Discord accounts to users).
*
* Bootstrap: call register_server when the table is empty.
*/
const ServerIdentity = table({
	name: "server_identity",
	public: false
}, {
	identity: t.identity().primaryKey(),
	registeredAt: t.timestamp()
});

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/tables/hsrCharacter.ts
const HsrCharacter = table({
	name: "hsr_character",
	public: true,
	indexes: [
		{
			name: "character_by_path",
			accessor: "character_by_path",
			algorithm: "btree",
			columns: ["path"]
		},
		{
			name: "character_by_element",
			accessor: "character_by_element",
			algorithm: "btree",
			columns: ["element"]
		},
		{
			name: "character_by_role",
			accessor: "character_by_role",
			algorithm: "btree",
			columns: ["role"]
		}
	]
}, {
	name: t.string().primaryKey(),
	displayName: t.string(),
	aliases: t.array(t.string()),
	rarity: t.u8(),
	path: Path,
	element: Element,
	role: CharRole,
	imageUrl: t.string()
});

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/tables/hsrLightcone.ts
const HsrLightcone = table({
	name: "hsr_lightcone",
	public: true,
	indexes: [{
		name: "lightcone_by_path",
		accessor: "lightcone_by_path",
		algorithm: "btree",
		columns: ["path"]
	}]
}, {
	name: t.string().primaryKey(),
	displayName: t.string(),
	aliases: t.array(t.string()),
	path: Path,
	rarity: t.u8(),
	imageUrl: t.string(),
	posX: t.i32(),
	posY: t.i32(),
	width: t.i32()
});

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/types/structs.ts
const LobbyConfig = t.object("LobbyConfig", {
	team_size: t.u8(),
	draft_mode: DraftMode,
	ban_mode: BanMode,
	standard_turn_seconds: t.u32(),
	reserve_bank_seconds: t.u32(),
	auction_budget: t.f32().optional(),
	roster_diff_advantage: t.f32(),
	roster_threshold: t.f32(),
	under_threshold_advantage: t.f32(),
	above_threshold_penalty: t.f32(),
	death_penalty: t.f32()
});
const PlayerSnapshot = t.object("PlayerSnapshot", {
	userId: t.u32(),
	display_name: t.string(),
	avatar_url: t.string()
});
const TimerState = t.object("TimerState", {
	turn_start_at: t.timestamp(),
	team_blue_reserve_ms: t.u32(),
	team_red_reserve_ms: t.u32(),
	is_paused: t.bool(),
	accumulated_pause_ms: t.u32()
});
const DraftStep = t.object("DraftStep", {
	action_required: ActionType,
	team_turn: TeamLabel
});
const EidolonCost = t.object("EidolonCost", {
	e0: t.f32(),
	e1: t.f32(),
	e2: t.f32(),
	e3: t.f32(),
	e4: t.f32(),
	e5: t.f32(),
	e6: t.f32()
});
const SuperimpositionCost = t.object("SuperimpositionCost", {
	s1: t.f32(),
	s2: t.f32(),
	s3: t.f32(),
	s4: t.f32(),
	s5: t.f32()
});
const PickPayload = t.object("PickPayload", {
	character_name: t.string(),
	eidolon: t.u8(),
	cost_paid: t.f32()
});
const BanPayload = t.object("BanPayload", { character_name: t.string() });
const BidPayload = t.object("BidPayload", {
	amount: t.f32(),
	target_character: t.string()
});
const AuctionSoldPayload = t.object("AuctionSoldPayload", {
	character_name: t.string(),
	winning_amount: t.f32(),
	winning_team: TeamLabel,
	eidolon: t.u8()
});
const NominatePayload = t.object("NominatePayload", {
	character_name: t.string(),
	eidolon: t.u8()
});
const UndoPayload = t.object("UndoPayload", { original_sequence_id: t.u32() });
const PausePayload = t.object("PausePayload", {
	time_remaining_ms: t.u32(),
	is_auto_pause: t.bool()
});
const StepPayload = t.enum("StepPayload", {
	Pick: PickPayload,
	Ban: BanPayload,
	Bid: BidPayload,
	AuctionSold: AuctionSoldPayload,
	Nominate: NominatePayload,
	Undo: UndoPayload,
	Pause: PausePayload
});

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/tables/hsrCharacterCost.ts
const HsrCharacterCost = table({
	name: "hsr_character_cost",
	public: true,
	primaryKey: ["characterName", "gameMode"]
}, {
	characterName: t.string(),
	gameMode: GameMode,
	classicCosts: EidolonCost,
	auctionBaseBid: EidolonCost
});

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/tables/hsrLightconeCost.ts
const HsrLightconeCost = table({
	name: "hsr_lightcone_cost",
	public: true
}, {
	lightconeName: t.string().primaryKey(),
	classicCosts: SuperimpositionCost,
	auctionBaseBid: SuperimpositionCost
});

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/tables/hsrSynergyCost.ts
const HsrSynergyCost = table({
	name: "hsr_synergy_cost",
	public: true,
	indexes: [{
		name: "synergy_source_mode",
		accessor: "synergy_source_mode",
		algorithm: "btree",
		columns: ["sourceName", "gameMode"]
	}, {
		name: "synergy_target",
		accessor: "synergy_target",
		algorithm: "btree",
		columns: ["targetName"]
	}]
}, {
	id: t.u32().primaryKey().autoInc(),
	sourceName: t.string(),
	targetName: t.string(),
	gameMode: GameMode,
	costModifier: t.f32()
});

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/tables/lobby.ts
const Lobby = table({
	name: "lobby",
	public: true,
	indexes: [{
		name: "lobby_host",
		accessor: "lobby_host",
		algorithm: "btree",
		columns: ["hostUserId"]
	}]
}, {
	id: t.u32().primaryKey().autoInc(),
	joinCode: t.string().unique(),
	hostUserId: t.u32(),
	teamBlueAlias: t.string(),
	teamRedAlias: t.string(),
	hostDisconnectTime: t.timestamp().optional(),
	lastActivityAt: t.timestamp(),
	stage: LobbyStage,
	config: LobbyConfig
});

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/tables/lobbyMember.ts
const LobbyMember = table({
	name: "lobby_member",
	public: true,
	primaryKey: ["lobbyId", "userId"],
	indexes: [{
		name: "lobby_member_lobby_id",
		accessor: "lobby_member_lobby_id",
		algorithm: "btree",
		columns: ["lobbyId"]
	}]
}, {
	lobbyId: t.u32(),
	userId: t.u32(),
	isOnline: t.bool(),
	participationRole: ParticipationRole,
	isReferee: t.bool(),
	teamSlot: TeamLabel
});

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/tables/lobbyCursorEvent.ts
const LobbyCursorEvent = table({
	name: "lobby_cursor_event",
	public: true,
	event: true
}, {
	lobbyId: t.u32(),
	senderUserId: t.u32(),
	x: t.f32(),
	y: t.f32(),
	timestamp: t.timestamp()
});

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/tables/matchSession.ts
const MatchSession = table({
	name: "match_session",
	public: true
}, {
	lobbyId: t.u32().primaryKey(),
	turnIndex: t.u32(),
	draftSequence: t.array(DraftStep),
	timerState: TimerState,
	teamBlueBudget: t.f32(),
	teamRedBudget: t.f32()
});

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/tables/matchSessionStep.ts
const MatchSessionStep = table({
	name: "match_session_step",
	public: true,
	indexes: [{
		name: "match_history_lobby",
		accessor: "match_history_lobby",
		algorithm: "btree",
		columns: ["lobbyId"]
	}]
}, {
	id: t.u32().primaryKey().autoInc(),
	lobbyId: t.u32(),
	sequence: t.u32(),
	actorUserId: t.u32(),
	actorSlot: TeamLabel,
	action: ActionType,
	payload: StepPayload,
	timestamp: t.timestamp()
});

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/tables/matchSessionHistory.ts
const MatchSessionHistory = table({
	name: "match_session_history",
	public: true,
	indexes: [{
		name: "history_played_at",
		accessor: "history_played_at",
		algorithm: "btree",
		columns: ["playedAt"]
	}, {
		name: "history_game_mode",
		accessor: "history_game_mode",
		algorithm: "btree",
		columns: ["gameMode"]
	}]
}, {
	id: t.string().primaryKey(),
	lobbyCode: t.string(),
	playedAt: t.timestamp(),
	draftMode: DraftMode,
	gameMode: GameMode,
	teamBlueAlias: t.string(),
	teamRedAlias: t.string(),
	blueTeamMembers: t.array(PlayerSnapshot),
	redTeamMembers: t.array(PlayerSnapshot),
	snapshotConfig: LobbyConfig,
	result: MatchResult,
	rosterBlue: t.string(),
	rosterRed: t.string()
});

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/tables/matchSessionStepHistory.ts
const MatchSessionStepHistory = table({
	name: "match_session_step_history",
	public: true
}, {
	matchId: t.string().primaryKey(),
	steps: t.string()
});

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/schema.ts
const spacetimedb = schema({
	User,
	UserIdentity,
	ServerIdentity,
	HsrCharacter,
	HsrLightcone,
	HsrCharacterCost,
	HsrLightconeCost,
	HsrSynergyCost,
	Lobby,
	LobbyMember,
	LobbyCursorEvent,
	MatchSession,
	MatchSessionStep,
	MatchSessionHistory,
	MatchSessionStepHistory
});

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/reducers/cursor.ts
const broadcast_cursor = spacetimedb.reducer({
	lobbyId: t.u32(),
	x: t.f32(),
	y: t.f32()
}, (ctx, { lobbyId, x, y }) => {
	const mapping = ctx.db.UserIdentity.identity.find(ctx.sender);
	if (!mapping) return;
	if (!ctx.db.LobbyMember.primaryKey.find({
		lobbyId,
		userId: mapping.userId
	})) return;
	ctx.db.LobbyCursorEvent.insert({
		lobbyId,
		senderUserId: mapping.userId,
		x,
		y,
		timestamp: ctx.timestamp
	});
});

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/reducers/auth.ts
/**
* Login as a guest user.
* - If identity already linked → update lastLoginAt (no-op).
* - Otherwise → create a new User + UserIdentity mapping.
*/
const login_as_guest = spacetimedb.reducer((ctx) => {
	const mapping = ctx.db.UserIdentity.identity.find(ctx.sender);
	if (mapping) {
		const user = ctx.db.User.id.find(mapping.userId);
		if (user) {
			ctx.db.User.id.update({
				...user,
				lastLoginAt: ctx.timestamp
			});
			ctx.db.UserIdentity.identity.update({
				...mapping,
				lastSeenAt: ctx.timestamp
			});
			return;
		}
	}
	const guestUsername = `Guest_${ctx.sender.toHexString().slice(0, 8)}`;
	const newUser = ctx.db.User.insert({
		id: 0,
		username: guestUsername,
		displayName: guestUsername,
		isGuest: true,
		lastLoginAt: ctx.timestamp,
		role: { tag: "User" },
		discordId: void 0,
		avatarCharacterName: "march7th"
	});
	ctx.db.UserIdentity.insert({
		identity: ctx.sender,
		userId: newUser.id,
		lastSeenAt: ctx.timestamp
	});
});

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/reducers/profile.ts
/**
* Helper: resolve ctx.sender → UserIdentity → User.
* Returns { mapping, user } or null if identity is not linked.
*/
function resolveUser(ctx) {
	const mapping = ctx.db.UserIdentity.identity.find(ctx.sender);
	if (!mapping) return null;
	const user = ctx.db.User.id.find(mapping.userId);
	if (!user) return null;
	return {
		mapping,
		user
	};
}
/**
* Delete a guest account permanently.
* Only works for guest users (no Discord linked).
* Removes the UserIdentity mapping and the User row.
*/
const delete_guest_account = spacetimedb.reducer((ctx) => {
	const resolved = resolveUser(ctx);
	if (!resolved) throw new SenderError("No account found for this identity.");
	if (!resolved.user.isGuest) throw new SenderError("Only guest accounts can be deleted this way. Verified accounts persist across devices.");
	ctx.db.UserIdentity.identity.delete(ctx.sender);
	if ([...ctx.db.UserIdentity.user_identity_user_id.filter(resolved.user.id)].length === 0) ctx.db.User.id.delete(resolved.user.id);
});
/**
* Update the caller's display name.
* Only non-empty strings are accepted. Max 32 characters.
*/
const update_display_name = spacetimedb.reducer({ newDisplayName: t.string() }, (ctx, { newDisplayName }) => {
	const trimmed = newDisplayName.trim();
	if (trimmed.length === 0) throw new SenderError("Display name cannot be empty");
	if (trimmed.length > 32) throw new SenderError("Display name must be 32 characters or fewer");
	const resolved = resolveUser(ctx);
	if (!resolved) throw new SenderError("User not found — login first");
	ctx.db.User.id.update({
		...resolved.user,
		displayName: trimmed
	});
});
/**
* Update the caller's username.
* Only verified (non-guest) users with a linked Discord can change their username.
* Uniqueness is enforced by the database constraint.
*/
const update_username = spacetimedb.reducer({ newUsername: t.string() }, (ctx, { newUsername }) => {
	const trimmed = newUsername.trim();
	if (trimmed.length === 0) throw new SenderError("Username cannot be empty");
	if (trimmed.length > 32) throw new SenderError("Username must be 32 characters or fewer");
	const resolved = resolveUser(ctx);
	if (!resolved) throw new SenderError("User not found — login first");
	if (resolved.user.isGuest) throw new SenderError("Guest users cannot change their username. Link your Discord account first.");
	ctx.db.User.id.update({
		...resolved.user,
		username: trimmed
	});
});
/**
* Update the caller's avatar character.
* The characterName should reference an existing HsrCharacter name.
*/
const update_avatar = spacetimedb.reducer({ characterName: t.string() }, (ctx, { characterName }) => {
	const resolved = resolveUser(ctx);
	if (!resolved) throw new SenderError("User not found — login first");
	ctx.db.User.id.update({
		...resolved.user,
		avatarCharacterName: characterName
	});
});

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/reducers/server.ts
/**
* Helper: verify the caller is the registered server identity.
*/
function requireServer(ctx) {
	const server = ctx.db.ServerIdentity.identity.find(ctx.sender);
	if (!server) throw new SenderError("Forbidden: caller is not the registered server identity.");
	return server;
}
/**
* Bootstrap reducer: register the calling identity as the trusted server.
* Only works when no server identity exists yet (first-come-first-served).
* To re-register, clear-publish the database first.
*
* Run via: npx tsx scripts/register-server.ts
*/
const register_server = spacetimedb.reducer((ctx) => {
	if ([...ctx.db.ServerIdentity.iter()].length > 0) throw new SenderError("Server identity already registered. To re-register, clear the database first.");
	ctx.db.ServerIdentity.insert({
		identity: ctx.sender,
		registeredAt: ctx.timestamp
	});
});
/**
* Server-only reducer: link a Discord account to a user identity.
* Called by the Next.js API route after verifying the Discord OAuth session.
*
* The callerIdentityHex is the SpacetimeDB identity hex of the end-user's
* browser client. The server passes it along so we know which UserIdentity
* to update.
*/
const server_link_discord = spacetimedb.reducer({
	callerIdentityHex: t.string(),
	discordId: t.string(),
	discordUsername: t.string()
}, (ctx, { callerIdentityHex, discordId, discordUsername }) => {
	requireServer(ctx);
	if (!discordId || discordId.length === 0) throw new SenderError("discordId is required");
	if (!discordUsername || discordUsername.length === 0) throw new SenderError("discordUsername is required");
	if (!callerIdentityHex || callerIdentityHex.length === 0) throw new SenderError("callerIdentityHex is required");
	let userMapping = null;
	for (const row of ctx.db.UserIdentity.iter()) if (row.identity.toHexString() === callerIdentityHex) {
		userMapping = row;
		break;
	}
	let currentUser = null;
	if (userMapping) currentUser = ctx.db.User.id.find(userMapping.userId);
	const existingByDiscord = [...ctx.db.User.user_discord_id.filter(discordId)];
	const discordOwner = existingByDiscord.length > 0 ? existingByDiscord[0] : null;
	if (currentUser) {
		if (discordOwner && discordOwner.id !== currentUser.id) {
			const oldGuestId = currentUser.id;
			const wasGuest = currentUser.isGuest;
			ctx.db.UserIdentity.identity.update({
				...userMapping,
				userId: discordOwner.id,
				lastSeenAt: ctx.timestamp
			});
			ctx.db.User.id.update({
				...discordOwner,
				lastLoginAt: ctx.timestamp
			});
			if (wasGuest) {
				if ([...ctx.db.UserIdentity.user_identity_user_id.filter(oldGuestId)].length === 0) ctx.db.User.id.delete(oldGuestId);
			}
			return;
		}
		ctx.db.User.id.update({
			...currentUser,
			username: currentUser.isGuest ? discordUsername : currentUser.username,
			displayName: currentUser.isGuest ? discordUsername : currentUser.displayName,
			isGuest: false,
			discordId,
			lastLoginAt: ctx.timestamp
		});
		ctx.db.UserIdentity.identity.update({
			...userMapping,
			lastSeenAt: ctx.timestamp
		});
		return;
	}
	if (discordOwner) throw new SenderError("Identity not registered. Call login_as_guest first.");
	throw new SenderError("Identity not registered. Call login_as_guest first.");
});
/**
* Server-only reducer: promote a user to Admin role.
* Called via: npx tsx scripts/promote-admin.ts <username>
*/
const server_promote_admin = spacetimedb.reducer({ username: t.string() }, (ctx, { username }) => {
	requireServer(ctx);
	if (!username || username.length === 0) throw new SenderError("username is required");
	let targetUser = null;
	for (const row of ctx.db.User.iter()) if (row.username === username) {
		targetUser = row;
		break;
	}
	if (!targetUser) throw new SenderError(`User "${username}" not found`);
	ctx.db.User.id.update({
		...targetUser,
		role: { tag: "Admin" }
	});
});

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/index.ts
spacetimedb.clientConnected((ctx) => {
	console.log(`Client connected: ${ctx.sender.toHexString()}`);
});
spacetimedb.clientDisconnected((ctx) => {
	console.log(`Client disconnected: ${ctx.sender.toHexString()}`);
});
var src_default = spacetimedb;

//#endregion
export { broadcast_cursor, src_default as default, delete_guest_account, login_as_guest, register_server, server_link_discord, server_promote_admin, update_avatar, update_display_name, update_username };
//# debugId=3629e7b3-3dcf-46a0-8094-5252f004dc70
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwibmFtZXMiOlsiX19jcmVhdGUiLCJfX2RlZlByb3AiLCJfX2dldE93blByb3BEZXNjIiwiX19nZXRPd25Qcm9wTmFtZXMiLCJfX2dldFByb3RvT2YiLCJfX2hhc093blByb3AiLCJfX2NvbW1vbkpTIiwiX19jb3B5UHJvcHMiLCJfX3RvRVNNIiwiI2Vuc3VyZSIsIiNtb2R1bGVEZWYiLCIjcmVnaXN0ZXJDb21wb3VuZFR5cGVSZWN1cnNpdmVseSIsIiNjb21wb3VuZFR5cGVzIiwiI2Zyb20iLCIjdG8iLCIjdXVpZENvdW50ZXIiLCIjc2VuZGVyQXV0aCIsIiNpZGVudGl0eSIsIiNyYW5kb20iLCIjc2NoZW1hIiwiI3JlZHVjZXJBcmdzRGVzZXJpYWxpemVycyIsIiNkYlZpZXciLCIjZGJWaWV3XyIsIiNyZWR1Y2VyQ3R4IiwiI3JlZHVjZXJDdHhfIiwiI2ZpbmFsaXphdGlvblJlZ2lzdHJ5IiwiI2lkIiwiI2RldGFjaCIsIiNib2R5IiwiI2lubmVyIiwiI2N0eCJdLCJzb3VyY2VzIjpbIkQ6L0dpdHNXb3JrL2hzcnB2cC1zcGFjZXRpbWVkYi1uZXh0anMvc3BhY2V0aW1lZGIvbm9kZV9tb2R1bGVzL2hlYWRlcnMtcG9seWZpbGwvbGliL2luZGV4Lm1qcyIsIkQ6L0dpdHNXb3JrL2hzcnB2cC1zcGFjZXRpbWVkYi1uZXh0anMvc3BhY2V0aW1lZGIvbm9kZV9tb2R1bGVzL3NwYWNldGltZWRiL2Rpc3Qvc2VydmVyL2luZGV4Lm1qcyIsIkQ6L0dpdHNXb3JrL2hzcnB2cC1zcGFjZXRpbWVkYi1uZXh0anMvc3BhY2V0aW1lZGIvc3JjL3R5cGVzL2VudW1zLnRzIiwiRDovR2l0c1dvcmsvaHNycHZwLXNwYWNldGltZWRiLW5leHRqcy9zcGFjZXRpbWVkYi9zcmMvdGFibGVzL3VzZXIudHMiLCJEOi9HaXRzV29yay9oc3JwdnAtc3BhY2V0aW1lZGItbmV4dGpzL3NwYWNldGltZWRiL3NyYy90YWJsZXMvdXNlcklkZW50aXR5LnRzIiwiRDovR2l0c1dvcmsvaHNycHZwLXNwYWNldGltZWRiLW5leHRqcy9zcGFjZXRpbWVkYi9zcmMvdGFibGVzL3NlcnZlcklkZW50aXR5LnRzIiwiRDovR2l0c1dvcmsvaHNycHZwLXNwYWNldGltZWRiLW5leHRqcy9zcGFjZXRpbWVkYi9zcmMvdGFibGVzL2hzckNoYXJhY3Rlci50cyIsIkQ6L0dpdHNXb3JrL2hzcnB2cC1zcGFjZXRpbWVkYi1uZXh0anMvc3BhY2V0aW1lZGIvc3JjL3RhYmxlcy9oc3JMaWdodGNvbmUudHMiLCJEOi9HaXRzV29yay9oc3JwdnAtc3BhY2V0aW1lZGItbmV4dGpzL3NwYWNldGltZWRiL3NyYy90eXBlcy9zdHJ1Y3RzLnRzIiwiRDovR2l0c1dvcmsvaHNycHZwLXNwYWNldGltZWRiLW5leHRqcy9zcGFjZXRpbWVkYi9zcmMvdGFibGVzL2hzckNoYXJhY3RlckNvc3QudHMiLCJEOi9HaXRzV29yay9oc3JwdnAtc3BhY2V0aW1lZGItbmV4dGpzL3NwYWNldGltZWRiL3NyYy90YWJsZXMvaHNyTGlnaHRjb25lQ29zdC50cyIsIkQ6L0dpdHNXb3JrL2hzcnB2cC1zcGFjZXRpbWVkYi1uZXh0anMvc3BhY2V0aW1lZGIvc3JjL3RhYmxlcy9oc3JTeW5lcmd5Q29zdC50cyIsIkQ6L0dpdHNXb3JrL2hzcnB2cC1zcGFjZXRpbWVkYi1uZXh0anMvc3BhY2V0aW1lZGIvc3JjL3RhYmxlcy9sb2JieS50cyIsIkQ6L0dpdHNXb3JrL2hzcnB2cC1zcGFjZXRpbWVkYi1uZXh0anMvc3BhY2V0aW1lZGIvc3JjL3RhYmxlcy9sb2JieU1lbWJlci50cyIsIkQ6L0dpdHNXb3JrL2hzcnB2cC1zcGFjZXRpbWVkYi1uZXh0anMvc3BhY2V0aW1lZGIvc3JjL3RhYmxlcy9sb2JieUN1cnNvckV2ZW50LnRzIiwiRDovR2l0c1dvcmsvaHNycHZwLXNwYWNldGltZWRiLW5leHRqcy9zcGFjZXRpbWVkYi9zcmMvdGFibGVzL21hdGNoU2Vzc2lvbi50cyIsIkQ6L0dpdHNXb3JrL2hzcnB2cC1zcGFjZXRpbWVkYi1uZXh0anMvc3BhY2V0aW1lZGIvc3JjL3RhYmxlcy9tYXRjaFNlc3Npb25TdGVwLnRzIiwiRDovR2l0c1dvcmsvaHNycHZwLXNwYWNldGltZWRiLW5leHRqcy9zcGFjZXRpbWVkYi9zcmMvdGFibGVzL21hdGNoU2Vzc2lvbkhpc3RvcnkudHMiLCJEOi9HaXRzV29yay9oc3JwdnAtc3BhY2V0aW1lZGItbmV4dGpzL3NwYWNldGltZWRiL3NyYy90YWJsZXMvbWF0Y2hTZXNzaW9uU3RlcEhpc3RvcnkudHMiLCJEOi9HaXRzV29yay9oc3JwdnAtc3BhY2V0aW1lZGItbmV4dGpzL3NwYWNldGltZWRiL3NyYy9zY2hlbWEudHMiLCJEOi9HaXRzV29yay9oc3JwdnAtc3BhY2V0aW1lZGItbmV4dGpzL3NwYWNldGltZWRiL3NyYy9yZWR1Y2Vycy9jdXJzb3IudHMiLCJEOi9HaXRzV29yay9oc3JwdnAtc3BhY2V0aW1lZGItbmV4dGpzL3NwYWNldGltZWRiL3NyYy9yZWR1Y2Vycy9hdXRoLnRzIiwiRDovR2l0c1dvcmsvaHNycHZwLXNwYWNldGltZWRiLW5leHRqcy9zcGFjZXRpbWVkYi9zcmMvcmVkdWNlcnMvcHJvZmlsZS50cyIsIkQ6L0dpdHNXb3JrL2hzcnB2cC1zcGFjZXRpbWVkYi1uZXh0anMvc3BhY2V0aW1lZGIvc3JjL3JlZHVjZXJzL3NlcnZlci50cyIsIkQ6L0dpdHNXb3JrL2hzcnB2cC1zcGFjZXRpbWVkYi1uZXh0anMvc3BhY2V0aW1lZGIvc3JjL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbInZhciBfX2NyZWF0ZSA9IE9iamVjdC5jcmVhdGU7XHJcbnZhciBfX2RlZlByb3AgPSBPYmplY3QuZGVmaW5lUHJvcGVydHk7XHJcbnZhciBfX2dldE93blByb3BEZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcjtcclxudmFyIF9fZ2V0T3duUHJvcE5hbWVzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXM7XHJcbnZhciBfX2dldFByb3RvT2YgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Y7XHJcbnZhciBfX2hhc093blByb3AgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xyXG52YXIgX19jb21tb25KUyA9IChjYiwgbW9kKSA9PiBmdW5jdGlvbiBfX3JlcXVpcmUoKSB7XHJcbiAgcmV0dXJuIG1vZCB8fCAoMCwgY2JbX19nZXRPd25Qcm9wTmFtZXMoY2IpWzBdXSkoKG1vZCA9IHsgZXhwb3J0czoge30gfSkuZXhwb3J0cywgbW9kKSwgbW9kLmV4cG9ydHM7XHJcbn07XHJcbnZhciBfX2NvcHlQcm9wcyA9ICh0bywgZnJvbSwgZXhjZXB0LCBkZXNjKSA9PiB7XHJcbiAgaWYgKGZyb20gJiYgdHlwZW9mIGZyb20gPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGZyb20gPT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgZm9yIChsZXQga2V5IG9mIF9fZ2V0T3duUHJvcE5hbWVzKGZyb20pKVxyXG4gICAgICBpZiAoIV9faGFzT3duUHJvcC5jYWxsKHRvLCBrZXkpICYmIGtleSAhPT0gZXhjZXB0KVxyXG4gICAgICAgIF9fZGVmUHJvcCh0bywga2V5LCB7IGdldDogKCkgPT4gZnJvbVtrZXldLCBlbnVtZXJhYmxlOiAhKGRlc2MgPSBfX2dldE93blByb3BEZXNjKGZyb20sIGtleSkpIHx8IGRlc2MuZW51bWVyYWJsZSB9KTtcclxuICB9XHJcbiAgcmV0dXJuIHRvO1xyXG59O1xyXG52YXIgX190b0VTTSA9IChtb2QsIGlzTm9kZU1vZGUsIHRhcmdldCkgPT4gKHRhcmdldCA9IG1vZCAhPSBudWxsID8gX19jcmVhdGUoX19nZXRQcm90b09mKG1vZCkpIDoge30sIF9fY29weVByb3BzKFxyXG4gIC8vIElmIHRoZSBpbXBvcnRlciBpcyBpbiBub2RlIGNvbXBhdGliaWxpdHkgbW9kZSBvciB0aGlzIGlzIG5vdCBhbiBFU01cclxuICAvLyBmaWxlIHRoYXQgaGFzIGJlZW4gY29udmVydGVkIHRvIGEgQ29tbW9uSlMgZmlsZSB1c2luZyBhIEJhYmVsLVxyXG4gIC8vIGNvbXBhdGlibGUgdHJhbnNmb3JtIChpLmUuIFwiX19lc01vZHVsZVwiIGhhcyBub3QgYmVlbiBzZXQpLCB0aGVuIHNldFxyXG4gIC8vIFwiZGVmYXVsdFwiIHRvIHRoZSBDb21tb25KUyBcIm1vZHVsZS5leHBvcnRzXCIgZm9yIG5vZGUgY29tcGF0aWJpbGl0eS5cclxuICBpc05vZGVNb2RlIHx8ICFtb2QgfHwgIW1vZC5fX2VzTW9kdWxlID8gX19kZWZQcm9wKHRhcmdldCwgXCJkZWZhdWx0XCIsIHsgdmFsdWU6IG1vZCwgZW51bWVyYWJsZTogdHJ1ZSB9KSA6IHRhcmdldCxcclxuICBtb2RcclxuKSk7XHJcblxyXG4vLyBub2RlX21vZHVsZXMvc2V0LWNvb2tpZS1wYXJzZXIvbGliL3NldC1jb29raWUuanNcclxudmFyIHJlcXVpcmVfc2V0X2Nvb2tpZSA9IF9fY29tbW9uSlMoe1xyXG4gIFwibm9kZV9tb2R1bGVzL3NldC1jb29raWUtcGFyc2VyL2xpYi9zZXQtY29va2llLmpzXCIoZXhwb3J0cywgbW9kdWxlKSB7XHJcbiAgICBcInVzZSBzdHJpY3RcIjtcclxuICAgIHZhciBkZWZhdWx0UGFyc2VPcHRpb25zID0ge1xyXG4gICAgICBkZWNvZGVWYWx1ZXM6IHRydWUsXHJcbiAgICAgIG1hcDogZmFsc2UsXHJcbiAgICAgIHNpbGVudDogZmFsc2VcclxuICAgIH07XHJcbiAgICBmdW5jdGlvbiBpc05vbkVtcHR5U3RyaW5nKHN0cikge1xyXG4gICAgICByZXR1cm4gdHlwZW9mIHN0ciA9PT0gXCJzdHJpbmdcIiAmJiAhIXN0ci50cmltKCk7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBwYXJzZVN0cmluZyhzZXRDb29raWVWYWx1ZSwgb3B0aW9ucykge1xyXG4gICAgICB2YXIgcGFydHMgPSBzZXRDb29raWVWYWx1ZS5zcGxpdChcIjtcIikuZmlsdGVyKGlzTm9uRW1wdHlTdHJpbmcpO1xyXG4gICAgICB2YXIgbmFtZVZhbHVlUGFpclN0ciA9IHBhcnRzLnNoaWZ0KCk7XHJcbiAgICAgIHZhciBwYXJzZWQgPSBwYXJzZU5hbWVWYWx1ZVBhaXIobmFtZVZhbHVlUGFpclN0cik7XHJcbiAgICAgIHZhciBuYW1lID0gcGFyc2VkLm5hbWU7XHJcbiAgICAgIHZhciB2YWx1ZSA9IHBhcnNlZC52YWx1ZTtcclxuICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgPyBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0UGFyc2VPcHRpb25zLCBvcHRpb25zKSA6IGRlZmF1bHRQYXJzZU9wdGlvbnM7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgdmFsdWUgPSBvcHRpb25zLmRlY29kZVZhbHVlcyA/IGRlY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkgOiB2YWx1ZTtcclxuICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXHJcbiAgICAgICAgICBcInNldC1jb29raWUtcGFyc2VyIGVuY291bnRlcmVkIGFuIGVycm9yIHdoaWxlIGRlY29kaW5nIGEgY29va2llIHdpdGggdmFsdWUgJ1wiICsgdmFsdWUgKyBcIicuIFNldCBvcHRpb25zLmRlY29kZVZhbHVlcyB0byBmYWxzZSB0byBkaXNhYmxlIHRoaXMgZmVhdHVyZS5cIixcclxuICAgICAgICAgIGVcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgICAgIHZhciBjb29raWUgPSB7XHJcbiAgICAgICAgbmFtZSxcclxuICAgICAgICB2YWx1ZVxyXG4gICAgICB9O1xyXG4gICAgICBwYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uKHBhcnQpIHtcclxuICAgICAgICB2YXIgc2lkZXMgPSBwYXJ0LnNwbGl0KFwiPVwiKTtcclxuICAgICAgICB2YXIga2V5ID0gc2lkZXMuc2hpZnQoKS50cmltTGVmdCgpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgdmFyIHZhbHVlMiA9IHNpZGVzLmpvaW4oXCI9XCIpO1xyXG4gICAgICAgIGlmIChrZXkgPT09IFwiZXhwaXJlc1wiKSB7XHJcbiAgICAgICAgICBjb29raWUuZXhwaXJlcyA9IG5ldyBEYXRlKHZhbHVlMik7XHJcbiAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09IFwibWF4LWFnZVwiKSB7XHJcbiAgICAgICAgICBjb29raWUubWF4QWdlID0gcGFyc2VJbnQodmFsdWUyLCAxMCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09IFwic2VjdXJlXCIpIHtcclxuICAgICAgICAgIGNvb2tpZS5zZWN1cmUgPSB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSBcImh0dHBvbmx5XCIpIHtcclxuICAgICAgICAgIGNvb2tpZS5odHRwT25seSA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09IFwic2FtZXNpdGVcIikge1xyXG4gICAgICAgICAgY29va2llLnNhbWVTaXRlID0gdmFsdWUyO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBjb29raWVba2V5XSA9IHZhbHVlMjtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm4gY29va2llO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gcGFyc2VOYW1lVmFsdWVQYWlyKG5hbWVWYWx1ZVBhaXJTdHIpIHtcclxuICAgICAgdmFyIG5hbWUgPSBcIlwiO1xyXG4gICAgICB2YXIgdmFsdWUgPSBcIlwiO1xyXG4gICAgICB2YXIgbmFtZVZhbHVlQXJyID0gbmFtZVZhbHVlUGFpclN0ci5zcGxpdChcIj1cIik7XHJcbiAgICAgIGlmIChuYW1lVmFsdWVBcnIubGVuZ3RoID4gMSkge1xyXG4gICAgICAgIG5hbWUgPSBuYW1lVmFsdWVBcnIuc2hpZnQoKTtcclxuICAgICAgICB2YWx1ZSA9IG5hbWVWYWx1ZUFyci5qb2luKFwiPVwiKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB2YWx1ZSA9IG5hbWVWYWx1ZVBhaXJTdHI7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHsgbmFtZSwgdmFsdWUgfTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIHBhcnNlKGlucHV0LCBvcHRpb25zKSB7XHJcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zID8gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdFBhcnNlT3B0aW9ucywgb3B0aW9ucykgOiBkZWZhdWx0UGFyc2VPcHRpb25zO1xyXG4gICAgICBpZiAoIWlucHV0KSB7XHJcbiAgICAgICAgaWYgKCFvcHRpb25zLm1hcCkge1xyXG4gICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICByZXR1cm4ge307XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChpbnB1dC5oZWFkZXJzKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBpbnB1dC5oZWFkZXJzLmdldFNldENvb2tpZSA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICBpbnB1dCA9IGlucHV0LmhlYWRlcnMuZ2V0U2V0Q29va2llKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChpbnB1dC5oZWFkZXJzW1wic2V0LWNvb2tpZVwiXSkge1xyXG4gICAgICAgICAgaW5wdXQgPSBpbnB1dC5oZWFkZXJzW1wic2V0LWNvb2tpZVwiXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdmFyIHNjaCA9IGlucHV0LmhlYWRlcnNbT2JqZWN0LmtleXMoaW5wdXQuaGVhZGVycykuZmluZChmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGtleS50b0xvd2VyQ2FzZSgpID09PSBcInNldC1jb29raWVcIjtcclxuICAgICAgICAgIH0pXTtcclxuICAgICAgICAgIGlmICghc2NoICYmIGlucHV0LmhlYWRlcnMuY29va2llICYmICFvcHRpb25zLnNpbGVudCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXHJcbiAgICAgICAgICAgICAgXCJXYXJuaW5nOiBzZXQtY29va2llLXBhcnNlciBhcHBlYXJzIHRvIGhhdmUgYmVlbiBjYWxsZWQgb24gYSByZXF1ZXN0IG9iamVjdC4gSXQgaXMgZGVzaWduZWQgdG8gcGFyc2UgU2V0LUNvb2tpZSBoZWFkZXJzIGZyb20gcmVzcG9uc2VzLCBub3QgQ29va2llIGhlYWRlcnMgZnJvbSByZXF1ZXN0cy4gU2V0IHRoZSBvcHRpb24ge3NpbGVudDogdHJ1ZX0gdG8gc3VwcHJlc3MgdGhpcyB3YXJuaW5nLlwiXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpbnB1dCA9IHNjaDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGlucHV0KSkge1xyXG4gICAgICAgIGlucHV0ID0gW2lucHV0XTtcclxuICAgICAgfVxyXG4gICAgICBvcHRpb25zID0gb3B0aW9ucyA/IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRQYXJzZU9wdGlvbnMsIG9wdGlvbnMpIDogZGVmYXVsdFBhcnNlT3B0aW9ucztcclxuICAgICAgaWYgKCFvcHRpb25zLm1hcCkge1xyXG4gICAgICAgIHJldHVybiBpbnB1dC5maWx0ZXIoaXNOb25FbXB0eVN0cmluZykubWFwKGZ1bmN0aW9uKHN0cikge1xyXG4gICAgICAgICAgcmV0dXJuIHBhcnNlU3RyaW5nKHN0ciwgb3B0aW9ucyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdmFyIGNvb2tpZXMgPSB7fTtcclxuICAgICAgICByZXR1cm4gaW5wdXQuZmlsdGVyKGlzTm9uRW1wdHlTdHJpbmcpLnJlZHVjZShmdW5jdGlvbihjb29raWVzMiwgc3RyKSB7XHJcbiAgICAgICAgICB2YXIgY29va2llID0gcGFyc2VTdHJpbmcoc3RyLCBvcHRpb25zKTtcclxuICAgICAgICAgIGNvb2tpZXMyW2Nvb2tpZS5uYW1lXSA9IGNvb2tpZTtcclxuICAgICAgICAgIHJldHVybiBjb29raWVzMjtcclxuICAgICAgICB9LCBjb29raWVzKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gc3BsaXRDb29raWVzU3RyaW5nMihjb29raWVzU3RyaW5nKSB7XHJcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGNvb2tpZXNTdHJpbmcpKSB7XHJcbiAgICAgICAgcmV0dXJuIGNvb2tpZXNTdHJpbmc7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHR5cGVvZiBjb29raWVzU3RyaW5nICE9PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICB9XHJcbiAgICAgIHZhciBjb29raWVzU3RyaW5ncyA9IFtdO1xyXG4gICAgICB2YXIgcG9zID0gMDtcclxuICAgICAgdmFyIHN0YXJ0O1xyXG4gICAgICB2YXIgY2g7XHJcbiAgICAgIHZhciBsYXN0Q29tbWE7XHJcbiAgICAgIHZhciBuZXh0U3RhcnQ7XHJcbiAgICAgIHZhciBjb29raWVzU2VwYXJhdG9yRm91bmQ7XHJcbiAgICAgIGZ1bmN0aW9uIHNraXBXaGl0ZXNwYWNlKCkge1xyXG4gICAgICAgIHdoaWxlIChwb3MgPCBjb29raWVzU3RyaW5nLmxlbmd0aCAmJiAvXFxzLy50ZXN0KGNvb2tpZXNTdHJpbmcuY2hhckF0KHBvcykpKSB7XHJcbiAgICAgICAgICBwb3MgKz0gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHBvcyA8IGNvb2tpZXNTdHJpbmcubGVuZ3RoO1xyXG4gICAgICB9XHJcbiAgICAgIGZ1bmN0aW9uIG5vdFNwZWNpYWxDaGFyKCkge1xyXG4gICAgICAgIGNoID0gY29va2llc1N0cmluZy5jaGFyQXQocG9zKTtcclxuICAgICAgICByZXR1cm4gY2ggIT09IFwiPVwiICYmIGNoICE9PSBcIjtcIiAmJiBjaCAhPT0gXCIsXCI7XHJcbiAgICAgIH1cclxuICAgICAgd2hpbGUgKHBvcyA8IGNvb2tpZXNTdHJpbmcubGVuZ3RoKSB7XHJcbiAgICAgICAgc3RhcnQgPSBwb3M7XHJcbiAgICAgICAgY29va2llc1NlcGFyYXRvckZvdW5kID0gZmFsc2U7XHJcbiAgICAgICAgd2hpbGUgKHNraXBXaGl0ZXNwYWNlKCkpIHtcclxuICAgICAgICAgIGNoID0gY29va2llc1N0cmluZy5jaGFyQXQocG9zKTtcclxuICAgICAgICAgIGlmIChjaCA9PT0gXCIsXCIpIHtcclxuICAgICAgICAgICAgbGFzdENvbW1hID0gcG9zO1xyXG4gICAgICAgICAgICBwb3MgKz0gMTtcclxuICAgICAgICAgICAgc2tpcFdoaXRlc3BhY2UoKTtcclxuICAgICAgICAgICAgbmV4dFN0YXJ0ID0gcG9zO1xyXG4gICAgICAgICAgICB3aGlsZSAocG9zIDwgY29va2llc1N0cmluZy5sZW5ndGggJiYgbm90U3BlY2lhbENoYXIoKSkge1xyXG4gICAgICAgICAgICAgIHBvcyArPSAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChwb3MgPCBjb29raWVzU3RyaW5nLmxlbmd0aCAmJiBjb29raWVzU3RyaW5nLmNoYXJBdChwb3MpID09PSBcIj1cIikge1xyXG4gICAgICAgICAgICAgIGNvb2tpZXNTZXBhcmF0b3JGb3VuZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgcG9zID0gbmV4dFN0YXJ0O1xyXG4gICAgICAgICAgICAgIGNvb2tpZXNTdHJpbmdzLnB1c2goY29va2llc1N0cmluZy5zdWJzdHJpbmcoc3RhcnQsIGxhc3RDb21tYSkpO1xyXG4gICAgICAgICAgICAgIHN0YXJ0ID0gcG9zO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHBvcyA9IGxhc3RDb21tYSArIDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBvcyArPSAxO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWNvb2tpZXNTZXBhcmF0b3JGb3VuZCB8fCBwb3MgPj0gY29va2llc1N0cmluZy5sZW5ndGgpIHtcclxuICAgICAgICAgIGNvb2tpZXNTdHJpbmdzLnB1c2goY29va2llc1N0cmluZy5zdWJzdHJpbmcoc3RhcnQsIGNvb2tpZXNTdHJpbmcubGVuZ3RoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBjb29raWVzU3RyaW5ncztcclxuICAgIH1cclxuICAgIG1vZHVsZS5leHBvcnRzID0gcGFyc2U7XHJcbiAgICBtb2R1bGUuZXhwb3J0cy5wYXJzZSA9IHBhcnNlO1xyXG4gICAgbW9kdWxlLmV4cG9ydHMucGFyc2VTdHJpbmcgPSBwYXJzZVN0cmluZztcclxuICAgIG1vZHVsZS5leHBvcnRzLnNwbGl0Q29va2llc1N0cmluZyA9IHNwbGl0Q29va2llc1N0cmluZzI7XHJcbiAgfVxyXG59KTtcclxuXHJcbi8vIHNyYy9IZWFkZXJzLnRzXHJcbnZhciBpbXBvcnRfc2V0X2Nvb2tpZV9wYXJzZXIgPSBfX3RvRVNNKHJlcXVpcmVfc2V0X2Nvb2tpZSgpKTtcclxuXHJcbi8vIHNyYy91dGlscy9ub3JtYWxpemVIZWFkZXJOYW1lLnRzXHJcbnZhciBIRUFERVJTX0lOVkFMSURfQ0hBUkFDVEVSUyA9IC9bXmEtejAtOVxcLSMkJSYnKisuXl9gfH5dL2k7XHJcbmZ1bmN0aW9uIG5vcm1hbGl6ZUhlYWRlck5hbWUobmFtZSkge1xyXG4gIGlmIChIRUFERVJTX0lOVkFMSURfQ0hBUkFDVEVSUy50ZXN0KG5hbWUpIHx8IG5hbWUudHJpbSgpID09PSBcIlwiKSB7XHJcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBjaGFyYWN0ZXIgaW4gaGVhZGVyIGZpZWxkIG5hbWVcIik7XHJcbiAgfVxyXG4gIHJldHVybiBuYW1lLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xyXG59XHJcblxyXG4vLyBzcmMvdXRpbHMvbm9ybWFsaXplSGVhZGVyVmFsdWUudHNcclxudmFyIGNoYXJDb2Rlc1RvUmVtb3ZlID0gW1xyXG4gIFN0cmluZy5mcm9tQ2hhckNvZGUoMTApLFxyXG4gIFN0cmluZy5mcm9tQ2hhckNvZGUoMTMpLFxyXG4gIFN0cmluZy5mcm9tQ2hhckNvZGUoOSksXHJcbiAgU3RyaW5nLmZyb21DaGFyQ29kZSgzMilcclxuXTtcclxudmFyIEhFQURFUl9WQUxVRV9SRU1PVkVfUkVHRVhQID0gbmV3IFJlZ0V4cChcclxuICBgKF5bJHtjaGFyQ29kZXNUb1JlbW92ZS5qb2luKFwiXCIpfV18JFske2NoYXJDb2Rlc1RvUmVtb3ZlLmpvaW4oXCJcIil9XSlgLFxyXG4gIFwiZ1wiXHJcbik7XHJcbmZ1bmN0aW9uIG5vcm1hbGl6ZUhlYWRlclZhbHVlKHZhbHVlKSB7XHJcbiAgY29uc3QgbmV4dFZhbHVlID0gdmFsdWUucmVwbGFjZShIRUFERVJfVkFMVUVfUkVNT1ZFX1JFR0VYUCwgXCJcIik7XHJcbiAgcmV0dXJuIG5leHRWYWx1ZTtcclxufVxyXG5cclxuLy8gc3JjL3V0aWxzL2lzVmFsaWRIZWFkZXJOYW1lLnRzXHJcbmZ1bmN0aW9uIGlzVmFsaWRIZWFkZXJOYW1lKHZhbHVlKSB7XHJcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJzdHJpbmdcIikge1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuICBpZiAodmFsdWUubGVuZ3RoID09PSAwKSB7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgdmFsdWUubGVuZ3RoOyBpKyspIHtcclxuICAgIGNvbnN0IGNoYXJhY3RlciA9IHZhbHVlLmNoYXJDb2RlQXQoaSk7XHJcbiAgICBpZiAoY2hhcmFjdGVyID4gMTI3IHx8ICFpc1Rva2VuKGNoYXJhY3RlcikpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gdHJ1ZTtcclxufVxyXG5mdW5jdGlvbiBpc1Rva2VuKHZhbHVlKSB7XHJcbiAgcmV0dXJuICFbXHJcbiAgICAxMjcsXHJcbiAgICAzMixcclxuICAgIFwiKFwiLFxyXG4gICAgXCIpXCIsXHJcbiAgICBcIjxcIixcclxuICAgIFwiPlwiLFxyXG4gICAgXCJAXCIsXHJcbiAgICBcIixcIixcclxuICAgIFwiO1wiLFxyXG4gICAgXCI6XCIsXHJcbiAgICBcIlxcXFxcIixcclxuICAgICdcIicsXHJcbiAgICBcIi9cIixcclxuICAgIFwiW1wiLFxyXG4gICAgXCJdXCIsXHJcbiAgICBcIj9cIixcclxuICAgIFwiPVwiLFxyXG4gICAgXCJ7XCIsXHJcbiAgICBcIn1cIlxyXG4gIF0uaW5jbHVkZXModmFsdWUpO1xyXG59XHJcblxyXG4vLyBzcmMvdXRpbHMvaXNWYWxpZEhlYWRlclZhbHVlLnRzXHJcbmZ1bmN0aW9uIGlzVmFsaWRIZWFkZXJWYWx1ZSh2YWx1ZSkge1xyXG4gIGlmICh0eXBlb2YgdmFsdWUgIT09IFwic3RyaW5nXCIpIHtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcbiAgaWYgKHZhbHVlLnRyaW0oKSAhPT0gdmFsdWUpIHtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCB2YWx1ZS5sZW5ndGg7IGkrKykge1xyXG4gICAgY29uc3QgY2hhcmFjdGVyID0gdmFsdWUuY2hhckNvZGVBdChpKTtcclxuICAgIGlmIChcclxuICAgICAgLy8gTlVMLlxyXG4gICAgICBjaGFyYWN0ZXIgPT09IDAgfHwgLy8gSFRUUCBuZXdsaW5lIGJ5dGVzLlxyXG4gICAgICBjaGFyYWN0ZXIgPT09IDEwIHx8IGNoYXJhY3RlciA9PT0gMTNcclxuICAgICkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiB0cnVlO1xyXG59XHJcblxyXG4vLyBzcmMvSGVhZGVycy50c1xyXG52YXIgTk9STUFMSVpFRF9IRUFERVJTID0gU3ltYm9sKFwibm9ybWFsaXplZEhlYWRlcnNcIik7XHJcbnZhciBSQVdfSEVBREVSX05BTUVTID0gU3ltYm9sKFwicmF3SGVhZGVyTmFtZXNcIik7XHJcbnZhciBIRUFERVJfVkFMVUVfREVMSU1JVEVSID0gXCIsIFwiO1xyXG52YXIgX2EsIF9iLCBfYztcclxudmFyIEhlYWRlcnMgPSBjbGFzcyBfSGVhZGVycyB7XHJcbiAgY29uc3RydWN0b3IoaW5pdCkge1xyXG4gICAgLy8gTm9ybWFsaXplZCBoZWFkZXIge1wibmFtZVwiOlwiYSwgYlwifSBzdG9yYWdlLlxyXG4gICAgdGhpc1tfYV0gPSB7fTtcclxuICAgIC8vIEtlZXBzIHRoZSBtYXBwaW5nIGJldHdlZW4gdGhlIHJhdyBoZWFkZXIgbmFtZVxyXG4gICAgLy8gYW5kIHRoZSBub3JtYWxpemVkIGhlYWRlciBuYW1lIHRvIGVhc2UgdGhlIGxvb2t1cC5cclxuICAgIHRoaXNbX2JdID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcclxuICAgIHRoaXNbX2NdID0gXCJIZWFkZXJzXCI7XHJcbiAgICBpZiAoW1wiSGVhZGVyc1wiLCBcIkhlYWRlcnNQb2x5ZmlsbFwiXS5pbmNsdWRlcyhpbml0Py5jb25zdHJ1Y3Rvci5uYW1lKSB8fCBpbml0IGluc3RhbmNlb2YgX0hlYWRlcnMgfHwgdHlwZW9mIGdsb2JhbFRoaXMuSGVhZGVycyAhPT0gXCJ1bmRlZmluZWRcIiAmJiBpbml0IGluc3RhbmNlb2YgZ2xvYmFsVGhpcy5IZWFkZXJzKSB7XHJcbiAgICAgIGNvbnN0IGluaXRpYWxIZWFkZXJzID0gaW5pdDtcclxuICAgICAgaW5pdGlhbEhlYWRlcnMuZm9yRWFjaCgodmFsdWUsIG5hbWUpID0+IHtcclxuICAgICAgICB0aGlzLmFwcGVuZChuYW1lLCB2YWx1ZSk7XHJcbiAgICAgIH0sIHRoaXMpO1xyXG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGluaXQpKSB7XHJcbiAgICAgIGluaXQuZm9yRWFjaCgoW25hbWUsIHZhbHVlXSkgPT4ge1xyXG4gICAgICAgIHRoaXMuYXBwZW5kKFxyXG4gICAgICAgICAgbmFtZSxcclxuICAgICAgICAgIEFycmF5LmlzQXJyYXkodmFsdWUpID8gdmFsdWUuam9pbihIRUFERVJfVkFMVUVfREVMSU1JVEVSKSA6IHZhbHVlXHJcbiAgICAgICAgKTtcclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2UgaWYgKGluaXQpIHtcclxuICAgICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoaW5pdCkuZm9yRWFjaCgobmFtZSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHZhbHVlID0gaW5pdFtuYW1lXTtcclxuICAgICAgICB0aGlzLmFwcGVuZChcclxuICAgICAgICAgIG5hbWUsXHJcbiAgICAgICAgICBBcnJheS5pc0FycmF5KHZhbHVlKSA/IHZhbHVlLmpvaW4oSEVBREVSX1ZBTFVFX0RFTElNSVRFUikgOiB2YWx1ZVxyXG4gICAgICAgICk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuICBbKF9hID0gTk9STUFMSVpFRF9IRUFERVJTLCBfYiA9IFJBV19IRUFERVJfTkFNRVMsIF9jID0gU3ltYm9sLnRvU3RyaW5nVGFnLCBTeW1ib2wuaXRlcmF0b3IpXSgpIHtcclxuICAgIHJldHVybiB0aGlzLmVudHJpZXMoKTtcclxuICB9XHJcbiAgKmtleXMoKSB7XHJcbiAgICBmb3IgKGNvbnN0IFtuYW1lXSBvZiB0aGlzLmVudHJpZXMoKSkge1xyXG4gICAgICB5aWVsZCBuYW1lO1xyXG4gICAgfVxyXG4gIH1cclxuICAqdmFsdWVzKCkge1xyXG4gICAgZm9yIChjb25zdCBbLCB2YWx1ZV0gb2YgdGhpcy5lbnRyaWVzKCkpIHtcclxuICAgICAgeWllbGQgdmFsdWU7XHJcbiAgICB9XHJcbiAgfVxyXG4gICplbnRyaWVzKCkge1xyXG4gICAgbGV0IHNvcnRlZEtleXMgPSBPYmplY3Qua2V5cyh0aGlzW05PUk1BTElaRURfSEVBREVSU10pLnNvcnQoXHJcbiAgICAgIChhLCBiKSA9PiBhLmxvY2FsZUNvbXBhcmUoYilcclxuICAgICk7XHJcbiAgICBmb3IgKGNvbnN0IG5hbWUgb2Ygc29ydGVkS2V5cykge1xyXG4gICAgICBpZiAobmFtZSA9PT0gXCJzZXQtY29va2llXCIpIHtcclxuICAgICAgICBmb3IgKGNvbnN0IHZhbHVlIG9mIHRoaXMuZ2V0U2V0Q29va2llKCkpIHtcclxuICAgICAgICAgIHlpZWxkIFtuYW1lLCB2YWx1ZV07XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHlpZWxkIFtuYW1lLCB0aGlzLmdldChuYW1lKV07XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIGJvb2xlYW4gc3RhdGluZyB3aGV0aGVyIGEgYEhlYWRlcnNgIG9iamVjdCBjb250YWlucyBhIGNlcnRhaW4gaGVhZGVyLlxyXG4gICAqL1xyXG4gIGhhcyhuYW1lKSB7XHJcbiAgICBpZiAoIWlzVmFsaWRIZWFkZXJOYW1lKG5hbWUpKSB7XHJcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEludmFsaWQgaGVhZGVyIG5hbWUgXCIke25hbWV9XCJgKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzW05PUk1BTElaRURfSEVBREVSU10uaGFzT3duUHJvcGVydHkobm9ybWFsaXplSGVhZGVyTmFtZShuYW1lKSk7XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBgQnl0ZVN0cmluZ2Agc2VxdWVuY2Ugb2YgYWxsIHRoZSB2YWx1ZXMgb2YgYSBoZWFkZXIgd2l0aCBhIGdpdmVuIG5hbWUuXHJcbiAgICovXHJcbiAgZ2V0KG5hbWUpIHtcclxuICAgIGlmICghaXNWYWxpZEhlYWRlck5hbWUobmFtZSkpIHtcclxuICAgICAgdGhyb3cgVHlwZUVycm9yKGBJbnZhbGlkIGhlYWRlciBuYW1lIFwiJHtuYW1lfVwiYCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpc1tOT1JNQUxJWkVEX0hFQURFUlNdW25vcm1hbGl6ZUhlYWRlck5hbWUobmFtZSldID8/IG51bGw7XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIFNldHMgYSBuZXcgdmFsdWUgZm9yIGFuIGV4aXN0aW5nIGhlYWRlciBpbnNpZGUgYSBgSGVhZGVyc2Agb2JqZWN0LCBvciBhZGRzIHRoZSBoZWFkZXIgaWYgaXQgZG9lcyBub3QgYWxyZWFkeSBleGlzdC5cclxuICAgKi9cclxuICBzZXQobmFtZSwgdmFsdWUpIHtcclxuICAgIGlmICghaXNWYWxpZEhlYWRlck5hbWUobmFtZSkgfHwgIWlzVmFsaWRIZWFkZXJWYWx1ZSh2YWx1ZSkpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgY29uc3Qgbm9ybWFsaXplZE5hbWUgPSBub3JtYWxpemVIZWFkZXJOYW1lKG5hbWUpO1xyXG4gICAgY29uc3Qgbm9ybWFsaXplZFZhbHVlID0gbm9ybWFsaXplSGVhZGVyVmFsdWUodmFsdWUpO1xyXG4gICAgdGhpc1tOT1JNQUxJWkVEX0hFQURFUlNdW25vcm1hbGl6ZWROYW1lXSA9IG5vcm1hbGl6ZUhlYWRlclZhbHVlKG5vcm1hbGl6ZWRWYWx1ZSk7XHJcbiAgICB0aGlzW1JBV19IRUFERVJfTkFNRVNdLnNldChub3JtYWxpemVkTmFtZSwgbmFtZSk7XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIEFwcGVuZHMgYSBuZXcgdmFsdWUgb250byBhbiBleGlzdGluZyBoZWFkZXIgaW5zaWRlIGEgYEhlYWRlcnNgIG9iamVjdCwgb3IgYWRkcyB0aGUgaGVhZGVyIGlmIGl0IGRvZXMgbm90IGFscmVhZHkgZXhpc3QuXHJcbiAgICovXHJcbiAgYXBwZW5kKG5hbWUsIHZhbHVlKSB7XHJcbiAgICBpZiAoIWlzVmFsaWRIZWFkZXJOYW1lKG5hbWUpIHx8ICFpc1ZhbGlkSGVhZGVyVmFsdWUodmFsdWUpKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGNvbnN0IG5vcm1hbGl6ZWROYW1lID0gbm9ybWFsaXplSGVhZGVyTmFtZShuYW1lKTtcclxuICAgIGNvbnN0IG5vcm1hbGl6ZWRWYWx1ZSA9IG5vcm1hbGl6ZUhlYWRlclZhbHVlKHZhbHVlKTtcclxuICAgIGxldCByZXNvbHZlZFZhbHVlID0gdGhpcy5oYXMobm9ybWFsaXplZE5hbWUpID8gYCR7dGhpcy5nZXQobm9ybWFsaXplZE5hbWUpfSwgJHtub3JtYWxpemVkVmFsdWV9YCA6IG5vcm1hbGl6ZWRWYWx1ZTtcclxuICAgIHRoaXMuc2V0KG5hbWUsIHJlc29sdmVkVmFsdWUpO1xyXG4gIH1cclxuICAvKipcclxuICAgKiBEZWxldGVzIGEgaGVhZGVyIGZyb20gdGhlIGBIZWFkZXJzYCBvYmplY3QuXHJcbiAgICovXHJcbiAgZGVsZXRlKG5hbWUpIHtcclxuICAgIGlmICghaXNWYWxpZEhlYWRlck5hbWUobmFtZSkpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgaWYgKCF0aGlzLmhhcyhuYW1lKSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBjb25zdCBub3JtYWxpemVkTmFtZSA9IG5vcm1hbGl6ZUhlYWRlck5hbWUobmFtZSk7XHJcbiAgICBkZWxldGUgdGhpc1tOT1JNQUxJWkVEX0hFQURFUlNdW25vcm1hbGl6ZWROYW1lXTtcclxuICAgIHRoaXNbUkFXX0hFQURFUl9OQU1FU10uZGVsZXRlKG5vcm1hbGl6ZWROYW1lKTtcclxuICB9XHJcbiAgLyoqXHJcbiAgICogVHJhdmVyc2VzIHRoZSBgSGVhZGVyc2Agb2JqZWN0LFxyXG4gICAqIGNhbGxpbmcgdGhlIGdpdmVuIGNhbGxiYWNrIGZvciBlYWNoIGhlYWRlci5cclxuICAgKi9cclxuICBmb3JFYWNoKGNhbGxiYWNrLCB0aGlzQXJnKSB7XHJcbiAgICBmb3IgKGNvbnN0IFtuYW1lLCB2YWx1ZV0gb2YgdGhpcy5lbnRyaWVzKCkpIHtcclxuICAgICAgY2FsbGJhY2suY2FsbCh0aGlzQXJnLCB2YWx1ZSwgbmFtZSwgdGhpcyk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYW4gYXJyYXkgY29udGFpbmluZyB0aGUgdmFsdWVzXHJcbiAgICogb2YgYWxsIFNldC1Db29raWUgaGVhZGVycyBhc3NvY2lhdGVkXHJcbiAgICogd2l0aCBhIHJlc3BvbnNlXHJcbiAgICovXHJcbiAgZ2V0U2V0Q29va2llKCkge1xyXG4gICAgY29uc3Qgc2V0Q29va2llSGVhZGVyID0gdGhpcy5nZXQoXCJzZXQtY29va2llXCIpO1xyXG4gICAgaWYgKHNldENvb2tpZUhlYWRlciA9PT0gbnVsbCkge1xyXG4gICAgICByZXR1cm4gW107XHJcbiAgICB9XHJcbiAgICBpZiAoc2V0Q29va2llSGVhZGVyID09PSBcIlwiKSB7XHJcbiAgICAgIHJldHVybiBbXCJcIl07XHJcbiAgICB9XHJcbiAgICByZXR1cm4gKDAsIGltcG9ydF9zZXRfY29va2llX3BhcnNlci5zcGxpdENvb2tpZXNTdHJpbmcpKHNldENvb2tpZUhlYWRlcik7XHJcbiAgfVxyXG59O1xyXG5cclxuLy8gc3JjL2dldFJhd0hlYWRlcnMudHNcclxuZnVuY3Rpb24gZ2V0UmF3SGVhZGVycyhoZWFkZXJzKSB7XHJcbiAgY29uc3QgcmF3SGVhZGVycyA9IHt9O1xyXG4gIGZvciAoY29uc3QgW25hbWUsIHZhbHVlXSBvZiBoZWFkZXJzLmVudHJpZXMoKSkge1xyXG4gICAgcmF3SGVhZGVyc1toZWFkZXJzW1JBV19IRUFERVJfTkFNRVNdLmdldChuYW1lKV0gPSB2YWx1ZTtcclxuICB9XHJcbiAgcmV0dXJuIHJhd0hlYWRlcnM7XHJcbn1cclxuXHJcbi8vIHNyYy90cmFuc2Zvcm1lcnMvaGVhZGVyc1RvTGlzdC50c1xyXG5mdW5jdGlvbiBoZWFkZXJzVG9MaXN0KGhlYWRlcnMpIHtcclxuICBjb25zdCBoZWFkZXJzTGlzdCA9IFtdO1xyXG4gIGhlYWRlcnMuZm9yRWFjaCgodmFsdWUsIG5hbWUpID0+IHtcclxuICAgIGNvbnN0IHJlc29sdmVkVmFsdWUgPSB2YWx1ZS5pbmNsdWRlcyhcIixcIikgPyB2YWx1ZS5zcGxpdChcIixcIikubWFwKCh2YWx1ZTIpID0+IHZhbHVlMi50cmltKCkpIDogdmFsdWU7XHJcbiAgICBoZWFkZXJzTGlzdC5wdXNoKFtuYW1lLCByZXNvbHZlZFZhbHVlXSk7XHJcbiAgfSk7XHJcbiAgcmV0dXJuIGhlYWRlcnNMaXN0O1xyXG59XHJcblxyXG4vLyBzcmMvdHJhbnNmb3JtZXJzL2hlYWRlcnNUb1N0cmluZy50c1xyXG5mdW5jdGlvbiBoZWFkZXJzVG9TdHJpbmcoaGVhZGVycykge1xyXG4gIGNvbnN0IGxpc3QgPSBoZWFkZXJzVG9MaXN0KGhlYWRlcnMpO1xyXG4gIGNvbnN0IGxpbmVzID0gbGlzdC5tYXAoKFtuYW1lLCB2YWx1ZV0pID0+IHtcclxuICAgIGNvbnN0IHZhbHVlcyA9IFtdLmNvbmNhdCh2YWx1ZSk7XHJcbiAgICByZXR1cm4gYCR7bmFtZX06ICR7dmFsdWVzLmpvaW4oXCIsIFwiKX1gO1xyXG4gIH0pO1xyXG4gIHJldHVybiBsaW5lcy5qb2luKFwiXFxyXFxuXCIpO1xyXG59XHJcblxyXG4vLyBzcmMvdHJhbnNmb3JtZXJzL2hlYWRlcnNUb09iamVjdC50c1xyXG52YXIgc2luZ2xlVmFsdWVIZWFkZXJzID0gW1widXNlci1hZ2VudFwiXTtcclxuZnVuY3Rpb24gaGVhZGVyc1RvT2JqZWN0KGhlYWRlcnMpIHtcclxuICBjb25zdCBoZWFkZXJzT2JqZWN0ID0ge307XHJcbiAgaGVhZGVycy5mb3JFYWNoKCh2YWx1ZSwgbmFtZSkgPT4ge1xyXG4gICAgY29uc3QgaXNNdWx0aVZhbHVlID0gIXNpbmdsZVZhbHVlSGVhZGVycy5pbmNsdWRlcyhuYW1lLnRvTG93ZXJDYXNlKCkpICYmIHZhbHVlLmluY2x1ZGVzKFwiLFwiKTtcclxuICAgIGhlYWRlcnNPYmplY3RbbmFtZV0gPSBpc011bHRpVmFsdWUgPyB2YWx1ZS5zcGxpdChcIixcIikubWFwKChzKSA9PiBzLnRyaW0oKSkgOiB2YWx1ZTtcclxuICB9KTtcclxuICByZXR1cm4gaGVhZGVyc09iamVjdDtcclxufVxyXG5cclxuLy8gc3JjL3RyYW5zZm9ybWVycy9zdHJpbmdUb0hlYWRlcnMudHNcclxuZnVuY3Rpb24gc3RyaW5nVG9IZWFkZXJzKHN0cikge1xyXG4gIGNvbnN0IGxpbmVzID0gc3RyLnRyaW0oKS5zcGxpdCgvW1xcclxcbl0rLyk7XHJcbiAgcmV0dXJuIGxpbmVzLnJlZHVjZSgoaGVhZGVycywgbGluZSkgPT4ge1xyXG4gICAgaWYgKGxpbmUudHJpbSgpID09PSBcIlwiKSB7XHJcbiAgICAgIHJldHVybiBoZWFkZXJzO1xyXG4gICAgfVxyXG4gICAgY29uc3QgcGFydHMgPSBsaW5lLnNwbGl0KFwiOiBcIik7XHJcbiAgICBjb25zdCBuYW1lID0gcGFydHMuc2hpZnQoKTtcclxuICAgIGNvbnN0IHZhbHVlID0gcGFydHMuam9pbihcIjogXCIpO1xyXG4gICAgaGVhZGVycy5hcHBlbmQobmFtZSwgdmFsdWUpO1xyXG4gICAgcmV0dXJuIGhlYWRlcnM7XHJcbiAgfSwgbmV3IEhlYWRlcnMoKSk7XHJcbn1cclxuXHJcbi8vIHNyYy90cmFuc2Zvcm1lcnMvbGlzdFRvSGVhZGVycy50c1xyXG5mdW5jdGlvbiBsaXN0VG9IZWFkZXJzKGxpc3QpIHtcclxuICBjb25zdCBoZWFkZXJzID0gbmV3IEhlYWRlcnMoKTtcclxuICBsaXN0LmZvckVhY2goKFtuYW1lLCB2YWx1ZV0pID0+IHtcclxuICAgIGNvbnN0IHZhbHVlcyA9IFtdLmNvbmNhdCh2YWx1ZSk7XHJcbiAgICB2YWx1ZXMuZm9yRWFjaCgodmFsdWUyKSA9PiB7XHJcbiAgICAgIGhlYWRlcnMuYXBwZW5kKG5hbWUsIHZhbHVlMik7XHJcbiAgICB9KTtcclxuICB9KTtcclxuICByZXR1cm4gaGVhZGVycztcclxufVxyXG5cclxuLy8gc3JjL3RyYW5zZm9ybWVycy9yZWR1Y2VIZWFkZXJzT2JqZWN0LnRzXHJcbmZ1bmN0aW9uIHJlZHVjZUhlYWRlcnNPYmplY3QoaGVhZGVycywgcmVkdWNlciwgaW5pdGlhbFN0YXRlKSB7XHJcbiAgcmV0dXJuIE9iamVjdC5rZXlzKGhlYWRlcnMpLnJlZHVjZSgobmV4dEhlYWRlcnMsIG5hbWUpID0+IHtcclxuICAgIHJldHVybiByZWR1Y2VyKG5leHRIZWFkZXJzLCBuYW1lLCBoZWFkZXJzW25hbWVdKTtcclxuICB9LCBpbml0aWFsU3RhdGUpO1xyXG59XHJcblxyXG4vLyBzcmMvdHJhbnNmb3JtZXJzL29iamVjdFRvSGVhZGVycy50c1xyXG5mdW5jdGlvbiBvYmplY3RUb0hlYWRlcnMoaGVhZGVyc09iamVjdCkge1xyXG4gIHJldHVybiByZWR1Y2VIZWFkZXJzT2JqZWN0KFxyXG4gICAgaGVhZGVyc09iamVjdCxcclxuICAgIChoZWFkZXJzLCBuYW1lLCB2YWx1ZSkgPT4ge1xyXG4gICAgICBjb25zdCB2YWx1ZXMgPSBbXS5jb25jYXQodmFsdWUpLmZpbHRlcihCb29sZWFuKTtcclxuICAgICAgdmFsdWVzLmZvckVhY2goKHZhbHVlMikgPT4ge1xyXG4gICAgICAgIGhlYWRlcnMuYXBwZW5kKG5hbWUsIHZhbHVlMik7XHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm4gaGVhZGVycztcclxuICAgIH0sXHJcbiAgICBuZXcgSGVhZGVycygpXHJcbiAgKTtcclxufVxyXG5cclxuLy8gc3JjL3RyYW5zZm9ybWVycy9mbGF0dGVuSGVhZGVyc0xpc3QudHNcclxuZnVuY3Rpb24gZmxhdHRlbkhlYWRlcnNMaXN0KGxpc3QpIHtcclxuICByZXR1cm4gbGlzdC5tYXAoKFtuYW1lLCB2YWx1ZXNdKSA9PiB7XHJcbiAgICByZXR1cm4gW25hbWUsIFtdLmNvbmNhdCh2YWx1ZXMpLmpvaW4oXCIsIFwiKV07XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIHNyYy90cmFuc2Zvcm1lcnMvZmxhdHRlbkhlYWRlcnNPYmplY3QudHNcclxuZnVuY3Rpb24gZmxhdHRlbkhlYWRlcnNPYmplY3QoaGVhZGVyc09iamVjdCkge1xyXG4gIHJldHVybiByZWR1Y2VIZWFkZXJzT2JqZWN0KFxyXG4gICAgaGVhZGVyc09iamVjdCxcclxuICAgIChoZWFkZXJzLCBuYW1lLCB2YWx1ZSkgPT4ge1xyXG4gICAgICBoZWFkZXJzW25hbWVdID0gW10uY29uY2F0KHZhbHVlKS5qb2luKFwiLCBcIik7XHJcbiAgICAgIHJldHVybiBoZWFkZXJzO1xyXG4gICAgfSxcclxuICAgIHt9XHJcbiAgKTtcclxufVxyXG5leHBvcnQge1xyXG4gIEhlYWRlcnMsXHJcbiAgZmxhdHRlbkhlYWRlcnNMaXN0LFxyXG4gIGZsYXR0ZW5IZWFkZXJzT2JqZWN0LFxyXG4gIGdldFJhd0hlYWRlcnMsXHJcbiAgaGVhZGVyc1RvTGlzdCxcclxuICBoZWFkZXJzVG9PYmplY3QsXHJcbiAgaGVhZGVyc1RvU3RyaW5nLFxyXG4gIGxpc3RUb0hlYWRlcnMsXHJcbiAgb2JqZWN0VG9IZWFkZXJzLFxyXG4gIHJlZHVjZUhlYWRlcnNPYmplY3QsXHJcbiAgc3RyaW5nVG9IZWFkZXJzXHJcbn07XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4Lm1qcy5tYXAiLCJpbXBvcnQgKiBhcyBfc3lzY2FsbHMyXzAgZnJvbSAnc3BhY2V0aW1lOnN5c0AyLjAnO1xyXG5pbXBvcnQgeyBtb2R1bGVIb29rcyB9IGZyb20gJ3NwYWNldGltZTpzeXNAMi4wJztcclxuaW1wb3J0IHsgaGVhZGVyc1RvTGlzdCwgSGVhZGVycyB9IGZyb20gJ2hlYWRlcnMtcG9seWZpbGwnO1xyXG5cclxudHlwZW9mIGdsb2JhbFRoaXMhPT1cInVuZGVmaW5lZFwiJiYoKGdsb2JhbFRoaXMuZ2xvYmFsPWdsb2JhbFRoaXMuZ2xvYmFsfHxnbG9iYWxUaGlzKSwoZ2xvYmFsVGhpcy53aW5kb3c9Z2xvYmFsVGhpcy53aW5kb3d8fGdsb2JhbFRoaXMpKTtcclxudmFyIF9fY3JlYXRlID0gT2JqZWN0LmNyZWF0ZTtcclxudmFyIF9fZGVmUHJvcCA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eTtcclxudmFyIF9fZ2V0T3duUHJvcERlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yO1xyXG52YXIgX19nZXRPd25Qcm9wTmFtZXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcztcclxudmFyIF9fZ2V0UHJvdG9PZiA9IE9iamVjdC5nZXRQcm90b3R5cGVPZjtcclxudmFyIF9faGFzT3duUHJvcCA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XHJcbnZhciBfX2VzbSA9IChmbiwgcmVzKSA9PiBmdW5jdGlvbiBfX2luaXQoKSB7XHJcbiAgcmV0dXJuIGZuICYmIChyZXMgPSAoMCwgZm5bX19nZXRPd25Qcm9wTmFtZXMoZm4pWzBdXSkoZm4gPSAwKSksIHJlcztcclxufTtcclxudmFyIF9fY29tbW9uSlMgPSAoY2IsIG1vZCkgPT4gZnVuY3Rpb24gX19yZXF1aXJlKCkge1xyXG4gIHJldHVybiBtb2QgfHwgKDAsIGNiW19fZ2V0T3duUHJvcE5hbWVzKGNiKVswXV0pKChtb2QgPSB7IGV4cG9ydHM6IHt9IH0pLmV4cG9ydHMsIG1vZCksIG1vZC5leHBvcnRzO1xyXG59O1xyXG52YXIgX19leHBvcnQgPSAodGFyZ2V0LCBhbGwpID0+IHtcclxuICBmb3IgKHZhciBuYW1lIGluIGFsbClcclxuICAgIF9fZGVmUHJvcCh0YXJnZXQsIG5hbWUsIHsgZ2V0OiBhbGxbbmFtZV0sIGVudW1lcmFibGU6IHRydWUgfSk7XHJcbn07XHJcbnZhciBfX2NvcHlQcm9wcyA9ICh0bywgZnJvbSwgZXhjZXB0LCBkZXNjKSA9PiB7XHJcbiAgaWYgKGZyb20gJiYgdHlwZW9mIGZyb20gPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGZyb20gPT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgZm9yIChsZXQga2V5IG9mIF9fZ2V0T3duUHJvcE5hbWVzKGZyb20pKVxyXG4gICAgICBpZiAoIV9faGFzT3duUHJvcC5jYWxsKHRvLCBrZXkpICYmIGtleSAhPT0gZXhjZXB0KVxyXG4gICAgICAgIF9fZGVmUHJvcCh0bywga2V5LCB7IGdldDogKCkgPT4gZnJvbVtrZXldLCBlbnVtZXJhYmxlOiAhKGRlc2MgPSBfX2dldE93blByb3BEZXNjKGZyb20sIGtleSkpIHx8IGRlc2MuZW51bWVyYWJsZSB9KTtcclxuICB9XHJcbiAgcmV0dXJuIHRvO1xyXG59O1xyXG52YXIgX190b0VTTSA9IChtb2QsIGlzTm9kZU1vZGUsIHRhcmdldCkgPT4gKHRhcmdldCA9IG1vZCAhPSBudWxsID8gX19jcmVhdGUoX19nZXRQcm90b09mKG1vZCkpIDoge30sIF9fY29weVByb3BzKFxyXG4gIC8vIElmIHRoZSBpbXBvcnRlciBpcyBpbiBub2RlIGNvbXBhdGliaWxpdHkgbW9kZSBvciB0aGlzIGlzIG5vdCBhbiBFU01cclxuICAvLyBmaWxlIHRoYXQgaGFzIGJlZW4gY29udmVydGVkIHRvIGEgQ29tbW9uSlMgZmlsZSB1c2luZyBhIEJhYmVsLVxyXG4gIC8vIGNvbXBhdGlibGUgdHJhbnNmb3JtIChpLmUuIFwiX19lc01vZHVsZVwiIGhhcyBub3QgYmVlbiBzZXQpLCB0aGVuIHNldFxyXG4gIC8vIFwiZGVmYXVsdFwiIHRvIHRoZSBDb21tb25KUyBcIm1vZHVsZS5leHBvcnRzXCIgZm9yIG5vZGUgY29tcGF0aWJpbGl0eS5cclxuICBfX2RlZlByb3AodGFyZ2V0LCBcImRlZmF1bHRcIiwgeyB2YWx1ZTogbW9kLCBlbnVtZXJhYmxlOiB0cnVlIH0pICxcclxuICBtb2RcclxuKSk7XHJcbnZhciBfX3RvQ29tbW9uSlMgPSAobW9kKSA9PiBfX2NvcHlQcm9wcyhfX2RlZlByb3Aoe30sIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pLCBtb2QpO1xyXG5cclxuLy8gLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL2Jhc2U2NC1qc0AxLjUuMS9ub2RlX21vZHVsZXMvYmFzZTY0LWpzL2luZGV4LmpzXHJcbnZhciByZXF1aXJlX2Jhc2U2NF9qcyA9IF9fY29tbW9uSlMoe1xyXG4gIFwiLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL2Jhc2U2NC1qc0AxLjUuMS9ub2RlX21vZHVsZXMvYmFzZTY0LWpzL2luZGV4LmpzXCIoZXhwb3J0cykge1xyXG4gICAgZXhwb3J0cy5ieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aDtcclxuICAgIGV4cG9ydHMudG9CeXRlQXJyYXkgPSB0b0J5dGVBcnJheTtcclxuICAgIGV4cG9ydHMuZnJvbUJ5dGVBcnJheSA9IGZyb21CeXRlQXJyYXkyO1xyXG4gICAgdmFyIGxvb2t1cCA9IFtdO1xyXG4gICAgdmFyIHJldkxvb2t1cCA9IFtdO1xyXG4gICAgdmFyIEFyciA9IHR5cGVvZiBVaW50OEFycmF5ICE9PSBcInVuZGVmaW5lZFwiID8gVWludDhBcnJheSA6IEFycmF5O1xyXG4gICAgdmFyIGNvZGUgPSBcIkFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky9cIjtcclxuICAgIGZvciAoaSA9IDAsIGxlbiA9IGNvZGUubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcclxuICAgICAgbG9va3VwW2ldID0gY29kZVtpXTtcclxuICAgICAgcmV2TG9va3VwW2NvZGUuY2hhckNvZGVBdChpKV0gPSBpO1xyXG4gICAgfVxyXG4gICAgdmFyIGk7XHJcbiAgICB2YXIgbGVuO1xyXG4gICAgcmV2TG9va3VwW1wiLVwiLmNoYXJDb2RlQXQoMCldID0gNjI7XHJcbiAgICByZXZMb29rdXBbXCJfXCIuY2hhckNvZGVBdCgwKV0gPSA2MztcclxuICAgIGZ1bmN0aW9uIGdldExlbnMoYjY0KSB7XHJcbiAgICAgIHZhciBsZW4yID0gYjY0Lmxlbmd0aDtcclxuICAgICAgaWYgKGxlbjIgJSA0ID4gMCkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgc3RyaW5nLiBMZW5ndGggbXVzdCBiZSBhIG11bHRpcGxlIG9mIDRcIik7XHJcbiAgICAgIH1cclxuICAgICAgdmFyIHZhbGlkTGVuID0gYjY0LmluZGV4T2YoXCI9XCIpO1xyXG4gICAgICBpZiAodmFsaWRMZW4gPT09IC0xKSB2YWxpZExlbiA9IGxlbjI7XHJcbiAgICAgIHZhciBwbGFjZUhvbGRlcnNMZW4gPSB2YWxpZExlbiA9PT0gbGVuMiA/IDAgOiA0IC0gdmFsaWRMZW4gJSA0O1xyXG4gICAgICByZXR1cm4gW3ZhbGlkTGVuLCBwbGFjZUhvbGRlcnNMZW5dO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gYnl0ZUxlbmd0aChiNjQpIHtcclxuICAgICAgdmFyIGxlbnMgPSBnZXRMZW5zKGI2NCk7XHJcbiAgICAgIHZhciB2YWxpZExlbiA9IGxlbnNbMF07XHJcbiAgICAgIHZhciBwbGFjZUhvbGRlcnNMZW4gPSBsZW5zWzFdO1xyXG4gICAgICByZXR1cm4gKHZhbGlkTGVuICsgcGxhY2VIb2xkZXJzTGVuKSAqIDMgLyA0IC0gcGxhY2VIb2xkZXJzTGVuO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gX2J5dGVMZW5ndGgoYjY0LCB2YWxpZExlbiwgcGxhY2VIb2xkZXJzTGVuKSB7XHJcbiAgICAgIHJldHVybiAodmFsaWRMZW4gKyBwbGFjZUhvbGRlcnNMZW4pICogMyAvIDQgLSBwbGFjZUhvbGRlcnNMZW47XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiB0b0J5dGVBcnJheShiNjQpIHtcclxuICAgICAgdmFyIHRtcDtcclxuICAgICAgdmFyIGxlbnMgPSBnZXRMZW5zKGI2NCk7XHJcbiAgICAgIHZhciB2YWxpZExlbiA9IGxlbnNbMF07XHJcbiAgICAgIHZhciBwbGFjZUhvbGRlcnNMZW4gPSBsZW5zWzFdO1xyXG4gICAgICB2YXIgYXJyID0gbmV3IEFycihfYnl0ZUxlbmd0aChiNjQsIHZhbGlkTGVuLCBwbGFjZUhvbGRlcnNMZW4pKTtcclxuICAgICAgdmFyIGN1ckJ5dGUgPSAwO1xyXG4gICAgICB2YXIgbGVuMiA9IHBsYWNlSG9sZGVyc0xlbiA+IDAgPyB2YWxpZExlbiAtIDQgOiB2YWxpZExlbjtcclxuICAgICAgdmFyIGkyO1xyXG4gICAgICBmb3IgKGkyID0gMDsgaTIgPCBsZW4yOyBpMiArPSA0KSB7XHJcbiAgICAgICAgdG1wID0gcmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkyKV0gPDwgMTggfCByZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaTIgKyAxKV0gPDwgMTIgfCByZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaTIgKyAyKV0gPDwgNiB8IHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpMiArIDMpXTtcclxuICAgICAgICBhcnJbY3VyQnl0ZSsrXSA9IHRtcCA+PiAxNiAmIDI1NTtcclxuICAgICAgICBhcnJbY3VyQnl0ZSsrXSA9IHRtcCA+PiA4ICYgMjU1O1xyXG4gICAgICAgIGFycltjdXJCeXRlKytdID0gdG1wICYgMjU1O1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChwbGFjZUhvbGRlcnNMZW4gPT09IDIpIHtcclxuICAgICAgICB0bXAgPSByZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaTIpXSA8PCAyIHwgcmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkyICsgMSldID4+IDQ7XHJcbiAgICAgICAgYXJyW2N1ckJ5dGUrK10gPSB0bXAgJiAyNTU7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHBsYWNlSG9sZGVyc0xlbiA9PT0gMSkge1xyXG4gICAgICAgIHRtcCA9IHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpMildIDw8IDEwIHwgcmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkyICsgMSldIDw8IDQgfCByZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaTIgKyAyKV0gPj4gMjtcclxuICAgICAgICBhcnJbY3VyQnl0ZSsrXSA9IHRtcCA+PiA4ICYgMjU1O1xyXG4gICAgICAgIGFycltjdXJCeXRlKytdID0gdG1wICYgMjU1O1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBhcnI7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiB0cmlwbGV0VG9CYXNlNjQobnVtKSB7XHJcbiAgICAgIHJldHVybiBsb29rdXBbbnVtID4+IDE4ICYgNjNdICsgbG9va3VwW251bSA+PiAxMiAmIDYzXSArIGxvb2t1cFtudW0gPj4gNiAmIDYzXSArIGxvb2t1cFtudW0gJiA2M107XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBlbmNvZGVDaHVuayh1aW50OCwgc3RhcnQsIGVuZCkge1xyXG4gICAgICB2YXIgdG1wO1xyXG4gICAgICB2YXIgb3V0cHV0ID0gW107XHJcbiAgICAgIGZvciAodmFyIGkyID0gc3RhcnQ7IGkyIDwgZW5kOyBpMiArPSAzKSB7XHJcbiAgICAgICAgdG1wID0gKHVpbnQ4W2kyXSA8PCAxNiAmIDE2NzExNjgwKSArICh1aW50OFtpMiArIDFdIDw8IDggJiA2NTI4MCkgKyAodWludDhbaTIgKyAyXSAmIDI1NSk7XHJcbiAgICAgICAgb3V0cHV0LnB1c2godHJpcGxldFRvQmFzZTY0KHRtcCkpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBvdXRwdXQuam9pbihcIlwiKTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGZyb21CeXRlQXJyYXkyKHVpbnQ4KSB7XHJcbiAgICAgIHZhciB0bXA7XHJcbiAgICAgIHZhciBsZW4yID0gdWludDgubGVuZ3RoO1xyXG4gICAgICB2YXIgZXh0cmFCeXRlcyA9IGxlbjIgJSAzO1xyXG4gICAgICB2YXIgcGFydHMgPSBbXTtcclxuICAgICAgdmFyIG1heENodW5rTGVuZ3RoID0gMTYzODM7XHJcbiAgICAgIGZvciAodmFyIGkyID0gMCwgbGVuMjIgPSBsZW4yIC0gZXh0cmFCeXRlczsgaTIgPCBsZW4yMjsgaTIgKz0gbWF4Q2h1bmtMZW5ndGgpIHtcclxuICAgICAgICBwYXJ0cy5wdXNoKGVuY29kZUNodW5rKHVpbnQ4LCBpMiwgaTIgKyBtYXhDaHVua0xlbmd0aCA+IGxlbjIyID8gbGVuMjIgOiBpMiArIG1heENodW5rTGVuZ3RoKSk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGV4dHJhQnl0ZXMgPT09IDEpIHtcclxuICAgICAgICB0bXAgPSB1aW50OFtsZW4yIC0gMV07XHJcbiAgICAgICAgcGFydHMucHVzaChcclxuICAgICAgICAgIGxvb2t1cFt0bXAgPj4gMl0gKyBsb29rdXBbdG1wIDw8IDQgJiA2M10gKyBcIj09XCJcclxuICAgICAgICApO1xyXG4gICAgICB9IGVsc2UgaWYgKGV4dHJhQnl0ZXMgPT09IDIpIHtcclxuICAgICAgICB0bXAgPSAodWludDhbbGVuMiAtIDJdIDw8IDgpICsgdWludDhbbGVuMiAtIDFdO1xyXG4gICAgICAgIHBhcnRzLnB1c2goXHJcbiAgICAgICAgICBsb29rdXBbdG1wID4+IDEwXSArIGxvb2t1cFt0bXAgPj4gNCAmIDYzXSArIGxvb2t1cFt0bXAgPDwgMiAmIDYzXSArIFwiPVwiXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gcGFydHMuam9pbihcIlwiKTtcclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG5cclxuLy8gLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3N0YXR1c2VzQDIuMC4yL25vZGVfbW9kdWxlcy9zdGF0dXNlcy9jb2Rlcy5qc29uXHJcbnZhciByZXF1aXJlX2NvZGVzID0gX19jb21tb25KUyh7XHJcbiAgXCIuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vc3RhdHVzZXNAMi4wLjIvbm9kZV9tb2R1bGVzL3N0YXR1c2VzL2NvZGVzLmpzb25cIihleHBvcnRzLCBtb2R1bGUpIHtcclxuICAgIG1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgICBcIjEwMFwiOiBcIkNvbnRpbnVlXCIsXHJcbiAgICAgIFwiMTAxXCI6IFwiU3dpdGNoaW5nIFByb3RvY29sc1wiLFxyXG4gICAgICBcIjEwMlwiOiBcIlByb2Nlc3NpbmdcIixcclxuICAgICAgXCIxMDNcIjogXCJFYXJseSBIaW50c1wiLFxyXG4gICAgICBcIjIwMFwiOiBcIk9LXCIsXHJcbiAgICAgIFwiMjAxXCI6IFwiQ3JlYXRlZFwiLFxyXG4gICAgICBcIjIwMlwiOiBcIkFjY2VwdGVkXCIsXHJcbiAgICAgIFwiMjAzXCI6IFwiTm9uLUF1dGhvcml0YXRpdmUgSW5mb3JtYXRpb25cIixcclxuICAgICAgXCIyMDRcIjogXCJObyBDb250ZW50XCIsXHJcbiAgICAgIFwiMjA1XCI6IFwiUmVzZXQgQ29udGVudFwiLFxyXG4gICAgICBcIjIwNlwiOiBcIlBhcnRpYWwgQ29udGVudFwiLFxyXG4gICAgICBcIjIwN1wiOiBcIk11bHRpLVN0YXR1c1wiLFxyXG4gICAgICBcIjIwOFwiOiBcIkFscmVhZHkgUmVwb3J0ZWRcIixcclxuICAgICAgXCIyMjZcIjogXCJJTSBVc2VkXCIsXHJcbiAgICAgIFwiMzAwXCI6IFwiTXVsdGlwbGUgQ2hvaWNlc1wiLFxyXG4gICAgICBcIjMwMVwiOiBcIk1vdmVkIFBlcm1hbmVudGx5XCIsXHJcbiAgICAgIFwiMzAyXCI6IFwiRm91bmRcIixcclxuICAgICAgXCIzMDNcIjogXCJTZWUgT3RoZXJcIixcclxuICAgICAgXCIzMDRcIjogXCJOb3QgTW9kaWZpZWRcIixcclxuICAgICAgXCIzMDVcIjogXCJVc2UgUHJveHlcIixcclxuICAgICAgXCIzMDdcIjogXCJUZW1wb3JhcnkgUmVkaXJlY3RcIixcclxuICAgICAgXCIzMDhcIjogXCJQZXJtYW5lbnQgUmVkaXJlY3RcIixcclxuICAgICAgXCI0MDBcIjogXCJCYWQgUmVxdWVzdFwiLFxyXG4gICAgICBcIjQwMVwiOiBcIlVuYXV0aG9yaXplZFwiLFxyXG4gICAgICBcIjQwMlwiOiBcIlBheW1lbnQgUmVxdWlyZWRcIixcclxuICAgICAgXCI0MDNcIjogXCJGb3JiaWRkZW5cIixcclxuICAgICAgXCI0MDRcIjogXCJOb3QgRm91bmRcIixcclxuICAgICAgXCI0MDVcIjogXCJNZXRob2QgTm90IEFsbG93ZWRcIixcclxuICAgICAgXCI0MDZcIjogXCJOb3QgQWNjZXB0YWJsZVwiLFxyXG4gICAgICBcIjQwN1wiOiBcIlByb3h5IEF1dGhlbnRpY2F0aW9uIFJlcXVpcmVkXCIsXHJcbiAgICAgIFwiNDA4XCI6IFwiUmVxdWVzdCBUaW1lb3V0XCIsXHJcbiAgICAgIFwiNDA5XCI6IFwiQ29uZmxpY3RcIixcclxuICAgICAgXCI0MTBcIjogXCJHb25lXCIsXHJcbiAgICAgIFwiNDExXCI6IFwiTGVuZ3RoIFJlcXVpcmVkXCIsXHJcbiAgICAgIFwiNDEyXCI6IFwiUHJlY29uZGl0aW9uIEZhaWxlZFwiLFxyXG4gICAgICBcIjQxM1wiOiBcIlBheWxvYWQgVG9vIExhcmdlXCIsXHJcbiAgICAgIFwiNDE0XCI6IFwiVVJJIFRvbyBMb25nXCIsXHJcbiAgICAgIFwiNDE1XCI6IFwiVW5zdXBwb3J0ZWQgTWVkaWEgVHlwZVwiLFxyXG4gICAgICBcIjQxNlwiOiBcIlJhbmdlIE5vdCBTYXRpc2ZpYWJsZVwiLFxyXG4gICAgICBcIjQxN1wiOiBcIkV4cGVjdGF0aW9uIEZhaWxlZFwiLFxyXG4gICAgICBcIjQxOFwiOiBcIkknbSBhIFRlYXBvdFwiLFxyXG4gICAgICBcIjQyMVwiOiBcIk1pc2RpcmVjdGVkIFJlcXVlc3RcIixcclxuICAgICAgXCI0MjJcIjogXCJVbnByb2Nlc3NhYmxlIEVudGl0eVwiLFxyXG4gICAgICBcIjQyM1wiOiBcIkxvY2tlZFwiLFxyXG4gICAgICBcIjQyNFwiOiBcIkZhaWxlZCBEZXBlbmRlbmN5XCIsXHJcbiAgICAgIFwiNDI1XCI6IFwiVG9vIEVhcmx5XCIsXHJcbiAgICAgIFwiNDI2XCI6IFwiVXBncmFkZSBSZXF1aXJlZFwiLFxyXG4gICAgICBcIjQyOFwiOiBcIlByZWNvbmRpdGlvbiBSZXF1aXJlZFwiLFxyXG4gICAgICBcIjQyOVwiOiBcIlRvbyBNYW55IFJlcXVlc3RzXCIsXHJcbiAgICAgIFwiNDMxXCI6IFwiUmVxdWVzdCBIZWFkZXIgRmllbGRzIFRvbyBMYXJnZVwiLFxyXG4gICAgICBcIjQ1MVwiOiBcIlVuYXZhaWxhYmxlIEZvciBMZWdhbCBSZWFzb25zXCIsXHJcbiAgICAgIFwiNTAwXCI6IFwiSW50ZXJuYWwgU2VydmVyIEVycm9yXCIsXHJcbiAgICAgIFwiNTAxXCI6IFwiTm90IEltcGxlbWVudGVkXCIsXHJcbiAgICAgIFwiNTAyXCI6IFwiQmFkIEdhdGV3YXlcIixcclxuICAgICAgXCI1MDNcIjogXCJTZXJ2aWNlIFVuYXZhaWxhYmxlXCIsXHJcbiAgICAgIFwiNTA0XCI6IFwiR2F0ZXdheSBUaW1lb3V0XCIsXHJcbiAgICAgIFwiNTA1XCI6IFwiSFRUUCBWZXJzaW9uIE5vdCBTdXBwb3J0ZWRcIixcclxuICAgICAgXCI1MDZcIjogXCJWYXJpYW50IEFsc28gTmVnb3RpYXRlc1wiLFxyXG4gICAgICBcIjUwN1wiOiBcIkluc3VmZmljaWVudCBTdG9yYWdlXCIsXHJcbiAgICAgIFwiNTA4XCI6IFwiTG9vcCBEZXRlY3RlZFwiLFxyXG4gICAgICBcIjUwOVwiOiBcIkJhbmR3aWR0aCBMaW1pdCBFeGNlZWRlZFwiLFxyXG4gICAgICBcIjUxMFwiOiBcIk5vdCBFeHRlbmRlZFwiLFxyXG4gICAgICBcIjUxMVwiOiBcIk5ldHdvcmsgQXV0aGVudGljYXRpb24gUmVxdWlyZWRcIlxyXG4gICAgfTtcclxuICB9XHJcbn0pO1xyXG5cclxuLy8gLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3N0YXR1c2VzQDIuMC4yL25vZGVfbW9kdWxlcy9zdGF0dXNlcy9pbmRleC5qc1xyXG52YXIgcmVxdWlyZV9zdGF0dXNlcyA9IF9fY29tbW9uSlMoe1xyXG4gIFwiLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3N0YXR1c2VzQDIuMC4yL25vZGVfbW9kdWxlcy9zdGF0dXNlcy9pbmRleC5qc1wiKGV4cG9ydHMsIG1vZHVsZSkge1xyXG4gICAgdmFyIGNvZGVzID0gcmVxdWlyZV9jb2RlcygpO1xyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBzdGF0dXMyO1xyXG4gICAgc3RhdHVzMi5tZXNzYWdlID0gY29kZXM7XHJcbiAgICBzdGF0dXMyLmNvZGUgPSBjcmVhdGVNZXNzYWdlVG9TdGF0dXNDb2RlTWFwKGNvZGVzKTtcclxuICAgIHN0YXR1czIuY29kZXMgPSBjcmVhdGVTdGF0dXNDb2RlTGlzdChjb2Rlcyk7XHJcbiAgICBzdGF0dXMyLnJlZGlyZWN0ID0ge1xyXG4gICAgICAzMDA6IHRydWUsXHJcbiAgICAgIDMwMTogdHJ1ZSxcclxuICAgICAgMzAyOiB0cnVlLFxyXG4gICAgICAzMDM6IHRydWUsXHJcbiAgICAgIDMwNTogdHJ1ZSxcclxuICAgICAgMzA3OiB0cnVlLFxyXG4gICAgICAzMDg6IHRydWVcclxuICAgIH07XHJcbiAgICBzdGF0dXMyLmVtcHR5ID0ge1xyXG4gICAgICAyMDQ6IHRydWUsXHJcbiAgICAgIDIwNTogdHJ1ZSxcclxuICAgICAgMzA0OiB0cnVlXHJcbiAgICB9O1xyXG4gICAgc3RhdHVzMi5yZXRyeSA9IHtcclxuICAgICAgNTAyOiB0cnVlLFxyXG4gICAgICA1MDM6IHRydWUsXHJcbiAgICAgIDUwNDogdHJ1ZVxyXG4gICAgfTtcclxuICAgIGZ1bmN0aW9uIGNyZWF0ZU1lc3NhZ2VUb1N0YXR1c0NvZGVNYXAoY29kZXMyKSB7XHJcbiAgICAgIHZhciBtYXAgPSB7fTtcclxuICAgICAgT2JqZWN0LmtleXMoY29kZXMyKS5mb3JFYWNoKGZ1bmN0aW9uIGZvckVhY2hDb2RlKGNvZGUpIHtcclxuICAgICAgICB2YXIgbWVzc2FnZSA9IGNvZGVzMltjb2RlXTtcclxuICAgICAgICB2YXIgc3RhdHVzMyA9IE51bWJlcihjb2RlKTtcclxuICAgICAgICBtYXBbbWVzc2FnZS50b0xvd2VyQ2FzZSgpXSA9IHN0YXR1czM7XHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm4gbWFwO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gY3JlYXRlU3RhdHVzQ29kZUxpc3QoY29kZXMyKSB7XHJcbiAgICAgIHJldHVybiBPYmplY3Qua2V5cyhjb2RlczIpLm1hcChmdW5jdGlvbiBtYXBDb2RlKGNvZGUpIHtcclxuICAgICAgICByZXR1cm4gTnVtYmVyKGNvZGUpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGdldFN0YXR1c0NvZGUobWVzc2FnZSkge1xyXG4gICAgICB2YXIgbXNnID0gbWVzc2FnZS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICBpZiAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzdGF0dXMyLmNvZGUsIG1zZykpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgc3RhdHVzIG1lc3NhZ2U6IFwiJyArIG1lc3NhZ2UgKyAnXCInKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gc3RhdHVzMi5jb2RlW21zZ107XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBnZXRTdGF0dXNNZXNzYWdlKGNvZGUpIHtcclxuICAgICAgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc3RhdHVzMi5tZXNzYWdlLCBjb2RlKSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImludmFsaWQgc3RhdHVzIGNvZGU6IFwiICsgY29kZSk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHN0YXR1czIubWVzc2FnZVtjb2RlXTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIHN0YXR1czIoY29kZSkge1xyXG4gICAgICBpZiAodHlwZW9mIGNvZGUgPT09IFwibnVtYmVyXCIpIHtcclxuICAgICAgICByZXR1cm4gZ2V0U3RhdHVzTWVzc2FnZShjb2RlKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAodHlwZW9mIGNvZGUgIT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiY29kZSBtdXN0IGJlIGEgbnVtYmVyIG9yIHN0cmluZ1wiKTtcclxuICAgICAgfVxyXG4gICAgICB2YXIgbiA9IHBhcnNlSW50KGNvZGUsIDEwKTtcclxuICAgICAgaWYgKCFpc05hTihuKSkge1xyXG4gICAgICAgIHJldHVybiBnZXRTdGF0dXNNZXNzYWdlKG4pO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBnZXRTdGF0dXNDb2RlKGNvZGUpO1xyXG4gICAgfVxyXG4gIH1cclxufSk7XHJcblxyXG4vLyBzcmMvdXRpbC1zdHViLnRzXHJcbnZhciB1dGlsX3N0dWJfZXhwb3J0cyA9IHt9O1xyXG5fX2V4cG9ydCh1dGlsX3N0dWJfZXhwb3J0cywge1xyXG4gIGluc3BlY3Q6ICgpID0+IGluc3BlY3RcclxufSk7XHJcbnZhciBpbnNwZWN0O1xyXG52YXIgaW5pdF91dGlsX3N0dWIgPSBfX2VzbSh7XHJcbiAgXCJzcmMvdXRpbC1zdHViLnRzXCIoKSB7XHJcbiAgICBpbnNwZWN0ID0ge307XHJcbiAgfVxyXG59KTtcclxuXHJcbi8vIC4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9vYmplY3QtaW5zcGVjdEAxLjEzLjQvbm9kZV9tb2R1bGVzL29iamVjdC1pbnNwZWN0L3V0aWwuaW5zcGVjdC5qc1xyXG52YXIgcmVxdWlyZV91dGlsX2luc3BlY3QgPSBfX2NvbW1vbkpTKHtcclxuICBcIi4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9vYmplY3QtaW5zcGVjdEAxLjEzLjQvbm9kZV9tb2R1bGVzL29iamVjdC1pbnNwZWN0L3V0aWwuaW5zcGVjdC5qc1wiKGV4cG9ydHMsIG1vZHVsZSkge1xyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSAoaW5pdF91dGlsX3N0dWIoKSwgX190b0NvbW1vbkpTKHV0aWxfc3R1Yl9leHBvcnRzKSkuaW5zcGVjdDtcclxuICB9XHJcbn0pO1xyXG5cclxuLy8gLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL29iamVjdC1pbnNwZWN0QDEuMTMuNC9ub2RlX21vZHVsZXMvb2JqZWN0LWluc3BlY3QvaW5kZXguanNcclxudmFyIHJlcXVpcmVfb2JqZWN0X2luc3BlY3QgPSBfX2NvbW1vbkpTKHtcclxuICBcIi4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9vYmplY3QtaW5zcGVjdEAxLjEzLjQvbm9kZV9tb2R1bGVzL29iamVjdC1pbnNwZWN0L2luZGV4LmpzXCIoZXhwb3J0cywgbW9kdWxlKSB7XHJcbiAgICB2YXIgaGFzTWFwID0gdHlwZW9mIE1hcCA9PT0gXCJmdW5jdGlvblwiICYmIE1hcC5wcm90b3R5cGU7XHJcbiAgICB2YXIgbWFwU2l6ZURlc2NyaXB0b3IgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yICYmIGhhc01hcCA/IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoTWFwLnByb3RvdHlwZSwgXCJzaXplXCIpIDogbnVsbDtcclxuICAgIHZhciBtYXBTaXplID0gaGFzTWFwICYmIG1hcFNpemVEZXNjcmlwdG9yICYmIHR5cGVvZiBtYXBTaXplRGVzY3JpcHRvci5nZXQgPT09IFwiZnVuY3Rpb25cIiA/IG1hcFNpemVEZXNjcmlwdG9yLmdldCA6IG51bGw7XHJcbiAgICB2YXIgbWFwRm9yRWFjaCA9IGhhc01hcCAmJiBNYXAucHJvdG90eXBlLmZvckVhY2g7XHJcbiAgICB2YXIgaGFzU2V0ID0gdHlwZW9mIFNldCA9PT0gXCJmdW5jdGlvblwiICYmIFNldC5wcm90b3R5cGU7XHJcbiAgICB2YXIgc2V0U2l6ZURlc2NyaXB0b3IgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yICYmIGhhc1NldCA/IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoU2V0LnByb3RvdHlwZSwgXCJzaXplXCIpIDogbnVsbDtcclxuICAgIHZhciBzZXRTaXplID0gaGFzU2V0ICYmIHNldFNpemVEZXNjcmlwdG9yICYmIHR5cGVvZiBzZXRTaXplRGVzY3JpcHRvci5nZXQgPT09IFwiZnVuY3Rpb25cIiA/IHNldFNpemVEZXNjcmlwdG9yLmdldCA6IG51bGw7XHJcbiAgICB2YXIgc2V0Rm9yRWFjaCA9IGhhc1NldCAmJiBTZXQucHJvdG90eXBlLmZvckVhY2g7XHJcbiAgICB2YXIgaGFzV2Vha01hcCA9IHR5cGVvZiBXZWFrTWFwID09PSBcImZ1bmN0aW9uXCIgJiYgV2Vha01hcC5wcm90b3R5cGU7XHJcbiAgICB2YXIgd2Vha01hcEhhcyA9IGhhc1dlYWtNYXAgPyBXZWFrTWFwLnByb3RvdHlwZS5oYXMgOiBudWxsO1xyXG4gICAgdmFyIGhhc1dlYWtTZXQgPSB0eXBlb2YgV2Vha1NldCA9PT0gXCJmdW5jdGlvblwiICYmIFdlYWtTZXQucHJvdG90eXBlO1xyXG4gICAgdmFyIHdlYWtTZXRIYXMgPSBoYXNXZWFrU2V0ID8gV2Vha1NldC5wcm90b3R5cGUuaGFzIDogbnVsbDtcclxuICAgIHZhciBoYXNXZWFrUmVmID0gdHlwZW9mIFdlYWtSZWYgPT09IFwiZnVuY3Rpb25cIiAmJiBXZWFrUmVmLnByb3RvdHlwZTtcclxuICAgIHZhciB3ZWFrUmVmRGVyZWYgPSBoYXNXZWFrUmVmID8gV2Vha1JlZi5wcm90b3R5cGUuZGVyZWYgOiBudWxsO1xyXG4gICAgdmFyIGJvb2xlYW5WYWx1ZU9mID0gQm9vbGVhbi5wcm90b3R5cGUudmFsdWVPZjtcclxuICAgIHZhciBvYmplY3RUb1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XHJcbiAgICB2YXIgZnVuY3Rpb25Ub1N0cmluZyA9IEZ1bmN0aW9uLnByb3RvdHlwZS50b1N0cmluZztcclxuICAgIHZhciAkbWF0Y2ggPSBTdHJpbmcucHJvdG90eXBlLm1hdGNoO1xyXG4gICAgdmFyICRzbGljZSA9IFN0cmluZy5wcm90b3R5cGUuc2xpY2U7XHJcbiAgICB2YXIgJHJlcGxhY2UgPSBTdHJpbmcucHJvdG90eXBlLnJlcGxhY2U7XHJcbiAgICB2YXIgJHRvVXBwZXJDYXNlID0gU3RyaW5nLnByb3RvdHlwZS50b1VwcGVyQ2FzZTtcclxuICAgIHZhciAkdG9Mb3dlckNhc2UgPSBTdHJpbmcucHJvdG90eXBlLnRvTG93ZXJDYXNlO1xyXG4gICAgdmFyICR0ZXN0ID0gUmVnRXhwLnByb3RvdHlwZS50ZXN0O1xyXG4gICAgdmFyICRjb25jYXQgPSBBcnJheS5wcm90b3R5cGUuY29uY2F0O1xyXG4gICAgdmFyICRqb2luID0gQXJyYXkucHJvdG90eXBlLmpvaW47XHJcbiAgICB2YXIgJGFyclNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xyXG4gICAgdmFyICRmbG9vciA9IE1hdGguZmxvb3I7XHJcbiAgICB2YXIgYmlnSW50VmFsdWVPZiA9IHR5cGVvZiBCaWdJbnQgPT09IFwiZnVuY3Rpb25cIiA/IEJpZ0ludC5wcm90b3R5cGUudmFsdWVPZiA6IG51bGw7XHJcbiAgICB2YXIgZ09QUyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHM7XHJcbiAgICB2YXIgc3ltVG9TdHJpbmcgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIiA/IFN5bWJvbC5wcm90b3R5cGUudG9TdHJpbmcgOiBudWxsO1xyXG4gICAgdmFyIGhhc1NoYW1tZWRTeW1ib2xzID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwib2JqZWN0XCI7XHJcbiAgICB2YXIgdG9TdHJpbmdUYWcgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgU3ltYm9sLnRvU3RyaW5nVGFnICYmICh0eXBlb2YgU3ltYm9sLnRvU3RyaW5nVGFnID09PSBoYXNTaGFtbWVkU3ltYm9scyA/IFwib2JqZWN0XCIgOiBcInN5bWJvbFwiKSA/IFN5bWJvbC50b1N0cmluZ1RhZyA6IG51bGw7XHJcbiAgICB2YXIgaXNFbnVtZXJhYmxlID0gT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZTtcclxuICAgIHZhciBnUE8gPSAodHlwZW9mIFJlZmxlY3QgPT09IFwiZnVuY3Rpb25cIiA/IFJlZmxlY3QuZ2V0UHJvdG90eXBlT2YgOiBPYmplY3QuZ2V0UHJvdG90eXBlT2YpIHx8IChbXS5fX3Byb3RvX18gPT09IEFycmF5LnByb3RvdHlwZSA/IGZ1bmN0aW9uKE8pIHtcclxuICAgICAgcmV0dXJuIE8uX19wcm90b19fO1xyXG4gICAgfSA6IG51bGwpO1xyXG4gICAgZnVuY3Rpb24gYWRkTnVtZXJpY1NlcGFyYXRvcihudW0sIHN0cikge1xyXG4gICAgICBpZiAobnVtID09PSBJbmZpbml0eSB8fCBudW0gPT09IC1JbmZpbml0eSB8fCBudW0gIT09IG51bSB8fCBudW0gJiYgbnVtID4gLTFlMyAmJiBudW0gPCAxZTMgfHwgJHRlc3QuY2FsbCgvZS8sIHN0cikpIHtcclxuICAgICAgICByZXR1cm4gc3RyO1xyXG4gICAgICB9XHJcbiAgICAgIHZhciBzZXBSZWdleCA9IC9bMC05XSg/PSg/OlswLTldezN9KSsoPyFbMC05XSkpL2c7XHJcbiAgICAgIGlmICh0eXBlb2YgbnVtID09PSBcIm51bWJlclwiKSB7XHJcbiAgICAgICAgdmFyIGludCA9IG51bSA8IDAgPyAtJGZsb29yKC1udW0pIDogJGZsb29yKG51bSk7XHJcbiAgICAgICAgaWYgKGludCAhPT0gbnVtKSB7XHJcbiAgICAgICAgICB2YXIgaW50U3RyID0gU3RyaW5nKGludCk7XHJcbiAgICAgICAgICB2YXIgZGVjID0gJHNsaWNlLmNhbGwoc3RyLCBpbnRTdHIubGVuZ3RoICsgMSk7XHJcbiAgICAgICAgICByZXR1cm4gJHJlcGxhY2UuY2FsbChpbnRTdHIsIHNlcFJlZ2V4LCBcIiQmX1wiKSArIFwiLlwiICsgJHJlcGxhY2UuY2FsbCgkcmVwbGFjZS5jYWxsKGRlYywgLyhbMC05XXszfSkvZywgXCIkJl9cIiksIC9fJC8sIFwiXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gJHJlcGxhY2UuY2FsbChzdHIsIHNlcFJlZ2V4LCBcIiQmX1wiKTtcclxuICAgIH1cclxuICAgIHZhciB1dGlsSW5zcGVjdCA9IHJlcXVpcmVfdXRpbF9pbnNwZWN0KCk7XHJcbiAgICB2YXIgaW5zcGVjdEN1c3RvbSA9IHV0aWxJbnNwZWN0LmN1c3RvbTtcclxuICAgIHZhciBpbnNwZWN0U3ltYm9sID0gaXNTeW1ib2woaW5zcGVjdEN1c3RvbSkgPyBpbnNwZWN0Q3VzdG9tIDogbnVsbDtcclxuICAgIHZhciBxdW90ZXMgPSB7XHJcbiAgICAgIF9fcHJvdG9fXzogbnVsbCxcclxuICAgICAgXCJkb3VibGVcIjogJ1wiJyxcclxuICAgICAgc2luZ2xlOiBcIidcIlxyXG4gICAgfTtcclxuICAgIHZhciBxdW90ZVJFcyA9IHtcclxuICAgICAgX19wcm90b19fOiBudWxsLFxyXG4gICAgICBcImRvdWJsZVwiOiAvKFtcIlxcXFxdKS9nLFxyXG4gICAgICBzaW5nbGU6IC8oWydcXFxcXSkvZ1xyXG4gICAgfTtcclxuICAgIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5zcGVjdF8ob2JqLCBvcHRpb25zLCBkZXB0aCwgc2Vlbikge1xyXG4gICAgICB2YXIgb3B0cyA9IG9wdGlvbnMgfHwge307XHJcbiAgICAgIGlmIChoYXMob3B0cywgXCJxdW90ZVN0eWxlXCIpICYmICFoYXMocXVvdGVzLCBvcHRzLnF1b3RlU3R5bGUpKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb3B0aW9uIFwicXVvdGVTdHlsZVwiIG11c3QgYmUgXCJzaW5nbGVcIiBvciBcImRvdWJsZVwiJyk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGhhcyhvcHRzLCBcIm1heFN0cmluZ0xlbmd0aFwiKSAmJiAodHlwZW9mIG9wdHMubWF4U3RyaW5nTGVuZ3RoID09PSBcIm51bWJlclwiID8gb3B0cy5tYXhTdHJpbmdMZW5ndGggPCAwICYmIG9wdHMubWF4U3RyaW5nTGVuZ3RoICE9PSBJbmZpbml0eSA6IG9wdHMubWF4U3RyaW5nTGVuZ3RoICE9PSBudWxsKSkge1xyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29wdGlvbiBcIm1heFN0cmluZ0xlbmd0aFwiLCBpZiBwcm92aWRlZCwgbXVzdCBiZSBhIHBvc2l0aXZlIGludGVnZXIsIEluZmluaXR5LCBvciBgbnVsbGAnKTtcclxuICAgICAgfVxyXG4gICAgICB2YXIgY3VzdG9tSW5zcGVjdCA9IGhhcyhvcHRzLCBcImN1c3RvbUluc3BlY3RcIikgPyBvcHRzLmN1c3RvbUluc3BlY3QgOiB0cnVlO1xyXG4gICAgICBpZiAodHlwZW9mIGN1c3RvbUluc3BlY3QgIT09IFwiYm9vbGVhblwiICYmIGN1c3RvbUluc3BlY3QgIT09IFwic3ltYm9sXCIpIHtcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwib3B0aW9uIFxcXCJjdXN0b21JbnNwZWN0XFxcIiwgaWYgcHJvdmlkZWQsIG11c3QgYmUgYHRydWVgLCBgZmFsc2VgLCBvciBgJ3N5bWJvbCdgXCIpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChoYXMob3B0cywgXCJpbmRlbnRcIikgJiYgb3B0cy5pbmRlbnQgIT09IG51bGwgJiYgb3B0cy5pbmRlbnQgIT09IFwiXHRcIiAmJiAhKHBhcnNlSW50KG9wdHMuaW5kZW50LCAxMCkgPT09IG9wdHMuaW5kZW50ICYmIG9wdHMuaW5kZW50ID4gMCkpIHtcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvcHRpb24gXCJpbmRlbnRcIiBtdXN0IGJlIFwiXFxcXHRcIiwgYW4gaW50ZWdlciA+IDAsIG9yIGBudWxsYCcpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChoYXMob3B0cywgXCJudW1lcmljU2VwYXJhdG9yXCIpICYmIHR5cGVvZiBvcHRzLm51bWVyaWNTZXBhcmF0b3IgIT09IFwiYm9vbGVhblwiKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb3B0aW9uIFwibnVtZXJpY1NlcGFyYXRvclwiLCBpZiBwcm92aWRlZCwgbXVzdCBiZSBgdHJ1ZWAgb3IgYGZhbHNlYCcpO1xyXG4gICAgICB9XHJcbiAgICAgIHZhciBudW1lcmljU2VwYXJhdG9yID0gb3B0cy5udW1lcmljU2VwYXJhdG9yO1xyXG4gICAgICBpZiAodHlwZW9mIG9iaiA9PT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAgIHJldHVybiBcInVuZGVmaW5lZFwiO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChvYmogPT09IG51bGwpIHtcclxuICAgICAgICByZXR1cm4gXCJudWxsXCI7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHR5cGVvZiBvYmogPT09IFwiYm9vbGVhblwiKSB7XHJcbiAgICAgICAgcmV0dXJuIG9iaiA/IFwidHJ1ZVwiIDogXCJmYWxzZVwiO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICh0eXBlb2Ygb2JqID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgcmV0dXJuIGluc3BlY3RTdHJpbmcob2JqLCBvcHRzKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAodHlwZW9mIG9iaiA9PT0gXCJudW1iZXJcIikge1xyXG4gICAgICAgIGlmIChvYmogPT09IDApIHtcclxuICAgICAgICAgIHJldHVybiBJbmZpbml0eSAvIG9iaiA+IDAgPyBcIjBcIiA6IFwiLTBcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHN0ciA9IFN0cmluZyhvYmopO1xyXG4gICAgICAgIHJldHVybiBudW1lcmljU2VwYXJhdG9yID8gYWRkTnVtZXJpY1NlcGFyYXRvcihvYmosIHN0cikgOiBzdHI7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHR5cGVvZiBvYmogPT09IFwiYmlnaW50XCIpIHtcclxuICAgICAgICB2YXIgYmlnSW50U3RyID0gU3RyaW5nKG9iaikgKyBcIm5cIjtcclxuICAgICAgICByZXR1cm4gbnVtZXJpY1NlcGFyYXRvciA/IGFkZE51bWVyaWNTZXBhcmF0b3Iob2JqLCBiaWdJbnRTdHIpIDogYmlnSW50U3RyO1xyXG4gICAgICB9XHJcbiAgICAgIHZhciBtYXhEZXB0aCA9IHR5cGVvZiBvcHRzLmRlcHRoID09PSBcInVuZGVmaW5lZFwiID8gNSA6IG9wdHMuZGVwdGg7XHJcbiAgICAgIGlmICh0eXBlb2YgZGVwdGggPT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgICBkZXB0aCA9IDA7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGRlcHRoID49IG1heERlcHRoICYmIG1heERlcHRoID4gMCAmJiB0eXBlb2Ygb2JqID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgcmV0dXJuIGlzQXJyYXkob2JqKSA/IFwiW0FycmF5XVwiIDogXCJbT2JqZWN0XVwiO1xyXG4gICAgICB9XHJcbiAgICAgIHZhciBpbmRlbnQgPSBnZXRJbmRlbnQob3B0cywgZGVwdGgpO1xyXG4gICAgICBpZiAodHlwZW9mIHNlZW4gPT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgICBzZWVuID0gW107XHJcbiAgICAgIH0gZWxzZSBpZiAoaW5kZXhPZihzZWVuLCBvYmopID49IDApIHtcclxuICAgICAgICByZXR1cm4gXCJbQ2lyY3VsYXJdXCI7XHJcbiAgICAgIH1cclxuICAgICAgZnVuY3Rpb24gaW5zcGVjdDModmFsdWUsIGZyb20sIG5vSW5kZW50KSB7XHJcbiAgICAgICAgaWYgKGZyb20pIHtcclxuICAgICAgICAgIHNlZW4gPSAkYXJyU2xpY2UuY2FsbChzZWVuKTtcclxuICAgICAgICAgIHNlZW4ucHVzaChmcm9tKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG5vSW5kZW50KSB7XHJcbiAgICAgICAgICB2YXIgbmV3T3B0cyA9IHtcclxuICAgICAgICAgICAgZGVwdGg6IG9wdHMuZGVwdGhcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgICBpZiAoaGFzKG9wdHMsIFwicXVvdGVTdHlsZVwiKSkge1xyXG4gICAgICAgICAgICBuZXdPcHRzLnF1b3RlU3R5bGUgPSBvcHRzLnF1b3RlU3R5bGU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gaW5zcGVjdF8odmFsdWUsIG5ld09wdHMsIGRlcHRoICsgMSwgc2Vlbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBpbnNwZWN0Xyh2YWx1ZSwgb3B0cywgZGVwdGggKyAxLCBzZWVuKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAodHlwZW9mIG9iaiA9PT0gXCJmdW5jdGlvblwiICYmICFpc1JlZ0V4cChvYmopKSB7XHJcbiAgICAgICAgdmFyIG5hbWUgPSBuYW1lT2Yob2JqKTtcclxuICAgICAgICB2YXIga2V5cyA9IGFyck9iaktleXMob2JqLCBpbnNwZWN0Myk7XHJcbiAgICAgICAgcmV0dXJuIFwiW0Z1bmN0aW9uXCIgKyAobmFtZSA/IFwiOiBcIiArIG5hbWUgOiBcIiAoYW5vbnltb3VzKVwiKSArIFwiXVwiICsgKGtleXMubGVuZ3RoID4gMCA/IFwiIHsgXCIgKyAkam9pbi5jYWxsKGtleXMsIFwiLCBcIikgKyBcIiB9XCIgOiBcIlwiKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoaXNTeW1ib2wob2JqKSkge1xyXG4gICAgICAgIHZhciBzeW1TdHJpbmcgPSBoYXNTaGFtbWVkU3ltYm9scyA/ICRyZXBsYWNlLmNhbGwoU3RyaW5nKG9iaiksIC9eKFN5bWJvbFxcKC4qXFwpKV9bXildKiQvLCBcIiQxXCIpIDogc3ltVG9TdHJpbmcuY2FsbChvYmopO1xyXG4gICAgICAgIHJldHVybiB0eXBlb2Ygb2JqID09PSBcIm9iamVjdFwiICYmICFoYXNTaGFtbWVkU3ltYm9scyA/IG1hcmtCb3hlZChzeW1TdHJpbmcpIDogc3ltU3RyaW5nO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChpc0VsZW1lbnQob2JqKSkge1xyXG4gICAgICAgIHZhciBzID0gXCI8XCIgKyAkdG9Mb3dlckNhc2UuY2FsbChTdHJpbmcob2JqLm5vZGVOYW1lKSk7XHJcbiAgICAgICAgdmFyIGF0dHJzID0gb2JqLmF0dHJpYnV0ZXMgfHwgW107XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhdHRycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgcyArPSBcIiBcIiArIGF0dHJzW2ldLm5hbWUgKyBcIj1cIiArIHdyYXBRdW90ZXMocXVvdGUoYXR0cnNbaV0udmFsdWUpLCBcImRvdWJsZVwiLCBvcHRzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcyArPSBcIj5cIjtcclxuICAgICAgICBpZiAob2JqLmNoaWxkTm9kZXMgJiYgb2JqLmNoaWxkTm9kZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICBzICs9IFwiLi4uXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHMgKz0gXCI8L1wiICsgJHRvTG93ZXJDYXNlLmNhbGwoU3RyaW5nKG9iai5ub2RlTmFtZSkpICsgXCI+XCI7XHJcbiAgICAgICAgcmV0dXJuIHM7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGlzQXJyYXkob2JqKSkge1xyXG4gICAgICAgIGlmIChvYmoubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICByZXR1cm4gXCJbXVwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgeHMgPSBhcnJPYmpLZXlzKG9iaiwgaW5zcGVjdDMpO1xyXG4gICAgICAgIGlmIChpbmRlbnQgJiYgIXNpbmdsZUxpbmVWYWx1ZXMoeHMpKSB7XHJcbiAgICAgICAgICByZXR1cm4gXCJbXCIgKyBpbmRlbnRlZEpvaW4oeHMsIGluZGVudCkgKyBcIl1cIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIFwiWyBcIiArICRqb2luLmNhbGwoeHMsIFwiLCBcIikgKyBcIiBdXCI7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGlzRXJyb3Iob2JqKSkge1xyXG4gICAgICAgIHZhciBwYXJ0cyA9IGFyck9iaktleXMob2JqLCBpbnNwZWN0Myk7XHJcbiAgICAgICAgaWYgKCEoXCJjYXVzZVwiIGluIEVycm9yLnByb3RvdHlwZSkgJiYgXCJjYXVzZVwiIGluIG9iaiAmJiAhaXNFbnVtZXJhYmxlLmNhbGwob2JqLCBcImNhdXNlXCIpKSB7XHJcbiAgICAgICAgICByZXR1cm4gXCJ7IFtcIiArIFN0cmluZyhvYmopICsgXCJdIFwiICsgJGpvaW4uY2FsbCgkY29uY2F0LmNhbGwoXCJbY2F1c2VdOiBcIiArIGluc3BlY3QzKG9iai5jYXVzZSksIHBhcnRzKSwgXCIsIFwiKSArIFwiIH1cIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgcmV0dXJuIFwiW1wiICsgU3RyaW5nKG9iaikgKyBcIl1cIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIFwieyBbXCIgKyBTdHJpbmcob2JqKSArIFwiXSBcIiArICRqb2luLmNhbGwocGFydHMsIFwiLCBcIikgKyBcIiB9XCI7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHR5cGVvZiBvYmogPT09IFwib2JqZWN0XCIgJiYgY3VzdG9tSW5zcGVjdCkge1xyXG4gICAgICAgIGlmIChpbnNwZWN0U3ltYm9sICYmIHR5cGVvZiBvYmpbaW5zcGVjdFN5bWJvbF0gPT09IFwiZnVuY3Rpb25cIiAmJiB1dGlsSW5zcGVjdCkge1xyXG4gICAgICAgICAgcmV0dXJuIHV0aWxJbnNwZWN0KG9iaiwgeyBkZXB0aDogbWF4RGVwdGggLSBkZXB0aCB9KTtcclxuICAgICAgICB9IGVsc2UgaWYgKGN1c3RvbUluc3BlY3QgIT09IFwic3ltYm9sXCIgJiYgdHlwZW9mIG9iai5pbnNwZWN0ID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgIHJldHVybiBvYmouaW5zcGVjdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBpZiAoaXNNYXAob2JqKSkge1xyXG4gICAgICAgIHZhciBtYXBQYXJ0cyA9IFtdO1xyXG4gICAgICAgIGlmIChtYXBGb3JFYWNoKSB7XHJcbiAgICAgICAgICBtYXBGb3JFYWNoLmNhbGwob2JqLCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XHJcbiAgICAgICAgICAgIG1hcFBhcnRzLnB1c2goaW5zcGVjdDMoa2V5LCBvYmosIHRydWUpICsgXCIgPT4gXCIgKyBpbnNwZWN0Myh2YWx1ZSwgb2JqKSk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGNvbGxlY3Rpb25PZihcIk1hcFwiLCBtYXBTaXplLmNhbGwob2JqKSwgbWFwUGFydHMsIGluZGVudCk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGlzU2V0KG9iaikpIHtcclxuICAgICAgICB2YXIgc2V0UGFydHMgPSBbXTtcclxuICAgICAgICBpZiAoc2V0Rm9yRWFjaCkge1xyXG4gICAgICAgICAgc2V0Rm9yRWFjaC5jYWxsKG9iaiwgZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgICAgICAgc2V0UGFydHMucHVzaChpbnNwZWN0Myh2YWx1ZSwgb2JqKSk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGNvbGxlY3Rpb25PZihcIlNldFwiLCBzZXRTaXplLmNhbGwob2JqKSwgc2V0UGFydHMsIGluZGVudCk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGlzV2Vha01hcChvYmopKSB7XHJcbiAgICAgICAgcmV0dXJuIHdlYWtDb2xsZWN0aW9uT2YoXCJXZWFrTWFwXCIpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChpc1dlYWtTZXQob2JqKSkge1xyXG4gICAgICAgIHJldHVybiB3ZWFrQ29sbGVjdGlvbk9mKFwiV2Vha1NldFwiKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoaXNXZWFrUmVmKG9iaikpIHtcclxuICAgICAgICByZXR1cm4gd2Vha0NvbGxlY3Rpb25PZihcIldlYWtSZWZcIik7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGlzTnVtYmVyKG9iaikpIHtcclxuICAgICAgICByZXR1cm4gbWFya0JveGVkKGluc3BlY3QzKE51bWJlcihvYmopKSk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGlzQmlnSW50KG9iaikpIHtcclxuICAgICAgICByZXR1cm4gbWFya0JveGVkKGluc3BlY3QzKGJpZ0ludFZhbHVlT2YuY2FsbChvYmopKSk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGlzQm9vbGVhbihvYmopKSB7XHJcbiAgICAgICAgcmV0dXJuIG1hcmtCb3hlZChib29sZWFuVmFsdWVPZi5jYWxsKG9iaikpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChpc1N0cmluZyhvYmopKSB7XHJcbiAgICAgICAgcmV0dXJuIG1hcmtCb3hlZChpbnNwZWN0MyhTdHJpbmcob2JqKSkpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiICYmIG9iaiA9PT0gd2luZG93KSB7XHJcbiAgICAgICAgcmV0dXJuIFwieyBbb2JqZWN0IFdpbmRvd10gfVwiO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICh0eXBlb2YgZ2xvYmFsVGhpcyAhPT0gXCJ1bmRlZmluZWRcIiAmJiBvYmogPT09IGdsb2JhbFRoaXMgfHwgdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiAmJiBvYmogPT09IGdsb2JhbCkge1xyXG4gICAgICAgIHJldHVybiBcInsgW29iamVjdCBnbG9iYWxUaGlzXSB9XCI7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCFpc0RhdGUob2JqKSAmJiAhaXNSZWdFeHAob2JqKSkge1xyXG4gICAgICAgIHZhciB5cyA9IGFyck9iaktleXMob2JqLCBpbnNwZWN0Myk7XHJcbiAgICAgICAgdmFyIGlzUGxhaW5PYmplY3QgPSBnUE8gPyBnUE8ob2JqKSA9PT0gT2JqZWN0LnByb3RvdHlwZSA6IG9iaiBpbnN0YW5jZW9mIE9iamVjdCB8fCBvYmouY29uc3RydWN0b3IgPT09IE9iamVjdDtcclxuICAgICAgICB2YXIgcHJvdG9UYWcgPSBvYmogaW5zdGFuY2VvZiBPYmplY3QgPyBcIlwiIDogXCJudWxsIHByb3RvdHlwZVwiO1xyXG4gICAgICAgIHZhciBzdHJpbmdUYWcgPSAhaXNQbGFpbk9iamVjdCAmJiB0b1N0cmluZ1RhZyAmJiBPYmplY3Qob2JqKSA9PT0gb2JqICYmIHRvU3RyaW5nVGFnIGluIG9iaiA/ICRzbGljZS5jYWxsKHRvU3RyKG9iaiksIDgsIC0xKSA6IHByb3RvVGFnID8gXCJPYmplY3RcIiA6IFwiXCI7XHJcbiAgICAgICAgdmFyIGNvbnN0cnVjdG9yVGFnID0gaXNQbGFpbk9iamVjdCB8fCB0eXBlb2Ygb2JqLmNvbnN0cnVjdG9yICE9PSBcImZ1bmN0aW9uXCIgPyBcIlwiIDogb2JqLmNvbnN0cnVjdG9yLm5hbWUgPyBvYmouY29uc3RydWN0b3IubmFtZSArIFwiIFwiIDogXCJcIjtcclxuICAgICAgICB2YXIgdGFnID0gY29uc3RydWN0b3JUYWcgKyAoc3RyaW5nVGFnIHx8IHByb3RvVGFnID8gXCJbXCIgKyAkam9pbi5jYWxsKCRjb25jYXQuY2FsbChbXSwgc3RyaW5nVGFnIHx8IFtdLCBwcm90b1RhZyB8fCBbXSksIFwiOiBcIikgKyBcIl0gXCIgOiBcIlwiKTtcclxuICAgICAgICBpZiAoeXMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICByZXR1cm4gdGFnICsgXCJ7fVwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaW5kZW50KSB7XHJcbiAgICAgICAgICByZXR1cm4gdGFnICsgXCJ7XCIgKyBpbmRlbnRlZEpvaW4oeXMsIGluZGVudCkgKyBcIn1cIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRhZyArIFwieyBcIiArICRqb2luLmNhbGwoeXMsIFwiLCBcIikgKyBcIiB9XCI7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIFN0cmluZyhvYmopO1xyXG4gICAgfTtcclxuICAgIGZ1bmN0aW9uIHdyYXBRdW90ZXMocywgZGVmYXVsdFN0eWxlLCBvcHRzKSB7XHJcbiAgICAgIHZhciBzdHlsZSA9IG9wdHMucXVvdGVTdHlsZSB8fCBkZWZhdWx0U3R5bGU7XHJcbiAgICAgIHZhciBxdW90ZUNoYXIgPSBxdW90ZXNbc3R5bGVdO1xyXG4gICAgICByZXR1cm4gcXVvdGVDaGFyICsgcyArIHF1b3RlQ2hhcjtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIHF1b3RlKHMpIHtcclxuICAgICAgcmV0dXJuICRyZXBsYWNlLmNhbGwoU3RyaW5nKHMpLCAvXCIvZywgXCImcXVvdDtcIik7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBjYW5UcnVzdFRvU3RyaW5nKG9iaikge1xyXG4gICAgICByZXR1cm4gIXRvU3RyaW5nVGFnIHx8ICEodHlwZW9mIG9iaiA9PT0gXCJvYmplY3RcIiAmJiAodG9TdHJpbmdUYWcgaW4gb2JqIHx8IHR5cGVvZiBvYmpbdG9TdHJpbmdUYWddICE9PSBcInVuZGVmaW5lZFwiKSk7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBpc0FycmF5KG9iaikge1xyXG4gICAgICByZXR1cm4gdG9TdHIob2JqKSA9PT0gXCJbb2JqZWN0IEFycmF5XVwiICYmIGNhblRydXN0VG9TdHJpbmcob2JqKTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGlzRGF0ZShvYmopIHtcclxuICAgICAgcmV0dXJuIHRvU3RyKG9iaikgPT09IFwiW29iamVjdCBEYXRlXVwiICYmIGNhblRydXN0VG9TdHJpbmcob2JqKTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGlzUmVnRXhwKG9iaikge1xyXG4gICAgICByZXR1cm4gdG9TdHIob2JqKSA9PT0gXCJbb2JqZWN0IFJlZ0V4cF1cIiAmJiBjYW5UcnVzdFRvU3RyaW5nKG9iaik7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBpc0Vycm9yKG9iaikge1xyXG4gICAgICByZXR1cm4gdG9TdHIob2JqKSA9PT0gXCJbb2JqZWN0IEVycm9yXVwiICYmIGNhblRydXN0VG9TdHJpbmcob2JqKTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGlzU3RyaW5nKG9iaikge1xyXG4gICAgICByZXR1cm4gdG9TdHIob2JqKSA9PT0gXCJbb2JqZWN0IFN0cmluZ11cIiAmJiBjYW5UcnVzdFRvU3RyaW5nKG9iaik7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBpc051bWJlcihvYmopIHtcclxuICAgICAgcmV0dXJuIHRvU3RyKG9iaikgPT09IFwiW29iamVjdCBOdW1iZXJdXCIgJiYgY2FuVHJ1c3RUb1N0cmluZyhvYmopO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gaXNCb29sZWFuKG9iaikge1xyXG4gICAgICByZXR1cm4gdG9TdHIob2JqKSA9PT0gXCJbb2JqZWN0IEJvb2xlYW5dXCIgJiYgY2FuVHJ1c3RUb1N0cmluZyhvYmopO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gaXNTeW1ib2wob2JqKSB7XHJcbiAgICAgIGlmIChoYXNTaGFtbWVkU3ltYm9scykge1xyXG4gICAgICAgIHJldHVybiBvYmogJiYgdHlwZW9mIG9iaiA9PT0gXCJvYmplY3RcIiAmJiBvYmogaW5zdGFuY2VvZiBTeW1ib2w7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHR5cGVvZiBvYmogPT09IFwic3ltYm9sXCIpIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIW9iaiB8fCB0eXBlb2Ygb2JqICE9PSBcIm9iamVjdFwiIHx8ICFzeW1Ub1N0cmluZykge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgICB0cnkge1xyXG4gICAgICAgIHN5bVRvU3RyaW5nLmNhbGwob2JqKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGlzQmlnSW50KG9iaikge1xyXG4gICAgICBpZiAoIW9iaiB8fCB0eXBlb2Ygb2JqICE9PSBcIm9iamVjdFwiIHx8ICFiaWdJbnRWYWx1ZU9mKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgYmlnSW50VmFsdWVPZi5jYWxsKG9iaik7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB2YXIgaGFzT3duMiA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkgfHwgZnVuY3Rpb24oa2V5KSB7XHJcbiAgICAgIHJldHVybiBrZXkgaW4gdGhpcztcclxuICAgIH07XHJcbiAgICBmdW5jdGlvbiBoYXMob2JqLCBrZXkpIHtcclxuICAgICAgcmV0dXJuIGhhc093bjIuY2FsbChvYmosIGtleSk7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiB0b1N0cihvYmopIHtcclxuICAgICAgcmV0dXJuIG9iamVjdFRvU3RyaW5nLmNhbGwob2JqKTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIG5hbWVPZihmKSB7XHJcbiAgICAgIGlmIChmLm5hbWUpIHtcclxuICAgICAgICByZXR1cm4gZi5uYW1lO1xyXG4gICAgICB9XHJcbiAgICAgIHZhciBtID0gJG1hdGNoLmNhbGwoZnVuY3Rpb25Ub1N0cmluZy5jYWxsKGYpLCAvXmZ1bmN0aW9uXFxzKihbXFx3JF0rKS8pO1xyXG4gICAgICBpZiAobSkge1xyXG4gICAgICAgIHJldHVybiBtWzFdO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gaW5kZXhPZih4cywgeCkge1xyXG4gICAgICBpZiAoeHMuaW5kZXhPZikge1xyXG4gICAgICAgIHJldHVybiB4cy5pbmRleE9mKHgpO1xyXG4gICAgICB9XHJcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0geHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKHhzW2ldID09PSB4KSB7XHJcbiAgICAgICAgICByZXR1cm4gaTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIC0xO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gaXNNYXAoeCkge1xyXG4gICAgICBpZiAoIW1hcFNpemUgfHwgIXggfHwgdHlwZW9mIHggIT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgICAgdHJ5IHtcclxuICAgICAgICBtYXBTaXplLmNhbGwoeCk7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIHNldFNpemUuY2FsbCh4KTtcclxuICAgICAgICB9IGNhdGNoIChzKSB7XHJcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHggaW5zdGFuY2VvZiBNYXA7XHJcbiAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBpc1dlYWtNYXAoeCkge1xyXG4gICAgICBpZiAoIXdlYWtNYXBIYXMgfHwgIXggfHwgdHlwZW9mIHggIT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgICAgdHJ5IHtcclxuICAgICAgICB3ZWFrTWFwSGFzLmNhbGwoeCwgd2Vha01hcEhhcyk7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIHdlYWtTZXRIYXMuY2FsbCh4LCB3ZWFrU2V0SGFzKTtcclxuICAgICAgICB9IGNhdGNoIChzKSB7XHJcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHggaW5zdGFuY2VvZiBXZWFrTWFwO1xyXG4gICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gaXNXZWFrUmVmKHgpIHtcclxuICAgICAgaWYgKCF3ZWFrUmVmRGVyZWYgfHwgIXggfHwgdHlwZW9mIHggIT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgICAgdHJ5IHtcclxuICAgICAgICB3ZWFrUmVmRGVyZWYuY2FsbCh4KTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGlzU2V0KHgpIHtcclxuICAgICAgaWYgKCFzZXRTaXplIHx8ICF4IHx8IHR5cGVvZiB4ICE9PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgc2V0U2l6ZS5jYWxsKHgpO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBtYXBTaXplLmNhbGwoeCk7XHJcbiAgICAgICAgfSBjYXRjaCAobSkge1xyXG4gICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB4IGluc3RhbmNlb2YgU2V0O1xyXG4gICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gaXNXZWFrU2V0KHgpIHtcclxuICAgICAgaWYgKCF3ZWFrU2V0SGFzIHx8ICF4IHx8IHR5cGVvZiB4ICE9PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgd2Vha1NldEhhcy5jYWxsKHgsIHdlYWtTZXRIYXMpO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICB3ZWFrTWFwSGFzLmNhbGwoeCwgd2Vha01hcEhhcyk7XHJcbiAgICAgICAgfSBjYXRjaCAocykge1xyXG4gICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB4IGluc3RhbmNlb2YgV2Vha1NldDtcclxuICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGlzRWxlbWVudCh4KSB7XHJcbiAgICAgIGlmICgheCB8fCB0eXBlb2YgeCAhPT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgICBpZiAodHlwZW9mIEhUTUxFbGVtZW50ICE9PSBcInVuZGVmaW5lZFwiICYmIHggaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB0eXBlb2YgeC5ub2RlTmFtZSA9PT0gXCJzdHJpbmdcIiAmJiB0eXBlb2YgeC5nZXRBdHRyaWJ1dGUgPT09IFwiZnVuY3Rpb25cIjtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGluc3BlY3RTdHJpbmcoc3RyLCBvcHRzKSB7XHJcbiAgICAgIGlmIChzdHIubGVuZ3RoID4gb3B0cy5tYXhTdHJpbmdMZW5ndGgpIHtcclxuICAgICAgICB2YXIgcmVtYWluaW5nID0gc3RyLmxlbmd0aCAtIG9wdHMubWF4U3RyaW5nTGVuZ3RoO1xyXG4gICAgICAgIHZhciB0cmFpbGVyID0gXCIuLi4gXCIgKyByZW1haW5pbmcgKyBcIiBtb3JlIGNoYXJhY3RlclwiICsgKHJlbWFpbmluZyA+IDEgPyBcInNcIiA6IFwiXCIpO1xyXG4gICAgICAgIHJldHVybiBpbnNwZWN0U3RyaW5nKCRzbGljZS5jYWxsKHN0ciwgMCwgb3B0cy5tYXhTdHJpbmdMZW5ndGgpLCBvcHRzKSArIHRyYWlsZXI7XHJcbiAgICAgIH1cclxuICAgICAgdmFyIHF1b3RlUkUgPSBxdW90ZVJFc1tvcHRzLnF1b3RlU3R5bGUgfHwgXCJzaW5nbGVcIl07XHJcbiAgICAgIHF1b3RlUkUubGFzdEluZGV4ID0gMDtcclxuICAgICAgdmFyIHMgPSAkcmVwbGFjZS5jYWxsKCRyZXBsYWNlLmNhbGwoc3RyLCBxdW90ZVJFLCBcIlxcXFwkMVwiKSwgL1tcXHgwMC1cXHgxZl0vZywgbG93Ynl0ZSk7XHJcbiAgICAgIHJldHVybiB3cmFwUXVvdGVzKHMsIFwic2luZ2xlXCIsIG9wdHMpO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gbG93Ynl0ZShjKSB7XHJcbiAgICAgIHZhciBuID0gYy5jaGFyQ29kZUF0KDApO1xyXG4gICAgICB2YXIgeCA9IHtcclxuICAgICAgICA4OiBcImJcIixcclxuICAgICAgICA5OiBcInRcIixcclxuICAgICAgICAxMDogXCJuXCIsXHJcbiAgICAgICAgMTI6IFwiZlwiLFxyXG4gICAgICAgIDEzOiBcInJcIlxyXG4gICAgICB9W25dO1xyXG4gICAgICBpZiAoeCkge1xyXG4gICAgICAgIHJldHVybiBcIlxcXFxcIiArIHg7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIFwiXFxcXHhcIiArIChuIDwgMTYgPyBcIjBcIiA6IFwiXCIpICsgJHRvVXBwZXJDYXNlLmNhbGwobi50b1N0cmluZygxNikpO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gbWFya0JveGVkKHN0cikge1xyXG4gICAgICByZXR1cm4gXCJPYmplY3QoXCIgKyBzdHIgKyBcIilcIjtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIHdlYWtDb2xsZWN0aW9uT2YodHlwZSkge1xyXG4gICAgICByZXR1cm4gdHlwZSArIFwiIHsgPyB9XCI7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBjb2xsZWN0aW9uT2YodHlwZSwgc2l6ZSwgZW50cmllcywgaW5kZW50KSB7XHJcbiAgICAgIHZhciBqb2luZWRFbnRyaWVzID0gaW5kZW50ID8gaW5kZW50ZWRKb2luKGVudHJpZXMsIGluZGVudCkgOiAkam9pbi5jYWxsKGVudHJpZXMsIFwiLCBcIik7XHJcbiAgICAgIHJldHVybiB0eXBlICsgXCIgKFwiICsgc2l6ZSArIFwiKSB7XCIgKyBqb2luZWRFbnRyaWVzICsgXCJ9XCI7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBzaW5nbGVMaW5lVmFsdWVzKHhzKSB7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgeHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBpZiAoaW5kZXhPZih4c1tpXSwgXCJcXG5cIikgPj0gMCkge1xyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGdldEluZGVudChvcHRzLCBkZXB0aCkge1xyXG4gICAgICB2YXIgYmFzZUluZGVudDtcclxuICAgICAgaWYgKG9wdHMuaW5kZW50ID09PSBcIlx0XCIpIHtcclxuICAgICAgICBiYXNlSW5kZW50ID0gXCJcdFwiO1xyXG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBvcHRzLmluZGVudCA9PT0gXCJudW1iZXJcIiAmJiBvcHRzLmluZGVudCA+IDApIHtcclxuICAgICAgICBiYXNlSW5kZW50ID0gJGpvaW4uY2FsbChBcnJheShvcHRzLmluZGVudCArIDEpLCBcIiBcIik7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBiYXNlOiBiYXNlSW5kZW50LFxyXG4gICAgICAgIHByZXY6ICRqb2luLmNhbGwoQXJyYXkoZGVwdGggKyAxKSwgYmFzZUluZGVudClcclxuICAgICAgfTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGluZGVudGVkSm9pbih4cywgaW5kZW50KSB7XHJcbiAgICAgIGlmICh4cy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICByZXR1cm4gXCJcIjtcclxuICAgICAgfVxyXG4gICAgICB2YXIgbGluZUpvaW5lciA9IFwiXFxuXCIgKyBpbmRlbnQucHJldiArIGluZGVudC5iYXNlO1xyXG4gICAgICByZXR1cm4gbGluZUpvaW5lciArICRqb2luLmNhbGwoeHMsIFwiLFwiICsgbGluZUpvaW5lcikgKyBcIlxcblwiICsgaW5kZW50LnByZXY7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBhcnJPYmpLZXlzKG9iaiwgaW5zcGVjdDMpIHtcclxuICAgICAgdmFyIGlzQXJyID0gaXNBcnJheShvYmopO1xyXG4gICAgICB2YXIgeHMgPSBbXTtcclxuICAgICAgaWYgKGlzQXJyKSB7XHJcbiAgICAgICAgeHMubGVuZ3RoID0gb2JqLmxlbmd0aDtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9iai5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgeHNbaV0gPSBoYXMob2JqLCBpKSA/IGluc3BlY3QzKG9ialtpXSwgb2JqKSA6IFwiXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHZhciBzeW1zID0gdHlwZW9mIGdPUFMgPT09IFwiZnVuY3Rpb25cIiA/IGdPUFMob2JqKSA6IFtdO1xyXG4gICAgICB2YXIgc3ltTWFwO1xyXG4gICAgICBpZiAoaGFzU2hhbW1lZFN5bWJvbHMpIHtcclxuICAgICAgICBzeW1NYXAgPSB7fTtcclxuICAgICAgICBmb3IgKHZhciBrID0gMDsgayA8IHN5bXMubGVuZ3RoOyBrKyspIHtcclxuICAgICAgICAgIHN5bU1hcFtcIiRcIiArIHN5bXNba11dID0gc3ltc1trXTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgZm9yICh2YXIga2V5IGluIG9iaikge1xyXG4gICAgICAgIGlmICghaGFzKG9iaiwga2V5KSkge1xyXG4gICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpc0FyciAmJiBTdHJpbmcoTnVtYmVyKGtleSkpID09PSBrZXkgJiYga2V5IDwgb2JqLmxlbmd0aCkge1xyXG4gICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChoYXNTaGFtbWVkU3ltYm9scyAmJiBzeW1NYXBbXCIkXCIgKyBrZXldIGluc3RhbmNlb2YgU3ltYm9sKSB7XHJcbiAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9IGVsc2UgaWYgKCR0ZXN0LmNhbGwoL1teXFx3JF0vLCBrZXkpKSB7XHJcbiAgICAgICAgICB4cy5wdXNoKGluc3BlY3QzKGtleSwgb2JqKSArIFwiOiBcIiArIGluc3BlY3QzKG9ialtrZXldLCBvYmopKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgeHMucHVzaChrZXkgKyBcIjogXCIgKyBpbnNwZWN0MyhvYmpba2V5XSwgb2JqKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmICh0eXBlb2YgZ09QUyA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBzeW1zLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICBpZiAoaXNFbnVtZXJhYmxlLmNhbGwob2JqLCBzeW1zW2pdKSkge1xyXG4gICAgICAgICAgICB4cy5wdXNoKFwiW1wiICsgaW5zcGVjdDMoc3ltc1tqXSkgKyBcIl06IFwiICsgaW5zcGVjdDMob2JqW3N5bXNbal1dLCBvYmopKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHhzO1xyXG4gICAgfVxyXG4gIH1cclxufSk7XHJcblxyXG4vLyBzcmMvbGliL3RpbWVfZHVyYXRpb24udHNcclxudmFyIFRpbWVEdXJhdGlvbiA9IGNsYXNzIF9UaW1lRHVyYXRpb24ge1xyXG4gIF9fdGltZV9kdXJhdGlvbl9taWNyb3NfXztcclxuICBzdGF0aWMgTUlDUk9TX1BFUl9NSUxMSVMgPSAxMDAwbjtcclxuICAvKipcclxuICAgKiBHZXQgdGhlIGFsZ2VicmFpYyB0eXBlIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB7QGxpbmsgVGltZUR1cmF0aW9ufSB0eXBlLlxyXG4gICAqIEByZXR1cm5zIFRoZSBhbGdlYnJhaWMgdHlwZSByZXByZXNlbnRhdGlvbiBvZiB0aGUgdHlwZS5cclxuICAgKi9cclxuICBzdGF0aWMgZ2V0QWxnZWJyYWljVHlwZSgpIHtcclxuICAgIHJldHVybiBBbGdlYnJhaWNUeXBlLlByb2R1Y3Qoe1xyXG4gICAgICBlbGVtZW50czogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIG5hbWU6IFwiX190aW1lX2R1cmF0aW9uX21pY3Jvc19fXCIsXHJcbiAgICAgICAgICBhbGdlYnJhaWNUeXBlOiBBbGdlYnJhaWNUeXBlLkk2NFxyXG4gICAgICAgIH1cclxuICAgICAgXVxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIHN0YXRpYyBpc1RpbWVEdXJhdGlvbihhbGdlYnJhaWNUeXBlKSB7XHJcbiAgICBpZiAoYWxnZWJyYWljVHlwZS50YWcgIT09IFwiUHJvZHVjdFwiKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGNvbnN0IGVsZW1lbnRzID0gYWxnZWJyYWljVHlwZS52YWx1ZS5lbGVtZW50cztcclxuICAgIGlmIChlbGVtZW50cy5sZW5ndGggIT09IDEpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgY29uc3QgbWljcm9zRWxlbWVudCA9IGVsZW1lbnRzWzBdO1xyXG4gICAgcmV0dXJuIG1pY3Jvc0VsZW1lbnQubmFtZSA9PT0gXCJfX3RpbWVfZHVyYXRpb25fbWljcm9zX19cIiAmJiBtaWNyb3NFbGVtZW50LmFsZ2VicmFpY1R5cGUudGFnID09PSBcIkk2NFwiO1xyXG4gIH1cclxuICBnZXQgbWljcm9zKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX190aW1lX2R1cmF0aW9uX21pY3Jvc19fO1xyXG4gIH1cclxuICBnZXQgbWlsbGlzKCkge1xyXG4gICAgcmV0dXJuIE51bWJlcih0aGlzLm1pY3JvcyAvIF9UaW1lRHVyYXRpb24uTUlDUk9TX1BFUl9NSUxMSVMpO1xyXG4gIH1cclxuICBjb25zdHJ1Y3RvcihtaWNyb3MpIHtcclxuICAgIHRoaXMuX190aW1lX2R1cmF0aW9uX21pY3Jvc19fID0gbWljcm9zO1xyXG4gIH1cclxuICBzdGF0aWMgZnJvbU1pbGxpcyhtaWxsaXMpIHtcclxuICAgIHJldHVybiBuZXcgX1RpbWVEdXJhdGlvbihCaWdJbnQobWlsbGlzKSAqIF9UaW1lRHVyYXRpb24uTUlDUk9TX1BFUl9NSUxMSVMpO1xyXG4gIH1cclxuICAvKiogVGhpcyBvdXRwdXRzIHRoZSBzYW1lIHN0cmluZyBmb3JtYXQgdGhhdCB3ZSB1c2UgaW4gdGhlIGhvc3QgYW5kIGluIFJ1c3QgbW9kdWxlcyAqL1xyXG4gIHRvU3RyaW5nKCkge1xyXG4gICAgY29uc3QgbWljcm9zID0gdGhpcy5taWNyb3M7XHJcbiAgICBjb25zdCBzaWduID0gbWljcm9zIDwgMCA/IFwiLVwiIDogXCIrXCI7XHJcbiAgICBjb25zdCBwb3MgPSBtaWNyb3MgPCAwID8gLW1pY3JvcyA6IG1pY3JvcztcclxuICAgIGNvbnN0IHNlY3MgPSBwb3MgLyAxMDAwMDAwbjtcclxuICAgIGNvbnN0IG1pY3Jvc19yZW1haW5pbmcgPSBwb3MgJSAxMDAwMDAwbjtcclxuICAgIHJldHVybiBgJHtzaWdufSR7c2Vjc30uJHtTdHJpbmcobWljcm9zX3JlbWFpbmluZykucGFkU3RhcnQoNiwgXCIwXCIpfWA7XHJcbiAgfVxyXG59O1xyXG5cclxuLy8gc3JjL2xpYi90aW1lc3RhbXAudHNcclxudmFyIFRpbWVzdGFtcCA9IGNsYXNzIF9UaW1lc3RhbXAge1xyXG4gIF9fdGltZXN0YW1wX21pY3Jvc19zaW5jZV91bml4X2Vwb2NoX187XHJcbiAgc3RhdGljIE1JQ1JPU19QRVJfTUlMTElTID0gMTAwMG47XHJcbiAgZ2V0IG1pY3Jvc1NpbmNlVW5peEVwb2NoKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX190aW1lc3RhbXBfbWljcm9zX3NpbmNlX3VuaXhfZXBvY2hfXztcclxuICB9XHJcbiAgY29uc3RydWN0b3IobWljcm9zKSB7XHJcbiAgICB0aGlzLl9fdGltZXN0YW1wX21pY3Jvc19zaW5jZV91bml4X2Vwb2NoX18gPSBtaWNyb3M7XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgYWxnZWJyYWljIHR5cGUgcmVwcmVzZW50YXRpb24gb2YgdGhlIHtAbGluayBUaW1lc3RhbXB9IHR5cGUuXHJcbiAgICogQHJldHVybnMgVGhlIGFsZ2VicmFpYyB0eXBlIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB0eXBlLlxyXG4gICAqL1xyXG4gIHN0YXRpYyBnZXRBbGdlYnJhaWNUeXBlKCkge1xyXG4gICAgcmV0dXJuIEFsZ2VicmFpY1R5cGUuUHJvZHVjdCh7XHJcbiAgICAgIGVsZW1lbnRzOiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgbmFtZTogXCJfX3RpbWVzdGFtcF9taWNyb3Nfc2luY2VfdW5peF9lcG9jaF9fXCIsXHJcbiAgICAgICAgICBhbGdlYnJhaWNUeXBlOiBBbGdlYnJhaWNUeXBlLkk2NFxyXG4gICAgICAgIH1cclxuICAgICAgXVxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIHN0YXRpYyBpc1RpbWVzdGFtcChhbGdlYnJhaWNUeXBlKSB7XHJcbiAgICBpZiAoYWxnZWJyYWljVHlwZS50YWcgIT09IFwiUHJvZHVjdFwiKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGNvbnN0IGVsZW1lbnRzID0gYWxnZWJyYWljVHlwZS52YWx1ZS5lbGVtZW50cztcclxuICAgIGlmIChlbGVtZW50cy5sZW5ndGggIT09IDEpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgY29uc3QgbWljcm9zRWxlbWVudCA9IGVsZW1lbnRzWzBdO1xyXG4gICAgcmV0dXJuIG1pY3Jvc0VsZW1lbnQubmFtZSA9PT0gXCJfX3RpbWVzdGFtcF9taWNyb3Nfc2luY2VfdW5peF9lcG9jaF9fXCIgJiYgbWljcm9zRWxlbWVudC5hbGdlYnJhaWNUeXBlLnRhZyA9PT0gXCJJNjRcIjtcclxuICB9XHJcbiAgLyoqXHJcbiAgICogVGhlIFVuaXggZXBvY2gsIHRoZSBtaWRuaWdodCBhdCB0aGUgYmVnaW5uaW5nIG9mIEphbnVhcnkgMSwgMTk3MCwgVVRDLlxyXG4gICAqL1xyXG4gIHN0YXRpYyBVTklYX0VQT0NIID0gbmV3IF9UaW1lc3RhbXAoMG4pO1xyXG4gIC8qKlxyXG4gICAqIEdldCBhIGBUaW1lc3RhbXBgIHJlcHJlc2VudGluZyB0aGUgZXhlY3V0aW9uIGVudmlyb25tZW50J3MgYmVsaWVmIG9mIHRoZSBjdXJyZW50IG1vbWVudCBpbiB0aW1lLlxyXG4gICAqL1xyXG4gIHN0YXRpYyBub3coKSB7XHJcbiAgICByZXR1cm4gX1RpbWVzdGFtcC5mcm9tRGF0ZSgvKiBAX19QVVJFX18gKi8gbmV3IERhdGUoKSk7XHJcbiAgfVxyXG4gIC8qKiBDb252ZXJ0IHRvIG1pbGxpc2Vjb25kcyBzaW5jZSBVbml4IGVwb2NoLiAqL1xyXG4gIHRvTWlsbGlzKCkge1xyXG4gICAgcmV0dXJuIHRoaXMubWljcm9zU2luY2VVbml4RXBvY2ggLyAxMDAwbjtcclxuICB9XHJcbiAgLyoqXHJcbiAgICogR2V0IGEgYFRpbWVzdGFtcGAgcmVwcmVzZW50aW5nIHRoZSBzYW1lIHBvaW50IGluIHRpbWUgYXMgYGRhdGVgLlxyXG4gICAqL1xyXG4gIHN0YXRpYyBmcm9tRGF0ZShkYXRlKSB7XHJcbiAgICBjb25zdCBtaWxsaXMgPSBkYXRlLmdldFRpbWUoKTtcclxuICAgIGNvbnN0IG1pY3JvcyA9IEJpZ0ludChtaWxsaXMpICogX1RpbWVzdGFtcC5NSUNST1NfUEVSX01JTExJUztcclxuICAgIHJldHVybiBuZXcgX1RpbWVzdGFtcChtaWNyb3MpO1xyXG4gIH1cclxuICAvKipcclxuICAgKiBHZXQgYSBgRGF0ZWAgcmVwcmVzZW50aW5nIGFwcHJveGltYXRlbHkgdGhlIHNhbWUgcG9pbnQgaW4gdGltZSBhcyBgdGhpc2AuXHJcbiAgICpcclxuICAgKiBUaGlzIG1ldGhvZCB0cnVuY2F0ZXMgdG8gbWlsbGlzZWNvbmQgcHJlY2lzaW9uLFxyXG4gICAqIGFuZCB0aHJvd3MgYFJhbmdlRXJyb3JgIGlmIHRoZSBgVGltZXN0YW1wYCBpcyBvdXRzaWRlIHRoZSByYW5nZSByZXByZXNlbnRhYmxlIGFzIGEgYERhdGVgLlxyXG4gICAqL1xyXG4gIHRvRGF0ZSgpIHtcclxuICAgIGNvbnN0IG1pY3JvcyA9IHRoaXMuX190aW1lc3RhbXBfbWljcm9zX3NpbmNlX3VuaXhfZXBvY2hfXztcclxuICAgIGNvbnN0IG1pbGxpcyA9IG1pY3JvcyAvIF9UaW1lc3RhbXAuTUlDUk9TX1BFUl9NSUxMSVM7XHJcbiAgICBpZiAobWlsbGlzID4gQmlnSW50KE51bWJlci5NQVhfU0FGRV9JTlRFR0VSKSB8fCBtaWxsaXMgPCBCaWdJbnQoTnVtYmVyLk1JTl9TQUZFX0lOVEVHRVIpKSB7XHJcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKFxyXG4gICAgICAgIFwiVGltZXN0YW1wIGlzIG91dHNpZGUgb2YgdGhlIHJlcHJlc2VudGFibGUgcmFuZ2Ugb2YgSlMncyBEYXRlXCJcclxuICAgICAgKTtcclxuICAgIH1cclxuICAgIHJldHVybiBuZXcgRGF0ZShOdW1iZXIobWlsbGlzKSk7XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIEdldCBhbiBJU08gODYwMSAvIFJGQyAzMzM5IGZvcm1hdHRlZCBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhpcyB0aW1lc3RhbXAgd2l0aCBtaWNyb3NlY29uZCBwcmVjaXNpb24uXHJcbiAgICpcclxuICAgKiBUaGlzIG1ldGhvZCBwcmVzZXJ2ZXMgdGhlIGZ1bGwgbWljcm9zZWNvbmQgcHJlY2lzaW9uIG9mIHRoZSB0aW1lc3RhbXAsXHJcbiAgICogYW5kIHRocm93cyBgUmFuZ2VFcnJvcmAgaWYgdGhlIGBUaW1lc3RhbXBgIGlzIG91dHNpZGUgdGhlIHJhbmdlIHJlcHJlc2VudGFibGUgaW4gSVNPIGZvcm1hdC5cclxuICAgKlxyXG4gICAqIEByZXR1cm5zIElTTyA4NjAxIGZvcm1hdHRlZCBzdHJpbmcgd2l0aCBtaWNyb3NlY29uZCBwcmVjaXNpb24gKGUuZy4sICcyMDI1LTAyLTE3VDEwOjMwOjQ1LjEyMzQ1NlonKVxyXG4gICAqL1xyXG4gIHRvSVNPU3RyaW5nKCkge1xyXG4gICAgY29uc3QgbWljcm9zID0gdGhpcy5fX3RpbWVzdGFtcF9taWNyb3Nfc2luY2VfdW5peF9lcG9jaF9fO1xyXG4gICAgY29uc3QgbWlsbGlzID0gbWljcm9zIC8gX1RpbWVzdGFtcC5NSUNST1NfUEVSX01JTExJUztcclxuICAgIGlmIChtaWxsaXMgPiBCaWdJbnQoTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIpIHx8IG1pbGxpcyA8IEJpZ0ludChOdW1iZXIuTUlOX1NBRkVfSU5URUdFUikpIHtcclxuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoXHJcbiAgICAgICAgXCJUaW1lc3RhbXAgaXMgb3V0c2lkZSBvZiB0aGUgcmVwcmVzZW50YWJsZSByYW5nZSBmb3IgSVNPIHN0cmluZyBmb3JtYXR0aW5nXCJcclxuICAgICAgKTtcclxuICAgIH1cclxuICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZShOdW1iZXIobWlsbGlzKSk7XHJcbiAgICBjb25zdCBpc29CYXNlID0gZGF0ZS50b0lTT1N0cmluZygpO1xyXG4gICAgY29uc3QgbWljcm9zUmVtYWluZGVyID0gTWF0aC5hYnMoTnVtYmVyKG1pY3JvcyAlIDEwMDAwMDBuKSk7XHJcbiAgICBjb25zdCBmcmFjdGlvbmFsUGFydCA9IFN0cmluZyhtaWNyb3NSZW1haW5kZXIpLnBhZFN0YXJ0KDYsIFwiMFwiKTtcclxuICAgIHJldHVybiBpc29CYXNlLnJlcGxhY2UoL1xcLlxcZHszfVokLywgYC4ke2ZyYWN0aW9uYWxQYXJ0fVpgKTtcclxuICB9XHJcbiAgc2luY2Uob3RoZXIpIHtcclxuICAgIHJldHVybiBuZXcgVGltZUR1cmF0aW9uKFxyXG4gICAgICB0aGlzLl9fdGltZXN0YW1wX21pY3Jvc19zaW5jZV91bml4X2Vwb2NoX18gLSBvdGhlci5fX3RpbWVzdGFtcF9taWNyb3Nfc2luY2VfdW5peF9lcG9jaF9fXHJcbiAgICApO1xyXG4gIH1cclxufTtcclxuXHJcbi8vIHNyYy9saWIvdXVpZC50c1xyXG52YXIgVXVpZCA9IGNsYXNzIF9VdWlkIHtcclxuICBfX3V1aWRfXztcclxuICAvKipcclxuICAgKiBUaGUgbmlsIFVVSUQgKGFsbCB6ZXJvcykuXHJcbiAgICpcclxuICAgKiBAZXhhbXBsZVxyXG4gICAqIGBgYHRzXHJcbiAgICogY29uc3QgdXVpZCA9IFV1aWQuTklMO1xyXG4gICAqIGNvbnNvbGUuYXNzZXJ0KFxyXG4gICAqICAgdXVpZC50b1N0cmluZygpID09PSBcIjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMFwiXHJcbiAgICogKTtcclxuICAgKiBgYGBcclxuICAgKi9cclxuICBzdGF0aWMgTklMID0gbmV3IF9VdWlkKDBuKTtcclxuICBzdGF0aWMgTUFYX1VVSURfQklHSU5UID0gMHhmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZm47XHJcbiAgLyoqXHJcbiAgICogVGhlIG1heCBVVUlEIChhbGwgb25lcykuXHJcbiAgICpcclxuICAgKiBAZXhhbXBsZVxyXG4gICAqIGBgYHRzXHJcbiAgICogY29uc3QgdXVpZCA9IFV1aWQuTUFYO1xyXG4gICAqIGNvbnNvbGUuYXNzZXJ0KFxyXG4gICAqICAgdXVpZC50b1N0cmluZygpID09PSBcImZmZmZmZmZmLWZmZmYtZmZmZi1mZmZmLWZmZmZmZmZmZmZmZlwiXHJcbiAgICogKTtcclxuICAgKiBgYGBcclxuICAgKi9cclxuICBzdGF0aWMgTUFYID0gbmV3IF9VdWlkKF9VdWlkLk1BWF9VVUlEX0JJR0lOVCk7XHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlIGEgVVVJRCBmcm9tIGEgcmF3IDEyOC1iaXQgdmFsdWUuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gdSAtIFVuc2lnbmVkIDEyOC1iaXQgaW50ZWdlclxyXG4gICAqIEB0aHJvd3Mge0Vycm9yfSBJZiB0aGUgdmFsdWUgaXMgb3V0c2lkZSB0aGUgdmFsaWQgVVVJRCByYW5nZVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKHUpIHtcclxuICAgIGlmICh1IDwgMG4gfHwgdSA+IF9VdWlkLk1BWF9VVUlEX0JJR0lOVCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIFVVSUQ6IG11c3QgYmUgYmV0d2VlbiAwIGFuZCBgTUFYX1VVSURfQklHSU5UYFwiKTtcclxuICAgIH1cclxuICAgIHRoaXMuX191dWlkX18gPSB1O1xyXG4gIH1cclxuICAvKipcclxuICAgKiBDcmVhdGUgYSBVVUlEIGB2NGAgZnJvbSBleHBsaWNpdCByYW5kb20gYnl0ZXMuXHJcbiAgICpcclxuICAgKiBUaGlzIG1ldGhvZCBhc3N1bWVzIHRoZSBieXRlcyBhcmUgYWxyZWFkeSBzdWZmaWNpZW50bHkgcmFuZG9tLlxyXG4gICAqIEl0IG9ubHkgc2V0cyB0aGUgYXBwcm9wcmlhdGUgYml0cyBmb3IgdGhlIFVVSUQgdmVyc2lvbiBhbmQgdmFyaWFudC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBieXRlcyAtIEV4YWN0bHkgMTYgcmFuZG9tIGJ5dGVzXHJcbiAgICogQHJldHVybnMgQSBVVUlEIGB2NGBcclxuICAgKiBAdGhyb3dzIHtFcnJvcn0gSWYgYGJ5dGVzLmxlbmd0aCAhPT0gMTZgXHJcbiAgICpcclxuICAgKiBAZXhhbXBsZVxyXG4gICAqIGBgYHRzXHJcbiAgICogY29uc3QgcmFuZG9tQnl0ZXMgPSBuZXcgVWludDhBcnJheSgxNik7XHJcbiAgICogY29uc3QgdXVpZCA9IFV1aWQuZnJvbVJhbmRvbUJ5dGVzVjQocmFuZG9tQnl0ZXMpO1xyXG4gICAqXHJcbiAgICogY29uc29sZS5hc3NlcnQoXHJcbiAgICogICB1dWlkLnRvU3RyaW5nKCkgPT09IFwiMDAwMDAwMDAtMDAwMC00MDAwLTgwMDAtMDAwMDAwMDAwMDAwXCJcclxuICAgKiApO1xyXG4gICAqIGBgYFxyXG4gICAqL1xyXG4gIHN0YXRpYyBmcm9tUmFuZG9tQnl0ZXNWNChieXRlcykge1xyXG4gICAgaWYgKGJ5dGVzLmxlbmd0aCAhPT0gMTYpIHRocm93IG5ldyBFcnJvcihcIlVVSUQgdjQgcmVxdWlyZXMgMTYgYnl0ZXNcIik7XHJcbiAgICBjb25zdCBhcnIgPSBuZXcgVWludDhBcnJheShieXRlcyk7XHJcbiAgICBhcnJbNl0gPSBhcnJbNl0gJiAxNSB8IDY0O1xyXG4gICAgYXJyWzhdID0gYXJyWzhdICYgNjMgfCAxMjg7XHJcbiAgICByZXR1cm4gbmV3IF9VdWlkKF9VdWlkLmJ5dGVzVG9CaWdJbnQoYXJyKSk7XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIEdlbmVyYXRlIGEgVVVJRCBgdjdgIHVzaW5nIGEgbW9ub3RvbmljIGNvdW50ZXIgZnJvbSBgMGAgdG8gYDJeMzEgLSAxYCxcclxuICAgKiBhIHRpbWVzdGFtcCwgYW5kIDQgcmFuZG9tIGJ5dGVzLlxyXG4gICAqXHJcbiAgICogVGhlIGNvdW50ZXIgd3JhcHMgYXJvdW5kIG9uIG92ZXJmbG93LlxyXG4gICAqXHJcbiAgICogVGhlIFVVSUQgYHY3YCBpcyBzdHJ1Y3R1cmVkIGFzIGZvbGxvd3M6XHJcbiAgICpcclxuICAgKiBgYGBhc2NpaVxyXG4gICAqIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUrOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkFxyXG4gICAqIHwgQjAgIHwgQjEgIHwgQjIgIHwgQjMgIHwgQjQgIHwgQjUgICAgICAgICAgICAgIHwgICAgICAgICBCNiAgICAgICAgfFxyXG4gICAqIOKUnOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUvOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUpFxyXG4gICAqIHwgICAgICAgICAgICAgICAgIHVuaXhfdHNfbXMgICAgICAgICAgICAgICAgICAgIHwgICAgICB2ZXJzaW9uIDcgICAgfFxyXG4gICAqIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUtOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmFxyXG4gICAqIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUrOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUrOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUrOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkFxyXG4gICAqIHwgQjcgICAgICAgICAgIHwgQjggICAgICB8IEI5ICB8IEIxMCB8IEIxMSAgfCBCMTIgfCBCMTMgfCBCMTQgfCBCMTUgfFxyXG4gICAqIOKUnOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUvOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUvOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUvOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUpFxyXG4gICAqIHwgY291bnRlcl9oaWdoIHwgdmFyaWFudCB8ICAgIGNvdW50ZXJfbG93ICAgfCAgICAgICAgcmFuZG9tICAgICAgICAgfFxyXG4gICAqIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUtOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUtOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUtOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmFxyXG4gICAqIGBgYFxyXG4gICAqXHJcbiAgICogQHBhcmFtIGNvdW50ZXIgLSBNdXRhYmxlIG1vbm90b25pYyBjb3VudGVyICgzMS1iaXQpXHJcbiAgICogQHBhcmFtIG5vdyAtIFRpbWVzdGFtcCBzaW5jZSB0aGUgVW5peCBlcG9jaFxyXG4gICAqIEBwYXJhbSByYW5kb21CeXRlcyAtIEV4YWN0bHkgNCByYW5kb20gYnl0ZXNcclxuICAgKiBAcmV0dXJucyBBIFVVSUQgYHY3YFxyXG4gICAqXHJcbiAgICogQHRocm93cyB7RXJyb3J9IElmIHRoZSBgY291bnRlcmAgaXMgbmVnYXRpdmVcclxuICAgKiBAdGhyb3dzIHtFcnJvcn0gSWYgdGhlIGB0aW1lc3RhbXBgIGlzIGJlZm9yZSB0aGUgVW5peCBlcG9jaFxyXG4gICAqIEB0aHJvd3Mge0Vycm9yfSBJZiBgcmFuZG9tQnl0ZXMubGVuZ3RoICE9PSA0YFxyXG4gICAqXHJcbiAgICogQGV4YW1wbGVcclxuICAgKiBgYGB0c1xyXG4gICAqIGNvbnN0IG5vdyA9IFRpbWVzdGFtcC5mcm9tTWlsbGlzKDFfNjg2XzAwMF8wMDBfMDAwbik7XHJcbiAgICogY29uc3QgY291bnRlciA9IHsgdmFsdWU6IDEgfTtcclxuICAgKiBjb25zdCByYW5kb21CeXRlcyA9IG5ldyBVaW50OEFycmF5KDQpO1xyXG4gICAqXHJcbiAgICogY29uc3QgdXVpZCA9IFV1aWQuZnJvbUNvdW50ZXJWNyhjb3VudGVyLCBub3csIHJhbmRvbUJ5dGVzKTtcclxuICAgKlxyXG4gICAqIGNvbnNvbGUuYXNzZXJ0KFxyXG4gICAqICAgdXVpZC50b1N0cmluZygpID09PSBcIjAwMDA2NDdlLTUxODAtNzAwMC04MDAwLTAwMDIwMDAwMDAwMFwiXHJcbiAgICogKTtcclxuICAgKiBgYGBcclxuICAgKi9cclxuICBzdGF0aWMgZnJvbUNvdW50ZXJWNyhjb3VudGVyLCBub3csIHJhbmRvbUJ5dGVzKSB7XHJcbiAgICBpZiAocmFuZG9tQnl0ZXMubGVuZ3RoICE9PSA0KSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihcImBmcm9tQ291bnRlclY3YCByZXF1aXJlcyBgcmFuZG9tQnl0ZXMubGVuZ3RoID09IDRgXCIpO1xyXG4gICAgfVxyXG4gICAgaWYgKGNvdW50ZXIudmFsdWUgPCAwKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihcImBmcm9tQ291bnRlclY3YCB1dWlkIGBjb3VudGVyYCBtdXN0IGJlIG5vbi1uZWdhdGl2ZVwiKTtcclxuICAgIH1cclxuICAgIGlmIChub3cuX190aW1lc3RhbXBfbWljcm9zX3NpbmNlX3VuaXhfZXBvY2hfXyA8IDApIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiYGZyb21Db3VudGVyVjdgIGB0aW1lc3RhbXBgIGJlZm9yZSB1bml4IGVwb2NoXCIpO1xyXG4gICAgfVxyXG4gICAgY29uc3QgY291bnRlclZhbCA9IGNvdW50ZXIudmFsdWU7XHJcbiAgICBjb3VudGVyLnZhbHVlID0gY291bnRlclZhbCArIDEgJiAyMTQ3NDgzNjQ3O1xyXG4gICAgY29uc3QgdHNNcyA9IG5vdy50b01pbGxpcygpICYgMHhmZmZmZmZmZmZmZmZuO1xyXG4gICAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheSgxNik7XHJcbiAgICBieXRlc1swXSA9IE51bWJlcih0c01zID4+IDQwbiAmIDB4ZmZuKTtcclxuICAgIGJ5dGVzWzFdID0gTnVtYmVyKHRzTXMgPj4gMzJuICYgMHhmZm4pO1xyXG4gICAgYnl0ZXNbMl0gPSBOdW1iZXIodHNNcyA+PiAyNG4gJiAweGZmbik7XHJcbiAgICBieXRlc1szXSA9IE51bWJlcih0c01zID4+IDE2biAmIDB4ZmZuKTtcclxuICAgIGJ5dGVzWzRdID0gTnVtYmVyKHRzTXMgPj4gOG4gJiAweGZmbik7XHJcbiAgICBieXRlc1s1XSA9IE51bWJlcih0c01zICYgMHhmZm4pO1xyXG4gICAgYnl0ZXNbN10gPSBjb3VudGVyVmFsID4+PiAyMyAmIDI1NTtcclxuICAgIGJ5dGVzWzldID0gY291bnRlclZhbCA+Pj4gMTUgJiAyNTU7XHJcbiAgICBieXRlc1sxMF0gPSBjb3VudGVyVmFsID4+PiA3ICYgMjU1O1xyXG4gICAgYnl0ZXNbMTFdID0gKGNvdW50ZXJWYWwgJiAxMjcpIDw8IDEgJiAyNTU7XHJcbiAgICBieXRlc1sxMl0gfD0gcmFuZG9tQnl0ZXNbMF0gJiAxMjc7XHJcbiAgICBieXRlc1sxM10gPSByYW5kb21CeXRlc1sxXTtcclxuICAgIGJ5dGVzWzE0XSA9IHJhbmRvbUJ5dGVzWzJdO1xyXG4gICAgYnl0ZXNbMTVdID0gcmFuZG9tQnl0ZXNbM107XHJcbiAgICBieXRlc1s2XSA9IGJ5dGVzWzZdICYgMTUgfCAxMTI7XHJcbiAgICBieXRlc1s4XSA9IGJ5dGVzWzhdICYgNjMgfCAxMjg7XHJcbiAgICByZXR1cm4gbmV3IF9VdWlkKF9VdWlkLmJ5dGVzVG9CaWdJbnQoYnl0ZXMpKTtcclxuICB9XHJcbiAgLyoqXHJcbiAgICogUGFyc2UgYSBVVUlEIGZyb20gYSBzdHJpbmcgcmVwcmVzZW50YXRpb24uXHJcbiAgICpcclxuICAgKiBAcGFyYW0gcyAtIFVVSUQgc3RyaW5nXHJcbiAgICogQHJldHVybnMgUGFyc2VkIFVVSURcclxuICAgKiBAdGhyb3dzIHtFcnJvcn0gSWYgdGhlIHN0cmluZyBpcyBub3QgYSB2YWxpZCBVVUlEXHJcbiAgICpcclxuICAgKiBAZXhhbXBsZVxyXG4gICAqIGBgYHRzXHJcbiAgICogY29uc3QgcyA9IFwiMDE4ODhkNmUtNWMwMC03MDAwLTgwMDAtMDAwMDAwMDAwMDAwXCI7XHJcbiAgICogY29uc3QgdXVpZCA9IFV1aWQucGFyc2Uocyk7XHJcbiAgICpcclxuICAgKiBjb25zb2xlLmFzc2VydCh1dWlkLnRvU3RyaW5nKCkgPT09IHMpO1xyXG4gICAqIGBgYFxyXG4gICAqL1xyXG4gIHN0YXRpYyBwYXJzZShzKSB7XHJcbiAgICBjb25zdCBoZXggPSBzLnJlcGxhY2UoLy0vZywgXCJcIik7XHJcbiAgICBpZiAoaGV4Lmxlbmd0aCAhPT0gMzIpIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgaGV4IFVVSURcIik7XHJcbiAgICBsZXQgdiA9IDBuO1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAzMjsgaSArPSAyKSB7XHJcbiAgICAgIHYgPSB2IDw8IDhuIHwgQmlnSW50KHBhcnNlSW50KGhleC5zbGljZShpLCBpICsgMiksIDE2KSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbmV3IF9VdWlkKHYpO1xyXG4gIH1cclxuICAvKiogQ29udmVydCB0byBzdHJpbmcgKGh5cGhlbmF0ZWQgZm9ybSkuICovXHJcbiAgdG9TdHJpbmcoKSB7XHJcbiAgICBjb25zdCBieXRlcyA9IF9VdWlkLmJpZ0ludFRvQnl0ZXModGhpcy5fX3V1aWRfXyk7XHJcbiAgICBjb25zdCBoZXggPSBbLi4uYnl0ZXNdLm1hcCgoYikgPT4gYi50b1N0cmluZygxNikucGFkU3RhcnQoMiwgXCIwXCIpKS5qb2luKFwiXCIpO1xyXG4gICAgcmV0dXJuIGhleC5zbGljZSgwLCA4KSArIFwiLVwiICsgaGV4LnNsaWNlKDgsIDEyKSArIFwiLVwiICsgaGV4LnNsaWNlKDEyLCAxNikgKyBcIi1cIiArIGhleC5zbGljZSgxNiwgMjApICsgXCItXCIgKyBoZXguc2xpY2UoMjApO1xyXG4gIH1cclxuICAvKiogQ29udmVydCB0byBiaWdpbnQgKHUxMjgpLiAqL1xyXG4gIGFzQmlnSW50KCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX191dWlkX187XHJcbiAgfVxyXG4gIC8qKiBSZXR1cm4gYSBgVWludDhBcnJheWAgb2YgMTYgYnl0ZXMuICovXHJcbiAgdG9CeXRlcygpIHtcclxuICAgIHJldHVybiBfVXVpZC5iaWdJbnRUb0J5dGVzKHRoaXMuX191dWlkX18pO1xyXG4gIH1cclxuICBzdGF0aWMgYnl0ZXNUb0JpZ0ludChieXRlcykge1xyXG4gICAgbGV0IHJlc3VsdCA9IDBuO1xyXG4gICAgZm9yIChjb25zdCBiIG9mIGJ5dGVzKSByZXN1bHQgPSByZXN1bHQgPDwgOG4gfCBCaWdJbnQoYik7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH1cclxuICBzdGF0aWMgYmlnSW50VG9CeXRlcyh2YWx1ZSkge1xyXG4gICAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheSgxNik7XHJcbiAgICBmb3IgKGxldCBpID0gMTU7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgIGJ5dGVzW2ldID0gTnVtYmVyKHZhbHVlICYgMHhmZm4pO1xyXG4gICAgICB2YWx1ZSA+Pj0gOG47XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYnl0ZXM7XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHZlcnNpb24gb2YgdGhpcyBVVUlELlxyXG4gICAqXHJcbiAgICogVGhpcyByZXByZXNlbnRzIHRoZSBhbGdvcml0aG0gdXNlZCB0byBnZW5lcmF0ZSB0aGUgdmFsdWUuXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyBBIGBVdWlkVmVyc2lvbmBcclxuICAgKiBAdGhyb3dzIHtFcnJvcn0gSWYgdGhlIHZlcnNpb24gZmllbGQgaXMgbm90IHJlY29nbml6ZWRcclxuICAgKi9cclxuICBnZXRWZXJzaW9uKCkge1xyXG4gICAgY29uc3QgdmVyc2lvbiA9IHRoaXMudG9CeXRlcygpWzZdID4+IDQgJiAxNTtcclxuICAgIHN3aXRjaCAodmVyc2lvbikge1xyXG4gICAgICBjYXNlIDQ6XHJcbiAgICAgICAgcmV0dXJuIFwiVjRcIjtcclxuICAgICAgY2FzZSA3OlxyXG4gICAgICAgIHJldHVybiBcIlY3XCI7XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgaWYgKHRoaXMgPT0gX1V1aWQuTklMKSB7XHJcbiAgICAgICAgICByZXR1cm4gXCJOaWxcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMgPT0gX1V1aWQuTUFYKSB7XHJcbiAgICAgICAgICByZXR1cm4gXCJNYXhcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCBVVUlEIHZlcnNpb246ICR7dmVyc2lvbn1gKTtcclxuICAgIH1cclxuICB9XHJcbiAgLyoqXHJcbiAgICogRXh0cmFjdCB0aGUgbW9ub3RvbmljIGNvdW50ZXIgZnJvbSBhIFVVSUR2Ny5cclxuICAgKlxyXG4gICAqIEludGVuZGVkIGZvciB0ZXN0aW5nIGFuZCBkaWFnbm9zdGljcy5cclxuICAgKiBCZWhhdmlvciBpcyB1bmRlZmluZWQgaWYgY2FsbGVkIG9uIGEgbm9uLVY3IFVVSUQuXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyAzMS1iaXQgY291bnRlciB2YWx1ZVxyXG4gICAqL1xyXG4gIGdldENvdW50ZXIoKSB7XHJcbiAgICBjb25zdCBieXRlcyA9IHRoaXMudG9CeXRlcygpO1xyXG4gICAgY29uc3QgaGlnaCA9IGJ5dGVzWzddO1xyXG4gICAgY29uc3QgbWlkMSA9IGJ5dGVzWzldO1xyXG4gICAgY29uc3QgbWlkMiA9IGJ5dGVzWzEwXTtcclxuICAgIGNvbnN0IGxvdyA9IGJ5dGVzWzExXSA+Pj4gMTtcclxuICAgIHJldHVybiBoaWdoIDw8IDIzIHwgbWlkMSA8PCAxNSB8IG1pZDIgPDwgNyB8IGxvdyB8IDA7XHJcbiAgfVxyXG4gIGNvbXBhcmVUbyhvdGhlcikge1xyXG4gICAgaWYgKHRoaXMuX191dWlkX18gPCBvdGhlci5fX3V1aWRfXykgcmV0dXJuIC0xO1xyXG4gICAgaWYgKHRoaXMuX191dWlkX18gPiBvdGhlci5fX3V1aWRfXykgcmV0dXJuIDE7XHJcbiAgICByZXR1cm4gMDtcclxuICB9XHJcbiAgc3RhdGljIGdldEFsZ2VicmFpY1R5cGUoKSB7XHJcbiAgICByZXR1cm4gQWxnZWJyYWljVHlwZS5Qcm9kdWN0KHtcclxuICAgICAgZWxlbWVudHM6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBuYW1lOiBcIl9fdXVpZF9fXCIsXHJcbiAgICAgICAgICBhbGdlYnJhaWNUeXBlOiBBbGdlYnJhaWNUeXBlLlUxMjhcclxuICAgICAgICB9XHJcbiAgICAgIF1cclxuICAgIH0pO1xyXG4gIH1cclxufTtcclxuXHJcbi8vIHNyYy9saWIvYmluYXJ5X3JlYWRlci50c1xyXG52YXIgQmluYXJ5UmVhZGVyID0gY2xhc3Mge1xyXG4gIC8qKlxyXG4gICAqIFRoZSBEYXRhVmlldyB1c2VkIHRvIHJlYWQgdmFsdWVzIGZyb20gdGhlIGJpbmFyeSBkYXRhLlxyXG4gICAqXHJcbiAgICogTm90ZTogVGhlIERhdGFWaWV3J3MgYGJ5dGVPZmZzZXRgIGlzIHJlbGF0aXZlIHRvIHRoZSBiZWdpbm5pbmcgb2YgdGhlXHJcbiAgICogdW5kZXJseWluZyBBcnJheUJ1ZmZlciwgbm90IHRoZSBzdGFydCBvZiB0aGUgcHJvdmlkZWQgVWludDhBcnJheSBpbnB1dC5cclxuICAgKiBUaGlzIGBCaW5hcnlSZWFkZXJgJ3MgYCNvZmZzZXRgIGZpZWxkIGlzIHVzZWQgdG8gdHJhY2sgdGhlIGN1cnJlbnQgcmVhZCBwb3NpdGlvblxyXG4gICAqIHJlbGF0aXZlIHRvIHRoZSBzdGFydCBvZiB0aGUgcHJvdmlkZWQgVWludDhBcnJheSBpbnB1dC5cclxuICAgKi9cclxuICB2aWV3O1xyXG4gIC8qKlxyXG4gICAqIFJlcHJlc2VudHMgdGhlIG9mZnNldCAoaW4gYnl0ZXMpIHJlbGF0aXZlIHRvIHRoZSBzdGFydCBvZiB0aGUgRGF0YVZpZXdcclxuICAgKiBhbmQgcHJvdmlkZWQgVWludDhBcnJheSBpbnB1dC5cclxuICAgKlxyXG4gICAqIE5vdGU6IFRoaXMgaXMgKm5vdCogdGhlIGFic29sdXRlIGJ5dGUgb2Zmc2V0IHdpdGhpbiB0aGUgdW5kZXJseWluZyBBcnJheUJ1ZmZlci5cclxuICAgKi9cclxuICBvZmZzZXQgPSAwO1xyXG4gIGNvbnN0cnVjdG9yKGlucHV0KSB7XHJcbiAgICB0aGlzLnZpZXcgPSBpbnB1dCBpbnN0YW5jZW9mIERhdGFWaWV3ID8gaW5wdXQgOiBuZXcgRGF0YVZpZXcoaW5wdXQuYnVmZmVyLCBpbnB1dC5ieXRlT2Zmc2V0LCBpbnB1dC5ieXRlTGVuZ3RoKTtcclxuICAgIHRoaXMub2Zmc2V0ID0gMDtcclxuICB9XHJcbiAgcmVzZXQodmlldykge1xyXG4gICAgdGhpcy52aWV3ID0gdmlldztcclxuICAgIHRoaXMub2Zmc2V0ID0gMDtcclxuICB9XHJcbiAgZ2V0IHJlbWFpbmluZygpIHtcclxuICAgIHJldHVybiB0aGlzLnZpZXcuYnl0ZUxlbmd0aCAtIHRoaXMub2Zmc2V0O1xyXG4gIH1cclxuICAvKiogRW5zdXJlIHdlIGhhdmUgYXQgbGVhc3QgYG5gIGJ5dGVzIGxlZnQgdG8gcmVhZCAqL1xyXG4gICNlbnN1cmUobikge1xyXG4gICAgaWYgKHRoaXMub2Zmc2V0ICsgbiA+IHRoaXMudmlldy5ieXRlTGVuZ3RoKSB7XHJcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKFxyXG4gICAgICAgIGBUcmllZCB0byByZWFkICR7bn0gYnl0ZShzKSBhdCByZWxhdGl2ZSBvZmZzZXQgJHt0aGlzLm9mZnNldH0sIGJ1dCBvbmx5ICR7dGhpcy5yZW1haW5pbmd9IGJ5dGUocykgcmVtYWluYFxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gIH1cclxuICByZWFkVUludDhBcnJheSgpIHtcclxuICAgIGNvbnN0IGxlbmd0aCA9IHRoaXMucmVhZFUzMigpO1xyXG4gICAgdGhpcy4jZW5zdXJlKGxlbmd0aCk7XHJcbiAgICByZXR1cm4gdGhpcy5yZWFkQnl0ZXMobGVuZ3RoKTtcclxuICB9XHJcbiAgcmVhZEJvb2woKSB7XHJcbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMudmlldy5nZXRVaW50OCh0aGlzLm9mZnNldCk7XHJcbiAgICB0aGlzLm9mZnNldCArPSAxO1xyXG4gICAgcmV0dXJuIHZhbHVlICE9PSAwO1xyXG4gIH1cclxuICByZWFkQnl0ZSgpIHtcclxuICAgIGNvbnN0IHZhbHVlID0gdGhpcy52aWV3LmdldFVpbnQ4KHRoaXMub2Zmc2V0KTtcclxuICAgIHRoaXMub2Zmc2V0ICs9IDE7XHJcbiAgICByZXR1cm4gdmFsdWU7XHJcbiAgfVxyXG4gIHJlYWRCeXRlcyhsZW5ndGgpIHtcclxuICAgIGNvbnN0IGFycmF5ID0gbmV3IFVpbnQ4QXJyYXkoXHJcbiAgICAgIHRoaXMudmlldy5idWZmZXIsXHJcbiAgICAgIHRoaXMudmlldy5ieXRlT2Zmc2V0ICsgdGhpcy5vZmZzZXQsXHJcbiAgICAgIGxlbmd0aFxyXG4gICAgKTtcclxuICAgIHRoaXMub2Zmc2V0ICs9IGxlbmd0aDtcclxuICAgIHJldHVybiBhcnJheTtcclxuICB9XHJcbiAgcmVhZEk4KCkge1xyXG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLnZpZXcuZ2V0SW50OCh0aGlzLm9mZnNldCk7XHJcbiAgICB0aGlzLm9mZnNldCArPSAxO1xyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG4gIH1cclxuICByZWFkVTgoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5yZWFkQnl0ZSgpO1xyXG4gIH1cclxuICByZWFkSTE2KCkge1xyXG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLnZpZXcuZ2V0SW50MTYodGhpcy5vZmZzZXQsIHRydWUpO1xyXG4gICAgdGhpcy5vZmZzZXQgKz0gMjtcclxuICAgIHJldHVybiB2YWx1ZTtcclxuICB9XHJcbiAgcmVhZFUxNigpIHtcclxuICAgIGNvbnN0IHZhbHVlID0gdGhpcy52aWV3LmdldFVpbnQxNih0aGlzLm9mZnNldCwgdHJ1ZSk7XHJcbiAgICB0aGlzLm9mZnNldCArPSAyO1xyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG4gIH1cclxuICByZWFkSTMyKCkge1xyXG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLnZpZXcuZ2V0SW50MzIodGhpcy5vZmZzZXQsIHRydWUpO1xyXG4gICAgdGhpcy5vZmZzZXQgKz0gNDtcclxuICAgIHJldHVybiB2YWx1ZTtcclxuICB9XHJcbiAgcmVhZFUzMigpIHtcclxuICAgIGNvbnN0IHZhbHVlID0gdGhpcy52aWV3LmdldFVpbnQzMih0aGlzLm9mZnNldCwgdHJ1ZSk7XHJcbiAgICB0aGlzLm9mZnNldCArPSA0O1xyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG4gIH1cclxuICByZWFkSTY0KCkge1xyXG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLnZpZXcuZ2V0QmlnSW50NjQodGhpcy5vZmZzZXQsIHRydWUpO1xyXG4gICAgdGhpcy5vZmZzZXQgKz0gODtcclxuICAgIHJldHVybiB2YWx1ZTtcclxuICB9XHJcbiAgcmVhZFU2NCgpIHtcclxuICAgIGNvbnN0IHZhbHVlID0gdGhpcy52aWV3LmdldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCwgdHJ1ZSk7XHJcbiAgICB0aGlzLm9mZnNldCArPSA4O1xyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG4gIH1cclxuICByZWFkVTEyOCgpIHtcclxuICAgIGNvbnN0IGxvd2VyUGFydCA9IHRoaXMudmlldy5nZXRCaWdVaW50NjQodGhpcy5vZmZzZXQsIHRydWUpO1xyXG4gICAgY29uc3QgdXBwZXJQYXJ0ID0gdGhpcy52aWV3LmdldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCArIDgsIHRydWUpO1xyXG4gICAgdGhpcy5vZmZzZXQgKz0gMTY7XHJcbiAgICByZXR1cm4gKHVwcGVyUGFydCA8PCBCaWdJbnQoNjQpKSArIGxvd2VyUGFydDtcclxuICB9XHJcbiAgcmVhZEkxMjgoKSB7XHJcbiAgICBjb25zdCBsb3dlclBhcnQgPSB0aGlzLnZpZXcuZ2V0QmlnVWludDY0KHRoaXMub2Zmc2V0LCB0cnVlKTtcclxuICAgIGNvbnN0IHVwcGVyUGFydCA9IHRoaXMudmlldy5nZXRCaWdJbnQ2NCh0aGlzLm9mZnNldCArIDgsIHRydWUpO1xyXG4gICAgdGhpcy5vZmZzZXQgKz0gMTY7XHJcbiAgICByZXR1cm4gKHVwcGVyUGFydCA8PCBCaWdJbnQoNjQpKSArIGxvd2VyUGFydDtcclxuICB9XHJcbiAgcmVhZFUyNTYoKSB7XHJcbiAgICBjb25zdCBwMCA9IHRoaXMudmlldy5nZXRCaWdVaW50NjQodGhpcy5vZmZzZXQsIHRydWUpO1xyXG4gICAgY29uc3QgcDEgPSB0aGlzLnZpZXcuZ2V0QmlnVWludDY0KHRoaXMub2Zmc2V0ICsgOCwgdHJ1ZSk7XHJcbiAgICBjb25zdCBwMiA9IHRoaXMudmlldy5nZXRCaWdVaW50NjQodGhpcy5vZmZzZXQgKyAxNiwgdHJ1ZSk7XHJcbiAgICBjb25zdCBwMyA9IHRoaXMudmlldy5nZXRCaWdVaW50NjQodGhpcy5vZmZzZXQgKyAyNCwgdHJ1ZSk7XHJcbiAgICB0aGlzLm9mZnNldCArPSAzMjtcclxuICAgIHJldHVybiAocDMgPDwgQmlnSW50KDMgKiA2NCkpICsgKHAyIDw8IEJpZ0ludCgyICogNjQpKSArIChwMSA8PCBCaWdJbnQoMSAqIDY0KSkgKyBwMDtcclxuICB9XHJcbiAgcmVhZEkyNTYoKSB7XHJcbiAgICBjb25zdCBwMCA9IHRoaXMudmlldy5nZXRCaWdVaW50NjQodGhpcy5vZmZzZXQsIHRydWUpO1xyXG4gICAgY29uc3QgcDEgPSB0aGlzLnZpZXcuZ2V0QmlnVWludDY0KHRoaXMub2Zmc2V0ICsgOCwgdHJ1ZSk7XHJcbiAgICBjb25zdCBwMiA9IHRoaXMudmlldy5nZXRCaWdVaW50NjQodGhpcy5vZmZzZXQgKyAxNiwgdHJ1ZSk7XHJcbiAgICBjb25zdCBwMyA9IHRoaXMudmlldy5nZXRCaWdJbnQ2NCh0aGlzLm9mZnNldCArIDI0LCB0cnVlKTtcclxuICAgIHRoaXMub2Zmc2V0ICs9IDMyO1xyXG4gICAgcmV0dXJuIChwMyA8PCBCaWdJbnQoMyAqIDY0KSkgKyAocDIgPDwgQmlnSW50KDIgKiA2NCkpICsgKHAxIDw8IEJpZ0ludCgxICogNjQpKSArIHAwO1xyXG4gIH1cclxuICByZWFkRjMyKCkge1xyXG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLnZpZXcuZ2V0RmxvYXQzMih0aGlzLm9mZnNldCwgdHJ1ZSk7XHJcbiAgICB0aGlzLm9mZnNldCArPSA0O1xyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG4gIH1cclxuICByZWFkRjY0KCkge1xyXG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLnZpZXcuZ2V0RmxvYXQ2NCh0aGlzLm9mZnNldCwgdHJ1ZSk7XHJcbiAgICB0aGlzLm9mZnNldCArPSA4O1xyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG4gIH1cclxuICByZWFkU3RyaW5nKCkge1xyXG4gICAgY29uc3QgdWludDhBcnJheSA9IHRoaXMucmVhZFVJbnQ4QXJyYXkoKTtcclxuICAgIHJldHVybiBuZXcgVGV4dERlY29kZXIoXCJ1dGYtOFwiKS5kZWNvZGUodWludDhBcnJheSk7XHJcbiAgfVxyXG59O1xyXG5cclxuLy8gc3JjL2xpYi9iaW5hcnlfd3JpdGVyLnRzXHJcbnZhciBpbXBvcnRfYmFzZTY0X2pzID0gX190b0VTTShyZXF1aXJlX2Jhc2U2NF9qcygpKTtcclxudmFyIEFycmF5QnVmZmVyUHJvdG90eXBlVHJhbnNmZXIgPSBBcnJheUJ1ZmZlci5wcm90b3R5cGUudHJhbnNmZXIgPz8gZnVuY3Rpb24obmV3Qnl0ZUxlbmd0aCkge1xyXG4gIGlmIChuZXdCeXRlTGVuZ3RoID09PSB2b2lkIDApIHtcclxuICAgIHJldHVybiB0aGlzLnNsaWNlKCk7XHJcbiAgfSBlbHNlIGlmIChuZXdCeXRlTGVuZ3RoIDw9IHRoaXMuYnl0ZUxlbmd0aCkge1xyXG4gICAgcmV0dXJuIHRoaXMuc2xpY2UoMCwgbmV3Qnl0ZUxlbmd0aCk7XHJcbiAgfSBlbHNlIHtcclxuICAgIGNvbnN0IGNvcHkgPSBuZXcgVWludDhBcnJheShuZXdCeXRlTGVuZ3RoKTtcclxuICAgIGNvcHkuc2V0KG5ldyBVaW50OEFycmF5KHRoaXMpKTtcclxuICAgIHJldHVybiBjb3B5LmJ1ZmZlcjtcclxuICB9XHJcbn07XHJcbnZhciBSZXNpemFibGVCdWZmZXIgPSBjbGFzcyB7XHJcbiAgYnVmZmVyO1xyXG4gIHZpZXc7XHJcbiAgY29uc3RydWN0b3IoaW5pdCkge1xyXG4gICAgdGhpcy5idWZmZXIgPSB0eXBlb2YgaW5pdCA9PT0gXCJudW1iZXJcIiA/IG5ldyBBcnJheUJ1ZmZlcihpbml0KSA6IGluaXQ7XHJcbiAgICB0aGlzLnZpZXcgPSBuZXcgRGF0YVZpZXcodGhpcy5idWZmZXIpO1xyXG4gIH1cclxuICBnZXQgY2FwYWNpdHkoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5idWZmZXIuYnl0ZUxlbmd0aDtcclxuICB9XHJcbiAgZ3JvdyhuZXdTaXplKSB7XHJcbiAgICBpZiAobmV3U2l6ZSA8PSB0aGlzLmJ1ZmZlci5ieXRlTGVuZ3RoKSByZXR1cm47XHJcbiAgICB0aGlzLmJ1ZmZlciA9IEFycmF5QnVmZmVyUHJvdG90eXBlVHJhbnNmZXIuY2FsbCh0aGlzLmJ1ZmZlciwgbmV3U2l6ZSk7XHJcbiAgICB0aGlzLnZpZXcgPSBuZXcgRGF0YVZpZXcodGhpcy5idWZmZXIpO1xyXG4gIH1cclxufTtcclxudmFyIEJpbmFyeVdyaXRlciA9IGNsYXNzIHtcclxuICBidWZmZXI7XHJcbiAgb2Zmc2V0ID0gMDtcclxuICBjb25zdHJ1Y3Rvcihpbml0KSB7XHJcbiAgICB0aGlzLmJ1ZmZlciA9IHR5cGVvZiBpbml0ID09PSBcIm51bWJlclwiID8gbmV3IFJlc2l6YWJsZUJ1ZmZlcihpbml0KSA6IGluaXQ7XHJcbiAgfVxyXG4gIHJlc2V0KGJ1ZmZlcikge1xyXG4gICAgdGhpcy5idWZmZXIgPSBidWZmZXI7XHJcbiAgICB0aGlzLm9mZnNldCA9IDA7XHJcbiAgfVxyXG4gIGV4cGFuZEJ1ZmZlcihhZGRpdGlvbmFsQ2FwYWNpdHkpIHtcclxuICAgIGNvbnN0IG1pbkNhcGFjaXR5ID0gdGhpcy5vZmZzZXQgKyBhZGRpdGlvbmFsQ2FwYWNpdHkgKyAxO1xyXG4gICAgaWYgKG1pbkNhcGFjaXR5IDw9IHRoaXMuYnVmZmVyLmNhcGFjaXR5KSByZXR1cm47XHJcbiAgICBsZXQgbmV3Q2FwYWNpdHkgPSB0aGlzLmJ1ZmZlci5jYXBhY2l0eSAqIDI7XHJcbiAgICBpZiAobmV3Q2FwYWNpdHkgPCBtaW5DYXBhY2l0eSkgbmV3Q2FwYWNpdHkgPSBtaW5DYXBhY2l0eTtcclxuICAgIHRoaXMuYnVmZmVyLmdyb3cobmV3Q2FwYWNpdHkpO1xyXG4gIH1cclxuICB0b0Jhc2U2NCgpIHtcclxuICAgIHJldHVybiAoMCwgaW1wb3J0X2Jhc2U2NF9qcy5mcm9tQnl0ZUFycmF5KSh0aGlzLmdldEJ1ZmZlcigpKTtcclxuICB9XHJcbiAgZ2V0QnVmZmVyKCkge1xyXG4gICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KHRoaXMuYnVmZmVyLmJ1ZmZlciwgMCwgdGhpcy5vZmZzZXQpO1xyXG4gIH1cclxuICBnZXQgdmlldygpIHtcclxuICAgIHJldHVybiB0aGlzLmJ1ZmZlci52aWV3O1xyXG4gIH1cclxuICB3cml0ZVVJbnQ4QXJyYXkodmFsdWUpIHtcclxuICAgIGNvbnN0IGxlbmd0aCA9IHZhbHVlLmxlbmd0aDtcclxuICAgIHRoaXMuZXhwYW5kQnVmZmVyKDQgKyBsZW5ndGgpO1xyXG4gICAgdGhpcy53cml0ZVUzMihsZW5ndGgpO1xyXG4gICAgbmV3IFVpbnQ4QXJyYXkodGhpcy5idWZmZXIuYnVmZmVyLCB0aGlzLm9mZnNldCkuc2V0KHZhbHVlKTtcclxuICAgIHRoaXMub2Zmc2V0ICs9IGxlbmd0aDtcclxuICB9XHJcbiAgd3JpdGVCb29sKHZhbHVlKSB7XHJcbiAgICB0aGlzLmV4cGFuZEJ1ZmZlcigxKTtcclxuICAgIHRoaXMudmlldy5zZXRVaW50OCh0aGlzLm9mZnNldCwgdmFsdWUgPyAxIDogMCk7XHJcbiAgICB0aGlzLm9mZnNldCArPSAxO1xyXG4gIH1cclxuICB3cml0ZUJ5dGUodmFsdWUpIHtcclxuICAgIHRoaXMuZXhwYW5kQnVmZmVyKDEpO1xyXG4gICAgdGhpcy52aWV3LnNldFVpbnQ4KHRoaXMub2Zmc2V0LCB2YWx1ZSk7XHJcbiAgICB0aGlzLm9mZnNldCArPSAxO1xyXG4gIH1cclxuICB3cml0ZUk4KHZhbHVlKSB7XHJcbiAgICB0aGlzLmV4cGFuZEJ1ZmZlcigxKTtcclxuICAgIHRoaXMudmlldy5zZXRJbnQ4KHRoaXMub2Zmc2V0LCB2YWx1ZSk7XHJcbiAgICB0aGlzLm9mZnNldCArPSAxO1xyXG4gIH1cclxuICB3cml0ZVU4KHZhbHVlKSB7XHJcbiAgICB0aGlzLmV4cGFuZEJ1ZmZlcigxKTtcclxuICAgIHRoaXMudmlldy5zZXRVaW50OCh0aGlzLm9mZnNldCwgdmFsdWUpO1xyXG4gICAgdGhpcy5vZmZzZXQgKz0gMTtcclxuICB9XHJcbiAgd3JpdGVJMTYodmFsdWUpIHtcclxuICAgIHRoaXMuZXhwYW5kQnVmZmVyKDIpO1xyXG4gICAgdGhpcy52aWV3LnNldEludDE2KHRoaXMub2Zmc2V0LCB2YWx1ZSwgdHJ1ZSk7XHJcbiAgICB0aGlzLm9mZnNldCArPSAyO1xyXG4gIH1cclxuICB3cml0ZVUxNih2YWx1ZSkge1xyXG4gICAgdGhpcy5leHBhbmRCdWZmZXIoMik7XHJcbiAgICB0aGlzLnZpZXcuc2V0VWludDE2KHRoaXMub2Zmc2V0LCB2YWx1ZSwgdHJ1ZSk7XHJcbiAgICB0aGlzLm9mZnNldCArPSAyO1xyXG4gIH1cclxuICB3cml0ZUkzMih2YWx1ZSkge1xyXG4gICAgdGhpcy5leHBhbmRCdWZmZXIoNCk7XHJcbiAgICB0aGlzLnZpZXcuc2V0SW50MzIodGhpcy5vZmZzZXQsIHZhbHVlLCB0cnVlKTtcclxuICAgIHRoaXMub2Zmc2V0ICs9IDQ7XHJcbiAgfVxyXG4gIHdyaXRlVTMyKHZhbHVlKSB7XHJcbiAgICB0aGlzLmV4cGFuZEJ1ZmZlcig0KTtcclxuICAgIHRoaXMudmlldy5zZXRVaW50MzIodGhpcy5vZmZzZXQsIHZhbHVlLCB0cnVlKTtcclxuICAgIHRoaXMub2Zmc2V0ICs9IDQ7XHJcbiAgfVxyXG4gIHdyaXRlSTY0KHZhbHVlKSB7XHJcbiAgICB0aGlzLmV4cGFuZEJ1ZmZlcig4KTtcclxuICAgIHRoaXMudmlldy5zZXRCaWdJbnQ2NCh0aGlzLm9mZnNldCwgdmFsdWUsIHRydWUpO1xyXG4gICAgdGhpcy5vZmZzZXQgKz0gODtcclxuICB9XHJcbiAgd3JpdGVVNjQodmFsdWUpIHtcclxuICAgIHRoaXMuZXhwYW5kQnVmZmVyKDgpO1xyXG4gICAgdGhpcy52aWV3LnNldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCwgdmFsdWUsIHRydWUpO1xyXG4gICAgdGhpcy5vZmZzZXQgKz0gODtcclxuICB9XHJcbiAgd3JpdGVVMTI4KHZhbHVlKSB7XHJcbiAgICB0aGlzLmV4cGFuZEJ1ZmZlcigxNik7XHJcbiAgICBjb25zdCBsb3dlclBhcnQgPSB2YWx1ZSAmIEJpZ0ludChcIjB4RkZGRkZGRkZGRkZGRkZGRlwiKTtcclxuICAgIGNvbnN0IHVwcGVyUGFydCA9IHZhbHVlID4+IEJpZ0ludCg2NCk7XHJcbiAgICB0aGlzLnZpZXcuc2V0QmlnVWludDY0KHRoaXMub2Zmc2V0LCBsb3dlclBhcnQsIHRydWUpO1xyXG4gICAgdGhpcy52aWV3LnNldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCArIDgsIHVwcGVyUGFydCwgdHJ1ZSk7XHJcbiAgICB0aGlzLm9mZnNldCArPSAxNjtcclxuICB9XHJcbiAgd3JpdGVJMTI4KHZhbHVlKSB7XHJcbiAgICB0aGlzLmV4cGFuZEJ1ZmZlcigxNik7XHJcbiAgICBjb25zdCBsb3dlclBhcnQgPSB2YWx1ZSAmIEJpZ0ludChcIjB4RkZGRkZGRkZGRkZGRkZGRlwiKTtcclxuICAgIGNvbnN0IHVwcGVyUGFydCA9IHZhbHVlID4+IEJpZ0ludCg2NCk7XHJcbiAgICB0aGlzLnZpZXcuc2V0QmlnSW50NjQodGhpcy5vZmZzZXQsIGxvd2VyUGFydCwgdHJ1ZSk7XHJcbiAgICB0aGlzLnZpZXcuc2V0QmlnSW50NjQodGhpcy5vZmZzZXQgKyA4LCB1cHBlclBhcnQsIHRydWUpO1xyXG4gICAgdGhpcy5vZmZzZXQgKz0gMTY7XHJcbiAgfVxyXG4gIHdyaXRlVTI1Nih2YWx1ZSkge1xyXG4gICAgdGhpcy5leHBhbmRCdWZmZXIoMzIpO1xyXG4gICAgY29uc3QgbG93XzY0X21hc2sgPSBCaWdJbnQoXCIweEZGRkZGRkZGRkZGRkZGRkZcIik7XHJcbiAgICBjb25zdCBwMCA9IHZhbHVlICYgbG93XzY0X21hc2s7XHJcbiAgICBjb25zdCBwMSA9IHZhbHVlID4+IEJpZ0ludCg2NCAqIDEpICYgbG93XzY0X21hc2s7XHJcbiAgICBjb25zdCBwMiA9IHZhbHVlID4+IEJpZ0ludCg2NCAqIDIpICYgbG93XzY0X21hc2s7XHJcbiAgICBjb25zdCBwMyA9IHZhbHVlID4+IEJpZ0ludCg2NCAqIDMpO1xyXG4gICAgdGhpcy52aWV3LnNldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCArIDggKiAwLCBwMCwgdHJ1ZSk7XHJcbiAgICB0aGlzLnZpZXcuc2V0QmlnVWludDY0KHRoaXMub2Zmc2V0ICsgOCAqIDEsIHAxLCB0cnVlKTtcclxuICAgIHRoaXMudmlldy5zZXRCaWdVaW50NjQodGhpcy5vZmZzZXQgKyA4ICogMiwgcDIsIHRydWUpO1xyXG4gICAgdGhpcy52aWV3LnNldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCArIDggKiAzLCBwMywgdHJ1ZSk7XHJcbiAgICB0aGlzLm9mZnNldCArPSAzMjtcclxuICB9XHJcbiAgd3JpdGVJMjU2KHZhbHVlKSB7XHJcbiAgICB0aGlzLmV4cGFuZEJ1ZmZlcigzMik7XHJcbiAgICBjb25zdCBsb3dfNjRfbWFzayA9IEJpZ0ludChcIjB4RkZGRkZGRkZGRkZGRkZGRlwiKTtcclxuICAgIGNvbnN0IHAwID0gdmFsdWUgJiBsb3dfNjRfbWFzaztcclxuICAgIGNvbnN0IHAxID0gdmFsdWUgPj4gQmlnSW50KDY0ICogMSkgJiBsb3dfNjRfbWFzaztcclxuICAgIGNvbnN0IHAyID0gdmFsdWUgPj4gQmlnSW50KDY0ICogMikgJiBsb3dfNjRfbWFzaztcclxuICAgIGNvbnN0IHAzID0gdmFsdWUgPj4gQmlnSW50KDY0ICogMyk7XHJcbiAgICB0aGlzLnZpZXcuc2V0QmlnVWludDY0KHRoaXMub2Zmc2V0ICsgOCAqIDAsIHAwLCB0cnVlKTtcclxuICAgIHRoaXMudmlldy5zZXRCaWdVaW50NjQodGhpcy5vZmZzZXQgKyA4ICogMSwgcDEsIHRydWUpO1xyXG4gICAgdGhpcy52aWV3LnNldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCArIDggKiAyLCBwMiwgdHJ1ZSk7XHJcbiAgICB0aGlzLnZpZXcuc2V0QmlnSW50NjQodGhpcy5vZmZzZXQgKyA4ICogMywgcDMsIHRydWUpO1xyXG4gICAgdGhpcy5vZmZzZXQgKz0gMzI7XHJcbiAgfVxyXG4gIHdyaXRlRjMyKHZhbHVlKSB7XHJcbiAgICB0aGlzLmV4cGFuZEJ1ZmZlcig0KTtcclxuICAgIHRoaXMudmlldy5zZXRGbG9hdDMyKHRoaXMub2Zmc2V0LCB2YWx1ZSwgdHJ1ZSk7XHJcbiAgICB0aGlzLm9mZnNldCArPSA0O1xyXG4gIH1cclxuICB3cml0ZUY2NCh2YWx1ZSkge1xyXG4gICAgdGhpcy5leHBhbmRCdWZmZXIoOCk7XHJcbiAgICB0aGlzLnZpZXcuc2V0RmxvYXQ2NCh0aGlzLm9mZnNldCwgdmFsdWUsIHRydWUpO1xyXG4gICAgdGhpcy5vZmZzZXQgKz0gODtcclxuICB9XHJcbiAgd3JpdGVTdHJpbmcodmFsdWUpIHtcclxuICAgIGNvbnN0IGVuY29kZXIgPSBuZXcgVGV4dEVuY29kZXIoKTtcclxuICAgIGNvbnN0IGVuY29kZWRTdHJpbmcgPSBlbmNvZGVyLmVuY29kZSh2YWx1ZSk7XHJcbiAgICB0aGlzLndyaXRlVUludDhBcnJheShlbmNvZGVkU3RyaW5nKTtcclxuICB9XHJcbn07XHJcblxyXG4vLyBzcmMvbGliL3V0aWwudHNcclxuZnVuY3Rpb24gdWludDhBcnJheVRvSGV4U3RyaW5nKGFycmF5KSB7XHJcbiAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5tYXAuY2FsbChhcnJheS5yZXZlcnNlKCksICh4KSA9PiAoXCIwMFwiICsgeC50b1N0cmluZygxNikpLnNsaWNlKC0yKSkuam9pbihcIlwiKTtcclxufVxyXG5mdW5jdGlvbiB1aW50OEFycmF5VG9VMTI4KGFycmF5KSB7XHJcbiAgaWYgKGFycmF5Lmxlbmd0aCAhPSAxNikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKGBVaW50OEFycmF5IGlzIG5vdCAxNiBieXRlcyBsb25nOiAke2FycmF5fWApO1xyXG4gIH1cclxuICByZXR1cm4gbmV3IEJpbmFyeVJlYWRlcihhcnJheSkucmVhZFUxMjgoKTtcclxufVxyXG5mdW5jdGlvbiB1aW50OEFycmF5VG9VMjU2KGFycmF5KSB7XHJcbiAgaWYgKGFycmF5Lmxlbmd0aCAhPSAzMikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKGBVaW50OEFycmF5IGlzIG5vdCAzMiBieXRlcyBsb25nOiBbJHthcnJheX1dYCk7XHJcbiAgfVxyXG4gIHJldHVybiBuZXcgQmluYXJ5UmVhZGVyKGFycmF5KS5yZWFkVTI1NigpO1xyXG59XHJcbmZ1bmN0aW9uIGhleFN0cmluZ1RvVWludDhBcnJheShzdHIpIHtcclxuICBpZiAoc3RyLnN0YXJ0c1dpdGgoXCIweFwiKSkge1xyXG4gICAgc3RyID0gc3RyLnNsaWNlKDIpO1xyXG4gIH1cclxuICBjb25zdCBtYXRjaGVzID0gc3RyLm1hdGNoKC8uezEsMn0vZykgfHwgW107XHJcbiAgY29uc3QgZGF0YSA9IFVpbnQ4QXJyYXkuZnJvbShcclxuICAgIG1hdGNoZXMubWFwKChieXRlKSA9PiBwYXJzZUludChieXRlLCAxNikpXHJcbiAgKTtcclxuICByZXR1cm4gZGF0YS5yZXZlcnNlKCk7XHJcbn1cclxuZnVuY3Rpb24gaGV4U3RyaW5nVG9VMTI4KHN0cikge1xyXG4gIHJldHVybiB1aW50OEFycmF5VG9VMTI4KGhleFN0cmluZ1RvVWludDhBcnJheShzdHIpKTtcclxufVxyXG5mdW5jdGlvbiBoZXhTdHJpbmdUb1UyNTYoc3RyKSB7XHJcbiAgcmV0dXJuIHVpbnQ4QXJyYXlUb1UyNTYoaGV4U3RyaW5nVG9VaW50OEFycmF5KHN0cikpO1xyXG59XHJcbmZ1bmN0aW9uIHUxMjhUb1VpbnQ4QXJyYXkoZGF0YSkge1xyXG4gIGNvbnN0IHdyaXRlciA9IG5ldyBCaW5hcnlXcml0ZXIoMTYpO1xyXG4gIHdyaXRlci53cml0ZVUxMjgoZGF0YSk7XHJcbiAgcmV0dXJuIHdyaXRlci5nZXRCdWZmZXIoKTtcclxufVxyXG5mdW5jdGlvbiB1MTI4VG9IZXhTdHJpbmcoZGF0YSkge1xyXG4gIHJldHVybiB1aW50OEFycmF5VG9IZXhTdHJpbmcodTEyOFRvVWludDhBcnJheShkYXRhKSk7XHJcbn1cclxuZnVuY3Rpb24gdTI1NlRvVWludDhBcnJheShkYXRhKSB7XHJcbiAgY29uc3Qgd3JpdGVyID0gbmV3IEJpbmFyeVdyaXRlcigzMik7XHJcbiAgd3JpdGVyLndyaXRlVTI1NihkYXRhKTtcclxuICByZXR1cm4gd3JpdGVyLmdldEJ1ZmZlcigpO1xyXG59XHJcbmZ1bmN0aW9uIHUyNTZUb0hleFN0cmluZyhkYXRhKSB7XHJcbiAgcmV0dXJuIHVpbnQ4QXJyYXlUb0hleFN0cmluZyh1MjU2VG9VaW50OEFycmF5KGRhdGEpKTtcclxufVxyXG5mdW5jdGlvbiB0b1Bhc2NhbENhc2Uocykge1xyXG4gIGNvbnN0IHN0ciA9IHRvQ2FtZWxDYXNlKHMpO1xyXG4gIHJldHVybiBzdHIuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHIuc2xpY2UoMSk7XHJcbn1cclxuZnVuY3Rpb24gdG9DYW1lbENhc2Uocykge1xyXG4gIGNvbnN0IHN0ciA9IHMucmVwbGFjZSgvWy1fXSsvZywgXCJfXCIpLnJlcGxhY2UoL18oW2EtekEtWjAtOV0pL2csIChfLCBjKSA9PiBjLnRvVXBwZXJDYXNlKCkpO1xyXG4gIHJldHVybiBzdHIuY2hhckF0KDApLnRvTG93ZXJDYXNlKCkgKyBzdHIuc2xpY2UoMSk7XHJcbn1cclxuZnVuY3Rpb24gYnNhdG5CYXNlU2l6ZSh0eXBlc3BhY2UsIHR5KSB7XHJcbiAgY29uc3QgYXNzdW1lZEFycmF5TGVuZ3RoID0gNDtcclxuICB3aGlsZSAodHkudGFnID09PSBcIlJlZlwiKSB0eSA9IHR5cGVzcGFjZS50eXBlc1t0eS52YWx1ZV07XHJcbiAgaWYgKHR5LnRhZyA9PT0gXCJQcm9kdWN0XCIpIHtcclxuICAgIGxldCBzdW0gPSAwO1xyXG4gICAgZm9yIChjb25zdCB7IGFsZ2VicmFpY1R5cGU6IGVsZW0gfSBvZiB0eS52YWx1ZS5lbGVtZW50cykge1xyXG4gICAgICBzdW0gKz0gYnNhdG5CYXNlU2l6ZSh0eXBlc3BhY2UsIGVsZW0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHN1bTtcclxuICB9IGVsc2UgaWYgKHR5LnRhZyA9PT0gXCJTdW1cIikge1xyXG4gICAgbGV0IG1pbiA9IEluZmluaXR5O1xyXG4gICAgZm9yIChjb25zdCB7IGFsZ2VicmFpY1R5cGU6IHZhcmkgfSBvZiB0eS52YWx1ZS52YXJpYW50cykge1xyXG4gICAgICBjb25zdCB2U2l6ZSA9IGJzYXRuQmFzZVNpemUodHlwZXNwYWNlLCB2YXJpKTtcclxuICAgICAgaWYgKHZTaXplIDwgbWluKSBtaW4gPSB2U2l6ZTtcclxuICAgIH1cclxuICAgIGlmIChtaW4gPT09IEluZmluaXR5KSBtaW4gPSAwO1xyXG4gICAgcmV0dXJuIDQgKyBtaW47XHJcbiAgfSBlbHNlIGlmICh0eS50YWcgPT0gXCJBcnJheVwiKSB7XHJcbiAgICByZXR1cm4gNCArIGFzc3VtZWRBcnJheUxlbmd0aCAqIGJzYXRuQmFzZVNpemUodHlwZXNwYWNlLCB0eS52YWx1ZSk7XHJcbiAgfVxyXG4gIHJldHVybiB7XHJcbiAgICBTdHJpbmc6IDQgKyBhc3N1bWVkQXJyYXlMZW5ndGgsXHJcbiAgICBTdW06IDEsXHJcbiAgICBCb29sOiAxLFxyXG4gICAgSTg6IDEsXHJcbiAgICBVODogMSxcclxuICAgIEkxNjogMixcclxuICAgIFUxNjogMixcclxuICAgIEkzMjogNCxcclxuICAgIFUzMjogNCxcclxuICAgIEYzMjogNCxcclxuICAgIEk2NDogOCxcclxuICAgIFU2NDogOCxcclxuICAgIEY2NDogOCxcclxuICAgIEkxMjg6IDE2LFxyXG4gICAgVTEyODogMTYsXHJcbiAgICBJMjU2OiAzMixcclxuICAgIFUyNTY6IDMyXHJcbiAgfVt0eS50YWddO1xyXG59XHJcbnZhciBoYXNPd24gPSBPYmplY3QuaGFzT3duO1xyXG5cclxuLy8gc3JjL2xpYi9jb25uZWN0aW9uX2lkLnRzXHJcbnZhciBDb25uZWN0aW9uSWQgPSBjbGFzcyBfQ29ubmVjdGlvbklkIHtcclxuICBfX2Nvbm5lY3Rpb25faWRfXztcclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IGBDb25uZWN0aW9uSWRgLlxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKGRhdGEpIHtcclxuICAgIHRoaXMuX19jb25uZWN0aW9uX2lkX18gPSBkYXRhO1xyXG4gIH1cclxuICAvKipcclxuICAgKiBHZXQgdGhlIGFsZ2VicmFpYyB0eXBlIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB7QGxpbmsgQ29ubmVjdGlvbklkfSB0eXBlLlxyXG4gICAqIEByZXR1cm5zIFRoZSBhbGdlYnJhaWMgdHlwZSByZXByZXNlbnRhdGlvbiBvZiB0aGUgdHlwZS5cclxuICAgKi9cclxuICBzdGF0aWMgZ2V0QWxnZWJyYWljVHlwZSgpIHtcclxuICAgIHJldHVybiBBbGdlYnJhaWNUeXBlLlByb2R1Y3Qoe1xyXG4gICAgICBlbGVtZW50czogW1xyXG4gICAgICAgIHsgbmFtZTogXCJfX2Nvbm5lY3Rpb25faWRfX1wiLCBhbGdlYnJhaWNUeXBlOiBBbGdlYnJhaWNUeXBlLlUxMjggfVxyXG4gICAgICBdXHJcbiAgICB9KTtcclxuICB9XHJcbiAgaXNaZXJvKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX19jb25uZWN0aW9uX2lkX18gPT09IEJpZ0ludCgwKTtcclxuICB9XHJcbiAgc3RhdGljIG51bGxJZlplcm8oYWRkcikge1xyXG4gICAgaWYgKGFkZHIuaXNaZXJvKCkpIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gYWRkcjtcclxuICAgIH1cclxuICB9XHJcbiAgc3RhdGljIHJhbmRvbSgpIHtcclxuICAgIGZ1bmN0aW9uIHJhbmRvbVU4KCkge1xyXG4gICAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjU1KTtcclxuICAgIH1cclxuICAgIGxldCByZXN1bHQgPSBCaWdJbnQoMCk7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDE2OyBpKyspIHtcclxuICAgICAgcmVzdWx0ID0gcmVzdWx0IDw8IEJpZ0ludCg4KSB8IEJpZ0ludChyYW5kb21VOCgpKTtcclxuICAgIH1cclxuICAgIHJldHVybiBuZXcgX0Nvbm5lY3Rpb25JZChyZXN1bHQpO1xyXG4gIH1cclxuICAvKipcclxuICAgKiBDb21wYXJlIHR3byBjb25uZWN0aW9uIElEcyBmb3IgZXF1YWxpdHkuXHJcbiAgICovXHJcbiAgaXNFcXVhbChvdGhlcikge1xyXG4gICAgcmV0dXJuIHRoaXMuX19jb25uZWN0aW9uX2lkX18gPT0gb3RoZXIuX19jb25uZWN0aW9uX2lkX187XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIENoZWNrIGlmIHR3byBjb25uZWN0aW9uIElEcyBhcmUgZXF1YWwuXHJcbiAgICovXHJcbiAgZXF1YWxzKG90aGVyKSB7XHJcbiAgICByZXR1cm4gdGhpcy5pc0VxdWFsKG90aGVyKTtcclxuICB9XHJcbiAgLyoqXHJcbiAgICogUHJpbnQgdGhlIGNvbm5lY3Rpb24gSUQgYXMgYSBoZXhhZGVjaW1hbCBzdHJpbmcuXHJcbiAgICovXHJcbiAgdG9IZXhTdHJpbmcoKSB7XHJcbiAgICByZXR1cm4gdTEyOFRvSGV4U3RyaW5nKHRoaXMuX19jb25uZWN0aW9uX2lkX18pO1xyXG4gIH1cclxuICAvKipcclxuICAgKiBDb252ZXJ0IHRoZSBjb25uZWN0aW9uIElEIHRvIGEgVWludDhBcnJheS5cclxuICAgKi9cclxuICB0b1VpbnQ4QXJyYXkoKSB7XHJcbiAgICByZXR1cm4gdTEyOFRvVWludDhBcnJheSh0aGlzLl9fY29ubmVjdGlvbl9pZF9fKTtcclxuICB9XHJcbiAgLyoqXHJcbiAgICogUGFyc2UgYSBjb25uZWN0aW9uIElEIGZyb20gYSBoZXhhZGVjaW1hbCBzdHJpbmcuXHJcbiAgICovXHJcbiAgc3RhdGljIGZyb21TdHJpbmcoc3RyKSB7XHJcbiAgICByZXR1cm4gbmV3IF9Db25uZWN0aW9uSWQoaGV4U3RyaW5nVG9VMTI4KHN0cikpO1xyXG4gIH1cclxuICBzdGF0aWMgZnJvbVN0cmluZ09yTnVsbChzdHIpIHtcclxuICAgIGNvbnN0IGFkZHIgPSBfQ29ubmVjdGlvbklkLmZyb21TdHJpbmcoc3RyKTtcclxuICAgIGlmIChhZGRyLmlzWmVybygpKSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIGFkZHI7XHJcbiAgICB9XHJcbiAgfVxyXG59O1xyXG5cclxuLy8gc3JjL2xpYi9pZGVudGl0eS50c1xyXG52YXIgSWRlbnRpdHkgPSBjbGFzcyBfSWRlbnRpdHkge1xyXG4gIF9faWRlbnRpdHlfXztcclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IGBJZGVudGl0eWAuXHJcbiAgICpcclxuICAgKiBgZGF0YWAgY2FuIGJlIGEgaGV4YWRlY2ltYWwgc3RyaW5nIG9yIGEgYGJpZ2ludGAuXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoZGF0YSkge1xyXG4gICAgdGhpcy5fX2lkZW50aXR5X18gPSB0eXBlb2YgZGF0YSA9PT0gXCJzdHJpbmdcIiA/IGhleFN0cmluZ1RvVTI1NihkYXRhKSA6IGRhdGE7XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgYWxnZWJyYWljIHR5cGUgcmVwcmVzZW50YXRpb24gb2YgdGhlIHtAbGluayBJZGVudGl0eX0gdHlwZS5cclxuICAgKiBAcmV0dXJucyBUaGUgYWxnZWJyYWljIHR5cGUgcmVwcmVzZW50YXRpb24gb2YgdGhlIHR5cGUuXHJcbiAgICovXHJcbiAgc3RhdGljIGdldEFsZ2VicmFpY1R5cGUoKSB7XHJcbiAgICByZXR1cm4gQWxnZWJyYWljVHlwZS5Qcm9kdWN0KHtcclxuICAgICAgZWxlbWVudHM6IFt7IG5hbWU6IFwiX19pZGVudGl0eV9fXCIsIGFsZ2VicmFpY1R5cGU6IEFsZ2VicmFpY1R5cGUuVTI1NiB9XVxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIENoZWNrIGlmIHR3byBpZGVudGl0aWVzIGFyZSBlcXVhbC5cclxuICAgKi9cclxuICBpc0VxdWFsKG90aGVyKSB7XHJcbiAgICByZXR1cm4gdGhpcy50b0hleFN0cmluZygpID09PSBvdGhlci50b0hleFN0cmluZygpO1xyXG4gIH1cclxuICAvKipcclxuICAgKiBDaGVjayBpZiB0d28gaWRlbnRpdGllcyBhcmUgZXF1YWwuXHJcbiAgICovXHJcbiAgZXF1YWxzKG90aGVyKSB7XHJcbiAgICByZXR1cm4gdGhpcy5pc0VxdWFsKG90aGVyKTtcclxuICB9XHJcbiAgLyoqXHJcbiAgICogUHJpbnQgdGhlIGlkZW50aXR5IGFzIGEgaGV4YWRlY2ltYWwgc3RyaW5nLlxyXG4gICAqL1xyXG4gIHRvSGV4U3RyaW5nKCkge1xyXG4gICAgcmV0dXJuIHUyNTZUb0hleFN0cmluZyh0aGlzLl9faWRlbnRpdHlfXyk7XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIENvbnZlcnQgdGhlIGFkZHJlc3MgdG8gYSBVaW50OEFycmF5LlxyXG4gICAqL1xyXG4gIHRvVWludDhBcnJheSgpIHtcclxuICAgIHJldHVybiB1MjU2VG9VaW50OEFycmF5KHRoaXMuX19pZGVudGl0eV9fKTtcclxuICB9XHJcbiAgLyoqXHJcbiAgICogUGFyc2UgYW4gSWRlbnRpdHkgZnJvbSBhIGhleGFkZWNpbWFsIHN0cmluZy5cclxuICAgKi9cclxuICBzdGF0aWMgZnJvbVN0cmluZyhzdHIpIHtcclxuICAgIHJldHVybiBuZXcgX0lkZW50aXR5KHN0cik7XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIFplcm8gaWRlbnRpdHkgKDB4MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMClcclxuICAgKi9cclxuICBzdGF0aWMgemVybygpIHtcclxuICAgIHJldHVybiBuZXcgX0lkZW50aXR5KDBuKTtcclxuICB9XHJcbiAgdG9TdHJpbmcoKSB7XHJcbiAgICByZXR1cm4gdGhpcy50b0hleFN0cmluZygpO1xyXG4gIH1cclxufTtcclxuXHJcbi8vIHNyYy9saWIvYWxnZWJyYWljX3R5cGUudHNcclxudmFyIFNFUklBTElaRVJTID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcclxudmFyIERFU0VSSUFMSVpFUlMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xyXG52YXIgQWxnZWJyYWljVHlwZSA9IHtcclxuICBSZWY6ICh2YWx1ZSkgPT4gKHsgdGFnOiBcIlJlZlwiLCB2YWx1ZSB9KSxcclxuICBTdW06ICh2YWx1ZSkgPT4gKHtcclxuICAgIHRhZzogXCJTdW1cIixcclxuICAgIHZhbHVlXHJcbiAgfSksXHJcbiAgUHJvZHVjdDogKHZhbHVlKSA9PiAoe1xyXG4gICAgdGFnOiBcIlByb2R1Y3RcIixcclxuICAgIHZhbHVlXHJcbiAgfSksXHJcbiAgQXJyYXk6ICh2YWx1ZSkgPT4gKHtcclxuICAgIHRhZzogXCJBcnJheVwiLFxyXG4gICAgdmFsdWVcclxuICB9KSxcclxuICBTdHJpbmc6IHsgdGFnOiBcIlN0cmluZ1wiIH0sXHJcbiAgQm9vbDogeyB0YWc6IFwiQm9vbFwiIH0sXHJcbiAgSTg6IHsgdGFnOiBcIkk4XCIgfSxcclxuICBVODogeyB0YWc6IFwiVThcIiB9LFxyXG4gIEkxNjogeyB0YWc6IFwiSTE2XCIgfSxcclxuICBVMTY6IHsgdGFnOiBcIlUxNlwiIH0sXHJcbiAgSTMyOiB7IHRhZzogXCJJMzJcIiB9LFxyXG4gIFUzMjogeyB0YWc6IFwiVTMyXCIgfSxcclxuICBJNjQ6IHsgdGFnOiBcIkk2NFwiIH0sXHJcbiAgVTY0OiB7IHRhZzogXCJVNjRcIiB9LFxyXG4gIEkxMjg6IHsgdGFnOiBcIkkxMjhcIiB9LFxyXG4gIFUxMjg6IHsgdGFnOiBcIlUxMjhcIiB9LFxyXG4gIEkyNTY6IHsgdGFnOiBcIkkyNTZcIiB9LFxyXG4gIFUyNTY6IHsgdGFnOiBcIlUyNTZcIiB9LFxyXG4gIEYzMjogeyB0YWc6IFwiRjMyXCIgfSxcclxuICBGNjQ6IHsgdGFnOiBcIkY2NFwiIH0sXHJcbiAgbWFrZVNlcmlhbGl6ZXIodHksIHR5cGVzcGFjZSkge1xyXG4gICAgaWYgKHR5LnRhZyA9PT0gXCJSZWZcIikge1xyXG4gICAgICBpZiAoIXR5cGVzcGFjZSlcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJjYW5ub3Qgc2VyaWFsaXplIHJlZnMgd2l0aG91dCBhIHR5cGVzcGFjZVwiKTtcclxuICAgICAgd2hpbGUgKHR5LnRhZyA9PT0gXCJSZWZcIikgdHkgPSB0eXBlc3BhY2UudHlwZXNbdHkudmFsdWVdO1xyXG4gICAgfVxyXG4gICAgc3dpdGNoICh0eS50YWcpIHtcclxuICAgICAgY2FzZSBcIlByb2R1Y3RcIjpcclxuICAgICAgICByZXR1cm4gUHJvZHVjdFR5cGUubWFrZVNlcmlhbGl6ZXIodHkudmFsdWUsIHR5cGVzcGFjZSk7XHJcbiAgICAgIGNhc2UgXCJTdW1cIjpcclxuICAgICAgICByZXR1cm4gU3VtVHlwZS5tYWtlU2VyaWFsaXplcih0eS52YWx1ZSwgdHlwZXNwYWNlKTtcclxuICAgICAgY2FzZSBcIkFycmF5XCI6XHJcbiAgICAgICAgaWYgKHR5LnZhbHVlLnRhZyA9PT0gXCJVOFwiKSB7XHJcbiAgICAgICAgICByZXR1cm4gc2VyaWFsaXplVWludDhBcnJheTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgY29uc3Qgc2VyaWFsaXplID0gQWxnZWJyYWljVHlwZS5tYWtlU2VyaWFsaXplcih0eS52YWx1ZSwgdHlwZXNwYWNlKTtcclxuICAgICAgICAgIHJldHVybiAod3JpdGVyLCB2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICB3cml0ZXIud3JpdGVVMzIodmFsdWUubGVuZ3RoKTtcclxuICAgICAgICAgICAgZm9yIChjb25zdCBlbGVtIG9mIHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgc2VyaWFsaXplKHdyaXRlciwgZWxlbSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIHJldHVybiBwcmltaXRpdmVTZXJpYWxpemVyc1t0eS50YWddO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgLyoqIEBkZXByZWNhdGVkIFVzZSBgbWFrZVNlcmlhbGl6ZXJgIGluc3RlYWQuICovXHJcbiAgc2VyaWFsaXplVmFsdWUod3JpdGVyLCB0eSwgdmFsdWUsIHR5cGVzcGFjZSkge1xyXG4gICAgQWxnZWJyYWljVHlwZS5tYWtlU2VyaWFsaXplcih0eSwgdHlwZXNwYWNlKSh3cml0ZXIsIHZhbHVlKTtcclxuICB9LFxyXG4gIG1ha2VEZXNlcmlhbGl6ZXIodHksIHR5cGVzcGFjZSkge1xyXG4gICAgaWYgKHR5LnRhZyA9PT0gXCJSZWZcIikge1xyXG4gICAgICBpZiAoIXR5cGVzcGFjZSlcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJjYW5ub3QgZGVzZXJpYWxpemUgcmVmcyB3aXRob3V0IGEgdHlwZXNwYWNlXCIpO1xyXG4gICAgICB3aGlsZSAodHkudGFnID09PSBcIlJlZlwiKSB0eSA9IHR5cGVzcGFjZS50eXBlc1t0eS52YWx1ZV07XHJcbiAgICB9XHJcbiAgICBzd2l0Y2ggKHR5LnRhZykge1xyXG4gICAgICBjYXNlIFwiUHJvZHVjdFwiOlxyXG4gICAgICAgIHJldHVybiBQcm9kdWN0VHlwZS5tYWtlRGVzZXJpYWxpemVyKHR5LnZhbHVlLCB0eXBlc3BhY2UpO1xyXG4gICAgICBjYXNlIFwiU3VtXCI6XHJcbiAgICAgICAgcmV0dXJuIFN1bVR5cGUubWFrZURlc2VyaWFsaXplcih0eS52YWx1ZSwgdHlwZXNwYWNlKTtcclxuICAgICAgY2FzZSBcIkFycmF5XCI6XHJcbiAgICAgICAgaWYgKHR5LnZhbHVlLnRhZyA9PT0gXCJVOFwiKSB7XHJcbiAgICAgICAgICByZXR1cm4gZGVzZXJpYWxpemVVaW50OEFycmF5O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBjb25zdCBkZXNlcmlhbGl6ZSA9IEFsZ2VicmFpY1R5cGUubWFrZURlc2VyaWFsaXplcihcclxuICAgICAgICAgICAgdHkudmFsdWUsXHJcbiAgICAgICAgICAgIHR5cGVzcGFjZVxyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIHJldHVybiAocmVhZGVyKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGxlbmd0aCA9IHJlYWRlci5yZWFkVTMyKCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IEFycmF5KGxlbmd0aCk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICByZXN1bHRbaV0gPSBkZXNlcmlhbGl6ZShyZWFkZXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICByZXR1cm4gcHJpbWl0aXZlRGVzZXJpYWxpemVyc1t0eS50YWddO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgLyoqIEBkZXByZWNhdGVkIFVzZSBgbWFrZURlc2VyaWFsaXplcmAgaW5zdGVhZC4gKi9cclxuICBkZXNlcmlhbGl6ZVZhbHVlKHJlYWRlciwgdHksIHR5cGVzcGFjZSkge1xyXG4gICAgcmV0dXJuIEFsZ2VicmFpY1R5cGUubWFrZURlc2VyaWFsaXplcih0eSwgdHlwZXNwYWNlKShyZWFkZXIpO1xyXG4gIH0sXHJcbiAgLyoqXHJcbiAgICogQ29udmVydCBhIHZhbHVlIG9mIHRoZSBhbGdlYnJhaWMgdHlwZSBpbnRvIHNvbWV0aGluZyB0aGF0IGNhbiBiZSB1c2VkIGFzIGEga2V5IGluIGEgbWFwLlxyXG4gICAqIFRoZXJlIGFyZSBubyBndWFyYW50ZWVzIGFib3V0IGJlaW5nIGFibGUgdG8gb3JkZXIgaXQuXHJcbiAgICogVGhpcyBpcyBvbmx5IGd1YXJhbnRlZWQgdG8gYmUgY29tcGFyYWJsZSB0byBvdGhlciB2YWx1ZXMgb2YgdGhlIHNhbWUgdHlwZS5cclxuICAgKiBAcGFyYW0gdmFsdWUgQSB2YWx1ZSBvZiB0aGUgYWxnZWJyYWljIHR5cGVcclxuICAgKiBAcmV0dXJucyBTb21ldGhpbmcgdGhhdCBjYW4gYmUgdXNlZCBhcyBhIGtleSBpbiBhIG1hcC5cclxuICAgKi9cclxuICBpbnRvTWFwS2V5OiBmdW5jdGlvbih0eSwgdmFsdWUpIHtcclxuICAgIHN3aXRjaCAodHkudGFnKSB7XHJcbiAgICAgIGNhc2UgXCJVOFwiOlxyXG4gICAgICBjYXNlIFwiVTE2XCI6XHJcbiAgICAgIGNhc2UgXCJVMzJcIjpcclxuICAgICAgY2FzZSBcIlU2NFwiOlxyXG4gICAgICBjYXNlIFwiVTEyOFwiOlxyXG4gICAgICBjYXNlIFwiVTI1NlwiOlxyXG4gICAgICBjYXNlIFwiSThcIjpcclxuICAgICAgY2FzZSBcIkkxNlwiOlxyXG4gICAgICBjYXNlIFwiSTMyXCI6XHJcbiAgICAgIGNhc2UgXCJJNjRcIjpcclxuICAgICAgY2FzZSBcIkkxMjhcIjpcclxuICAgICAgY2FzZSBcIkkyNTZcIjpcclxuICAgICAgY2FzZSBcIkYzMlwiOlxyXG4gICAgICBjYXNlIFwiRjY0XCI6XHJcbiAgICAgIGNhc2UgXCJTdHJpbmdcIjpcclxuICAgICAgY2FzZSBcIkJvb2xcIjpcclxuICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICAgIGNhc2UgXCJQcm9kdWN0XCI6XHJcbiAgICAgICAgcmV0dXJuIFByb2R1Y3RUeXBlLmludG9NYXBLZXkodHkudmFsdWUsIHZhbHVlKTtcclxuICAgICAgZGVmYXVsdDoge1xyXG4gICAgICAgIGNvbnN0IHdyaXRlciA9IG5ldyBCaW5hcnlXcml0ZXIoMTApO1xyXG4gICAgICAgIEFsZ2VicmFpY1R5cGUuc2VyaWFsaXplVmFsdWUod3JpdGVyLCB0eSwgdmFsdWUpO1xyXG4gICAgICAgIHJldHVybiB3cml0ZXIudG9CYXNlNjQoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufTtcclxuZnVuY3Rpb24gYmluZENhbGwoZikge1xyXG4gIHJldHVybiBGdW5jdGlvbi5wcm90b3R5cGUuY2FsbC5iaW5kKGYpO1xyXG59XHJcbnZhciBwcmltaXRpdmVTZXJpYWxpemVycyA9IHtcclxuICBCb29sOiBiaW5kQ2FsbChCaW5hcnlXcml0ZXIucHJvdG90eXBlLndyaXRlQm9vbCksXHJcbiAgSTg6IGJpbmRDYWxsKEJpbmFyeVdyaXRlci5wcm90b3R5cGUud3JpdGVJOCksXHJcbiAgVTg6IGJpbmRDYWxsKEJpbmFyeVdyaXRlci5wcm90b3R5cGUud3JpdGVVOCksXHJcbiAgSTE2OiBiaW5kQ2FsbChCaW5hcnlXcml0ZXIucHJvdG90eXBlLndyaXRlSTE2KSxcclxuICBVMTY6IGJpbmRDYWxsKEJpbmFyeVdyaXRlci5wcm90b3R5cGUud3JpdGVVMTYpLFxyXG4gIEkzMjogYmluZENhbGwoQmluYXJ5V3JpdGVyLnByb3RvdHlwZS53cml0ZUkzMiksXHJcbiAgVTMyOiBiaW5kQ2FsbChCaW5hcnlXcml0ZXIucHJvdG90eXBlLndyaXRlVTMyKSxcclxuICBJNjQ6IGJpbmRDYWxsKEJpbmFyeVdyaXRlci5wcm90b3R5cGUud3JpdGVJNjQpLFxyXG4gIFU2NDogYmluZENhbGwoQmluYXJ5V3JpdGVyLnByb3RvdHlwZS53cml0ZVU2NCksXHJcbiAgSTEyODogYmluZENhbGwoQmluYXJ5V3JpdGVyLnByb3RvdHlwZS53cml0ZUkxMjgpLFxyXG4gIFUxMjg6IGJpbmRDYWxsKEJpbmFyeVdyaXRlci5wcm90b3R5cGUud3JpdGVVMTI4KSxcclxuICBJMjU2OiBiaW5kQ2FsbChCaW5hcnlXcml0ZXIucHJvdG90eXBlLndyaXRlSTI1NiksXHJcbiAgVTI1NjogYmluZENhbGwoQmluYXJ5V3JpdGVyLnByb3RvdHlwZS53cml0ZVUyNTYpLFxyXG4gIEYzMjogYmluZENhbGwoQmluYXJ5V3JpdGVyLnByb3RvdHlwZS53cml0ZUYzMiksXHJcbiAgRjY0OiBiaW5kQ2FsbChCaW5hcnlXcml0ZXIucHJvdG90eXBlLndyaXRlRjY0KSxcclxuICBTdHJpbmc6IGJpbmRDYWxsKEJpbmFyeVdyaXRlci5wcm90b3R5cGUud3JpdGVTdHJpbmcpXHJcbn07XHJcbk9iamVjdC5mcmVlemUocHJpbWl0aXZlU2VyaWFsaXplcnMpO1xyXG52YXIgc2VyaWFsaXplVWludDhBcnJheSA9IGJpbmRDYWxsKEJpbmFyeVdyaXRlci5wcm90b3R5cGUud3JpdGVVSW50OEFycmF5KTtcclxudmFyIHByaW1pdGl2ZURlc2VyaWFsaXplcnMgPSB7XHJcbiAgQm9vbDogYmluZENhbGwoQmluYXJ5UmVhZGVyLnByb3RvdHlwZS5yZWFkQm9vbCksXHJcbiAgSTg6IGJpbmRDYWxsKEJpbmFyeVJlYWRlci5wcm90b3R5cGUucmVhZEk4KSxcclxuICBVODogYmluZENhbGwoQmluYXJ5UmVhZGVyLnByb3RvdHlwZS5yZWFkVTgpLFxyXG4gIEkxNjogYmluZENhbGwoQmluYXJ5UmVhZGVyLnByb3RvdHlwZS5yZWFkSTE2KSxcclxuICBVMTY6IGJpbmRDYWxsKEJpbmFyeVJlYWRlci5wcm90b3R5cGUucmVhZFUxNiksXHJcbiAgSTMyOiBiaW5kQ2FsbChCaW5hcnlSZWFkZXIucHJvdG90eXBlLnJlYWRJMzIpLFxyXG4gIFUzMjogYmluZENhbGwoQmluYXJ5UmVhZGVyLnByb3RvdHlwZS5yZWFkVTMyKSxcclxuICBJNjQ6IGJpbmRDYWxsKEJpbmFyeVJlYWRlci5wcm90b3R5cGUucmVhZEk2NCksXHJcbiAgVTY0OiBiaW5kQ2FsbChCaW5hcnlSZWFkZXIucHJvdG90eXBlLnJlYWRVNjQpLFxyXG4gIEkxMjg6IGJpbmRDYWxsKEJpbmFyeVJlYWRlci5wcm90b3R5cGUucmVhZEkxMjgpLFxyXG4gIFUxMjg6IGJpbmRDYWxsKEJpbmFyeVJlYWRlci5wcm90b3R5cGUucmVhZFUxMjgpLFxyXG4gIEkyNTY6IGJpbmRDYWxsKEJpbmFyeVJlYWRlci5wcm90b3R5cGUucmVhZEkyNTYpLFxyXG4gIFUyNTY6IGJpbmRDYWxsKEJpbmFyeVJlYWRlci5wcm90b3R5cGUucmVhZFUyNTYpLFxyXG4gIEYzMjogYmluZENhbGwoQmluYXJ5UmVhZGVyLnByb3RvdHlwZS5yZWFkRjMyKSxcclxuICBGNjQ6IGJpbmRDYWxsKEJpbmFyeVJlYWRlci5wcm90b3R5cGUucmVhZEY2NCksXHJcbiAgU3RyaW5nOiBiaW5kQ2FsbChCaW5hcnlSZWFkZXIucHJvdG90eXBlLnJlYWRTdHJpbmcpXHJcbn07XHJcbk9iamVjdC5mcmVlemUocHJpbWl0aXZlRGVzZXJpYWxpemVycyk7XHJcbnZhciBkZXNlcmlhbGl6ZVVpbnQ4QXJyYXkgPSBiaW5kQ2FsbChCaW5hcnlSZWFkZXIucHJvdG90eXBlLnJlYWRVSW50OEFycmF5KTtcclxudmFyIHByaW1pdGl2ZVNpemVzID0ge1xyXG4gIEJvb2w6IDEsXHJcbiAgSTg6IDEsXHJcbiAgVTg6IDEsXHJcbiAgSTE2OiAyLFxyXG4gIFUxNjogMixcclxuICBJMzI6IDQsXHJcbiAgVTMyOiA0LFxyXG4gIEk2NDogOCxcclxuICBVNjQ6IDgsXHJcbiAgSTEyODogMTYsXHJcbiAgVTEyODogMTYsXHJcbiAgSTI1NjogMzIsXHJcbiAgVTI1NjogMzIsXHJcbiAgRjMyOiA0LFxyXG4gIEY2NDogOFxyXG59O1xyXG52YXIgZml4ZWRTaXplUHJpbWl0aXZlcyA9IG5ldyBTZXQoT2JqZWN0LmtleXMocHJpbWl0aXZlU2l6ZXMpKTtcclxudmFyIGlzRml4ZWRTaXplUHJvZHVjdCA9ICh0eSkgPT4gdHkuZWxlbWVudHMuZXZlcnkoXHJcbiAgKHsgYWxnZWJyYWljVHlwZSB9KSA9PiBmaXhlZFNpemVQcmltaXRpdmVzLmhhcyhhbGdlYnJhaWNUeXBlLnRhZylcclxuKTtcclxudmFyIHByb2R1Y3RTaXplID0gKHR5KSA9PiB0eS5lbGVtZW50cy5yZWR1Y2UoXHJcbiAgKGFjYywgeyBhbGdlYnJhaWNUeXBlIH0pID0+IGFjYyArIHByaW1pdGl2ZVNpemVzW2FsZ2VicmFpY1R5cGUudGFnXSxcclxuICAwXHJcbik7XHJcbnZhciBwcmltaXRpdmVKU05hbWUgPSB7XHJcbiAgQm9vbDogXCJVaW50OFwiLFxyXG4gIEk4OiBcIkludDhcIixcclxuICBVODogXCJVaW50OFwiLFxyXG4gIEkxNjogXCJJbnQxNlwiLFxyXG4gIFUxNjogXCJVaW50MTZcIixcclxuICBJMzI6IFwiSW50MzJcIixcclxuICBVMzI6IFwiVWludDMyXCIsXHJcbiAgSTY0OiBcIkJpZ0ludDY0XCIsXHJcbiAgVTY0OiBcIkJpZ1VpbnQ2NFwiLFxyXG4gIEYzMjogXCJGbG9hdDMyXCIsXHJcbiAgRjY0OiBcIkZsb2F0NjRcIlxyXG59O1xyXG52YXIgc3BlY2lhbFByb2R1Y3REZXNlcmlhbGl6ZXJzID0ge1xyXG4gIF9fdGltZV9kdXJhdGlvbl9taWNyb3NfXzogKHJlYWRlcikgPT4gbmV3IFRpbWVEdXJhdGlvbihyZWFkZXIucmVhZEk2NCgpKSxcclxuICBfX3RpbWVzdGFtcF9taWNyb3Nfc2luY2VfdW5peF9lcG9jaF9fOiAocmVhZGVyKSA9PiBuZXcgVGltZXN0YW1wKHJlYWRlci5yZWFkSTY0KCkpLFxyXG4gIF9faWRlbnRpdHlfXzogKHJlYWRlcikgPT4gbmV3IElkZW50aXR5KHJlYWRlci5yZWFkVTI1NigpKSxcclxuICBfX2Nvbm5lY3Rpb25faWRfXzogKHJlYWRlcikgPT4gbmV3IENvbm5lY3Rpb25JZChyZWFkZXIucmVhZFUxMjgoKSksXHJcbiAgX191dWlkX186IChyZWFkZXIpID0+IG5ldyBVdWlkKHJlYWRlci5yZWFkVTEyOCgpKVxyXG59O1xyXG5PYmplY3QuZnJlZXplKHNwZWNpYWxQcm9kdWN0RGVzZXJpYWxpemVycyk7XHJcbnZhciB1bml0RGVzZXJpYWxpemVyID0gKCkgPT4gKHt9KTtcclxudmFyIGdldEVsZW1lbnRJbml0aWFsaXplciA9IChlbGVtZW50KSA9PiB7XHJcbiAgbGV0IGluaXQ7XHJcbiAgc3dpdGNoIChlbGVtZW50LmFsZ2VicmFpY1R5cGUudGFnKSB7XHJcbiAgICBjYXNlIFwiU3RyaW5nXCI6XHJcbiAgICAgIGluaXQgPSBcIicnXCI7XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgY2FzZSBcIkJvb2xcIjpcclxuICAgICAgaW5pdCA9IFwiZmFsc2VcIjtcclxuICAgICAgYnJlYWs7XHJcbiAgICBjYXNlIFwiSThcIjpcclxuICAgIGNhc2UgXCJVOFwiOlxyXG4gICAgY2FzZSBcIkkxNlwiOlxyXG4gICAgY2FzZSBcIlUxNlwiOlxyXG4gICAgY2FzZSBcIkkzMlwiOlxyXG4gICAgY2FzZSBcIlUzMlwiOlxyXG4gICAgICBpbml0ID0gXCIwXCI7XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgY2FzZSBcIkk2NFwiOlxyXG4gICAgY2FzZSBcIlU2NFwiOlxyXG4gICAgY2FzZSBcIkkxMjhcIjpcclxuICAgIGNhc2UgXCJVMTI4XCI6XHJcbiAgICBjYXNlIFwiSTI1NlwiOlxyXG4gICAgY2FzZSBcIlUyNTZcIjpcclxuICAgICAgaW5pdCA9IFwiMG5cIjtcclxuICAgICAgYnJlYWs7XHJcbiAgICBjYXNlIFwiRjMyXCI6XHJcbiAgICBjYXNlIFwiRjY0XCI6XHJcbiAgICAgIGluaXQgPSBcIjAuMFwiO1xyXG4gICAgICBicmVhaztcclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIGluaXQgPSBcInVuZGVmaW5lZFwiO1xyXG4gIH1cclxuICByZXR1cm4gYCR7ZWxlbWVudC5uYW1lfTogJHtpbml0fWA7XHJcbn07XHJcbnZhciBQcm9kdWN0VHlwZSA9IHtcclxuICBtYWtlU2VyaWFsaXplcih0eSwgdHlwZXNwYWNlKSB7XHJcbiAgICBsZXQgc2VyaWFsaXplciA9IFNFUklBTElaRVJTLmdldCh0eSk7XHJcbiAgICBpZiAoc2VyaWFsaXplciAhPSBudWxsKSByZXR1cm4gc2VyaWFsaXplcjtcclxuICAgIGlmIChpc0ZpeGVkU2l6ZVByb2R1Y3QodHkpKSB7XHJcbiAgICAgIGNvbnN0IHNpemUgPSBwcm9kdWN0U2l6ZSh0eSk7XHJcbiAgICAgIGNvbnN0IGJvZHkyID0gYFwidXNlIHN0cmljdFwiO1xyXG53cml0ZXIuZXhwYW5kQnVmZmVyKCR7c2l6ZX0pO1xyXG5jb25zdCB2aWV3ID0gd3JpdGVyLnZpZXc7XHJcbiR7dHkuZWxlbWVudHMubWFwKFxyXG4gICAgICAgICh7IG5hbWUsIGFsZ2VicmFpY1R5cGU6IHsgdGFnIH0gfSkgPT4gdGFnIGluIHByaW1pdGl2ZUpTTmFtZSA/IGB2aWV3LnNldCR7cHJpbWl0aXZlSlNOYW1lW3RhZ119KHdyaXRlci5vZmZzZXQsIHZhbHVlLiR7bmFtZX0sICR7cHJpbWl0aXZlU2l6ZXNbdGFnXSA+IDEgPyBcInRydWVcIiA6IFwiXCJ9KTtcclxud3JpdGVyLm9mZnNldCArPSAke3ByaW1pdGl2ZVNpemVzW3RhZ119O2AgOiBgd3JpdGVyLndyaXRlJHt0YWd9KHZhbHVlLiR7bmFtZX0pO2BcclxuICAgICAgKS5qb2luKFwiXFxuXCIpfWA7XHJcbiAgICAgIHNlcmlhbGl6ZXIgPSBGdW5jdGlvbihcIndyaXRlclwiLCBcInZhbHVlXCIsIGJvZHkyKTtcclxuICAgICAgU0VSSUFMSVpFUlMuc2V0KHR5LCBzZXJpYWxpemVyKTtcclxuICAgICAgcmV0dXJuIHNlcmlhbGl6ZXI7XHJcbiAgICB9XHJcbiAgICBjb25zdCBzZXJpYWxpemVycyA9IHt9O1xyXG4gICAgY29uc3QgYm9keSA9ICdcInVzZSBzdHJpY3RcIjtcXG4nICsgdHkuZWxlbWVudHMubWFwKFxyXG4gICAgICAoZWxlbWVudCkgPT4gYHRoaXMuJHtlbGVtZW50Lm5hbWV9KHdyaXRlciwgdmFsdWUuJHtlbGVtZW50Lm5hbWV9KTtgXHJcbiAgICApLmpvaW4oXCJcXG5cIik7XHJcbiAgICBzZXJpYWxpemVyID0gRnVuY3Rpb24oXCJ3cml0ZXJcIiwgXCJ2YWx1ZVwiLCBib2R5KS5iaW5kKFxyXG4gICAgICBzZXJpYWxpemVyc1xyXG4gICAgKTtcclxuICAgIFNFUklBTElaRVJTLnNldCh0eSwgc2VyaWFsaXplcik7XHJcbiAgICBmb3IgKGNvbnN0IHsgbmFtZSwgYWxnZWJyYWljVHlwZSB9IG9mIHR5LmVsZW1lbnRzKSB7XHJcbiAgICAgIHNlcmlhbGl6ZXJzW25hbWVdID0gQWxnZWJyYWljVHlwZS5tYWtlU2VyaWFsaXplcihcclxuICAgICAgICBhbGdlYnJhaWNUeXBlLFxyXG4gICAgICAgIHR5cGVzcGFjZVxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gICAgT2JqZWN0LmZyZWV6ZShzZXJpYWxpemVycyk7XHJcbiAgICByZXR1cm4gc2VyaWFsaXplcjtcclxuICB9LFxyXG4gIC8qKiBAZGVwcmVjYXRlZCBVc2UgYG1ha2VTZXJpYWxpemVyYCBpbnN0ZWFkLiAqL1xyXG4gIHNlcmlhbGl6ZVZhbHVlKHdyaXRlciwgdHksIHZhbHVlLCB0eXBlc3BhY2UpIHtcclxuICAgIFByb2R1Y3RUeXBlLm1ha2VTZXJpYWxpemVyKHR5LCB0eXBlc3BhY2UpKHdyaXRlciwgdmFsdWUpO1xyXG4gIH0sXHJcbiAgbWFrZURlc2VyaWFsaXplcih0eSwgdHlwZXNwYWNlKSB7XHJcbiAgICBzd2l0Y2ggKHR5LmVsZW1lbnRzLmxlbmd0aCkge1xyXG4gICAgICBjYXNlIDA6XHJcbiAgICAgICAgcmV0dXJuIHVuaXREZXNlcmlhbGl6ZXI7XHJcbiAgICAgIGNhc2UgMToge1xyXG4gICAgICAgIGNvbnN0IGZpZWxkTmFtZSA9IHR5LmVsZW1lbnRzWzBdLm5hbWU7XHJcbiAgICAgICAgaWYgKGhhc093bihzcGVjaWFsUHJvZHVjdERlc2VyaWFsaXplcnMsIGZpZWxkTmFtZSkpXHJcbiAgICAgICAgICByZXR1cm4gc3BlY2lhbFByb2R1Y3REZXNlcmlhbGl6ZXJzW2ZpZWxkTmFtZV07XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGxldCBkZXNlcmlhbGl6ZXIgPSBERVNFUklBTElaRVJTLmdldCh0eSk7XHJcbiAgICBpZiAoZGVzZXJpYWxpemVyICE9IG51bGwpIHJldHVybiBkZXNlcmlhbGl6ZXI7XHJcbiAgICBpZiAoaXNGaXhlZFNpemVQcm9kdWN0KHR5KSkge1xyXG4gICAgICBjb25zdCBib2R5ID0gYFwidXNlIHN0cmljdFwiO1xyXG5jb25zdCByZXN1bHQgPSB7ICR7dHkuZWxlbWVudHMubWFwKGdldEVsZW1lbnRJbml0aWFsaXplcikuam9pbihcIiwgXCIpfSB9O1xyXG5jb25zdCB2aWV3ID0gcmVhZGVyLnZpZXc7XHJcbiR7dHkuZWxlbWVudHMubWFwKFxyXG4gICAgICAgICh7IG5hbWUsIGFsZ2VicmFpY1R5cGU6IHsgdGFnIH0gfSkgPT4gdGFnIGluIHByaW1pdGl2ZUpTTmFtZSA/IGByZXN1bHQuJHtuYW1lfSA9IHZpZXcuZ2V0JHtwcmltaXRpdmVKU05hbWVbdGFnXX0ocmVhZGVyLm9mZnNldCwgJHtwcmltaXRpdmVTaXplc1t0YWddID4gMSA/IFwidHJ1ZVwiIDogXCJcIn0pO1xyXG5yZWFkZXIub2Zmc2V0ICs9ICR7cHJpbWl0aXZlU2l6ZXNbdGFnXX07YCA6IGByZXN1bHQuJHtuYW1lfSA9IHJlYWRlci5yZWFkJHt0YWd9KCk7YFxyXG4gICAgICApLmpvaW4oXCJcXG5cIil9XHJcbnJldHVybiByZXN1bHQ7YDtcclxuICAgICAgZGVzZXJpYWxpemVyID0gRnVuY3Rpb24oXCJyZWFkZXJcIiwgYm9keSk7XHJcbiAgICAgIERFU0VSSUFMSVpFUlMuc2V0KHR5LCBkZXNlcmlhbGl6ZXIpO1xyXG4gICAgICByZXR1cm4gZGVzZXJpYWxpemVyO1xyXG4gICAgfVxyXG4gICAgY29uc3QgZGVzZXJpYWxpemVycyA9IHt9O1xyXG4gICAgZGVzZXJpYWxpemVyID0gRnVuY3Rpb24oXHJcbiAgICAgIFwicmVhZGVyXCIsXHJcbiAgICAgIGBcInVzZSBzdHJpY3RcIjtcclxuY29uc3QgcmVzdWx0ID0geyAke3R5LmVsZW1lbnRzLm1hcChnZXRFbGVtZW50SW5pdGlhbGl6ZXIpLmpvaW4oXCIsIFwiKX0gfTtcclxuJHt0eS5lbGVtZW50cy5tYXAoKHsgbmFtZSB9KSA9PiBgcmVzdWx0LiR7bmFtZX0gPSB0aGlzLiR7bmFtZX0ocmVhZGVyKTtgKS5qb2luKFwiXFxuXCIpfVxyXG5yZXR1cm4gcmVzdWx0O2BcclxuICAgICkuYmluZChkZXNlcmlhbGl6ZXJzKTtcclxuICAgIERFU0VSSUFMSVpFUlMuc2V0KHR5LCBkZXNlcmlhbGl6ZXIpO1xyXG4gICAgZm9yIChjb25zdCB7IG5hbWUsIGFsZ2VicmFpY1R5cGUgfSBvZiB0eS5lbGVtZW50cykge1xyXG4gICAgICBkZXNlcmlhbGl6ZXJzW25hbWVdID0gQWxnZWJyYWljVHlwZS5tYWtlRGVzZXJpYWxpemVyKFxyXG4gICAgICAgIGFsZ2VicmFpY1R5cGUsXHJcbiAgICAgICAgdHlwZXNwYWNlXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgICBPYmplY3QuZnJlZXplKGRlc2VyaWFsaXplcnMpO1xyXG4gICAgcmV0dXJuIGRlc2VyaWFsaXplcjtcclxuICB9LFxyXG4gIC8qKiBAZGVwcmVjYXRlZCBVc2UgYG1ha2VEZXNlcmlhbGl6ZXJgIGluc3RlYWQuICovXHJcbiAgZGVzZXJpYWxpemVWYWx1ZShyZWFkZXIsIHR5LCB0eXBlc3BhY2UpIHtcclxuICAgIHJldHVybiBQcm9kdWN0VHlwZS5tYWtlRGVzZXJpYWxpemVyKHR5LCB0eXBlc3BhY2UpKHJlYWRlcik7XHJcbiAgfSxcclxuICBpbnRvTWFwS2V5KHR5LCB2YWx1ZSkge1xyXG4gICAgaWYgKHR5LmVsZW1lbnRzLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICBjb25zdCBmaWVsZE5hbWUgPSB0eS5lbGVtZW50c1swXS5uYW1lO1xyXG4gICAgICBpZiAoaGFzT3duKHNwZWNpYWxQcm9kdWN0RGVzZXJpYWxpemVycywgZmllbGROYW1lKSkge1xyXG4gICAgICAgIHJldHVybiB2YWx1ZVtmaWVsZE5hbWVdO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBjb25zdCB3cml0ZXIgPSBuZXcgQmluYXJ5V3JpdGVyKDEwKTtcclxuICAgIEFsZ2VicmFpY1R5cGUuc2VyaWFsaXplVmFsdWUod3JpdGVyLCBBbGdlYnJhaWNUeXBlLlByb2R1Y3QodHkpLCB2YWx1ZSk7XHJcbiAgICByZXR1cm4gd3JpdGVyLnRvQmFzZTY0KCk7XHJcbiAgfVxyXG59O1xyXG52YXIgU3VtVHlwZSA9IHtcclxuICBtYWtlU2VyaWFsaXplcih0eSwgdHlwZXNwYWNlKSB7XHJcbiAgICBpZiAodHkudmFyaWFudHMubGVuZ3RoID09IDIgJiYgdHkudmFyaWFudHNbMF0ubmFtZSA9PT0gXCJzb21lXCIgJiYgdHkudmFyaWFudHNbMV0ubmFtZSA9PT0gXCJub25lXCIpIHtcclxuICAgICAgY29uc3Qgc2VyaWFsaXplID0gQWxnZWJyYWljVHlwZS5tYWtlU2VyaWFsaXplcihcclxuICAgICAgICB0eS52YXJpYW50c1swXS5hbGdlYnJhaWNUeXBlLFxyXG4gICAgICAgIHR5cGVzcGFjZVxyXG4gICAgICApO1xyXG4gICAgICByZXR1cm4gKHdyaXRlciwgdmFsdWUpID0+IHtcclxuICAgICAgICBpZiAodmFsdWUgIT09IG51bGwgJiYgdmFsdWUgIT09IHZvaWQgMCkge1xyXG4gICAgICAgICAgd3JpdGVyLndyaXRlQnl0ZSgwKTtcclxuICAgICAgICAgIHNlcmlhbGl6ZSh3cml0ZXIsIHZhbHVlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgd3JpdGVyLndyaXRlQnl0ZSgxKTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICB9IGVsc2UgaWYgKHR5LnZhcmlhbnRzLmxlbmd0aCA9PSAyICYmIHR5LnZhcmlhbnRzWzBdLm5hbWUgPT09IFwib2tcIiAmJiB0eS52YXJpYW50c1sxXS5uYW1lID09PSBcImVyclwiKSB7XHJcbiAgICAgIGNvbnN0IHNlcmlhbGl6ZU9rID0gQWxnZWJyYWljVHlwZS5tYWtlU2VyaWFsaXplcihcclxuICAgICAgICB0eS52YXJpYW50c1swXS5hbGdlYnJhaWNUeXBlLFxyXG4gICAgICAgIHR5cGVzcGFjZVxyXG4gICAgICApO1xyXG4gICAgICBjb25zdCBzZXJpYWxpemVFcnIgPSBBbGdlYnJhaWNUeXBlLm1ha2VTZXJpYWxpemVyKFxyXG4gICAgICAgIHR5LnZhcmlhbnRzWzBdLmFsZ2VicmFpY1R5cGUsXHJcbiAgICAgICAgdHlwZXNwYWNlXHJcbiAgICAgICk7XHJcbiAgICAgIHJldHVybiAod3JpdGVyLCB2YWx1ZSkgPT4ge1xyXG4gICAgICAgIGlmIChcIm9rXCIgaW4gdmFsdWUpIHtcclxuICAgICAgICAgIHdyaXRlci53cml0ZVU4KDApO1xyXG4gICAgICAgICAgc2VyaWFsaXplT2sod3JpdGVyLCB2YWx1ZS5vayk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChcImVyclwiIGluIHZhbHVlKSB7XHJcbiAgICAgICAgICB3cml0ZXIud3JpdGVVOCgxKTtcclxuICAgICAgICAgIHNlcmlhbGl6ZUVycih3cml0ZXIsIHZhbHVlLmVycik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXHJcbiAgICAgICAgICAgIFwiY291bGQgbm90IHNlcmlhbGl6ZSByZXN1bHQ6IG9iamVjdCBoYWQgbmVpdGhlciBhIGBva2Agbm9yIGFuIGBlcnJgIGZpZWxkXCJcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbGV0IHNlcmlhbGl6ZXIgPSBTRVJJQUxJWkVSUy5nZXQodHkpO1xyXG4gICAgICBpZiAoc2VyaWFsaXplciAhPSBudWxsKSByZXR1cm4gc2VyaWFsaXplcjtcclxuICAgICAgY29uc3Qgc2VyaWFsaXplcnMgPSB7fTtcclxuICAgICAgY29uc3QgYm9keSA9IGBzd2l0Y2ggKHZhbHVlLnRhZykge1xyXG4ke3R5LnZhcmlhbnRzLm1hcChcclxuICAgICAgICAoeyBuYW1lIH0sIGkpID0+IGAgIGNhc2UgJHtKU09OLnN0cmluZ2lmeShuYW1lKX06XHJcbiAgICB3cml0ZXIud3JpdGVCeXRlKCR7aX0pO1xyXG4gICAgcmV0dXJuIHRoaXMuJHtuYW1lfSh3cml0ZXIsIHZhbHVlLnZhbHVlKTtgXHJcbiAgICAgICkuam9pbihcIlxcblwiKX1cclxuICBkZWZhdWx0OlxyXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcclxuICAgICAgXFxgQ291bGQgbm90IHNlcmlhbGl6ZSBzdW0gdHlwZTsgdW5rbm93biB0YWcgXFwke3ZhbHVlLnRhZ31cXGBcclxuICAgIClcclxufVxyXG5gO1xyXG4gICAgICBzZXJpYWxpemVyID0gRnVuY3Rpb24oXCJ3cml0ZXJcIiwgXCJ2YWx1ZVwiLCBib2R5KS5iaW5kKFxyXG4gICAgICAgIHNlcmlhbGl6ZXJzXHJcbiAgICAgICk7XHJcbiAgICAgIFNFUklBTElaRVJTLnNldCh0eSwgc2VyaWFsaXplcik7XHJcbiAgICAgIGZvciAoY29uc3QgeyBuYW1lLCBhbGdlYnJhaWNUeXBlIH0gb2YgdHkudmFyaWFudHMpIHtcclxuICAgICAgICBzZXJpYWxpemVyc1tuYW1lXSA9IEFsZ2VicmFpY1R5cGUubWFrZVNlcmlhbGl6ZXIoXHJcbiAgICAgICAgICBhbGdlYnJhaWNUeXBlLFxyXG4gICAgICAgICAgdHlwZXNwYWNlXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgICBPYmplY3QuZnJlZXplKHNlcmlhbGl6ZXJzKTtcclxuICAgICAgcmV0dXJuIHNlcmlhbGl6ZXI7XHJcbiAgICB9XHJcbiAgfSxcclxuICAvKiogQGRlcHJlY2F0ZWQgVXNlIGBtYWtlU2VyaWFsaXplcmAgaW5zdGVhZC4gKi9cclxuICBzZXJpYWxpemVWYWx1ZSh3cml0ZXIsIHR5LCB2YWx1ZSwgdHlwZXNwYWNlKSB7XHJcbiAgICBTdW1UeXBlLm1ha2VTZXJpYWxpemVyKHR5LCB0eXBlc3BhY2UpKHdyaXRlciwgdmFsdWUpO1xyXG4gIH0sXHJcbiAgbWFrZURlc2VyaWFsaXplcih0eSwgdHlwZXNwYWNlKSB7XHJcbiAgICBpZiAodHkudmFyaWFudHMubGVuZ3RoID09IDIgJiYgdHkudmFyaWFudHNbMF0ubmFtZSA9PT0gXCJzb21lXCIgJiYgdHkudmFyaWFudHNbMV0ubmFtZSA9PT0gXCJub25lXCIpIHtcclxuICAgICAgY29uc3QgZGVzZXJpYWxpemUgPSBBbGdlYnJhaWNUeXBlLm1ha2VEZXNlcmlhbGl6ZXIoXHJcbiAgICAgICAgdHkudmFyaWFudHNbMF0uYWxnZWJyYWljVHlwZSxcclxuICAgICAgICB0eXBlc3BhY2VcclxuICAgICAgKTtcclxuICAgICAgcmV0dXJuIChyZWFkZXIpID0+IHtcclxuICAgICAgICBjb25zdCB0YWcgPSByZWFkZXIucmVhZFU4KCk7XHJcbiAgICAgICAgaWYgKHRhZyA9PT0gMCkge1xyXG4gICAgICAgICAgcmV0dXJuIGRlc2VyaWFsaXplKHJlYWRlcik7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0YWcgPT09IDEpIHtcclxuICAgICAgICAgIHJldHVybiB2b2lkIDA7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRocm93IGBDYW4ndCBkZXNlcmlhbGl6ZSBhbiBvcHRpb24gdHlwZSwgY291bGRuJ3QgZmluZCAke3RhZ30gdGFnYDtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICB9IGVsc2UgaWYgKHR5LnZhcmlhbnRzLmxlbmd0aCA9PSAyICYmIHR5LnZhcmlhbnRzWzBdLm5hbWUgPT09IFwib2tcIiAmJiB0eS52YXJpYW50c1sxXS5uYW1lID09PSBcImVyclwiKSB7XHJcbiAgICAgIGNvbnN0IGRlc2VyaWFsaXplT2sgPSBBbGdlYnJhaWNUeXBlLm1ha2VEZXNlcmlhbGl6ZXIoXHJcbiAgICAgICAgdHkudmFyaWFudHNbMF0uYWxnZWJyYWljVHlwZSxcclxuICAgICAgICB0eXBlc3BhY2VcclxuICAgICAgKTtcclxuICAgICAgY29uc3QgZGVzZXJpYWxpemVFcnIgPSBBbGdlYnJhaWNUeXBlLm1ha2VEZXNlcmlhbGl6ZXIoXHJcbiAgICAgICAgdHkudmFyaWFudHNbMV0uYWxnZWJyYWljVHlwZSxcclxuICAgICAgICB0eXBlc3BhY2VcclxuICAgICAgKTtcclxuICAgICAgcmV0dXJuIChyZWFkZXIpID0+IHtcclxuICAgICAgICBjb25zdCB0YWcgPSByZWFkZXIucmVhZEJ5dGUoKTtcclxuICAgICAgICBpZiAodGFnID09PSAwKSB7XHJcbiAgICAgICAgICByZXR1cm4geyBvazogZGVzZXJpYWxpemVPayhyZWFkZXIpIH07XHJcbiAgICAgICAgfSBlbHNlIGlmICh0YWcgPT09IDEpIHtcclxuICAgICAgICAgIHJldHVybiB7IGVycjogZGVzZXJpYWxpemVFcnIocmVhZGVyKSB9O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aHJvdyBgQ2FuJ3QgZGVzZXJpYWxpemUgYSByZXN1bHQgdHlwZSwgY291bGRuJ3QgZmluZCAke3RhZ30gdGFnYDtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBsZXQgZGVzZXJpYWxpemVyID0gREVTRVJJQUxJWkVSUy5nZXQodHkpO1xyXG4gICAgICBpZiAoZGVzZXJpYWxpemVyICE9IG51bGwpIHJldHVybiBkZXNlcmlhbGl6ZXI7XHJcbiAgICAgIGNvbnN0IGRlc2VyaWFsaXplcnMgPSB7fTtcclxuICAgICAgZGVzZXJpYWxpemVyID0gRnVuY3Rpb24oXHJcbiAgICAgICAgXCJyZWFkZXJcIixcclxuICAgICAgICBgc3dpdGNoIChyZWFkZXIucmVhZFU4KCkpIHtcclxuJHt0eS52YXJpYW50cy5tYXAoXHJcbiAgICAgICAgICAoeyBuYW1lIH0sIGkpID0+IGBjYXNlICR7aX06IHJldHVybiB7IHRhZzogJHtKU09OLnN0cmluZ2lmeShuYW1lKX0sIHZhbHVlOiB0aGlzLiR7bmFtZX0ocmVhZGVyKSB9O2BcclxuICAgICAgICApLmpvaW4oXCJcXG5cIil9IH1gXHJcbiAgICAgICkuYmluZChkZXNlcmlhbGl6ZXJzKTtcclxuICAgICAgREVTRVJJQUxJWkVSUy5zZXQodHksIGRlc2VyaWFsaXplcik7XHJcbiAgICAgIGZvciAoY29uc3QgeyBuYW1lLCBhbGdlYnJhaWNUeXBlIH0gb2YgdHkudmFyaWFudHMpIHtcclxuICAgICAgICBkZXNlcmlhbGl6ZXJzW25hbWVdID0gQWxnZWJyYWljVHlwZS5tYWtlRGVzZXJpYWxpemVyKFxyXG4gICAgICAgICAgYWxnZWJyYWljVHlwZSxcclxuICAgICAgICAgIHR5cGVzcGFjZVxyXG4gICAgICAgICk7XHJcbiAgICAgIH1cclxuICAgICAgT2JqZWN0LmZyZWV6ZShkZXNlcmlhbGl6ZXJzKTtcclxuICAgICAgcmV0dXJuIGRlc2VyaWFsaXplcjtcclxuICAgIH1cclxuICB9LFxyXG4gIC8qKiBAZGVwcmVjYXRlZCBVc2UgYG1ha2VEZXNlcmlhbGl6ZXJgIGluc3RlYWQuICovXHJcbiAgZGVzZXJpYWxpemVWYWx1ZShyZWFkZXIsIHR5LCB0eXBlc3BhY2UpIHtcclxuICAgIHJldHVybiBTdW1UeXBlLm1ha2VEZXNlcmlhbGl6ZXIodHksIHR5cGVzcGFjZSkocmVhZGVyKTtcclxuICB9XHJcbn07XHJcblxyXG4vLyBzcmMvbGliL29wdGlvbi50c1xyXG52YXIgT3B0aW9uID0ge1xyXG4gIGdldEFsZ2VicmFpY1R5cGUoaW5uZXJUeXBlKSB7XHJcbiAgICByZXR1cm4gQWxnZWJyYWljVHlwZS5TdW0oe1xyXG4gICAgICB2YXJpYW50czogW1xyXG4gICAgICAgIHsgbmFtZTogXCJzb21lXCIsIGFsZ2VicmFpY1R5cGU6IGlubmVyVHlwZSB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIG5hbWU6IFwibm9uZVwiLFxyXG4gICAgICAgICAgYWxnZWJyYWljVHlwZTogQWxnZWJyYWljVHlwZS5Qcm9kdWN0KHsgZWxlbWVudHM6IFtdIH0pXHJcbiAgICAgICAgfVxyXG4gICAgICBdXHJcbiAgICB9KTtcclxuICB9XHJcbn07XHJcblxyXG4vLyBzcmMvbGliL3Jlc3VsdC50c1xyXG52YXIgUmVzdWx0ID0ge1xyXG4gIGdldEFsZ2VicmFpY1R5cGUob2tUeXBlLCBlcnJUeXBlKSB7XHJcbiAgICByZXR1cm4gQWxnZWJyYWljVHlwZS5TdW0oe1xyXG4gICAgICB2YXJpYW50czogW1xyXG4gICAgICAgIHsgbmFtZTogXCJva1wiLCBhbGdlYnJhaWNUeXBlOiBva1R5cGUgfSxcclxuICAgICAgICB7IG5hbWU6IFwiZXJyXCIsIGFsZ2VicmFpY1R5cGU6IGVyclR5cGUgfVxyXG4gICAgICBdXHJcbiAgICB9KTtcclxuICB9XHJcbn07XHJcblxyXG4vLyBzcmMvbGliL3NjaGVkdWxlX2F0LnRzXHJcbnZhciBTY2hlZHVsZUF0ID0ge1xyXG4gIGludGVydmFsKHZhbHVlKSB7XHJcbiAgICByZXR1cm4gSW50ZXJ2YWwodmFsdWUpO1xyXG4gIH0sXHJcbiAgdGltZSh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIFRpbWUodmFsdWUpO1xyXG4gIH0sXHJcbiAgZ2V0QWxnZWJyYWljVHlwZSgpIHtcclxuICAgIHJldHVybiBBbGdlYnJhaWNUeXBlLlN1bSh7XHJcbiAgICAgIHZhcmlhbnRzOiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgbmFtZTogXCJJbnRlcnZhbFwiLFxyXG4gICAgICAgICAgYWxnZWJyYWljVHlwZTogVGltZUR1cmF0aW9uLmdldEFsZ2VicmFpY1R5cGUoKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgeyBuYW1lOiBcIlRpbWVcIiwgYWxnZWJyYWljVHlwZTogVGltZXN0YW1wLmdldEFsZ2VicmFpY1R5cGUoKSB9XHJcbiAgICAgIF1cclxuICAgIH0pO1xyXG4gIH0sXHJcbiAgaXNTY2hlZHVsZUF0KGFsZ2VicmFpY1R5cGUpIHtcclxuICAgIGlmIChhbGdlYnJhaWNUeXBlLnRhZyAhPT0gXCJTdW1cIikge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBjb25zdCB2YXJpYW50cyA9IGFsZ2VicmFpY1R5cGUudmFsdWUudmFyaWFudHM7XHJcbiAgICBpZiAodmFyaWFudHMubGVuZ3RoICE9PSAyKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGNvbnN0IGludGVydmFsVmFyaWFudCA9IHZhcmlhbnRzLmZpbmQoKHYpID0+IHYubmFtZSA9PT0gXCJJbnRlcnZhbFwiKTtcclxuICAgIGNvbnN0IHRpbWVWYXJpYW50ID0gdmFyaWFudHMuZmluZCgodikgPT4gdi5uYW1lID09PSBcIlRpbWVcIik7XHJcbiAgICBpZiAoIWludGVydmFsVmFyaWFudCB8fCAhdGltZVZhcmlhbnQpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIFRpbWVEdXJhdGlvbi5pc1RpbWVEdXJhdGlvbihpbnRlcnZhbFZhcmlhbnQuYWxnZWJyYWljVHlwZSkgJiYgVGltZXN0YW1wLmlzVGltZXN0YW1wKHRpbWVWYXJpYW50LmFsZ2VicmFpY1R5cGUpO1xyXG4gIH1cclxufTtcclxudmFyIEludGVydmFsID0gKG1pY3JvcykgPT4gKHtcclxuICB0YWc6IFwiSW50ZXJ2YWxcIixcclxuICB2YWx1ZTogbmV3IFRpbWVEdXJhdGlvbihtaWNyb3MpXHJcbn0pO1xyXG52YXIgVGltZSA9IChtaWNyb3NTaW5jZVVuaXhFcG9jaCkgPT4gKHtcclxuICB0YWc6IFwiVGltZVwiLFxyXG4gIHZhbHVlOiBuZXcgVGltZXN0YW1wKG1pY3Jvc1NpbmNlVW5peEVwb2NoKVxyXG59KTtcclxudmFyIHNjaGVkdWxlX2F0X2RlZmF1bHQgPSBTY2hlZHVsZUF0O1xyXG5cclxuLy8gc3JjL2xpYi90eXBlX3V0aWwudHNcclxuZnVuY3Rpb24gc2V0KHgsIHQyKSB7XHJcbiAgcmV0dXJuIHsgLi4ueCwgLi4udDIgfTtcclxufVxyXG5cclxuLy8gc3JjL2xpYi90eXBlX2J1aWxkZXJzLnRzXHJcbnZhciBUeXBlQnVpbGRlciA9IGNsYXNzIHtcclxuICAvKipcclxuICAgKiBUaGUgVHlwZVNjcmlwdCBwaGFudG9tIHR5cGUuIFRoaXMgaXMgbm90IHN0b3JlZCBhdCBydW50aW1lLFxyXG4gICAqIGJ1dCBpcyB2aXNpYmxlIHRvIHRoZSBjb21waWxlclxyXG4gICAqL1xyXG4gIHR5cGU7XHJcbiAgLyoqXHJcbiAgICogVGhlIFNwYWNldGltZURCIGFsZ2VicmFpYyB0eXBlIChydW7igJF0aW1lIHZhbHVlKS4gSW4gYWRkaXRpb24gdG8gc3RvcmluZ1xyXG4gICAqIHRoZSBydW50aW1lIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBgQWxnZWJyYWljVHlwZWAsIGl0IGFsc28gY2FwdHVyZXNcclxuICAgKiB0aGUgVHlwZVNjcmlwdCB0eXBlIGluZm9ybWF0aW9uIG9mIHRoZSBgQWxnZWJyYWljVHlwZWAuIFRoYXQgaXMgdG8gc2F5XHJcbiAgICogdGhlIHZhbHVlIGlzIG5vdCBtZXJlbHkgYW4gYEFsZ2VicmFpY1R5cGVgLCBidXQgaXMgY29uc3RydWN0ZWQgdG8gYmVcclxuICAgKiB0aGUgY29ycmVzcG9uZGluZyBjb25jcmV0ZSBgQWxnZWJyYWljVHlwZWAgZm9yIHRoZSBUeXBlU2NyaXB0IHR5cGUgYFR5cGVgLlxyXG4gICAqXHJcbiAgICogZS5nLiBgc3RyaW5nYCBjb3JyZXNwb25kcyB0byBgQWxnZWJyYWljVHlwZS5TdHJpbmdgXHJcbiAgICovXHJcbiAgYWxnZWJyYWljVHlwZTtcclxuICBjb25zdHJ1Y3RvcihhbGdlYnJhaWNUeXBlKSB7XHJcbiAgICB0aGlzLmFsZ2VicmFpY1R5cGUgPSBhbGdlYnJhaWNUeXBlO1xyXG4gIH1cclxuICBvcHRpb25hbCgpIHtcclxuICAgIHJldHVybiBuZXcgT3B0aW9uQnVpbGRlcih0aGlzKTtcclxuICB9XHJcbiAgc2VyaWFsaXplKHdyaXRlciwgdmFsdWUpIHtcclxuICAgIGNvbnN0IHNlcmlhbGl6ZSA9IHRoaXMuc2VyaWFsaXplID0gQWxnZWJyYWljVHlwZS5tYWtlU2VyaWFsaXplcihcclxuICAgICAgdGhpcy5hbGdlYnJhaWNUeXBlXHJcbiAgICApO1xyXG4gICAgc2VyaWFsaXplKHdyaXRlciwgdmFsdWUpO1xyXG4gIH1cclxuICBkZXNlcmlhbGl6ZShyZWFkZXIpIHtcclxuICAgIGNvbnN0IGRlc2VyaWFsaXplID0gdGhpcy5kZXNlcmlhbGl6ZSA9IEFsZ2VicmFpY1R5cGUubWFrZURlc2VyaWFsaXplcihcclxuICAgICAgdGhpcy5hbGdlYnJhaWNUeXBlXHJcbiAgICApO1xyXG4gICAgcmV0dXJuIGRlc2VyaWFsaXplKHJlYWRlcik7XHJcbiAgfVxyXG59O1xyXG52YXIgVThCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcihBbGdlYnJhaWNUeXBlLlU4KTtcclxuICB9XHJcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XHJcbiAgICByZXR1cm4gbmV3IFU4Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgdW5pcXVlKCkge1xyXG4gICAgcmV0dXJuIG5ldyBVOENvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KSk7XHJcbiAgfVxyXG4gIHByaW1hcnlLZXkoKSB7XHJcbiAgICByZXR1cm4gbmV3IFU4Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGF1dG9JbmMoKSB7XHJcbiAgICByZXR1cm4gbmV3IFU4Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgVThDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIG5hbWUobmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBVOENvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcclxuICB9XHJcbn07XHJcbnZhciBVMTZCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcihBbGdlYnJhaWNUeXBlLlUxNik7XHJcbiAgfVxyXG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xyXG4gICAgcmV0dXJuIG5ldyBVMTZDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICB1bmlxdWUoKSB7XHJcbiAgICByZXR1cm4gbmV3IFUxNkNvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KSk7XHJcbiAgfVxyXG4gIHByaW1hcnlLZXkoKSB7XHJcbiAgICByZXR1cm4gbmV3IFUxNkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBhdXRvSW5jKCkge1xyXG4gICAgcmV0dXJuIG5ldyBVMTZDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgZGVmYXVsdCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBVMTZDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIG5hbWUobmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBVMTZDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XHJcbiAgfVxyXG59O1xyXG52YXIgVTMyQnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoQWxnZWJyYWljVHlwZS5VMzIpO1xyXG4gIH1cclxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcclxuICAgIHJldHVybiBuZXcgVTMyQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgdW5pcXVlKCkge1xyXG4gICAgcmV0dXJuIG5ldyBVMzJDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSkpO1xyXG4gIH1cclxuICBwcmltYXJ5S2V5KCkge1xyXG4gICAgcmV0dXJuIG5ldyBVMzJDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgYXV0b0luYygpIHtcclxuICAgIHJldHVybiBuZXcgVTMyQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgVTMyQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgVTMyQ29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xyXG4gIH1cclxufTtcclxudmFyIFU2NEJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuVTY0KTtcclxuICB9XHJcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XHJcbiAgICByZXR1cm4gbmV3IFU2NENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHVuaXF1ZSgpIHtcclxuICAgIHJldHVybiBuZXcgVTY0Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pKTtcclxuICB9XHJcbiAgcHJpbWFyeUtleSgpIHtcclxuICAgIHJldHVybiBuZXcgVTY0Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGF1dG9JbmMoKSB7XHJcbiAgICByZXR1cm4gbmV3IFU2NENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IFU2NENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IFU2NENvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcclxuICB9XHJcbn07XHJcbnZhciBVMTI4QnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoQWxnZWJyYWljVHlwZS5VMTI4KTtcclxuICB9XHJcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XHJcbiAgICByZXR1cm4gbmV3IFUxMjhDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICB1bmlxdWUoKSB7XHJcbiAgICByZXR1cm4gbmV3IFUxMjhDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBwcmltYXJ5S2V5KCkge1xyXG4gICAgcmV0dXJuIG5ldyBVMTI4Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGF1dG9JbmMoKSB7XHJcbiAgICByZXR1cm4gbmV3IFUxMjhDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgZGVmYXVsdCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBVMTI4Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgVTEyOENvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcclxuICB9XHJcbn07XHJcbnZhciBVMjU2QnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoQWxnZWJyYWljVHlwZS5VMjU2KTtcclxuICB9XHJcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XHJcbiAgICByZXR1cm4gbmV3IFUyNTZDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICB1bmlxdWUoKSB7XHJcbiAgICByZXR1cm4gbmV3IFUyNTZDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBwcmltYXJ5S2V5KCkge1xyXG4gICAgcmV0dXJuIG5ldyBVMjU2Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGF1dG9JbmMoKSB7XHJcbiAgICByZXR1cm4gbmV3IFUyNTZDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgZGVmYXVsdCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBVMjU2Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgVTI1NkNvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcclxuICB9XHJcbn07XHJcbnZhciBJOEJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuSTgpO1xyXG4gIH1cclxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcclxuICAgIHJldHVybiBuZXcgSThDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICB1bmlxdWUoKSB7XHJcbiAgICByZXR1cm4gbmV3IEk4Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pKTtcclxuICB9XHJcbiAgcHJpbWFyeUtleSgpIHtcclxuICAgIHJldHVybiBuZXcgSThDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgYXV0b0luYygpIHtcclxuICAgIHJldHVybiBuZXcgSThDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgZGVmYXVsdCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBJOENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IEk4Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xyXG4gIH1cclxufTtcclxudmFyIEkxNkJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuSTE2KTtcclxuICB9XHJcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XHJcbiAgICByZXR1cm4gbmV3IEkxNkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHVuaXF1ZSgpIHtcclxuICAgIHJldHVybiBuZXcgSTE2Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pKTtcclxuICB9XHJcbiAgcHJpbWFyeUtleSgpIHtcclxuICAgIHJldHVybiBuZXcgSTE2Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGF1dG9JbmMoKSB7XHJcbiAgICByZXR1cm4gbmV3IEkxNkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IEkxNkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IEkxNkNvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcclxuICB9XHJcbn07XHJcbnZhciBJMzJCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcihBbGdlYnJhaWNUeXBlLkkzMik7XHJcbiAgfVxyXG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xyXG4gICAgcmV0dXJuIG5ldyBJMzJDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICB1bmlxdWUoKSB7XHJcbiAgICByZXR1cm4gbmV3IEkzMkNvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KSk7XHJcbiAgfVxyXG4gIHByaW1hcnlLZXkoKSB7XHJcbiAgICByZXR1cm4gbmV3IEkzMkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBhdXRvSW5jKCkge1xyXG4gICAgcmV0dXJuIG5ldyBJMzJDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgZGVmYXVsdCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBJMzJDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIG5hbWUobmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBJMzJDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XHJcbiAgfVxyXG59O1xyXG52YXIgSTY0QnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoQWxnZWJyYWljVHlwZS5JNjQpO1xyXG4gIH1cclxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcclxuICAgIHJldHVybiBuZXcgSTY0Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgdW5pcXVlKCkge1xyXG4gICAgcmV0dXJuIG5ldyBJNjRDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSkpO1xyXG4gIH1cclxuICBwcmltYXJ5S2V5KCkge1xyXG4gICAgcmV0dXJuIG5ldyBJNjRDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgYXV0b0luYygpIHtcclxuICAgIHJldHVybiBuZXcgSTY0Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgSTY0Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgSTY0Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xyXG4gIH1cclxufTtcclxudmFyIEkxMjhCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcihBbGdlYnJhaWNUeXBlLkkxMjgpO1xyXG4gIH1cclxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcclxuICAgIHJldHVybiBuZXcgSTEyOENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHVuaXF1ZSgpIHtcclxuICAgIHJldHVybiBuZXcgSTEyOENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHByaW1hcnlLZXkoKSB7XHJcbiAgICByZXR1cm4gbmV3IEkxMjhDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgYXV0b0luYygpIHtcclxuICAgIHJldHVybiBuZXcgSTEyOENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IEkxMjhDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIG5hbWUobmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBJMTI4Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xyXG4gIH1cclxufTtcclxudmFyIEkyNTZCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcihBbGdlYnJhaWNUeXBlLkkyNTYpO1xyXG4gIH1cclxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcclxuICAgIHJldHVybiBuZXcgSTI1NkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHVuaXF1ZSgpIHtcclxuICAgIHJldHVybiBuZXcgSTI1NkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHByaW1hcnlLZXkoKSB7XHJcbiAgICByZXR1cm4gbmV3IEkyNTZDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgYXV0b0luYygpIHtcclxuICAgIHJldHVybiBuZXcgSTI1NkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IEkyNTZDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIG5hbWUobmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBJMjU2Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xyXG4gIH1cclxufTtcclxudmFyIEYzMkJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuRjMyKTtcclxuICB9XHJcbiAgZGVmYXVsdCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBGMzJDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIG5hbWUobmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBGMzJDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XHJcbiAgfVxyXG59O1xyXG52YXIgRjY0QnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoQWxnZWJyYWljVHlwZS5GNjQpO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IEY2NENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IEY2NENvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcclxuICB9XHJcbn07XHJcbnZhciBCb29sQnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoQWxnZWJyYWljVHlwZS5Cb29sKTtcclxuICB9XHJcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XHJcbiAgICByZXR1cm4gbmV3IEJvb2xDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICB1bmlxdWUoKSB7XHJcbiAgICByZXR1cm4gbmV3IEJvb2xDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBwcmltYXJ5S2V5KCkge1xyXG4gICAgcmV0dXJuIG5ldyBCb29sQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgQm9vbENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IEJvb2xDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XHJcbiAgfVxyXG59O1xyXG52YXIgU3RyaW5nQnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoQWxnZWJyYWljVHlwZS5TdHJpbmcpO1xyXG4gIH1cclxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcclxuICAgIHJldHVybiBuZXcgU3RyaW5nQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgdW5pcXVlKCkge1xyXG4gICAgcmV0dXJuIG5ldyBTdHJpbmdDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBwcmltYXJ5S2V5KCkge1xyXG4gICAgcmV0dXJuIG5ldyBTdHJpbmdDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgZGVmYXVsdCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBTdHJpbmdDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIG5hbWUobmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBTdHJpbmdDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XHJcbiAgfVxyXG59O1xyXG52YXIgQXJyYXlCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XHJcbiAgZWxlbWVudDtcclxuICBjb25zdHJ1Y3RvcihlbGVtZW50KSB7XHJcbiAgICBzdXBlcihBbGdlYnJhaWNUeXBlLkFycmF5KGVsZW1lbnQuYWxnZWJyYWljVHlwZSkpO1xyXG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcclxuICB9XHJcbiAgZGVmYXVsdCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBBcnJheUNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IEFycmF5Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xyXG4gIH1cclxufTtcclxudmFyIEJ5dGVBcnJheUJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuQXJyYXkoQWxnZWJyYWljVHlwZS5VOCkpO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IEJ5dGVBcnJheUNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IEJ5dGVBcnJheUNvbHVtbkJ1aWxkZXIoc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcclxuICB9XHJcbn07XHJcbnZhciBPcHRpb25CdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XHJcbiAgdmFsdWU7XHJcbiAgY29uc3RydWN0b3IodmFsdWUpIHtcclxuICAgIHN1cGVyKE9wdGlvbi5nZXRBbGdlYnJhaWNUeXBlKHZhbHVlLmFsZ2VicmFpY1R5cGUpKTtcclxuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcclxuICB9XHJcbiAgZGVmYXVsdCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBPcHRpb25Db2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIG5hbWUobmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBPcHRpb25Db2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XHJcbiAgfVxyXG59O1xyXG52YXIgUHJvZHVjdEJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcclxuICB0eXBlTmFtZTtcclxuICBlbGVtZW50cztcclxuICBjb25zdHJ1Y3RvcihlbGVtZW50cywgbmFtZSkge1xyXG4gICAgZnVuY3Rpb24gZWxlbWVudHNBcnJheUZyb21FbGVtZW50c09iaihvYmopIHtcclxuICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKG9iaikubWFwKChrZXkpID0+ICh7XHJcbiAgICAgICAgbmFtZToga2V5LFxyXG4gICAgICAgIC8vIExhemlseSByZXNvbHZlIHRoZSB1bmRlcmx5aW5nIG9iamVjdCdzIGFsZ2VicmFpY1R5cGUuXHJcbiAgICAgICAgLy8gVGhpcyB3aWxsIGNhbGwgb2JqW2tleV0uYWxnZWJyYWljVHlwZSBvbmx5IHdoZW4gc29tZW9uZVxyXG4gICAgICAgIC8vIGFjdHVhbGx5IHJlYWRzIHRoaXMgcHJvcGVydHkuXHJcbiAgICAgICAgZ2V0IGFsZ2VicmFpY1R5cGUoKSB7XHJcbiAgICAgICAgICByZXR1cm4gb2JqW2tleV0uYWxnZWJyYWljVHlwZTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pKTtcclxuICAgIH1cclxuICAgIHN1cGVyKFxyXG4gICAgICBBbGdlYnJhaWNUeXBlLlByb2R1Y3Qoe1xyXG4gICAgICAgIGVsZW1lbnRzOiBlbGVtZW50c0FycmF5RnJvbUVsZW1lbnRzT2JqKGVsZW1lbnRzKVxyXG4gICAgICB9KVxyXG4gICAgKTtcclxuICAgIHRoaXMudHlwZU5hbWUgPSBuYW1lO1xyXG4gICAgdGhpcy5lbGVtZW50cyA9IGVsZW1lbnRzO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IFByb2R1Y3RDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIG5hbWUobmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9kdWN0Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xyXG4gIH1cclxufTtcclxudmFyIFJlc3VsdEJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcclxuICBvaztcclxuICBlcnI7XHJcbiAgY29uc3RydWN0b3Iob2ssIGVycikge1xyXG4gICAgc3VwZXIoUmVzdWx0LmdldEFsZ2VicmFpY1R5cGUob2suYWxnZWJyYWljVHlwZSwgZXJyLmFsZ2VicmFpY1R5cGUpKTtcclxuICAgIHRoaXMub2sgPSBvaztcclxuICAgIHRoaXMuZXJyID0gZXJyO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IFJlc3VsdENvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pKTtcclxuICB9XHJcbn07XHJcbnZhciBVbml0QnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoeyB0YWc6IFwiUHJvZHVjdFwiLCB2YWx1ZTogeyBlbGVtZW50czogW10gfSB9KTtcclxuICB9XHJcbn07XHJcbnZhciBSb3dCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XHJcbiAgcm93O1xyXG4gIHR5cGVOYW1lO1xyXG4gIGNvbnN0cnVjdG9yKHJvdywgbmFtZSkge1xyXG4gICAgY29uc3QgbWFwcGVkUm93ID0gT2JqZWN0LmZyb21FbnRyaWVzKFxyXG4gICAgICBPYmplY3QuZW50cmllcyhyb3cpLm1hcCgoW2NvbE5hbWUsIGJ1aWxkZXJdKSA9PiBbXHJcbiAgICAgICAgY29sTmFtZSxcclxuICAgICAgICBidWlsZGVyIGluc3RhbmNlb2YgQ29sdW1uQnVpbGRlciA/IGJ1aWxkZXIgOiBuZXcgQ29sdW1uQnVpbGRlcihidWlsZGVyLCB7fSlcclxuICAgICAgXSlcclxuICAgICk7XHJcbiAgICBjb25zdCBlbGVtZW50cyA9IE9iamVjdC5rZXlzKG1hcHBlZFJvdykubWFwKChuYW1lMikgPT4gKHtcclxuICAgICAgbmFtZTogbmFtZTIsXHJcbiAgICAgIGdldCBhbGdlYnJhaWNUeXBlKCkge1xyXG4gICAgICAgIHJldHVybiBtYXBwZWRSb3dbbmFtZTJdLnR5cGVCdWlsZGVyLmFsZ2VicmFpY1R5cGU7XHJcbiAgICAgIH1cclxuICAgIH0pKTtcclxuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuUHJvZHVjdCh7IGVsZW1lbnRzIH0pKTtcclxuICAgIHRoaXMucm93ID0gbWFwcGVkUm93O1xyXG4gICAgdGhpcy50eXBlTmFtZSA9IG5hbWU7XHJcbiAgfVxyXG59O1xyXG52YXIgU3VtQnVpbGRlckltcGwgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcclxuICB2YXJpYW50cztcclxuICB0eXBlTmFtZTtcclxuICBjb25zdHJ1Y3Rvcih2YXJpYW50cywgbmFtZSkge1xyXG4gICAgZnVuY3Rpb24gdmFyaWFudHNBcnJheUZyb21WYXJpYW50c09iaih2YXJpYW50czIpIHtcclxuICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKHZhcmlhbnRzMikubWFwKChrZXkpID0+ICh7XHJcbiAgICAgICAgbmFtZToga2V5LFxyXG4gICAgICAgIC8vIExhemlseSByZXNvbHZlIHRoZSB1bmRlcmx5aW5nIG9iamVjdCdzIGFsZ2VicmFpY1R5cGUuXHJcbiAgICAgICAgLy8gVGhpcyB3aWxsIGNhbGwgb2JqW2tleV0uYWxnZWJyYWljVHlwZSBvbmx5IHdoZW4gc29tZW9uZVxyXG4gICAgICAgIC8vIGFjdHVhbGx5IHJlYWRzIHRoaXMgcHJvcGVydHkuXHJcbiAgICAgICAgZ2V0IGFsZ2VicmFpY1R5cGUoKSB7XHJcbiAgICAgICAgICByZXR1cm4gdmFyaWFudHMyW2tleV0uYWxnZWJyYWljVHlwZTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pKTtcclxuICAgIH1cclxuICAgIHN1cGVyKFxyXG4gICAgICBBbGdlYnJhaWNUeXBlLlN1bSh7XHJcbiAgICAgICAgdmFyaWFudHM6IHZhcmlhbnRzQXJyYXlGcm9tVmFyaWFudHNPYmoodmFyaWFudHMpXHJcbiAgICAgIH0pXHJcbiAgICApO1xyXG4gICAgdGhpcy52YXJpYW50cyA9IHZhcmlhbnRzO1xyXG4gICAgdGhpcy50eXBlTmFtZSA9IG5hbWU7XHJcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyh2YXJpYW50cykpIHtcclxuICAgICAgY29uc3QgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodmFyaWFudHMsIGtleSk7XHJcbiAgICAgIGNvbnN0IGlzQWNjZXNzb3IgPSAhIWRlc2MgJiYgKHR5cGVvZiBkZXNjLmdldCA9PT0gXCJmdW5jdGlvblwiIHx8IHR5cGVvZiBkZXNjLnNldCA9PT0gXCJmdW5jdGlvblwiKTtcclxuICAgICAgbGV0IGlzVW5pdDIgPSBmYWxzZTtcclxuICAgICAgaWYgKCFpc0FjY2Vzc29yKSB7XHJcbiAgICAgICAgY29uc3QgdmFyaWFudCA9IHZhcmlhbnRzW2tleV07XHJcbiAgICAgICAgaXNVbml0MiA9IHZhcmlhbnQgaW5zdGFuY2VvZiBVbml0QnVpbGRlcjtcclxuICAgICAgfVxyXG4gICAgICBpZiAoaXNVbml0Mikge1xyXG4gICAgICAgIGNvbnN0IGNvbnN0YW50ID0gdGhpcy5jcmVhdGUoa2V5KTtcclxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywga2V5LCB7XHJcbiAgICAgICAgICB2YWx1ZTogY29uc3RhbnQsXHJcbiAgICAgICAgICB3cml0YWJsZTogZmFsc2UsXHJcbiAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgY29uZmlndXJhYmxlOiBmYWxzZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvbnN0IGZuID0gKCh2YWx1ZSkgPT4gdGhpcy5jcmVhdGUoa2V5LCB2YWx1ZSkpO1xyXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBrZXksIHtcclxuICAgICAgICAgIHZhbHVlOiBmbixcclxuICAgICAgICAgIHdyaXRhYmxlOiBmYWxzZSxcclxuICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXHJcbiAgICAgICAgICBjb25maWd1cmFibGU6IGZhbHNlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgY3JlYXRlKHRhZywgdmFsdWUpIHtcclxuICAgIHJldHVybiB2YWx1ZSA9PT0gdm9pZCAwID8geyB0YWcgfSA6IHsgdGFnLCB2YWx1ZSB9O1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IFN1bUNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IFN1bUNvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcclxuICB9XHJcbn07XHJcbnZhciBTdW1CdWlsZGVyID0gU3VtQnVpbGRlckltcGw7XHJcbnZhciBTaW1wbGVTdW1CdWlsZGVySW1wbCA9IGNsYXNzIGV4dGVuZHMgU3VtQnVpbGRlckltcGwge1xyXG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xyXG4gICAgcmV0dXJuIG5ldyBTaW1wbGVTdW1Db2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBwcmltYXJ5S2V5KCkge1xyXG4gICAgcmV0dXJuIG5ldyBTaW1wbGVTdW1Db2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbn07XHJcbnZhciBTaW1wbGVTdW1CdWlsZGVyID0gU2ltcGxlU3VtQnVpbGRlckltcGw7XHJcbnZhciBTY2hlZHVsZUF0QnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoc2NoZWR1bGVfYXRfZGVmYXVsdC5nZXRBbGdlYnJhaWNUeXBlKCkpO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IFNjaGVkdWxlQXRDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIG5hbWUobmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBTY2hlZHVsZUF0Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xyXG4gIH1cclxufTtcclxudmFyIElkZW50aXR5QnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoSWRlbnRpdHkuZ2V0QWxnZWJyYWljVHlwZSgpKTtcclxuICB9XHJcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XHJcbiAgICByZXR1cm4gbmV3IElkZW50aXR5Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgdW5pcXVlKCkge1xyXG4gICAgcmV0dXJuIG5ldyBJZGVudGl0eUNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHByaW1hcnlLZXkoKSB7XHJcbiAgICByZXR1cm4gbmV3IElkZW50aXR5Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGF1dG9JbmMoKSB7XHJcbiAgICByZXR1cm4gbmV3IElkZW50aXR5Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgSWRlbnRpdHlDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIG5hbWUobmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBJZGVudGl0eUNvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcclxuICB9XHJcbn07XHJcbnZhciBDb25uZWN0aW9uSWRCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcihDb25uZWN0aW9uSWQuZ2V0QWxnZWJyYWljVHlwZSgpKTtcclxuICB9XHJcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XHJcbiAgICByZXR1cm4gbmV3IENvbm5lY3Rpb25JZENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHVuaXF1ZSgpIHtcclxuICAgIHJldHVybiBuZXcgQ29ubmVjdGlvbklkQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgcHJpbWFyeUtleSgpIHtcclxuICAgIHJldHVybiBuZXcgQ29ubmVjdGlvbklkQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGF1dG9JbmMoKSB7XHJcbiAgICByZXR1cm4gbmV3IENvbm5lY3Rpb25JZENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IENvbm5lY3Rpb25JZENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IENvbm5lY3Rpb25JZENvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcclxuICB9XHJcbn07XHJcbnZhciBUaW1lc3RhbXBCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcihUaW1lc3RhbXAuZ2V0QWxnZWJyYWljVHlwZSgpKTtcclxuICB9XHJcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XHJcbiAgICByZXR1cm4gbmV3IFRpbWVzdGFtcENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHVuaXF1ZSgpIHtcclxuICAgIHJldHVybiBuZXcgVGltZXN0YW1wQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgcHJpbWFyeUtleSgpIHtcclxuICAgIHJldHVybiBuZXcgVGltZXN0YW1wQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGF1dG9JbmMoKSB7XHJcbiAgICByZXR1cm4gbmV3IFRpbWVzdGFtcENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IFRpbWVzdGFtcENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IFRpbWVzdGFtcENvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcclxuICB9XHJcbn07XHJcbnZhciBUaW1lRHVyYXRpb25CdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcihUaW1lRHVyYXRpb24uZ2V0QWxnZWJyYWljVHlwZSgpKTtcclxuICB9XHJcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XHJcbiAgICByZXR1cm4gbmV3IFRpbWVEdXJhdGlvbkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHVuaXF1ZSgpIHtcclxuICAgIHJldHVybiBuZXcgVGltZUR1cmF0aW9uQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgcHJpbWFyeUtleSgpIHtcclxuICAgIHJldHVybiBuZXcgVGltZUR1cmF0aW9uQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGF1dG9JbmMoKSB7XHJcbiAgICByZXR1cm4gbmV3IFRpbWVEdXJhdGlvbkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IFRpbWVEdXJhdGlvbkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IFRpbWVEdXJhdGlvbkNvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcclxuICB9XHJcbn07XHJcbnZhciBVdWlkQnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoVXVpZC5nZXRBbGdlYnJhaWNUeXBlKCkpO1xyXG4gIH1cclxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcclxuICAgIHJldHVybiBuZXcgVXVpZENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHVuaXF1ZSgpIHtcclxuICAgIHJldHVybiBuZXcgVXVpZENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHByaW1hcnlLZXkoKSB7XHJcbiAgICByZXR1cm4gbmV3IFV1aWRDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgYXV0b0luYygpIHtcclxuICAgIHJldHVybiBuZXcgVXVpZENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IFV1aWRDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIG5hbWUobmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBVdWlkQ29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xyXG4gIH1cclxufTtcclxudmFyIGRlZmF1bHRNZXRhZGF0YSA9IHt9O1xyXG52YXIgQ29sdW1uQnVpbGRlciA9IGNsYXNzIHtcclxuICB0eXBlQnVpbGRlcjtcclxuICBjb2x1bW5NZXRhZGF0YTtcclxuICBjb25zdHJ1Y3Rvcih0eXBlQnVpbGRlciwgbWV0YWRhdGEpIHtcclxuICAgIHRoaXMudHlwZUJ1aWxkZXIgPSB0eXBlQnVpbGRlcjtcclxuICAgIHRoaXMuY29sdW1uTWV0YWRhdGEgPSBtZXRhZGF0YTtcclxuICB9XHJcbiAgc2VyaWFsaXplKHdyaXRlciwgdmFsdWUpIHtcclxuICAgIHRoaXMudHlwZUJ1aWxkZXIuc2VyaWFsaXplKHdyaXRlciwgdmFsdWUpO1xyXG4gIH1cclxuICBkZXNlcmlhbGl6ZShyZWFkZXIpIHtcclxuICAgIHJldHVybiB0aGlzLnR5cGVCdWlsZGVyLmRlc2VyaWFsaXplKHJlYWRlcik7XHJcbiAgfVxyXG59O1xyXG52YXIgVThDb2x1bW5CdWlsZGVyID0gY2xhc3MgX1U4Q29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xyXG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xyXG4gICAgcmV0dXJuIG5ldyBfVThDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgdW5pcXVlKCkge1xyXG4gICAgcmV0dXJuIG5ldyBfVThDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgcHJpbWFyeUtleSgpIHtcclxuICAgIHJldHVybiBuZXcgX1U4Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBhdXRvSW5jKCkge1xyXG4gICAgcmV0dXJuIG5ldyBfVThDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgX1U4Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHtcclxuICAgICAgICBkZWZhdWx0VmFsdWU6IHZhbHVlXHJcbiAgICAgIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgX1U4Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbn07XHJcbnZhciBVMTZDb2x1bW5CdWlsZGVyID0gY2xhc3MgX1UxNkNvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcclxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcclxuICAgIHJldHVybiBuZXcgX1UxNkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICB1bmlxdWUoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9VMTZDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgcHJpbWFyeUtleSgpIHtcclxuICAgIHJldHVybiBuZXcgX1UxNkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgYXV0b0luYygpIHtcclxuICAgIHJldHVybiBuZXcgX1UxNkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgZGVmYXVsdCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBfVTE2Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHtcclxuICAgICAgICBkZWZhdWx0VmFsdWU6IHZhbHVlXHJcbiAgICAgIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgX1UxNkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG59O1xyXG52YXIgVTMyQ29sdW1uQnVpbGRlciA9IGNsYXNzIF9VMzJDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XHJcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XHJcbiAgICByZXR1cm4gbmV3IF9VMzJDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgdW5pcXVlKCkge1xyXG4gICAgcmV0dXJuIG5ldyBfVTMyQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHByaW1hcnlLZXkoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9VMzJDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGF1dG9JbmMoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9VMzJDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgX1UzMkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7XHJcbiAgICAgICAgZGVmYXVsdFZhbHVlOiB2YWx1ZVxyXG4gICAgICB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IF9VMzJDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXHJcbiAgICApO1xyXG4gIH1cclxufTtcclxudmFyIFU2NENvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfVTY0Q29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xyXG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xyXG4gICAgcmV0dXJuIG5ldyBfVTY0Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHVuaXF1ZSgpIHtcclxuICAgIHJldHVybiBuZXcgX1U2NENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBwcmltYXJ5S2V5KCkge1xyXG4gICAgcmV0dXJuIG5ldyBfVTY0Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBhdXRvSW5jKCkge1xyXG4gICAgcmV0dXJuIG5ldyBfVTY0Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IF9VNjRDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwge1xyXG4gICAgICAgIGRlZmF1bHRWYWx1ZTogdmFsdWVcclxuICAgICAgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIG5hbWUobmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBfVTY0Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbn07XHJcbnZhciBVMTI4Q29sdW1uQnVpbGRlciA9IGNsYXNzIF9VMTI4Q29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xyXG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xyXG4gICAgcmV0dXJuIG5ldyBfVTEyOENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICB1bmlxdWUoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9VMTI4Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHByaW1hcnlLZXkoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9VMTI4Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBhdXRvSW5jKCkge1xyXG4gICAgcmV0dXJuIG5ldyBfVTEyOENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgZGVmYXVsdCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBfVTEyOENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7XHJcbiAgICAgICAgZGVmYXVsdFZhbHVlOiB2YWx1ZVxyXG4gICAgICB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IF9VMTI4Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbn07XHJcbnZhciBVMjU2Q29sdW1uQnVpbGRlciA9IGNsYXNzIF9VMjU2Q29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xyXG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xyXG4gICAgcmV0dXJuIG5ldyBfVTI1NkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICB1bmlxdWUoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9VMjU2Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHByaW1hcnlLZXkoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9VMjU2Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBhdXRvSW5jKCkge1xyXG4gICAgcmV0dXJuIG5ldyBfVTI1NkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgZGVmYXVsdCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBfVTI1NkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7XHJcbiAgICAgICAgZGVmYXVsdFZhbHVlOiB2YWx1ZVxyXG4gICAgICB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IF9VMjU2Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbn07XHJcbnZhciBJOENvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfSThDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XHJcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XHJcbiAgICByZXR1cm4gbmV3IF9JOENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICB1bmlxdWUoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9JOENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBwcmltYXJ5S2V5KCkge1xyXG4gICAgcmV0dXJuIG5ldyBfSThDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGF1dG9JbmMoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9JOENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgZGVmYXVsdCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBfSThDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwge1xyXG4gICAgICAgIGRlZmF1bHRWYWx1ZTogdmFsdWVcclxuICAgICAgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIG5hbWUobmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBfSThDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXHJcbiAgICApO1xyXG4gIH1cclxufTtcclxudmFyIEkxNkNvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfSTE2Q29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xyXG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xyXG4gICAgcmV0dXJuIG5ldyBfSTE2Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHVuaXF1ZSgpIHtcclxuICAgIHJldHVybiBuZXcgX0kxNkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBwcmltYXJ5S2V5KCkge1xyXG4gICAgcmV0dXJuIG5ldyBfSTE2Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBhdXRvSW5jKCkge1xyXG4gICAgcmV0dXJuIG5ldyBfSTE2Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IF9JMTZDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwge1xyXG4gICAgICAgIGRlZmF1bHRWYWx1ZTogdmFsdWVcclxuICAgICAgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIG5hbWUobmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBfSTE2Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbn07XHJcbnZhciBJMzJDb2x1bW5CdWlsZGVyID0gY2xhc3MgX0kzMkNvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcclxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcclxuICAgIHJldHVybiBuZXcgX0kzMkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICB1bmlxdWUoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9JMzJDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgcHJpbWFyeUtleSgpIHtcclxuICAgIHJldHVybiBuZXcgX0kzMkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgYXV0b0luYygpIHtcclxuICAgIHJldHVybiBuZXcgX0kzMkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgZGVmYXVsdCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBfSTMyQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHtcclxuICAgICAgICBkZWZhdWx0VmFsdWU6IHZhbHVlXHJcbiAgICAgIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgX0kzMkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG59O1xyXG52YXIgSTY0Q29sdW1uQnVpbGRlciA9IGNsYXNzIF9JNjRDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XHJcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XHJcbiAgICByZXR1cm4gbmV3IF9JNjRDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgdW5pcXVlKCkge1xyXG4gICAgcmV0dXJuIG5ldyBfSTY0Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHByaW1hcnlLZXkoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9JNjRDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGF1dG9JbmMoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9JNjRDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgX0k2NENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7XHJcbiAgICAgICAgZGVmYXVsdFZhbHVlOiB2YWx1ZVxyXG4gICAgICB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IF9JNjRDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXHJcbiAgICApO1xyXG4gIH1cclxufTtcclxudmFyIEkxMjhDb2x1bW5CdWlsZGVyID0gY2xhc3MgX0kxMjhDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XHJcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XHJcbiAgICByZXR1cm4gbmV3IF9JMTI4Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHVuaXF1ZSgpIHtcclxuICAgIHJldHVybiBuZXcgX0kxMjhDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgcHJpbWFyeUtleSgpIHtcclxuICAgIHJldHVybiBuZXcgX0kxMjhDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGF1dG9JbmMoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9JMTI4Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IF9JMTI4Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHtcclxuICAgICAgICBkZWZhdWx0VmFsdWU6IHZhbHVlXHJcbiAgICAgIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgX0kxMjhDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXHJcbiAgICApO1xyXG4gIH1cclxufTtcclxudmFyIEkyNTZDb2x1bW5CdWlsZGVyID0gY2xhc3MgX0kyNTZDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XHJcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XHJcbiAgICByZXR1cm4gbmV3IF9JMjU2Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHVuaXF1ZSgpIHtcclxuICAgIHJldHVybiBuZXcgX0kyNTZDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgcHJpbWFyeUtleSgpIHtcclxuICAgIHJldHVybiBuZXcgX0kyNTZDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGF1dG9JbmMoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9JMjU2Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IF9JMjU2Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHtcclxuICAgICAgICBkZWZhdWx0VmFsdWU6IHZhbHVlXHJcbiAgICAgIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgX0kyNTZDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXHJcbiAgICApO1xyXG4gIH1cclxufTtcclxudmFyIEYzMkNvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfRjMyQ29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgX0YzMkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7XHJcbiAgICAgICAgZGVmYXVsdFZhbHVlOiB2YWx1ZVxyXG4gICAgICB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IF9GMzJDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXHJcbiAgICApO1xyXG4gIH1cclxufTtcclxudmFyIEY2NENvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfRjY0Q29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgX0Y2NENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7XHJcbiAgICAgICAgZGVmYXVsdFZhbHVlOiB2YWx1ZVxyXG4gICAgICB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IF9GNjRDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXHJcbiAgICApO1xyXG4gIH1cclxufTtcclxudmFyIEJvb2xDb2x1bW5CdWlsZGVyID0gY2xhc3MgX0Jvb2xDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XHJcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XHJcbiAgICByZXR1cm4gbmV3IF9Cb29sQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHVuaXF1ZSgpIHtcclxuICAgIHJldHVybiBuZXcgX0Jvb2xDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgcHJpbWFyeUtleSgpIHtcclxuICAgIHJldHVybiBuZXcgX0Jvb2xDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgX0Jvb2xDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwge1xyXG4gICAgICAgIGRlZmF1bHRWYWx1ZTogdmFsdWVcclxuICAgICAgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIG5hbWUobmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBfQm9vbENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG59O1xyXG52YXIgU3RyaW5nQ29sdW1uQnVpbGRlciA9IGNsYXNzIF9TdHJpbmdDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XHJcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XHJcbiAgICByZXR1cm4gbmV3IF9TdHJpbmdDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgdW5pcXVlKCkge1xyXG4gICAgcmV0dXJuIG5ldyBfU3RyaW5nQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHByaW1hcnlLZXkoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9TdHJpbmdDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgX1N0cmluZ0NvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7XHJcbiAgICAgICAgZGVmYXVsdFZhbHVlOiB2YWx1ZVxyXG4gICAgICB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IF9TdHJpbmdDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXHJcbiAgICApO1xyXG4gIH1cclxufTtcclxudmFyIEFycmF5Q29sdW1uQnVpbGRlciA9IGNsYXNzIF9BcnJheUNvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IF9BcnJheUNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7XHJcbiAgICAgICAgZGVmYXVsdFZhbHVlOiB2YWx1ZVxyXG4gICAgICB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IF9BcnJheUNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG59O1xyXG52YXIgQnl0ZUFycmF5Q29sdW1uQnVpbGRlciA9IGNsYXNzIF9CeXRlQXJyYXlDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XHJcbiAgY29uc3RydWN0b3IobWV0YWRhdGEpIHtcclxuICAgIHN1cGVyKG5ldyBUeXBlQnVpbGRlcihBbGdlYnJhaWNUeXBlLkFycmF5KEFsZ2VicmFpY1R5cGUuVTgpKSwgbWV0YWRhdGEpO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IF9CeXRlQXJyYXlDb2x1bW5CdWlsZGVyKFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgX0J5dGVBcnJheUNvbHVtbkJ1aWxkZXIoc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KSk7XHJcbiAgfVxyXG59O1xyXG52YXIgT3B0aW9uQ29sdW1uQnVpbGRlciA9IGNsYXNzIF9PcHRpb25Db2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XHJcbiAgZGVmYXVsdCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBfT3B0aW9uQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHtcclxuICAgICAgICBkZWZhdWx0VmFsdWU6IHZhbHVlXHJcbiAgICAgIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgX09wdGlvbkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG59O1xyXG52YXIgUmVzdWx0Q29sdW1uQnVpbGRlciA9IGNsYXNzIF9SZXN1bHRDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XHJcbiAgY29uc3RydWN0b3IodHlwZUJ1aWxkZXIsIG1ldGFkYXRhKSB7XHJcbiAgICBzdXBlcih0eXBlQnVpbGRlciwgbWV0YWRhdGEpO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IF9SZXN1bHRDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwge1xyXG4gICAgICAgIGRlZmF1bHRWYWx1ZTogdmFsdWVcclxuICAgICAgfSlcclxuICAgICk7XHJcbiAgfVxyXG59O1xyXG52YXIgUHJvZHVjdENvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfUHJvZHVjdENvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IF9Qcm9kdWN0Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IF9Qcm9kdWN0Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbn07XHJcbnZhciBTdW1Db2x1bW5CdWlsZGVyID0gY2xhc3MgX1N1bUNvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IF9TdW1Db2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgX1N1bUNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG59O1xyXG52YXIgU2ltcGxlU3VtQ29sdW1uQnVpbGRlciA9IGNsYXNzIF9TaW1wbGVTdW1Db2x1bW5CdWlsZGVyIGV4dGVuZHMgU3VtQ29sdW1uQnVpbGRlciB7XHJcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XHJcbiAgICByZXR1cm4gbmV3IF9TaW1wbGVTdW1Db2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgcHJpbWFyeUtleSgpIHtcclxuICAgIHJldHVybiBuZXcgX1NpbXBsZVN1bUNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbn07XHJcbnZhciBTY2hlZHVsZUF0Q29sdW1uQnVpbGRlciA9IGNsYXNzIF9TY2hlZHVsZUF0Q29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgX1NjaGVkdWxlQXRDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgX1NjaGVkdWxlQXRDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXHJcbiAgICApO1xyXG4gIH1cclxufTtcclxudmFyIElkZW50aXR5Q29sdW1uQnVpbGRlciA9IGNsYXNzIF9JZGVudGl0eUNvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcclxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcclxuICAgIHJldHVybiBuZXcgX0lkZW50aXR5Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHVuaXF1ZSgpIHtcclxuICAgIHJldHVybiBuZXcgX0lkZW50aXR5Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHByaW1hcnlLZXkoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9JZGVudGl0eUNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgZGVmYXVsdCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBfSWRlbnRpdHlDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgX0lkZW50aXR5Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbn07XHJcbnZhciBDb25uZWN0aW9uSWRDb2x1bW5CdWlsZGVyID0gY2xhc3MgX0Nvbm5lY3Rpb25JZENvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcclxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcclxuICAgIHJldHVybiBuZXcgX0Nvbm5lY3Rpb25JZENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICB1bmlxdWUoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9Db25uZWN0aW9uSWRDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgcHJpbWFyeUtleSgpIHtcclxuICAgIHJldHVybiBuZXcgX0Nvbm5lY3Rpb25JZENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgZGVmYXVsdCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBfQ29ubmVjdGlvbklkQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IF9Db25uZWN0aW9uSWRDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXHJcbiAgICApO1xyXG4gIH1cclxufTtcclxudmFyIFRpbWVzdGFtcENvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfVGltZXN0YW1wQ29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xyXG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xyXG4gICAgcmV0dXJuIG5ldyBfVGltZXN0YW1wQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHVuaXF1ZSgpIHtcclxuICAgIHJldHVybiBuZXcgX1RpbWVzdGFtcENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBwcmltYXJ5S2V5KCkge1xyXG4gICAgcmV0dXJuIG5ldyBfVGltZXN0YW1wQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IF9UaW1lc3RhbXBDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgX1RpbWVzdGFtcENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG59O1xyXG52YXIgVGltZUR1cmF0aW9uQ29sdW1uQnVpbGRlciA9IGNsYXNzIF9UaW1lRHVyYXRpb25Db2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XHJcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XHJcbiAgICByZXR1cm4gbmV3IF9UaW1lRHVyYXRpb25Db2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgdW5pcXVlKCkge1xyXG4gICAgcmV0dXJuIG5ldyBfVGltZUR1cmF0aW9uQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHByaW1hcnlLZXkoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9UaW1lRHVyYXRpb25Db2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgX1RpbWVEdXJhdGlvbkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIG5hbWUobmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBfVGltZUR1cmF0aW9uQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbn07XHJcbnZhciBVdWlkQ29sdW1uQnVpbGRlciA9IGNsYXNzIF9VdWlkQ29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xyXG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xyXG4gICAgcmV0dXJuIG5ldyBfVXVpZENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICB1bmlxdWUoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9VdWlkQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHByaW1hcnlLZXkoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9VdWlkQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IF9VdWlkQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IF9VdWlkQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbn07XHJcbnZhciBSZWZCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XHJcbiAgcmVmO1xyXG4gIC8qKiBUaGUgcGhhbnRvbSB0eXBlIG9mIHRoZSBwb2ludGVlIG9mIHRoaXMgcmVmLiAqL1xyXG4gIF9fc3BhY2V0aW1lVHlwZTtcclxuICBjb25zdHJ1Y3RvcihyZWYpIHtcclxuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuUmVmKHJlZikpO1xyXG4gICAgdGhpcy5yZWYgPSByZWY7XHJcbiAgfVxyXG59O1xyXG52YXIgZW51bUltcGwgPSAoKG5hbWVPck9iaiwgbWF5YmVPYmopID0+IHtcclxuICBsZXQgb2JqID0gbmFtZU9yT2JqO1xyXG4gIGxldCBuYW1lID0gdm9pZCAwO1xyXG4gIGlmICh0eXBlb2YgbmFtZU9yT2JqID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICBpZiAoIW1heWJlT2JqKSB7XHJcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXHJcbiAgICAgICAgXCJXaGVuIHByb3ZpZGluZyBhIG5hbWUsIHlvdSBtdXN0IGFsc28gcHJvdmlkZSB0aGUgdmFyaWFudHMgb2JqZWN0IG9yIGFycmF5LlwiXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgICBvYmogPSBtYXliZU9iajtcclxuICAgIG5hbWUgPSBuYW1lT3JPYmo7XHJcbiAgfVxyXG4gIGlmIChBcnJheS5pc0FycmF5KG9iaikpIHtcclxuICAgIGNvbnN0IHNpbXBsZVZhcmlhbnRzT2JqID0ge307XHJcbiAgICBmb3IgKGNvbnN0IHZhcmlhbnQgb2Ygb2JqKSB7XHJcbiAgICAgIHNpbXBsZVZhcmlhbnRzT2JqW3ZhcmlhbnRdID0gbmV3IFVuaXRCdWlsZGVyKCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbmV3IFNpbXBsZVN1bUJ1aWxkZXJJbXBsKHNpbXBsZVZhcmlhbnRzT2JqLCBuYW1lKTtcclxuICB9XHJcbiAgcmV0dXJuIG5ldyBTdW1CdWlsZGVyKG9iaiwgbmFtZSk7XHJcbn0pO1xyXG52YXIgdCA9IHtcclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IGBCb29sYCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9uc1xyXG4gICAqIFJlcHJlc2VudGVkIGFzIGBib29sZWFuYCBpbiBUeXBlU2NyaXB0LlxyXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBCb29sQnVpbGRlcn0gaW5zdGFuY2VcclxuICAgKi9cclxuICBib29sOiAoKSA9PiBuZXcgQm9vbEJ1aWxkZXIoKSxcclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IGBTdHJpbmdgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zXHJcbiAgICogUmVwcmVzZW50ZWQgYXMgYHN0cmluZ2AgaW4gVHlwZVNjcmlwdC5cclxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgU3RyaW5nQnVpbGRlcn0gaW5zdGFuY2VcclxuICAgKi9cclxuICBzdHJpbmc6ICgpID0+IG5ldyBTdHJpbmdCdWlsZGVyKCksXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBgRjY0YCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9uc1xyXG4gICAqIFJlcHJlc2VudGVkIGFzIGBudW1iZXJgIGluIFR5cGVTY3JpcHQuXHJcbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIEY2NEJ1aWxkZXJ9IGluc3RhbmNlXHJcbiAgICovXHJcbiAgbnVtYmVyOiAoKSA9PiBuZXcgRjY0QnVpbGRlcigpLFxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBuZXcgYEk4YCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9uc1xyXG4gICAqIFJlcHJlc2VudGVkIGFzIGBudW1iZXJgIGluIFR5cGVTY3JpcHQuXHJcbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIEk4QnVpbGRlcn0gaW5zdGFuY2VcclxuICAgKi9cclxuICBpODogKCkgPT4gbmV3IEk4QnVpbGRlcigpLFxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBuZXcgYFU4YCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9uc1xyXG4gICAqIFJlcHJlc2VudGVkIGFzIGBudW1iZXJgIGluIFR5cGVTY3JpcHQuXHJcbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIFU4QnVpbGRlcn0gaW5zdGFuY2VcclxuICAgKi9cclxuICB1ODogKCkgPT4gbmV3IFU4QnVpbGRlcigpLFxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBuZXcgYEkxNmAge0BsaW5rIEFsZ2VicmFpY1R5cGV9IHRvIGJlIHVzZWQgaW4gdGFibGUgZGVmaW5pdGlvbnNcclxuICAgKiBSZXByZXNlbnRlZCBhcyBgbnVtYmVyYCBpbiBUeXBlU2NyaXB0LlxyXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBJMTZCdWlsZGVyfSBpbnN0YW5jZVxyXG4gICAqL1xyXG4gIGkxNjogKCkgPT4gbmV3IEkxNkJ1aWxkZXIoKSxcclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IGBVMTZgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zXHJcbiAgICogUmVwcmVzZW50ZWQgYXMgYG51bWJlcmAgaW4gVHlwZVNjcmlwdC5cclxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgVTE2QnVpbGRlcn0gaW5zdGFuY2VcclxuICAgKi9cclxuICB1MTY6ICgpID0+IG5ldyBVMTZCdWlsZGVyKCksXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBgSTMyYCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9uc1xyXG4gICAqIFJlcHJlc2VudGVkIGFzIGBudW1iZXJgIGluIFR5cGVTY3JpcHQuXHJcbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIEkzMkJ1aWxkZXJ9IGluc3RhbmNlXHJcbiAgICovXHJcbiAgaTMyOiAoKSA9PiBuZXcgSTMyQnVpbGRlcigpLFxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBuZXcgYFUzMmAge0BsaW5rIEFsZ2VicmFpY1R5cGV9IHRvIGJlIHVzZWQgaW4gdGFibGUgZGVmaW5pdGlvbnNcclxuICAgKiBSZXByZXNlbnRlZCBhcyBgbnVtYmVyYCBpbiBUeXBlU2NyaXB0LlxyXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBVMzJCdWlsZGVyfSBpbnN0YW5jZVxyXG4gICAqL1xyXG4gIHUzMjogKCkgPT4gbmV3IFUzMkJ1aWxkZXIoKSxcclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IGBJNjRgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zXHJcbiAgICogUmVwcmVzZW50ZWQgYXMgYGJpZ2ludGAgaW4gVHlwZVNjcmlwdC5cclxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgSTY0QnVpbGRlcn0gaW5zdGFuY2VcclxuICAgKi9cclxuICBpNjQ6ICgpID0+IG5ldyBJNjRCdWlsZGVyKCksXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBgVTY0YCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9uc1xyXG4gICAqIFJlcHJlc2VudGVkIGFzIGBiaWdpbnRgIGluIFR5cGVTY3JpcHQuXHJcbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIFU2NEJ1aWxkZXJ9IGluc3RhbmNlXHJcbiAgICovXHJcbiAgdTY0OiAoKSA9PiBuZXcgVTY0QnVpbGRlcigpLFxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBuZXcgYEkxMjhgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zXHJcbiAgICogUmVwcmVzZW50ZWQgYXMgYGJpZ2ludGAgaW4gVHlwZVNjcmlwdC5cclxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgSTEyOEJ1aWxkZXJ9IGluc3RhbmNlXHJcbiAgICovXHJcbiAgaTEyODogKCkgPT4gbmV3IEkxMjhCdWlsZGVyKCksXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBgVTEyOGAge0BsaW5rIEFsZ2VicmFpY1R5cGV9IHRvIGJlIHVzZWQgaW4gdGFibGUgZGVmaW5pdGlvbnNcclxuICAgKiBSZXByZXNlbnRlZCBhcyBgYmlnaW50YCBpbiBUeXBlU2NyaXB0LlxyXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBVMTI4QnVpbGRlcn0gaW5zdGFuY2VcclxuICAgKi9cclxuICB1MTI4OiAoKSA9PiBuZXcgVTEyOEJ1aWxkZXIoKSxcclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IGBJMjU2YCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9uc1xyXG4gICAqIFJlcHJlc2VudGVkIGFzIGBiaWdpbnRgIGluIFR5cGVTY3JpcHQuXHJcbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIEkyNTZCdWlsZGVyfSBpbnN0YW5jZVxyXG4gICAqL1xyXG4gIGkyNTY6ICgpID0+IG5ldyBJMjU2QnVpbGRlcigpLFxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBuZXcgYFUyNTZgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zXHJcbiAgICogUmVwcmVzZW50ZWQgYXMgYGJpZ2ludGAgaW4gVHlwZVNjcmlwdC5cclxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgVTI1NkJ1aWxkZXJ9IGluc3RhbmNlXHJcbiAgICovXHJcbiAgdTI1NjogKCkgPT4gbmV3IFUyNTZCdWlsZGVyKCksXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBgRjMyYCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9uc1xyXG4gICAqIFJlcHJlc2VudGVkIGFzIGBudW1iZXJgIGluIFR5cGVTY3JpcHQuXHJcbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIEYzMkJ1aWxkZXJ9IGluc3RhbmNlXHJcbiAgICovXHJcbiAgZjMyOiAoKSA9PiBuZXcgRjMyQnVpbGRlcigpLFxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBuZXcgYEY2NGAge0BsaW5rIEFsZ2VicmFpY1R5cGV9IHRvIGJlIHVzZWQgaW4gdGFibGUgZGVmaW5pdGlvbnNcclxuICAgKiBSZXByZXNlbnRlZCBhcyBgbnVtYmVyYCBpbiBUeXBlU2NyaXB0LlxyXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBGNjRCdWlsZGVyfSBpbnN0YW5jZVxyXG4gICAqL1xyXG4gIGY2NDogKCkgPT4gbmV3IEY2NEJ1aWxkZXIoKSxcclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IGBQcm9kdWN0YCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9ucy4gUHJvZHVjdCB0eXBlcyBpbiBTcGFjZXRpbWVEQlxyXG4gICAqIGFyZSBlc3NlbnRpYWxseSB0aGUgc2FtZSBhcyBvYmplY3RzIGluIEphdmFTY3JpcHQvVHlwZVNjcmlwdC5cclxuICAgKiBQcm9wZXJ0aWVzIG9mIHRoZSBvYmplY3QgbXVzdCBhbHNvIGJlIHtAbGluayBUeXBlQnVpbGRlcn1zLlxyXG4gICAqIFJlcHJlc2VudGVkIGFzIGFuIG9iamVjdCB3aXRoIHNwZWNpZmljIHByb3BlcnRpZXMgaW4gVHlwZVNjcmlwdC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBuYW1lIChvcHRpb25hbCkgQSBkaXNwbGF5IG5hbWUgZm9yIHRoZSBwcm9kdWN0IHR5cGUuIElmIG9taXR0ZWQsIGFuIGFub255bW91cyBwcm9kdWN0IHR5cGUgaXMgY3JlYXRlZC5cclxuICAgKiBAcGFyYW0gb2JqIFRoZSBvYmplY3QgZGVmaW5pbmcgdGhlIHByb3BlcnRpZXMgb2YgdGhlIHR5cGUsIHdob3NlIHByb3BlcnR5XHJcbiAgICogdmFsdWVzIG11c3QgYmUge0BsaW5rIFR5cGVCdWlsZGVyfXMuXHJcbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIFByb2R1Y3RCdWlsZGVyfSBpbnN0YW5jZS5cclxuICAgKi9cclxuICBvYmplY3Q6ICgobmFtZU9yT2JqLCBtYXliZU9iaikgPT4ge1xyXG4gICAgaWYgKHR5cGVvZiBuYW1lT3JPYmogPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgaWYgKCFtYXliZU9iaikge1xyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXHJcbiAgICAgICAgICBcIldoZW4gcHJvdmlkaW5nIGEgbmFtZSwgeW91IG11c3QgYWxzbyBwcm92aWRlIHRoZSBvYmplY3QuXCJcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBuZXcgUHJvZHVjdEJ1aWxkZXIobWF5YmVPYmosIG5hbWVPck9iaik7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbmV3IFByb2R1Y3RCdWlsZGVyKG5hbWVPck9iaiwgdm9pZCAwKTtcclxuICB9KSxcclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IGBSb3dgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zLiBSb3cgdHlwZXMgaW4gU3BhY2V0aW1lREJcclxuICAgKiBhcmUgc2ltaWxhciB0byBgUHJvZHVjdGAgdHlwZXMsIGJ1dCBhcmUgc3BlY2lmaWNhbGx5IHVzZWQgdG8gZGVmaW5lIHRoZSBzY2hlbWEgb2YgYSB0YWJsZSByb3cuXHJcbiAgICogUHJvcGVydGllcyBvZiB0aGUgb2JqZWN0IG11c3QgYWxzbyBiZSB7QGxpbmsgVHlwZUJ1aWxkZXJ9IG9yIHtAbGluayBDb2x1bW5CdWlsZGVyfXMuXHJcbiAgICpcclxuICAgKiBZb3UgY2FuIHJlcHJlc2VudCBhIGBSb3dgIGFzIGVpdGhlciBhIHtAbGluayBSb3dPYmp9IG9yIGFuIHtAbGluayBSb3dCdWlsZGVyfSB0eXBlIHdoZW5cclxuICAgKiBkZWZpbmluZyBhIHRhYmxlIHNjaGVtYS5cclxuICAgKlxyXG4gICAqIFRoZSB7QGxpbmsgUm93QnVpbGRlcn0gdHlwZSBpcyB1c2VmdWwgd2hlbiB5b3Ugd2FudCB0byBjcmVhdGUgYSB0eXBlIHdoaWNoIGNhbiBiZSB1c2VkIGFueXdoZXJlXHJcbiAgICogYSB7QGxpbmsgVHlwZUJ1aWxkZXJ9IGlzIGFjY2VwdGVkLCBzdWNoIGFzIGluIG5lc3RlZCBvYmplY3RzIG9yIGFycmF5cywgb3IgYXMgdGhlIGFyZ3VtZW50XHJcbiAgICogdG8gYSBzY2hlZHVsZWQgZnVuY3Rpb24uXHJcbiAgICpcclxuICAgKiBAcGFyYW0gb2JqIFRoZSBvYmplY3QgZGVmaW5pbmcgdGhlIHByb3BlcnRpZXMgb2YgdGhlIHJvdywgd2hvc2UgcHJvcGVydHlcclxuICAgKiB2YWx1ZXMgbXVzdCBiZSB7QGxpbmsgVHlwZUJ1aWxkZXJ9cyBvciB7QGxpbmsgQ29sdW1uQnVpbGRlcn1zLlxyXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBSb3dCdWlsZGVyfSBpbnN0YW5jZVxyXG4gICAqL1xyXG4gIHJvdzogKChuYW1lT3JPYmosIG1heWJlT2JqKSA9PiB7XHJcbiAgICBjb25zdCBbb2JqLCBuYW1lXSA9IHR5cGVvZiBuYW1lT3JPYmogPT09IFwic3RyaW5nXCIgPyBbbWF5YmVPYmosIG5hbWVPck9ial0gOiBbbmFtZU9yT2JqLCB2b2lkIDBdO1xyXG4gICAgcmV0dXJuIG5ldyBSb3dCdWlsZGVyKG9iaiwgbmFtZSk7XHJcbiAgfSksXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBgQXJyYXlgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zLlxyXG4gICAqIFJlcHJlc2VudGVkIGFzIGFuIGFycmF5IGluIFR5cGVTY3JpcHQuXHJcbiAgICogQHBhcmFtIGVsZW1lbnQgVGhlIGVsZW1lbnQgdHlwZSBvZiB0aGUgYXJyYXksIHdoaWNoIG11c3QgYmUgYSBgVHlwZUJ1aWxkZXJgLlxyXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBBcnJheUJ1aWxkZXJ9IGluc3RhbmNlXHJcbiAgICovXHJcbiAgYXJyYXkoZSkge1xyXG4gICAgcmV0dXJuIG5ldyBBcnJheUJ1aWxkZXIoZSk7XHJcbiAgfSxcclxuICBlbnVtOiBlbnVtSW1wbCxcclxuICAvKipcclxuICAgKiBUaGlzIGlzIGEgc3BlY2lhbCBoZWxwZXIgZnVuY3Rpb24gZm9yIGNvbnZlbmllbnRseSBjcmVhdGluZyBgUHJvZHVjdGAgdHlwZSBjb2x1bW5zIHdpdGggbm8gZmllbGRzLlxyXG4gICAqXHJcbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIFByb2R1Y3RCdWlsZGVyfSBpbnN0YW5jZSB3aXRoIG5vIGZpZWxkcy5cclxuICAgKi9cclxuICB1bml0KCkge1xyXG4gICAgcmV0dXJuIG5ldyBVbml0QnVpbGRlcigpO1xyXG4gIH0sXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIGxhemlseS1ldmFsdWF0ZWQge0BsaW5rIFR5cGVCdWlsZGVyfS4gVGhpcyBpcyB1c2VmdWwgZm9yIGNyZWF0aW5nXHJcbiAgICogcmVjdXJzaXZlIHR5cGVzLCBzdWNoIGFzIGEgdHJlZSBvciBsaW5rZWQgbGlzdC5cclxuICAgKiBAcGFyYW0gdGh1bmsgQSBmdW5jdGlvbiB0aGF0IHJldHVybnMgYSB7QGxpbmsgVHlwZUJ1aWxkZXJ9LlxyXG4gICAqIEByZXR1cm5zIEEgcHJveHkge0BsaW5rIFR5cGVCdWlsZGVyfSB0aGF0IGV2YWx1YXRlcyB0aGUgdGh1bmsgb24gZmlyc3QgYWNjZXNzLlxyXG4gICAqL1xyXG4gIGxhenkodGh1bmspIHtcclxuICAgIGxldCBjYWNoZWQgPSBudWxsO1xyXG4gICAgY29uc3QgZ2V0ID0gKCkgPT4gY2FjaGVkID8/PSB0aHVuaygpO1xyXG4gICAgY29uc3QgcHJveHkgPSBuZXcgUHJveHkoe30sIHtcclxuICAgICAgZ2V0KF90LCBwcm9wLCByZWN2KSB7XHJcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gZ2V0KCk7XHJcbiAgICAgICAgY29uc3QgdmFsID0gUmVmbGVjdC5nZXQodGFyZ2V0LCBwcm9wLCByZWN2KTtcclxuICAgICAgICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gXCJmdW5jdGlvblwiID8gdmFsLmJpbmQodGFyZ2V0KSA6IHZhbDtcclxuICAgICAgfSxcclxuICAgICAgc2V0KF90LCBwcm9wLCB2YWx1ZSwgcmVjdikge1xyXG4gICAgICAgIHJldHVybiBSZWZsZWN0LnNldChnZXQoKSwgcHJvcCwgdmFsdWUsIHJlY3YpO1xyXG4gICAgICB9LFxyXG4gICAgICBoYXMoX3QsIHByb3ApIHtcclxuICAgICAgICByZXR1cm4gcHJvcCBpbiBnZXQoKTtcclxuICAgICAgfSxcclxuICAgICAgb3duS2V5cygpIHtcclxuICAgICAgICByZXR1cm4gUmVmbGVjdC5vd25LZXlzKGdldCgpKTtcclxuICAgICAgfSxcclxuICAgICAgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKF90LCBwcm9wKSB7XHJcbiAgICAgICAgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZ2V0KCksIHByb3ApO1xyXG4gICAgICB9LFxyXG4gICAgICBnZXRQcm90b3R5cGVPZigpIHtcclxuICAgICAgICByZXR1cm4gT2JqZWN0LmdldFByb3RvdHlwZU9mKGdldCgpKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gcHJveHk7XHJcbiAgfSxcclxuICAvKipcclxuICAgKiBUaGlzIGlzIGEgc3BlY2lhbCBoZWxwZXIgZnVuY3Rpb24gZm9yIGNvbnZlbmllbnRseSBjcmVhdGluZyB7QGxpbmsgU2NoZWR1bGVBdH0gdHlwZSBjb2x1bW5zLlxyXG4gICAqIEByZXR1cm5zIEEgbmV3IENvbHVtbkJ1aWxkZXIgaW5zdGFuY2Ugd2l0aCB0aGUge0BsaW5rIFNjaGVkdWxlQXR9IHR5cGUuXHJcbiAgICovXHJcbiAgc2NoZWR1bGVBdDogKCkgPT4ge1xyXG4gICAgcmV0dXJuIG5ldyBTY2hlZHVsZUF0QnVpbGRlcigpO1xyXG4gIH0sXHJcbiAgLyoqXHJcbiAgICogVGhpcyBpcyBhIGNvbnZlbmllbmNlIG1ldGhvZCBmb3IgY3JlYXRpbmcgYSBjb2x1bW4gd2l0aCB0aGUge0BsaW5rIE9wdGlvbn0gdHlwZS5cclxuICAgKiBZb3UgY2FuIGNyZWF0ZSBhIGNvbHVtbiBvZiB0aGUgc2FtZSB0eXBlIGJ5IGNvbnN0cnVjdGluZyBhbiBlbnVtIHdpdGggYSBgc29tZWAgYW5kIGBub25lYCB2YXJpYW50LlxyXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgdHlwZSBvZiB0aGUgdmFsdWUgY29udGFpbmVkIGluIHRoZSBgc29tZWAgdmFyaWFudCBvZiB0aGUgYE9wdGlvbmAuXHJcbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIE9wdGlvbkJ1aWxkZXJ9IGluc3RhbmNlIHdpdGggdGhlIHtAbGluayBPcHRpb259IHR5cGUuXHJcbiAgICovXHJcbiAgb3B0aW9uKHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IE9wdGlvbkJ1aWxkZXIodmFsdWUpO1xyXG4gIH0sXHJcbiAgLyoqXHJcbiAgICogVGhpcyBpcyBhIGNvbnZlbmllbmNlIG1ldGhvZCBmb3IgY3JlYXRpbmcgYSBjb2x1bW4gd2l0aCB0aGUge0BsaW5rIFJlc3VsdH0gdHlwZS5cclxuICAgKiBZb3UgY2FuIGNyZWF0ZSBhIGNvbHVtbiBvZiB0aGUgc2FtZSB0eXBlIGJ5IGNvbnN0cnVjdGluZyBhbiBlbnVtIHdpdGggYW4gYG9rYCBhbmQgYGVycmAgdmFyaWFudC5cclxuICAgKiBAcGFyYW0gb2sgVGhlIHR5cGUgb2YgdGhlIHZhbHVlIGNvbnRhaW5lZCBpbiB0aGUgYG9rYCB2YXJpYW50IG9mIHRoZSBgUmVzdWx0YC5cclxuICAgKiBAcGFyYW0gZXJyIFRoZSB0eXBlIG9mIHRoZSB2YWx1ZSBjb250YWluZWQgaW4gdGhlIGBlcnJgIHZhcmlhbnQgb2YgdGhlIGBSZXN1bHRgLlxyXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBSZXN1bHRCdWlsZGVyfSBpbnN0YW5jZSB3aXRoIHRoZSB7QGxpbmsgUmVzdWx0fSB0eXBlLlxyXG4gICAqL1xyXG4gIHJlc3VsdChvaywgZXJyKSB7XHJcbiAgICByZXR1cm4gbmV3IFJlc3VsdEJ1aWxkZXIob2ssIGVycik7XHJcbiAgfSxcclxuICAvKipcclxuICAgKiBUaGlzIGlzIGEgY29udmVuaWVuY2UgbWV0aG9kIGZvciBjcmVhdGluZyBhIGNvbHVtbiB3aXRoIHRoZSB7QGxpbmsgSWRlbnRpdHl9IHR5cGUuXHJcbiAgICogWW91IGNhbiBjcmVhdGUgYSBjb2x1bW4gb2YgdGhlIHNhbWUgdHlwZSBieSBjb25zdHJ1Y3RpbmcgYW4gYG9iamVjdGAgd2l0aCBhIHNpbmdsZSBgX19pZGVudGl0eV9fYCBlbGVtZW50LlxyXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBUeXBlQnVpbGRlcn0gaW5zdGFuY2Ugd2l0aCB0aGUge0BsaW5rIElkZW50aXR5fSB0eXBlLlxyXG4gICAqL1xyXG4gIGlkZW50aXR5OiAoKSA9PiB7XHJcbiAgICByZXR1cm4gbmV3IElkZW50aXR5QnVpbGRlcigpO1xyXG4gIH0sXHJcbiAgLyoqXHJcbiAgICogVGhpcyBpcyBhIGNvbnZlbmllbmNlIG1ldGhvZCBmb3IgY3JlYXRpbmcgYSBjb2x1bW4gd2l0aCB0aGUge0BsaW5rIENvbm5lY3Rpb25JZH0gdHlwZS5cclxuICAgKiBZb3UgY2FuIGNyZWF0ZSBhIGNvbHVtbiBvZiB0aGUgc2FtZSB0eXBlIGJ5IGNvbnN0cnVjdGluZyBhbiBgb2JqZWN0YCB3aXRoIGEgc2luZ2xlIGBfX2Nvbm5lY3Rpb25faWRfX2AgZWxlbWVudC5cclxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgVHlwZUJ1aWxkZXJ9IGluc3RhbmNlIHdpdGggdGhlIHtAbGluayBDb25uZWN0aW9uSWR9IHR5cGUuXHJcbiAgICovXHJcbiAgY29ubmVjdGlvbklkOiAoKSA9PiB7XHJcbiAgICByZXR1cm4gbmV3IENvbm5lY3Rpb25JZEJ1aWxkZXIoKTtcclxuICB9LFxyXG4gIC8qKlxyXG4gICAqIFRoaXMgaXMgYSBjb252ZW5pZW5jZSBtZXRob2QgZm9yIGNyZWF0aW5nIGEgY29sdW1uIHdpdGggdGhlIHtAbGluayBUaW1lc3RhbXB9IHR5cGUuXHJcbiAgICogWW91IGNhbiBjcmVhdGUgYSBjb2x1bW4gb2YgdGhlIHNhbWUgdHlwZSBieSBjb25zdHJ1Y3RpbmcgYW4gYG9iamVjdGAgd2l0aCBhIHNpbmdsZSBgX190aW1lc3RhbXBfbWljcm9zX3NpbmNlX3VuaXhfZXBvY2hfX2AgZWxlbWVudC5cclxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgVHlwZUJ1aWxkZXJ9IGluc3RhbmNlIHdpdGggdGhlIHtAbGluayBUaW1lc3RhbXB9IHR5cGUuXHJcbiAgICovXHJcbiAgdGltZXN0YW1wOiAoKSA9PiB7XHJcbiAgICByZXR1cm4gbmV3IFRpbWVzdGFtcEJ1aWxkZXIoKTtcclxuICB9LFxyXG4gIC8qKlxyXG4gICAqIFRoaXMgaXMgYSBjb252ZW5pZW5jZSBtZXRob2QgZm9yIGNyZWF0aW5nIGEgY29sdW1uIHdpdGggdGhlIHtAbGluayBUaW1lRHVyYXRpb259IHR5cGUuXHJcbiAgICogWW91IGNhbiBjcmVhdGUgYSBjb2x1bW4gb2YgdGhlIHNhbWUgdHlwZSBieSBjb25zdHJ1Y3RpbmcgYW4gYG9iamVjdGAgd2l0aCBhIHNpbmdsZSBgX190aW1lX2R1cmF0aW9uX21pY3Jvc19fYCBlbGVtZW50LlxyXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBUeXBlQnVpbGRlcn0gaW5zdGFuY2Ugd2l0aCB0aGUge0BsaW5rIFRpbWVEdXJhdGlvbn0gdHlwZS5cclxuICAgKi9cclxuICB0aW1lRHVyYXRpb246ICgpID0+IHtcclxuICAgIHJldHVybiBuZXcgVGltZUR1cmF0aW9uQnVpbGRlcigpO1xyXG4gIH0sXHJcbiAgLyoqXHJcbiAgICogVGhpcyBpcyBhIGNvbnZlbmllbmNlIG1ldGhvZCBmb3IgY3JlYXRpbmcgYSBjb2x1bW4gd2l0aCB0aGUge0BsaW5rIFV1aWR9IHR5cGUuXHJcbiAgICogWW91IGNhbiBjcmVhdGUgYSBjb2x1bW4gb2YgdGhlIHNhbWUgdHlwZSBieSBjb25zdHJ1Y3RpbmcgYW4gYG9iamVjdGAgd2l0aCBhIHNpbmdsZSBgX191dWlkX19gIGVsZW1lbnQuXHJcbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIFR5cGVCdWlsZGVyfSBpbnN0YW5jZSB3aXRoIHRoZSB7QGxpbmsgVXVpZH0gdHlwZS5cclxuICAgKi9cclxuICB1dWlkOiAoKSA9PiB7XHJcbiAgICByZXR1cm4gbmV3IFV1aWRCdWlsZGVyKCk7XHJcbiAgfSxcclxuICAvKipcclxuICAgKiBUaGlzIGlzIGEgY29udmVuaWVuY2UgbWV0aG9kIGZvciBjcmVhdGluZyBhIGNvbHVtbiB3aXRoIHRoZSBgQnl0ZUFycmF5YCB0eXBlLlxyXG4gICAqIFlvdSBjYW4gY3JlYXRlIGEgY29sdW1uIG9mIHRoZSBzYW1lIHR5cGUgYnkgY29uc3RydWN0aW5nIGFuIGBhcnJheWAgb2YgYHU4YC5cclxuICAgKiBUaGUgVHlwZVNjcmlwdCByZXByZXNlbnRhdGlvbiBpcyB7QGxpbmsgVWludDhBcnJheX0uXHJcbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIEJ5dGVBcnJheUJ1aWxkZXJ9IGluc3RhbmNlIHdpdGggdGhlIGBCeXRlQXJyYXlgIHR5cGUuXHJcbiAgICovXHJcbiAgYnl0ZUFycmF5OiAoKSA9PiB7XHJcbiAgICByZXR1cm4gbmV3IEJ5dGVBcnJheUJ1aWxkZXIoKTtcclxuICB9XHJcbn07XHJcblxyXG4vLyBzcmMvbGliL2F1dG9nZW4vdHlwZXMudHNcclxudmFyIEFsZ2VicmFpY1R5cGUyID0gdC5lbnVtKFwiQWxnZWJyYWljVHlwZVwiLCB7XHJcbiAgUmVmOiB0LnUzMigpLFxyXG4gIGdldCBTdW0oKSB7XHJcbiAgICByZXR1cm4gU3VtVHlwZTI7XHJcbiAgfSxcclxuICBnZXQgUHJvZHVjdCgpIHtcclxuICAgIHJldHVybiBQcm9kdWN0VHlwZTI7XHJcbiAgfSxcclxuICBnZXQgQXJyYXkoKSB7XHJcbiAgICByZXR1cm4gQWxnZWJyYWljVHlwZTI7XHJcbiAgfSxcclxuICBTdHJpbmc6IHQudW5pdCgpLFxyXG4gIEJvb2w6IHQudW5pdCgpLFxyXG4gIEk4OiB0LnVuaXQoKSxcclxuICBVODogdC51bml0KCksXHJcbiAgSTE2OiB0LnVuaXQoKSxcclxuICBVMTY6IHQudW5pdCgpLFxyXG4gIEkzMjogdC51bml0KCksXHJcbiAgVTMyOiB0LnVuaXQoKSxcclxuICBJNjQ6IHQudW5pdCgpLFxyXG4gIFU2NDogdC51bml0KCksXHJcbiAgSTEyODogdC51bml0KCksXHJcbiAgVTEyODogdC51bml0KCksXHJcbiAgSTI1NjogdC51bml0KCksXHJcbiAgVTI1NjogdC51bml0KCksXHJcbiAgRjMyOiB0LnVuaXQoKSxcclxuICBGNjQ6IHQudW5pdCgpXHJcbn0pO1xyXG52YXIgQ2FzZUNvbnZlcnNpb25Qb2xpY3kgPSB0LmVudW0oXCJDYXNlQ29udmVyc2lvblBvbGljeVwiLCB7XHJcbiAgTm9uZTogdC51bml0KCksXHJcbiAgU25ha2VDYXNlOiB0LnVuaXQoKVxyXG59KTtcclxudmFyIEV4cGxpY2l0TmFtZUVudHJ5ID0gdC5lbnVtKFwiRXhwbGljaXROYW1lRW50cnlcIiwge1xyXG4gIGdldCBUYWJsZSgpIHtcclxuICAgIHJldHVybiBOYW1lTWFwcGluZztcclxuICB9LFxyXG4gIGdldCBGdW5jdGlvbigpIHtcclxuICAgIHJldHVybiBOYW1lTWFwcGluZztcclxuICB9LFxyXG4gIGdldCBJbmRleCgpIHtcclxuICAgIHJldHVybiBOYW1lTWFwcGluZztcclxuICB9XHJcbn0pO1xyXG52YXIgRXhwbGljaXROYW1lcyA9IHQub2JqZWN0KFwiRXhwbGljaXROYW1lc1wiLCB7XHJcbiAgZ2V0IGVudHJpZXMoKSB7XHJcbiAgICByZXR1cm4gdC5hcnJheShFeHBsaWNpdE5hbWVFbnRyeSk7XHJcbiAgfVxyXG59KTtcclxudmFyIEZ1bmN0aW9uVmlzaWJpbGl0eSA9IHQuZW51bShcIkZ1bmN0aW9uVmlzaWJpbGl0eVwiLCB7XHJcbiAgUHJpdmF0ZTogdC51bml0KCksXHJcbiAgQ2xpZW50Q2FsbGFibGU6IHQudW5pdCgpXHJcbn0pO1xyXG52YXIgSHR0cEhlYWRlclBhaXIgPSB0Lm9iamVjdChcIkh0dHBIZWFkZXJQYWlyXCIsIHtcclxuICBuYW1lOiB0LnN0cmluZygpLFxyXG4gIHZhbHVlOiB0LmJ5dGVBcnJheSgpXHJcbn0pO1xyXG52YXIgSHR0cEhlYWRlcnMgPSB0Lm9iamVjdChcIkh0dHBIZWFkZXJzXCIsIHtcclxuICBnZXQgZW50cmllcygpIHtcclxuICAgIHJldHVybiB0LmFycmF5KEh0dHBIZWFkZXJQYWlyKTtcclxuICB9XHJcbn0pO1xyXG52YXIgSHR0cE1ldGhvZCA9IHQuZW51bShcIkh0dHBNZXRob2RcIiwge1xyXG4gIEdldDogdC51bml0KCksXHJcbiAgSGVhZDogdC51bml0KCksXHJcbiAgUG9zdDogdC51bml0KCksXHJcbiAgUHV0OiB0LnVuaXQoKSxcclxuICBEZWxldGU6IHQudW5pdCgpLFxyXG4gIENvbm5lY3Q6IHQudW5pdCgpLFxyXG4gIE9wdGlvbnM6IHQudW5pdCgpLFxyXG4gIFRyYWNlOiB0LnVuaXQoKSxcclxuICBQYXRjaDogdC51bml0KCksXHJcbiAgRXh0ZW5zaW9uOiB0LnN0cmluZygpXHJcbn0pO1xyXG52YXIgSHR0cFJlcXVlc3QgPSB0Lm9iamVjdChcIkh0dHBSZXF1ZXN0XCIsIHtcclxuICBnZXQgbWV0aG9kKCkge1xyXG4gICAgcmV0dXJuIEh0dHBNZXRob2Q7XHJcbiAgfSxcclxuICBnZXQgaGVhZGVycygpIHtcclxuICAgIHJldHVybiBIdHRwSGVhZGVycztcclxuICB9LFxyXG4gIHRpbWVvdXQ6IHQub3B0aW9uKHQudGltZUR1cmF0aW9uKCkpLFxyXG4gIHVyaTogdC5zdHJpbmcoKSxcclxuICBnZXQgdmVyc2lvbigpIHtcclxuICAgIHJldHVybiBIdHRwVmVyc2lvbjtcclxuICB9XHJcbn0pO1xyXG52YXIgSHR0cFJlc3BvbnNlID0gdC5vYmplY3QoXCJIdHRwUmVzcG9uc2VcIiwge1xyXG4gIGdldCBoZWFkZXJzKCkge1xyXG4gICAgcmV0dXJuIEh0dHBIZWFkZXJzO1xyXG4gIH0sXHJcbiAgZ2V0IHZlcnNpb24oKSB7XHJcbiAgICByZXR1cm4gSHR0cFZlcnNpb247XHJcbiAgfSxcclxuICBjb2RlOiB0LnUxNigpXHJcbn0pO1xyXG52YXIgSHR0cFZlcnNpb24gPSB0LmVudW0oXCJIdHRwVmVyc2lvblwiLCB7XHJcbiAgSHR0cDA5OiB0LnVuaXQoKSxcclxuICBIdHRwMTA6IHQudW5pdCgpLFxyXG4gIEh0dHAxMTogdC51bml0KCksXHJcbiAgSHR0cDI6IHQudW5pdCgpLFxyXG4gIEh0dHAzOiB0LnVuaXQoKVxyXG59KTtcclxudmFyIEluZGV4VHlwZSA9IHQuZW51bShcIkluZGV4VHlwZVwiLCB7XHJcbiAgQlRyZWU6IHQudW5pdCgpLFxyXG4gIEhhc2g6IHQudW5pdCgpXHJcbn0pO1xyXG52YXIgTGlmZWN5Y2xlID0gdC5lbnVtKFwiTGlmZWN5Y2xlXCIsIHtcclxuICBJbml0OiB0LnVuaXQoKSxcclxuICBPbkNvbm5lY3Q6IHQudW5pdCgpLFxyXG4gIE9uRGlzY29ubmVjdDogdC51bml0KClcclxufSk7XHJcbnZhciBNaXNjTW9kdWxlRXhwb3J0ID0gdC5lbnVtKFwiTWlzY01vZHVsZUV4cG9ydFwiLCB7XHJcbiAgZ2V0IFR5cGVBbGlhcygpIHtcclxuICAgIHJldHVybiBUeXBlQWxpYXM7XHJcbiAgfVxyXG59KTtcclxudmFyIE5hbWVNYXBwaW5nID0gdC5vYmplY3QoXCJOYW1lTWFwcGluZ1wiLCB7XHJcbiAgc291cmNlTmFtZTogdC5zdHJpbmcoKSxcclxuICBjYW5vbmljYWxOYW1lOiB0LnN0cmluZygpXHJcbn0pO1xyXG52YXIgUHJvZHVjdFR5cGUyID0gdC5vYmplY3QoXCJQcm9kdWN0VHlwZVwiLCB7XHJcbiAgZ2V0IGVsZW1lbnRzKCkge1xyXG4gICAgcmV0dXJuIHQuYXJyYXkoUHJvZHVjdFR5cGVFbGVtZW50KTtcclxuICB9XHJcbn0pO1xyXG52YXIgUHJvZHVjdFR5cGVFbGVtZW50ID0gdC5vYmplY3QoXCJQcm9kdWN0VHlwZUVsZW1lbnRcIiwge1xyXG4gIG5hbWU6IHQub3B0aW9uKHQuc3RyaW5nKCkpLFxyXG4gIGdldCBhbGdlYnJhaWNUeXBlKCkge1xyXG4gICAgcmV0dXJuIEFsZ2VicmFpY1R5cGUyO1xyXG4gIH1cclxufSk7XHJcbnZhciBSYXdDb2x1bW5EZWZWOCA9IHQub2JqZWN0KFwiUmF3Q29sdW1uRGVmVjhcIiwge1xyXG4gIGNvbE5hbWU6IHQuc3RyaW5nKCksXHJcbiAgZ2V0IGNvbFR5cGUoKSB7XHJcbiAgICByZXR1cm4gQWxnZWJyYWljVHlwZTI7XHJcbiAgfVxyXG59KTtcclxudmFyIFJhd0NvbHVtbkRlZmF1bHRWYWx1ZVYxMCA9IHQub2JqZWN0KFwiUmF3Q29sdW1uRGVmYXVsdFZhbHVlVjEwXCIsIHtcclxuICBjb2xJZDogdC51MTYoKSxcclxuICB2YWx1ZTogdC5ieXRlQXJyYXkoKVxyXG59KTtcclxudmFyIFJhd0NvbHVtbkRlZmF1bHRWYWx1ZVY5ID0gdC5vYmplY3QoXCJSYXdDb2x1bW5EZWZhdWx0VmFsdWVWOVwiLCB7XHJcbiAgdGFibGU6IHQuc3RyaW5nKCksXHJcbiAgY29sSWQ6IHQudTE2KCksXHJcbiAgdmFsdWU6IHQuYnl0ZUFycmF5KClcclxufSk7XHJcbnZhciBSYXdDb25zdHJhaW50RGF0YVY5ID0gdC5lbnVtKFwiUmF3Q29uc3RyYWludERhdGFWOVwiLCB7XHJcbiAgZ2V0IFVuaXF1ZSgpIHtcclxuICAgIHJldHVybiBSYXdVbmlxdWVDb25zdHJhaW50RGF0YVY5O1xyXG4gIH1cclxufSk7XHJcbnZhciBSYXdDb25zdHJhaW50RGVmVjEwID0gdC5vYmplY3QoXCJSYXdDb25zdHJhaW50RGVmVjEwXCIsIHtcclxuICBzb3VyY2VOYW1lOiB0Lm9wdGlvbih0LnN0cmluZygpKSxcclxuICBnZXQgZGF0YSgpIHtcclxuICAgIHJldHVybiBSYXdDb25zdHJhaW50RGF0YVY5O1xyXG4gIH1cclxufSk7XHJcbnZhciBSYXdDb25zdHJhaW50RGVmVjggPSB0Lm9iamVjdChcIlJhd0NvbnN0cmFpbnREZWZWOFwiLCB7XHJcbiAgY29uc3RyYWludE5hbWU6IHQuc3RyaW5nKCksXHJcbiAgY29uc3RyYWludHM6IHQudTgoKSxcclxuICBjb2x1bW5zOiB0LmFycmF5KHQudTE2KCkpXHJcbn0pO1xyXG52YXIgUmF3Q29uc3RyYWludERlZlY5ID0gdC5vYmplY3QoXCJSYXdDb25zdHJhaW50RGVmVjlcIiwge1xyXG4gIG5hbWU6IHQub3B0aW9uKHQuc3RyaW5nKCkpLFxyXG4gIGdldCBkYXRhKCkge1xyXG4gICAgcmV0dXJuIFJhd0NvbnN0cmFpbnREYXRhVjk7XHJcbiAgfVxyXG59KTtcclxudmFyIFJhd0luZGV4QWxnb3JpdGhtID0gdC5lbnVtKFwiUmF3SW5kZXhBbGdvcml0aG1cIiwge1xyXG4gIEJUcmVlOiB0LmFycmF5KHQudTE2KCkpLFxyXG4gIEhhc2g6IHQuYXJyYXkodC51MTYoKSksXHJcbiAgRGlyZWN0OiB0LnUxNigpXHJcbn0pO1xyXG52YXIgUmF3SW5kZXhEZWZWMTAgPSB0Lm9iamVjdChcIlJhd0luZGV4RGVmVjEwXCIsIHtcclxuICBzb3VyY2VOYW1lOiB0Lm9wdGlvbih0LnN0cmluZygpKSxcclxuICBhY2Nlc3Nvck5hbWU6IHQub3B0aW9uKHQuc3RyaW5nKCkpLFxyXG4gIGdldCBhbGdvcml0aG0oKSB7XHJcbiAgICByZXR1cm4gUmF3SW5kZXhBbGdvcml0aG07XHJcbiAgfVxyXG59KTtcclxudmFyIFJhd0luZGV4RGVmVjggPSB0Lm9iamVjdChcIlJhd0luZGV4RGVmVjhcIiwge1xyXG4gIGluZGV4TmFtZTogdC5zdHJpbmcoKSxcclxuICBpc1VuaXF1ZTogdC5ib29sKCksXHJcbiAgZ2V0IGluZGV4VHlwZSgpIHtcclxuICAgIHJldHVybiBJbmRleFR5cGU7XHJcbiAgfSxcclxuICBjb2x1bW5zOiB0LmFycmF5KHQudTE2KCkpXHJcbn0pO1xyXG52YXIgUmF3SW5kZXhEZWZWOSA9IHQub2JqZWN0KFwiUmF3SW5kZXhEZWZWOVwiLCB7XHJcbiAgbmFtZTogdC5vcHRpb24odC5zdHJpbmcoKSksXHJcbiAgYWNjZXNzb3JOYW1lOiB0Lm9wdGlvbih0LnN0cmluZygpKSxcclxuICBnZXQgYWxnb3JpdGhtKCkge1xyXG4gICAgcmV0dXJuIFJhd0luZGV4QWxnb3JpdGhtO1xyXG4gIH1cclxufSk7XHJcbnZhciBSYXdMaWZlQ3ljbGVSZWR1Y2VyRGVmVjEwID0gdC5vYmplY3QoXHJcbiAgXCJSYXdMaWZlQ3ljbGVSZWR1Y2VyRGVmVjEwXCIsXHJcbiAge1xyXG4gICAgZ2V0IGxpZmVjeWNsZVNwZWMoKSB7XHJcbiAgICAgIHJldHVybiBMaWZlY3ljbGU7XHJcbiAgICB9LFxyXG4gICAgZnVuY3Rpb25OYW1lOiB0LnN0cmluZygpXHJcbiAgfVxyXG4pO1xyXG52YXIgUmF3TWlzY01vZHVsZUV4cG9ydFY5ID0gdC5lbnVtKFwiUmF3TWlzY01vZHVsZUV4cG9ydFY5XCIsIHtcclxuICBnZXQgQ29sdW1uRGVmYXVsdFZhbHVlKCkge1xyXG4gICAgcmV0dXJuIFJhd0NvbHVtbkRlZmF1bHRWYWx1ZVY5O1xyXG4gIH0sXHJcbiAgZ2V0IFByb2NlZHVyZSgpIHtcclxuICAgIHJldHVybiBSYXdQcm9jZWR1cmVEZWZWOTtcclxuICB9LFxyXG4gIGdldCBWaWV3KCkge1xyXG4gICAgcmV0dXJuIFJhd1ZpZXdEZWZWOTtcclxuICB9XHJcbn0pO1xyXG52YXIgUmF3TW9kdWxlRGVmID0gdC5lbnVtKFwiUmF3TW9kdWxlRGVmXCIsIHtcclxuICBnZXQgVjhCYWNrQ29tcGF0KCkge1xyXG4gICAgcmV0dXJuIFJhd01vZHVsZURlZlY4O1xyXG4gIH0sXHJcbiAgZ2V0IFY5KCkge1xyXG4gICAgcmV0dXJuIFJhd01vZHVsZURlZlY5O1xyXG4gIH0sXHJcbiAgZ2V0IFYxMCgpIHtcclxuICAgIHJldHVybiBSYXdNb2R1bGVEZWZWMTA7XHJcbiAgfVxyXG59KTtcclxudmFyIFJhd01vZHVsZURlZlYxMCA9IHQub2JqZWN0KFwiUmF3TW9kdWxlRGVmVjEwXCIsIHtcclxuICBnZXQgc2VjdGlvbnMoKSB7XHJcbiAgICByZXR1cm4gdC5hcnJheShSYXdNb2R1bGVEZWZWMTBTZWN0aW9uKTtcclxuICB9XHJcbn0pO1xyXG52YXIgUmF3TW9kdWxlRGVmVjEwU2VjdGlvbiA9IHQuZW51bShcIlJhd01vZHVsZURlZlYxMFNlY3Rpb25cIiwge1xyXG4gIGdldCBUeXBlc3BhY2UoKSB7XHJcbiAgICByZXR1cm4gVHlwZXNwYWNlO1xyXG4gIH0sXHJcbiAgZ2V0IFR5cGVzKCkge1xyXG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3VHlwZURlZlYxMCk7XHJcbiAgfSxcclxuICBnZXQgVGFibGVzKCkge1xyXG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3VGFibGVEZWZWMTApO1xyXG4gIH0sXHJcbiAgZ2V0IFJlZHVjZXJzKCkge1xyXG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3UmVkdWNlckRlZlYxMCk7XHJcbiAgfSxcclxuICBnZXQgUHJvY2VkdXJlcygpIHtcclxuICAgIHJldHVybiB0LmFycmF5KFJhd1Byb2NlZHVyZURlZlYxMCk7XHJcbiAgfSxcclxuICBnZXQgVmlld3MoKSB7XHJcbiAgICByZXR1cm4gdC5hcnJheShSYXdWaWV3RGVmVjEwKTtcclxuICB9LFxyXG4gIGdldCBTY2hlZHVsZXMoKSB7XHJcbiAgICByZXR1cm4gdC5hcnJheShSYXdTY2hlZHVsZURlZlYxMCk7XHJcbiAgfSxcclxuICBnZXQgTGlmZUN5Y2xlUmVkdWNlcnMoKSB7XHJcbiAgICByZXR1cm4gdC5hcnJheShSYXdMaWZlQ3ljbGVSZWR1Y2VyRGVmVjEwKTtcclxuICB9LFxyXG4gIGdldCBSb3dMZXZlbFNlY3VyaXR5KCkge1xyXG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3Um93TGV2ZWxTZWN1cml0eURlZlY5KTtcclxuICB9LFxyXG4gIGdldCBDYXNlQ29udmVyc2lvblBvbGljeSgpIHtcclxuICAgIHJldHVybiBDYXNlQ29udmVyc2lvblBvbGljeTtcclxuICB9LFxyXG4gIGdldCBFeHBsaWNpdE5hbWVzKCkge1xyXG4gICAgcmV0dXJuIEV4cGxpY2l0TmFtZXM7XHJcbiAgfVxyXG59KTtcclxudmFyIFJhd01vZHVsZURlZlY4ID0gdC5vYmplY3QoXCJSYXdNb2R1bGVEZWZWOFwiLCB7XHJcbiAgZ2V0IHR5cGVzcGFjZSgpIHtcclxuICAgIHJldHVybiBUeXBlc3BhY2U7XHJcbiAgfSxcclxuICBnZXQgdGFibGVzKCkge1xyXG4gICAgcmV0dXJuIHQuYXJyYXkoVGFibGVEZXNjKTtcclxuICB9LFxyXG4gIGdldCByZWR1Y2VycygpIHtcclxuICAgIHJldHVybiB0LmFycmF5KFJlZHVjZXJEZWYpO1xyXG4gIH0sXHJcbiAgZ2V0IG1pc2NFeHBvcnRzKCkge1xyXG4gICAgcmV0dXJuIHQuYXJyYXkoTWlzY01vZHVsZUV4cG9ydCk7XHJcbiAgfVxyXG59KTtcclxudmFyIFJhd01vZHVsZURlZlY5ID0gdC5vYmplY3QoXCJSYXdNb2R1bGVEZWZWOVwiLCB7XHJcbiAgZ2V0IHR5cGVzcGFjZSgpIHtcclxuICAgIHJldHVybiBUeXBlc3BhY2U7XHJcbiAgfSxcclxuICBnZXQgdGFibGVzKCkge1xyXG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3VGFibGVEZWZWOSk7XHJcbiAgfSxcclxuICBnZXQgcmVkdWNlcnMoKSB7XHJcbiAgICByZXR1cm4gdC5hcnJheShSYXdSZWR1Y2VyRGVmVjkpO1xyXG4gIH0sXHJcbiAgZ2V0IHR5cGVzKCkge1xyXG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3VHlwZURlZlY5KTtcclxuICB9LFxyXG4gIGdldCBtaXNjRXhwb3J0cygpIHtcclxuICAgIHJldHVybiB0LmFycmF5KFJhd01pc2NNb2R1bGVFeHBvcnRWOSk7XHJcbiAgfSxcclxuICBnZXQgcm93TGV2ZWxTZWN1cml0eSgpIHtcclxuICAgIHJldHVybiB0LmFycmF5KFJhd1Jvd0xldmVsU2VjdXJpdHlEZWZWOSk7XHJcbiAgfVxyXG59KTtcclxudmFyIFJhd1Byb2NlZHVyZURlZlYxMCA9IHQub2JqZWN0KFwiUmF3UHJvY2VkdXJlRGVmVjEwXCIsIHtcclxuICBzb3VyY2VOYW1lOiB0LnN0cmluZygpLFxyXG4gIGdldCBwYXJhbXMoKSB7XHJcbiAgICByZXR1cm4gUHJvZHVjdFR5cGUyO1xyXG4gIH0sXHJcbiAgZ2V0IHJldHVyblR5cGUoKSB7XHJcbiAgICByZXR1cm4gQWxnZWJyYWljVHlwZTI7XHJcbiAgfSxcclxuICBnZXQgdmlzaWJpbGl0eSgpIHtcclxuICAgIHJldHVybiBGdW5jdGlvblZpc2liaWxpdHk7XHJcbiAgfVxyXG59KTtcclxudmFyIFJhd1Byb2NlZHVyZURlZlY5ID0gdC5vYmplY3QoXCJSYXdQcm9jZWR1cmVEZWZWOVwiLCB7XHJcbiAgbmFtZTogdC5zdHJpbmcoKSxcclxuICBnZXQgcGFyYW1zKCkge1xyXG4gICAgcmV0dXJuIFByb2R1Y3RUeXBlMjtcclxuICB9LFxyXG4gIGdldCByZXR1cm5UeXBlKCkge1xyXG4gICAgcmV0dXJuIEFsZ2VicmFpY1R5cGUyO1xyXG4gIH1cclxufSk7XHJcbnZhciBSYXdSZWR1Y2VyRGVmVjEwID0gdC5vYmplY3QoXCJSYXdSZWR1Y2VyRGVmVjEwXCIsIHtcclxuICBzb3VyY2VOYW1lOiB0LnN0cmluZygpLFxyXG4gIGdldCBwYXJhbXMoKSB7XHJcbiAgICByZXR1cm4gUHJvZHVjdFR5cGUyO1xyXG4gIH0sXHJcbiAgZ2V0IHZpc2liaWxpdHkoKSB7XHJcbiAgICByZXR1cm4gRnVuY3Rpb25WaXNpYmlsaXR5O1xyXG4gIH0sXHJcbiAgZ2V0IG9rUmV0dXJuVHlwZSgpIHtcclxuICAgIHJldHVybiBBbGdlYnJhaWNUeXBlMjtcclxuICB9LFxyXG4gIGdldCBlcnJSZXR1cm5UeXBlKCkge1xyXG4gICAgcmV0dXJuIEFsZ2VicmFpY1R5cGUyO1xyXG4gIH1cclxufSk7XHJcbnZhciBSYXdSZWR1Y2VyRGVmVjkgPSB0Lm9iamVjdChcIlJhd1JlZHVjZXJEZWZWOVwiLCB7XHJcbiAgbmFtZTogdC5zdHJpbmcoKSxcclxuICBnZXQgcGFyYW1zKCkge1xyXG4gICAgcmV0dXJuIFByb2R1Y3RUeXBlMjtcclxuICB9LFxyXG4gIGdldCBsaWZlY3ljbGUoKSB7XHJcbiAgICByZXR1cm4gdC5vcHRpb24oTGlmZWN5Y2xlKTtcclxuICB9XHJcbn0pO1xyXG52YXIgUmF3Um93TGV2ZWxTZWN1cml0eURlZlY5ID0gdC5vYmplY3QoXCJSYXdSb3dMZXZlbFNlY3VyaXR5RGVmVjlcIiwge1xyXG4gIHNxbDogdC5zdHJpbmcoKVxyXG59KTtcclxudmFyIFJhd1NjaGVkdWxlRGVmVjEwID0gdC5vYmplY3QoXCJSYXdTY2hlZHVsZURlZlYxMFwiLCB7XHJcbiAgc291cmNlTmFtZTogdC5vcHRpb24odC5zdHJpbmcoKSksXHJcbiAgdGFibGVOYW1lOiB0LnN0cmluZygpLFxyXG4gIHNjaGVkdWxlQXRDb2w6IHQudTE2KCksXHJcbiAgZnVuY3Rpb25OYW1lOiB0LnN0cmluZygpXHJcbn0pO1xyXG52YXIgUmF3U2NoZWR1bGVEZWZWOSA9IHQub2JqZWN0KFwiUmF3U2NoZWR1bGVEZWZWOVwiLCB7XHJcbiAgbmFtZTogdC5vcHRpb24odC5zdHJpbmcoKSksXHJcbiAgcmVkdWNlck5hbWU6IHQuc3RyaW5nKCksXHJcbiAgc2NoZWR1bGVkQXRDb2x1bW46IHQudTE2KClcclxufSk7XHJcbnZhciBSYXdTY29wZWRUeXBlTmFtZVYxMCA9IHQub2JqZWN0KFwiUmF3U2NvcGVkVHlwZU5hbWVWMTBcIiwge1xyXG4gIHNjb3BlOiB0LmFycmF5KHQuc3RyaW5nKCkpLFxyXG4gIHNvdXJjZU5hbWU6IHQuc3RyaW5nKClcclxufSk7XHJcbnZhciBSYXdTY29wZWRUeXBlTmFtZVY5ID0gdC5vYmplY3QoXCJSYXdTY29wZWRUeXBlTmFtZVY5XCIsIHtcclxuICBzY29wZTogdC5hcnJheSh0LnN0cmluZygpKSxcclxuICBuYW1lOiB0LnN0cmluZygpXHJcbn0pO1xyXG52YXIgUmF3U2VxdWVuY2VEZWZWMTAgPSB0Lm9iamVjdChcIlJhd1NlcXVlbmNlRGVmVjEwXCIsIHtcclxuICBzb3VyY2VOYW1lOiB0Lm9wdGlvbih0LnN0cmluZygpKSxcclxuICBjb2x1bW46IHQudTE2KCksXHJcbiAgc3RhcnQ6IHQub3B0aW9uKHQuaTEyOCgpKSxcclxuICBtaW5WYWx1ZTogdC5vcHRpb24odC5pMTI4KCkpLFxyXG4gIG1heFZhbHVlOiB0Lm9wdGlvbih0LmkxMjgoKSksXHJcbiAgaW5jcmVtZW50OiB0LmkxMjgoKVxyXG59KTtcclxudmFyIFJhd1NlcXVlbmNlRGVmVjggPSB0Lm9iamVjdChcIlJhd1NlcXVlbmNlRGVmVjhcIiwge1xyXG4gIHNlcXVlbmNlTmFtZTogdC5zdHJpbmcoKSxcclxuICBjb2xQb3M6IHQudTE2KCksXHJcbiAgaW5jcmVtZW50OiB0LmkxMjgoKSxcclxuICBzdGFydDogdC5vcHRpb24odC5pMTI4KCkpLFxyXG4gIG1pblZhbHVlOiB0Lm9wdGlvbih0LmkxMjgoKSksXHJcbiAgbWF4VmFsdWU6IHQub3B0aW9uKHQuaTEyOCgpKSxcclxuICBhbGxvY2F0ZWQ6IHQuaTEyOCgpXHJcbn0pO1xyXG52YXIgUmF3U2VxdWVuY2VEZWZWOSA9IHQub2JqZWN0KFwiUmF3U2VxdWVuY2VEZWZWOVwiLCB7XHJcbiAgbmFtZTogdC5vcHRpb24odC5zdHJpbmcoKSksXHJcbiAgY29sdW1uOiB0LnUxNigpLFxyXG4gIHN0YXJ0OiB0Lm9wdGlvbih0LmkxMjgoKSksXHJcbiAgbWluVmFsdWU6IHQub3B0aW9uKHQuaTEyOCgpKSxcclxuICBtYXhWYWx1ZTogdC5vcHRpb24odC5pMTI4KCkpLFxyXG4gIGluY3JlbWVudDogdC5pMTI4KClcclxufSk7XHJcbnZhciBSYXdUYWJsZURlZlYxMCA9IHQub2JqZWN0KFwiUmF3VGFibGVEZWZWMTBcIiwge1xyXG4gIHNvdXJjZU5hbWU6IHQuc3RyaW5nKCksXHJcbiAgcHJvZHVjdFR5cGVSZWY6IHQudTMyKCksXHJcbiAgcHJpbWFyeUtleTogdC5hcnJheSh0LnUxNigpKSxcclxuICBnZXQgaW5kZXhlcygpIHtcclxuICAgIHJldHVybiB0LmFycmF5KFJhd0luZGV4RGVmVjEwKTtcclxuICB9LFxyXG4gIGdldCBjb25zdHJhaW50cygpIHtcclxuICAgIHJldHVybiB0LmFycmF5KFJhd0NvbnN0cmFpbnREZWZWMTApO1xyXG4gIH0sXHJcbiAgZ2V0IHNlcXVlbmNlcygpIHtcclxuICAgIHJldHVybiB0LmFycmF5KFJhd1NlcXVlbmNlRGVmVjEwKTtcclxuICB9LFxyXG4gIGdldCB0YWJsZVR5cGUoKSB7XHJcbiAgICByZXR1cm4gVGFibGVUeXBlO1xyXG4gIH0sXHJcbiAgZ2V0IHRhYmxlQWNjZXNzKCkge1xyXG4gICAgcmV0dXJuIFRhYmxlQWNjZXNzO1xyXG4gIH0sXHJcbiAgZ2V0IGRlZmF1bHRWYWx1ZXMoKSB7XHJcbiAgICByZXR1cm4gdC5hcnJheShSYXdDb2x1bW5EZWZhdWx0VmFsdWVWMTApO1xyXG4gIH0sXHJcbiAgaXNFdmVudDogdC5ib29sKClcclxufSk7XHJcbnZhciBSYXdUYWJsZURlZlY4ID0gdC5vYmplY3QoXCJSYXdUYWJsZURlZlY4XCIsIHtcclxuICB0YWJsZU5hbWU6IHQuc3RyaW5nKCksXHJcbiAgZ2V0IGNvbHVtbnMoKSB7XHJcbiAgICByZXR1cm4gdC5hcnJheShSYXdDb2x1bW5EZWZWOCk7XHJcbiAgfSxcclxuICBnZXQgaW5kZXhlcygpIHtcclxuICAgIHJldHVybiB0LmFycmF5KFJhd0luZGV4RGVmVjgpO1xyXG4gIH0sXHJcbiAgZ2V0IGNvbnN0cmFpbnRzKCkge1xyXG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3Q29uc3RyYWludERlZlY4KTtcclxuICB9LFxyXG4gIGdldCBzZXF1ZW5jZXMoKSB7XHJcbiAgICByZXR1cm4gdC5hcnJheShSYXdTZXF1ZW5jZURlZlY4KTtcclxuICB9LFxyXG4gIHRhYmxlVHlwZTogdC5zdHJpbmcoKSxcclxuICB0YWJsZUFjY2VzczogdC5zdHJpbmcoKSxcclxuICBzY2hlZHVsZWQ6IHQub3B0aW9uKHQuc3RyaW5nKCkpXHJcbn0pO1xyXG52YXIgUmF3VGFibGVEZWZWOSA9IHQub2JqZWN0KFwiUmF3VGFibGVEZWZWOVwiLCB7XHJcbiAgbmFtZTogdC5zdHJpbmcoKSxcclxuICBwcm9kdWN0VHlwZVJlZjogdC51MzIoKSxcclxuICBwcmltYXJ5S2V5OiB0LmFycmF5KHQudTE2KCkpLFxyXG4gIGdldCBpbmRleGVzKCkge1xyXG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3SW5kZXhEZWZWOSk7XHJcbiAgfSxcclxuICBnZXQgY29uc3RyYWludHMoKSB7XHJcbiAgICByZXR1cm4gdC5hcnJheShSYXdDb25zdHJhaW50RGVmVjkpO1xyXG4gIH0sXHJcbiAgZ2V0IHNlcXVlbmNlcygpIHtcclxuICAgIHJldHVybiB0LmFycmF5KFJhd1NlcXVlbmNlRGVmVjkpO1xyXG4gIH0sXHJcbiAgZ2V0IHNjaGVkdWxlKCkge1xyXG4gICAgcmV0dXJuIHQub3B0aW9uKFJhd1NjaGVkdWxlRGVmVjkpO1xyXG4gIH0sXHJcbiAgZ2V0IHRhYmxlVHlwZSgpIHtcclxuICAgIHJldHVybiBUYWJsZVR5cGU7XHJcbiAgfSxcclxuICBnZXQgdGFibGVBY2Nlc3MoKSB7XHJcbiAgICByZXR1cm4gVGFibGVBY2Nlc3M7XHJcbiAgfVxyXG59KTtcclxudmFyIFJhd1R5cGVEZWZWMTAgPSB0Lm9iamVjdChcIlJhd1R5cGVEZWZWMTBcIiwge1xyXG4gIGdldCBzb3VyY2VOYW1lKCkge1xyXG4gICAgcmV0dXJuIFJhd1Njb3BlZFR5cGVOYW1lVjEwO1xyXG4gIH0sXHJcbiAgdHk6IHQudTMyKCksXHJcbiAgY3VzdG9tT3JkZXJpbmc6IHQuYm9vbCgpXHJcbn0pO1xyXG52YXIgUmF3VHlwZURlZlY5ID0gdC5vYmplY3QoXCJSYXdUeXBlRGVmVjlcIiwge1xyXG4gIGdldCBuYW1lKCkge1xyXG4gICAgcmV0dXJuIFJhd1Njb3BlZFR5cGVOYW1lVjk7XHJcbiAgfSxcclxuICB0eTogdC51MzIoKSxcclxuICBjdXN0b21PcmRlcmluZzogdC5ib29sKClcclxufSk7XHJcbnZhciBSYXdVbmlxdWVDb25zdHJhaW50RGF0YVY5ID0gdC5vYmplY3QoXHJcbiAgXCJSYXdVbmlxdWVDb25zdHJhaW50RGF0YVY5XCIsXHJcbiAge1xyXG4gICAgY29sdW1uczogdC5hcnJheSh0LnUxNigpKVxyXG4gIH1cclxuKTtcclxudmFyIFJhd1ZpZXdEZWZWMTAgPSB0Lm9iamVjdChcIlJhd1ZpZXdEZWZWMTBcIiwge1xyXG4gIHNvdXJjZU5hbWU6IHQuc3RyaW5nKCksXHJcbiAgaW5kZXg6IHQudTMyKCksXHJcbiAgaXNQdWJsaWM6IHQuYm9vbCgpLFxyXG4gIGlzQW5vbnltb3VzOiB0LmJvb2woKSxcclxuICBnZXQgcGFyYW1zKCkge1xyXG4gICAgcmV0dXJuIFByb2R1Y3RUeXBlMjtcclxuICB9LFxyXG4gIGdldCByZXR1cm5UeXBlKCkge1xyXG4gICAgcmV0dXJuIEFsZ2VicmFpY1R5cGUyO1xyXG4gIH1cclxufSk7XHJcbnZhciBSYXdWaWV3RGVmVjkgPSB0Lm9iamVjdChcIlJhd1ZpZXdEZWZWOVwiLCB7XHJcbiAgbmFtZTogdC5zdHJpbmcoKSxcclxuICBpbmRleDogdC51MzIoKSxcclxuICBpc1B1YmxpYzogdC5ib29sKCksXHJcbiAgaXNBbm9ueW1vdXM6IHQuYm9vbCgpLFxyXG4gIGdldCBwYXJhbXMoKSB7XHJcbiAgICByZXR1cm4gUHJvZHVjdFR5cGUyO1xyXG4gIH0sXHJcbiAgZ2V0IHJldHVyblR5cGUoKSB7XHJcbiAgICByZXR1cm4gQWxnZWJyYWljVHlwZTI7XHJcbiAgfVxyXG59KTtcclxudmFyIFJlZHVjZXJEZWYgPSB0Lm9iamVjdChcIlJlZHVjZXJEZWZcIiwge1xyXG4gIG5hbWU6IHQuc3RyaW5nKCksXHJcbiAgZ2V0IGFyZ3MoKSB7XHJcbiAgICByZXR1cm4gdC5hcnJheShQcm9kdWN0VHlwZUVsZW1lbnQpO1xyXG4gIH1cclxufSk7XHJcbnZhciBTdW1UeXBlMiA9IHQub2JqZWN0KFwiU3VtVHlwZVwiLCB7XHJcbiAgZ2V0IHZhcmlhbnRzKCkge1xyXG4gICAgcmV0dXJuIHQuYXJyYXkoU3VtVHlwZVZhcmlhbnQpO1xyXG4gIH1cclxufSk7XHJcbnZhciBTdW1UeXBlVmFyaWFudCA9IHQub2JqZWN0KFwiU3VtVHlwZVZhcmlhbnRcIiwge1xyXG4gIG5hbWU6IHQub3B0aW9uKHQuc3RyaW5nKCkpLFxyXG4gIGdldCBhbGdlYnJhaWNUeXBlKCkge1xyXG4gICAgcmV0dXJuIEFsZ2VicmFpY1R5cGUyO1xyXG4gIH1cclxufSk7XHJcbnZhciBUYWJsZUFjY2VzcyA9IHQuZW51bShcIlRhYmxlQWNjZXNzXCIsIHtcclxuICBQdWJsaWM6IHQudW5pdCgpLFxyXG4gIFByaXZhdGU6IHQudW5pdCgpXHJcbn0pO1xyXG52YXIgVGFibGVEZXNjID0gdC5vYmplY3QoXCJUYWJsZURlc2NcIiwge1xyXG4gIGdldCBzY2hlbWEoKSB7XHJcbiAgICByZXR1cm4gUmF3VGFibGVEZWZWODtcclxuICB9LFxyXG4gIGRhdGE6IHQudTMyKClcclxufSk7XHJcbnZhciBUYWJsZVR5cGUgPSB0LmVudW0oXCJUYWJsZVR5cGVcIiwge1xyXG4gIFN5c3RlbTogdC51bml0KCksXHJcbiAgVXNlcjogdC51bml0KClcclxufSk7XHJcbnZhciBUeXBlQWxpYXMgPSB0Lm9iamVjdChcIlR5cGVBbGlhc1wiLCB7XHJcbiAgbmFtZTogdC5zdHJpbmcoKSxcclxuICB0eTogdC51MzIoKVxyXG59KTtcclxudmFyIFR5cGVzcGFjZSA9IHQub2JqZWN0KFwiVHlwZXNwYWNlXCIsIHtcclxuICBnZXQgdHlwZXMoKSB7XHJcbiAgICByZXR1cm4gdC5hcnJheShBbGdlYnJhaWNUeXBlMik7XHJcbiAgfVxyXG59KTtcclxudmFyIFZpZXdSZXN1bHRIZWFkZXIgPSB0LmVudW0oXCJWaWV3UmVzdWx0SGVhZGVyXCIsIHtcclxuICBSb3dEYXRhOiB0LnVuaXQoKSxcclxuICBSYXdTcWw6IHQuc3RyaW5nKClcclxufSk7XHJcblxyXG4vLyBzcmMvbGliL3NjaGVtYS50c1xyXG5mdW5jdGlvbiB0YWJsZVRvU2NoZW1hKGFjY05hbWUsIHNjaGVtYTIsIHRhYmxlRGVmKSB7XHJcbiAgY29uc3QgZ2V0Q29sTmFtZSA9IChpKSA9PiBzY2hlbWEyLnJvd1R5cGUuYWxnZWJyYWljVHlwZS52YWx1ZS5lbGVtZW50c1tpXS5uYW1lO1xyXG4gIHJldHVybiB7XHJcbiAgICAvLyBGb3IgY2xpZW50LGBzY2hhbWEudGFibGVOYW1lYCB3aWxsIGFsd2F5cyBiZSB0aGVyZSBhcyBjYW5vbmljYWwgbmFtZS5cclxuICAgIC8vIEZvciBtb2R1bGUsIGlmIGV4cGxpY2l0IG5hbWUgaXMgbm90IHByb3ZpZGVkIHZpYSBgbmFtZWAsIGFjY2Vzc29yIG5hbWUgd2lsbFxyXG4gICAgLy8gYmUgdXNlZCwgaXQgaXMgc3RvcmVkIGFzIGFsaWFzIGluIGRhdGFiYXNlLCBoZW5jZSB3b3JrcyBpbiBxdWVyeSBidWlsZGVyLlxyXG4gICAgc291cmNlTmFtZTogc2NoZW1hMi50YWJsZU5hbWUgfHwgYWNjTmFtZSxcclxuICAgIGFjY2Vzc29yTmFtZTogYWNjTmFtZSxcclxuICAgIGNvbHVtbnM6IHNjaGVtYTIucm93VHlwZS5yb3csXHJcbiAgICAvLyB0eXBlZCBhcyBUW2ldWydyb3dUeXBlJ11bJ3JvdyddIHVuZGVyIFRhYmxlc1RvU2NoZW1hPFQ+XHJcbiAgICByb3dUeXBlOiBzY2hlbWEyLnJvd1NwYWNldGltZVR5cGUsXHJcbiAgICBjb25zdHJhaW50czogdGFibGVEZWYuY29uc3RyYWludHMubWFwKChjKSA9PiAoe1xyXG4gICAgICBuYW1lOiBjLnNvdXJjZU5hbWUsXHJcbiAgICAgIGNvbnN0cmFpbnQ6IFwidW5pcXVlXCIsXHJcbiAgICAgIGNvbHVtbnM6IGMuZGF0YS52YWx1ZS5jb2x1bW5zLm1hcChnZXRDb2xOYW1lKVxyXG4gICAgfSkpLFxyXG4gICAgLy8gVE9ETzogaG9ycmlibGUgaG9ycmlibGUgaG9ycmlibGUuIHdlIHNtdWdnbGUgdGhpcyBgQXJyYXk8VW50eXBlZEluZGV4PmBcclxuICAgIC8vIGJ5IGNhc3RpbmcgaXQgdG8gYW4gYEFycmF5PEluZGV4T3B0cz5gIGFzIGBUYWJsZVRvU2NoZW1hYCBleHBlY3RzLlxyXG4gICAgLy8gVGhpcyBpcyB0aGVuIHVzZWQgaW4gYFRhYmxlQ2FjaGVJbXBsLmNvbnN0cnVjdG9yYCBhbmQgd2hvIGtub3dzIHdoZXJlIGVsc2UuXHJcbiAgICAvLyBXZSBzaG91bGQgc3RvcCBseWluZyBhYm91dCBvdXIgdHlwZXMuXHJcbiAgICBpbmRleGVzOiB0YWJsZURlZi5pbmRleGVzLm1hcCgoaWR4KSA9PiB7XHJcbiAgICAgIGNvbnN0IGNvbHVtbklkcyA9IGlkeC5hbGdvcml0aG0udGFnID09PSBcIkRpcmVjdFwiID8gW2lkeC5hbGdvcml0aG0udmFsdWVdIDogaWR4LmFsZ29yaXRobS52YWx1ZTtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBuYW1lOiBpZHguYWNjZXNzb3JOYW1lLFxyXG4gICAgICAgIHVuaXF1ZTogdGFibGVEZWYuY29uc3RyYWludHMuc29tZShcclxuICAgICAgICAgIChjKSA9PiBjLmRhdGEudmFsdWUuY29sdW1ucy5ldmVyeSgoY29sKSA9PiBjb2x1bW5JZHMuaW5jbHVkZXMoY29sKSlcclxuICAgICAgICApLFxyXG4gICAgICAgIGFsZ29yaXRobTogaWR4LmFsZ29yaXRobS50YWcudG9Mb3dlckNhc2UoKSxcclxuICAgICAgICBjb2x1bW5zOiBjb2x1bW5JZHMubWFwKGdldENvbE5hbWUpXHJcbiAgICAgIH07XHJcbiAgICB9KSxcclxuICAgIHRhYmxlRGVmLFxyXG4gICAgLi4udGFibGVEZWYuaXNFdmVudCA/IHsgaXNFdmVudDogdHJ1ZSB9IDoge31cclxuICB9O1xyXG59XHJcbnZhciBNb2R1bGVDb250ZXh0ID0gY2xhc3Mge1xyXG4gICNjb21wb3VuZFR5cGVzID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcclxuICAvKipcclxuICAgKiBUaGUgZ2xvYmFsIG1vZHVsZSBkZWZpbml0aW9uIHRoYXQgZ2V0cyBwb3B1bGF0ZWQgYnkgY2FsbHMgdG8gYHJlZHVjZXIoKWAgYW5kIGxpZmVjeWNsZSBob29rcy5cclxuICAgKi9cclxuICAjbW9kdWxlRGVmID0ge1xyXG4gICAgdHlwZXNwYWNlOiB7IHR5cGVzOiBbXSB9LFxyXG4gICAgdGFibGVzOiBbXSxcclxuICAgIHJlZHVjZXJzOiBbXSxcclxuICAgIHR5cGVzOiBbXSxcclxuICAgIHJvd0xldmVsU2VjdXJpdHk6IFtdLFxyXG4gICAgc2NoZWR1bGVzOiBbXSxcclxuICAgIHByb2NlZHVyZXM6IFtdLFxyXG4gICAgdmlld3M6IFtdLFxyXG4gICAgbGlmZUN5Y2xlUmVkdWNlcnM6IFtdLFxyXG4gICAgY2FzZUNvbnZlcnNpb25Qb2xpY3k6IHsgdGFnOiBcIlNuYWtlQ2FzZVwiIH0sXHJcbiAgICBleHBsaWNpdE5hbWVzOiB7XHJcbiAgICAgIGVudHJpZXM6IFtdXHJcbiAgICB9XHJcbiAgfTtcclxuICBnZXQgbW9kdWxlRGVmKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuI21vZHVsZURlZjtcclxuICB9XHJcbiAgcmF3TW9kdWxlRGVmVjEwKCkge1xyXG4gICAgY29uc3Qgc2VjdGlvbnMgPSBbXTtcclxuICAgIGNvbnN0IHB1c2ggPSAocykgPT4ge1xyXG4gICAgICBpZiAocykgc2VjdGlvbnMucHVzaChzKTtcclxuICAgIH07XHJcbiAgICBjb25zdCBtb2R1bGUgPSB0aGlzLiNtb2R1bGVEZWY7XHJcbiAgICBwdXNoKG1vZHVsZS50eXBlc3BhY2UgJiYgeyB0YWc6IFwiVHlwZXNwYWNlXCIsIHZhbHVlOiBtb2R1bGUudHlwZXNwYWNlIH0pO1xyXG4gICAgcHVzaChtb2R1bGUudHlwZXMgJiYgeyB0YWc6IFwiVHlwZXNcIiwgdmFsdWU6IG1vZHVsZS50eXBlcyB9KTtcclxuICAgIHB1c2gobW9kdWxlLnRhYmxlcyAmJiB7IHRhZzogXCJUYWJsZXNcIiwgdmFsdWU6IG1vZHVsZS50YWJsZXMgfSk7XHJcbiAgICBwdXNoKG1vZHVsZS5yZWR1Y2VycyAmJiB7IHRhZzogXCJSZWR1Y2Vyc1wiLCB2YWx1ZTogbW9kdWxlLnJlZHVjZXJzIH0pO1xyXG4gICAgcHVzaChtb2R1bGUucHJvY2VkdXJlcyAmJiB7IHRhZzogXCJQcm9jZWR1cmVzXCIsIHZhbHVlOiBtb2R1bGUucHJvY2VkdXJlcyB9KTtcclxuICAgIHB1c2gobW9kdWxlLnZpZXdzICYmIHsgdGFnOiBcIlZpZXdzXCIsIHZhbHVlOiBtb2R1bGUudmlld3MgfSk7XHJcbiAgICBwdXNoKG1vZHVsZS5zY2hlZHVsZXMgJiYgeyB0YWc6IFwiU2NoZWR1bGVzXCIsIHZhbHVlOiBtb2R1bGUuc2NoZWR1bGVzIH0pO1xyXG4gICAgcHVzaChcclxuICAgICAgbW9kdWxlLmxpZmVDeWNsZVJlZHVjZXJzICYmIHtcclxuICAgICAgICB0YWc6IFwiTGlmZUN5Y2xlUmVkdWNlcnNcIixcclxuICAgICAgICB2YWx1ZTogbW9kdWxlLmxpZmVDeWNsZVJlZHVjZXJzXHJcbiAgICAgIH1cclxuICAgICk7XHJcbiAgICBwdXNoKFxyXG4gICAgICBtb2R1bGUucm93TGV2ZWxTZWN1cml0eSAmJiB7XHJcbiAgICAgICAgdGFnOiBcIlJvd0xldmVsU2VjdXJpdHlcIixcclxuICAgICAgICB2YWx1ZTogbW9kdWxlLnJvd0xldmVsU2VjdXJpdHlcclxuICAgICAgfVxyXG4gICAgKTtcclxuICAgIHB1c2goXHJcbiAgICAgIG1vZHVsZS5leHBsaWNpdE5hbWVzICYmIHtcclxuICAgICAgICB0YWc6IFwiRXhwbGljaXROYW1lc1wiLFxyXG4gICAgICAgIHZhbHVlOiBtb2R1bGUuZXhwbGljaXROYW1lc1xyXG4gICAgICB9XHJcbiAgICApO1xyXG4gICAgcHVzaChcclxuICAgICAgbW9kdWxlLmNhc2VDb252ZXJzaW9uUG9saWN5ICYmIHtcclxuICAgICAgICB0YWc6IFwiQ2FzZUNvbnZlcnNpb25Qb2xpY3lcIixcclxuICAgICAgICB2YWx1ZTogbW9kdWxlLmNhc2VDb252ZXJzaW9uUG9saWN5XHJcbiAgICAgIH1cclxuICAgICk7XHJcbiAgICByZXR1cm4geyBzZWN0aW9ucyB9O1xyXG4gIH1cclxuICAvKipcclxuICAgKiBTZXQgdGhlIGNhc2UgY29udmVyc2lvbiBwb2xpY3kgZm9yIHRoaXMgbW9kdWxlLlxyXG4gICAqIENhbGxlZCBieSB0aGUgc2V0dGluZ3MgbWVjaGFuaXNtLlxyXG4gICAqL1xyXG4gIHNldENhc2VDb252ZXJzaW9uUG9saWN5KHBvbGljeSkge1xyXG4gICAgdGhpcy4jbW9kdWxlRGVmLmNhc2VDb252ZXJzaW9uUG9saWN5ID0gcG9saWN5O1xyXG4gIH1cclxuICBnZXQgdHlwZXNwYWNlKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuI21vZHVsZURlZi50eXBlc3BhY2U7XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIFJlc29sdmVzIHRoZSBhY3R1YWwgdHlwZSBvZiBhIFR5cGVCdWlsZGVyIGJ5IGZvbGxvd2luZyBpdHMgcmVmZXJlbmNlcyB1bnRpbCBpdCByZWFjaGVzIGEgbm9uLXJlZiB0eXBlLlxyXG4gICAqIEBwYXJhbSB0eXBlc3BhY2UgVGhlIHR5cGVzcGFjZSB0byByZXNvbHZlIHR5cGVzIGFnYWluc3QuXHJcbiAgICogQHBhcmFtIHR5cGVCdWlsZGVyIFRoZSBUeXBlQnVpbGRlciB0byByZXNvbHZlLlxyXG4gICAqIEByZXR1cm5zIFRoZSByZXNvbHZlZCBhbGdlYnJhaWMgdHlwZS5cclxuICAgKi9cclxuICByZXNvbHZlVHlwZSh0eXBlQnVpbGRlcikge1xyXG4gICAgbGV0IHR5ID0gdHlwZUJ1aWxkZXIuYWxnZWJyYWljVHlwZTtcclxuICAgIHdoaWxlICh0eS50YWcgPT09IFwiUmVmXCIpIHtcclxuICAgICAgdHkgPSB0aGlzLnR5cGVzcGFjZS50eXBlc1t0eS52YWx1ZV07XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdHk7XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIEFkZHMgYSB0eXBlIHRvIHRoZSBtb2R1bGUgZGVmaW5pdGlvbidzIHR5cGVzcGFjZSBhcyBhIGBSZWZgIGlmIGl0IGlzIGEgbmFtZWQgY29tcG91bmQgdHlwZSAoUHJvZHVjdCBvciBTdW0pLlxyXG4gICAqIE90aGVyd2lzZSwgcmV0dXJucyB0aGUgdHlwZSBhcyBpcy5cclxuICAgKiBAcGFyYW0gbmFtZVxyXG4gICAqIEBwYXJhbSB0eVxyXG4gICAqIEByZXR1cm5zXHJcbiAgICovXHJcbiAgcmVnaXN0ZXJUeXBlc1JlY3Vyc2l2ZWx5KHR5cGVCdWlsZGVyKSB7XHJcbiAgICBpZiAodHlwZUJ1aWxkZXIgaW5zdGFuY2VvZiBQcm9kdWN0QnVpbGRlciAmJiAhaXNVbml0KHR5cGVCdWlsZGVyKSB8fCB0eXBlQnVpbGRlciBpbnN0YW5jZW9mIFN1bUJ1aWxkZXIgfHwgdHlwZUJ1aWxkZXIgaW5zdGFuY2VvZiBSb3dCdWlsZGVyKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLiNyZWdpc3RlckNvbXBvdW5kVHlwZVJlY3Vyc2l2ZWx5KHR5cGVCdWlsZGVyKTtcclxuICAgIH0gZWxzZSBpZiAodHlwZUJ1aWxkZXIgaW5zdGFuY2VvZiBPcHRpb25CdWlsZGVyKSB7XHJcbiAgICAgIHJldHVybiBuZXcgT3B0aW9uQnVpbGRlcihcclxuICAgICAgICB0aGlzLnJlZ2lzdGVyVHlwZXNSZWN1cnNpdmVseSh0eXBlQnVpbGRlci52YWx1ZSlcclxuICAgICAgKTtcclxuICAgIH0gZWxzZSBpZiAodHlwZUJ1aWxkZXIgaW5zdGFuY2VvZiBSZXN1bHRCdWlsZGVyKSB7XHJcbiAgICAgIHJldHVybiBuZXcgUmVzdWx0QnVpbGRlcihcclxuICAgICAgICB0aGlzLnJlZ2lzdGVyVHlwZXNSZWN1cnNpdmVseSh0eXBlQnVpbGRlci5vayksXHJcbiAgICAgICAgdGhpcy5yZWdpc3RlclR5cGVzUmVjdXJzaXZlbHkodHlwZUJ1aWxkZXIuZXJyKVxyXG4gICAgICApO1xyXG4gICAgfSBlbHNlIGlmICh0eXBlQnVpbGRlciBpbnN0YW5jZW9mIEFycmF5QnVpbGRlcikge1xyXG4gICAgICByZXR1cm4gbmV3IEFycmF5QnVpbGRlcihcclxuICAgICAgICB0aGlzLnJlZ2lzdGVyVHlwZXNSZWN1cnNpdmVseSh0eXBlQnVpbGRlci5lbGVtZW50KVxyXG4gICAgICApO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIHR5cGVCdWlsZGVyO1xyXG4gICAgfVxyXG4gIH1cclxuICAjcmVnaXN0ZXJDb21wb3VuZFR5cGVSZWN1cnNpdmVseSh0eXBlQnVpbGRlcikge1xyXG4gICAgY29uc3QgdHkgPSB0eXBlQnVpbGRlci5hbGdlYnJhaWNUeXBlO1xyXG4gICAgY29uc3QgbmFtZSA9IHR5cGVCdWlsZGVyLnR5cGVOYW1lO1xyXG4gICAgaWYgKG5hbWUgPT09IHZvaWQgMCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXHJcbiAgICAgICAgYE1pc3NpbmcgdHlwZSBuYW1lIGZvciAke3R5cGVCdWlsZGVyLmNvbnN0cnVjdG9yLm5hbWUgPz8gXCJUeXBlQnVpbGRlclwifSAke0pTT04uc3RyaW5naWZ5KHR5cGVCdWlsZGVyKX1gXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgICBsZXQgciA9IHRoaXMuI2NvbXBvdW5kVHlwZXMuZ2V0KHR5KTtcclxuICAgIGlmIChyICE9IG51bGwpIHtcclxuICAgICAgcmV0dXJuIHI7XHJcbiAgICB9XHJcbiAgICBjb25zdCBuZXdUeSA9IHR5cGVCdWlsZGVyIGluc3RhbmNlb2YgUm93QnVpbGRlciB8fCB0eXBlQnVpbGRlciBpbnN0YW5jZW9mIFByb2R1Y3RCdWlsZGVyID8ge1xyXG4gICAgICB0YWc6IFwiUHJvZHVjdFwiLFxyXG4gICAgICB2YWx1ZTogeyBlbGVtZW50czogW10gfVxyXG4gICAgfSA6IHtcclxuICAgICAgdGFnOiBcIlN1bVwiLFxyXG4gICAgICB2YWx1ZTogeyB2YXJpYW50czogW10gfVxyXG4gICAgfTtcclxuICAgIHIgPSBuZXcgUmVmQnVpbGRlcih0aGlzLiNtb2R1bGVEZWYudHlwZXNwYWNlLnR5cGVzLmxlbmd0aCk7XHJcbiAgICB0aGlzLiNtb2R1bGVEZWYudHlwZXNwYWNlLnR5cGVzLnB1c2gobmV3VHkpO1xyXG4gICAgdGhpcy4jY29tcG91bmRUeXBlcy5zZXQodHksIHIpO1xyXG4gICAgaWYgKHR5cGVCdWlsZGVyIGluc3RhbmNlb2YgUm93QnVpbGRlcikge1xyXG4gICAgICBmb3IgKGNvbnN0IFtuYW1lMiwgZWxlbV0gb2YgT2JqZWN0LmVudHJpZXModHlwZUJ1aWxkZXIucm93KSkge1xyXG4gICAgICAgIG5ld1R5LnZhbHVlLmVsZW1lbnRzLnB1c2goe1xyXG4gICAgICAgICAgbmFtZTogbmFtZTIsXHJcbiAgICAgICAgICBhbGdlYnJhaWNUeXBlOiB0aGlzLnJlZ2lzdGVyVHlwZXNSZWN1cnNpdmVseShlbGVtLnR5cGVCdWlsZGVyKS5hbGdlYnJhaWNUeXBlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAodHlwZUJ1aWxkZXIgaW5zdGFuY2VvZiBQcm9kdWN0QnVpbGRlcikge1xyXG4gICAgICBmb3IgKGNvbnN0IFtuYW1lMiwgZWxlbV0gb2YgT2JqZWN0LmVudHJpZXModHlwZUJ1aWxkZXIuZWxlbWVudHMpKSB7XHJcbiAgICAgICAgbmV3VHkudmFsdWUuZWxlbWVudHMucHVzaCh7XHJcbiAgICAgICAgICBuYW1lOiBuYW1lMixcclxuICAgICAgICAgIGFsZ2VicmFpY1R5cGU6IHRoaXMucmVnaXN0ZXJUeXBlc1JlY3Vyc2l2ZWx5KGVsZW0pLmFsZ2VicmFpY1R5cGVcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIGlmICh0eXBlQnVpbGRlciBpbnN0YW5jZW9mIFN1bUJ1aWxkZXIpIHtcclxuICAgICAgZm9yIChjb25zdCBbbmFtZTIsIHZhcmlhbnRdIG9mIE9iamVjdC5lbnRyaWVzKHR5cGVCdWlsZGVyLnZhcmlhbnRzKSkge1xyXG4gICAgICAgIG5ld1R5LnZhbHVlLnZhcmlhbnRzLnB1c2goe1xyXG4gICAgICAgICAgbmFtZTogbmFtZTIsXHJcbiAgICAgICAgICBhbGdlYnJhaWNUeXBlOiB0aGlzLnJlZ2lzdGVyVHlwZXNSZWN1cnNpdmVseSh2YXJpYW50KS5hbGdlYnJhaWNUeXBlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMuI21vZHVsZURlZi50eXBlcy5wdXNoKHtcclxuICAgICAgc291cmNlTmFtZTogc3BsaXROYW1lKG5hbWUpLFxyXG4gICAgICB0eTogci5yZWYsXHJcbiAgICAgIGN1c3RvbU9yZGVyaW5nOiB0cnVlXHJcbiAgICB9KTtcclxuICAgIHJldHVybiByO1xyXG4gIH1cclxufTtcclxuZnVuY3Rpb24gaXNVbml0KHR5cGVCdWlsZGVyKSB7XHJcbiAgcmV0dXJuIHR5cGVCdWlsZGVyLnR5cGVOYW1lID09IG51bGwgJiYgdHlwZUJ1aWxkZXIuYWxnZWJyYWljVHlwZS52YWx1ZS5lbGVtZW50cy5sZW5ndGggPT09IDA7XHJcbn1cclxuZnVuY3Rpb24gc3BsaXROYW1lKG5hbWUpIHtcclxuICBjb25zdCBzY29wZSA9IG5hbWUuc3BsaXQoXCIuXCIpO1xyXG4gIHJldHVybiB7IHNvdXJjZU5hbWU6IHNjb3BlLnBvcCgpLCBzY29wZSB9O1xyXG59XHJcblxyXG4vLyBzcmMvc2VydmVyL2h0dHBfaW50ZXJuYWwudHNcclxudmFyIGltcG9ydF9zdGF0dXNlcyA9IF9fdG9FU00ocmVxdWlyZV9zdGF0dXNlcygpKTtcclxuXHJcbi8vIHNyYy9zZXJ2ZXIvcmFuZ2UudHNcclxudmFyIFJhbmdlID0gY2xhc3Mge1xyXG4gICNmcm9tO1xyXG4gICN0bztcclxuICBjb25zdHJ1Y3Rvcihmcm9tLCB0bykge1xyXG4gICAgdGhpcy4jZnJvbSA9IGZyb20gPz8geyB0YWc6IFwidW5ib3VuZGVkXCIgfTtcclxuICAgIHRoaXMuI3RvID0gdG8gPz8geyB0YWc6IFwidW5ib3VuZGVkXCIgfTtcclxuICB9XHJcbiAgZ2V0IGZyb20oKSB7XHJcbiAgICByZXR1cm4gdGhpcy4jZnJvbTtcclxuICB9XHJcbiAgZ2V0IHRvKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuI3RvO1xyXG4gIH1cclxufTtcclxuXHJcbi8vIHNyYy9saWIvdGFibGUudHNcclxuZnVuY3Rpb24gdGFibGUob3B0cywgcm93LCAuLi5fKSB7XHJcbiAgY29uc3Qge1xyXG4gICAgbmFtZSxcclxuICAgIHB1YmxpYzogaXNQdWJsaWMgPSBmYWxzZSxcclxuICAgIGluZGV4ZXM6IHVzZXJJbmRleGVzID0gW10sXHJcbiAgICBzY2hlZHVsZWQsXHJcbiAgICBldmVudDogaXNFdmVudCA9IGZhbHNlXHJcbiAgfSA9IG9wdHM7XHJcbiAgY29uc3QgY29sSWRzID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcclxuICBjb25zdCBjb2xOYW1lTGlzdCA9IFtdO1xyXG4gIGlmICghKHJvdyBpbnN0YW5jZW9mIFJvd0J1aWxkZXIpKSB7XHJcbiAgICByb3cgPSBuZXcgUm93QnVpbGRlcihyb3cpO1xyXG4gIH1cclxuICByb3cuYWxnZWJyYWljVHlwZS52YWx1ZS5lbGVtZW50cy5mb3JFYWNoKChlbGVtLCBpKSA9PiB7XHJcbiAgICBjb2xJZHMuc2V0KGVsZW0ubmFtZSwgaSk7XHJcbiAgICBjb2xOYW1lTGlzdC5wdXNoKGVsZW0ubmFtZSk7XHJcbiAgfSk7XHJcbiAgY29uc3QgcGsgPSBbXTtcclxuICBjb25zdCBpbmRleGVzID0gW107XHJcbiAgY29uc3QgY29uc3RyYWludHMgPSBbXTtcclxuICBjb25zdCBzZXF1ZW5jZXMgPSBbXTtcclxuICBsZXQgc2NoZWR1bGVBdENvbDtcclxuICBjb25zdCBkZWZhdWx0VmFsdWVzID0gW107XHJcbiAgZm9yIChjb25zdCBbbmFtZTIsIGJ1aWxkZXJdIG9mIE9iamVjdC5lbnRyaWVzKHJvdy5yb3cpKSB7XHJcbiAgICBjb25zdCBtZXRhID0gYnVpbGRlci5jb2x1bW5NZXRhZGF0YTtcclxuICAgIGlmIChtZXRhLmlzUHJpbWFyeUtleSkge1xyXG4gICAgICBway5wdXNoKGNvbElkcy5nZXQobmFtZTIpKTtcclxuICAgIH1cclxuICAgIGNvbnN0IGlzVW5pcXVlID0gbWV0YS5pc1VuaXF1ZSB8fCBtZXRhLmlzUHJpbWFyeUtleTtcclxuICAgIGlmIChtZXRhLmluZGV4VHlwZSB8fCBpc1VuaXF1ZSkge1xyXG4gICAgICBjb25zdCBhbGdvID0gbWV0YS5pbmRleFR5cGUgPz8gXCJidHJlZVwiO1xyXG4gICAgICBjb25zdCBpZCA9IGNvbElkcy5nZXQobmFtZTIpO1xyXG4gICAgICBsZXQgYWxnb3JpdGhtO1xyXG4gICAgICBzd2l0Y2ggKGFsZ28pIHtcclxuICAgICAgICBjYXNlIFwiYnRyZWVcIjpcclxuICAgICAgICAgIGFsZ29yaXRobSA9IFJhd0luZGV4QWxnb3JpdGhtLkJUcmVlKFtpZF0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBcImhhc2hcIjpcclxuICAgICAgICAgIGFsZ29yaXRobSA9IFJhd0luZGV4QWxnb3JpdGhtLkhhc2goW2lkXSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFwiZGlyZWN0XCI6XHJcbiAgICAgICAgICBhbGdvcml0aG0gPSBSYXdJbmRleEFsZ29yaXRobS5EaXJlY3QoaWQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgaW5kZXhlcy5wdXNoKHtcclxuICAgICAgICBzb3VyY2VOYW1lOiB2b2lkIDAsXHJcbiAgICAgICAgLy8gVW5uYW1lZCBpbmRleGVzIHdpbGwgYmUgYXNzaWduZWQgYSBnbG9iYWxseSB1bmlxdWUgbmFtZVxyXG4gICAgICAgIGFjY2Vzc29yTmFtZTogbmFtZTIsXHJcbiAgICAgICAgYWxnb3JpdGhtXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgaWYgKGlzVW5pcXVlKSB7XHJcbiAgICAgIGNvbnN0cmFpbnRzLnB1c2goe1xyXG4gICAgICAgIHNvdXJjZU5hbWU6IHZvaWQgMCxcclxuICAgICAgICBkYXRhOiB7IHRhZzogXCJVbmlxdWVcIiwgdmFsdWU6IHsgY29sdW1uczogW2NvbElkcy5nZXQobmFtZTIpXSB9IH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBpZiAobWV0YS5pc0F1dG9JbmNyZW1lbnQpIHtcclxuICAgICAgc2VxdWVuY2VzLnB1c2goe1xyXG4gICAgICAgIHNvdXJjZU5hbWU6IHZvaWQgMCxcclxuICAgICAgICBzdGFydDogdm9pZCAwLFxyXG4gICAgICAgIG1pblZhbHVlOiB2b2lkIDAsXHJcbiAgICAgICAgbWF4VmFsdWU6IHZvaWQgMCxcclxuICAgICAgICBjb2x1bW46IGNvbElkcy5nZXQobmFtZTIpLFxyXG4gICAgICAgIGluY3JlbWVudDogMW5cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBpZiAobWV0YS5kZWZhdWx0VmFsdWUpIHtcclxuICAgICAgY29uc3Qgd3JpdGVyID0gbmV3IEJpbmFyeVdyaXRlcigxNik7XHJcbiAgICAgIGJ1aWxkZXIuc2VyaWFsaXplKHdyaXRlciwgbWV0YS5kZWZhdWx0VmFsdWUpO1xyXG4gICAgICBkZWZhdWx0VmFsdWVzLnB1c2goe1xyXG4gICAgICAgIGNvbElkOiBjb2xJZHMuZ2V0KG5hbWUyKSxcclxuICAgICAgICB2YWx1ZTogd3JpdGVyLmdldEJ1ZmZlcigpXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgaWYgKHNjaGVkdWxlZCkge1xyXG4gICAgICBjb25zdCBhbGdlYnJhaWNUeXBlID0gYnVpbGRlci50eXBlQnVpbGRlci5hbGdlYnJhaWNUeXBlO1xyXG4gICAgICBpZiAoc2NoZWR1bGVfYXRfZGVmYXVsdC5pc1NjaGVkdWxlQXQoYWxnZWJyYWljVHlwZSkpIHtcclxuICAgICAgICBzY2hlZHVsZUF0Q29sID0gY29sSWRzLmdldChuYW1lMik7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgZm9yIChjb25zdCBpbmRleE9wdHMgb2YgdXNlckluZGV4ZXMgPz8gW10pIHtcclxuICAgIGxldCBhbGdvcml0aG07XHJcbiAgICBzd2l0Y2ggKGluZGV4T3B0cy5hbGdvcml0aG0pIHtcclxuICAgICAgY2FzZSBcImJ0cmVlXCI6XHJcbiAgICAgICAgYWxnb3JpdGhtID0ge1xyXG4gICAgICAgICAgdGFnOiBcIkJUcmVlXCIsXHJcbiAgICAgICAgICB2YWx1ZTogaW5kZXhPcHRzLmNvbHVtbnMubWFwKChjKSA9PiBjb2xJZHMuZ2V0KGMpKVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJoYXNoXCI6XHJcbiAgICAgICAgYWxnb3JpdGhtID0ge1xyXG4gICAgICAgICAgdGFnOiBcIkhhc2hcIixcclxuICAgICAgICAgIHZhbHVlOiBpbmRleE9wdHMuY29sdW1ucy5tYXAoKGMpID0+IGNvbElkcy5nZXQoYykpXHJcbiAgICAgICAgfTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImRpcmVjdFwiOlxyXG4gICAgICAgIGFsZ29yaXRobSA9IHsgdGFnOiBcIkRpcmVjdFwiLCB2YWx1ZTogY29sSWRzLmdldChpbmRleE9wdHMuY29sdW1uKSB9O1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gICAgaW5kZXhlcy5wdXNoKHtcclxuICAgICAgc291cmNlTmFtZTogdm9pZCAwLFxyXG4gICAgICBhY2Nlc3Nvck5hbWU6IGluZGV4T3B0cy5hY2Nlc3NvcixcclxuICAgICAgYWxnb3JpdGhtLFxyXG4gICAgICBjYW5vbmljYWxOYW1lOiBpbmRleE9wdHMubmFtZVxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIGZvciAoY29uc3QgY29uc3RyYWludE9wdHMgb2Ygb3B0cy5jb25zdHJhaW50cyA/PyBbXSkge1xyXG4gICAgaWYgKGNvbnN0cmFpbnRPcHRzLmNvbnN0cmFpbnQgPT09IFwidW5pcXVlXCIpIHtcclxuICAgICAgY29uc3QgZGF0YSA9IHtcclxuICAgICAgICB0YWc6IFwiVW5pcXVlXCIsXHJcbiAgICAgICAgdmFsdWU6IHsgY29sdW1uczogY29uc3RyYWludE9wdHMuY29sdW1ucy5tYXAoKGMpID0+IGNvbElkcy5nZXQoYykpIH1cclxuICAgICAgfTtcclxuICAgICAgY29uc3RyYWludHMucHVzaCh7IHNvdXJjZU5hbWU6IGNvbnN0cmFpbnRPcHRzLm5hbWUsIGRhdGEgfSk7XHJcbiAgICAgIGNvbnRpbnVlO1xyXG4gICAgfVxyXG4gIH1cclxuICBjb25zdCBwcm9kdWN0VHlwZSA9IHJvdy5hbGdlYnJhaWNUeXBlLnZhbHVlO1xyXG4gIGNvbnN0IHNjaGVkdWxlID0gc2NoZWR1bGVkICYmIHNjaGVkdWxlQXRDb2wgIT09IHZvaWQgMCA/IHsgc2NoZWR1bGVBdENvbCwgcmVkdWNlcjogc2NoZWR1bGVkIH0gOiB2b2lkIDA7XHJcbiAgcmV0dXJuIHtcclxuICAgIHJvd1R5cGU6IHJvdyxcclxuICAgIHRhYmxlTmFtZTogbmFtZSxcclxuICAgIHJvd1NwYWNldGltZVR5cGU6IHByb2R1Y3RUeXBlLFxyXG4gICAgdGFibGVEZWY6IChjdHgsIGFjY05hbWUpID0+IHtcclxuICAgICAgY29uc3QgdGFibGVOYW1lID0gbmFtZSA/PyBhY2NOYW1lO1xyXG4gICAgICBpZiAocm93LnR5cGVOYW1lID09PSB2b2lkIDApIHtcclxuICAgICAgICByb3cudHlwZU5hbWUgPSB0b1Bhc2NhbENhc2UodGFibGVOYW1lKTtcclxuICAgICAgfVxyXG4gICAgICBmb3IgKGNvbnN0IGluZGV4IG9mIGluZGV4ZXMpIHtcclxuICAgICAgICBjb25zdCBjb2xzID0gaW5kZXguYWxnb3JpdGhtLnRhZyA9PT0gXCJEaXJlY3RcIiA/IFtpbmRleC5hbGdvcml0aG0udmFsdWVdIDogaW5kZXguYWxnb3JpdGhtLnZhbHVlO1xyXG4gICAgICAgIGNvbnN0IGNvbFMgPSBjb2xzLm1hcCgoaSkgPT4gY29sTmFtZUxpc3RbaV0pLmpvaW4oXCJfXCIpO1xyXG4gICAgICAgIGNvbnN0IHNvdXJjZU5hbWUgPSBpbmRleC5zb3VyY2VOYW1lID0gYCR7YWNjTmFtZX1fJHtjb2xTfV9pZHhfJHtpbmRleC5hbGdvcml0aG0udGFnLnRvTG93ZXJDYXNlKCl9YDtcclxuICAgICAgICBjb25zdCB7IGNhbm9uaWNhbE5hbWUgfSA9IGluZGV4O1xyXG4gICAgICAgIGlmIChjYW5vbmljYWxOYW1lICE9PSB2b2lkIDApIHtcclxuICAgICAgICAgIGN0eC5tb2R1bGVEZWYuZXhwbGljaXROYW1lcy5lbnRyaWVzLnB1c2goXHJcbiAgICAgICAgICAgIEV4cGxpY2l0TmFtZUVudHJ5LkluZGV4KHsgc291cmNlTmFtZSwgY2Fub25pY2FsTmFtZSB9KVxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzb3VyY2VOYW1lOiBhY2NOYW1lLFxyXG4gICAgICAgIHByb2R1Y3RUeXBlUmVmOiBjdHgucmVnaXN0ZXJUeXBlc1JlY3Vyc2l2ZWx5KHJvdykucmVmLFxyXG4gICAgICAgIHByaW1hcnlLZXk6IHBrLFxyXG4gICAgICAgIGluZGV4ZXMsXHJcbiAgICAgICAgY29uc3RyYWludHMsXHJcbiAgICAgICAgc2VxdWVuY2VzLFxyXG4gICAgICAgIHRhYmxlVHlwZTogeyB0YWc6IFwiVXNlclwiIH0sXHJcbiAgICAgICAgdGFibGVBY2Nlc3M6IHsgdGFnOiBpc1B1YmxpYyA/IFwiUHVibGljXCIgOiBcIlByaXZhdGVcIiB9LFxyXG4gICAgICAgIGRlZmF1bHRWYWx1ZXMsXHJcbiAgICAgICAgaXNFdmVudFxyXG4gICAgICB9O1xyXG4gICAgfSxcclxuICAgIGlkeHM6IHt9LFxyXG4gICAgY29uc3RyYWludHMsXHJcbiAgICBzY2hlZHVsZVxyXG4gIH07XHJcbn1cclxuXHJcbi8vIHNyYy9saWIvcXVlcnkudHNcclxudmFyIFF1ZXJ5QnJhbmQgPSBTeW1ib2woXCJRdWVyeUJyYW5kXCIpO1xyXG52YXIgaXNSb3dUeXBlZFF1ZXJ5ID0gKHZhbCkgPT4gISF2YWwgJiYgdHlwZW9mIHZhbCA9PT0gXCJvYmplY3RcIiAmJiBRdWVyeUJyYW5kIGluIHZhbDtcclxudmFyIGlzVHlwZWRRdWVyeSA9ICh2YWwpID0+ICEhdmFsICYmIHR5cGVvZiB2YWwgPT09IFwib2JqZWN0XCIgJiYgUXVlcnlCcmFuZCBpbiB2YWw7XHJcbmZ1bmN0aW9uIHRvU3FsKHEpIHtcclxuICByZXR1cm4gcS50b1NxbCgpO1xyXG59XHJcbnZhciBTZW1pam9pbkltcGwgPSBjbGFzcyBfU2VtaWpvaW5JbXBsIHtcclxuICBjb25zdHJ1Y3Rvcihzb3VyY2VRdWVyeSwgZmlsdGVyUXVlcnksIGpvaW5Db25kaXRpb24pIHtcclxuICAgIHRoaXMuc291cmNlUXVlcnkgPSBzb3VyY2VRdWVyeTtcclxuICAgIHRoaXMuZmlsdGVyUXVlcnkgPSBmaWx0ZXJRdWVyeTtcclxuICAgIHRoaXMuam9pbkNvbmRpdGlvbiA9IGpvaW5Db25kaXRpb247XHJcbiAgICBpZiAoc291cmNlUXVlcnkudGFibGUuc291cmNlTmFtZSA9PT0gZmlsdGVyUXVlcnkudGFibGUuc291cmNlTmFtZSkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3Qgc2VtaWpvaW4gYSB0YWJsZSB0byBpdHNlbGZcIik7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFtRdWVyeUJyYW5kXSA9IHRydWU7XHJcbiAgdHlwZSA9IFwic2VtaWpvaW5cIjtcclxuICBidWlsZCgpIHtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuICB3aGVyZShwcmVkaWNhdGUpIHtcclxuICAgIGNvbnN0IG5leHRTb3VyY2VRdWVyeSA9IHRoaXMuc291cmNlUXVlcnkud2hlcmUocHJlZGljYXRlKTtcclxuICAgIHJldHVybiBuZXcgX1NlbWlqb2luSW1wbChcclxuICAgICAgbmV4dFNvdXJjZVF1ZXJ5LFxyXG4gICAgICB0aGlzLmZpbHRlclF1ZXJ5LFxyXG4gICAgICB0aGlzLmpvaW5Db25kaXRpb25cclxuICAgICk7XHJcbiAgfVxyXG4gIHRvU3FsKCkge1xyXG4gICAgY29uc3QgbGVmdCA9IHRoaXMuZmlsdGVyUXVlcnk7XHJcbiAgICBjb25zdCByaWdodCA9IHRoaXMuc291cmNlUXVlcnk7XHJcbiAgICBjb25zdCBsZWZ0VGFibGUgPSBxdW90ZUlkZW50aWZpZXIobGVmdC50YWJsZS5zb3VyY2VOYW1lKTtcclxuICAgIGNvbnN0IHJpZ2h0VGFibGUgPSBxdW90ZUlkZW50aWZpZXIocmlnaHQudGFibGUuc291cmNlTmFtZSk7XHJcbiAgICBsZXQgc3FsID0gYFNFTEVDVCAke3JpZ2h0VGFibGV9LiogRlJPTSAke2xlZnRUYWJsZX0gSk9JTiAke3JpZ2h0VGFibGV9IE9OICR7Ym9vbGVhbkV4cHJUb1NxbCh0aGlzLmpvaW5Db25kaXRpb24pfWA7XHJcbiAgICBjb25zdCBjbGF1c2VzID0gW107XHJcbiAgICBpZiAobGVmdC53aGVyZUNsYXVzZSkge1xyXG4gICAgICBjbGF1c2VzLnB1c2goYm9vbGVhbkV4cHJUb1NxbChsZWZ0LndoZXJlQ2xhdXNlKSk7XHJcbiAgICB9XHJcbiAgICBpZiAocmlnaHQud2hlcmVDbGF1c2UpIHtcclxuICAgICAgY2xhdXNlcy5wdXNoKGJvb2xlYW5FeHByVG9TcWwocmlnaHQud2hlcmVDbGF1c2UpKTtcclxuICAgIH1cclxuICAgIGlmIChjbGF1c2VzLmxlbmd0aCA+IDApIHtcclxuICAgICAgY29uc3Qgd2hlcmVTcWwgPSBjbGF1c2VzLmxlbmd0aCA9PT0gMSA/IGNsYXVzZXNbMF0gOiBjbGF1c2VzLm1hcCh3cmFwSW5QYXJlbnMpLmpvaW4oXCIgQU5EIFwiKTtcclxuICAgICAgc3FsICs9IGAgV0hFUkUgJHt3aGVyZVNxbH1gO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNxbDtcclxuICB9XHJcbn07XHJcbnZhciBGcm9tQnVpbGRlciA9IGNsYXNzIF9Gcm9tQnVpbGRlciB7XHJcbiAgY29uc3RydWN0b3IodGFibGUyLCB3aGVyZUNsYXVzZSkge1xyXG4gICAgdGhpcy50YWJsZSA9IHRhYmxlMjtcclxuICAgIHRoaXMud2hlcmVDbGF1c2UgPSB3aGVyZUNsYXVzZTtcclxuICB9XHJcbiAgW1F1ZXJ5QnJhbmRdID0gdHJ1ZTtcclxuICB3aGVyZShwcmVkaWNhdGUpIHtcclxuICAgIGNvbnN0IG5ld0NvbmRpdGlvbiA9IHByZWRpY2F0ZSh0aGlzLnRhYmxlLmNvbHMpO1xyXG4gICAgY29uc3QgbmV4dFdoZXJlID0gdGhpcy53aGVyZUNsYXVzZSA/IHRoaXMud2hlcmVDbGF1c2UuYW5kKG5ld0NvbmRpdGlvbikgOiBuZXdDb25kaXRpb247XHJcbiAgICByZXR1cm4gbmV3IF9Gcm9tQnVpbGRlcih0aGlzLnRhYmxlLCBuZXh0V2hlcmUpO1xyXG4gIH1cclxuICByaWdodFNlbWlqb2luKHJpZ2h0LCBvbikge1xyXG4gICAgY29uc3Qgc291cmNlUXVlcnkgPSBuZXcgX0Zyb21CdWlsZGVyKHJpZ2h0KTtcclxuICAgIGNvbnN0IGpvaW5Db25kaXRpb24gPSBvbihcclxuICAgICAgdGhpcy50YWJsZS5pbmRleGVkQ29scyxcclxuICAgICAgcmlnaHQuaW5kZXhlZENvbHNcclxuICAgICk7XHJcbiAgICByZXR1cm4gbmV3IFNlbWlqb2luSW1wbChzb3VyY2VRdWVyeSwgdGhpcywgam9pbkNvbmRpdGlvbik7XHJcbiAgfVxyXG4gIGxlZnRTZW1pam9pbihyaWdodCwgb24pIHtcclxuICAgIGNvbnN0IGZpbHRlclF1ZXJ5ID0gbmV3IF9Gcm9tQnVpbGRlcihyaWdodCk7XHJcbiAgICBjb25zdCBqb2luQ29uZGl0aW9uID0gb24oXHJcbiAgICAgIHRoaXMudGFibGUuaW5kZXhlZENvbHMsXHJcbiAgICAgIHJpZ2h0LmluZGV4ZWRDb2xzXHJcbiAgICApO1xyXG4gICAgcmV0dXJuIG5ldyBTZW1pam9pbkltcGwodGhpcywgZmlsdGVyUXVlcnksIGpvaW5Db25kaXRpb24pO1xyXG4gIH1cclxuICB0b1NxbCgpIHtcclxuICAgIHJldHVybiByZW5kZXJTZWxlY3RTcWxXaXRoSm9pbnModGhpcy50YWJsZSwgdGhpcy53aGVyZUNsYXVzZSk7XHJcbiAgfVxyXG4gIGJ1aWxkKCkge1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG59O1xyXG52YXIgVGFibGVSZWZJbXBsID0gY2xhc3Mge1xyXG4gIFtRdWVyeUJyYW5kXSA9IHRydWU7XHJcbiAgdHlwZSA9IFwidGFibGVcIjtcclxuICBzb3VyY2VOYW1lO1xyXG4gIGFjY2Vzc29yTmFtZTtcclxuICBjb2xzO1xyXG4gIGluZGV4ZWRDb2xzO1xyXG4gIHRhYmxlRGVmO1xyXG4gIC8vIERlbGVnYXRlIFVudHlwZWRUYWJsZURlZiBwcm9wZXJ0aWVzIGZyb20gdGFibGVEZWYgc28gdGhpcyBjYW4gYmUgdXNlZCBhcyBhIHRhYmxlIGRlZi5cclxuICBnZXQgY29sdW1ucygpIHtcclxuICAgIHJldHVybiB0aGlzLnRhYmxlRGVmLmNvbHVtbnM7XHJcbiAgfVxyXG4gIGdldCBpbmRleGVzKCkge1xyXG4gICAgcmV0dXJuIHRoaXMudGFibGVEZWYuaW5kZXhlcztcclxuICB9XHJcbiAgZ2V0IHJvd1R5cGUoKSB7XHJcbiAgICByZXR1cm4gdGhpcy50YWJsZURlZi5yb3dUeXBlO1xyXG4gIH1cclxuICBnZXQgY29uc3RyYWludHMoKSB7XHJcbiAgICByZXR1cm4gdGhpcy50YWJsZURlZi5jb25zdHJhaW50cztcclxuICB9XHJcbiAgY29uc3RydWN0b3IodGFibGVEZWYpIHtcclxuICAgIHRoaXMuc291cmNlTmFtZSA9IHRhYmxlRGVmLnNvdXJjZU5hbWU7XHJcbiAgICB0aGlzLmFjY2Vzc29yTmFtZSA9IHRhYmxlRGVmLmFjY2Vzc29yTmFtZTtcclxuICAgIHRoaXMuY29scyA9IGNyZWF0ZVJvd0V4cHIodGFibGVEZWYpO1xyXG4gICAgdGhpcy5pbmRleGVkQ29scyA9IHRoaXMuY29scztcclxuICAgIHRoaXMudGFibGVEZWYgPSB0YWJsZURlZjtcclxuICAgIE9iamVjdC5mcmVlemUodGhpcyk7XHJcbiAgfVxyXG4gIGFzRnJvbSgpIHtcclxuICAgIHJldHVybiBuZXcgRnJvbUJ1aWxkZXIodGhpcyk7XHJcbiAgfVxyXG4gIHJpZ2h0U2VtaWpvaW4ob3RoZXIsIG9uKSB7XHJcbiAgICByZXR1cm4gdGhpcy5hc0Zyb20oKS5yaWdodFNlbWlqb2luKG90aGVyLCBvbik7XHJcbiAgfVxyXG4gIGxlZnRTZW1pam9pbihvdGhlciwgb24pIHtcclxuICAgIHJldHVybiB0aGlzLmFzRnJvbSgpLmxlZnRTZW1pam9pbihvdGhlciwgb24pO1xyXG4gIH1cclxuICBidWlsZCgpIHtcclxuICAgIHJldHVybiB0aGlzLmFzRnJvbSgpLmJ1aWxkKCk7XHJcbiAgfVxyXG4gIHRvU3FsKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuYXNGcm9tKCkudG9TcWwoKTtcclxuICB9XHJcbiAgd2hlcmUocHJlZGljYXRlKSB7XHJcbiAgICByZXR1cm4gdGhpcy5hc0Zyb20oKS53aGVyZShwcmVkaWNhdGUpO1xyXG4gIH1cclxufTtcclxuZnVuY3Rpb24gY3JlYXRlVGFibGVSZWZGcm9tRGVmKHRhYmxlRGVmKSB7XHJcbiAgcmV0dXJuIG5ldyBUYWJsZVJlZkltcGwodGFibGVEZWYpO1xyXG59XHJcbmZ1bmN0aW9uIG1ha2VRdWVyeUJ1aWxkZXIoc2NoZW1hMikge1xyXG4gIGNvbnN0IHFiID0gLyogQF9fUFVSRV9fICovIE9iamVjdC5jcmVhdGUobnVsbCk7XHJcbiAgZm9yIChjb25zdCB0YWJsZTIgb2YgT2JqZWN0LnZhbHVlcyhzY2hlbWEyLnRhYmxlcykpIHtcclxuICAgIGNvbnN0IHJlZiA9IGNyZWF0ZVRhYmxlUmVmRnJvbURlZihcclxuICAgICAgdGFibGUyXHJcbiAgICApO1xyXG4gICAgcWJbdGFibGUyLmFjY2Vzc29yTmFtZV0gPSByZWY7XHJcbiAgfVxyXG4gIHJldHVybiBPYmplY3QuZnJlZXplKHFiKTtcclxufVxyXG5mdW5jdGlvbiBjcmVhdGVSb3dFeHByKHRhYmxlRGVmKSB7XHJcbiAgY29uc3Qgcm93ID0ge307XHJcbiAgZm9yIChjb25zdCBjb2x1bW5OYW1lIG9mIE9iamVjdC5rZXlzKHRhYmxlRGVmLmNvbHVtbnMpKSB7XHJcbiAgICBjb25zdCBjb2x1bW5CdWlsZGVyID0gdGFibGVEZWYuY29sdW1uc1tjb2x1bW5OYW1lXTtcclxuICAgIGNvbnN0IGNvbHVtbiA9IG5ldyBDb2x1bW5FeHByZXNzaW9uKFxyXG4gICAgICB0YWJsZURlZi5zb3VyY2VOYW1lLFxyXG4gICAgICBjb2x1bW5OYW1lLFxyXG4gICAgICBjb2x1bW5CdWlsZGVyLnR5cGVCdWlsZGVyLmFsZ2VicmFpY1R5cGVcclxuICAgICk7XHJcbiAgICByb3dbY29sdW1uTmFtZV0gPSBPYmplY3QuZnJlZXplKGNvbHVtbik7XHJcbiAgfVxyXG4gIHJldHVybiBPYmplY3QuZnJlZXplKHJvdyk7XHJcbn1cclxuZnVuY3Rpb24gcmVuZGVyU2VsZWN0U3FsV2l0aEpvaW5zKHRhYmxlMiwgd2hlcmUsIGV4dHJhQ2xhdXNlcyA9IFtdKSB7XHJcbiAgY29uc3QgcXVvdGVkVGFibGUgPSBxdW90ZUlkZW50aWZpZXIodGFibGUyLnNvdXJjZU5hbWUpO1xyXG4gIGNvbnN0IHNxbCA9IGBTRUxFQ1QgKiBGUk9NICR7cXVvdGVkVGFibGV9YDtcclxuICBjb25zdCBjbGF1c2VzID0gW107XHJcbiAgaWYgKHdoZXJlKSBjbGF1c2VzLnB1c2goYm9vbGVhbkV4cHJUb1NxbCh3aGVyZSkpO1xyXG4gIGNsYXVzZXMucHVzaCguLi5leHRyYUNsYXVzZXMpO1xyXG4gIGlmIChjbGF1c2VzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHNxbDtcclxuICBjb25zdCB3aGVyZVNxbCA9IGNsYXVzZXMubGVuZ3RoID09PSAxID8gY2xhdXNlc1swXSA6IGNsYXVzZXMubWFwKHdyYXBJblBhcmVucykuam9pbihcIiBBTkQgXCIpO1xyXG4gIHJldHVybiBgJHtzcWx9IFdIRVJFICR7d2hlcmVTcWx9YDtcclxufVxyXG52YXIgQ29sdW1uRXhwcmVzc2lvbiA9IGNsYXNzIHtcclxuICB0eXBlID0gXCJjb2x1bW5cIjtcclxuICBjb2x1bW47XHJcbiAgdGFibGU7XHJcbiAgLy8gcGhhbnRvbTogYWN0dWFsIHJ1bnRpbWUgdmFsdWUgaXMgdW5kZWZpbmVkXHJcbiAgdHNWYWx1ZVR5cGU7XHJcbiAgc3BhY2V0aW1lVHlwZTtcclxuICBjb25zdHJ1Y3Rvcih0YWJsZTIsIGNvbHVtbiwgc3BhY2V0aW1lVHlwZSkge1xyXG4gICAgdGhpcy50YWJsZSA9IHRhYmxlMjtcclxuICAgIHRoaXMuY29sdW1uID0gY29sdW1uO1xyXG4gICAgdGhpcy5zcGFjZXRpbWVUeXBlID0gc3BhY2V0aW1lVHlwZTtcclxuICB9XHJcbiAgZXEoeCkge1xyXG4gICAgcmV0dXJuIG5ldyBCb29sZWFuRXhwcih7XHJcbiAgICAgIHR5cGU6IFwiZXFcIixcclxuICAgICAgbGVmdDogdGhpcyxcclxuICAgICAgcmlnaHQ6IG5vcm1hbGl6ZVZhbHVlKHgpXHJcbiAgICB9KTtcclxuICB9XHJcbiAgbmUoeCkge1xyXG4gICAgcmV0dXJuIG5ldyBCb29sZWFuRXhwcih7XHJcbiAgICAgIHR5cGU6IFwibmVcIixcclxuICAgICAgbGVmdDogdGhpcyxcclxuICAgICAgcmlnaHQ6IG5vcm1hbGl6ZVZhbHVlKHgpXHJcbiAgICB9KTtcclxuICB9XHJcbiAgbHQoeCkge1xyXG4gICAgcmV0dXJuIG5ldyBCb29sZWFuRXhwcih7XHJcbiAgICAgIHR5cGU6IFwibHRcIixcclxuICAgICAgbGVmdDogdGhpcyxcclxuICAgICAgcmlnaHQ6IG5vcm1hbGl6ZVZhbHVlKHgpXHJcbiAgICB9KTtcclxuICB9XHJcbiAgbHRlKHgpIHtcclxuICAgIHJldHVybiBuZXcgQm9vbGVhbkV4cHIoe1xyXG4gICAgICB0eXBlOiBcImx0ZVwiLFxyXG4gICAgICBsZWZ0OiB0aGlzLFxyXG4gICAgICByaWdodDogbm9ybWFsaXplVmFsdWUoeClcclxuICAgIH0pO1xyXG4gIH1cclxuICBndCh4KSB7XHJcbiAgICByZXR1cm4gbmV3IEJvb2xlYW5FeHByKHtcclxuICAgICAgdHlwZTogXCJndFwiLFxyXG4gICAgICBsZWZ0OiB0aGlzLFxyXG4gICAgICByaWdodDogbm9ybWFsaXplVmFsdWUoeClcclxuICAgIH0pO1xyXG4gIH1cclxuICBndGUoeCkge1xyXG4gICAgcmV0dXJuIG5ldyBCb29sZWFuRXhwcih7XHJcbiAgICAgIHR5cGU6IFwiZ3RlXCIsXHJcbiAgICAgIGxlZnQ6IHRoaXMsXHJcbiAgICAgIHJpZ2h0OiBub3JtYWxpemVWYWx1ZSh4KVxyXG4gICAgfSk7XHJcbiAgfVxyXG59O1xyXG5mdW5jdGlvbiBsaXRlcmFsKHZhbHVlKSB7XHJcbiAgcmV0dXJuIHsgdHlwZTogXCJsaXRlcmFsXCIsIHZhbHVlIH07XHJcbn1cclxuZnVuY3Rpb24gbm9ybWFsaXplVmFsdWUodmFsKSB7XHJcbiAgaWYgKHZhbC50eXBlID09PSBcImxpdGVyYWxcIilcclxuICAgIHJldHVybiB2YWw7XHJcbiAgaWYgKHR5cGVvZiB2YWwgPT09IFwib2JqZWN0XCIgJiYgdmFsICE9IG51bGwgJiYgXCJ0eXBlXCIgaW4gdmFsICYmIHZhbC50eXBlID09PSBcImNvbHVtblwiKSB7XHJcbiAgICByZXR1cm4gdmFsO1xyXG4gIH1cclxuICByZXR1cm4gbGl0ZXJhbCh2YWwpO1xyXG59XHJcbnZhciBCb29sZWFuRXhwciA9IGNsYXNzIF9Cb29sZWFuRXhwciB7XHJcbiAgY29uc3RydWN0b3IoZGF0YSkge1xyXG4gICAgdGhpcy5kYXRhID0gZGF0YTtcclxuICB9XHJcbiAgYW5kKG90aGVyKSB7XHJcbiAgICByZXR1cm4gbmV3IF9Cb29sZWFuRXhwcih7IHR5cGU6IFwiYW5kXCIsIGNsYXVzZXM6IFt0aGlzLmRhdGEsIG90aGVyLmRhdGFdIH0pO1xyXG4gIH1cclxuICBvcihvdGhlcikge1xyXG4gICAgcmV0dXJuIG5ldyBfQm9vbGVhbkV4cHIoeyB0eXBlOiBcIm9yXCIsIGNsYXVzZXM6IFt0aGlzLmRhdGEsIG90aGVyLmRhdGFdIH0pO1xyXG4gIH1cclxuICBub3QoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9Cb29sZWFuRXhwcih7IHR5cGU6IFwibm90XCIsIGNsYXVzZTogdGhpcy5kYXRhIH0pO1xyXG4gIH1cclxufTtcclxuZnVuY3Rpb24gbm90KGNsYXVzZSkge1xyXG4gIHJldHVybiBuZXcgQm9vbGVhbkV4cHIoeyB0eXBlOiBcIm5vdFwiLCBjbGF1c2U6IGNsYXVzZS5kYXRhIH0pO1xyXG59XHJcbmZ1bmN0aW9uIGFuZCguLi5jbGF1c2VzKSB7XHJcbiAgcmV0dXJuIG5ldyBCb29sZWFuRXhwcih7XHJcbiAgICB0eXBlOiBcImFuZFwiLFxyXG4gICAgY2xhdXNlczogY2xhdXNlcy5tYXAoKGMpID0+IGMuZGF0YSlcclxuICB9KTtcclxufVxyXG5mdW5jdGlvbiBvciguLi5jbGF1c2VzKSB7XHJcbiAgcmV0dXJuIG5ldyBCb29sZWFuRXhwcih7XHJcbiAgICB0eXBlOiBcIm9yXCIsXHJcbiAgICBjbGF1c2VzOiBjbGF1c2VzLm1hcCgoYykgPT4gYy5kYXRhKVxyXG4gIH0pO1xyXG59XHJcbmZ1bmN0aW9uIGJvb2xlYW5FeHByVG9TcWwoZXhwciwgdGFibGVBbGlhcykge1xyXG4gIGNvbnN0IGRhdGEgPSBleHByIGluc3RhbmNlb2YgQm9vbGVhbkV4cHIgPyBleHByLmRhdGEgOiBleHByO1xyXG4gIHN3aXRjaCAoZGF0YS50eXBlKSB7XHJcbiAgICBjYXNlIFwiZXFcIjpcclxuICAgICAgcmV0dXJuIGAke3ZhbHVlRXhwclRvU3FsKGRhdGEubGVmdCl9ID0gJHt2YWx1ZUV4cHJUb1NxbChkYXRhLnJpZ2h0KX1gO1xyXG4gICAgY2FzZSBcIm5lXCI6XHJcbiAgICAgIHJldHVybiBgJHt2YWx1ZUV4cHJUb1NxbChkYXRhLmxlZnQpfSA8PiAke3ZhbHVlRXhwclRvU3FsKGRhdGEucmlnaHQpfWA7XHJcbiAgICBjYXNlIFwiZ3RcIjpcclxuICAgICAgcmV0dXJuIGAke3ZhbHVlRXhwclRvU3FsKGRhdGEubGVmdCl9ID4gJHt2YWx1ZUV4cHJUb1NxbChkYXRhLnJpZ2h0KX1gO1xyXG4gICAgY2FzZSBcImd0ZVwiOlxyXG4gICAgICByZXR1cm4gYCR7dmFsdWVFeHByVG9TcWwoZGF0YS5sZWZ0KX0gPj0gJHt2YWx1ZUV4cHJUb1NxbChkYXRhLnJpZ2h0KX1gO1xyXG4gICAgY2FzZSBcImx0XCI6XHJcbiAgICAgIHJldHVybiBgJHt2YWx1ZUV4cHJUb1NxbChkYXRhLmxlZnQpfSA8ICR7dmFsdWVFeHByVG9TcWwoZGF0YS5yaWdodCl9YDtcclxuICAgIGNhc2UgXCJsdGVcIjpcclxuICAgICAgcmV0dXJuIGAke3ZhbHVlRXhwclRvU3FsKGRhdGEubGVmdCl9IDw9ICR7dmFsdWVFeHByVG9TcWwoZGF0YS5yaWdodCl9YDtcclxuICAgIGNhc2UgXCJhbmRcIjpcclxuICAgICAgcmV0dXJuIGRhdGEuY2xhdXNlcy5tYXAoKGMpID0+IGJvb2xlYW5FeHByVG9TcWwoYykpLm1hcCh3cmFwSW5QYXJlbnMpLmpvaW4oXCIgQU5EIFwiKTtcclxuICAgIGNhc2UgXCJvclwiOlxyXG4gICAgICByZXR1cm4gZGF0YS5jbGF1c2VzLm1hcCgoYykgPT4gYm9vbGVhbkV4cHJUb1NxbChjKSkubWFwKHdyYXBJblBhcmVucykuam9pbihcIiBPUiBcIik7XHJcbiAgICBjYXNlIFwibm90XCI6XHJcbiAgICAgIHJldHVybiBgTk9UICR7d3JhcEluUGFyZW5zKGJvb2xlYW5FeHByVG9TcWwoZGF0YS5jbGF1c2UpKX1gO1xyXG4gIH1cclxufVxyXG5mdW5jdGlvbiB3cmFwSW5QYXJlbnMoc3FsKSB7XHJcbiAgcmV0dXJuIGAoJHtzcWx9KWA7XHJcbn1cclxuZnVuY3Rpb24gdmFsdWVFeHByVG9TcWwoZXhwciwgdGFibGVBbGlhcykge1xyXG4gIGlmIChpc0xpdGVyYWxFeHByKGV4cHIpKSB7XHJcbiAgICByZXR1cm4gbGl0ZXJhbFZhbHVlVG9TcWwoZXhwci52YWx1ZSk7XHJcbiAgfVxyXG4gIGNvbnN0IHRhYmxlMiA9IGV4cHIudGFibGU7XHJcbiAgcmV0dXJuIGAke3F1b3RlSWRlbnRpZmllcih0YWJsZTIpfS4ke3F1b3RlSWRlbnRpZmllcihleHByLmNvbHVtbil9YDtcclxufVxyXG5mdW5jdGlvbiBsaXRlcmFsVmFsdWVUb1NxbCh2YWx1ZSkge1xyXG4gIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdm9pZCAwKSB7XHJcbiAgICByZXR1cm4gXCJOVUxMXCI7XHJcbiAgfVxyXG4gIGlmICh2YWx1ZSBpbnN0YW5jZW9mIElkZW50aXR5IHx8IHZhbHVlIGluc3RhbmNlb2YgQ29ubmVjdGlvbklkKSB7XHJcbiAgICByZXR1cm4gYDB4JHt2YWx1ZS50b0hleFN0cmluZygpfWA7XHJcbiAgfVxyXG4gIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFRpbWVzdGFtcCkge1xyXG4gICAgcmV0dXJuIGAnJHt2YWx1ZS50b0lTT1N0cmluZygpfSdgO1xyXG4gIH1cclxuICBzd2l0Y2ggKHR5cGVvZiB2YWx1ZSkge1xyXG4gICAgY2FzZSBcIm51bWJlclwiOlxyXG4gICAgY2FzZSBcImJpZ2ludFwiOlxyXG4gICAgICByZXR1cm4gU3RyaW5nKHZhbHVlKTtcclxuICAgIGNhc2UgXCJib29sZWFuXCI6XHJcbiAgICAgIHJldHVybiB2YWx1ZSA/IFwiVFJVRVwiIDogXCJGQUxTRVwiO1xyXG4gICAgY2FzZSBcInN0cmluZ1wiOlxyXG4gICAgICByZXR1cm4gYCcke3ZhbHVlLnJlcGxhY2UoLycvZywgXCInJ1wiKX0nYDtcclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIHJldHVybiBgJyR7SlNPTi5zdHJpbmdpZnkodmFsdWUpLnJlcGxhY2UoLycvZywgXCInJ1wiKX0nYDtcclxuICB9XHJcbn1cclxuZnVuY3Rpb24gcXVvdGVJZGVudGlmaWVyKG5hbWUpIHtcclxuICByZXR1cm4gYFwiJHtuYW1lLnJlcGxhY2UoL1wiL2csICdcIlwiJyl9XCJgO1xyXG59XHJcbmZ1bmN0aW9uIGlzTGl0ZXJhbEV4cHIoZXhwcikge1xyXG4gIHJldHVybiBleHByLnR5cGUgPT09IFwibGl0ZXJhbFwiO1xyXG59XHJcbmZ1bmN0aW9uIGV2YWx1YXRlQm9vbGVhbkV4cHIoZXhwciwgcm93KSB7XHJcbiAgcmV0dXJuIGV2YWx1YXRlRGF0YShleHByLmRhdGEsIHJvdyk7XHJcbn1cclxuZnVuY3Rpb24gZXZhbHVhdGVEYXRhKGRhdGEsIHJvdykge1xyXG4gIHN3aXRjaCAoZGF0YS50eXBlKSB7XHJcbiAgICBjYXNlIFwiZXFcIjpcclxuICAgICAgcmV0dXJuIHJlc29sdmVWYWx1ZShkYXRhLmxlZnQsIHJvdykgPT09IHJlc29sdmVWYWx1ZShkYXRhLnJpZ2h0LCByb3cpO1xyXG4gICAgY2FzZSBcIm5lXCI6XHJcbiAgICAgIHJldHVybiByZXNvbHZlVmFsdWUoZGF0YS5sZWZ0LCByb3cpICE9PSByZXNvbHZlVmFsdWUoZGF0YS5yaWdodCwgcm93KTtcclxuICAgIGNhc2UgXCJndFwiOlxyXG4gICAgICByZXR1cm4gcmVzb2x2ZVZhbHVlKGRhdGEubGVmdCwgcm93KSA+IHJlc29sdmVWYWx1ZShkYXRhLnJpZ2h0LCByb3cpO1xyXG4gICAgY2FzZSBcImd0ZVwiOlxyXG4gICAgICByZXR1cm4gcmVzb2x2ZVZhbHVlKGRhdGEubGVmdCwgcm93KSA+PSByZXNvbHZlVmFsdWUoZGF0YS5yaWdodCwgcm93KTtcclxuICAgIGNhc2UgXCJsdFwiOlxyXG4gICAgICByZXR1cm4gcmVzb2x2ZVZhbHVlKGRhdGEubGVmdCwgcm93KSA8IHJlc29sdmVWYWx1ZShkYXRhLnJpZ2h0LCByb3cpO1xyXG4gICAgY2FzZSBcImx0ZVwiOlxyXG4gICAgICByZXR1cm4gcmVzb2x2ZVZhbHVlKGRhdGEubGVmdCwgcm93KSA8PSByZXNvbHZlVmFsdWUoZGF0YS5yaWdodCwgcm93KTtcclxuICAgIGNhc2UgXCJhbmRcIjpcclxuICAgICAgcmV0dXJuIGRhdGEuY2xhdXNlcy5ldmVyeSgoYykgPT4gZXZhbHVhdGVEYXRhKGMsIHJvdykpO1xyXG4gICAgY2FzZSBcIm9yXCI6XHJcbiAgICAgIHJldHVybiBkYXRhLmNsYXVzZXMuc29tZSgoYykgPT4gZXZhbHVhdGVEYXRhKGMsIHJvdykpO1xyXG4gICAgY2FzZSBcIm5vdFwiOlxyXG4gICAgICByZXR1cm4gIWV2YWx1YXRlRGF0YShkYXRhLmNsYXVzZSwgcm93KTtcclxuICB9XHJcbn1cclxuZnVuY3Rpb24gcmVzb2x2ZVZhbHVlKGV4cHIsIHJvdykge1xyXG4gIGlmIChpc0xpdGVyYWxFeHByKGV4cHIpKSB7XHJcbiAgICByZXR1cm4gdG9Db21wYXJhYmxlVmFsdWUoZXhwci52YWx1ZSk7XHJcbiAgfVxyXG4gIHJldHVybiB0b0NvbXBhcmFibGVWYWx1ZShyb3dbZXhwci5jb2x1bW5dKTtcclxufVxyXG5mdW5jdGlvbiBpc0hleFNlcmlhbGl6YWJsZUxpa2UodmFsdWUpIHtcclxuICByZXR1cm4gISF2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIHZhbHVlLnRvSGV4U3RyaW5nID09PSBcImZ1bmN0aW9uXCI7XHJcbn1cclxuZnVuY3Rpb24gaXNUaW1lc3RhbXBMaWtlKHZhbHVlKSB7XHJcbiAgaWYgKCF2YWx1ZSB8fCB0eXBlb2YgdmFsdWUgIT09IFwib2JqZWN0XCIpIHJldHVybiBmYWxzZTtcclxuICBpZiAodmFsdWUgaW5zdGFuY2VvZiBUaW1lc3RhbXApIHJldHVybiB0cnVlO1xyXG4gIGNvbnN0IG1pY3JvcyA9IHZhbHVlW1wiX190aW1lc3RhbXBfbWljcm9zX3NpbmNlX3VuaXhfZXBvY2hfX1wiXTtcclxuICByZXR1cm4gdHlwZW9mIG1pY3JvcyA9PT0gXCJiaWdpbnRcIjtcclxufVxyXG5mdW5jdGlvbiB0b0NvbXBhcmFibGVWYWx1ZSh2YWx1ZSkge1xyXG4gIGlmIChpc0hleFNlcmlhbGl6YWJsZUxpa2UodmFsdWUpKSB7XHJcbiAgICByZXR1cm4gdmFsdWUudG9IZXhTdHJpbmcoKTtcclxuICB9XHJcbiAgaWYgKGlzVGltZXN0YW1wTGlrZSh2YWx1ZSkpIHtcclxuICAgIHJldHVybiB2YWx1ZS5fX3RpbWVzdGFtcF9taWNyb3Nfc2luY2VfdW5peF9lcG9jaF9fO1xyXG4gIH1cclxuICByZXR1cm4gdmFsdWU7XHJcbn1cclxuZnVuY3Rpb24gZ2V0UXVlcnlUYWJsZU5hbWUocXVlcnkpIHtcclxuICBpZiAocXVlcnkudGFibGUpIHJldHVybiBxdWVyeS50YWJsZS5uYW1lO1xyXG4gIGlmIChxdWVyeS5uYW1lKSByZXR1cm4gcXVlcnkubmFtZTtcclxuICBpZiAocXVlcnkuc291cmNlUXVlcnkpIHJldHVybiBxdWVyeS5zb3VyY2VRdWVyeS50YWJsZS5uYW1lO1xyXG4gIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBleHRyYWN0IHRhYmxlIG5hbWUgZnJvbSBxdWVyeVwiKTtcclxufVxyXG5mdW5jdGlvbiBnZXRRdWVyeUFjY2Vzc29yTmFtZShxdWVyeSkge1xyXG4gIGlmIChxdWVyeS50YWJsZSkgcmV0dXJuIHF1ZXJ5LnRhYmxlLmFjY2Vzc29yTmFtZTtcclxuICBpZiAocXVlcnkuYWNjZXNzb3JOYW1lKSByZXR1cm4gcXVlcnkuYWNjZXNzb3JOYW1lO1xyXG4gIGlmIChxdWVyeS5zb3VyY2VRdWVyeSkgcmV0dXJuIHF1ZXJ5LnNvdXJjZVF1ZXJ5LnRhYmxlLmFjY2Vzc29yTmFtZTtcclxuICB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZXh0cmFjdCBhY2Nlc3NvciBuYW1lIGZyb20gcXVlcnlcIik7XHJcbn1cclxuZnVuY3Rpb24gZ2V0UXVlcnlXaGVyZUNsYXVzZShxdWVyeSkge1xyXG4gIGlmIChxdWVyeS53aGVyZUNsYXVzZSkgcmV0dXJuIHF1ZXJ5LndoZXJlQ2xhdXNlO1xyXG4gIHJldHVybiB2b2lkIDA7XHJcbn1cclxuXHJcbi8vIHNyYy9zZXJ2ZXIvdmlld3MudHNcclxuZnVuY3Rpb24gbWFrZVZpZXdFeHBvcnQoY3R4LCBvcHRzLCBwYXJhbXMsIHJldCwgZm4pIHtcclxuICBjb25zdCB2aWV3RXhwb3J0ID0gKFxyXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0eXBlc2NyaXB0IGluY29ycmVjdGx5IHNheXMgRnVuY3Rpb24jYmluZCByZXF1aXJlcyBhbiBhcmd1bWVudC5cclxuICAgIGZuLmJpbmQoKVxyXG4gICk7XHJcbiAgdmlld0V4cG9ydFtleHBvcnRDb250ZXh0XSA9IGN0eDtcclxuICB2aWV3RXhwb3J0W3JlZ2lzdGVyRXhwb3J0XSA9IChjdHgyLCBleHBvcnROYW1lKSA9PiB7XHJcbiAgICByZWdpc3RlclZpZXcoY3R4Miwgb3B0cywgZXhwb3J0TmFtZSwgZmFsc2UsIHBhcmFtcywgcmV0LCBmbik7XHJcbiAgfTtcclxuICByZXR1cm4gdmlld0V4cG9ydDtcclxufVxyXG5mdW5jdGlvbiBtYWtlQW5vblZpZXdFeHBvcnQoY3R4LCBvcHRzLCBwYXJhbXMsIHJldCwgZm4pIHtcclxuICBjb25zdCB2aWV3RXhwb3J0ID0gKFxyXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0eXBlc2NyaXB0IGluY29ycmVjdGx5IHNheXMgRnVuY3Rpb24jYmluZCByZXF1aXJlcyBhbiBhcmd1bWVudC5cclxuICAgIGZuLmJpbmQoKVxyXG4gICk7XHJcbiAgdmlld0V4cG9ydFtleHBvcnRDb250ZXh0XSA9IGN0eDtcclxuICB2aWV3RXhwb3J0W3JlZ2lzdGVyRXhwb3J0XSA9IChjdHgyLCBleHBvcnROYW1lKSA9PiB7XHJcbiAgICByZWdpc3RlclZpZXcoY3R4Miwgb3B0cywgZXhwb3J0TmFtZSwgdHJ1ZSwgcGFyYW1zLCByZXQsIGZuKTtcclxuICB9O1xyXG4gIHJldHVybiB2aWV3RXhwb3J0O1xyXG59XHJcbmZ1bmN0aW9uIHJlZ2lzdGVyVmlldyhjdHgsIG9wdHMsIGV4cG9ydE5hbWUsIGFub24sIHBhcmFtcywgcmV0LCBmbikge1xyXG4gIGNvbnN0IHBhcmFtc0J1aWxkZXIgPSBuZXcgUm93QnVpbGRlcihwYXJhbXMsIHRvUGFzY2FsQ2FzZShleHBvcnROYW1lKSk7XHJcbiAgbGV0IHJldHVyblR5cGUgPSBjdHgucmVnaXN0ZXJUeXBlc1JlY3Vyc2l2ZWx5KHJldCkuYWxnZWJyYWljVHlwZTtcclxuICBjb25zdCB7IHR5cGVzcGFjZSB9ID0gY3R4O1xyXG4gIGNvbnN0IHsgdmFsdWU6IHBhcmFtVHlwZSB9ID0gY3R4LnJlc29sdmVUeXBlKFxyXG4gICAgY3R4LnJlZ2lzdGVyVHlwZXNSZWN1cnNpdmVseShwYXJhbXNCdWlsZGVyKVxyXG4gICk7XHJcbiAgY3R4Lm1vZHVsZURlZi52aWV3cy5wdXNoKHtcclxuICAgIHNvdXJjZU5hbWU6IGV4cG9ydE5hbWUsXHJcbiAgICBpbmRleDogKGFub24gPyBjdHguYW5vblZpZXdzIDogY3R4LnZpZXdzKS5sZW5ndGgsXHJcbiAgICBpc1B1YmxpYzogb3B0cy5wdWJsaWMsXHJcbiAgICBpc0Fub255bW91czogYW5vbixcclxuICAgIHBhcmFtczogcGFyYW1UeXBlLFxyXG4gICAgcmV0dXJuVHlwZVxyXG4gIH0pO1xyXG4gIGlmIChvcHRzLm5hbWUgIT0gbnVsbCkge1xyXG4gICAgY3R4Lm1vZHVsZURlZi5leHBsaWNpdE5hbWVzLmVudHJpZXMucHVzaCh7XHJcbiAgICAgIHRhZzogXCJGdW5jdGlvblwiLFxyXG4gICAgICB2YWx1ZToge1xyXG4gICAgICAgIHNvdXJjZU5hbWU6IGV4cG9ydE5hbWUsXHJcbiAgICAgICAgY2Fub25pY2FsTmFtZTogb3B0cy5uYW1lXHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuICBpZiAocmV0dXJuVHlwZS50YWcgPT0gXCJTdW1cIikge1xyXG4gICAgY29uc3Qgb3JpZ2luYWxGbiA9IGZuO1xyXG4gICAgZm4gPSAoKGN0eDIsIGFyZ3MpID0+IHtcclxuICAgICAgY29uc3QgcmV0MiA9IG9yaWdpbmFsRm4oY3R4MiwgYXJncyk7XHJcbiAgICAgIHJldHVybiByZXQyID09IG51bGwgPyBbXSA6IFtyZXQyXTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuVHlwZSA9IEFsZ2VicmFpY1R5cGUuQXJyYXkoXHJcbiAgICAgIHJldHVyblR5cGUudmFsdWUudmFyaWFudHNbMF0uYWxnZWJyYWljVHlwZVxyXG4gICAgKTtcclxuICB9XHJcbiAgKGFub24gPyBjdHguYW5vblZpZXdzIDogY3R4LnZpZXdzKS5wdXNoKHtcclxuICAgIGZuLFxyXG4gICAgZGVzZXJpYWxpemVQYXJhbXM6IFByb2R1Y3RUeXBlLm1ha2VEZXNlcmlhbGl6ZXIocGFyYW1UeXBlLCB0eXBlc3BhY2UpLFxyXG4gICAgc2VyaWFsaXplUmV0dXJuOiBBbGdlYnJhaWNUeXBlLm1ha2VTZXJpYWxpemVyKHJldHVyblR5cGUsIHR5cGVzcGFjZSksXHJcbiAgICByZXR1cm5UeXBlQmFzZVNpemU6IGJzYXRuQmFzZVNpemUodHlwZXNwYWNlLCByZXR1cm5UeXBlKVxyXG4gIH0pO1xyXG59XHJcblxyXG4vLyBzcmMvbGliL2Vycm9ycy50c1xyXG52YXIgU2VuZGVyRXJyb3IgPSBjbGFzcyBleHRlbmRzIEVycm9yIHtcclxuICBjb25zdHJ1Y3RvcihtZXNzYWdlKSB7XHJcbiAgICBzdXBlcihtZXNzYWdlKTtcclxuICB9XHJcbiAgZ2V0IG5hbWUoKSB7XHJcbiAgICByZXR1cm4gXCJTZW5kZXJFcnJvclwiO1xyXG4gIH1cclxufTtcclxuXHJcbi8vIHNyYy9zZXJ2ZXIvZXJyb3JzLnRzXHJcbnZhciBTcGFjZXRpbWVIb3N0RXJyb3IgPSBjbGFzcyBleHRlbmRzIEVycm9yIHtcclxuICBjb25zdHJ1Y3RvcihtZXNzYWdlKSB7XHJcbiAgICBzdXBlcihtZXNzYWdlKTtcclxuICB9XHJcbiAgZ2V0IG5hbWUoKSB7XHJcbiAgICByZXR1cm4gXCJTcGFjZXRpbWVIb3N0RXJyb3JcIjtcclxuICB9XHJcbn07XHJcbnZhciBlcnJvckRhdGEgPSB7XHJcbiAgLyoqXHJcbiAgICogQSBnZW5lcmljIGVycm9yIGNsYXNzIGZvciB1bmtub3duIGVycm9yIGNvZGVzLlxyXG4gICAqL1xyXG4gIEhvc3RDYWxsRmFpbHVyZTogMSxcclxuICAvKipcclxuICAgKiBFcnJvciBpbmRpY2F0aW5nIHRoYXQgYW4gQUJJIGNhbGwgd2FzIG1hZGUgb3V0c2lkZSBvZiBhIHRyYW5zYWN0aW9uLlxyXG4gICAqL1xyXG4gIE5vdEluVHJhbnNhY3Rpb246IDIsXHJcbiAgLyoqXHJcbiAgICogRXJyb3IgaW5kaWNhdGluZyB0aGF0IEJTQVROIGRlY29kaW5nIGZhaWxlZC5cclxuICAgKiBUaGlzIHR5cGljYWxseSBtZWFucyB0aGF0IHRoZSBkYXRhIGNvdWxkIG5vdCBiZSBkZWNvZGVkIHRvIHRoZSBleHBlY3RlZCB0eXBlLlxyXG4gICAqL1xyXG4gIEJzYXRuRGVjb2RlRXJyb3I6IDMsXHJcbiAgLyoqXHJcbiAgICogRXJyb3IgaW5kaWNhdGluZyB0aGF0IGEgc3BlY2lmaWVkIHRhYmxlIGRvZXMgbm90IGV4aXN0LlxyXG4gICAqL1xyXG4gIE5vU3VjaFRhYmxlOiA0LFxyXG4gIC8qKlxyXG4gICAqIEVycm9yIGluZGljYXRpbmcgdGhhdCBhIHNwZWNpZmllZCBpbmRleCBkb2VzIG5vdCBleGlzdC5cclxuICAgKi9cclxuICBOb1N1Y2hJbmRleDogNSxcclxuICAvKipcclxuICAgKiBFcnJvciBpbmRpY2F0aW5nIHRoYXQgYSBzcGVjaWZpZWQgcm93IGl0ZXJhdG9yIGlzIG5vdCB2YWxpZC5cclxuICAgKi9cclxuICBOb1N1Y2hJdGVyOiA2LFxyXG4gIC8qKlxyXG4gICAqIEVycm9yIGluZGljYXRpbmcgdGhhdCBhIHNwZWNpZmllZCBjb25zb2xlIHRpbWVyIGRvZXMgbm90IGV4aXN0LlxyXG4gICAqL1xyXG4gIE5vU3VjaENvbnNvbGVUaW1lcjogNyxcclxuICAvKipcclxuICAgKiBFcnJvciBpbmRpY2F0aW5nIHRoYXQgYSBzcGVjaWZpZWQgYnl0ZXMgc291cmNlIG9yIHNpbmsgaXMgbm90IHZhbGlkLlxyXG4gICAqL1xyXG4gIE5vU3VjaEJ5dGVzOiA4LFxyXG4gIC8qKlxyXG4gICAqIEVycm9yIGluZGljYXRpbmcgdGhhdCBhIHByb3ZpZGVkIHNpbmsgaGFzIG5vIG1vcmUgc3BhY2UgbGVmdC5cclxuICAgKi9cclxuICBOb1NwYWNlOiA5LFxyXG4gIC8qKlxyXG4gICAqIEVycm9yIGluZGljYXRpbmcgdGhhdCB0aGVyZSBpcyBubyBtb3JlIHNwYWNlIGluIHRoZSBkYXRhYmFzZS5cclxuICAgKi9cclxuICBCdWZmZXJUb29TbWFsbDogMTEsXHJcbiAgLyoqXHJcbiAgICogRXJyb3IgaW5kaWNhdGluZyB0aGF0IGEgdmFsdWUgd2l0aCBhIGdpdmVuIHVuaXF1ZSBpZGVudGlmaWVyIGFscmVhZHkgZXhpc3RzLlxyXG4gICAqL1xyXG4gIFVuaXF1ZUFscmVhZHlFeGlzdHM6IDEyLFxyXG4gIC8qKlxyXG4gICAqIEVycm9yIGluZGljYXRpbmcgdGhhdCB0aGUgc3BlY2lmaWVkIGRlbGF5IGluIHNjaGVkdWxpbmcgYSByb3cgd2FzIHRvbyBsb25nLlxyXG4gICAqL1xyXG4gIFNjaGVkdWxlQXREZWxheVRvb0xvbmc6IDEzLFxyXG4gIC8qKlxyXG4gICAqIEVycm9yIGluZGljYXRpbmcgdGhhdCBhbiBpbmRleCB3YXMgbm90IHVuaXF1ZSB3aGVuIGl0IHdhcyBleHBlY3RlZCB0byBiZS5cclxuICAgKi9cclxuICBJbmRleE5vdFVuaXF1ZTogMTQsXHJcbiAgLyoqXHJcbiAgICogRXJyb3IgaW5kaWNhdGluZyB0aGF0IGFuIGluZGV4IHdhcyBub3QgdW5pcXVlIHdoZW4gaXQgd2FzIGV4cGVjdGVkIHRvIGJlLlxyXG4gICAqL1xyXG4gIE5vU3VjaFJvdzogMTUsXHJcbiAgLyoqXHJcbiAgICogRXJyb3IgaW5kaWNhdGluZyB0aGF0IGFuIGF1dG8taW5jcmVtZW50IHNlcXVlbmNlIGhhcyBvdmVyZmxvd2VkLlxyXG4gICAqL1xyXG4gIEF1dG9JbmNPdmVyZmxvdzogMTYsXHJcbiAgV291bGRCbG9ja1RyYW5zYWN0aW9uOiAxNyxcclxuICBUcmFuc2FjdGlvbk5vdEFub255bW91czogMTgsXHJcbiAgVHJhbnNhY3Rpb25Jc1JlYWRPbmx5OiAxOSxcclxuICBUcmFuc2FjdGlvbklzTXV0OiAyMCxcclxuICBIdHRwRXJyb3I6IDIxXHJcbn07XHJcbmZ1bmN0aW9uIG1hcEVudHJpZXMoeCwgZikge1xyXG4gIHJldHVybiBPYmplY3QuZnJvbUVudHJpZXMoXHJcbiAgICBPYmplY3QuZW50cmllcyh4KS5tYXAoKFtrLCB2XSkgPT4gW2ssIGYoaywgdildKVxyXG4gICk7XHJcbn1cclxudmFyIGVycm5vVG9DbGFzcyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XHJcbnZhciBlcnJvcnMgPSBPYmplY3QuZnJlZXplKFxyXG4gIG1hcEVudHJpZXMoZXJyb3JEYXRhLCAobmFtZSwgY29kZSkgPT4ge1xyXG4gICAgY29uc3QgY2xzID0gT2JqZWN0LmRlZmluZVByb3BlcnR5KFxyXG4gICAgICBjbGFzcyBleHRlbmRzIFNwYWNldGltZUhvc3RFcnJvciB7XHJcbiAgICAgICAgZ2V0IG5hbWUoKSB7XHJcbiAgICAgICAgICByZXR1cm4gbmFtZTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIFwibmFtZVwiLFxyXG4gICAgICB7IHZhbHVlOiBuYW1lLCB3cml0YWJsZTogZmFsc2UgfVxyXG4gICAgKTtcclxuICAgIGVycm5vVG9DbGFzcy5zZXQoY29kZSwgY2xzKTtcclxuICAgIHJldHVybiBjbHM7XHJcbiAgfSlcclxuKTtcclxuZnVuY3Rpb24gZ2V0RXJyb3JDb25zdHJ1Y3Rvcihjb2RlKSB7XHJcbiAgcmV0dXJuIGVycm5vVG9DbGFzcy5nZXQoY29kZSkgPz8gU3BhY2V0aW1lSG9zdEVycm9yO1xyXG59XHJcblxyXG4vLyAuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vcHVyZS1yYW5kQDcuMC4xL25vZGVfbW9kdWxlcy9wdXJlLXJhbmQvbGliL2VzbS9kaXN0cmlidXRpb24vVW5zYWZlVW5pZm9ybUJpZ0ludERpc3RyaWJ1dGlvbi5qc1xyXG52YXIgU0JpZ0ludCA9IHR5cGVvZiBCaWdJbnQgIT09IFwidW5kZWZpbmVkXCIgPyBCaWdJbnQgOiB2b2lkIDA7XHJcbnZhciBPbmUgPSB0eXBlb2YgQmlnSW50ICE9PSBcInVuZGVmaW5lZFwiID8gQmlnSW50KDEpIDogdm9pZCAwO1xyXG52YXIgVGhpcnR5VHdvID0gdHlwZW9mIEJpZ0ludCAhPT0gXCJ1bmRlZmluZWRcIiA/IEJpZ0ludCgzMikgOiB2b2lkIDA7XHJcbnZhciBOdW1WYWx1ZXMgPSB0eXBlb2YgQmlnSW50ICE9PSBcInVuZGVmaW5lZFwiID8gQmlnSW50KDQyOTQ5NjcyOTYpIDogdm9pZCAwO1xyXG5mdW5jdGlvbiB1bnNhZmVVbmlmb3JtQmlnSW50RGlzdHJpYnV0aW9uKGZyb20sIHRvLCBybmcpIHtcclxuICB2YXIgZGlmZiA9IHRvIC0gZnJvbSArIE9uZTtcclxuICB2YXIgRmluYWxOdW1WYWx1ZXMgPSBOdW1WYWx1ZXM7XHJcbiAgdmFyIE51bUl0ZXJhdGlvbnMgPSAxO1xyXG4gIHdoaWxlIChGaW5hbE51bVZhbHVlcyA8IGRpZmYpIHtcclxuICAgIEZpbmFsTnVtVmFsdWVzIDw8PSBUaGlydHlUd287XHJcbiAgICArK051bUl0ZXJhdGlvbnM7XHJcbiAgfVxyXG4gIHZhciB2YWx1ZSA9IGdlbmVyYXRlTmV4dChOdW1JdGVyYXRpb25zLCBybmcpO1xyXG4gIGlmICh2YWx1ZSA8IGRpZmYpIHtcclxuICAgIHJldHVybiB2YWx1ZSArIGZyb207XHJcbiAgfVxyXG4gIGlmICh2YWx1ZSArIGRpZmYgPCBGaW5hbE51bVZhbHVlcykge1xyXG4gICAgcmV0dXJuIHZhbHVlICUgZGlmZiArIGZyb207XHJcbiAgfVxyXG4gIHZhciBNYXhBY2NlcHRlZFJhbmRvbSA9IEZpbmFsTnVtVmFsdWVzIC0gRmluYWxOdW1WYWx1ZXMgJSBkaWZmO1xyXG4gIHdoaWxlICh2YWx1ZSA+PSBNYXhBY2NlcHRlZFJhbmRvbSkge1xyXG4gICAgdmFsdWUgPSBnZW5lcmF0ZU5leHQoTnVtSXRlcmF0aW9ucywgcm5nKTtcclxuICB9XHJcbiAgcmV0dXJuIHZhbHVlICUgZGlmZiArIGZyb207XHJcbn1cclxuZnVuY3Rpb24gZ2VuZXJhdGVOZXh0KE51bUl0ZXJhdGlvbnMsIHJuZykge1xyXG4gIHZhciB2YWx1ZSA9IFNCaWdJbnQocm5nLnVuc2FmZU5leHQoKSArIDIxNDc0ODM2NDgpO1xyXG4gIGZvciAodmFyIG51bSA9IDE7IG51bSA8IE51bUl0ZXJhdGlvbnM7ICsrbnVtKSB7XHJcbiAgICB2YXIgb3V0ID0gcm5nLnVuc2FmZU5leHQoKTtcclxuICAgIHZhbHVlID0gKHZhbHVlIDw8IFRoaXJ0eVR3bykgKyBTQmlnSW50KG91dCArIDIxNDc0ODM2NDgpO1xyXG4gIH1cclxuICByZXR1cm4gdmFsdWU7XHJcbn1cclxuXHJcbi8vIC4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9wdXJlLXJhbmRANy4wLjEvbm9kZV9tb2R1bGVzL3B1cmUtcmFuZC9saWIvZXNtL2Rpc3RyaWJ1dGlvbi9pbnRlcm5hbHMvVW5zYWZlVW5pZm9ybUludERpc3RyaWJ1dGlvbkludGVybmFsLmpzXHJcbmZ1bmN0aW9uIHVuc2FmZVVuaWZvcm1JbnREaXN0cmlidXRpb25JbnRlcm5hbChyYW5nZVNpemUsIHJuZykge1xyXG4gIHZhciBNYXhBbGxvd2VkID0gcmFuZ2VTaXplID4gMiA/IH5+KDQyOTQ5NjcyOTYgLyByYW5nZVNpemUpICogcmFuZ2VTaXplIDogNDI5NDk2NzI5NjtcclxuICB2YXIgZGVsdGFWID0gcm5nLnVuc2FmZU5leHQoKSArIDIxNDc0ODM2NDg7XHJcbiAgd2hpbGUgKGRlbHRhViA+PSBNYXhBbGxvd2VkKSB7XHJcbiAgICBkZWx0YVYgPSBybmcudW5zYWZlTmV4dCgpICsgMjE0NzQ4MzY0ODtcclxuICB9XHJcbiAgcmV0dXJuIGRlbHRhViAlIHJhbmdlU2l6ZTtcclxufVxyXG5cclxuLy8gLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3B1cmUtcmFuZEA3LjAuMS9ub2RlX21vZHVsZXMvcHVyZS1yYW5kL2xpYi9lc20vZGlzdHJpYnV0aW9uL2ludGVybmFscy9BcnJheUludDY0LmpzXHJcbmZ1bmN0aW9uIGZyb21OdW1iZXJUb0FycmF5SW50NjQob3V0LCBuKSB7XHJcbiAgaWYgKG4gPCAwKSB7XHJcbiAgICB2YXIgcG9zTiA9IC1uO1xyXG4gICAgb3V0LnNpZ24gPSAtMTtcclxuICAgIG91dC5kYXRhWzBdID0gfn4ocG9zTiAvIDQyOTQ5NjcyOTYpO1xyXG4gICAgb3V0LmRhdGFbMV0gPSBwb3NOID4+PiAwO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBvdXQuc2lnbiA9IDE7XHJcbiAgICBvdXQuZGF0YVswXSA9IH5+KG4gLyA0Mjk0OTY3Mjk2KTtcclxuICAgIG91dC5kYXRhWzFdID0gbiA+Pj4gMDtcclxuICB9XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5mdW5jdGlvbiBzdWJzdHJhY3RBcnJheUludDY0KG91dCwgYXJyYXlJbnRBLCBhcnJheUludEIpIHtcclxuICB2YXIgbG93QSA9IGFycmF5SW50QS5kYXRhWzFdO1xyXG4gIHZhciBoaWdoQSA9IGFycmF5SW50QS5kYXRhWzBdO1xyXG4gIHZhciBzaWduQSA9IGFycmF5SW50QS5zaWduO1xyXG4gIHZhciBsb3dCID0gYXJyYXlJbnRCLmRhdGFbMV07XHJcbiAgdmFyIGhpZ2hCID0gYXJyYXlJbnRCLmRhdGFbMF07XHJcbiAgdmFyIHNpZ25CID0gYXJyYXlJbnRCLnNpZ247XHJcbiAgb3V0LnNpZ24gPSAxO1xyXG4gIGlmIChzaWduQSA9PT0gMSAmJiBzaWduQiA9PT0gLTEpIHtcclxuICAgIHZhciBsb3dfMSA9IGxvd0EgKyBsb3dCO1xyXG4gICAgdmFyIGhpZ2ggPSBoaWdoQSArIGhpZ2hCICsgKGxvd18xID4gNDI5NDk2NzI5NSA/IDEgOiAwKTtcclxuICAgIG91dC5kYXRhWzBdID0gaGlnaCA+Pj4gMDtcclxuICAgIG91dC5kYXRhWzFdID0gbG93XzEgPj4+IDA7XHJcbiAgICByZXR1cm4gb3V0O1xyXG4gIH1cclxuICB2YXIgbG93Rmlyc3QgPSBsb3dBO1xyXG4gIHZhciBoaWdoRmlyc3QgPSBoaWdoQTtcclxuICB2YXIgbG93U2Vjb25kID0gbG93QjtcclxuICB2YXIgaGlnaFNlY29uZCA9IGhpZ2hCO1xyXG4gIGlmIChzaWduQSA9PT0gLTEpIHtcclxuICAgIGxvd0ZpcnN0ID0gbG93QjtcclxuICAgIGhpZ2hGaXJzdCA9IGhpZ2hCO1xyXG4gICAgbG93U2Vjb25kID0gbG93QTtcclxuICAgIGhpZ2hTZWNvbmQgPSBoaWdoQTtcclxuICB9XHJcbiAgdmFyIHJlbWluZGVyTG93ID0gMDtcclxuICB2YXIgbG93ID0gbG93Rmlyc3QgLSBsb3dTZWNvbmQ7XHJcbiAgaWYgKGxvdyA8IDApIHtcclxuICAgIHJlbWluZGVyTG93ID0gMTtcclxuICAgIGxvdyA9IGxvdyA+Pj4gMDtcclxuICB9XHJcbiAgb3V0LmRhdGFbMF0gPSBoaWdoRmlyc3QgLSBoaWdoU2Vjb25kIC0gcmVtaW5kZXJMb3c7XHJcbiAgb3V0LmRhdGFbMV0gPSBsb3c7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLy8gLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3B1cmUtcmFuZEA3LjAuMS9ub2RlX21vZHVsZXMvcHVyZS1yYW5kL2xpYi9lc20vZGlzdHJpYnV0aW9uL2ludGVybmFscy9VbnNhZmVVbmlmb3JtQXJyYXlJbnREaXN0cmlidXRpb25JbnRlcm5hbC5qc1xyXG5mdW5jdGlvbiB1bnNhZmVVbmlmb3JtQXJyYXlJbnREaXN0cmlidXRpb25JbnRlcm5hbChvdXQsIHJhbmdlU2l6ZSwgcm5nKSB7XHJcbiAgdmFyIHJhbmdlTGVuZ3RoID0gcmFuZ2VTaXplLmxlbmd0aDtcclxuICB3aGlsZSAodHJ1ZSkge1xyXG4gICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCAhPT0gcmFuZ2VMZW5ndGg7ICsraW5kZXgpIHtcclxuICAgICAgdmFyIGluZGV4UmFuZ2VTaXplID0gaW5kZXggPT09IDAgPyByYW5nZVNpemVbMF0gKyAxIDogNDI5NDk2NzI5NjtcclxuICAgICAgdmFyIGcgPSB1bnNhZmVVbmlmb3JtSW50RGlzdHJpYnV0aW9uSW50ZXJuYWwoaW5kZXhSYW5nZVNpemUsIHJuZyk7XHJcbiAgICAgIG91dFtpbmRleF0gPSBnO1xyXG4gICAgfVxyXG4gICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCAhPT0gcmFuZ2VMZW5ndGg7ICsraW5kZXgpIHtcclxuICAgICAgdmFyIGN1cnJlbnQgPSBvdXRbaW5kZXhdO1xyXG4gICAgICB2YXIgY3VycmVudEluUmFuZ2UgPSByYW5nZVNpemVbaW5kZXhdO1xyXG4gICAgICBpZiAoY3VycmVudCA8IGN1cnJlbnRJblJhbmdlKSB7XHJcbiAgICAgICAgcmV0dXJuIG91dDtcclxuICAgICAgfSBlbHNlIGlmIChjdXJyZW50ID4gY3VycmVudEluUmFuZ2UpIHtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLy8gLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3B1cmUtcmFuZEA3LjAuMS9ub2RlX21vZHVsZXMvcHVyZS1yYW5kL2xpYi9lc20vZGlzdHJpYnV0aW9uL1Vuc2FmZVVuaWZvcm1JbnREaXN0cmlidXRpb24uanNcclxudmFyIHNhZmVOdW1iZXJNYXhTYWZlSW50ZWdlciA9IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSO1xyXG52YXIgc2hhcmVkQSA9IHsgc2lnbjogMSwgZGF0YTogWzAsIDBdIH07XHJcbnZhciBzaGFyZWRCID0geyBzaWduOiAxLCBkYXRhOiBbMCwgMF0gfTtcclxudmFyIHNoYXJlZEMgPSB7IHNpZ246IDEsIGRhdGE6IFswLCAwXSB9O1xyXG52YXIgc2hhcmVkRGF0YSA9IFswLCAwXTtcclxuZnVuY3Rpb24gdW5pZm9ybUxhcmdlSW50SW50ZXJuYWwoZnJvbSwgdG8sIHJhbmdlU2l6ZSwgcm5nKSB7XHJcbiAgdmFyIHJhbmdlU2l6ZUFycmF5SW50VmFsdWUgPSByYW5nZVNpemUgPD0gc2FmZU51bWJlck1heFNhZmVJbnRlZ2VyID8gZnJvbU51bWJlclRvQXJyYXlJbnQ2NChzaGFyZWRDLCByYW5nZVNpemUpIDogc3Vic3RyYWN0QXJyYXlJbnQ2NChzaGFyZWRDLCBmcm9tTnVtYmVyVG9BcnJheUludDY0KHNoYXJlZEEsIHRvKSwgZnJvbU51bWJlclRvQXJyYXlJbnQ2NChzaGFyZWRCLCBmcm9tKSk7XHJcbiAgaWYgKHJhbmdlU2l6ZUFycmF5SW50VmFsdWUuZGF0YVsxXSA9PT0gNDI5NDk2NzI5NSkge1xyXG4gICAgcmFuZ2VTaXplQXJyYXlJbnRWYWx1ZS5kYXRhWzBdICs9IDE7XHJcbiAgICByYW5nZVNpemVBcnJheUludFZhbHVlLmRhdGFbMV0gPSAwO1xyXG4gIH0gZWxzZSB7XHJcbiAgICByYW5nZVNpemVBcnJheUludFZhbHVlLmRhdGFbMV0gKz0gMTtcclxuICB9XHJcbiAgdW5zYWZlVW5pZm9ybUFycmF5SW50RGlzdHJpYnV0aW9uSW50ZXJuYWwoc2hhcmVkRGF0YSwgcmFuZ2VTaXplQXJyYXlJbnRWYWx1ZS5kYXRhLCBybmcpO1xyXG4gIHJldHVybiBzaGFyZWREYXRhWzBdICogNDI5NDk2NzI5NiArIHNoYXJlZERhdGFbMV0gKyBmcm9tO1xyXG59XHJcbmZ1bmN0aW9uIHVuc2FmZVVuaWZvcm1JbnREaXN0cmlidXRpb24oZnJvbSwgdG8sIHJuZykge1xyXG4gIHZhciByYW5nZVNpemUgPSB0byAtIGZyb207XHJcbiAgaWYgKHJhbmdlU2l6ZSA8PSA0Mjk0OTY3Mjk1KSB7XHJcbiAgICB2YXIgZyA9IHVuc2FmZVVuaWZvcm1JbnREaXN0cmlidXRpb25JbnRlcm5hbChyYW5nZVNpemUgKyAxLCBybmcpO1xyXG4gICAgcmV0dXJuIGcgKyBmcm9tO1xyXG4gIH1cclxuICByZXR1cm4gdW5pZm9ybUxhcmdlSW50SW50ZXJuYWwoZnJvbSwgdG8sIHJhbmdlU2l6ZSwgcm5nKTtcclxufVxyXG5cclxuLy8gLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3B1cmUtcmFuZEA3LjAuMS9ub2RlX21vZHVsZXMvcHVyZS1yYW5kL2xpYi9lc20vZ2VuZXJhdG9yL1hvcm9TaGlyby5qc1xyXG52YXIgWG9yb1NoaXJvMTI4UGx1cyA9IChmdW5jdGlvbigpIHtcclxuICBmdW5jdGlvbiBYb3JvU2hpcm8xMjhQbHVzMihzMDEsIHMwMCwgczExLCBzMTApIHtcclxuICAgIHRoaXMuczAxID0gczAxO1xyXG4gICAgdGhpcy5zMDAgPSBzMDA7XHJcbiAgICB0aGlzLnMxMSA9IHMxMTtcclxuICAgIHRoaXMuczEwID0gczEwO1xyXG4gIH1cclxuICBYb3JvU2hpcm8xMjhQbHVzMi5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiBuZXcgWG9yb1NoaXJvMTI4UGx1czIodGhpcy5zMDEsIHRoaXMuczAwLCB0aGlzLnMxMSwgdGhpcy5zMTApO1xyXG4gIH07XHJcbiAgWG9yb1NoaXJvMTI4UGx1czIucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBuZXh0Um5nID0gbmV3IFhvcm9TaGlybzEyOFBsdXMyKHRoaXMuczAxLCB0aGlzLnMwMCwgdGhpcy5zMTEsIHRoaXMuczEwKTtcclxuICAgIHZhciBvdXQgPSBuZXh0Um5nLnVuc2FmZU5leHQoKTtcclxuICAgIHJldHVybiBbb3V0LCBuZXh0Um5nXTtcclxuICB9O1xyXG4gIFhvcm9TaGlybzEyOFBsdXMyLnByb3RvdHlwZS51bnNhZmVOZXh0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgb3V0ID0gdGhpcy5zMDAgKyB0aGlzLnMxMCB8IDA7XHJcbiAgICB2YXIgYTAgPSB0aGlzLnMxMCBeIHRoaXMuczAwO1xyXG4gICAgdmFyIGExID0gdGhpcy5zMTEgXiB0aGlzLnMwMTtcclxuICAgIHZhciBzMDAgPSB0aGlzLnMwMDtcclxuICAgIHZhciBzMDEgPSB0aGlzLnMwMTtcclxuICAgIHRoaXMuczAwID0gczAwIDw8IDI0IF4gczAxID4+PiA4IF4gYTAgXiBhMCA8PCAxNjtcclxuICAgIHRoaXMuczAxID0gczAxIDw8IDI0IF4gczAwID4+PiA4IF4gYTEgXiAoYTEgPDwgMTYgfCBhMCA+Pj4gMTYpO1xyXG4gICAgdGhpcy5zMTAgPSBhMSA8PCA1IF4gYTAgPj4+IDI3O1xyXG4gICAgdGhpcy5zMTEgPSBhMCA8PCA1IF4gYTEgPj4+IDI3O1xyXG4gICAgcmV0dXJuIG91dDtcclxuICB9O1xyXG4gIFhvcm9TaGlybzEyOFBsdXMyLnByb3RvdHlwZS5qdW1wID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgbmV4dFJuZyA9IG5ldyBYb3JvU2hpcm8xMjhQbHVzMih0aGlzLnMwMSwgdGhpcy5zMDAsIHRoaXMuczExLCB0aGlzLnMxMCk7XHJcbiAgICBuZXh0Um5nLnVuc2FmZUp1bXAoKTtcclxuICAgIHJldHVybiBuZXh0Um5nO1xyXG4gIH07XHJcbiAgWG9yb1NoaXJvMTI4UGx1czIucHJvdG90eXBlLnVuc2FmZUp1bXAgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBuczAxID0gMDtcclxuICAgIHZhciBuczAwID0gMDtcclxuICAgIHZhciBuczExID0gMDtcclxuICAgIHZhciBuczEwID0gMDtcclxuICAgIHZhciBqdW1wID0gWzM2Mzk5NTY2NDUsIDM3NTA3NTcwMTIsIDEyNjE1Njg1MDgsIDM4NjQyNjMzNV07XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSAhPT0gNDsgKytpKSB7XHJcbiAgICAgIGZvciAodmFyIG1hc2sgPSAxOyBtYXNrOyBtYXNrIDw8PSAxKSB7XHJcbiAgICAgICAgaWYgKGp1bXBbaV0gJiBtYXNrKSB7XHJcbiAgICAgICAgICBuczAxIF49IHRoaXMuczAxO1xyXG4gICAgICAgICAgbnMwMCBePSB0aGlzLnMwMDtcclxuICAgICAgICAgIG5zMTEgXj0gdGhpcy5zMTE7XHJcbiAgICAgICAgICBuczEwIF49IHRoaXMuczEwO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnVuc2FmZU5leHQoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy5zMDEgPSBuczAxO1xyXG4gICAgdGhpcy5zMDAgPSBuczAwO1xyXG4gICAgdGhpcy5zMTEgPSBuczExO1xyXG4gICAgdGhpcy5zMTAgPSBuczEwO1xyXG4gIH07XHJcbiAgWG9yb1NoaXJvMTI4UGx1czIucHJvdG90eXBlLmdldFN0YXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gW3RoaXMuczAxLCB0aGlzLnMwMCwgdGhpcy5zMTEsIHRoaXMuczEwXTtcclxuICB9O1xyXG4gIHJldHVybiBYb3JvU2hpcm8xMjhQbHVzMjtcclxufSkoKTtcclxuZnVuY3Rpb24gZnJvbVN0YXRlKHN0YXRlKSB7XHJcbiAgdmFyIHZhbGlkID0gc3RhdGUubGVuZ3RoID09PSA0O1xyXG4gIGlmICghdmFsaWQpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcihcIlRoZSBzdGF0ZSBtdXN0IGhhdmUgYmVlbiBwcm9kdWNlZCBieSBhIHhvcm9zaGlybzEyOHBsdXMgUmFuZG9tR2VuZXJhdG9yXCIpO1xyXG4gIH1cclxuICByZXR1cm4gbmV3IFhvcm9TaGlybzEyOFBsdXMoc3RhdGVbMF0sIHN0YXRlWzFdLCBzdGF0ZVsyXSwgc3RhdGVbM10pO1xyXG59XHJcbnZhciB4b3Jvc2hpcm8xMjhwbHVzID0gT2JqZWN0LmFzc2lnbihmdW5jdGlvbihzZWVkKSB7XHJcbiAgcmV0dXJuIG5ldyBYb3JvU2hpcm8xMjhQbHVzKC0xLCB+c2VlZCwgc2VlZCB8IDAsIDApO1xyXG59LCB7IGZyb21TdGF0ZSB9KTtcclxuXHJcbi8vIHNyYy9zZXJ2ZXIvcm5nLnRzXHJcbnZhciB7IGFzVWludE4gfSA9IEJpZ0ludDtcclxuZnVuY3Rpb24gcGNnMzIoc3RhdGUpIHtcclxuICBjb25zdCBNVUwgPSA2MzY0MTM2MjIzODQ2NzkzMDA1bjtcclxuICBjb25zdCBJTkMgPSAxMTYzNDU4MDAyNzQ2MjI2MDcyM247XHJcbiAgc3RhdGUgPSBhc1VpbnROKDY0LCBzdGF0ZSAqIE1VTCArIElOQyk7XHJcbiAgY29uc3QgeG9yc2hpZnRlZCA9IE51bWJlcihhc1VpbnROKDMyLCAoc3RhdGUgPj4gMThuIF4gc3RhdGUpID4+IDI3bikpO1xyXG4gIGNvbnN0IHJvdCA9IE51bWJlcihhc1VpbnROKDMyLCBzdGF0ZSA+PiA1OW4pKTtcclxuICByZXR1cm4geG9yc2hpZnRlZCA+PiByb3QgfCB4b3JzaGlmdGVkIDw8IDMyIC0gcm90O1xyXG59XHJcbmZ1bmN0aW9uIGdlbmVyYXRlRmxvYXQ2NChybmcpIHtcclxuICBjb25zdCBnMSA9IHVuc2FmZVVuaWZvcm1JbnREaXN0cmlidXRpb24oMCwgKDEgPDwgMjYpIC0gMSwgcm5nKTtcclxuICBjb25zdCBnMiA9IHVuc2FmZVVuaWZvcm1JbnREaXN0cmlidXRpb24oMCwgKDEgPDwgMjcpIC0gMSwgcm5nKTtcclxuICBjb25zdCB2YWx1ZSA9IChnMSAqIE1hdGgucG93KDIsIDI3KSArIGcyKSAqIE1hdGgucG93KDIsIC01Myk7XHJcbiAgcmV0dXJuIHZhbHVlO1xyXG59XHJcbmZ1bmN0aW9uIG1ha2VSYW5kb20oc2VlZCkge1xyXG4gIGNvbnN0IHJuZyA9IHhvcm9zaGlybzEyOHBsdXMocGNnMzIoc2VlZC5taWNyb3NTaW5jZVVuaXhFcG9jaCkpO1xyXG4gIGNvbnN0IHJhbmRvbSA9ICgpID0+IGdlbmVyYXRlRmxvYXQ2NChybmcpO1xyXG4gIHJhbmRvbS5maWxsID0gKGFycmF5KSA9PiB7XHJcbiAgICBjb25zdCBlbGVtID0gYXJyYXkuYXQoMCk7XHJcbiAgICBpZiAodHlwZW9mIGVsZW0gPT09IFwiYmlnaW50XCIpIHtcclxuICAgICAgY29uc3QgdXBwZXIgPSAoMW4gPDwgQmlnSW50KGFycmF5LkJZVEVTX1BFUl9FTEVNRU5UICogOCkpIC0gMW47XHJcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBhcnJheVtpXSA9IHVuc2FmZVVuaWZvcm1CaWdJbnREaXN0cmlidXRpb24oMG4sIHVwcGVyLCBybmcpO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBlbGVtID09PSBcIm51bWJlclwiKSB7XHJcbiAgICAgIGNvbnN0IHVwcGVyID0gKDEgPDwgYXJyYXkuQllURVNfUEVSX0VMRU1FTlQgKiA4KSAtIDE7XHJcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBhcnJheVtpXSA9IHVuc2FmZVVuaWZvcm1JbnREaXN0cmlidXRpb24oMCwgdXBwZXIsIHJuZyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBhcnJheTtcclxuICB9O1xyXG4gIHJhbmRvbS51aW50MzIgPSAoKSA9PiBybmcudW5zYWZlTmV4dCgpO1xyXG4gIHJhbmRvbS5pbnRlZ2VySW5SYW5nZSA9IChtaW4sIG1heCkgPT4gdW5zYWZlVW5pZm9ybUludERpc3RyaWJ1dGlvbihtaW4sIG1heCwgcm5nKTtcclxuICByYW5kb20uYmlnaW50SW5SYW5nZSA9IChtaW4sIG1heCkgPT4gdW5zYWZlVW5pZm9ybUJpZ0ludERpc3RyaWJ1dGlvbihtaW4sIG1heCwgcm5nKTtcclxuICByZXR1cm4gcmFuZG9tO1xyXG59XHJcblxyXG4vLyBzcmMvc2VydmVyL3J1bnRpbWUudHNcclxudmFyIHsgZnJlZXplIH0gPSBPYmplY3Q7XHJcbnZhciBzeXMgPSBfc3lzY2FsbHMyXzA7XHJcbmZ1bmN0aW9uIHBhcnNlSnNvbk9iamVjdChqc29uKSB7XHJcbiAgbGV0IHZhbHVlO1xyXG4gIHRyeSB7XHJcbiAgICB2YWx1ZSA9IEpTT04ucGFyc2UoanNvbik7XHJcbiAgfSBjYXRjaCB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIEpTT046IGZhaWxlZCB0byBwYXJzZSBzdHJpbmdcIik7XHJcbiAgfVxyXG4gIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB0eXBlb2YgdmFsdWUgIT09IFwib2JqZWN0XCIgfHwgQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcihcIkV4cGVjdGVkIGEgSlNPTiBvYmplY3QgYXQgdGhlIHRvcCBsZXZlbFwiKTtcclxuICB9XHJcbiAgcmV0dXJuIHZhbHVlO1xyXG59XHJcbnZhciBKd3RDbGFpbXNJbXBsID0gY2xhc3Mge1xyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBuZXcgSnd0Q2xhaW1zIGluc3RhbmNlLlxyXG4gICAqIEBwYXJhbSByYXdQYXlsb2FkIFRoZSBKV1QgcGF5bG9hZCBhcyBhIHJhdyBKU09OIHN0cmluZy5cclxuICAgKiBAcGFyYW0gaWRlbnRpdHkgVGhlIGlkZW50aXR5IGZvciB0aGlzIEpXVC4gV2UgYXJlIG9ubHkgdGFraW5nIHRoaXMgYmVjYXVzZSB3ZSBkb24ndCBoYXZlIGEgYmxha2UzIGltcGxlbWVudGF0aW9uICh3aGljaCB3ZSBuZWVkIHRvIGNvbXB1dGUgaXQpLlxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKHJhd1BheWxvYWQsIGlkZW50aXR5KSB7XHJcbiAgICB0aGlzLnJhd1BheWxvYWQgPSByYXdQYXlsb2FkO1xyXG4gICAgdGhpcy5mdWxsUGF5bG9hZCA9IHBhcnNlSnNvbk9iamVjdChyYXdQYXlsb2FkKTtcclxuICAgIHRoaXMuX2lkZW50aXR5ID0gaWRlbnRpdHk7XHJcbiAgfVxyXG4gIGZ1bGxQYXlsb2FkO1xyXG4gIF9pZGVudGl0eTtcclxuICBnZXQgaWRlbnRpdHkoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5faWRlbnRpdHk7XHJcbiAgfVxyXG4gIGdldCBzdWJqZWN0KCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZnVsbFBheWxvYWRbXCJzdWJcIl07XHJcbiAgfVxyXG4gIGdldCBpc3N1ZXIoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5mdWxsUGF5bG9hZFtcImlzc1wiXTtcclxuICB9XHJcbiAgZ2V0IGF1ZGllbmNlKCkge1xyXG4gICAgY29uc3QgYXVkID0gdGhpcy5mdWxsUGF5bG9hZFtcImF1ZFwiXTtcclxuICAgIGlmIChhdWQgPT0gbnVsbCkge1xyXG4gICAgICByZXR1cm4gW107XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdHlwZW9mIGF1ZCA9PT0gXCJzdHJpbmdcIiA/IFthdWRdIDogYXVkO1xyXG4gIH1cclxufTtcclxudmFyIEF1dGhDdHhJbXBsID0gY2xhc3MgX0F1dGhDdHhJbXBsIHtcclxuICBpc0ludGVybmFsO1xyXG4gIC8vIFNvdXJjZSBvZiB0aGUgSldUIHBheWxvYWQgc3RyaW5nLCBpZiB0aGVyZSBpcyBvbmUuXHJcbiAgX2p3dFNvdXJjZTtcclxuICAvLyBXaGV0aGVyIHdlIGhhdmUgaW5pdGlhbGl6ZWQgdGhlIEpXVCBjbGFpbXMuXHJcbiAgX2luaXRpYWxpemVkSldUID0gZmFsc2U7XHJcbiAgX2p3dENsYWltcztcclxuICBfc2VuZGVySWRlbnRpdHk7XHJcbiAgY29uc3RydWN0b3Iob3B0cykge1xyXG4gICAgdGhpcy5pc0ludGVybmFsID0gb3B0cy5pc0ludGVybmFsO1xyXG4gICAgdGhpcy5fand0U291cmNlID0gb3B0cy5qd3RTb3VyY2U7XHJcbiAgICB0aGlzLl9zZW5kZXJJZGVudGl0eSA9IG9wdHMuc2VuZGVySWRlbnRpdHk7XHJcbiAgfVxyXG4gIF9pbml0aWFsaXplSldUKCkge1xyXG4gICAgaWYgKHRoaXMuX2luaXRpYWxpemVkSldUKSByZXR1cm47XHJcbiAgICB0aGlzLl9pbml0aWFsaXplZEpXVCA9IHRydWU7XHJcbiAgICBjb25zdCB0b2tlbiA9IHRoaXMuX2p3dFNvdXJjZSgpO1xyXG4gICAgaWYgKCF0b2tlbikge1xyXG4gICAgICB0aGlzLl9qd3RDbGFpbXMgPSBudWxsO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5fand0Q2xhaW1zID0gbmV3IEp3dENsYWltc0ltcGwodG9rZW4sIHRoaXMuX3NlbmRlcklkZW50aXR5KTtcclxuICAgIH1cclxuICAgIE9iamVjdC5mcmVlemUodGhpcyk7XHJcbiAgfVxyXG4gIC8qKiBMYXppbHkgY29tcHV0ZSB3aGV0aGVyIGEgSldUIGV4aXN0cyBhbmQgaXMgcGFyc2VhYmxlLiAqL1xyXG4gIGdldCBoYXNKV1QoKSB7XHJcbiAgICB0aGlzLl9pbml0aWFsaXplSldUKCk7XHJcbiAgICByZXR1cm4gdGhpcy5fand0Q2xhaW1zICE9PSBudWxsO1xyXG4gIH1cclxuICAvKiogTGF6aWx5IHBhcnNlIHRoZSBKd3RDbGFpbXMgb25seSB3aGVuIGFjY2Vzc2VkLiAqL1xyXG4gIGdldCBqd3QoKSB7XHJcbiAgICB0aGlzLl9pbml0aWFsaXplSldUKCk7XHJcbiAgICByZXR1cm4gdGhpcy5fand0Q2xhaW1zO1xyXG4gIH1cclxuICAvKiogQ3JlYXRlIGEgY29udGV4dCByZXByZXNlbnRpbmcgaW50ZXJuYWwgKG5vbi11c2VyKSByZXF1ZXN0cy4gKi9cclxuICBzdGF0aWMgaW50ZXJuYWwoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9BdXRoQ3R4SW1wbCh7XHJcbiAgICAgIGlzSW50ZXJuYWw6IHRydWUsXHJcbiAgICAgIGp3dFNvdXJjZTogKCkgPT4gbnVsbCxcclxuICAgICAgc2VuZGVySWRlbnRpdHk6IElkZW50aXR5Lnplcm8oKVxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIC8qKiBJZiB0aGVyZSBpcyBhIGNvbm5lY3Rpb24gaWQsIGxvb2sgdXAgdGhlIEpXVCBwYXlsb2FkIGZyb20gdGhlIHN5c3RlbSB0YWJsZXMuICovXHJcbiAgc3RhdGljIGZyb21TeXN0ZW1UYWJsZXMoY29ubmVjdGlvbklkLCBzZW5kZXIpIHtcclxuICAgIGlmIChjb25uZWN0aW9uSWQgPT09IG51bGwpIHtcclxuICAgICAgcmV0dXJuIG5ldyBfQXV0aEN0eEltcGwoe1xyXG4gICAgICAgIGlzSW50ZXJuYWw6IGZhbHNlLFxyXG4gICAgICAgIGp3dFNvdXJjZTogKCkgPT4gbnVsbCxcclxuICAgICAgICBzZW5kZXJJZGVudGl0eTogc2VuZGVyXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5ldyBfQXV0aEN0eEltcGwoe1xyXG4gICAgICBpc0ludGVybmFsOiBmYWxzZSxcclxuICAgICAgand0U291cmNlOiAoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgcGF5bG9hZEJ1ZiA9IHN5cy5nZXRfand0X3BheWxvYWQoY29ubmVjdGlvbklkLl9fY29ubmVjdGlvbl9pZF9fKTtcclxuICAgICAgICBpZiAocGF5bG9hZEJ1Zi5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xyXG4gICAgICAgIGNvbnN0IHBheWxvYWRTdHIgPSBuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUocGF5bG9hZEJ1Zik7XHJcbiAgICAgICAgcmV0dXJuIHBheWxvYWRTdHI7XHJcbiAgICAgIH0sXHJcbiAgICAgIHNlbmRlcklkZW50aXR5OiBzZW5kZXJcclxuICAgIH0pO1xyXG4gIH1cclxufTtcclxudmFyIFJlZHVjZXJDdHhJbXBsID0gY2xhc3MgUmVkdWNlckN0eCB7XHJcbiAgI2lkZW50aXR5O1xyXG4gICNzZW5kZXJBdXRoO1xyXG4gICN1dWlkQ291bnRlcjtcclxuICAjcmFuZG9tO1xyXG4gIHNlbmRlcjtcclxuICB0aW1lc3RhbXA7XHJcbiAgY29ubmVjdGlvbklkO1xyXG4gIGRiO1xyXG4gIGNvbnN0cnVjdG9yKHNlbmRlciwgdGltZXN0YW1wLCBjb25uZWN0aW9uSWQsIGRiVmlldykge1xyXG4gICAgT2JqZWN0LnNlYWwodGhpcyk7XHJcbiAgICB0aGlzLnNlbmRlciA9IHNlbmRlcjtcclxuICAgIHRoaXMudGltZXN0YW1wID0gdGltZXN0YW1wO1xyXG4gICAgdGhpcy5jb25uZWN0aW9uSWQgPSBjb25uZWN0aW9uSWQ7XHJcbiAgICB0aGlzLmRiID0gZGJWaWV3O1xyXG4gIH1cclxuICAvKiogUmVzZXQgdGhlIGBSZWR1Y2VyQ3R4YCB0byBiZSB1c2VkIGZvciBhIG5ldyB0cmFuc2FjdGlvbiAqL1xyXG4gIHN0YXRpYyByZXNldChtZSwgc2VuZGVyLCB0aW1lc3RhbXAsIGNvbm5lY3Rpb25JZCkge1xyXG4gICAgbWUuc2VuZGVyID0gc2VuZGVyO1xyXG4gICAgbWUudGltZXN0YW1wID0gdGltZXN0YW1wO1xyXG4gICAgbWUuY29ubmVjdGlvbklkID0gY29ubmVjdGlvbklkO1xyXG4gICAgbWUuI3V1aWRDb3VudGVyID0gdm9pZCAwO1xyXG4gICAgbWUuI3NlbmRlckF1dGggPSB2b2lkIDA7XHJcbiAgfVxyXG4gIGdldCBpZGVudGl0eSgpIHtcclxuICAgIHJldHVybiB0aGlzLiNpZGVudGl0eSA/Pz0gbmV3IElkZW50aXR5KHN5cy5pZGVudGl0eSgpKTtcclxuICB9XHJcbiAgZ2V0IHNlbmRlckF1dGgoKSB7XHJcbiAgICByZXR1cm4gdGhpcy4jc2VuZGVyQXV0aCA/Pz0gQXV0aEN0eEltcGwuZnJvbVN5c3RlbVRhYmxlcyhcclxuICAgICAgdGhpcy5jb25uZWN0aW9uSWQsXHJcbiAgICAgIHRoaXMuc2VuZGVyXHJcbiAgICApO1xyXG4gIH1cclxuICBnZXQgcmFuZG9tKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuI3JhbmRvbSA/Pz0gbWFrZVJhbmRvbSh0aGlzLnRpbWVzdGFtcCk7XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZSBhIG5ldyByYW5kb20ge0BsaW5rIFV1aWR9IGB2NGAgdXNpbmcgdGhpcyBgUmVkdWNlckN0eGAncyBSTkcuXHJcbiAgICovXHJcbiAgbmV3VXVpZFY0KCkge1xyXG4gICAgY29uc3QgYnl0ZXMgPSB0aGlzLnJhbmRvbS5maWxsKG5ldyBVaW50OEFycmF5KDE2KSk7XHJcbiAgICByZXR1cm4gVXVpZC5mcm9tUmFuZG9tQnl0ZXNWNChieXRlcyk7XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZSBhIG5ldyBzb3J0YWJsZSB7QGxpbmsgVXVpZH0gYHY3YCB1c2luZyB0aGlzIGBSZWR1Y2VyQ3R4YCdzIFJORywgY291bnRlcixcclxuICAgKiBhbmQgdGltZXN0YW1wLlxyXG4gICAqL1xyXG4gIG5ld1V1aWRWNygpIHtcclxuICAgIGNvbnN0IGJ5dGVzID0gdGhpcy5yYW5kb20uZmlsbChuZXcgVWludDhBcnJheSg0KSk7XHJcbiAgICBjb25zdCBjb3VudGVyID0gdGhpcy4jdXVpZENvdW50ZXIgPz89IHsgdmFsdWU6IDAgfTtcclxuICAgIHJldHVybiBVdWlkLmZyb21Db3VudGVyVjcoY291bnRlciwgdGhpcy50aW1lc3RhbXAsIGJ5dGVzKTtcclxuICB9XHJcbn07XHJcbnZhciBjYWxsVXNlckZ1bmN0aW9uID0gZnVuY3Rpb24gX19zcGFjZXRpbWVkYl9lbmRfc2hvcnRfYmFja3RyYWNlKGZuLCAuLi5hcmdzKSB7XHJcbiAgcmV0dXJuIGZuKC4uLmFyZ3MpO1xyXG59O1xyXG52YXIgbWFrZUhvb2tzID0gKHNjaGVtYTIpID0+IG5ldyBNb2R1bGVIb29rc0ltcGwoc2NoZW1hMik7XHJcbnZhciBNb2R1bGVIb29rc0ltcGwgPSBjbGFzcyB7XHJcbiAgI3NjaGVtYTtcclxuICAjZGJWaWV3XztcclxuICAjcmVkdWNlckFyZ3NEZXNlcmlhbGl6ZXJzO1xyXG4gIC8qKiBDYWNoZSB0aGUgYFJlZHVjZXJDdHhgIG9iamVjdCB0byBhdm9pZCBhbGxvY2F0aW5nIGFuZXcgZm9yIGV2ZXIgcmVkdWNlciBjYWxsLiAqL1xyXG4gICNyZWR1Y2VyQ3R4XztcclxuICBjb25zdHJ1Y3RvcihzY2hlbWEyKSB7XHJcbiAgICB0aGlzLiNzY2hlbWEgPSBzY2hlbWEyO1xyXG4gICAgdGhpcy4jcmVkdWNlckFyZ3NEZXNlcmlhbGl6ZXJzID0gc2NoZW1hMi5tb2R1bGVEZWYucmVkdWNlcnMubWFwKFxyXG4gICAgICAoeyBwYXJhbXMgfSkgPT4gUHJvZHVjdFR5cGUubWFrZURlc2VyaWFsaXplcihwYXJhbXMsIHNjaGVtYTIudHlwZXNwYWNlKVxyXG4gICAgKTtcclxuICB9XHJcbiAgZ2V0ICNkYlZpZXcoKSB7XHJcbiAgICByZXR1cm4gdGhpcy4jZGJWaWV3XyA/Pz0gZnJlZXplKFxyXG4gICAgICBPYmplY3QuZnJvbUVudHJpZXMoXHJcbiAgICAgICAgT2JqZWN0LnZhbHVlcyh0aGlzLiNzY2hlbWEuc2NoZW1hVHlwZS50YWJsZXMpLm1hcCgodGFibGUyKSA9PiBbXHJcbiAgICAgICAgICB0YWJsZTIuYWNjZXNzb3JOYW1lLFxyXG4gICAgICAgICAgbWFrZVRhYmxlVmlldyh0aGlzLiNzY2hlbWEudHlwZXNwYWNlLCB0YWJsZTIudGFibGVEZWYpXHJcbiAgICAgICAgXSlcclxuICAgICAgKVxyXG4gICAgKTtcclxuICB9XHJcbiAgZ2V0ICNyZWR1Y2VyQ3R4KCkge1xyXG4gICAgcmV0dXJuIHRoaXMuI3JlZHVjZXJDdHhfID8/PSBuZXcgUmVkdWNlckN0eEltcGwoXHJcbiAgICAgIElkZW50aXR5Lnplcm8oKSxcclxuICAgICAgVGltZXN0YW1wLlVOSVhfRVBPQ0gsXHJcbiAgICAgIG51bGwsXHJcbiAgICAgIHRoaXMuI2RiVmlld1xyXG4gICAgKTtcclxuICB9XHJcbiAgX19kZXNjcmliZV9tb2R1bGVfXygpIHtcclxuICAgIGNvbnN0IHdyaXRlciA9IG5ldyBCaW5hcnlXcml0ZXIoMTI4KTtcclxuICAgIFJhd01vZHVsZURlZi5zZXJpYWxpemUoXHJcbiAgICAgIHdyaXRlcixcclxuICAgICAgUmF3TW9kdWxlRGVmLlYxMCh0aGlzLiNzY2hlbWEucmF3TW9kdWxlRGVmVjEwKCkpXHJcbiAgICApO1xyXG4gICAgcmV0dXJuIHdyaXRlci5nZXRCdWZmZXIoKTtcclxuICB9XHJcbiAgX19nZXRfZXJyb3JfY29uc3RydWN0b3JfXyhjb2RlKSB7XHJcbiAgICByZXR1cm4gZ2V0RXJyb3JDb25zdHJ1Y3Rvcihjb2RlKTtcclxuICB9XHJcbiAgZ2V0IF9fc2VuZGVyX2Vycm9yX2NsYXNzX18oKSB7XHJcbiAgICByZXR1cm4gU2VuZGVyRXJyb3I7XHJcbiAgfVxyXG4gIF9fY2FsbF9yZWR1Y2VyX18ocmVkdWNlcklkLCBzZW5kZXIsIGNvbm5JZCwgdGltZXN0YW1wLCBhcmdzQnVmKSB7XHJcbiAgICBjb25zdCBtb2R1bGVDdHggPSB0aGlzLiNzY2hlbWE7XHJcbiAgICBjb25zdCBkZXNlcmlhbGl6ZUFyZ3MgPSB0aGlzLiNyZWR1Y2VyQXJnc0Rlc2VyaWFsaXplcnNbcmVkdWNlcklkXTtcclxuICAgIEJJTkFSWV9SRUFERVIucmVzZXQoYXJnc0J1Zik7XHJcbiAgICBjb25zdCBhcmdzID0gZGVzZXJpYWxpemVBcmdzKEJJTkFSWV9SRUFERVIpO1xyXG4gICAgY29uc3Qgc2VuZGVySWRlbnRpdHkgPSBuZXcgSWRlbnRpdHkoc2VuZGVyKTtcclxuICAgIGNvbnN0IGN0eCA9IHRoaXMuI3JlZHVjZXJDdHg7XHJcbiAgICBSZWR1Y2VyQ3R4SW1wbC5yZXNldChcclxuICAgICAgY3R4LFxyXG4gICAgICBzZW5kZXJJZGVudGl0eSxcclxuICAgICAgbmV3IFRpbWVzdGFtcCh0aW1lc3RhbXApLFxyXG4gICAgICBDb25uZWN0aW9uSWQubnVsbElmWmVybyhuZXcgQ29ubmVjdGlvbklkKGNvbm5JZCkpXHJcbiAgICApO1xyXG4gICAgY2FsbFVzZXJGdW5jdGlvbihtb2R1bGVDdHgucmVkdWNlcnNbcmVkdWNlcklkXSwgY3R4LCBhcmdzKTtcclxuICB9XHJcbiAgX19jYWxsX3ZpZXdfXyhpZCwgc2VuZGVyLCBhcmdzQnVmKSB7XHJcbiAgICBjb25zdCBtb2R1bGVDdHggPSB0aGlzLiNzY2hlbWE7XHJcbiAgICBjb25zdCB7IGZuLCBkZXNlcmlhbGl6ZVBhcmFtcywgc2VyaWFsaXplUmV0dXJuLCByZXR1cm5UeXBlQmFzZVNpemUgfSA9IG1vZHVsZUN0eC52aWV3c1tpZF07XHJcbiAgICBjb25zdCBjdHggPSBmcmVlemUoe1xyXG4gICAgICBzZW5kZXI6IG5ldyBJZGVudGl0eShzZW5kZXIpLFxyXG4gICAgICAvLyB0aGlzIGlzIHRoZSBub24tcmVhZG9ubHkgRGJWaWV3LCBidXQgdGhlIHR5cGluZyBmb3IgdGhlIHVzZXIgd2lsbCBiZVxyXG4gICAgICAvLyB0aGUgcmVhZG9ubHkgb25lLCBhbmQgaWYgdGhleSBkbyBjYWxsIG11dGF0aW5nIGZ1bmN0aW9ucyBpdCB3aWxsIGZhaWxcclxuICAgICAgLy8gYXQgcnVudGltZVxyXG4gICAgICBkYjogdGhpcy4jZGJWaWV3LFxyXG4gICAgICBmcm9tOiBtYWtlUXVlcnlCdWlsZGVyKG1vZHVsZUN0eC5zY2hlbWFUeXBlKVxyXG4gICAgfSk7XHJcbiAgICBjb25zdCBhcmdzID0gZGVzZXJpYWxpemVQYXJhbXMobmV3IEJpbmFyeVJlYWRlcihhcmdzQnVmKSk7XHJcbiAgICBjb25zdCByZXQgPSBjYWxsVXNlckZ1bmN0aW9uKGZuLCBjdHgsIGFyZ3MpO1xyXG4gICAgY29uc3QgcmV0QnVmID0gbmV3IEJpbmFyeVdyaXRlcihyZXR1cm5UeXBlQmFzZVNpemUpO1xyXG4gICAgaWYgKGlzUm93VHlwZWRRdWVyeShyZXQpKSB7XHJcbiAgICAgIGNvbnN0IHF1ZXJ5ID0gdG9TcWwocmV0KTtcclxuICAgICAgVmlld1Jlc3VsdEhlYWRlci5zZXJpYWxpemUocmV0QnVmLCBWaWV3UmVzdWx0SGVhZGVyLlJhd1NxbChxdWVyeSkpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgVmlld1Jlc3VsdEhlYWRlci5zZXJpYWxpemUocmV0QnVmLCBWaWV3UmVzdWx0SGVhZGVyLlJvd0RhdGEpO1xyXG4gICAgICBzZXJpYWxpemVSZXR1cm4ocmV0QnVmLCByZXQpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHsgZGF0YTogcmV0QnVmLmdldEJ1ZmZlcigpIH07XHJcbiAgfVxyXG4gIF9fY2FsbF92aWV3X2Fub25fXyhpZCwgYXJnc0J1Zikge1xyXG4gICAgY29uc3QgbW9kdWxlQ3R4ID0gdGhpcy4jc2NoZW1hO1xyXG4gICAgY29uc3QgeyBmbiwgZGVzZXJpYWxpemVQYXJhbXMsIHNlcmlhbGl6ZVJldHVybiwgcmV0dXJuVHlwZUJhc2VTaXplIH0gPSBtb2R1bGVDdHguYW5vblZpZXdzW2lkXTtcclxuICAgIGNvbnN0IGN0eCA9IGZyZWV6ZSh7XHJcbiAgICAgIC8vIHRoaXMgaXMgdGhlIG5vbi1yZWFkb25seSBEYlZpZXcsIGJ1dCB0aGUgdHlwaW5nIGZvciB0aGUgdXNlciB3aWxsIGJlXHJcbiAgICAgIC8vIHRoZSByZWFkb25seSBvbmUsIGFuZCBpZiB0aGV5IGRvIGNhbGwgbXV0YXRpbmcgZnVuY3Rpb25zIGl0IHdpbGwgZmFpbFxyXG4gICAgICAvLyBhdCBydW50aW1lXHJcbiAgICAgIGRiOiB0aGlzLiNkYlZpZXcsXHJcbiAgICAgIGZyb206IG1ha2VRdWVyeUJ1aWxkZXIobW9kdWxlQ3R4LnNjaGVtYVR5cGUpXHJcbiAgICB9KTtcclxuICAgIGNvbnN0IGFyZ3MgPSBkZXNlcmlhbGl6ZVBhcmFtcyhuZXcgQmluYXJ5UmVhZGVyKGFyZ3NCdWYpKTtcclxuICAgIGNvbnN0IHJldCA9IGNhbGxVc2VyRnVuY3Rpb24oZm4sIGN0eCwgYXJncyk7XHJcbiAgICBjb25zdCByZXRCdWYgPSBuZXcgQmluYXJ5V3JpdGVyKHJldHVyblR5cGVCYXNlU2l6ZSk7XHJcbiAgICBpZiAoaXNSb3dUeXBlZFF1ZXJ5KHJldCkpIHtcclxuICAgICAgY29uc3QgcXVlcnkgPSB0b1NxbChyZXQpO1xyXG4gICAgICBWaWV3UmVzdWx0SGVhZGVyLnNlcmlhbGl6ZShyZXRCdWYsIFZpZXdSZXN1bHRIZWFkZXIuUmF3U3FsKHF1ZXJ5KSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBWaWV3UmVzdWx0SGVhZGVyLnNlcmlhbGl6ZShyZXRCdWYsIFZpZXdSZXN1bHRIZWFkZXIuUm93RGF0YSk7XHJcbiAgICAgIHNlcmlhbGl6ZVJldHVybihyZXRCdWYsIHJldCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4geyBkYXRhOiByZXRCdWYuZ2V0QnVmZmVyKCkgfTtcclxuICB9XHJcbiAgX19jYWxsX3Byb2NlZHVyZV9fKGlkLCBzZW5kZXIsIGNvbm5lY3Rpb25faWQsIHRpbWVzdGFtcCwgYXJncykge1xyXG4gICAgcmV0dXJuIGNhbGxQcm9jZWR1cmUoXHJcbiAgICAgIHRoaXMuI3NjaGVtYSxcclxuICAgICAgaWQsXHJcbiAgICAgIG5ldyBJZGVudGl0eShzZW5kZXIpLFxyXG4gICAgICBDb25uZWN0aW9uSWQubnVsbElmWmVybyhuZXcgQ29ubmVjdGlvbklkKGNvbm5lY3Rpb25faWQpKSxcclxuICAgICAgbmV3IFRpbWVzdGFtcCh0aW1lc3RhbXApLFxyXG4gICAgICBhcmdzLFxyXG4gICAgICAoKSA9PiB0aGlzLiNkYlZpZXdcclxuICAgICk7XHJcbiAgfVxyXG59O1xyXG52YXIgQklOQVJZX1dSSVRFUiA9IG5ldyBCaW5hcnlXcml0ZXIoMCk7XHJcbnZhciBCSU5BUllfUkVBREVSID0gbmV3IEJpbmFyeVJlYWRlcihuZXcgVWludDhBcnJheSgpKTtcclxuZnVuY3Rpb24gbWFrZVRhYmxlVmlldyh0eXBlc3BhY2UsIHRhYmxlMikge1xyXG4gIGNvbnN0IHRhYmxlX2lkID0gc3lzLnRhYmxlX2lkX2Zyb21fbmFtZSh0YWJsZTIuc291cmNlTmFtZSk7XHJcbiAgY29uc3Qgcm93VHlwZSA9IHR5cGVzcGFjZS50eXBlc1t0YWJsZTIucHJvZHVjdFR5cGVSZWZdO1xyXG4gIGlmIChyb3dUeXBlLnRhZyAhPT0gXCJQcm9kdWN0XCIpIHtcclxuICAgIHRocm93IFwiaW1wb3NzaWJsZVwiO1xyXG4gIH1cclxuICBjb25zdCBzZXJpYWxpemVSb3cgPSBBbGdlYnJhaWNUeXBlLm1ha2VTZXJpYWxpemVyKHJvd1R5cGUsIHR5cGVzcGFjZSk7XHJcbiAgY29uc3QgZGVzZXJpYWxpemVSb3cgPSBBbGdlYnJhaWNUeXBlLm1ha2VEZXNlcmlhbGl6ZXIocm93VHlwZSwgdHlwZXNwYWNlKTtcclxuICBjb25zdCBzZXF1ZW5jZXMgPSB0YWJsZTIuc2VxdWVuY2VzLm1hcCgoc2VxKSA9PiB7XHJcbiAgICBjb25zdCBjb2wgPSByb3dUeXBlLnZhbHVlLmVsZW1lbnRzW3NlcS5jb2x1bW5dO1xyXG4gICAgY29uc3QgY29sVHlwZSA9IGNvbC5hbGdlYnJhaWNUeXBlO1xyXG4gICAgbGV0IHNlcXVlbmNlVHJpZ2dlcjtcclxuICAgIHN3aXRjaCAoY29sVHlwZS50YWcpIHtcclxuICAgICAgY2FzZSBcIlU4XCI6XHJcbiAgICAgIGNhc2UgXCJJOFwiOlxyXG4gICAgICBjYXNlIFwiVTE2XCI6XHJcbiAgICAgIGNhc2UgXCJJMTZcIjpcclxuICAgICAgY2FzZSBcIlUzMlwiOlxyXG4gICAgICBjYXNlIFwiSTMyXCI6XHJcbiAgICAgICAgc2VxdWVuY2VUcmlnZ2VyID0gMDtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcIlU2NFwiOlxyXG4gICAgICBjYXNlIFwiSTY0XCI6XHJcbiAgICAgIGNhc2UgXCJVMTI4XCI6XHJcbiAgICAgIGNhc2UgXCJJMTI4XCI6XHJcbiAgICAgIGNhc2UgXCJVMjU2XCI6XHJcbiAgICAgIGNhc2UgXCJJMjU2XCI6XHJcbiAgICAgICAgc2VxdWVuY2VUcmlnZ2VyID0gMG47XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcImludmFsaWQgc2VxdWVuY2UgdHlwZVwiKTtcclxuICAgIH1cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNvbE5hbWU6IGNvbC5uYW1lLFxyXG4gICAgICBzZXF1ZW5jZVRyaWdnZXIsXHJcbiAgICAgIGRlc2VyaWFsaXplOiBBbGdlYnJhaWNUeXBlLm1ha2VEZXNlcmlhbGl6ZXIoY29sVHlwZSwgdHlwZXNwYWNlKVxyXG4gICAgfTtcclxuICB9KTtcclxuICBjb25zdCBoYXNBdXRvSW5jcmVtZW50ID0gc2VxdWVuY2VzLmxlbmd0aCA+IDA7XHJcbiAgY29uc3QgaXRlciA9ICgpID0+IHRhYmxlSXRlcmF0b3Ioc3lzLmRhdGFzdG9yZV90YWJsZV9zY2FuX2JzYXRuKHRhYmxlX2lkKSwgZGVzZXJpYWxpemVSb3cpO1xyXG4gIGNvbnN0IGludGVncmF0ZUdlbmVyYXRlZENvbHVtbnMgPSBoYXNBdXRvSW5jcmVtZW50ID8gKHJvdywgcmV0X2J1ZikgPT4ge1xyXG4gICAgQklOQVJZX1JFQURFUi5yZXNldChyZXRfYnVmKTtcclxuICAgIGZvciAoY29uc3QgeyBjb2xOYW1lLCBkZXNlcmlhbGl6ZSwgc2VxdWVuY2VUcmlnZ2VyIH0gb2Ygc2VxdWVuY2VzKSB7XHJcbiAgICAgIGlmIChyb3dbY29sTmFtZV0gPT09IHNlcXVlbmNlVHJpZ2dlcikge1xyXG4gICAgICAgIHJvd1tjb2xOYW1lXSA9IGRlc2VyaWFsaXplKEJJTkFSWV9SRUFERVIpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSA6IG51bGw7XHJcbiAgY29uc3QgdGFibGVNZXRob2RzID0ge1xyXG4gICAgY291bnQ6ICgpID0+IHN5cy5kYXRhc3RvcmVfdGFibGVfcm93X2NvdW50KHRhYmxlX2lkKSxcclxuICAgIGl0ZXIsXHJcbiAgICBbU3ltYm9sLml0ZXJhdG9yXTogKCkgPT4gaXRlcigpLFxyXG4gICAgaW5zZXJ0OiAocm93KSA9PiB7XHJcbiAgICAgIGNvbnN0IGJ1ZiA9IExFQUZfQlVGO1xyXG4gICAgICBCSU5BUllfV1JJVEVSLnJlc2V0KGJ1Zik7XHJcbiAgICAgIHNlcmlhbGl6ZVJvdyhCSU5BUllfV1JJVEVSLCByb3cpO1xyXG4gICAgICBzeXMuZGF0YXN0b3JlX2luc2VydF9ic2F0bih0YWJsZV9pZCwgYnVmLmJ1ZmZlciwgQklOQVJZX1dSSVRFUi5vZmZzZXQpO1xyXG4gICAgICBjb25zdCByZXQgPSB7IC4uLnJvdyB9O1xyXG4gICAgICBpbnRlZ3JhdGVHZW5lcmF0ZWRDb2x1bW5zPy4ocmV0LCBidWYudmlldyk7XHJcbiAgICAgIHJldHVybiByZXQ7XHJcbiAgICB9LFxyXG4gICAgZGVsZXRlOiAocm93KSA9PiB7XHJcbiAgICAgIGNvbnN0IGJ1ZiA9IExFQUZfQlVGO1xyXG4gICAgICBCSU5BUllfV1JJVEVSLnJlc2V0KGJ1Zik7XHJcbiAgICAgIEJJTkFSWV9XUklURVIud3JpdGVVMzIoMSk7XHJcbiAgICAgIHNlcmlhbGl6ZVJvdyhCSU5BUllfV1JJVEVSLCByb3cpO1xyXG4gICAgICBjb25zdCBjb3VudCA9IHN5cy5kYXRhc3RvcmVfZGVsZXRlX2FsbF9ieV9lcV9ic2F0bihcclxuICAgICAgICB0YWJsZV9pZCxcclxuICAgICAgICBidWYuYnVmZmVyLFxyXG4gICAgICAgIEJJTkFSWV9XUklURVIub2Zmc2V0XHJcbiAgICAgICk7XHJcbiAgICAgIHJldHVybiBjb3VudCA+IDA7XHJcbiAgICB9XHJcbiAgfTtcclxuICBjb25zdCB0YWJsZVZpZXcgPSBPYmplY3QuYXNzaWduKFxyXG4gICAgLyogQF9fUFVSRV9fICovIE9iamVjdC5jcmVhdGUobnVsbCksXHJcbiAgICB0YWJsZU1ldGhvZHNcclxuICApO1xyXG4gIGZvciAoY29uc3QgaW5kZXhEZWYgb2YgdGFibGUyLmluZGV4ZXMpIHtcclxuICAgIGNvbnN0IGluZGV4X2lkID0gc3lzLmluZGV4X2lkX2Zyb21fbmFtZShpbmRleERlZi5zb3VyY2VOYW1lKTtcclxuICAgIGxldCBjb2x1bW5faWRzO1xyXG4gICAgbGV0IGlzSGFzaEluZGV4ID0gZmFsc2U7XHJcbiAgICBzd2l0Y2ggKGluZGV4RGVmLmFsZ29yaXRobS50YWcpIHtcclxuICAgICAgY2FzZSBcIkhhc2hcIjpcclxuICAgICAgICBpc0hhc2hJbmRleCA9IHRydWU7XHJcbiAgICAgICAgY29sdW1uX2lkcyA9IGluZGV4RGVmLmFsZ29yaXRobS52YWx1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcIkJUcmVlXCI6XHJcbiAgICAgICAgY29sdW1uX2lkcyA9IGluZGV4RGVmLmFsZ29yaXRobS52YWx1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcIkRpcmVjdFwiOlxyXG4gICAgICAgIGNvbHVtbl9pZHMgPSBbaW5kZXhEZWYuYWxnb3JpdGhtLnZhbHVlXTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICAgIGNvbnN0IG51bUNvbHVtbnMgPSBjb2x1bW5faWRzLmxlbmd0aDtcclxuICAgIGNvbnN0IGNvbHVtblNldCA9IG5ldyBTZXQoY29sdW1uX2lkcyk7XHJcbiAgICBjb25zdCBpc1VuaXF1ZSA9IHRhYmxlMi5jb25zdHJhaW50cy5maWx0ZXIoKHgpID0+IHguZGF0YS50YWcgPT09IFwiVW5pcXVlXCIpLnNvbWUoKHgpID0+IGNvbHVtblNldC5pc1N1YnNldE9mKG5ldyBTZXQoeC5kYXRhLnZhbHVlLmNvbHVtbnMpKSk7XHJcbiAgICBjb25zdCBpc1ByaW1hcnlLZXkgPSBpc1VuaXF1ZSAmJiBjb2x1bW5faWRzLmxlbmd0aCA9PT0gdGFibGUyLnByaW1hcnlLZXkubGVuZ3RoICYmIGNvbHVtbl9pZHMuZXZlcnkoKGlkLCBpKSA9PiB0YWJsZTIucHJpbWFyeUtleVtpXSA9PT0gaWQpO1xyXG4gICAgY29uc3QgaW5kZXhTZXJpYWxpemVycyA9IGNvbHVtbl9pZHMubWFwKFxyXG4gICAgICAoaWQpID0+IEFsZ2VicmFpY1R5cGUubWFrZVNlcmlhbGl6ZXIoXHJcbiAgICAgICAgcm93VHlwZS52YWx1ZS5lbGVtZW50c1tpZF0uYWxnZWJyYWljVHlwZSxcclxuICAgICAgICB0eXBlc3BhY2VcclxuICAgICAgKVxyXG4gICAgKTtcclxuICAgIGNvbnN0IHNlcmlhbGl6ZVBvaW50ID0gKGJ1ZmZlciwgY29sVmFsKSA9PiB7XHJcbiAgICAgIEJJTkFSWV9XUklURVIucmVzZXQoYnVmZmVyKTtcclxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1Db2x1bW5zOyBpKyspIHtcclxuICAgICAgICBpbmRleFNlcmlhbGl6ZXJzW2ldKEJJTkFSWV9XUklURVIsIGNvbFZhbFtpXSk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIEJJTkFSWV9XUklURVIub2Zmc2V0O1xyXG4gICAgfTtcclxuICAgIGNvbnN0IHNlcmlhbGl6ZVNpbmdsZUVsZW1lbnQgPSBudW1Db2x1bW5zID09PSAxID8gaW5kZXhTZXJpYWxpemVyc1swXSA6IG51bGw7XHJcbiAgICBjb25zdCBzZXJpYWxpemVTaW5nbGVQb2ludCA9IHNlcmlhbGl6ZVNpbmdsZUVsZW1lbnQgJiYgKChidWZmZXIsIGNvbFZhbCkgPT4ge1xyXG4gICAgICBCSU5BUllfV1JJVEVSLnJlc2V0KGJ1ZmZlcik7XHJcbiAgICAgIHNlcmlhbGl6ZVNpbmdsZUVsZW1lbnQoQklOQVJZX1dSSVRFUiwgY29sVmFsKTtcclxuICAgICAgcmV0dXJuIEJJTkFSWV9XUklURVIub2Zmc2V0O1xyXG4gICAgfSk7XHJcbiAgICBsZXQgaW5kZXg7XHJcbiAgICBpZiAoaXNVbmlxdWUgJiYgc2VyaWFsaXplU2luZ2xlUG9pbnQpIHtcclxuICAgICAgY29uc3QgYmFzZSA9IHtcclxuICAgICAgICBmaW5kOiAoY29sVmFsKSA9PiB7XHJcbiAgICAgICAgICBjb25zdCBidWYgPSBMRUFGX0JVRjtcclxuICAgICAgICAgIGNvbnN0IHBvaW50X2xlbiA9IHNlcmlhbGl6ZVNpbmdsZVBvaW50KGJ1ZiwgY29sVmFsKTtcclxuICAgICAgICAgIGNvbnN0IGl0ZXJfaWQgPSBzeXMuZGF0YXN0b3JlX2luZGV4X3NjYW5fcG9pbnRfYnNhdG4oXHJcbiAgICAgICAgICAgIGluZGV4X2lkLFxyXG4gICAgICAgICAgICBidWYuYnVmZmVyLFxyXG4gICAgICAgICAgICBwb2ludF9sZW5cclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICByZXR1cm4gdGFibGVJdGVyYXRlT25lKGl0ZXJfaWQsIGRlc2VyaWFsaXplUm93KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRlbGV0ZTogKGNvbFZhbCkgPT4ge1xyXG4gICAgICAgICAgY29uc3QgYnVmID0gTEVBRl9CVUY7XHJcbiAgICAgICAgICBjb25zdCBwb2ludF9sZW4gPSBzZXJpYWxpemVTaW5nbGVQb2ludChidWYsIGNvbFZhbCk7XHJcbiAgICAgICAgICBjb25zdCBudW0gPSBzeXMuZGF0YXN0b3JlX2RlbGV0ZV9ieV9pbmRleF9zY2FuX3BvaW50X2JzYXRuKFxyXG4gICAgICAgICAgICBpbmRleF9pZCxcclxuICAgICAgICAgICAgYnVmLmJ1ZmZlcixcclxuICAgICAgICAgICAgcG9pbnRfbGVuXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgcmV0dXJuIG51bSA+IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgICBpZiAoaXNQcmltYXJ5S2V5KSB7XHJcbiAgICAgICAgYmFzZS51cGRhdGUgPSAocm93KSA9PiB7XHJcbiAgICAgICAgICBjb25zdCBidWYgPSBMRUFGX0JVRjtcclxuICAgICAgICAgIEJJTkFSWV9XUklURVIucmVzZXQoYnVmKTtcclxuICAgICAgICAgIHNlcmlhbGl6ZVJvdyhCSU5BUllfV1JJVEVSLCByb3cpO1xyXG4gICAgICAgICAgc3lzLmRhdGFzdG9yZV91cGRhdGVfYnNhdG4oXHJcbiAgICAgICAgICAgIHRhYmxlX2lkLFxyXG4gICAgICAgICAgICBpbmRleF9pZCxcclxuICAgICAgICAgICAgYnVmLmJ1ZmZlcixcclxuICAgICAgICAgICAgQklOQVJZX1dSSVRFUi5vZmZzZXRcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICBpbnRlZ3JhdGVHZW5lcmF0ZWRDb2x1bW5zPy4ocm93LCBidWYudmlldyk7XHJcbiAgICAgICAgICByZXR1cm4gcm93O1xyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuICAgICAgaW5kZXggPSBiYXNlO1xyXG4gICAgfSBlbHNlIGlmIChpc1VuaXF1ZSkge1xyXG4gICAgICBjb25zdCBiYXNlID0ge1xyXG4gICAgICAgIGZpbmQ6IChjb2xWYWwpID0+IHtcclxuICAgICAgICAgIGlmIChjb2xWYWwubGVuZ3RoICE9PSBudW1Db2x1bW5zKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJ3cm9uZyBudW1iZXIgb2YgZWxlbWVudHNcIik7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjb25zdCBidWYgPSBMRUFGX0JVRjtcclxuICAgICAgICAgIGNvbnN0IHBvaW50X2xlbiA9IHNlcmlhbGl6ZVBvaW50KGJ1ZiwgY29sVmFsKTtcclxuICAgICAgICAgIGNvbnN0IGl0ZXJfaWQgPSBzeXMuZGF0YXN0b3JlX2luZGV4X3NjYW5fcG9pbnRfYnNhdG4oXHJcbiAgICAgICAgICAgIGluZGV4X2lkLFxyXG4gICAgICAgICAgICBidWYuYnVmZmVyLFxyXG4gICAgICAgICAgICBwb2ludF9sZW5cclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICByZXR1cm4gdGFibGVJdGVyYXRlT25lKGl0ZXJfaWQsIGRlc2VyaWFsaXplUm93KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRlbGV0ZTogKGNvbFZhbCkgPT4ge1xyXG4gICAgICAgICAgaWYgKGNvbFZhbC5sZW5ndGggIT09IG51bUNvbHVtbnMpXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJ3cm9uZyBudW1iZXIgb2YgZWxlbWVudHNcIik7XHJcbiAgICAgICAgICBjb25zdCBidWYgPSBMRUFGX0JVRjtcclxuICAgICAgICAgIGNvbnN0IHBvaW50X2xlbiA9IHNlcmlhbGl6ZVBvaW50KGJ1ZiwgY29sVmFsKTtcclxuICAgICAgICAgIGNvbnN0IG51bSA9IHN5cy5kYXRhc3RvcmVfZGVsZXRlX2J5X2luZGV4X3NjYW5fcG9pbnRfYnNhdG4oXHJcbiAgICAgICAgICAgIGluZGV4X2lkLFxyXG4gICAgICAgICAgICBidWYuYnVmZmVyLFxyXG4gICAgICAgICAgICBwb2ludF9sZW5cclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICByZXR1cm4gbnVtID4gMDtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICAgIGlmIChpc1ByaW1hcnlLZXkpIHtcclxuICAgICAgICBiYXNlLnVwZGF0ZSA9IChyb3cpID0+IHtcclxuICAgICAgICAgIGNvbnN0IGJ1ZiA9IExFQUZfQlVGO1xyXG4gICAgICAgICAgQklOQVJZX1dSSVRFUi5yZXNldChidWYpO1xyXG4gICAgICAgICAgc2VyaWFsaXplUm93KEJJTkFSWV9XUklURVIsIHJvdyk7XHJcbiAgICAgICAgICBzeXMuZGF0YXN0b3JlX3VwZGF0ZV9ic2F0bihcclxuICAgICAgICAgICAgdGFibGVfaWQsXHJcbiAgICAgICAgICAgIGluZGV4X2lkLFxyXG4gICAgICAgICAgICBidWYuYnVmZmVyLFxyXG4gICAgICAgICAgICBCSU5BUllfV1JJVEVSLm9mZnNldFxyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIGludGVncmF0ZUdlbmVyYXRlZENvbHVtbnM/Lihyb3csIGJ1Zi52aWV3KTtcclxuICAgICAgICAgIHJldHVybiByb3c7XHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG4gICAgICBpbmRleCA9IGJhc2U7XHJcbiAgICB9IGVsc2UgaWYgKHNlcmlhbGl6ZVNpbmdsZVBvaW50KSB7XHJcbiAgICAgIGNvbnN0IHJhd0luZGV4ID0ge1xyXG4gICAgICAgIGZpbHRlcjogKHJhbmdlKSA9PiB7XHJcbiAgICAgICAgICBjb25zdCBidWYgPSBMRUFGX0JVRjtcclxuICAgICAgICAgIGNvbnN0IHBvaW50X2xlbiA9IHNlcmlhbGl6ZVNpbmdsZVBvaW50KGJ1ZiwgcmFuZ2UpO1xyXG4gICAgICAgICAgY29uc3QgaXRlcl9pZCA9IHN5cy5kYXRhc3RvcmVfaW5kZXhfc2Nhbl9wb2ludF9ic2F0bihcclxuICAgICAgICAgICAgaW5kZXhfaWQsXHJcbiAgICAgICAgICAgIGJ1Zi5idWZmZXIsXHJcbiAgICAgICAgICAgIHBvaW50X2xlblxyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIHJldHVybiB0YWJsZUl0ZXJhdG9yKGl0ZXJfaWQsIGRlc2VyaWFsaXplUm93KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRlbGV0ZTogKHJhbmdlKSA9PiB7XHJcbiAgICAgICAgICBjb25zdCBidWYgPSBMRUFGX0JVRjtcclxuICAgICAgICAgIGNvbnN0IHBvaW50X2xlbiA9IHNlcmlhbGl6ZVNpbmdsZVBvaW50KGJ1ZiwgcmFuZ2UpO1xyXG4gICAgICAgICAgcmV0dXJuIHN5cy5kYXRhc3RvcmVfZGVsZXRlX2J5X2luZGV4X3NjYW5fcG9pbnRfYnNhdG4oXHJcbiAgICAgICAgICAgIGluZGV4X2lkLFxyXG4gICAgICAgICAgICBidWYuYnVmZmVyLFxyXG4gICAgICAgICAgICBwb2ludF9sZW5cclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgICBpZiAoaXNIYXNoSW5kZXgpIHtcclxuICAgICAgICBpbmRleCA9IHJhd0luZGV4O1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGluZGV4ID0gcmF3SW5kZXg7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAoaXNIYXNoSW5kZXgpIHtcclxuICAgICAgaW5kZXggPSB7XHJcbiAgICAgICAgZmlsdGVyOiAocmFuZ2UpID0+IHtcclxuICAgICAgICAgIGNvbnN0IGJ1ZiA9IExFQUZfQlVGO1xyXG4gICAgICAgICAgY29uc3QgcG9pbnRfbGVuID0gc2VyaWFsaXplUG9pbnQoYnVmLCByYW5nZSk7XHJcbiAgICAgICAgICBjb25zdCBpdGVyX2lkID0gc3lzLmRhdGFzdG9yZV9pbmRleF9zY2FuX3BvaW50X2JzYXRuKFxyXG4gICAgICAgICAgICBpbmRleF9pZCxcclxuICAgICAgICAgICAgYnVmLmJ1ZmZlcixcclxuICAgICAgICAgICAgcG9pbnRfbGVuXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgcmV0dXJuIHRhYmxlSXRlcmF0b3IoaXRlcl9pZCwgZGVzZXJpYWxpemVSb3cpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGVsZXRlOiAocmFuZ2UpID0+IHtcclxuICAgICAgICAgIGNvbnN0IGJ1ZiA9IExFQUZfQlVGO1xyXG4gICAgICAgICAgY29uc3QgcG9pbnRfbGVuID0gc2VyaWFsaXplUG9pbnQoYnVmLCByYW5nZSk7XHJcbiAgICAgICAgICByZXR1cm4gc3lzLmRhdGFzdG9yZV9kZWxldGVfYnlfaW5kZXhfc2Nhbl9wb2ludF9ic2F0bihcclxuICAgICAgICAgICAgaW5kZXhfaWQsXHJcbiAgICAgICAgICAgIGJ1Zi5idWZmZXIsXHJcbiAgICAgICAgICAgIHBvaW50X2xlblxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zdCBzZXJpYWxpemVSYW5nZSA9IChidWZmZXIsIHJhbmdlKSA9PiB7XHJcbiAgICAgICAgaWYgKHJhbmdlLmxlbmd0aCA+IG51bUNvbHVtbnMpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJ0b28gbWFueSBlbGVtZW50c1wiKTtcclxuICAgICAgICBCSU5BUllfV1JJVEVSLnJlc2V0KGJ1ZmZlcik7XHJcbiAgICAgICAgY29uc3Qgd3JpdGVyID0gQklOQVJZX1dSSVRFUjtcclxuICAgICAgICBjb25zdCBwcmVmaXhfZWxlbXMgPSByYW5nZS5sZW5ndGggLSAxO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJlZml4X2VsZW1zOyBpKyspIHtcclxuICAgICAgICAgIGluZGV4U2VyaWFsaXplcnNbaV0od3JpdGVyLCByYW5nZVtpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHJzdGFydE9mZnNldCA9IHdyaXRlci5vZmZzZXQ7XHJcbiAgICAgICAgY29uc3QgdGVybSA9IHJhbmdlW3JhbmdlLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgIGNvbnN0IHNlcmlhbGl6ZVRlcm0gPSBpbmRleFNlcmlhbGl6ZXJzW3JhbmdlLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgIGlmICh0ZXJtIGluc3RhbmNlb2YgUmFuZ2UpIHtcclxuICAgICAgICAgIGNvbnN0IHdyaXRlQm91bmQgPSAoYm91bmQpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgdGFncyA9IHsgaW5jbHVkZWQ6IDAsIGV4Y2x1ZGVkOiAxLCB1bmJvdW5kZWQ6IDIgfTtcclxuICAgICAgICAgICAgd3JpdGVyLndyaXRlVTgodGFnc1tib3VuZC50YWddKTtcclxuICAgICAgICAgICAgaWYgKGJvdW5kLnRhZyAhPT0gXCJ1bmJvdW5kZWRcIikgc2VyaWFsaXplVGVybSh3cml0ZXIsIGJvdW5kLnZhbHVlKTtcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgICB3cml0ZUJvdW5kKHRlcm0uZnJvbSk7XHJcbiAgICAgICAgICBjb25zdCByc3RhcnRMZW4gPSB3cml0ZXIub2Zmc2V0IC0gcnN0YXJ0T2Zmc2V0O1xyXG4gICAgICAgICAgd3JpdGVCb3VuZCh0ZXJtLnRvKTtcclxuICAgICAgICAgIGNvbnN0IHJlbmRMZW4gPSB3cml0ZXIub2Zmc2V0IC0gcnN0YXJ0TGVuO1xyXG4gICAgICAgICAgcmV0dXJuIFtyc3RhcnRPZmZzZXQsIHByZWZpeF9lbGVtcywgcnN0YXJ0TGVuLCByZW5kTGVuXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgd3JpdGVyLndyaXRlVTgoMCk7XHJcbiAgICAgICAgICBzZXJpYWxpemVUZXJtKHdyaXRlciwgdGVybSk7XHJcbiAgICAgICAgICBjb25zdCByc3RhcnRMZW4gPSB3cml0ZXIub2Zmc2V0O1xyXG4gICAgICAgICAgY29uc3QgcmVuZExlbiA9IDA7XHJcbiAgICAgICAgICByZXR1cm4gW3JzdGFydE9mZnNldCwgcHJlZml4X2VsZW1zLCByc3RhcnRMZW4sIHJlbmRMZW5dO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgICAgaW5kZXggPSB7XHJcbiAgICAgICAgZmlsdGVyOiAocmFuZ2UpID0+IHtcclxuICAgICAgICAgIGlmIChyYW5nZS5sZW5ndGggPT09IG51bUNvbHVtbnMpIHtcclxuICAgICAgICAgICAgY29uc3QgYnVmID0gTEVBRl9CVUY7XHJcbiAgICAgICAgICAgIGNvbnN0IHBvaW50X2xlbiA9IHNlcmlhbGl6ZVBvaW50KGJ1ZiwgcmFuZ2UpO1xyXG4gICAgICAgICAgICBjb25zdCBpdGVyX2lkID0gc3lzLmRhdGFzdG9yZV9pbmRleF9zY2FuX3BvaW50X2JzYXRuKFxyXG4gICAgICAgICAgICAgIGluZGV4X2lkLFxyXG4gICAgICAgICAgICAgIGJ1Zi5idWZmZXIsXHJcbiAgICAgICAgICAgICAgcG9pbnRfbGVuXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIHJldHVybiB0YWJsZUl0ZXJhdG9yKGl0ZXJfaWQsIGRlc2VyaWFsaXplUm93KTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGJ1ZiA9IExFQUZfQlVGO1xyXG4gICAgICAgICAgICBjb25zdCBhcmdzID0gc2VyaWFsaXplUmFuZ2UoYnVmLCByYW5nZSk7XHJcbiAgICAgICAgICAgIGNvbnN0IGl0ZXJfaWQgPSBzeXMuZGF0YXN0b3JlX2luZGV4X3NjYW5fcmFuZ2VfYnNhdG4oXHJcbiAgICAgICAgICAgICAgaW5kZXhfaWQsXHJcbiAgICAgICAgICAgICAgYnVmLmJ1ZmZlcixcclxuICAgICAgICAgICAgICAuLi5hcmdzXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIHJldHVybiB0YWJsZUl0ZXJhdG9yKGl0ZXJfaWQsIGRlc2VyaWFsaXplUm93KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGRlbGV0ZTogKHJhbmdlKSA9PiB7XHJcbiAgICAgICAgICBpZiAocmFuZ2UubGVuZ3RoID09PSBudW1Db2x1bW5zKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGJ1ZiA9IExFQUZfQlVGO1xyXG4gICAgICAgICAgICBjb25zdCBwb2ludF9sZW4gPSBzZXJpYWxpemVQb2ludChidWYsIHJhbmdlKTtcclxuICAgICAgICAgICAgcmV0dXJuIHN5cy5kYXRhc3RvcmVfZGVsZXRlX2J5X2luZGV4X3NjYW5fcG9pbnRfYnNhdG4oXHJcbiAgICAgICAgICAgICAgaW5kZXhfaWQsXHJcbiAgICAgICAgICAgICAgYnVmLmJ1ZmZlcixcclxuICAgICAgICAgICAgICBwb2ludF9sZW5cclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGJ1ZiA9IExFQUZfQlVGO1xyXG4gICAgICAgICAgICBjb25zdCBhcmdzID0gc2VyaWFsaXplUmFuZ2UoYnVmLCByYW5nZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBzeXMuZGF0YXN0b3JlX2RlbGV0ZV9ieV9pbmRleF9zY2FuX3JhbmdlX2JzYXRuKFxyXG4gICAgICAgICAgICAgIGluZGV4X2lkLFxyXG4gICAgICAgICAgICAgIGJ1Zi5idWZmZXIsXHJcbiAgICAgICAgICAgICAgLi4uYXJnc1xyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgIH1cclxuICAgIGlmIChPYmplY3QuaGFzT3duKHRhYmxlVmlldywgaW5kZXhEZWYuYWNjZXNzb3JOYW1lKSkge1xyXG4gICAgICBmcmVlemUoT2JqZWN0LmFzc2lnbih0YWJsZVZpZXdbaW5kZXhEZWYuYWNjZXNzb3JOYW1lXSwgaW5kZXgpKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRhYmxlVmlld1tpbmRleERlZi5hY2Nlc3Nvck5hbWVdID0gZnJlZXplKGluZGV4KTtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIGZyZWV6ZSh0YWJsZVZpZXcpO1xyXG59XHJcbmZ1bmN0aW9uKiB0YWJsZUl0ZXJhdG9yKGlkLCBkZXNlcmlhbGl6ZSkge1xyXG4gIHVzaW5nIGl0ZXIgPSBuZXcgSXRlcmF0b3JIYW5kbGUoaWQpO1xyXG4gIGNvbnN0IGl0ZXJCdWYgPSB0YWtlQnVmKCk7XHJcbiAgdHJ5IHtcclxuICAgIGxldCBhbXQ7XHJcbiAgICB3aGlsZSAoYW10ID0gaXRlci5hZHZhbmNlKGl0ZXJCdWYpKSB7XHJcbiAgICAgIGNvbnN0IHJlYWRlciA9IG5ldyBCaW5hcnlSZWFkZXIoaXRlckJ1Zi52aWV3KTtcclxuICAgICAgd2hpbGUgKHJlYWRlci5vZmZzZXQgPCBhbXQpIHtcclxuICAgICAgICB5aWVsZCBkZXNlcmlhbGl6ZShyZWFkZXIpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSBmaW5hbGx5IHtcclxuICAgIHJldHVybkJ1ZihpdGVyQnVmKTtcclxuICB9XHJcbn1cclxuZnVuY3Rpb24gdGFibGVJdGVyYXRlT25lKGlkLCBkZXNlcmlhbGl6ZSkge1xyXG4gIGNvbnN0IGJ1ZiA9IExFQUZfQlVGO1xyXG4gIGNvbnN0IHJldCA9IGFkdmFuY2VJdGVyUmF3KGlkLCBidWYpO1xyXG4gIGlmIChyZXQgIT09IDApIHtcclxuICAgIEJJTkFSWV9SRUFERVIucmVzZXQoYnVmLnZpZXcpO1xyXG4gICAgcmV0dXJuIGRlc2VyaWFsaXplKEJJTkFSWV9SRUFERVIpO1xyXG4gIH1cclxuICByZXR1cm4gbnVsbDtcclxufVxyXG5mdW5jdGlvbiBhZHZhbmNlSXRlclJhdyhpZCwgYnVmKSB7XHJcbiAgd2hpbGUgKHRydWUpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIHJldHVybiAwIHwgc3lzLnJvd19pdGVyX2JzYXRuX2FkdmFuY2UoaWQsIGJ1Zi5idWZmZXIpO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICBpZiAoZSAmJiB0eXBlb2YgZSA9PT0gXCJvYmplY3RcIiAmJiBoYXNPd24oZSwgXCJfX2J1ZmZlcl90b29fc21hbGxfX1wiKSkge1xyXG4gICAgICAgIGJ1Zi5ncm93KGUuX19idWZmZXJfdG9vX3NtYWxsX18pO1xyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICB9XHJcbiAgICAgIHRocm93IGU7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbnZhciBERUZBVUxUX0JVRkZFUl9DQVBBQ0lUWSA9IDMyICogMTAyNCAqIDI7XHJcbnZhciBJVEVSX0JVRlMgPSBbXHJcbiAgbmV3IFJlc2l6YWJsZUJ1ZmZlcihERUZBVUxUX0JVRkZFUl9DQVBBQ0lUWSlcclxuXTtcclxudmFyIElURVJfQlVGX0NPVU5UID0gMTtcclxuZnVuY3Rpb24gdGFrZUJ1ZigpIHtcclxuICByZXR1cm4gSVRFUl9CVUZfQ09VTlQgPyBJVEVSX0JVRlNbLS1JVEVSX0JVRl9DT1VOVF0gOiBuZXcgUmVzaXphYmxlQnVmZmVyKERFRkFVTFRfQlVGRkVSX0NBUEFDSVRZKTtcclxufVxyXG5mdW5jdGlvbiByZXR1cm5CdWYoYnVmKSB7XHJcbiAgSVRFUl9CVUZTW0lURVJfQlVGX0NPVU5UKytdID0gYnVmO1xyXG59XHJcbnZhciBMRUFGX0JVRiA9IG5ldyBSZXNpemFibGVCdWZmZXIoREVGQVVMVF9CVUZGRVJfQ0FQQUNJVFkpO1xyXG52YXIgSXRlcmF0b3JIYW5kbGUgPSBjbGFzcyBfSXRlcmF0b3JIYW5kbGUge1xyXG4gICNpZDtcclxuICBzdGF0aWMgI2ZpbmFsaXphdGlvblJlZ2lzdHJ5ID0gbmV3IEZpbmFsaXphdGlvblJlZ2lzdHJ5KFxyXG4gICAgc3lzLnJvd19pdGVyX2JzYXRuX2Nsb3NlXHJcbiAgKTtcclxuICBjb25zdHJ1Y3RvcihpZCkge1xyXG4gICAgdGhpcy4jaWQgPSBpZDtcclxuICAgIF9JdGVyYXRvckhhbmRsZS4jZmluYWxpemF0aW9uUmVnaXN0cnkucmVnaXN0ZXIodGhpcywgaWQsIHRoaXMpO1xyXG4gIH1cclxuICAvKiogVW5yZWdpc3RlciB0aGlzIG9iamVjdCB3aXRoIHRoZSBmaW5hbGl6YXRpb24gcmVnaXN0cnkgYW5kIHJldHVybiB0aGUgaWQgKi9cclxuICAjZGV0YWNoKCkge1xyXG4gICAgY29uc3QgaWQgPSB0aGlzLiNpZDtcclxuICAgIHRoaXMuI2lkID0gLTE7XHJcbiAgICBfSXRlcmF0b3JIYW5kbGUuI2ZpbmFsaXphdGlvblJlZ2lzdHJ5LnVucmVnaXN0ZXIodGhpcyk7XHJcbiAgICByZXR1cm4gaWQ7XHJcbiAgfVxyXG4gIC8qKiBDYWxsIGByb3dfaXRlcl9ic2F0bl9hZHZhbmNlYCwgcmV0dXJuaW5nIDAgaWYgdGhpcyBpdGVyYXRvciBoYXMgYmVlbiBleGhhdXN0ZWQuICovXHJcbiAgYWR2YW5jZShidWYpIHtcclxuICAgIGlmICh0aGlzLiNpZCA9PT0gLTEpIHJldHVybiAwO1xyXG4gICAgY29uc3QgcmV0ID0gYWR2YW5jZUl0ZXJSYXcodGhpcy4jaWQsIGJ1Zik7XHJcbiAgICBpZiAocmV0IDw9IDApIHRoaXMuI2RldGFjaCgpO1xyXG4gICAgcmV0dXJuIHJldCA8IDAgPyAtcmV0IDogcmV0O1xyXG4gIH1cclxuICBbU3ltYm9sLmRpc3Bvc2VdKCkge1xyXG4gICAgaWYgKHRoaXMuI2lkID49IDApIHtcclxuICAgICAgY29uc3QgaWQgPSB0aGlzLiNkZXRhY2goKTtcclxuICAgICAgc3lzLnJvd19pdGVyX2JzYXRuX2Nsb3NlKGlkKTtcclxuICAgIH1cclxuICB9XHJcbn07XHJcblxyXG4vLyBzcmMvc2VydmVyL2h0dHBfaW50ZXJuYWwudHNcclxudmFyIHsgZnJlZXplOiBmcmVlemUyIH0gPSBPYmplY3Q7XHJcbnZhciB0ZXh0RW5jb2RlciA9IG5ldyBUZXh0RW5jb2RlcigpO1xyXG52YXIgdGV4dERlY29kZXIgPSBuZXcgVGV4dERlY29kZXIoXHJcbiAgXCJ1dGYtOFwiXHJcbiAgLyogeyBmYXRhbDogdHJ1ZSB9ICovXHJcbik7XHJcbnZhciBtYWtlUmVzcG9uc2UgPSBTeW1ib2woXCJtYWtlUmVzcG9uc2VcIik7XHJcbnZhciBTeW5jUmVzcG9uc2UgPSBjbGFzcyBfU3luY1Jlc3BvbnNlIHtcclxuICAjYm9keTtcclxuICAjaW5uZXI7XHJcbiAgY29uc3RydWN0b3IoYm9keSwgaW5pdCkge1xyXG4gICAgaWYgKGJvZHkgPT0gbnVsbCkge1xyXG4gICAgICB0aGlzLiNib2R5ID0gbnVsbDtcclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGJvZHkgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgdGhpcy4jYm9keSA9IGJvZHk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLiNib2R5ID0gbmV3IFVpbnQ4QXJyYXkoYm9keSkuYnVmZmVyO1xyXG4gICAgfVxyXG4gICAgdGhpcy4jaW5uZXIgPSB7XHJcbiAgICAgIGhlYWRlcnM6IG5ldyBIZWFkZXJzKGluaXQ/LmhlYWRlcnMpLFxyXG4gICAgICBzdGF0dXM6IGluaXQ/LnN0YXR1cyA/PyAyMDAsXHJcbiAgICAgIHN0YXR1c1RleHQ6IGluaXQ/LnN0YXR1c1RleHQgPz8gXCJcIixcclxuICAgICAgdHlwZTogXCJkZWZhdWx0XCIsXHJcbiAgICAgIHVybDogbnVsbCxcclxuICAgICAgYWJvcnRlZDogZmFsc2VcclxuICAgIH07XHJcbiAgfVxyXG4gIHN0YXRpYyBbbWFrZVJlc3BvbnNlXShib2R5LCBpbm5lcikge1xyXG4gICAgY29uc3QgbWUgPSBuZXcgX1N5bmNSZXNwb25zZShib2R5KTtcclxuICAgIG1lLiNpbm5lciA9IGlubmVyO1xyXG4gICAgcmV0dXJuIG1lO1xyXG4gIH1cclxuICBnZXQgaGVhZGVycygpIHtcclxuICAgIHJldHVybiB0aGlzLiNpbm5lci5oZWFkZXJzO1xyXG4gIH1cclxuICBnZXQgc3RhdHVzKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuI2lubmVyLnN0YXR1cztcclxuICB9XHJcbiAgZ2V0IHN0YXR1c1RleHQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy4jaW5uZXIuc3RhdHVzVGV4dDtcclxuICB9XHJcbiAgZ2V0IG9rKCkge1xyXG4gICAgcmV0dXJuIDIwMCA8PSB0aGlzLiNpbm5lci5zdGF0dXMgJiYgdGhpcy4jaW5uZXIuc3RhdHVzIDw9IDI5OTtcclxuICB9XHJcbiAgZ2V0IHVybCgpIHtcclxuICAgIHJldHVybiB0aGlzLiNpbm5lci51cmwgPz8gXCJcIjtcclxuICB9XHJcbiAgZ2V0IHR5cGUoKSB7XHJcbiAgICByZXR1cm4gdGhpcy4jaW5uZXIudHlwZTtcclxuICB9XHJcbiAgYXJyYXlCdWZmZXIoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5ieXRlcygpLmJ1ZmZlcjtcclxuICB9XHJcbiAgYnl0ZXMoKSB7XHJcbiAgICBpZiAodGhpcy4jYm9keSA9PSBudWxsKSB7XHJcbiAgICAgIHJldHVybiBuZXcgVWludDhBcnJheSgpO1xyXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy4jYm9keSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICByZXR1cm4gdGV4dEVuY29kZXIuZW5jb2RlKHRoaXMuI2JvZHkpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KHRoaXMuI2JvZHkpO1xyXG4gICAgfVxyXG4gIH1cclxuICBqc29uKCkge1xyXG4gICAgcmV0dXJuIEpTT04ucGFyc2UodGhpcy50ZXh0KCkpO1xyXG4gIH1cclxuICB0ZXh0KCkge1xyXG4gICAgaWYgKHRoaXMuI2JvZHkgPT0gbnVsbCkge1xyXG4gICAgICByZXR1cm4gXCJcIjtcclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMuI2JvZHkgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuI2JvZHk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gdGV4dERlY29kZXIuZGVjb2RlKHRoaXMuI2JvZHkpO1xyXG4gICAgfVxyXG4gIH1cclxufTtcclxudmFyIHJlcXVlc3RCYXNlU2l6ZSA9IGJzYXRuQmFzZVNpemUoeyB0eXBlczogW10gfSwgSHR0cFJlcXVlc3QuYWxnZWJyYWljVHlwZSk7XHJcbnZhciBtZXRob2RzID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoW1xyXG4gIFtcIkdFVFwiLCB7IHRhZzogXCJHZXRcIiB9XSxcclxuICBbXCJIRUFEXCIsIHsgdGFnOiBcIkhlYWRcIiB9XSxcclxuICBbXCJQT1NUXCIsIHsgdGFnOiBcIlBvc3RcIiB9XSxcclxuICBbXCJQVVRcIiwgeyB0YWc6IFwiUHV0XCIgfV0sXHJcbiAgW1wiREVMRVRFXCIsIHsgdGFnOiBcIkRlbGV0ZVwiIH1dLFxyXG4gIFtcIkNPTk5FQ1RcIiwgeyB0YWc6IFwiQ29ubmVjdFwiIH1dLFxyXG4gIFtcIk9QVElPTlNcIiwgeyB0YWc6IFwiT3B0aW9uc1wiIH1dLFxyXG4gIFtcIlRSQUNFXCIsIHsgdGFnOiBcIlRyYWNlXCIgfV0sXHJcbiAgW1wiUEFUQ0hcIiwgeyB0YWc6IFwiUGF0Y2hcIiB9XVxyXG5dKTtcclxuZnVuY3Rpb24gZmV0Y2godXJsLCBpbml0ID0ge30pIHtcclxuICBjb25zdCBtZXRob2QgPSBtZXRob2RzLmdldChpbml0Lm1ldGhvZD8udG9VcHBlckNhc2UoKSA/PyBcIkdFVFwiKSA/PyB7XHJcbiAgICB0YWc6IFwiRXh0ZW5zaW9uXCIsXHJcbiAgICB2YWx1ZTogaW5pdC5tZXRob2RcclxuICB9O1xyXG4gIGNvbnN0IGhlYWRlcnMgPSB7XHJcbiAgICAvLyBhbnlzIGJlY2F1c2UgdGhlIHR5cGluZ3MgYXJlIHdvbmt5IC0gc2VlIGNvbW1lbnQgaW4gU3luY1Jlc3BvbnNlLmNvbnN0cnVjdG9yXHJcbiAgICBlbnRyaWVzOiBoZWFkZXJzVG9MaXN0KG5ldyBIZWFkZXJzKGluaXQuaGVhZGVycykpLmZsYXRNYXAoKFtrLCB2XSkgPT4gQXJyYXkuaXNBcnJheSh2KSA/IHYubWFwKCh2MikgPT4gW2ssIHYyXSkgOiBbW2ssIHZdXSkubWFwKChbbmFtZSwgdmFsdWVdKSA9PiAoeyBuYW1lLCB2YWx1ZTogdGV4dEVuY29kZXIuZW5jb2RlKHZhbHVlKSB9KSlcclxuICB9O1xyXG4gIGNvbnN0IHVyaSA9IFwiXCIgKyB1cmw7XHJcbiAgY29uc3QgcmVxdWVzdCA9IGZyZWV6ZTIoe1xyXG4gICAgbWV0aG9kLFxyXG4gICAgaGVhZGVycyxcclxuICAgIHRpbWVvdXQ6IGluaXQudGltZW91dCxcclxuICAgIHVyaSxcclxuICAgIHZlcnNpb246IHsgdGFnOiBcIkh0dHAxMVwiIH1cclxuICB9KTtcclxuICBjb25zdCByZXF1ZXN0QnVmID0gbmV3IEJpbmFyeVdyaXRlcihyZXF1ZXN0QmFzZVNpemUpO1xyXG4gIEh0dHBSZXF1ZXN0LnNlcmlhbGl6ZShyZXF1ZXN0QnVmLCByZXF1ZXN0KTtcclxuICBjb25zdCBib2R5ID0gaW5pdC5ib2R5ID09IG51bGwgPyBuZXcgVWludDhBcnJheSgpIDogdHlwZW9mIGluaXQuYm9keSA9PT0gXCJzdHJpbmdcIiA/IGluaXQuYm9keSA6IG5ldyBVaW50OEFycmF5KGluaXQuYm9keSk7XHJcbiAgY29uc3QgW3Jlc3BvbnNlQnVmLCByZXNwb25zZUJvZHldID0gc3lzLnByb2NlZHVyZV9odHRwX3JlcXVlc3QoXHJcbiAgICByZXF1ZXN0QnVmLmdldEJ1ZmZlcigpLFxyXG4gICAgYm9keVxyXG4gICk7XHJcbiAgY29uc3QgcmVzcG9uc2UgPSBIdHRwUmVzcG9uc2UuZGVzZXJpYWxpemUobmV3IEJpbmFyeVJlYWRlcihyZXNwb25zZUJ1ZikpO1xyXG4gIHJldHVybiBTeW5jUmVzcG9uc2VbbWFrZVJlc3BvbnNlXShyZXNwb25zZUJvZHksIHtcclxuICAgIHR5cGU6IFwiYmFzaWNcIixcclxuICAgIHVybDogdXJpLFxyXG4gICAgc3RhdHVzOiByZXNwb25zZS5jb2RlLFxyXG4gICAgc3RhdHVzVGV4dDogKDAsIGltcG9ydF9zdGF0dXNlcy5kZWZhdWx0KShyZXNwb25zZS5jb2RlKSxcclxuICAgIGhlYWRlcnM6IG5ldyBIZWFkZXJzKCksXHJcbiAgICBhYm9ydGVkOiBmYWxzZVxyXG4gIH0pO1xyXG59XHJcbmZyZWV6ZTIoZmV0Y2gpO1xyXG52YXIgaHR0cENsaWVudCA9IGZyZWV6ZTIoeyBmZXRjaCB9KTtcclxuXHJcbi8vIHNyYy9zZXJ2ZXIvcHJvY2VkdXJlcy50c1xyXG5mdW5jdGlvbiBtYWtlUHJvY2VkdXJlRXhwb3J0KGN0eCwgb3B0cywgcGFyYW1zLCByZXQsIGZuKSB7XHJcbiAgY29uc3QgbmFtZSA9IG9wdHM/Lm5hbWU7XHJcbiAgY29uc3QgcHJvY2VkdXJlRXhwb3J0ID0gKC4uLmFyZ3MpID0+IGZuKC4uLmFyZ3MpO1xyXG4gIHByb2NlZHVyZUV4cG9ydFtleHBvcnRDb250ZXh0XSA9IGN0eDtcclxuICBwcm9jZWR1cmVFeHBvcnRbcmVnaXN0ZXJFeHBvcnRdID0gKGN0eDIsIGV4cG9ydE5hbWUpID0+IHtcclxuICAgIHJlZ2lzdGVyUHJvY2VkdXJlKGN0eDIsIG5hbWUgPz8gZXhwb3J0TmFtZSwgcGFyYW1zLCByZXQsIGZuKTtcclxuICAgIGN0eDIuZnVuY3Rpb25FeHBvcnRzLnNldChcclxuICAgICAgcHJvY2VkdXJlRXhwb3J0LFxyXG4gICAgICBuYW1lID8/IGV4cG9ydE5hbWVcclxuICAgICk7XHJcbiAgfTtcclxuICByZXR1cm4gcHJvY2VkdXJlRXhwb3J0O1xyXG59XHJcbnZhciBUcmFuc2FjdGlvbkN0eEltcGwgPSBjbGFzcyBUcmFuc2FjdGlvbkN0eCBleHRlbmRzIFJlZHVjZXJDdHhJbXBsIHtcclxufTtcclxuZnVuY3Rpb24gcmVnaXN0ZXJQcm9jZWR1cmUoY3R4LCBleHBvcnROYW1lLCBwYXJhbXMsIHJldCwgZm4sIG9wdHMpIHtcclxuICBjdHguZGVmaW5lRnVuY3Rpb24oZXhwb3J0TmFtZSk7XHJcbiAgY29uc3QgcGFyYW1zVHlwZSA9IHtcclxuICAgIGVsZW1lbnRzOiBPYmplY3QuZW50cmllcyhwYXJhbXMpLm1hcCgoW24sIGNdKSA9PiAoe1xyXG4gICAgICBuYW1lOiBuLFxyXG4gICAgICBhbGdlYnJhaWNUeXBlOiBjdHgucmVnaXN0ZXJUeXBlc1JlY3Vyc2l2ZWx5KFxyXG4gICAgICAgIFwidHlwZUJ1aWxkZXJcIiBpbiBjID8gYy50eXBlQnVpbGRlciA6IGNcclxuICAgICAgKS5hbGdlYnJhaWNUeXBlXHJcbiAgICB9KSlcclxuICB9O1xyXG4gIGNvbnN0IHJldHVyblR5cGUgPSBjdHgucmVnaXN0ZXJUeXBlc1JlY3Vyc2l2ZWx5KHJldCkuYWxnZWJyYWljVHlwZTtcclxuICBjdHgubW9kdWxlRGVmLnByb2NlZHVyZXMucHVzaCh7XHJcbiAgICBzb3VyY2VOYW1lOiBleHBvcnROYW1lLFxyXG4gICAgcGFyYW1zOiBwYXJhbXNUeXBlLFxyXG4gICAgcmV0dXJuVHlwZSxcclxuICAgIHZpc2liaWxpdHk6IEZ1bmN0aW9uVmlzaWJpbGl0eS5DbGllbnRDYWxsYWJsZVxyXG4gIH0pO1xyXG4gIGNvbnN0IHsgdHlwZXNwYWNlIH0gPSBjdHg7XHJcbiAgY3R4LnByb2NlZHVyZXMucHVzaCh7XHJcbiAgICBmbixcclxuICAgIGRlc2VyaWFsaXplQXJnczogUHJvZHVjdFR5cGUubWFrZURlc2VyaWFsaXplcihwYXJhbXNUeXBlLCB0eXBlc3BhY2UpLFxyXG4gICAgc2VyaWFsaXplUmV0dXJuOiBBbGdlYnJhaWNUeXBlLm1ha2VTZXJpYWxpemVyKHJldHVyblR5cGUsIHR5cGVzcGFjZSksXHJcbiAgICByZXR1cm5UeXBlQmFzZVNpemU6IGJzYXRuQmFzZVNpemUodHlwZXNwYWNlLCByZXR1cm5UeXBlKVxyXG4gIH0pO1xyXG59XHJcbmZ1bmN0aW9uIGNhbGxQcm9jZWR1cmUobW9kdWxlQ3R4LCBpZCwgc2VuZGVyLCBjb25uZWN0aW9uSWQsIHRpbWVzdGFtcCwgYXJnc0J1ZiwgZGJWaWV3KSB7XHJcbiAgY29uc3QgeyBmbiwgZGVzZXJpYWxpemVBcmdzLCBzZXJpYWxpemVSZXR1cm4sIHJldHVyblR5cGVCYXNlU2l6ZSB9ID0gbW9kdWxlQ3R4LnByb2NlZHVyZXNbaWRdO1xyXG4gIGNvbnN0IGFyZ3MgPSBkZXNlcmlhbGl6ZUFyZ3MobmV3IEJpbmFyeVJlYWRlcihhcmdzQnVmKSk7XHJcbiAgY29uc3QgY3R4ID0gbmV3IFByb2NlZHVyZUN0eEltcGwoXHJcbiAgICBzZW5kZXIsXHJcbiAgICB0aW1lc3RhbXAsXHJcbiAgICBjb25uZWN0aW9uSWQsXHJcbiAgICBkYlZpZXdcclxuICApO1xyXG4gIGNvbnN0IHJldCA9IGNhbGxVc2VyRnVuY3Rpb24oZm4sIGN0eCwgYXJncyk7XHJcbiAgY29uc3QgcmV0QnVmID0gbmV3IEJpbmFyeVdyaXRlcihyZXR1cm5UeXBlQmFzZVNpemUpO1xyXG4gIHNlcmlhbGl6ZVJldHVybihyZXRCdWYsIHJldCk7XHJcbiAgcmV0dXJuIHJldEJ1Zi5nZXRCdWZmZXIoKTtcclxufVxyXG52YXIgUHJvY2VkdXJlQ3R4SW1wbCA9IGNsYXNzIFByb2NlZHVyZUN0eCB7XHJcbiAgY29uc3RydWN0b3Ioc2VuZGVyLCB0aW1lc3RhbXAsIGNvbm5lY3Rpb25JZCwgZGJWaWV3KSB7XHJcbiAgICB0aGlzLnNlbmRlciA9IHNlbmRlcjtcclxuICAgIHRoaXMudGltZXN0YW1wID0gdGltZXN0YW1wO1xyXG4gICAgdGhpcy5jb25uZWN0aW9uSWQgPSBjb25uZWN0aW9uSWQ7XHJcbiAgICB0aGlzLiNkYlZpZXcgPSBkYlZpZXc7XHJcbiAgfVxyXG4gICNpZGVudGl0eTtcclxuICAjdXVpZENvdW50ZXI7XHJcbiAgI3JhbmRvbTtcclxuICAjZGJWaWV3O1xyXG4gIGdldCBpZGVudGl0eSgpIHtcclxuICAgIHJldHVybiB0aGlzLiNpZGVudGl0eSA/Pz0gbmV3IElkZW50aXR5KHN5cy5pZGVudGl0eSgpKTtcclxuICB9XHJcbiAgZ2V0IHJhbmRvbSgpIHtcclxuICAgIHJldHVybiB0aGlzLiNyYW5kb20gPz89IG1ha2VSYW5kb20odGhpcy50aW1lc3RhbXApO1xyXG4gIH1cclxuICBnZXQgaHR0cCgpIHtcclxuICAgIHJldHVybiBodHRwQ2xpZW50O1xyXG4gIH1cclxuICB3aXRoVHgoYm9keSkge1xyXG4gICAgY29uc3QgcnVuID0gKCkgPT4ge1xyXG4gICAgICBjb25zdCB0aW1lc3RhbXAgPSBzeXMucHJvY2VkdXJlX3N0YXJ0X211dF90eCgpO1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IGN0eCA9IG5ldyBUcmFuc2FjdGlvbkN0eEltcGwoXHJcbiAgICAgICAgICB0aGlzLnNlbmRlcixcclxuICAgICAgICAgIG5ldyBUaW1lc3RhbXAodGltZXN0YW1wKSxcclxuICAgICAgICAgIHRoaXMuY29ubmVjdGlvbklkLFxyXG4gICAgICAgICAgdGhpcy4jZGJWaWV3KClcclxuICAgICAgICApO1xyXG4gICAgICAgIHJldHVybiBib2R5KGN0eCk7XHJcbiAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICBzeXMucHJvY2VkdXJlX2Fib3J0X211dF90eCgpO1xyXG4gICAgICAgIHRocm93IGU7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICBsZXQgcmVzID0gcnVuKCk7XHJcbiAgICB0cnkge1xyXG4gICAgICBzeXMucHJvY2VkdXJlX2NvbW1pdF9tdXRfdHgoKTtcclxuICAgICAgcmV0dXJuIHJlcztcclxuICAgIH0gY2F0Y2gge1xyXG4gICAgfVxyXG4gICAgY29uc29sZS53YXJuKFwiY29tbWl0dGluZyBhbm9ueW1vdXMgdHJhbnNhY3Rpb24gZmFpbGVkXCIpO1xyXG4gICAgcmVzID0gcnVuKCk7XHJcbiAgICB0cnkge1xyXG4gICAgICBzeXMucHJvY2VkdXJlX2NvbW1pdF9tdXRfdHgoKTtcclxuICAgICAgcmV0dXJuIHJlcztcclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwidHJhbnNhY3Rpb24gcmV0cnkgZmFpbGVkIGFnYWluXCIsIHsgY2F1c2U6IGUgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIG5ld1V1aWRWNCgpIHtcclxuICAgIGNvbnN0IGJ5dGVzID0gdGhpcy5yYW5kb20uZmlsbChuZXcgVWludDhBcnJheSgxNikpO1xyXG4gICAgcmV0dXJuIFV1aWQuZnJvbVJhbmRvbUJ5dGVzVjQoYnl0ZXMpO1xyXG4gIH1cclxuICBuZXdVdWlkVjcoKSB7XHJcbiAgICBjb25zdCBieXRlcyA9IHRoaXMucmFuZG9tLmZpbGwobmV3IFVpbnQ4QXJyYXkoNCkpO1xyXG4gICAgY29uc3QgY291bnRlciA9IHRoaXMuI3V1aWRDb3VudGVyID8/PSB7IHZhbHVlOiAwIH07XHJcbiAgICByZXR1cm4gVXVpZC5mcm9tQ291bnRlclY3KGNvdW50ZXIsIHRoaXMudGltZXN0YW1wLCBieXRlcyk7XHJcbiAgfVxyXG59O1xyXG5cclxuLy8gc3JjL3NlcnZlci9yZWR1Y2Vycy50c1xyXG5mdW5jdGlvbiBtYWtlUmVkdWNlckV4cG9ydChjdHgsIG9wdHMsIHBhcmFtcywgZm4sIGxpZmVjeWNsZSkge1xyXG4gIGNvbnN0IHJlZHVjZXJFeHBvcnQgPSAoLi4uYXJncykgPT4gZm4oLi4uYXJncyk7XHJcbiAgcmVkdWNlckV4cG9ydFtleHBvcnRDb250ZXh0XSA9IGN0eDtcclxuICByZWR1Y2VyRXhwb3J0W3JlZ2lzdGVyRXhwb3J0XSA9IChjdHgyLCBleHBvcnROYW1lKSA9PiB7XHJcbiAgICByZWdpc3RlclJlZHVjZXIoY3R4MiwgZXhwb3J0TmFtZSwgcGFyYW1zLCBmbiwgb3B0cywgbGlmZWN5Y2xlKTtcclxuICAgIGN0eDIuZnVuY3Rpb25FeHBvcnRzLnNldChcclxuICAgICAgcmVkdWNlckV4cG9ydCxcclxuICAgICAgZXhwb3J0TmFtZVxyXG4gICAgKTtcclxuICB9O1xyXG4gIHJldHVybiByZWR1Y2VyRXhwb3J0O1xyXG59XHJcbmZ1bmN0aW9uIHJlZ2lzdGVyUmVkdWNlcihjdHgsIGV4cG9ydE5hbWUsIHBhcmFtcywgZm4sIG9wdHMsIGxpZmVjeWNsZSkge1xyXG4gIGN0eC5kZWZpbmVGdW5jdGlvbihleHBvcnROYW1lKTtcclxuICBpZiAoIShwYXJhbXMgaW5zdGFuY2VvZiBSb3dCdWlsZGVyKSkge1xyXG4gICAgcGFyYW1zID0gbmV3IFJvd0J1aWxkZXIocGFyYW1zKTtcclxuICB9XHJcbiAgaWYgKHBhcmFtcy50eXBlTmFtZSA9PT0gdm9pZCAwKSB7XHJcbiAgICBwYXJhbXMudHlwZU5hbWUgPSB0b1Bhc2NhbENhc2UoZXhwb3J0TmFtZSk7XHJcbiAgfVxyXG4gIGNvbnN0IHJlZiA9IGN0eC5yZWdpc3RlclR5cGVzUmVjdXJzaXZlbHkocGFyYW1zKTtcclxuICBjb25zdCBwYXJhbXNUeXBlID0gY3R4LnJlc29sdmVUeXBlKHJlZikudmFsdWU7XHJcbiAgY29uc3QgaXNMaWZlY3ljbGUgPSBsaWZlY3ljbGUgIT0gbnVsbDtcclxuICBjdHgubW9kdWxlRGVmLnJlZHVjZXJzLnB1c2goe1xyXG4gICAgc291cmNlTmFtZTogZXhwb3J0TmFtZSxcclxuICAgIHBhcmFtczogcGFyYW1zVHlwZSxcclxuICAgIC8vTW9kdWxlRGVmIHZhbGlkYXRpb24gY29kZSBpcyByZXNwb25zaWJsZSB0byBtYXJrIHByaXZhdGUgcmVkdWNlcnNcclxuICAgIHZpc2liaWxpdHk6IEZ1bmN0aW9uVmlzaWJpbGl0eS5DbGllbnRDYWxsYWJsZSxcclxuICAgIC8vSGFyZGNvZGVkIGZvciBub3cgLSByZWR1Y2VycyBkbyBub3QgcmV0dXJuIHZhbHVlcyB5ZXRcclxuICAgIG9rUmV0dXJuVHlwZTogQWxnZWJyYWljVHlwZS5Qcm9kdWN0KHsgZWxlbWVudHM6IFtdIH0pLFxyXG4gICAgZXJyUmV0dXJuVHlwZTogQWxnZWJyYWljVHlwZS5TdHJpbmdcclxuICB9KTtcclxuICBpZiAob3B0cz8ubmFtZSAhPSBudWxsKSB7XHJcbiAgICBjdHgubW9kdWxlRGVmLmV4cGxpY2l0TmFtZXMuZW50cmllcy5wdXNoKHtcclxuICAgICAgdGFnOiBcIkZ1bmN0aW9uXCIsXHJcbiAgICAgIHZhbHVlOiB7XHJcbiAgICAgICAgc291cmNlTmFtZTogZXhwb3J0TmFtZSxcclxuICAgICAgICBjYW5vbmljYWxOYW1lOiBvcHRzLm5hbWVcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIGlmIChpc0xpZmVjeWNsZSkge1xyXG4gICAgY3R4Lm1vZHVsZURlZi5saWZlQ3ljbGVSZWR1Y2Vycy5wdXNoKHtcclxuICAgICAgbGlmZWN5Y2xlU3BlYzogbGlmZWN5Y2xlLFxyXG4gICAgICBmdW5jdGlvbk5hbWU6IGV4cG9ydE5hbWVcclxuICAgIH0pO1xyXG4gIH1cclxuICBpZiAoIWZuLm5hbWUpIHtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShmbiwgXCJuYW1lXCIsIHsgdmFsdWU6IGV4cG9ydE5hbWUsIHdyaXRhYmxlOiBmYWxzZSB9KTtcclxuICB9XHJcbiAgY3R4LnJlZHVjZXJzLnB1c2goZm4pO1xyXG59XHJcblxyXG4vLyBzcmMvc2VydmVyL3NjaGVtYS50c1xyXG52YXIgU2NoZW1hSW5uZXIgPSBjbGFzcyBleHRlbmRzIE1vZHVsZUNvbnRleHQge1xyXG4gIHNjaGVtYVR5cGU7XHJcbiAgZXhpc3RpbmdGdW5jdGlvbnMgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpO1xyXG4gIHJlZHVjZXJzID0gW107XHJcbiAgcHJvY2VkdXJlcyA9IFtdO1xyXG4gIHZpZXdzID0gW107XHJcbiAgYW5vblZpZXdzID0gW107XHJcbiAgLyoqXHJcbiAgICogTWFwcyBSZWR1Y2VyRXhwb3J0IG9iamVjdHMgdG8gdGhlIG5hbWUgb2YgdGhlIHJlZHVjZXIuXHJcbiAgICogVXNlZCBmb3IgcmVzb2x2aW5nIHRoZSByZWR1Y2VycyBvZiBzY2hlZHVsZWQgdGFibGVzLlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uRXhwb3J0cyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XHJcbiAgcGVuZGluZ1NjaGVkdWxlcyA9IFtdO1xyXG4gIGNvbnN0cnVjdG9yKGdldFNjaGVtYVR5cGUpIHtcclxuICAgIHN1cGVyKCk7XHJcbiAgICB0aGlzLnNjaGVtYVR5cGUgPSBnZXRTY2hlbWFUeXBlKHRoaXMpO1xyXG4gIH1cclxuICBkZWZpbmVGdW5jdGlvbihuYW1lKSB7XHJcbiAgICBpZiAodGhpcy5leGlzdGluZ0Z1bmN0aW9ucy5oYXMobmFtZSkpIHtcclxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcclxuICAgICAgICBgVGhlcmUgaXMgYWxyZWFkeSBhIHJlZHVjZXIgb3IgcHJvY2VkdXJlIHdpdGggdGhlIG5hbWUgJyR7bmFtZX0nYFxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gICAgdGhpcy5leGlzdGluZ0Z1bmN0aW9ucy5hZGQobmFtZSk7XHJcbiAgfVxyXG4gIHJlc29sdmVTY2hlZHVsZXMoKSB7XHJcbiAgICBmb3IgKGNvbnN0IHsgcmVkdWNlciwgc2NoZWR1bGVBdENvbCwgdGFibGVOYW1lIH0gb2YgdGhpcy5wZW5kaW5nU2NoZWR1bGVzKSB7XHJcbiAgICAgIGNvbnN0IGZ1bmN0aW9uTmFtZSA9IHRoaXMuZnVuY3Rpb25FeHBvcnRzLmdldChyZWR1Y2VyKCkpO1xyXG4gICAgICBpZiAoZnVuY3Rpb25OYW1lID09PSB2b2lkIDApIHtcclxuICAgICAgICBjb25zdCBtc2cgPSBgVGFibGUgJHt0YWJsZU5hbWV9IGRlZmluZXMgYSBzY2hlZHVsZSwgYnV0IGl0IHNlZW1zIGxpa2UgdGhlIGFzc29jaWF0ZWQgZnVuY3Rpb24gd2FzIG5vdCBleHBvcnRlZC5gO1xyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IobXNnKTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLm1vZHVsZURlZi5zY2hlZHVsZXMucHVzaCh7XHJcbiAgICAgICAgc291cmNlTmFtZTogdm9pZCAwLFxyXG4gICAgICAgIHRhYmxlTmFtZSxcclxuICAgICAgICBzY2hlZHVsZUF0Q29sLFxyXG4gICAgICAgIGZ1bmN0aW9uTmFtZVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcbn07XHJcbnZhciBTY2hlbWEgPSBjbGFzcyB7XHJcbiAgI2N0eDtcclxuICBjb25zdHJ1Y3RvcihjdHgpIHtcclxuICAgIHRoaXMuI2N0eCA9IGN0eDtcclxuICB9XHJcbiAgW21vZHVsZUhvb2tzXShleHBvcnRzKSB7XHJcbiAgICBjb25zdCByZWdpc3RlcmVkU2NoZW1hID0gdGhpcy4jY3R4O1xyXG4gICAgZm9yIChjb25zdCBbbmFtZSwgbW9kdWxlRXhwb3J0XSBvZiBPYmplY3QuZW50cmllcyhleHBvcnRzKSkge1xyXG4gICAgICBpZiAobmFtZSA9PT0gXCJkZWZhdWx0XCIpIGNvbnRpbnVlO1xyXG4gICAgICBpZiAoIWlzTW9kdWxlRXhwb3J0KG1vZHVsZUV4cG9ydCkpIHtcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxyXG4gICAgICAgICAgXCJleHBvcnRpbmcgc29tZXRoaW5nIHRoYXQgaXMgbm90IGEgc3BhY2V0aW1lIGV4cG9ydFwiXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgICBjaGVja0V4cG9ydENvbnRleHQobW9kdWxlRXhwb3J0LCByZWdpc3RlcmVkU2NoZW1hKTtcclxuICAgICAgbW9kdWxlRXhwb3J0W3JlZ2lzdGVyRXhwb3J0XShyZWdpc3RlcmVkU2NoZW1hLCBuYW1lKTtcclxuICAgIH1cclxuICAgIHJlZ2lzdGVyZWRTY2hlbWEucmVzb2x2ZVNjaGVkdWxlcygpO1xyXG4gICAgcmV0dXJuIG1ha2VIb29rcyhyZWdpc3RlcmVkU2NoZW1hKTtcclxuICB9XHJcbiAgZ2V0IHNjaGVtYVR5cGUoKSB7XHJcbiAgICByZXR1cm4gdGhpcy4jY3R4LnNjaGVtYVR5cGU7XHJcbiAgfVxyXG4gIGdldCBtb2R1bGVEZWYoKSB7XHJcbiAgICByZXR1cm4gdGhpcy4jY3R4Lm1vZHVsZURlZjtcclxuICB9XHJcbiAgZ2V0IHR5cGVzcGFjZSgpIHtcclxuICAgIHJldHVybiB0aGlzLiNjdHgudHlwZXNwYWNlO1xyXG4gIH1cclxuICByZWR1Y2VyKC4uLmFyZ3MpIHtcclxuICAgIGxldCBvcHRzLCBwYXJhbXMgPSB7fSwgZm47XHJcbiAgICBzd2l0Y2ggKGFyZ3MubGVuZ3RoKSB7XHJcbiAgICAgIGNhc2UgMTpcclxuICAgICAgICBbZm5dID0gYXJncztcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAyOiB7XHJcbiAgICAgICAgbGV0IGFyZzE7XHJcbiAgICAgICAgW2FyZzEsIGZuXSA9IGFyZ3M7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBhcmcxLm5hbWUgPT09IFwic3RyaW5nXCIpIG9wdHMgPSBhcmcxO1xyXG4gICAgICAgIGVsc2UgcGFyYW1zID0gYXJnMTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBjYXNlIDM6XHJcbiAgICAgICAgW29wdHMsIHBhcmFtcywgZm5dID0gYXJncztcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICAgIHJldHVybiBtYWtlUmVkdWNlckV4cG9ydCh0aGlzLiNjdHgsIG9wdHMsIHBhcmFtcywgZm4pO1xyXG4gIH1cclxuICBpbml0KC4uLmFyZ3MpIHtcclxuICAgIGxldCBvcHRzLCBmbjtcclxuICAgIHN3aXRjaCAoYXJncy5sZW5ndGgpIHtcclxuICAgICAgY2FzZSAxOlxyXG4gICAgICAgIFtmbl0gPSBhcmdzO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDI6XHJcbiAgICAgICAgW29wdHMsIGZuXSA9IGFyZ3M7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbWFrZVJlZHVjZXJFeHBvcnQodGhpcy4jY3R4LCBvcHRzLCB7fSwgZm4sIExpZmVjeWNsZS5Jbml0KTtcclxuICB9XHJcbiAgY2xpZW50Q29ubmVjdGVkKC4uLmFyZ3MpIHtcclxuICAgIGxldCBvcHRzLCBmbjtcclxuICAgIHN3aXRjaCAoYXJncy5sZW5ndGgpIHtcclxuICAgICAgY2FzZSAxOlxyXG4gICAgICAgIFtmbl0gPSBhcmdzO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDI6XHJcbiAgICAgICAgW29wdHMsIGZuXSA9IGFyZ3M7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbWFrZVJlZHVjZXJFeHBvcnQodGhpcy4jY3R4LCBvcHRzLCB7fSwgZm4sIExpZmVjeWNsZS5PbkNvbm5lY3QpO1xyXG4gIH1cclxuICBjbGllbnREaXNjb25uZWN0ZWQoLi4uYXJncykge1xyXG4gICAgbGV0IG9wdHMsIGZuO1xyXG4gICAgc3dpdGNoIChhcmdzLmxlbmd0aCkge1xyXG4gICAgICBjYXNlIDE6XHJcbiAgICAgICAgW2ZuXSA9IGFyZ3M7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgMjpcclxuICAgICAgICBbb3B0cywgZm5dID0gYXJncztcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICAgIHJldHVybiBtYWtlUmVkdWNlckV4cG9ydCh0aGlzLiNjdHgsIG9wdHMsIHt9LCBmbiwgTGlmZWN5Y2xlLk9uRGlzY29ubmVjdCk7XHJcbiAgfVxyXG4gIHZpZXcob3B0cywgcmV0LCBmbikge1xyXG4gICAgcmV0dXJuIG1ha2VWaWV3RXhwb3J0KHRoaXMuI2N0eCwgb3B0cywge30sIHJldCwgZm4pO1xyXG4gIH1cclxuICAvLyBUT0RPOiByZS1lbmFibGUgb25jZSBwYXJhbWV0ZXJpemVkIHZpZXdzIGFyZSBzdXBwb3J0ZWQgaW4gU1FMXHJcbiAgLy8gdmlldzxSZXQgZXh0ZW5kcyBWaWV3UmV0dXJuVHlwZUJ1aWxkZXI+KFxyXG4gIC8vICAgb3B0czogVmlld09wdHMsXHJcbiAgLy8gICByZXQ6IFJldCxcclxuICAvLyAgIGZuOiBWaWV3Rm48Uywge30sIFJldD5cclxuICAvLyApOiB2b2lkO1xyXG4gIC8vIHZpZXc8UGFyYW1zIGV4dGVuZHMgUGFyYW1zT2JqLCBSZXQgZXh0ZW5kcyBWaWV3UmV0dXJuVHlwZUJ1aWxkZXI+KFxyXG4gIC8vICAgb3B0czogVmlld09wdHMsXHJcbiAgLy8gICBwYXJhbXM6IFBhcmFtcyxcclxuICAvLyAgIHJldDogUmV0LFxyXG4gIC8vICAgZm46IFZpZXdGbjxTLCB7fSwgUmV0PlxyXG4gIC8vICk6IHZvaWQ7XHJcbiAgLy8gdmlldzxQYXJhbXMgZXh0ZW5kcyBQYXJhbXNPYmosIFJldCBleHRlbmRzIFZpZXdSZXR1cm5UeXBlQnVpbGRlcj4oXHJcbiAgLy8gICBvcHRzOiBWaWV3T3B0cyxcclxuICAvLyAgIHBhcmFtc09yUmV0OiBSZXQgfCBQYXJhbXMsXHJcbiAgLy8gICByZXRPckZuOiBWaWV3Rm48Uywge30sIFJldD4gfCBSZXQsXHJcbiAgLy8gICBtYXliZUZuPzogVmlld0ZuPFMsIFBhcmFtcywgUmV0PlxyXG4gIC8vICk6IHZvaWQge1xyXG4gIC8vICAgaWYgKHR5cGVvZiByZXRPckZuID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgLy8gICAgIGRlZmluZVZpZXcobmFtZSwgZmFsc2UsIHt9LCBwYXJhbXNPclJldCBhcyBSZXQsIHJldE9yRm4pO1xyXG4gIC8vICAgfSBlbHNlIHtcclxuICAvLyAgICAgZGVmaW5lVmlldyhuYW1lLCBmYWxzZSwgcGFyYW1zT3JSZXQgYXMgUGFyYW1zLCByZXRPckZuLCBtYXliZUZuISk7XHJcbiAgLy8gICB9XHJcbiAgLy8gfVxyXG4gIGFub255bW91c1ZpZXcob3B0cywgcmV0LCBmbikge1xyXG4gICAgcmV0dXJuIG1ha2VBbm9uVmlld0V4cG9ydCh0aGlzLiNjdHgsIG9wdHMsIHt9LCByZXQsIGZuKTtcclxuICB9XHJcbiAgcHJvY2VkdXJlKC4uLmFyZ3MpIHtcclxuICAgIGxldCBvcHRzLCBwYXJhbXMgPSB7fSwgcmV0LCBmbjtcclxuICAgIHN3aXRjaCAoYXJncy5sZW5ndGgpIHtcclxuICAgICAgY2FzZSAyOlxyXG4gICAgICAgIFtyZXQsIGZuXSA9IGFyZ3M7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgMzoge1xyXG4gICAgICAgIGxldCBhcmcxO1xyXG4gICAgICAgIFthcmcxLCByZXQsIGZuXSA9IGFyZ3M7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBhcmcxLm5hbWUgPT09IFwic3RyaW5nXCIpIG9wdHMgPSBhcmcxO1xyXG4gICAgICAgIGVsc2UgcGFyYW1zID0gYXJnMTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBjYXNlIDQ6XHJcbiAgICAgICAgW29wdHMsIHBhcmFtcywgcmV0LCBmbl0gPSBhcmdzO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG1ha2VQcm9jZWR1cmVFeHBvcnQodGhpcy4jY3R4LCBvcHRzLCBwYXJhbXMsIHJldCwgZm4pO1xyXG4gIH1cclxuICAvKipcclxuICAgKiBCdW5kbGUgbXVsdGlwbGUgcmVkdWNlcnMsIHByb2NlZHVyZXMsIGV0YyBpbnRvIG9uZSB2YWx1ZSB0byBleHBvcnQuXHJcbiAgICogVGhlIG5hbWUgdGhleSB3aWxsIGJlIGV4cG9ydGVkIHdpdGggaXMgdGhlaXIgY29ycmVzcG9uZGluZyBrZXkgaW4gdGhlIGBleHBvcnRzYCBhcmd1bWVudC5cclxuICAgKi9cclxuICBleHBvcnRHcm91cChleHBvcnRzKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBbZXhwb3J0Q29udGV4dF06IHRoaXMuI2N0eCxcclxuICAgICAgW3JlZ2lzdGVyRXhwb3J0XShjdHgsIF9leHBvcnROYW1lKSB7XHJcbiAgICAgICAgZm9yIChjb25zdCBbZXhwb3J0TmFtZSwgbW9kdWxlRXhwb3J0XSBvZiBPYmplY3QuZW50cmllcyhleHBvcnRzKSkge1xyXG4gICAgICAgICAgY2hlY2tFeHBvcnRDb250ZXh0KG1vZHVsZUV4cG9ydCwgY3R4KTtcclxuICAgICAgICAgIG1vZHVsZUV4cG9ydFtyZWdpc3RlckV4cG9ydF0oY3R4LCBleHBvcnROYW1lKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfVxyXG4gIGNsaWVudFZpc2liaWxpdHlGaWx0ZXIgPSB7XHJcbiAgICBzcWw6IChmaWx0ZXIpID0+ICh7XHJcbiAgICAgIFtleHBvcnRDb250ZXh0XTogdGhpcy4jY3R4LFxyXG4gICAgICBbcmVnaXN0ZXJFeHBvcnRdKGN0eCwgX2V4cG9ydE5hbWUpIHtcclxuICAgICAgICBjdHgubW9kdWxlRGVmLnJvd0xldmVsU2VjdXJpdHkucHVzaCh7IHNxbDogZmlsdGVyIH0pO1xyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH07XHJcbn07XHJcbnZhciByZWdpc3RlckV4cG9ydCA9IFN5bWJvbChcIlNwYWNldGltZURCLnJlZ2lzdGVyRXhwb3J0XCIpO1xyXG52YXIgZXhwb3J0Q29udGV4dCA9IFN5bWJvbChcIlNwYWNldGltZURCLmV4cG9ydENvbnRleHRcIik7XHJcbmZ1bmN0aW9uIGlzTW9kdWxlRXhwb3J0KHgpIHtcclxuICByZXR1cm4gKHR5cGVvZiB4ID09PSBcImZ1bmN0aW9uXCIgfHwgdHlwZW9mIHggPT09IFwib2JqZWN0XCIpICYmIHggIT09IG51bGwgJiYgcmVnaXN0ZXJFeHBvcnQgaW4geDtcclxufVxyXG5mdW5jdGlvbiBjaGVja0V4cG9ydENvbnRleHQoZXhwLCBzY2hlbWEyKSB7XHJcbiAgaWYgKGV4cFtleHBvcnRDb250ZXh0XSAhPSBudWxsICYmIGV4cFtleHBvcnRDb250ZXh0XSAhPT0gc2NoZW1hMikge1xyXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIm11bHRpcGxlIHNjaGVtYXMgYXJlIG5vdCBzdXBwb3J0ZWRcIik7XHJcbiAgfVxyXG59XHJcbmZ1bmN0aW9uIHNjaGVtYSh0YWJsZXMsIG1vZHVsZVNldHRpbmdzKSB7XHJcbiAgY29uc3QgY3R4ID0gbmV3IFNjaGVtYUlubmVyKChjdHgyKSA9PiB7XHJcbiAgICBpZiAobW9kdWxlU2V0dGluZ3M/LkNBU0VfQ09OVkVSU0lPTl9QT0xJQ1kgIT0gbnVsbCkge1xyXG4gICAgICBjdHgyLnNldENhc2VDb252ZXJzaW9uUG9saWN5KG1vZHVsZVNldHRpbmdzLkNBU0VfQ09OVkVSU0lPTl9QT0xJQ1kpO1xyXG4gICAgfVxyXG4gICAgY29uc3QgdGFibGVTY2hlbWFzID0ge307XHJcbiAgICBmb3IgKGNvbnN0IFthY2NOYW1lLCB0YWJsZTJdIG9mIE9iamVjdC5lbnRyaWVzKHRhYmxlcykpIHtcclxuICAgICAgY29uc3QgdGFibGVEZWYgPSB0YWJsZTIudGFibGVEZWYoY3R4MiwgYWNjTmFtZSk7XHJcbiAgICAgIHRhYmxlU2NoZW1hc1thY2NOYW1lXSA9IHRhYmxlVG9TY2hlbWEoYWNjTmFtZSwgdGFibGUyLCB0YWJsZURlZik7XHJcbiAgICAgIGN0eDIubW9kdWxlRGVmLnRhYmxlcy5wdXNoKHRhYmxlRGVmKTtcclxuICAgICAgaWYgKHRhYmxlMi5zY2hlZHVsZSkge1xyXG4gICAgICAgIGN0eDIucGVuZGluZ1NjaGVkdWxlcy5wdXNoKHtcclxuICAgICAgICAgIC4uLnRhYmxlMi5zY2hlZHVsZSxcclxuICAgICAgICAgIHRhYmxlTmFtZTogdGFibGVEZWYuc291cmNlTmFtZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICh0YWJsZTIudGFibGVOYW1lKSB7XHJcbiAgICAgICAgY3R4Mi5tb2R1bGVEZWYuZXhwbGljaXROYW1lcy5lbnRyaWVzLnB1c2goe1xyXG4gICAgICAgICAgdGFnOiBcIlRhYmxlXCIsXHJcbiAgICAgICAgICB2YWx1ZToge1xyXG4gICAgICAgICAgICBzb3VyY2VOYW1lOiBhY2NOYW1lLFxyXG4gICAgICAgICAgICBjYW5vbmljYWxOYW1lOiB0YWJsZTIudGFibGVOYW1lXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB7IHRhYmxlczogdGFibGVTY2hlbWFzIH07XHJcbiAgfSk7XHJcbiAgcmV0dXJuIG5ldyBTY2hlbWEoY3R4KTtcclxufVxyXG5cclxuLy8gc3JjL3NlcnZlci9jb25zb2xlLnRzXHJcbnZhciBpbXBvcnRfb2JqZWN0X2luc3BlY3QgPSBfX3RvRVNNKHJlcXVpcmVfb2JqZWN0X2luc3BlY3QoKSk7XHJcbnZhciBmbXRMb2cgPSAoLi4uZGF0YSkgPT4gZGF0YS5tYXAoKHgpID0+IHR5cGVvZiB4ID09PSBcInN0cmluZ1wiID8geCA6ICgwLCBpbXBvcnRfb2JqZWN0X2luc3BlY3QuZGVmYXVsdCkoeCkpLmpvaW4oXCIgXCIpO1xyXG52YXIgY29uc29sZV9sZXZlbF9lcnJvciA9IDA7XHJcbnZhciBjb25zb2xlX2xldmVsX3dhcm4gPSAxO1xyXG52YXIgY29uc29sZV9sZXZlbF9pbmZvID0gMjtcclxudmFyIGNvbnNvbGVfbGV2ZWxfZGVidWcgPSAzO1xyXG52YXIgY29uc29sZV9sZXZlbF90cmFjZSA9IDQ7XHJcbnZhciB0aW1lck1hcCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XHJcbnZhciBjb25zb2xlMiA9IHtcclxuICAvLyBAdHMtZXhwZWN0LWVycm9yIHdlIHdhbnQgYSBibGFuayBwcm90b3R5cGUsIGJ1dCB0eXBlc2NyaXB0IGNvbXBsYWluc1xyXG4gIF9fcHJvdG9fXzoge30sXHJcbiAgW1N5bWJvbC50b1N0cmluZ1RhZ106IFwiY29uc29sZVwiLFxyXG4gIGFzc2VydDogKGNvbmRpdGlvbiA9IGZhbHNlLCAuLi5kYXRhKSA9PiB7XHJcbiAgICBpZiAoIWNvbmRpdGlvbikge1xyXG4gICAgICBzeXMuY29uc29sZV9sb2coY29uc29sZV9sZXZlbF9lcnJvciwgZm10TG9nKC4uLmRhdGEpKTtcclxuICAgIH1cclxuICB9LFxyXG4gIGNsZWFyOiAoKSA9PiB7XHJcbiAgfSxcclxuICBkZWJ1ZzogKC4uLmRhdGEpID0+IHtcclxuICAgIHN5cy5jb25zb2xlX2xvZyhjb25zb2xlX2xldmVsX2RlYnVnLCBmbXRMb2coLi4uZGF0YSkpO1xyXG4gIH0sXHJcbiAgZXJyb3I6ICguLi5kYXRhKSA9PiB7XHJcbiAgICBzeXMuY29uc29sZV9sb2coY29uc29sZV9sZXZlbF9lcnJvciwgZm10TG9nKC4uLmRhdGEpKTtcclxuICB9LFxyXG4gIGluZm86ICguLi5kYXRhKSA9PiB7XHJcbiAgICBzeXMuY29uc29sZV9sb2coY29uc29sZV9sZXZlbF9pbmZvLCBmbXRMb2coLi4uZGF0YSkpO1xyXG4gIH0sXHJcbiAgbG9nOiAoLi4uZGF0YSkgPT4ge1xyXG4gICAgc3lzLmNvbnNvbGVfbG9nKGNvbnNvbGVfbGV2ZWxfaW5mbywgZm10TG9nKC4uLmRhdGEpKTtcclxuICB9LFxyXG4gIHRhYmxlOiAodGFidWxhckRhdGEsIF9wcm9wZXJ0aWVzKSA9PiB7XHJcbiAgICBzeXMuY29uc29sZV9sb2coY29uc29sZV9sZXZlbF9pbmZvLCBmbXRMb2codGFidWxhckRhdGEpKTtcclxuICB9LFxyXG4gIHRyYWNlOiAoLi4uZGF0YSkgPT4ge1xyXG4gICAgc3lzLmNvbnNvbGVfbG9nKGNvbnNvbGVfbGV2ZWxfdHJhY2UsIGZtdExvZyguLi5kYXRhKSk7XHJcbiAgfSxcclxuICB3YXJuOiAoLi4uZGF0YSkgPT4ge1xyXG4gICAgc3lzLmNvbnNvbGVfbG9nKGNvbnNvbGVfbGV2ZWxfd2FybiwgZm10TG9nKC4uLmRhdGEpKTtcclxuICB9LFxyXG4gIGRpcjogKF9pdGVtLCBfb3B0aW9ucykgPT4ge1xyXG4gIH0sXHJcbiAgZGlyeG1sOiAoLi4uX2RhdGEpID0+IHtcclxuICB9LFxyXG4gIC8vIENvdW50aW5nXHJcbiAgY291bnQ6IChfbGFiZWwgPSBcImRlZmF1bHRcIikgPT4ge1xyXG4gIH0sXHJcbiAgY291bnRSZXNldDogKF9sYWJlbCA9IFwiZGVmYXVsdFwiKSA9PiB7XHJcbiAgfSxcclxuICAvLyBHcm91cGluZ1xyXG4gIGdyb3VwOiAoLi4uX2RhdGEpID0+IHtcclxuICB9LFxyXG4gIGdyb3VwQ29sbGFwc2VkOiAoLi4uX2RhdGEpID0+IHtcclxuICB9LFxyXG4gIGdyb3VwRW5kOiAoKSA9PiB7XHJcbiAgfSxcclxuICAvLyBUaW1pbmdcclxuICB0aW1lOiAobGFiZWwgPSBcImRlZmF1bHRcIikgPT4ge1xyXG4gICAgaWYgKHRpbWVyTWFwLmhhcyhsYWJlbCkpIHtcclxuICAgICAgc3lzLmNvbnNvbGVfbG9nKGNvbnNvbGVfbGV2ZWxfd2FybiwgYFRpbWVyICcke2xhYmVsfScgYWxyZWFkeSBleGlzdHMuYCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHRpbWVyTWFwLnNldChsYWJlbCwgc3lzLmNvbnNvbGVfdGltZXJfc3RhcnQobGFiZWwpKTtcclxuICB9LFxyXG4gIHRpbWVMb2c6IChsYWJlbCA9IFwiZGVmYXVsdFwiLCAuLi5kYXRhKSA9PiB7XHJcbiAgICBzeXMuY29uc29sZV9sb2coY29uc29sZV9sZXZlbF9pbmZvLCBmbXRMb2cobGFiZWwsIC4uLmRhdGEpKTtcclxuICB9LFxyXG4gIHRpbWVFbmQ6IChsYWJlbCA9IFwiZGVmYXVsdFwiKSA9PiB7XHJcbiAgICBjb25zdCBzcGFuSWQgPSB0aW1lck1hcC5nZXQobGFiZWwpO1xyXG4gICAgaWYgKHNwYW5JZCA9PT0gdm9pZCAwKSB7XHJcbiAgICAgIHN5cy5jb25zb2xlX2xvZyhjb25zb2xlX2xldmVsX3dhcm4sIGBUaW1lciAnJHtsYWJlbH0nIGRvZXMgbm90IGV4aXN0LmApO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBzeXMuY29uc29sZV90aW1lcl9lbmQoc3BhbklkKTtcclxuICAgIHRpbWVyTWFwLmRlbGV0ZShsYWJlbCk7XHJcbiAgfSxcclxuICAvLyBBZGRpdGlvbmFsIGNvbnNvbGUgbWV0aG9kcyB0byBzYXRpc2Z5IHRoZSBDb25zb2xlIGludGVyZmFjZVxyXG4gIHRpbWVTdGFtcDogKCkgPT4ge1xyXG4gIH0sXHJcbiAgcHJvZmlsZTogKCkgPT4ge1xyXG4gIH0sXHJcbiAgcHJvZmlsZUVuZDogKCkgPT4ge1xyXG4gIH1cclxufTtcclxuXHJcbi8vIHNyYy9zZXJ2ZXIvcG9seWZpbGxzLnRzXHJcbmdsb2JhbFRoaXMuY29uc29sZSA9IGNvbnNvbGUyO1xyXG4vKiEgQnVuZGxlZCBsaWNlbnNlIGluZm9ybWF0aW9uOlxyXG5cclxuc3RhdHVzZXMvaW5kZXguanM6XHJcbiAgKCohXHJcbiAgICogc3RhdHVzZXNcclxuICAgKiBDb3B5cmlnaHQoYykgMjAxNCBKb25hdGhhbiBPbmdcclxuICAgKiBDb3B5cmlnaHQoYykgMjAxNiBEb3VnbGFzIENocmlzdG9waGVyIFdpbHNvblxyXG4gICAqIE1JVCBMaWNlbnNlZFxyXG4gICAqKVxyXG4qL1xyXG5cclxuZXhwb3J0IHsgQXJyYXlCdWlsZGVyLCBBcnJheUNvbHVtbkJ1aWxkZXIsIEJvb2xCdWlsZGVyLCBCb29sQ29sdW1uQnVpbGRlciwgQm9vbGVhbkV4cHIsIEJ5dGVBcnJheUJ1aWxkZXIsIEJ5dGVBcnJheUNvbHVtbkJ1aWxkZXIsIENhc2VDb252ZXJzaW9uUG9saWN5LCBDb2x1bW5CdWlsZGVyLCBDb2x1bW5FeHByZXNzaW9uLCBDb25uZWN0aW9uSWRCdWlsZGVyLCBDb25uZWN0aW9uSWRDb2x1bW5CdWlsZGVyLCBGMzJCdWlsZGVyLCBGMzJDb2x1bW5CdWlsZGVyLCBGNjRCdWlsZGVyLCBGNjRDb2x1bW5CdWlsZGVyLCBJMTI4QnVpbGRlciwgSTEyOENvbHVtbkJ1aWxkZXIsIEkxNkJ1aWxkZXIsIEkxNkNvbHVtbkJ1aWxkZXIsIEkyNTZCdWlsZGVyLCBJMjU2Q29sdW1uQnVpbGRlciwgSTMyQnVpbGRlciwgSTMyQ29sdW1uQnVpbGRlciwgSTY0QnVpbGRlciwgSTY0Q29sdW1uQnVpbGRlciwgSThCdWlsZGVyLCBJOENvbHVtbkJ1aWxkZXIsIElkZW50aXR5QnVpbGRlciwgSWRlbnRpdHlDb2x1bW5CdWlsZGVyLCBPcHRpb25CdWlsZGVyLCBPcHRpb25Db2x1bW5CdWlsZGVyLCBQcm9kdWN0QnVpbGRlciwgUHJvZHVjdENvbHVtbkJ1aWxkZXIsIFJlZkJ1aWxkZXIsIFJlc3VsdEJ1aWxkZXIsIFJlc3VsdENvbHVtbkJ1aWxkZXIsIFJvd0J1aWxkZXIsIFNjaGVkdWxlQXRCdWlsZGVyLCBTY2hlZHVsZUF0Q29sdW1uQnVpbGRlciwgU2VuZGVyRXJyb3IsIFNpbXBsZVN1bUJ1aWxkZXIsIFNpbXBsZVN1bUNvbHVtbkJ1aWxkZXIsIFNwYWNldGltZUhvc3RFcnJvciwgU3RyaW5nQnVpbGRlciwgU3RyaW5nQ29sdW1uQnVpbGRlciwgU3VtQnVpbGRlciwgU3VtQ29sdW1uQnVpbGRlciwgVGltZUR1cmF0aW9uQnVpbGRlciwgVGltZUR1cmF0aW9uQ29sdW1uQnVpbGRlciwgVGltZXN0YW1wQnVpbGRlciwgVGltZXN0YW1wQ29sdW1uQnVpbGRlciwgVHlwZUJ1aWxkZXIsIFUxMjhCdWlsZGVyLCBVMTI4Q29sdW1uQnVpbGRlciwgVTE2QnVpbGRlciwgVTE2Q29sdW1uQnVpbGRlciwgVTI1NkJ1aWxkZXIsIFUyNTZDb2x1bW5CdWlsZGVyLCBVMzJCdWlsZGVyLCBVMzJDb2x1bW5CdWlsZGVyLCBVNjRCdWlsZGVyLCBVNjRDb2x1bW5CdWlsZGVyLCBVOEJ1aWxkZXIsIFU4Q29sdW1uQnVpbGRlciwgVXVpZEJ1aWxkZXIsIFV1aWRDb2x1bW5CdWlsZGVyLCBhbmQsIGNyZWF0ZVRhYmxlUmVmRnJvbURlZiwgZXJyb3JzLCBldmFsdWF0ZUJvb2xlYW5FeHByLCBnZXRRdWVyeUFjY2Vzc29yTmFtZSwgZ2V0UXVlcnlUYWJsZU5hbWUsIGdldFF1ZXJ5V2hlcmVDbGF1c2UsIGlzUm93VHlwZWRRdWVyeSwgaXNUeXBlZFF1ZXJ5LCBsaXRlcmFsLCBtYWtlUXVlcnlCdWlsZGVyLCBub3QsIG9yLCBzY2hlbWEsIHQsIHRhYmxlLCB0b0NhbWVsQ2FzZSwgdG9Db21wYXJhYmxlVmFsdWUsIHRvU3FsIH07XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4Lm1qcy5tYXBcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXgubWpzLm1hcCIsImltcG9ydCB7IHQgfSBmcm9tICdzcGFjZXRpbWVkYi9zZXJ2ZXInO1xyXG5cclxuZXhwb3J0IGNvbnN0IFJvbGUgPSB0LmVudW0oJ1JvbGUnLCB7XHJcbiAgICBBZG1pbjogdC51bml0KCksXHJcbiAgICBUb3VybmFtZW50SG9zdDogdC51bml0KCksXHJcbiAgICBVc2VyOiB0LnVuaXQoKSxcclxufSk7XHJcblxyXG5leHBvcnQgY29uc3QgUGF0aCA9IHQuZW51bSgnUGF0aCcsIHtcclxuICAgIEFidW5kYW5jZTogdC51bml0KCksXHJcbiAgICBEZXN0cnVjdGlvbjogdC51bml0KCksXHJcbiAgICBFcnVkaXRpb246IHQudW5pdCgpLFxyXG4gICAgSGFybW9ueTogdC51bml0KCksXHJcbiAgICBIdW50OiB0LnVuaXQoKSxcclxuICAgIE5paGlsaXR5OiB0LnVuaXQoKSxcclxuICAgIFByZXNlcnZhdGlvbjogdC51bml0KCksXHJcbiAgICBSZW1lbWJyYW5jZTogdC51bml0KCksXHJcbiAgICBFbGF0aW9uOiB0LnVuaXQoKSxcclxufSk7XHJcblxyXG5leHBvcnQgY29uc3QgRWxlbWVudCA9IHQuZW51bSgnRWxlbWVudCcsIHtcclxuICAgIEZpcmU6IHQudW5pdCgpLFxyXG4gICAgSWNlOiB0LnVuaXQoKSxcclxuICAgIEltYWdpbmFyeTogdC51bml0KCksXHJcbiAgICBMaWdodG5pbmc6IHQudW5pdCgpLFxyXG4gICAgUGh5c2ljYWw6IHQudW5pdCgpLFxyXG4gICAgUXVhbnR1bTogdC51bml0KCksXHJcbiAgICBXaW5kOiB0LnVuaXQoKSxcclxufSk7XHJcblxyXG5leHBvcnQgY29uc3QgQ2hhclJvbGUgPSB0LmVudW0oJ0NoYXJSb2xlJywge1xyXG4gICAgRHBzOiB0LnVuaXQoKSxcclxuICAgIFN1c3RhaW46IHQudW5pdCgpLFxyXG4gICAgU3VwcG9ydDogdC51bml0KCksXHJcbn0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IEdhbWVNb2RlID0gdC5lbnVtKCdHYW1lTW9kZScsIHtcclxuICAgIE1lbW9yeU9mQ2hhb3M6IHQudW5pdCgpLFxyXG4gICAgQXBvY2FseXB0aWNTaGFkb3c6IHQudW5pdCgpLFxyXG4gICAgQW5vbWFseUFyYml0cmF0aW9uOiB0LnVuaXQoKSxcclxufSk7XHJcblxyXG5leHBvcnQgY29uc3QgRHJhZnRNb2RlID0gdC5lbnVtKCdEcmFmdE1vZGUnLCB7XHJcbiAgICBDbGFzc2ljOiB0LnVuaXQoKSxcclxuICAgIEF1Y3Rpb246IHQudW5pdCgpLFxyXG59KTtcclxuXHJcbmV4cG9ydCBjb25zdCBCYW5Nb2RlID0gdC5lbnVtKCdCYW5Nb2RlJywge1xyXG4gICAgTm9uZTogdC51bml0KCksXHJcbiAgICBUd286IHQudW5pdCgpLFxyXG4gICAgRm91cjogdC51bml0KCksXHJcbiAgICBTaXg6IHQudW5pdCgpLFxyXG59KTtcclxuXHJcbmV4cG9ydCBjb25zdCBMb2JieVN0YWdlID0gdC5lbnVtKCdMb2JieVN0YWdlJywge1xyXG4gICAgV2FpdGluZzogdC51bml0KCksXHJcbiAgICBEcmFmdGluZzogdC51bml0KCksXHJcbiAgICBGaW5pc2hlZDogdC51bml0KCksXHJcbn0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IFBhcnRpY2lwYXRpb25Sb2xlID0gdC5lbnVtKCdQYXJ0aWNpcGF0aW9uUm9sZScsIHtcclxuICAgIFBsYXllcjogdC51bml0KCksXHJcbiAgICBTcGVjdGF0b3I6IHQudW5pdCgpLFxyXG59KTtcclxuXHJcbmV4cG9ydCBjb25zdCBUZWFtTGFiZWwgPSB0LmVudW0oJ1RlYW1MYWJlbCcsIHtcclxuICAgIFNwZWN0YXRvcjogdC51bml0KCksXHJcbiAgICBCbHVlOiB0LnVuaXQoKSxcclxuICAgIFJlZDogdC51bml0KCksXHJcbn0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IE1hdGNoUmVzdWx0ID0gdC5lbnVtKCdNYXRjaFJlc3VsdCcsIHtcclxuICAgIEJsdWVXaW5zOiB0LnVuaXQoKSxcclxuICAgIFJlZFdpbnM6IHQudW5pdCgpLFxyXG4gICAgRHJhdzogdC51bml0KCksXHJcbiAgICBBYm9ydGVkOiB0LnVuaXQoKSxcclxufSk7XHJcblxyXG5leHBvcnQgY29uc3QgQWN0aW9uVHlwZSA9IHQuZW51bSgnQWN0aW9uVHlwZScsIHtcclxuICAgIFBpY2s6IHQudW5pdCgpLFxyXG4gICAgQmFuOiB0LnVuaXQoKSxcclxuICAgIE5vbWluYXRlOiB0LnVuaXQoKSxcclxuICAgIEJpZDogdC51bml0KCksXHJcbiAgICBBdWN0aW9uU29sZDogdC51bml0KCksXHJcbiAgICBQYXVzZTogdC51bml0KCksXHJcbiAgICBVbmRvOiB0LnVuaXQoKSxcclxufSk7IiwiaW1wb3J0IHsgdGFibGUsIHQgfSBmcm9tICdzcGFjZXRpbWVkYi9zZXJ2ZXInO1xyXG5pbXBvcnQgeyBSb2xlIH0gZnJvbSAnLi4vdHlwZXMvZW51bXMnO1xyXG5cclxuZXhwb3J0IGNvbnN0IFVzZXIgPSB0YWJsZSh7XHJcbiAgICBuYW1lOiAndXNlcicsXHJcbiAgICBwdWJsaWM6IHRydWUsXHJcbiAgICBpbmRleGVzOiBbXHJcbiAgICAgICAgeyBuYW1lOiAndXNlcl9kaXNjb3JkX2lkJywgYWNjZXNzb3I6ICd1c2VyX2Rpc2NvcmRfaWQnLCBhbGdvcml0aG06ICdidHJlZScsIGNvbHVtbnM6IFsnZGlzY29yZElkJ10gfSxcclxuICAgIF1cclxufSwge1xyXG4gICAgaWQ6IHQudTMyKCkucHJpbWFyeUtleSgpLmF1dG9JbmMoKSxcclxuICAgIHVzZXJuYW1lOiB0LnN0cmluZygpLnVuaXF1ZSgpLFxyXG4gICAgZGlzcGxheU5hbWU6IHQuc3RyaW5nKCksXHJcbiAgICBpc0d1ZXN0OiB0LmJvb2woKSxcclxuICAgIGxhc3RMb2dpbkF0OiB0LnRpbWVzdGFtcCgpLFxyXG4gICAgcm9sZTogUm9sZSxcclxuICAgIGRpc2NvcmRJZDogdC5zdHJpbmcoKS5vcHRpb25hbCgpLFxyXG4gICAgYXZhdGFyQ2hhcmFjdGVyTmFtZTogdC5zdHJpbmcoKSwgLy8gRksgcmVmZXJlbmNlIHRvIEhzckNoYXJhY3RlciBuYW1lXHJcbn0pO1xyXG4iLCJpbXBvcnQgeyB0YWJsZSwgdCB9IGZyb20gJ3NwYWNldGltZWRiL3NlcnZlcic7XHJcblxyXG4vKipcclxuICogTWFwcyBTcGFjZXRpbWVEQiBpZGVudGl0aWVzIChwZXItZGV2aWNlKSB0byBwZXJzaXN0ZW50IFVzZXIgSURzIChtYW55LXRvLW9uZSkuXHJcbiAqIEVhY2ggZGV2aWNlL2Jyb3dzZXIgZ2VuZXJhdGVzIGEgdW5pcXVlIGlkZW50aXR5OyB0aGlzIHRhYmxlIGxpbmtzIHRoZW0gYWxsXHJcbiAqIGJhY2sgdG8gYSBzaW5nbGUgVXNlciByZWNvcmQuXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgVXNlcklkZW50aXR5ID0gdGFibGUoe1xyXG4gICAgbmFtZTogJ3VzZXJfaWRlbnRpdHknLFxyXG4gICAgcHVibGljOiB0cnVlLFxyXG4gICAgaW5kZXhlczogW1xyXG4gICAgICAgIHsgbmFtZTogJ3VzZXJfaWRlbnRpdHlfdXNlcl9pZCcsIGFjY2Vzc29yOiAndXNlcl9pZGVudGl0eV91c2VyX2lkJywgYWxnb3JpdGhtOiAnYnRyZWUnLCBjb2x1bW5zOiBbJ3VzZXJJZCddIH0sXHJcbiAgICBdXHJcbn0sIHtcclxuICAgIGlkZW50aXR5OiB0LmlkZW50aXR5KCkucHJpbWFyeUtleSgpLFxyXG4gICAgdXNlcklkOiB0LnUzMigpLFxyXG4gICAgbGFzdFNlZW5BdDogdC50aW1lc3RhbXAoKSwgLy8gRm9yIGZ1dHVyZSBjbGVhbnVwIG9mIHN0YWxlIGlkZW50aXR5IG1hcHBpbmdzXHJcbn0pO1xyXG4iLCJpbXBvcnQgeyB0YWJsZSwgdCB9IGZyb20gJ3NwYWNldGltZWRiL3NlcnZlcic7XHJcblxyXG4vKipcclxuICogU3RvcmVzIHRoZSB0cnVzdGVkIHNlcnZlciBpZGVudGl0eSAoTmV4dC5qcyBBUEkgc2VydmVyKS5cclxuICogT25seSBvbmUgcm93IHNob3VsZCBldmVyIGV4aXN0LiBUaGUgc2VydmVyIGlkZW50aXR5IGlzIHRoZSBvbmx5IGNhbGxlclxyXG4gKiBhbGxvd2VkIHRvIGludm9rZSBzZXJ2ZXJfbGlua19kaXNjb3JkICh3aGljaCBsaW5rcyBEaXNjb3JkIGFjY291bnRzIHRvIHVzZXJzKS5cclxuICpcclxuICogQm9vdHN0cmFwOiBjYWxsIHJlZ2lzdGVyX3NlcnZlciB3aGVuIHRoZSB0YWJsZSBpcyBlbXB0eS5cclxuICovXHJcbmV4cG9ydCBjb25zdCBTZXJ2ZXJJZGVudGl0eSA9IHRhYmxlKHtcclxuICAgIG5hbWU6ICdzZXJ2ZXJfaWRlbnRpdHknLFxyXG4gICAgcHVibGljOiBmYWxzZSwgLy8gTm8gY2xpZW50IG5lZWRzIHRvIHJlYWQgdGhpc1xyXG59LCB7XHJcbiAgICBpZGVudGl0eTogdC5pZGVudGl0eSgpLnByaW1hcnlLZXkoKSxcclxuICAgIHJlZ2lzdGVyZWRBdDogdC50aW1lc3RhbXAoKSxcclxufSk7XHJcbiIsImltcG9ydCB7IHRhYmxlLCB0IH0gZnJvbSAnc3BhY2V0aW1lZGIvc2VydmVyJztcclxuaW1wb3J0IHsgUGF0aCwgRWxlbWVudCwgQ2hhclJvbGUgfSBmcm9tICcuLi90eXBlcy9lbnVtcyc7XHJcbi8vIFBlb3BsZSBmcm9tIHRoZSBmb3J1bXMgc2F5IHdlIGRvbnQgbmVlZCBcIm5hbWVcIjogWFhYWFhYWFhYIG9uIGluZGV4ZXMgYW55bW9yZVxyXG5leHBvcnQgY29uc3QgSHNyQ2hhcmFjdGVyID0gdGFibGUoe1xyXG4gICAgbmFtZTogJ2hzcl9jaGFyYWN0ZXInLFxyXG4gICAgcHVibGljOiB0cnVlLFxyXG4gICAgaW5kZXhlczogW1xyXG4gICAgICAgIHsgbmFtZTogJ2NoYXJhY3Rlcl9ieV9wYXRoJywgYWNjZXNzb3I6ICdjaGFyYWN0ZXJfYnlfcGF0aCcsIGFsZ29yaXRobTogJ2J0cmVlJywgY29sdW1uczogWydwYXRoJ10gfSxcclxuICAgICAgICB7IG5hbWU6ICdjaGFyYWN0ZXJfYnlfZWxlbWVudCcsIGFjY2Vzc29yOiAnY2hhcmFjdGVyX2J5X2VsZW1lbnQnLCBhbGdvcml0aG06ICdidHJlZScsIGNvbHVtbnM6IFsnZWxlbWVudCddIH0sXHJcbiAgICAgICAgeyBuYW1lOiAnY2hhcmFjdGVyX2J5X3JvbGUnLCBhY2Nlc3NvcjogJ2NoYXJhY3Rlcl9ieV9yb2xlJywgYWxnb3JpdGhtOiAnYnRyZWUnLCBjb2x1bW5zOiBbJ3JvbGUnXSB9LFxyXG4gICAgXVxyXG59LCB7XHJcbiAgICBuYW1lOiB0LnN0cmluZygpLnByaW1hcnlLZXkoKSxcclxuICAgIGRpc3BsYXlOYW1lOiB0LnN0cmluZygpLFxyXG4gICAgYWxpYXNlczogdC5hcnJheSh0LnN0cmluZygpKSxcclxuICAgIHJhcml0eTogdC51OCgpLFxyXG4gICAgcGF0aDogUGF0aCxcclxuICAgIGVsZW1lbnQ6IEVsZW1lbnQsXHJcbiAgICByb2xlOiBDaGFyUm9sZSxcclxuICAgIGltYWdlVXJsOiB0LnN0cmluZygpLFxyXG59KTsiLCJpbXBvcnQgeyB0YWJsZSwgdCB9IGZyb20gJ3NwYWNldGltZWRiL3NlcnZlcic7XHJcbmltcG9ydCB7IFBhdGggfSBmcm9tICcuLi90eXBlcy9lbnVtcyc7XHJcblxyXG5leHBvcnQgY29uc3QgSHNyTGlnaHRjb25lID0gdGFibGUoe1xyXG4gICAgbmFtZTogJ2hzcl9saWdodGNvbmUnLFxyXG4gICAgcHVibGljOiB0cnVlLFxyXG4gICAgaW5kZXhlczogW1xyXG4gICAgICAgIHsgbmFtZTogJ2xpZ2h0Y29uZV9ieV9wYXRoJywgYWNjZXNzb3I6ICdsaWdodGNvbmVfYnlfcGF0aCcsIGFsZ29yaXRobTogJ2J0cmVlJywgY29sdW1uczogWydwYXRoJ10gfSxcclxuICAgIF1cclxufSwge1xyXG4gICAgbmFtZTogdC5zdHJpbmcoKS5wcmltYXJ5S2V5KCksXHJcbiAgICBkaXNwbGF5TmFtZTogdC5zdHJpbmcoKSxcclxuICAgIGFsaWFzZXM6IHQuYXJyYXkodC5zdHJpbmcoKSksXHJcbiAgICBwYXRoOiBQYXRoLFxyXG4gICAgcmFyaXR5OiB0LnU4KCksXHJcbiAgICBpbWFnZVVybDogdC5zdHJpbmcoKSxcclxuXHJcbiAgICAvLyBDU1MgcG9zaXRpb25pbmcgY29ycmVjdGlvbnMgZm9yIHRoZSBVSVxyXG4gICAgcG9zWDogdC5pMzIoKSxcclxuICAgIHBvc1k6IHQuaTMyKCksXHJcbiAgICB3aWR0aDogdC5pMzIoKSxcclxufSk7IiwiaW1wb3J0IHsgdCB9IGZyb20gJ3NwYWNldGltZWRiL3NlcnZlcic7XHJcbmltcG9ydCB7XHJcbiAgICBEcmFmdE1vZGUsXHJcbiAgICBCYW5Nb2RlLFxyXG4gICAgQWN0aW9uVHlwZSxcclxuICAgIFRlYW1MYWJlbFxyXG59IGZyb20gJy4vZW51bXMnO1xyXG5cclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0gU1RSVUNUUyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuZXhwb3J0IGNvbnN0IExvYmJ5Q29uZmlnID0gdC5vYmplY3QoJ0xvYmJ5Q29uZmlnJywge1xyXG4gICAgdGVhbV9zaXplOiB0LnU4KCksICAgICAgICAgICAgICAgLy8gMSwgMiwgb3IgM1xyXG4gICAgZHJhZnRfbW9kZTogRHJhZnRNb2RlLFxyXG4gICAgYmFuX21vZGU6IEJhbk1vZGUsXHJcbiAgICBzdGFuZGFyZF90dXJuX3NlY29uZHM6IHQudTMyKCksXHJcbiAgICByZXNlcnZlX2Jhbmtfc2Vjb25kczogdC51MzIoKSxcclxuICAgIGF1Y3Rpb25fYnVkZ2V0OiB0LmYzMigpLm9wdGlvbmFsKCksXHJcblxyXG4gICAgLy8gQmFsYW5jZSBNYXRoXHJcbiAgICByb3N0ZXJfZGlmZl9hZHZhbnRhZ2U6IHQuZjMyKCksXHJcbiAgICByb3N0ZXJfdGhyZXNob2xkOiB0LmYzMigpLFxyXG4gICAgdW5kZXJfdGhyZXNob2xkX2FkdmFudGFnZTogdC5mMzIoKSxcclxuICAgIGFib3ZlX3RocmVzaG9sZF9wZW5hbHR5OiB0LmYzMigpLFxyXG4gICAgZGVhdGhfcGVuYWx0eTogdC5mMzIoKSxcclxufSk7XHJcblxyXG5leHBvcnQgY29uc3QgUGxheWVyU25hcHNob3QgPSB0Lm9iamVjdCgnUGxheWVyU25hcHNob3QnLCB7XHJcbiAgICB1c2VySWQ6IHQudTMyKCksXHJcbiAgICBkaXNwbGF5X25hbWU6IHQuc3RyaW5nKCksXHJcbiAgICBhdmF0YXJfdXJsOiB0LnN0cmluZygpLFxyXG59KTtcclxuXHJcbmV4cG9ydCBjb25zdCBUaW1lclN0YXRlID0gdC5vYmplY3QoJ1RpbWVyU3RhdGUnLCB7XHJcbiAgICB0dXJuX3N0YXJ0X2F0OiB0LnRpbWVzdGFtcCgpLFxyXG4gICAgdGVhbV9ibHVlX3Jlc2VydmVfbXM6IHQudTMyKCksXHJcbiAgICB0ZWFtX3JlZF9yZXNlcnZlX21zOiB0LnUzMigpLFxyXG4gICAgaXNfcGF1c2VkOiB0LmJvb2woKSxcclxuICAgIGFjY3VtdWxhdGVkX3BhdXNlX21zOiB0LnUzMigpLFxyXG59KTtcclxuXHJcbmV4cG9ydCBjb25zdCBEcmFmdFN0ZXAgPSB0Lm9iamVjdCgnRHJhZnRTdGVwJywge1xyXG4gICAgYWN0aW9uX3JlcXVpcmVkOiBBY3Rpb25UeXBlLFxyXG4gICAgdGVhbV90dXJuOiBUZWFtTGFiZWwsXHJcbn0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IEVpZG9sb25Db3N0ID0gdC5vYmplY3QoJ0VpZG9sb25Db3N0Jywge1xyXG4gICAgZTA6IHQuZjMyKCksXHJcbiAgICBlMTogdC5mMzIoKSxcclxuICAgIGUyOiB0LmYzMigpLFxyXG4gICAgZTM6IHQuZjMyKCksXHJcbiAgICBlNDogdC5mMzIoKSxcclxuICAgIGU1OiB0LmYzMigpLFxyXG4gICAgZTY6IHQuZjMyKCksXHJcbn0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IFN1cGVyaW1wb3NpdGlvbkNvc3QgPSB0Lm9iamVjdCgnU3VwZXJpbXBvc2l0aW9uQ29zdCcsIHtcclxuICAgIHMxOiB0LmYzMigpLFxyXG4gICAgczI6IHQuZjMyKCksXHJcbiAgICBzMzogdC5mMzIoKSxcclxuICAgIHM0OiB0LmYzMigpLFxyXG4gICAgczU6IHQuZjMyKCksXHJcbn0pO1xyXG5cclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0gQUNUSU9OIFBBWUxPQURTIC0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vIEluc3RlYWQgb2YgYSByYXcgSlNPTiBzdHJpbmcsIHdlIGRlZmluZSBhIFN1bSBUeXBlIChUYWdnZWQgVW5pb24pLlxyXG4vLyBUaGlzIHJlcGxhY2VzIHRoZSBcIkpTT05cIiBjb2x1bW4gd2l0aCBhIHR5cGUtc2FmZSBzdHJ1Y3R1cmUuXHJcblxyXG5leHBvcnQgY29uc3QgUGlja1BheWxvYWQgPSB0Lm9iamVjdCgnUGlja1BheWxvYWQnLCB7XHJcbiAgICBjaGFyYWN0ZXJfbmFtZTogdC5zdHJpbmcoKSxcclxuICAgIGVpZG9sb246IHQudTgoKSxcclxuICAgIGNvc3RfcGFpZDogdC5mMzIoKSxcclxufSk7XHJcblxyXG5leHBvcnQgY29uc3QgQmFuUGF5bG9hZCA9IHQub2JqZWN0KCdCYW5QYXlsb2FkJywge1xyXG4gICAgY2hhcmFjdGVyX25hbWU6IHQuc3RyaW5nKCksXHJcbn0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IEJpZFBheWxvYWQgPSB0Lm9iamVjdCgnQmlkUGF5bG9hZCcsIHtcclxuICAgIGFtb3VudDogdC5mMzIoKSxcclxuICAgIHRhcmdldF9jaGFyYWN0ZXI6IHQuc3RyaW5nKCksXHJcbn0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IEF1Y3Rpb25Tb2xkUGF5bG9hZCA9IHQub2JqZWN0KCdBdWN0aW9uU29sZFBheWxvYWQnLCB7XHJcbiAgICBjaGFyYWN0ZXJfbmFtZTogdC5zdHJpbmcoKSxcclxuICAgIHdpbm5pbmdfYW1vdW50OiB0LmYzMigpLFxyXG4gICAgd2lubmluZ190ZWFtOiBUZWFtTGFiZWwsICAgIC8vIFdobyBhY3R1YWxseSBnb3QgaXRcclxuICAgIGVpZG9sb246IHQudTgoKSxcclxufSk7XHJcblxyXG5leHBvcnQgY29uc3QgTm9taW5hdGVQYXlsb2FkID0gdC5vYmplY3QoJ05vbWluYXRlUGF5bG9hZCcsIHtcclxuICAgIGNoYXJhY3Rlcl9uYW1lOiB0LnN0cmluZygpLFxyXG4gICAgZWlkb2xvbjogdC51OCgpLFxyXG59KTtcclxuXHJcbmV4cG9ydCBjb25zdCBVbmRvUGF5bG9hZCA9IHQub2JqZWN0KCdVbmRvUGF5bG9hZCcsIHtcclxuICAgIG9yaWdpbmFsX3NlcXVlbmNlX2lkOiB0LnUzMigpLCAvLyBUaGUgSUQgb2YgdGhlIHN0ZXAgd2UgYXJlIHJldmVydGluZ1xyXG59KTtcclxuXHJcbmV4cG9ydCBjb25zdCBQYXVzZVBheWxvYWQgPSB0Lm9iamVjdCgnUGF1c2VQYXlsb2FkJywge1xyXG4gICAgdGltZV9yZW1haW5pbmdfbXM6IHQudTMyKCksICAgICAgICAvLyBTbmFwc2hvdCBvZiB0aGUgY2xvY2sgd2hlbiBwYXVzZWRcclxuICAgIGlzX2F1dG9fcGF1c2U6IHQuYm9vbCgpLCAgICAgICAgICAgLy8gVHJ1ZSBpZiBzeXN0ZW0gcGF1c2VkIChkaXNjb25uZWN0KSwgRmFsc2UgaWYgbWFudWFsXHJcbn0pO1xyXG5cclxuLy8gVGhlIFwiUG9seW1vcnBoaWNcIiBFbnVtIGNvbnRhaW5pbmcgdGhlIHNwZWNpZmljIHBheWxvYWRzXHJcbmV4cG9ydCBjb25zdCBTdGVwUGF5bG9hZCA9IHQuZW51bSgnU3RlcFBheWxvYWQnLCB7XHJcbiAgICBQaWNrOiBQaWNrUGF5bG9hZCxcclxuICAgIEJhbjogQmFuUGF5bG9hZCxcclxuICAgIEJpZDogQmlkUGF5bG9hZCxcclxuICAgIEF1Y3Rpb25Tb2xkOiBBdWN0aW9uU29sZFBheWxvYWQsXHJcbiAgICBOb21pbmF0ZTogTm9taW5hdGVQYXlsb2FkLFxyXG4gICAgVW5kbzogVW5kb1BheWxvYWQsXHJcbiAgICBQYXVzZTogUGF1c2VQYXlsb2FkLFxyXG59KTsiLCJpbXBvcnQgeyB0YWJsZSwgdCB9IGZyb20gJ3NwYWNldGltZWRiL3NlcnZlcic7XHJcbmltcG9ydCB7IEdhbWVNb2RlIH0gZnJvbSAnLi4vdHlwZXMvZW51bXMnO1xyXG5pbXBvcnQgeyBFaWRvbG9uQ29zdCB9IGZyb20gJy4uL3R5cGVzL3N0cnVjdHMnO1xyXG5cclxuZXhwb3J0IGNvbnN0IEhzckNoYXJhY3RlckNvc3QgPSB0YWJsZSh7XHJcbiAgICBuYW1lOiAnaHNyX2NoYXJhY3Rlcl9jb3N0JyxcclxuICAgIHB1YmxpYzogdHJ1ZSxcclxuICAgIHByaW1hcnlLZXk6IFsnY2hhcmFjdGVyTmFtZScsICdnYW1lTW9kZSddLFxyXG59LCB7XHJcbiAgICBjaGFyYWN0ZXJOYW1lOiB0LnN0cmluZygpLFxyXG4gICAgZ2FtZU1vZGU6IEdhbWVNb2RlLFxyXG4gICAgY2xhc3NpY0Nvc3RzOiBFaWRvbG9uQ29zdCxcclxuICAgIGF1Y3Rpb25CYXNlQmlkOiBFaWRvbG9uQ29zdCxcclxufSk7IiwiaW1wb3J0IHsgdGFibGUsIHQgfSBmcm9tICdzcGFjZXRpbWVkYi9zZXJ2ZXInO1xyXG5pbXBvcnQgeyBTdXBlcmltcG9zaXRpb25Db3N0IH0gZnJvbSAnLi4vdHlwZXMvc3RydWN0cyc7XHJcblxyXG5leHBvcnQgY29uc3QgSHNyTGlnaHRjb25lQ29zdCA9IHRhYmxlKHtcclxuICAgIG5hbWU6ICdoc3JfbGlnaHRjb25lX2Nvc3QnLFxyXG4gICAgcHVibGljOiB0cnVlLFxyXG59LCB7XHJcbiAgICBsaWdodGNvbmVOYW1lOiB0LnN0cmluZygpLnByaW1hcnlLZXkoKSxcclxuICAgIGNsYXNzaWNDb3N0czogU3VwZXJpbXBvc2l0aW9uQ29zdCxcclxuICAgIGF1Y3Rpb25CYXNlQmlkOiBTdXBlcmltcG9zaXRpb25Db3N0LFxyXG59KTsiLCJpbXBvcnQgeyB0YWJsZSwgdCB9IGZyb20gJ3NwYWNldGltZWRiL3NlcnZlcic7XHJcbmltcG9ydCB7IEdhbWVNb2RlIH0gZnJvbSAnLi4vdHlwZXMvZW51bXMnO1xyXG5cclxuZXhwb3J0IGNvbnN0IEhzclN5bmVyZ3lDb3N0ID0gdGFibGUoe1xyXG4gICAgbmFtZTogJ2hzcl9zeW5lcmd5X2Nvc3QnLFxyXG4gICAgcHVibGljOiB0cnVlLFxyXG4gICAgaW5kZXhlczogW1xyXG4gICAgICAgIHsgbmFtZTogJ3N5bmVyZ3lfc291cmNlX21vZGUnLCBhY2Nlc3NvcjogJ3N5bmVyZ3lfc291cmNlX21vZGUnLCBhbGdvcml0aG06ICdidHJlZScsIGNvbHVtbnM6IFsnc291cmNlTmFtZScsICdnYW1lTW9kZSddIH0sXHJcbiAgICAgICAgeyBuYW1lOiAnc3luZXJneV90YXJnZXQnLCBhY2Nlc3NvcjogJ3N5bmVyZ3lfdGFyZ2V0JywgYWxnb3JpdGhtOiAnYnRyZWUnLCBjb2x1bW5zOiBbJ3RhcmdldE5hbWUnXSB9LFxyXG4gICAgXVxyXG59LCB7XHJcbiAgICBpZDogdC51MzIoKS5wcmltYXJ5S2V5KCkuYXV0b0luYygpLFxyXG4gICAgc291cmNlTmFtZTogdC5zdHJpbmcoKSxcclxuICAgIHRhcmdldE5hbWU6IHQuc3RyaW5nKCksXHJcbiAgICBnYW1lTW9kZTogR2FtZU1vZGUsXHJcbiAgICBjb3N0TW9kaWZpZXI6IHQuZjMyKCksXHJcbn0pOyIsImltcG9ydCB7IHRhYmxlLCB0IH0gZnJvbSAnc3BhY2V0aW1lZGIvc2VydmVyJztcclxuaW1wb3J0IHsgTG9iYnlTdGFnZSB9IGZyb20gJy4uL3R5cGVzL2VudW1zJztcclxuaW1wb3J0IHsgTG9iYnlDb25maWcgfSBmcm9tICcuLi90eXBlcy9zdHJ1Y3RzJztcclxuXHJcbmV4cG9ydCBjb25zdCBMb2JieSA9IHRhYmxlKHtcclxuICAgIG5hbWU6ICdsb2JieScsXHJcbiAgICBwdWJsaWM6IHRydWUsXHJcbiAgICBpbmRleGVzOiBbXHJcbiAgICAgICAgeyBuYW1lOiAnbG9iYnlfaG9zdCcsIGFjY2Vzc29yOiAnbG9iYnlfaG9zdCcsIGFsZ29yaXRobTogJ2J0cmVlJywgY29sdW1uczogWydob3N0VXNlcklkJ10gfSxcclxuICAgIF1cclxufSwge1xyXG4gICAgaWQ6IHQudTMyKCkucHJpbWFyeUtleSgpLmF1dG9JbmMoKSxcclxuICAgIGpvaW5Db2RlOiB0LnN0cmluZygpLnVuaXF1ZSgpLFxyXG4gICAgaG9zdFVzZXJJZDogdC51MzIoKSxcclxuICAgIHRlYW1CbHVlQWxpYXM6IHQuc3RyaW5nKCksXHJcbiAgICB0ZWFtUmVkQWxpYXM6IHQuc3RyaW5nKCksXHJcblxyXG4gICAgLy8gTGlmZWN5Y2xlICYgR2FyYmFnZSBDb2xsZWN0aW9uXHJcbiAgICBob3N0RGlzY29ubmVjdFRpbWU6IHQudGltZXN0YW1wKCkub3B0aW9uYWwoKSxcclxuICAgIGxhc3RBY3Rpdml0eUF0OiB0LnRpbWVzdGFtcCgpLFxyXG5cclxuICAgIHN0YWdlOiBMb2JieVN0YWdlLFxyXG4gICAgY29uZmlnOiBMb2JieUNvbmZpZyxcclxufSk7XHJcbiIsImltcG9ydCB7IHRhYmxlLCB0IH0gZnJvbSAnc3BhY2V0aW1lZGIvc2VydmVyJztcclxuaW1wb3J0IHsgUGFydGljaXBhdGlvblJvbGUsIFRlYW1MYWJlbCB9IGZyb20gJy4uL3R5cGVzL2VudW1zJztcclxuXHJcbmV4cG9ydCBjb25zdCBMb2JieU1lbWJlciA9IHRhYmxlKHtcclxuICAgIG5hbWU6ICdsb2JieV9tZW1iZXInLFxyXG4gICAgcHVibGljOiB0cnVlLFxyXG4gICAgcHJpbWFyeUtleTogWydsb2JieUlkJywgJ3VzZXJJZCddLFxyXG4gICAgaW5kZXhlczogW1xyXG4gICAgICAgIHsgbmFtZTogJ2xvYmJ5X21lbWJlcl9sb2JieV9pZCcsIGFjY2Vzc29yOiAnbG9iYnlfbWVtYmVyX2xvYmJ5X2lkJywgYWxnb3JpdGhtOiAnYnRyZWUnLCBjb2x1bW5zOiBbJ2xvYmJ5SWQnXSB9LFxyXG4gICAgXVxyXG59LCB7XHJcbiAgICBsb2JieUlkOiB0LnUzMigpLFxyXG4gICAgdXNlcklkOiB0LnUzMigpLFxyXG5cclxuICAgIGlzT25saW5lOiB0LmJvb2woKSxcclxuICAgIHBhcnRpY2lwYXRpb25Sb2xlOiBQYXJ0aWNpcGF0aW9uUm9sZSwgLy8gUGxheWVyIHZzIFNwZWN0YXRvclxyXG4gICAgaXNSZWZlcmVlOiB0LmJvb2woKSwgICAgLy8gQWRtaW4gcG93ZXJzIHdpdGhpbiB0aGlzIGxvYmJ5XHJcbiAgICB0ZWFtU2xvdDogVGVhbUxhYmVsLCAgICAvLyBCbHVlLCBSZWQsIG9yIFNwZWN0YXRvclxyXG59KTtcclxuIiwiaW1wb3J0IHsgdGFibGUsIHQgfSBmcm9tICdzcGFjZXRpbWVkYi9zZXJ2ZXInO1xyXG5cclxuZXhwb3J0IGNvbnN0IExvYmJ5Q3Vyc29yRXZlbnQgPSB0YWJsZSh7XHJcbiAgICBuYW1lOiAnbG9iYnlfY3Vyc29yX2V2ZW50JyxcclxuICAgIHB1YmxpYzogdHJ1ZSxcclxuICAgIGV2ZW50OiB0cnVlLCAvLyBCcm9hZGNhc3RzIG9uSW5zZXJ0LCB0aGVuIGRlbGV0ZXMgaW1tZWRpYXRlbHkuXHJcbn0sIHtcclxuICAgIGxvYmJ5SWQ6IHQudTMyKCksXHJcbiAgICBzZW5kZXJVc2VySWQ6IHQudTMyKCksIC8vIFdobyBtb3ZlZCB0aGUgbW91c2UgKHBlcnNpc3RlbnQgVXNlciBJRClcclxuICAgIHg6IHQuZjMyKCksXHJcbiAgICB5OiB0LmYzMigpLFxyXG4gICAgdGltZXN0YW1wOiB0LnRpbWVzdGFtcCgpLFxyXG59KTtcclxuIiwiaW1wb3J0IHsgdGFibGUsIHQgfSBmcm9tICdzcGFjZXRpbWVkYi9zZXJ2ZXInO1xyXG5pbXBvcnQgeyBEcmFmdFN0ZXAsIFRpbWVyU3RhdGUgfSBmcm9tICcuLi90eXBlcy9zdHJ1Y3RzJztcclxuXHJcbmV4cG9ydCBjb25zdCBNYXRjaFNlc3Npb24gPSB0YWJsZSh7XHJcbiAgICBuYW1lOiAnbWF0Y2hfc2Vzc2lvbicsXHJcbiAgICBwdWJsaWM6IHRydWUsXHJcbiAgICAvLyAxLXRvLTEgcmVsYXRpb25zaGlwIHdpdGggTG9iYnk6IFRoZSBMb2JieSBJRCBpcyB0aGUgUHJpbWFyeSBLZXlcclxufSwge1xyXG4gICAgbG9iYnlJZDogdC51MzIoKS5wcmltYXJ5S2V5KCksXHJcblxyXG4gICAgLy8gVGhlIGN1cnJlbnQgaW5kZXggaW50byB0aGUgJ2RyYWZ0U2VxdWVuY2UnIGFycmF5ICgwLWJhc2VkKVxyXG4gICAgdHVybkluZGV4OiB0LnUzMigpLFxyXG5cclxuICAgIC8vIFRoZSBnZW5lcmF0ZWQgc2NyaXB0IGZvciB0aGlzIG1hdGNoIChlLmcuIFtCYW4gQmx1ZSwgQmFuIFJlZCwgUGljayBCbHVlLi4uXSlcclxuICAgIGRyYWZ0U2VxdWVuY2U6IHQuYXJyYXkoRHJhZnRTdGVwKSxcclxuXHJcbiAgICAvLyBUcmFja3MgdHVybiB0aW1lcnMsIHJlc2VydmVzLCBhbmQgcGF1c2Ugc3RhdGVcclxuICAgIHRpbWVyU3RhdGU6IFRpbWVyU3RhdGUsXHJcblxyXG4gICAgLy8gQXVjdGlvbiBNb2RlIEJ1ZGdldHMgKElnbm9yZWQgaW4gQ2xhc3NpYylcclxuICAgIHRlYW1CbHVlQnVkZ2V0OiB0LmYzMigpLFxyXG4gICAgdGVhbVJlZEJ1ZGdldDogdC5mMzIoKSxcclxufSk7IiwiaW1wb3J0IHsgdGFibGUsIHQgfSBmcm9tICdzcGFjZXRpbWVkYi9zZXJ2ZXInO1xyXG5pbXBvcnQgeyBBY3Rpb25UeXBlLCBUZWFtTGFiZWwgfSBmcm9tICcuLi90eXBlcy9lbnVtcyc7XHJcbmltcG9ydCB7IFN0ZXBQYXlsb2FkIH0gZnJvbSAnLi4vdHlwZXMvc3RydWN0cyc7XHJcblxyXG5leHBvcnQgY29uc3QgTWF0Y2hTZXNzaW9uU3RlcCA9IHRhYmxlKHtcclxuICAgIG5hbWU6ICdtYXRjaF9zZXNzaW9uX3N0ZXAnLFxyXG4gICAgcHVibGljOiB0cnVlLFxyXG4gICAgaW5kZXhlczogW1xyXG4gICAgICAgIC8vIEZhc3QgbG9va3VwOiBcIkdldCBmdWxsIGhpc3RvcnkgZm9yIExvYmJ5IDEyM1wiXHJcbiAgICAgICAgeyBuYW1lOiAnbWF0Y2hfaGlzdG9yeV9sb2JieScsIGFjY2Vzc29yOiAnbWF0Y2hfaGlzdG9yeV9sb2JieScsIGFsZ29yaXRobTogJ2J0cmVlJywgY29sdW1uczogWydsb2JieUlkJ10gfSxcclxuICAgIF1cclxufSwge1xyXG4gICAgaWQ6IHQudTMyKCkucHJpbWFyeUtleSgpLmF1dG9JbmMoKSxcclxuXHJcbiAgICBsb2JieUlkOiB0LnUzMigpLCAgICAgIC8vIEZLIHRvIExvYmJ5L01hdGNoU2Vzc2lvblxyXG4gICAgc2VxdWVuY2U6IHQudTMyKCksICAgICAvLyAxLCAyLCAzLi4uIChTdHJpY3Qgb3JkZXJpbmcpXHJcblxyXG4gICAgYWN0b3JVc2VySWQ6IHQudTMyKCksIC8vIFdobyBwZXJmb3JtZWQgdGhlIGFjdGlvbiAocGVyc2lzdGVudCBVc2VyIElEKVxyXG4gICAgYWN0b3JTbG90OiBUZWFtTGFiZWwsICAvLyBCbHVlL1JlZC9TcGVjdGF0b3JcclxuXHJcbiAgICBhY3Rpb246IEFjdGlvblR5cGUsICAgIC8vIFBpY2ssIEJhbiwgQmlkLi4uXHJcblxyXG4gICAgcGF5bG9hZDogU3RlcFBheWxvYWQsXHJcbiAgICB0aW1lc3RhbXA6IHQudGltZXN0YW1wKCksXHJcbn0pO1xyXG4iLCJpbXBvcnQgeyB0YWJsZSwgdCB9IGZyb20gJ3NwYWNldGltZWRiL3NlcnZlcic7XHJcbmltcG9ydCB7IERyYWZ0TW9kZSwgR2FtZU1vZGUsIE1hdGNoUmVzdWx0IH0gZnJvbSAnLi4vdHlwZXMvZW51bXMnO1xyXG5pbXBvcnQgeyBQbGF5ZXJTbmFwc2hvdCwgTG9iYnlDb25maWcgfSBmcm9tICcuLi90eXBlcy9zdHJ1Y3RzJztcclxuXHJcbmV4cG9ydCBjb25zdCBNYXRjaFNlc3Npb25IaXN0b3J5ID0gdGFibGUoe1xyXG4gICAgbmFtZTogJ21hdGNoX3Nlc3Npb25faGlzdG9yeScsXHJcbiAgICBwdWJsaWM6IHRydWUsXHJcbiAgICBpbmRleGVzOiBbXHJcbiAgICAgICAgeyBuYW1lOiAnaGlzdG9yeV9wbGF5ZWRfYXQnLCBhY2Nlc3NvcjogJ2hpc3RvcnlfcGxheWVkX2F0JywgYWxnb3JpdGhtOiAnYnRyZWUnLCBjb2x1bW5zOiBbJ3BsYXllZEF0J10gfSxcclxuICAgICAgICB7IG5hbWU6ICdoaXN0b3J5X2dhbWVfbW9kZScsIGFjY2Vzc29yOiAnaGlzdG9yeV9nYW1lX21vZGUnLCBhbGdvcml0aG06ICdidHJlZScsIGNvbHVtbnM6IFsnZ2FtZU1vZGUnXSB9LFxyXG4gICAgXVxyXG59LCB7XHJcbiAgICBpZDogdC5zdHJpbmcoKS5wcmltYXJ5S2V5KCksIC8vIFVVSUQgZ2VuZXJhdGVkIGF0IGdhbWUgZW5kXHJcbiAgICBsb2JieUNvZGU6IHQuc3RyaW5nKCksICAgICAgIC8vIEtlcHQgZm9yIHJlZmVyZW5jZSAoZS5nLiBcIlg3SzlQMlwiKVxyXG4gICAgcGxheWVkQXQ6IHQudGltZXN0YW1wKCksXHJcblxyXG4gICAgZHJhZnRNb2RlOiBEcmFmdE1vZGUsXHJcbiAgICBnYW1lTW9kZTogR2FtZU1vZGUsXHJcblxyXG4gICAgdGVhbUJsdWVBbGlhczogdC5zdHJpbmcoKSxcclxuICAgIHRlYW1SZWRBbGlhczogdC5zdHJpbmcoKSxcclxuXHJcbiAgICAvLyBGdWxsIHNuYXBzaG90cyBvZiBwbGF5ZXJzIGF0IHRoZSB0aW1lIG9mIHRoZSBtYXRjaFxyXG4gICAgYmx1ZVRlYW1NZW1iZXJzOiB0LmFycmF5KFBsYXllclNuYXBzaG90KSxcclxuICAgIHJlZFRlYW1NZW1iZXJzOiB0LmFycmF5KFBsYXllclNuYXBzaG90KSxcclxuXHJcbiAgICBzbmFwc2hvdENvbmZpZzogTG9iYnlDb25maWcsIC8vIFRoZSBleGFjdCBydWxlcyB1c2VkIChTbmFwc2hvdClcclxuXHJcbiAgICByZXN1bHQ6IE1hdGNoUmVzdWx0LFxyXG5cclxuICAgIC8vIFNlcmlhbGl6ZWQgSlNPTiBibG9icyBjb250YWluaW5nIHRoZSBmaW5hbCB0ZWFtIGNvbXBzXHJcbiAgICAvLyAoQ2hhcmFjdGVyIE5hbWUsIEVpZG9sb24sIENvc3QgUGFpZCwgZXRjLilcclxuICAgIHJvc3RlckJsdWU6IHQuc3RyaW5nKCksXHJcbiAgICByb3N0ZXJSZWQ6IHQuc3RyaW5nKCksXHJcbn0pOyIsImltcG9ydCB7IHRhYmxlLCB0IH0gZnJvbSAnc3BhY2V0aW1lZGIvc2VydmVyJztcclxuXHJcbmV4cG9ydCBjb25zdCBNYXRjaFNlc3Npb25TdGVwSGlzdG9yeSA9IHRhYmxlKHtcclxuICAgIG5hbWU6ICdtYXRjaF9zZXNzaW9uX3N0ZXBfaGlzdG9yeScsXHJcbiAgICBwdWJsaWM6IHRydWUsXHJcbiAgICAvLyBUaGUgUEsgaXMgdGhlIE1hdGNoIElEIGl0c2VsZiAoMS10by0xIHJlbGF0aW9uIHdpdGggSGlzdG9yeSB0YWJsZSlcclxufSwge1xyXG4gICAgbWF0Y2hJZDogdC5zdHJpbmcoKS5wcmltYXJ5S2V5KCksIC8vIEZLIHRvIE1hdGNoU2Vzc2lvbkhpc3RvcnkuaWRcclxuXHJcbiAgICAvLyBBIHNpbmdsZSBtYXNzaXZlIEpTT04gc3RyaW5nIGNvbnRhaW5pbmcgdGhlIGZ1bGwgYXJyYXkgb2Ygc3RlcHMuXHJcbiAgICAvLyBDbGllbnRzIGZldGNoIHRoaXMgb25seSB3aGVuIFwiV2F0Y2ggUmVwbGF5XCIgaXMgY2xpY2tlZC5cclxuICAgIHN0ZXBzOiB0LnN0cmluZygpLFxyXG59KTsiLCJpbXBvcnQgeyBzY2hlbWEgfSBmcm9tICdzcGFjZXRpbWVkYi9zZXJ2ZXInO1xyXG5pbXBvcnQgeyBVc2VyIH0gZnJvbSAnLi90YWJsZXMvdXNlcic7XHJcbmltcG9ydCB7IFVzZXJJZGVudGl0eSB9IGZyb20gJy4vdGFibGVzL3VzZXJJZGVudGl0eSc7XHJcbmltcG9ydCB7IFNlcnZlcklkZW50aXR5IH0gZnJvbSAnLi90YWJsZXMvc2VydmVySWRlbnRpdHknO1xyXG5pbXBvcnQgeyBIc3JDaGFyYWN0ZXIgfSBmcm9tICcuL3RhYmxlcy9oc3JDaGFyYWN0ZXInO1xyXG5pbXBvcnQgeyBIc3JMaWdodGNvbmUgfSBmcm9tICcuL3RhYmxlcy9oc3JMaWdodGNvbmUnO1xyXG5pbXBvcnQgeyBIc3JDaGFyYWN0ZXJDb3N0IH0gZnJvbSAnLi90YWJsZXMvaHNyQ2hhcmFjdGVyQ29zdCc7XHJcbmltcG9ydCB7IEhzckxpZ2h0Y29uZUNvc3QgfSBmcm9tICcuL3RhYmxlcy9oc3JMaWdodGNvbmVDb3N0JztcclxuaW1wb3J0IHsgSHNyU3luZXJneUNvc3QgfSBmcm9tICcuL3RhYmxlcy9oc3JTeW5lcmd5Q29zdCc7XHJcbmltcG9ydCB7IExvYmJ5IH0gZnJvbSAnLi90YWJsZXMvbG9iYnknO1xyXG5pbXBvcnQgeyBMb2JieU1lbWJlciB9IGZyb20gJy4vdGFibGVzL2xvYmJ5TWVtYmVyJztcclxuaW1wb3J0IHsgTG9iYnlDdXJzb3JFdmVudCB9IGZyb20gJy4vdGFibGVzL2xvYmJ5Q3Vyc29yRXZlbnQnO1xyXG5pbXBvcnQgeyBNYXRjaFNlc3Npb24gfSBmcm9tICcuL3RhYmxlcy9tYXRjaFNlc3Npb24nO1xyXG5pbXBvcnQgeyBNYXRjaFNlc3Npb25TdGVwIH0gZnJvbSAnLi90YWJsZXMvbWF0Y2hTZXNzaW9uU3RlcCc7XHJcbmltcG9ydCB7IE1hdGNoU2Vzc2lvbkhpc3RvcnkgfSBmcm9tICcuL3RhYmxlcy9tYXRjaFNlc3Npb25IaXN0b3J5JztcclxuaW1wb3J0IHsgTWF0Y2hTZXNzaW9uU3RlcEhpc3RvcnkgfSBmcm9tICcuL3RhYmxlcy9tYXRjaFNlc3Npb25TdGVwSGlzdG9yeSc7XHJcblxyXG5jb25zdCBzcGFjZXRpbWVkYiA9IHNjaGVtYSh7XHJcbiAgICAvLyBVc2VyIC8gQXV0aFxyXG4gICAgVXNlcixcclxuICAgIFVzZXJJZGVudGl0eSxcclxuICAgIFNlcnZlcklkZW50aXR5LFxyXG5cclxuICAgIC8vIFN0YXRpYyBBc3NldHNcclxuICAgIEhzckNoYXJhY3RlcixcclxuICAgIEhzckxpZ2h0Y29uZSxcclxuXHJcbiAgICAvLyBFY29ub215XHJcbiAgICBIc3JDaGFyYWN0ZXJDb3N0LFxyXG4gICAgSHNyTGlnaHRjb25lQ29zdCxcclxuICAgIEhzclN5bmVyZ3lDb3N0LFxyXG5cclxuICAgIC8vIExvYmJ5IFN5c3RlbVxyXG4gICAgTG9iYnksXHJcbiAgICBMb2JieU1lbWJlcixcclxuICAgIExvYmJ5Q3Vyc29yRXZlbnQsXHJcblxyXG4gICAgLy8gQWN0aXZlIEdhbWVcclxuICAgIE1hdGNoU2Vzc2lvbixcclxuICAgIE1hdGNoU2Vzc2lvblN0ZXAsXHJcblxyXG4gICAgLy8gSGlzdG9yeVxyXG4gICAgTWF0Y2hTZXNzaW9uSGlzdG9yeSxcclxuICAgIE1hdGNoU2Vzc2lvblN0ZXBIaXN0b3J5LFxyXG59KTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHNwYWNldGltZWRiOyIsImltcG9ydCBzcGFjZXRpbWVkYiBmcm9tICcuLi9zY2hlbWEnO1xyXG5pbXBvcnQgeyB0IH0gZnJvbSAnc3BhY2V0aW1lZGIvc2VydmVyJztcclxuXHJcbmV4cG9ydCBjb25zdCBicm9hZGNhc3RfY3Vyc29yID0gc3BhY2V0aW1lZGIucmVkdWNlcih7XHJcbiAgICBsb2JieUlkOiB0LnUzMigpLFxyXG4gICAgeDogdC5mMzIoKSxcclxuICAgIHk6IHQuZjMyKCksXHJcbn0sIChjdHgsIHsgbG9iYnlJZCwgeCwgeSB9KSA9PiB7XHJcbiAgICAvLyBSZXNvbHZlIGlkZW50aXR5IOKGkiB1c2VySWRcclxuICAgIGNvbnN0IG1hcHBpbmcgPSBjdHguZGIuVXNlcklkZW50aXR5LmlkZW50aXR5LmZpbmQoY3R4LnNlbmRlcik7XHJcbiAgICBpZiAoIW1hcHBpbmcpIHJldHVybjsgLy8gTm90IHJlZ2lzdGVyZWQsIGlnbm9yZVxyXG5cclxuICAgIC8vIFZhbGlkYXRlIG1lbWJlcnNoaXAgdmlhIGNvbXBvc2l0ZSBQS1xyXG4gICAgY29uc3QgbWVtYmVyVGFibGUgPSBjdHguZGIuTG9iYnlNZW1iZXIgYXMgYW55O1xyXG4gICAgY29uc3QgbWVtYmVyc2hpcCA9IG1lbWJlclRhYmxlLnByaW1hcnlLZXkuZmluZCh7XHJcbiAgICAgICAgbG9iYnlJZCxcclxuICAgICAgICB1c2VySWQ6IG1hcHBpbmcudXNlcklkLFxyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKCFtZW1iZXJzaGlwKSB7XHJcbiAgICAgICAgLy8gVXNlciBpcyBub3QgaW4gdGhpcyBsb2JieSwgaWdub3JlIHRoZSByZXF1ZXN0XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEJyb2FkY2FzdFxyXG4gICAgY3R4LmRiLkxvYmJ5Q3Vyc29yRXZlbnQuaW5zZXJ0KHtcclxuICAgICAgICBsb2JieUlkLFxyXG4gICAgICAgIHNlbmRlclVzZXJJZDogbWFwcGluZy51c2VySWQsXHJcbiAgICAgICAgeCxcclxuICAgICAgICB5LFxyXG4gICAgICAgIHRpbWVzdGFtcDogY3R4LnRpbWVzdGFtcCxcclxuICAgIH0pO1xyXG59KTtcclxuIiwiaW1wb3J0IHNwYWNldGltZWRiIGZyb20gJy4uL3NjaGVtYSc7XHJcblxyXG4vKipcclxuICogTG9naW4gYXMgYSBndWVzdCB1c2VyLlxyXG4gKiAtIElmIGlkZW50aXR5IGFscmVhZHkgbGlua2VkIOKGkiB1cGRhdGUgbGFzdExvZ2luQXQgKG5vLW9wKS5cclxuICogLSBPdGhlcndpc2Ug4oaSIGNyZWF0ZSBhIG5ldyBVc2VyICsgVXNlcklkZW50aXR5IG1hcHBpbmcuXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgbG9naW5fYXNfZ3Vlc3QgPSBzcGFjZXRpbWVkYi5yZWR1Y2VyKChjdHgpID0+IHtcclxuICAgIGNvbnN0IG1hcHBpbmcgPSBjdHguZGIuVXNlcklkZW50aXR5LmlkZW50aXR5LmZpbmQoY3R4LnNlbmRlcik7XHJcbiAgICBpZiAobWFwcGluZykge1xyXG4gICAgICAgIGNvbnN0IHVzZXIgPSBjdHguZGIuVXNlci5pZC5maW5kKG1hcHBpbmcudXNlcklkKTtcclxuICAgICAgICBpZiAodXNlcikge1xyXG4gICAgICAgICAgICAvLyBBbHJlYWR5IHJlZ2lzdGVyZWQg4oCUIHVwZGF0ZSBsYXN0TG9naW5BdCBhbmQgbGFzdFNlZW5BdFxyXG4gICAgICAgICAgICBjdHguZGIuVXNlci5pZC51cGRhdGUoe1xyXG4gICAgICAgICAgICAgICAgLi4udXNlcixcclxuICAgICAgICAgICAgICAgIGxhc3RMb2dpbkF0OiBjdHgudGltZXN0YW1wLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgY3R4LmRiLlVzZXJJZGVudGl0eS5pZGVudGl0eS51cGRhdGUoe1xyXG4gICAgICAgICAgICAgICAgLi4ubWFwcGluZyxcclxuICAgICAgICAgICAgICAgIGxhc3RTZWVuQXQ6IGN0eC50aW1lc3RhbXAsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEdlbmVyYXRlIGEgZ3Vlc3QgdXNlcm5hbWUgZnJvbSB0aGUgaWRlbnRpdHkgaGV4IChmaXJzdCA4IGNoYXJzKVxyXG4gICAgY29uc3Qgc2hvcnRJZCA9IGN0eC5zZW5kZXIudG9IZXhTdHJpbmcoKS5zbGljZSgwLCA4KTtcclxuICAgIGNvbnN0IGd1ZXN0VXNlcm5hbWUgPSBgR3Vlc3RfJHtzaG9ydElkfWA7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSBVc2VyIHJvdyAoaWQgaXMgYXV0b0luYywgcGFzcyAwKVxyXG4gICAgY29uc3QgbmV3VXNlciA9IGN0eC5kYi5Vc2VyLmluc2VydCh7XHJcbiAgICAgICAgaWQ6IDAsXHJcbiAgICAgICAgdXNlcm5hbWU6IGd1ZXN0VXNlcm5hbWUsXHJcbiAgICAgICAgZGlzcGxheU5hbWU6IGd1ZXN0VXNlcm5hbWUsXHJcbiAgICAgICAgaXNHdWVzdDogdHJ1ZSxcclxuICAgICAgICBsYXN0TG9naW5BdDogY3R4LnRpbWVzdGFtcCxcclxuICAgICAgICByb2xlOiB7IHRhZzogJ1VzZXInIH0sXHJcbiAgICAgICAgZGlzY29yZElkOiB1bmRlZmluZWQsXHJcbiAgICAgICAgYXZhdGFyQ2hhcmFjdGVyTmFtZTogJ21hcmNoN3RoJyxcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIExpbmsgdGhpcyBpZGVudGl0eSB0byB0aGUgbmV3IHVzZXJcclxuICAgIGN0eC5kYi5Vc2VySWRlbnRpdHkuaW5zZXJ0KHtcclxuICAgICAgICBpZGVudGl0eTogY3R4LnNlbmRlcixcclxuICAgICAgICB1c2VySWQ6IG5ld1VzZXIuaWQsXHJcbiAgICAgICAgbGFzdFNlZW5BdDogY3R4LnRpbWVzdGFtcCxcclxuICAgIH0pO1xyXG59KTtcclxuIiwiaW1wb3J0IHNwYWNldGltZWRiIGZyb20gJy4uL3NjaGVtYSc7XG5pbXBvcnQgeyB0LCBTZW5kZXJFcnJvciB9IGZyb20gJ3NwYWNldGltZWRiL3NlcnZlcic7XG5cbi8qKlxuICogSGVscGVyOiByZXNvbHZlIGN0eC5zZW5kZXIg4oaSIFVzZXJJZGVudGl0eSDihpIgVXNlci5cbiAqIFJldHVybnMgeyBtYXBwaW5nLCB1c2VyIH0gb3IgbnVsbCBpZiBpZGVudGl0eSBpcyBub3QgbGlua2VkLlxuICovXG5mdW5jdGlvbiByZXNvbHZlVXNlcihjdHg6IGFueSkge1xuICAgIGNvbnN0IG1hcHBpbmcgPSBjdHguZGIuVXNlcklkZW50aXR5LmlkZW50aXR5LmZpbmQoY3R4LnNlbmRlcik7XG4gICAgaWYgKCFtYXBwaW5nKSByZXR1cm4gbnVsbDtcbiAgICBjb25zdCB1c2VyID0gY3R4LmRiLlVzZXIuaWQuZmluZChtYXBwaW5nLnVzZXJJZCk7XG4gICAgaWYgKCF1c2VyKSByZXR1cm4gbnVsbDtcbiAgICByZXR1cm4geyBtYXBwaW5nLCB1c2VyIH07XG59XG5cbi8qKlxuICogRGVsZXRlIGEgZ3Vlc3QgYWNjb3VudCBwZXJtYW5lbnRseS5cbiAqIE9ubHkgd29ya3MgZm9yIGd1ZXN0IHVzZXJzIChubyBEaXNjb3JkIGxpbmtlZCkuXG4gKiBSZW1vdmVzIHRoZSBVc2VySWRlbnRpdHkgbWFwcGluZyBhbmQgdGhlIFVzZXIgcm93LlxuICovXG5leHBvcnQgY29uc3QgZGVsZXRlX2d1ZXN0X2FjY291bnQgPSBzcGFjZXRpbWVkYi5yZWR1Y2VyKChjdHgpID0+IHtcbiAgICBjb25zdCByZXNvbHZlZCA9IHJlc29sdmVVc2VyKGN0eCk7XG4gICAgaWYgKCFyZXNvbHZlZCkge1xuICAgICAgICB0aHJvdyBuZXcgU2VuZGVyRXJyb3IoJ05vIGFjY291bnQgZm91bmQgZm9yIHRoaXMgaWRlbnRpdHkuJyk7XG4gICAgfVxuICAgIGlmICghcmVzb2x2ZWQudXNlci5pc0d1ZXN0KSB7XG4gICAgICAgIHRocm93IG5ldyBTZW5kZXJFcnJvcignT25seSBndWVzdCBhY2NvdW50cyBjYW4gYmUgZGVsZXRlZCB0aGlzIHdheS4gVmVyaWZpZWQgYWNjb3VudHMgcGVyc2lzdCBhY3Jvc3MgZGV2aWNlcy4nKTtcbiAgICB9XG5cbiAgICAvLyBEZWxldGUgdGhlIFVzZXJJZGVudGl0eSBtYXBwaW5nIGZvciB0aGlzIGlkZW50aXR5XG4gICAgY3R4LmRiLlVzZXJJZGVudGl0eS5pZGVudGl0eS5kZWxldGUoY3R4LnNlbmRlcik7XG5cbiAgICAvLyBDaGVjayBpZiBhbnkgb3RoZXIgaWRlbnRpdGllcyBzdGlsbCBwb2ludCB0byB0aGlzIHVzZXJcbiAgICBjb25zdCByZW1haW5pbmdMaW5rcyA9IFsuLi5jdHguZGIuVXNlcklkZW50aXR5LnVzZXJfaWRlbnRpdHlfdXNlcl9pZC5maWx0ZXIocmVzb2x2ZWQudXNlci5pZCldO1xuICAgIGlmIChyZW1haW5pbmdMaW5rcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgLy8gTm8gbW9yZSBpZGVudGl0aWVzIGxpbmtlZCDigJQgc2FmZSB0byBkZWxldGUgdGhlIFVzZXIgcm93XG4gICAgICAgIGN0eC5kYi5Vc2VyLmlkLmRlbGV0ZShyZXNvbHZlZC51c2VyLmlkKTtcbiAgICB9XG59KTtcblxuLyoqXG4gKiBVcGRhdGUgdGhlIGNhbGxlcidzIGRpc3BsYXkgbmFtZS5cbiAqIE9ubHkgbm9uLWVtcHR5IHN0cmluZ3MgYXJlIGFjY2VwdGVkLiBNYXggMzIgY2hhcmFjdGVycy5cbiAqL1xuZXhwb3J0IGNvbnN0IHVwZGF0ZV9kaXNwbGF5X25hbWUgPSBzcGFjZXRpbWVkYi5yZWR1Y2VyKHtcbiAgICBuZXdEaXNwbGF5TmFtZTogdC5zdHJpbmcoKSxcbn0sIChjdHgsIHsgbmV3RGlzcGxheU5hbWUgfSkgPT4ge1xuICAgIGNvbnN0IHRyaW1tZWQgPSBuZXdEaXNwbGF5TmFtZS50cmltKCk7XG4gICAgaWYgKHRyaW1tZWQubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHRocm93IG5ldyBTZW5kZXJFcnJvcignRGlzcGxheSBuYW1lIGNhbm5vdCBiZSBlbXB0eScpO1xuICAgIH1cbiAgICBpZiAodHJpbW1lZC5sZW5ndGggPiAzMikge1xuICAgICAgICB0aHJvdyBuZXcgU2VuZGVyRXJyb3IoJ0Rpc3BsYXkgbmFtZSBtdXN0IGJlIDMyIGNoYXJhY3RlcnMgb3IgZmV3ZXInKTtcbiAgICB9XG5cbiAgICBjb25zdCByZXNvbHZlZCA9IHJlc29sdmVVc2VyKGN0eCk7XG4gICAgaWYgKCFyZXNvbHZlZCkge1xuICAgICAgICB0aHJvdyBuZXcgU2VuZGVyRXJyb3IoJ1VzZXIgbm90IGZvdW5kIOKAlCBsb2dpbiBmaXJzdCcpO1xuICAgIH1cblxuICAgIGN0eC5kYi5Vc2VyLmlkLnVwZGF0ZSh7XG4gICAgICAgIC4uLnJlc29sdmVkLnVzZXIsXG4gICAgICAgIGRpc3BsYXlOYW1lOiB0cmltbWVkLFxuICAgIH0pO1xufSk7XG5cbi8qKlxuICogVXBkYXRlIHRoZSBjYWxsZXIncyB1c2VybmFtZS5cbiAqIE9ubHkgdmVyaWZpZWQgKG5vbi1ndWVzdCkgdXNlcnMgd2l0aCBhIGxpbmtlZCBEaXNjb3JkIGNhbiBjaGFuZ2UgdGhlaXIgdXNlcm5hbWUuXG4gKiBVbmlxdWVuZXNzIGlzIGVuZm9yY2VkIGJ5IHRoZSBkYXRhYmFzZSBjb25zdHJhaW50LlxuICovXG5leHBvcnQgY29uc3QgdXBkYXRlX3VzZXJuYW1lID0gc3BhY2V0aW1lZGIucmVkdWNlcih7XG4gICAgbmV3VXNlcm5hbWU6IHQuc3RyaW5nKCksXG59LCAoY3R4LCB7IG5ld1VzZXJuYW1lIH0pID0+IHtcbiAgICBjb25zdCB0cmltbWVkID0gbmV3VXNlcm5hbWUudHJpbSgpO1xuICAgIGlmICh0cmltbWVkLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aHJvdyBuZXcgU2VuZGVyRXJyb3IoJ1VzZXJuYW1lIGNhbm5vdCBiZSBlbXB0eScpO1xuICAgIH1cbiAgICBpZiAodHJpbW1lZC5sZW5ndGggPiAzMikge1xuICAgICAgICB0aHJvdyBuZXcgU2VuZGVyRXJyb3IoJ1VzZXJuYW1lIG11c3QgYmUgMzIgY2hhcmFjdGVycyBvciBmZXdlcicpO1xuICAgIH1cblxuICAgIGNvbnN0IHJlc29sdmVkID0gcmVzb2x2ZVVzZXIoY3R4KTtcbiAgICBpZiAoIXJlc29sdmVkKSB7XG4gICAgICAgIHRocm93IG5ldyBTZW5kZXJFcnJvcignVXNlciBub3QgZm91bmQg4oCUIGxvZ2luIGZpcnN0Jyk7XG4gICAgfVxuICAgIGlmIChyZXNvbHZlZC51c2VyLmlzR3Vlc3QpIHtcbiAgICAgICAgdGhyb3cgbmV3IFNlbmRlckVycm9yKCdHdWVzdCB1c2VycyBjYW5ub3QgY2hhbmdlIHRoZWlyIHVzZXJuYW1lLiBMaW5rIHlvdXIgRGlzY29yZCBhY2NvdW50IGZpcnN0LicpO1xuICAgIH1cblxuICAgIGN0eC5kYi5Vc2VyLmlkLnVwZGF0ZSh7XG4gICAgICAgIC4uLnJlc29sdmVkLnVzZXIsXG4gICAgICAgIHVzZXJuYW1lOiB0cmltbWVkLFxuICAgIH0pO1xufSk7XG5cbi8qKlxuICogVXBkYXRlIHRoZSBjYWxsZXIncyBhdmF0YXIgY2hhcmFjdGVyLlxuICogVGhlIGNoYXJhY3Rlck5hbWUgc2hvdWxkIHJlZmVyZW5jZSBhbiBleGlzdGluZyBIc3JDaGFyYWN0ZXIgbmFtZS5cbiAqL1xuZXhwb3J0IGNvbnN0IHVwZGF0ZV9hdmF0YXIgPSBzcGFjZXRpbWVkYi5yZWR1Y2VyKHtcbiAgICBjaGFyYWN0ZXJOYW1lOiB0LnN0cmluZygpLFxufSwgKGN0eCwgeyBjaGFyYWN0ZXJOYW1lIH0pID0+IHtcbiAgICBjb25zdCByZXNvbHZlZCA9IHJlc29sdmVVc2VyKGN0eCk7XG4gICAgaWYgKCFyZXNvbHZlZCkge1xuICAgICAgICB0aHJvdyBuZXcgU2VuZGVyRXJyb3IoJ1VzZXIgbm90IGZvdW5kIOKAlCBsb2dpbiBmaXJzdCcpO1xuICAgIH1cblxuICAgIGN0eC5kYi5Vc2VyLmlkLnVwZGF0ZSh7XG4gICAgICAgIC4uLnJlc29sdmVkLnVzZXIsXG4gICAgICAgIGF2YXRhckNoYXJhY3Rlck5hbWU6IGNoYXJhY3Rlck5hbWUsXG4gICAgfSk7XG59KTtcbiIsImltcG9ydCBzcGFjZXRpbWVkYiBmcm9tICcuLi9zY2hlbWEnO1xyXG5pbXBvcnQgeyB0LCBTZW5kZXJFcnJvciB9IGZyb20gJ3NwYWNldGltZWRiL3NlcnZlcic7XHJcblxyXG4vKipcclxuICogSGVscGVyOiB2ZXJpZnkgdGhlIGNhbGxlciBpcyB0aGUgcmVnaXN0ZXJlZCBzZXJ2ZXIgaWRlbnRpdHkuXHJcbiAqL1xyXG5mdW5jdGlvbiByZXF1aXJlU2VydmVyKGN0eDogYW55KSB7XHJcbiAgICBjb25zdCBzZXJ2ZXIgPSBjdHguZGIuU2VydmVySWRlbnRpdHkuaWRlbnRpdHkuZmluZChjdHguc2VuZGVyKTtcclxuICAgIGlmICghc2VydmVyKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IFNlbmRlckVycm9yKCdGb3JiaWRkZW46IGNhbGxlciBpcyBub3QgdGhlIHJlZ2lzdGVyZWQgc2VydmVyIGlkZW50aXR5LicpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNlcnZlcjtcclxufVxyXG5cclxuLyoqXHJcbiAqIEJvb3RzdHJhcCByZWR1Y2VyOiByZWdpc3RlciB0aGUgY2FsbGluZyBpZGVudGl0eSBhcyB0aGUgdHJ1c3RlZCBzZXJ2ZXIuXHJcbiAqIE9ubHkgd29ya3Mgd2hlbiBubyBzZXJ2ZXIgaWRlbnRpdHkgZXhpc3RzIHlldCAoZmlyc3QtY29tZS1maXJzdC1zZXJ2ZWQpLlxyXG4gKiBUbyByZS1yZWdpc3RlciwgY2xlYXItcHVibGlzaCB0aGUgZGF0YWJhc2UgZmlyc3QuXHJcbiAqXHJcbiAqIFJ1biB2aWE6IG5weCB0c3ggc2NyaXB0cy9yZWdpc3Rlci1zZXJ2ZXIudHNcclxuICovXHJcbmV4cG9ydCBjb25zdCByZWdpc3Rlcl9zZXJ2ZXIgPSBzcGFjZXRpbWVkYi5yZWR1Y2VyKChjdHgpID0+IHtcclxuICAgIGNvbnN0IGV4aXN0aW5nID0gWy4uLmN0eC5kYi5TZXJ2ZXJJZGVudGl0eS5pdGVyKCldO1xyXG4gICAgaWYgKGV4aXN0aW5nLmxlbmd0aCA+IDApIHtcclxuICAgICAgICB0aHJvdyBuZXcgU2VuZGVyRXJyb3IoJ1NlcnZlciBpZGVudGl0eSBhbHJlYWR5IHJlZ2lzdGVyZWQuIFRvIHJlLXJlZ2lzdGVyLCBjbGVhciB0aGUgZGF0YWJhc2UgZmlyc3QuJyk7XHJcbiAgICB9XHJcblxyXG4gICAgY3R4LmRiLlNlcnZlcklkZW50aXR5Lmluc2VydCh7XHJcbiAgICAgICAgaWRlbnRpdHk6IGN0eC5zZW5kZXIsXHJcbiAgICAgICAgcmVnaXN0ZXJlZEF0OiBjdHgudGltZXN0YW1wLFxyXG4gICAgfSk7XHJcbn0pO1xyXG5cclxuLyoqXHJcbiAqIFNlcnZlci1vbmx5IHJlZHVjZXI6IGxpbmsgYSBEaXNjb3JkIGFjY291bnQgdG8gYSB1c2VyIGlkZW50aXR5LlxyXG4gKiBDYWxsZWQgYnkgdGhlIE5leHQuanMgQVBJIHJvdXRlIGFmdGVyIHZlcmlmeWluZyB0aGUgRGlzY29yZCBPQXV0aCBzZXNzaW9uLlxyXG4gKlxyXG4gKiBUaGUgY2FsbGVySWRlbnRpdHlIZXggaXMgdGhlIFNwYWNldGltZURCIGlkZW50aXR5IGhleCBvZiB0aGUgZW5kLXVzZXInc1xyXG4gKiBicm93c2VyIGNsaWVudC4gVGhlIHNlcnZlciBwYXNzZXMgaXQgYWxvbmcgc28gd2Uga25vdyB3aGljaCBVc2VySWRlbnRpdHlcclxuICogdG8gdXBkYXRlLlxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IHNlcnZlcl9saW5rX2Rpc2NvcmQgPSBzcGFjZXRpbWVkYi5yZWR1Y2VyKHtcclxuICAgIGNhbGxlcklkZW50aXR5SGV4OiB0LnN0cmluZygpLFxyXG4gICAgZGlzY29yZElkOiB0LnN0cmluZygpLFxyXG4gICAgZGlzY29yZFVzZXJuYW1lOiB0LnN0cmluZygpLFxyXG59LCAoY3R4LCB7IGNhbGxlcklkZW50aXR5SGV4LCBkaXNjb3JkSWQsIGRpc2NvcmRVc2VybmFtZSB9KSA9PiB7XHJcbiAgICAvLyAxLiBWZXJpZnkgY2FsbGVyIGlzIHRoZSB0cnVzdGVkIHNlcnZlclxyXG4gICAgcmVxdWlyZVNlcnZlcihjdHgpO1xyXG5cclxuICAgIC8vIDIuIFZhbGlkYXRlIGlucHV0c1xyXG4gICAgaWYgKCFkaXNjb3JkSWQgfHwgZGlzY29yZElkLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIHRocm93IG5ldyBTZW5kZXJFcnJvcignZGlzY29yZElkIGlzIHJlcXVpcmVkJyk7XHJcbiAgICB9XHJcbiAgICBpZiAoIWRpc2NvcmRVc2VybmFtZSB8fCBkaXNjb3JkVXNlcm5hbWUubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IFNlbmRlckVycm9yKCdkaXNjb3JkVXNlcm5hbWUgaXMgcmVxdWlyZWQnKTtcclxuICAgIH1cclxuICAgIGlmICghY2FsbGVySWRlbnRpdHlIZXggfHwgY2FsbGVySWRlbnRpdHlIZXgubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IFNlbmRlckVycm9yKCdjYWxsZXJJZGVudGl0eUhleCBpcyByZXF1aXJlZCcpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIDMuIFJlc29sdmUgdGhlIGVuZC11c2VyJ3MgaWRlbnRpdHkg4oaSIFVzZXJJZGVudGl0eSDihpIgVXNlclxyXG4gICAgLy8gICAgV2UgbmVlZCB0byBmaW5kIHRoZSBVc2VySWRlbnRpdHkgcm93IGJ5IGl0ZXJhdGluZyAoaWRlbnRpdHkgaXMgYW4gb2JqZWN0LFxyXG4gICAgLy8gICAgYW5kIHdlIG9ubHkgaGF2ZSB0aGUgaGV4IHN0cmluZyBmcm9tIHRoZSBBUEkgcm91dGUpLlxyXG4gICAgbGV0IHVzZXJNYXBwaW5nOiBhbnkgPSBudWxsO1xyXG4gICAgZm9yIChjb25zdCByb3cgb2YgY3R4LmRiLlVzZXJJZGVudGl0eS5pdGVyKCkpIHtcclxuICAgICAgICBpZiAocm93LmlkZW50aXR5LnRvSGV4U3RyaW5nKCkgPT09IGNhbGxlcklkZW50aXR5SGV4KSB7XHJcbiAgICAgICAgICAgIHVzZXJNYXBwaW5nID0gcm93O1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGN1cnJlbnRVc2VyOiBhbnkgPSBudWxsO1xyXG4gICAgaWYgKHVzZXJNYXBwaW5nKSB7XHJcbiAgICAgICAgY3VycmVudFVzZXIgPSBjdHguZGIuVXNlci5pZC5maW5kKHVzZXJNYXBwaW5nLnVzZXJJZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gNC4gQ2hlY2sgaWYgYSBVc2VyIHdpdGggdGhpcyBkaXNjb3JkSWQgYWxyZWFkeSBleGlzdHNcclxuICAgIGNvbnN0IGV4aXN0aW5nQnlEaXNjb3JkID0gWy4uLmN0eC5kYi5Vc2VyLnVzZXJfZGlzY29yZF9pZC5maWx0ZXIoZGlzY29yZElkKV07XHJcbiAgICBjb25zdCBkaXNjb3JkT3duZXIgPSBleGlzdGluZ0J5RGlzY29yZC5sZW5ndGggPiAwID8gZXhpc3RpbmdCeURpc2NvcmRbMF0gOiBudWxsO1xyXG5cclxuICAgIGlmIChjdXJyZW50VXNlcikge1xyXG4gICAgICAgIGlmIChkaXNjb3JkT3duZXIgJiYgZGlzY29yZE93bmVyLmlkICE9PSBjdXJyZW50VXNlci5pZCkge1xyXG4gICAgICAgICAgICAvLyBDYXNlIDFiOiBVc2VyJ3MgaWRlbnRpdHkgY3VycmVudGx5IHBvaW50cyB0byBhIGRpZmZlcmVudCB1c2VyIChndWVzdCksXHJcbiAgICAgICAgICAgIC8vIGJ1dCB0aGUgRGlzY29yZCBhY2NvdW50IGJlbG9uZ3MgdG8gYW4gZXhpc3RpbmcgdmVyaWZpZWQgdXNlci5cclxuICAgICAgICAgICAgLy8gUmUtcG9pbnQgaWRlbnRpdHkgdG8gdGhlIERpc2NvcmQgb3duZXIsIGNsZWFuIHVwIG9ycGhhbmVkIGd1ZXN0LlxyXG4gICAgICAgICAgICBjb25zdCBvbGRHdWVzdElkID0gY3VycmVudFVzZXIuaWQ7XHJcbiAgICAgICAgICAgIGNvbnN0IHdhc0d1ZXN0ID0gY3VycmVudFVzZXIuaXNHdWVzdDtcclxuXHJcbiAgICAgICAgICAgIGN0eC5kYi5Vc2VySWRlbnRpdHkuaWRlbnRpdHkudXBkYXRlKHtcclxuICAgICAgICAgICAgICAgIC4uLnVzZXJNYXBwaW5nLFxyXG4gICAgICAgICAgICAgICAgdXNlcklkOiBkaXNjb3JkT3duZXIuaWQsXHJcbiAgICAgICAgICAgICAgICBsYXN0U2VlbkF0OiBjdHgudGltZXN0YW1wLFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGN0eC5kYi5Vc2VyLmlkLnVwZGF0ZSh7XHJcbiAgICAgICAgICAgICAgICAuLi5kaXNjb3JkT3duZXIsXHJcbiAgICAgICAgICAgICAgICBsYXN0TG9naW5BdDogY3R4LnRpbWVzdGFtcCxcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBpZiAod2FzR3Vlc3QpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHJlbWFpbmluZ0xpbmtzID0gWy4uLmN0eC5kYi5Vc2VySWRlbnRpdHkudXNlcl9pZGVudGl0eV91c2VyX2lkLmZpbHRlcihvbGRHdWVzdElkKV07XHJcbiAgICAgICAgICAgICAgICBpZiAocmVtYWluaW5nTGlua3MubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY3R4LmRiLlVzZXIuaWQuZGVsZXRlKG9sZEd1ZXN0SWQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIENhc2UgMWEgLyAxYzogVXBncmFkZSBndWVzdCBvciByZWZyZXNoIERpc2NvcmQgaW5mb1xyXG4gICAgICAgIGN0eC5kYi5Vc2VyLmlkLnVwZGF0ZSh7XHJcbiAgICAgICAgICAgIC4uLmN1cnJlbnRVc2VyLFxyXG4gICAgICAgICAgICB1c2VybmFtZTogY3VycmVudFVzZXIuaXNHdWVzdCA/IGRpc2NvcmRVc2VybmFtZSA6IGN1cnJlbnRVc2VyLnVzZXJuYW1lLFxyXG4gICAgICAgICAgICBkaXNwbGF5TmFtZTogY3VycmVudFVzZXIuaXNHdWVzdCA/IGRpc2NvcmRVc2VybmFtZSA6IGN1cnJlbnRVc2VyLmRpc3BsYXlOYW1lLFxyXG4gICAgICAgICAgICBpc0d1ZXN0OiBmYWxzZSxcclxuICAgICAgICAgICAgZGlzY29yZElkLFxyXG4gICAgICAgICAgICBsYXN0TG9naW5BdDogY3R4LnRpbWVzdGFtcCxcclxuICAgICAgICB9KTtcclxuICAgICAgICBjdHguZGIuVXNlcklkZW50aXR5LmlkZW50aXR5LnVwZGF0ZSh7XHJcbiAgICAgICAgICAgIC4uLnVzZXJNYXBwaW5nLFxyXG4gICAgICAgICAgICBsYXN0U2VlbkF0OiBjdHgudGltZXN0YW1wLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBObyBVc2VySWRlbnRpdHkgbWFwcGluZyBleGlzdHMgZm9yIHRoaXMgaWRlbnRpdHkgeWV0XHJcbiAgICBpZiAoZGlzY29yZE93bmVyKSB7XHJcbiAgICAgICAgLy8gQ2FzZSAyOiBDcm9zcy1kZXZpY2UgbG9naW4g4oCUIHdlIG5lZWQgdG8gY3JlYXRlIGEgVXNlcklkZW50aXR5IGZvciB0aGlzIGhleC5cclxuICAgICAgICAvLyBCdXQgd2Ugb25seSBoYXZlIHRoZSBoZXggc3RyaW5nLCBub3QgdGhlIElkZW50aXR5IG9iamVjdC4gV2UgY2FuJ3QgaW5zZXJ0XHJcbiAgICAgICAgLy8gYSBVc2VySWRlbnRpdHkgd2l0aG91dCB0aGUgSWRlbnRpdHkgdHlwZS4gU28gaW5zdGVhZCwgd2UnbGwgc3RvcmUgdGhlXHJcbiAgICAgICAgLy8gZGlzY29yZElkIG9uIGEgcGVuZGluZyBiYXNpcyBhbmQgbGV0IHRoZSBjbGllbnQgY2FsbCBsb2dpbl9hc19ndWVzdCBmaXJzdCxcclxuICAgICAgICAvLyB3aGljaCBjcmVhdGVzIHRoZSBVc2VySWRlbnRpdHkuIFRoZW4gdGhpcyByZWR1Y2VyIHVwZ3JhZGVzIGl0LlxyXG4gICAgICAgIC8vXHJcbiAgICAgICAgLy8gRm9yIHRoaXMgdG8gd29yaywgdGhlIGNsaWVudCBmbG93IG11c3QgYmU6XHJcbiAgICAgICAgLy8gICAxLiBDbGllbnQgY29ubmVjdHMg4oaSIGxvZ2luX2FzX2d1ZXN0IChjcmVhdGVzIFVzZXJJZGVudGl0eSArIGd1ZXN0IFVzZXIpXHJcbiAgICAgICAgLy8gICAyLiBDbGllbnQgYXV0aGVudGljYXRlcyBEaXNjb3JkIOKGkiBBUEkgcm91dGUgY2FsbHMgc2VydmVyX2xpbmtfZGlzY29yZFxyXG4gICAgICAgIC8vXHJcbiAgICAgICAgLy8gU2luY2UgbG9naW5fYXNfZ3Vlc3QgYWx3YXlzIHJ1bnMgZmlyc3QgKEF1dGhHYXRlKSwgdGhlIG1hcHBpbmcgd2lsbCBleGlzdC5cclxuICAgICAgICB0aHJvdyBuZXcgU2VuZGVyRXJyb3IoJ0lkZW50aXR5IG5vdCByZWdpc3RlcmVkLiBDYWxsIGxvZ2luX2FzX2d1ZXN0IGZpcnN0LicpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENhc2UgMzogU2FtZSBwcm9ibGVtIOKAlCBjYW4ndCBjcmVhdGUgVXNlcklkZW50aXR5IHdpdGhvdXQgdGhlIElkZW50aXR5IG9iamVjdC5cclxuICAgIHRocm93IG5ldyBTZW5kZXJFcnJvcignSWRlbnRpdHkgbm90IHJlZ2lzdGVyZWQuIENhbGwgbG9naW5fYXNfZ3Vlc3QgZmlyc3QuJyk7XHJcbn0pO1xyXG5cclxuLyoqXHJcbiAqIFNlcnZlci1vbmx5IHJlZHVjZXI6IHByb21vdGUgYSB1c2VyIHRvIEFkbWluIHJvbGUuXHJcbiAqIENhbGxlZCB2aWE6IG5weCB0c3ggc2NyaXB0cy9wcm9tb3RlLWFkbWluLnRzIDx1c2VybmFtZT5cclxuICovXHJcbmV4cG9ydCBjb25zdCBzZXJ2ZXJfcHJvbW90ZV9hZG1pbiA9IHNwYWNldGltZWRiLnJlZHVjZXIoe1xyXG4gICAgdXNlcm5hbWU6IHQuc3RyaW5nKCksXHJcbn0sIChjdHgsIHsgdXNlcm5hbWUgfSkgPT4ge1xyXG4gICAgcmVxdWlyZVNlcnZlcihjdHgpO1xyXG5cclxuICAgIGlmICghdXNlcm5hbWUgfHwgdXNlcm5hbWUubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IFNlbmRlckVycm9yKCd1c2VybmFtZSBpcyByZXF1aXJlZCcpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEZpbmQgdXNlciBieSBpdGVyYXRpbmcgKHVzZXJuYW1lIGlzIHVuaXF1ZSBidXQgbm90IGluZGV4ZWQgZm9yIGZpbHRlcilcclxuICAgIGxldCB0YXJnZXRVc2VyOiBhbnkgPSBudWxsO1xyXG4gICAgZm9yIChjb25zdCByb3cgb2YgY3R4LmRiLlVzZXIuaXRlcigpKSB7XHJcbiAgICAgICAgaWYgKHJvdy51c2VybmFtZSA9PT0gdXNlcm5hbWUpIHtcclxuICAgICAgICAgICAgdGFyZ2V0VXNlciA9IHJvdztcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICghdGFyZ2V0VXNlcikge1xyXG4gICAgICAgIHRocm93IG5ldyBTZW5kZXJFcnJvcihgVXNlciBcIiR7dXNlcm5hbWV9XCIgbm90IGZvdW5kYCk7XHJcbiAgICB9XHJcblxyXG4gICAgY3R4LmRiLlVzZXIuaWQudXBkYXRlKHtcclxuICAgICAgICAuLi50YXJnZXRVc2VyLFxyXG4gICAgICAgIHJvbGU6IHsgdGFnOiAnQWRtaW4nIH0sXHJcbiAgICB9KTtcclxufSk7XHJcbiIsImltcG9ydCBzcGFjZXRpbWVkYiBmcm9tICcuL3NjaGVtYSc7XHJcbmV4cG9ydCB7IGJyb2FkY2FzdF9jdXJzb3IgfSBmcm9tICcuL3JlZHVjZXJzL2N1cnNvcic7XHJcbmV4cG9ydCB7IGxvZ2luX2FzX2d1ZXN0IH0gZnJvbSAnLi9yZWR1Y2Vycy9hdXRoJztcclxuZXhwb3J0IHsgZGVsZXRlX2d1ZXN0X2FjY291bnQsIHVwZGF0ZV9kaXNwbGF5X25hbWUsIHVwZGF0ZV91c2VybmFtZSwgdXBkYXRlX2F2YXRhciB9IGZyb20gJy4vcmVkdWNlcnMvcHJvZmlsZSc7XHJcbmV4cG9ydCB7IHJlZ2lzdGVyX3NlcnZlciwgc2VydmVyX2xpbmtfZGlzY29yZCwgc2VydmVyX3Byb21vdGVfYWRtaW4gfSBmcm9tICcuL3JlZHVjZXJzL3NlcnZlcic7XHJcblxyXG5zcGFjZXRpbWVkYi5jbGllbnRDb25uZWN0ZWQoKGN0eCkgPT4ge1xyXG4gIGNvbnNvbGUubG9nKGBDbGllbnQgY29ubmVjdGVkOiAke2N0eC5zZW5kZXIudG9IZXhTdHJpbmcoKX1gKTtcclxufSk7XHJcblxyXG5zcGFjZXRpbWVkYi5jbGllbnREaXNjb25uZWN0ZWQoKGN0eCkgPT4ge1xyXG4gIGNvbnNvbGUubG9nKGBDbGllbnQgZGlzY29ubmVjdGVkOiAke2N0eC5zZW5kZXIudG9IZXhTdHJpbmcoKX1gKTtcclxufSk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBzcGFjZXRpbWVkYjsiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxJQUFJQSxhQUFXLE9BQU87QUFDdEIsSUFBSUMsY0FBWSxPQUFPO0FBQ3ZCLElBQUlDLHFCQUFtQixPQUFPO0FBQzlCLElBQUlDLHNCQUFvQixPQUFPO0FBQy9CLElBQUlDLGlCQUFlLE9BQU87QUFDMUIsSUFBSUMsaUJBQWUsT0FBTyxVQUFVO0FBQ3BDLElBQUlDLGdCQUFjLElBQUksUUFBUSxTQUFTLFlBQVk7QUFDakQsUUFBTyxRQUFRLEdBQUcsR0FBR0gsb0JBQWtCLEdBQUcsQ0FBQyxNQUFNLE1BQU0sRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFLFNBQVMsSUFBSSxFQUFFLElBQUk7O0FBRTdGLElBQUlJLGlCQUFlLElBQUksTUFBTSxRQUFRLFNBQVM7QUFDNUMsS0FBSSxRQUFRLE9BQU8sU0FBUyxZQUFZLE9BQU8sU0FBUyxZQUN0RDtPQUFLLElBQUksT0FBT0osb0JBQWtCLEtBQUssQ0FDckMsS0FBSSxDQUFDRSxlQUFhLEtBQUssSUFBSSxJQUFJLElBQUksUUFBUSxPQUN6QyxhQUFVLElBQUksS0FBSztHQUFFLFdBQVcsS0FBSztHQUFNLFlBQVksRUFBRSxPQUFPSCxtQkFBaUIsTUFBTSxJQUFJLEtBQUssS0FBSztHQUFZLENBQUM7O0FBRXhILFFBQU87O0FBRVQsSUFBSU0sYUFBVyxLQUFLLFlBQVksWUFBWSxTQUFTLE9BQU8sT0FBT1IsV0FBU0ksZUFBYSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUVHLGNBS25HLGNBQWMsQ0FBQyxPQUFPLENBQUMsSUFBSSxhQUFhTixZQUFVLFFBQVEsV0FBVztDQUFFLE9BQU87Q0FBSyxZQUFZO0NBQU0sQ0FBQyxHQUFHLFFBQ3pHLElBQ0Q7QUEyS0QsSUFBSSwyQkFBMkJPLFVBeEtO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