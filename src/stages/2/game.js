import 'hackforplay/core';
import * as sequence from 'sequence';

/* ここの部分は選手には見えません
 * デバッグ中につき魔道書は最初から表示されています
 */
var mCoinScore = 3;

async function gameFunc() {

	resetMap();

	const player = self.player = new Player(); // プレイヤーをつくる
	player.locate(2, 1); // はじめの位置
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
		10|10|10|10|10|10|10|10|10|10|10|10|10|10|10|
		10|03 03 03 03 03 03 03 03 03 03 03 03 03 10|
		10|03 03 03 03 03 03 03 03 03 03 03 03 03 10|
		10|03 03 03 03 03 03 03 03 03 03 03 03 03 10|
		10|03 03 03 03 03 03 03 03 03 03 03 03 03 10|
		10|03 03 03 03 03 03 03 03 03 03 03 03 03 10|
		10|03 03 03 03 03 03 03 03 03 03 03 03 03 10|
		10|03 03 03 03 03 03 03 03 03 03 03 03 03 10|
		10|03 03 03 03 03 03 03 03 03 03 03 03 03 10|
		10|03 03 03 03 03 03 03 03 03 03 03 03 03 10|
		10|03 03 03 03 03 03 03 03 03 03 03 03 03 10|
		10|03 03 03 03 03 03 03 03 03 03 03 03 03 10|
		10|03 03 03 03 03 03 03 03 03 03 03 03 03 10|
		10|03 03 03 03 03 03 03 03 03 03 03 03 03 10|
		10|03 03 03 03 03 03 03 03 03 03 03 03 03 10|
		10|03 03 03 03 03 03 03 03 03 03 03 03 03 10|
		10|03 03 03 03 03 03 03 03 03 03 03 03 03 10|
		10|03 03 03 03 03 03 03 03 03 03 03 03 03 10|
		10|03 03 03 03 03 03 03 03 03 03 03 03 03 10|
		10|03 03 03 03 03 03 03 03 03 03 03 03 03 10|
		10|03 03 03 03 03 03 03 03 03 03 03 03 03 10|
		10|03 03 03 03 03 03 03 03 03 03 03 03 03 10|
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

	for (var i=2; i<=12; i+=2) {
		for (var j=3; i<=100; i+=2) {
		putCoin(i, j);
	}

	/*+ モンスター アイテム せっち システム */

}

function putTresureBox(x, y) {
	const itemBox = new RPGObject();
	itemBox.mod(('▼ スキン', _tたからばこ));
	itemBox.locate(x, y, 'map1');
	itemBox.onplayerenter = () => {
		itemBox.destroy();
		Hack.score += mTresureBoxScore;
	}

}

export default gameFunc;
