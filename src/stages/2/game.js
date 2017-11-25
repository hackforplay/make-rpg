import 'hackforplay/core';
import * as sequence from 'sequence';

/* ここの部分は選手には見えません
 * デバッグ中につき魔道書は最初から表示されています
 */

async function gameFunc() {

	resetMap();

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
	feeles.openCode('stages/2/code.js');

	for (const key of Object.keys(sequence)) {
		// コード側から使えるようにする
		feeles.setAlias(key, sequence[key]);
	}

}

function resetMap() {
	const map1 = Hack.createMap(`
		322 322 322 322 322 322 322 322 322 322 322 322 322 322 322
		322 322 322 322 322 322 322 322 322 322 322 322 322 322 322
		322 322 322 322 322 322 322 322 322 322 322 322 322 322 322
		322 322 322 322 322 322 322 322 322 322 322 322 322 322 322
		322 322 322 322 322 322 322 322 322 322 322 322 322 322 322
		322 322 322 322 322 322 322 322 322 322 322 322 322 322 322
		322 322 322 322 322 322 322 322 322 322 322 322 322 322 322
		322 322 322 322 322 322 322 322 322 322 322 322 322 322 322
		322 322 322 322 322 322 322 322 322 322 322 322 322 322 322
		322 322 322 322 322 322 322 322 322 322 322 322 322 322 322
	`);
	Hack.maps.map1 = map1;

	Hack.changeMap('map1'); // map1 をロード
	
	const item1 = new RPGObject();
	item1.mod(('▼ スキン', _kくだりかいだん));
	item1.locate(7, 5, 'map2');
	item1.layer = RPGMap.Layer.Under;
	item1.on(('▼ イベント', 'のった'), () => {
		resetMap();
	});

	/*+ モンスター アイテム せっち システム */

}

export default gameFunc;
