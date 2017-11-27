import 'hackforplay/core';
import * as sequence from 'sequence';
import map from './map';

/* ここの部分は選手には見えません
 * デバッグ中につき魔道書は最初から表示されています
 */
var mTresureBoxScore = 5;

async function gameFunc() {
	resetMap();

	const player = (self.player = new Player()); // プレイヤーをつくる
	player.locate(1, 1); // はじめの位置
	player.on(('▼ イベント', 'こうげきするとき'), event => {
		const 使い手 = event.target;
		const ビーム = new RPGObject();
		ビーム.mod(('▼ スキン', _bビーム));
		ビーム.onふれはじめた = event => {
			if (event.hit !== 使い手) {
				Hack.Attack(event.mapX, event.mapY, 使い手.atk);
				ビーム.destroy();
			}
		};
		使い手.shoot(ビーム, 使い手.forward, 10);
	});
	/*+ スキル */

	// さいしょの向きをかえる
	player.forward = [0, 1];

	// 詠唱待ち時間設定
	window.WAIT_TIME = 3000;

	// ゲーム時間設定
	window.TIME_LIMIT = 300 * 1000;

	// タイマー開始
	Hack.startTimer();

	// 魔道書のコードをひらく
	feeles.openCode('stages/2/code.js');

	for (const key of Object.keys(sequence)) {
		if (key !== 'resetQueue') {
			// コード側から使えるようにする
			feeles.setAlias(key, sequence[key]);
		}
	}
}

function resetMap() {
	const map1 = Hack.createMap(map);
	Hack.maps.map1 = map1;

	Hack.changeMap('map1'); // map1 をロード

	for (var i = 3; i <= 13; i += 2) {
		for (var j = 3; j < 100; j += 2) {
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
	player.forward = [0, 1];
};

export default gameFunc;
