import 'hackforplay/core';
import * as sequence from 'sequence';

/* ここの部分は選手には見えません
 * デバッグ中につき魔道書は最初から表示されています
 */

async function gameFunc() {

	Hack.changeMap('map1'); // map1 をロード

	const player = self.player = new Player(); // プレイヤーをつくる
	player.mod(('▼ スキン', _kきし)); // 見た目
	player.locate(3, 5); // はじめの位置
	/*+ スキル */

	// さいしょの向きをかえる
	player.turn(1);

	// 詠唱待ち時間設定
	window.WAIT_TIME = 0;

	Hack.oncode = () => {
		Hack.log('まどうしょがじっこうされた！');
	};

	// 魔道書のコードをひらく
	feeles.openCode('code.js');

	for (const key of Object.keys(sequence)) {
		// コード側から使えるようにする
		feeles.setAlias(key, sequence[key]);
	}


	const item1 = new RPGObject();
	item1.mod(('▼ スキン', _tつちかべ));
	item1.locate(8, 5, 'map1');

	/*+ モンスター アイテム せっち システム */
}

export default gameFunc;
