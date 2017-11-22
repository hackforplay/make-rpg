/* global Hack, Player, feeles, _kきし  */
import 'hackforplay/core';
import * as sequens  from 'sequens';

/* ここの部分は選手には見えません
 * デバッグ中につき魔道書は最初から表示されています
 */

async function gameFunc() {

	Hack.changeMap('map1'); // map1 をロード

	const player = self.player = new Player(); // プレイヤーをつくる
	player.mod(('▼ スキン', _kきし)); // 見た目
	player.locate(3, 5); // はじめの位置
	/*+ スキル */

	// 魔道書のコードをひらく
	feeles.openCode('code.js');

	// プレイヤーを挿入する
	for (const key of Object.keys(sequens)) {
		feeles.exports.push({
			[key]: sequens[key](player)
		});
	}

	/*+ モンスター アイテム せっち システム */
}

export default gameFunc;
