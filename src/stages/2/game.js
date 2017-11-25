import 'hackforplay/core';
import * as sequence from 'sequence';

/* ここの部分は選手には見えません
 * デバッグ中につき魔道書は最初から表示されています
 */
var mTresureBoxScore = 3;

async function gameFunc() {

	resetMap();

	const player = self.player = new Player(); // プレイヤーをつくる
	player.locate(1, 1); // はじめの位置
	player.on(('▼ イベント', 'こうげきするとき'), (event) => {
		const 使い手 = event.target;
		const ビーム = new RPGObject();
		ビーム.mod(('▼ スキン', _bビーム));
		ビーム.onふれはじめた = (event) => {
			if (event.hit !== 使い手) {
				Hack.Attack(event.mapX, event.mapY, 使い手.atk);
				ビーム.destroy();
			}
		};
		使い手.shoot(ビーム, 使い手.forward, 10);
	});
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

	const itemBook = new RPGObject();
	itemBook.mod(('▼ スキン', _m魔道書));
	itemBook.locate(2, 1);
	itemBook.on(('▼ イベント', 'のった'), () => {
		// 魔道書のコードをひらく
		feeles.openCode('stages/2/code.js');
		// なくなる
		itemBook.destroy();
	});

	for (var i=2; i<=12; i+=2) {
		for (var j=3; j<100; j+=2) {
			putTresureBox(i, j);
		}
	}

	/*+ モンスター アイテム せっち システム */

}

function putTresureBox(x, y) {
	const itemBox = new RPGObject();
	itemBox.mod(('▼ スキン', _tたからばこ));
	itemBox.locate(x, y, 'map1');
	itemBox.onこうげきされた = () => {
		delete itemBox.onこうげきされた;
		itemBox.mod(('▼ スキン', _tたからばこひらいた));
		Hack.score += mTresureBoxScore;
	};
}

Hack.onreset = function() {
	resetMap();
	player.locate(1, 1); // はじめの位置
}

export default gameFunc;
