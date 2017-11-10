/**
 * 一般的なカナか判別する
 * @param {string} char 判定する文字
 * @return {boolean} 結果
 */
export function isStandardKana(char) {
	// 複雑なカナが含まれている
	if (/[ゕヵゖヶゎヮゐヰゑヱ]/.test(char)) return false;
	return char.match(/[ぁ-んァ-ン]/);
}

/**
 * 文字列を LCC に変換する
 * @param {string} string 変換する文字列
 * @return {string} 結果
 */
export function toLowerCamelCase(string) {
	return string.at(0).toLowerCase() + string.substr(1);
}

/**
 * 文字列を UCC に変換する
 * @param {string} string 変換する文字列
 * @return {string} 結果
 */
export function toUpperCamelCase(string) {
	return string.at(0).toUpperCase() + string.substr(1);
}

/**
 * 文字列を分割して配列にする
 * @param {string} str 分割する文字列
 * @return {array} 文字列を分割した結果
 */
export function stringToArray(string) {
	return string.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[^\uD800-\uDFFF]/g) || [];
}
