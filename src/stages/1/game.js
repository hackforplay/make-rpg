import 'hackforplay/core';
import * as sequence from 'sequence';

/* ここの部分は選手には見えません
 * デバッグ中につき魔道書は最初から表示されています
 */
var mCoinScore = 1;

async function gameFunc() {
	resetMap();

	const player = self.player = new Player(); // プレイヤーをつくる
	player.locate(2, 1); // はじめの位置
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
	window.WAIT_TIME = 3000;

	// ゲーム時間設定
	window.TIME_LIMIT = 180 * 1000;

	// タイマー開始
	Hack.startTimer();

	// 魔道書のコードをひらく
	feeles.openCode('stages/1/code.js');

	for (const key of Object.keys(sequence)) {
		// コード側から使えるようにする
		feeles.setAlias(key, sequence[key]);
	}

}

function resetMap() {


	const map1 = Hack.createMap(`
		10|10|10|10|10|10|10|10|10|10|10|10|10|10|10|
		10|00 00 00 00 00 00 00 00 00 00 00 00 00 10|
		10|10|10|10|10|10|10|10|10|10|10|10|10|00 10|
		10|00 00 00 00 00 00 00 00 00 00 00 10|00 10|
		10|00 10|10|10|10|10|10|10|10|10|00 10|00 10|
		10|00 10|00 00 00 00 00 00 00 10|00 10|00 10|
		10|00 10|00 00 00 00 00 00 00 00 00 10|00 10|
		10|00 10|10|10|10|10|10|10|10|10|10|10|00 10|
		10|00 00 00 00 00 00 00 00 00 00 00 00 00 10|
		10|10|10|10|10|10|10|10|10|10|10|10|10|10|10|
	`);
	Hack.maps.map1 = map1;

	Hack.changeMap('map1'); // map1 をロード
	
	const itemStairs1 = new RPGObject();
	itemStairs1.mod(('▼ スキン', _nのぼりかいだん));
	itemStairs1.locate(1, 1, 'map1');
	itemStairs1.layer = RPGMap.Layer.Under;

	const itemStairs2 = new RPGObject();
	itemStairs2.mod(('▼ スキン', _kくだりかいだん));
	itemStairs2.locate(9, 5, 'map1');
	itemStairs2.layer = RPGMap.Layer.Under;
	itemStairs2.on(('▼ イベント', 'のった'), () => {
		resetMap();
		Hack.floorLabel.score++;
		player.locate(2, 1); // はじめの位置
	});

	const itemBook = new RPGObject();
	itemBook.mod(('▼ スキン', _m魔道書));
	itemBook.locate(3, 1);
	itemBook.on(('▼ イベント', 'のった'), () => {
		// 魔道書のコードをひらく
		feeles.openCode('stages/1/code.js');

		// なくなる
		itemBook.destroy();
	});

	// コインを置きまくる
	for (var i=4; i<=13; i++) {
		putCoin(i, 1);
	}
	for (var j=2; j<=8; j++) {
		putCoin(13, j);
	}
	for (var i=1; i<=12; i++) {
		putCoin(i, 8);
	}
	for (var j=3; j<=7; j++) {
		putCoin(1, j);
	}
	for (var i=2; i<=11; i++) {
		putCoin(i, 3);
	}
	for (var j=4; j<=6; j++) {
		putCoin(11, j);
	}
	for (var i=3; i<=10; i++) {
		putCoin(i, 6);
	}
	for (var i=3; i<=8; i++) {
		putCoin(i, 5);
	}
	/*+ モンスター アイテム せっち システム */

}

function putCoin(x, y) {
	const itemCoin1 = new RPGObject();
	itemCoin1.mod(('▼ スキン', _kコイン));
	itemCoin1.locate(x, y, 'map1');
	itemCoin1.onplayerenter = () => {
		itemCoin1.destroy();
		Hack.score += mCoinScore;
	};
}


Hack.onreset = function() {
	resetMap();
	player.locate(2, 1); // はじめの位置
};

export default gameFunc;
