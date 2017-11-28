import 'hackforplay/core';
import * as sequence from 'sequence';

/* ここの部分は選手には見えません
 * デバッグ中につき魔道書は最初から表示されています
 */
var mCoinScore = 1;

async function gameFunc() {
	resetMap();

	const player = self.player = new Player(); // プレイヤーをつくる
	player.locate(1, 4); // はじめの位置
	player.on(('▼ イベント', 'こうげきするとき'), (event) => {
		const 使い手 = event.target;
		const ビーム = new RPGObject();
		ビーム.mod(('▼ スキン', Hack.assets.energyBall));
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
	player.forward = [1, 0];

	// 詠唱待ち時間設定
	window.WAIT_TIME = 3000;

	// ゲーム時間設定（練習用ステージは時間なし）
	window.TIME_LIMIT = 0;

	// せつめい
	const description = new enchant.Sprite(388, 224);
	description.image = game.assets['resources/start_message_01'];
	description.moveTo(46, 48);
	Hack.menuGroup.addChild(description);

	const startButton = new enchant.Sprite(120, 32);
	startButton.image = game.assets['resources/start_button'];
	startButton.moveTo(180, 220);
	Hack.menuGroup.addChild(startButton);
	startButton.ontouchstart = () => {
		Hack.menuGroup.removeChild(description);
		Hack.menuGroup.removeChild(startButton);
	};

	// 魔道書のコードをひらく
	feeles.openCode('training/code.js');

	for (const key of Object.keys(sequence)) {
		if (key !== 'resetQueue') {
			// コード側から使えるようにする
			feeles.setAlias(key, sequence[key]);
		}
	}

}

function resetMap() {


	const map1 = Hack.createMap(`
		10|10|10|10|10|10|10|10|10|10|10|10|10|10|10|
		10|00 00 00 00 00 00 00 00 00 10|00 10|00 10|
		10|00 00 00 00 00 00 00 00 00 10|00 10|00 10|
		10|00 00 00 00 00 00 00 00 00 10|00 10|00 10|
		10|00 00 00 00 00 00 00 00 00 10|00 10|00 10|
		10|00 00 00 00 00 00 00 00 00 10|00 10|00 10|
		10|00 00 00 00 00 00 00 00 00 10|00 10|00 10|
		10|00 00 00 00 00 00 00 00 00 10|00 10|00 10|
		10|00 00 00 00 00 00 00 00 00 10|00 10|00 10|
		10|10|10|10|10|10|10|10|10|10|10|10|10|10|10|
	`);
	Hack.maps.map1 = map1;

	Hack.changeMap('map1'); // map1 をロード

	const stair1 = new RPGObject();
	stair1.mod(('▼ スキン', _kくだりかいだん));
	stair1.locate(13, 8, 'map1');
	stair1.layer = RPGMap.Layer.Under;
	stair1.on(('▼ イベント', 'のった'), async () => {
		resetMap();
		Hack.floorLabel.score++;
		player.locate(1, 4); // はじめの位置
	});


	// コインと宝箱
	for (var i=2; i<=8; i++) {
		putCoin(i, 4);
	}
	const box = new RPGObject();
	box.mod(('▼ スキン', _tたからばこ));
	box.locate(9, 4, 'map1');
	box.onこうげきされた = () => {
		delete box.onこうげきされた;
		box.mod(('▼ スキン', _tたからばこひらいた));
		Hack.score += 10;
	};

	// 壁の奥のコイン
	for (var y = 1; y <= 7; y++) {
		putCoin(13, y);
	}

	// とくに意味のないつぼ
	[
		[9, 7], [11, 7],
		[8, 8], [9, 8], [11, 8]
	].forEach(([x, y]) => {
		const pot = new RPGObject();
		pot.mod(('▼ スキン', _tつぼ));
		pot.locate(x, y, 'map1');
		pot.onこうげきされた = () => {
			pot.destroy();
		};
	});
	
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
	player.locate(1, 4); // はじめの位置
	player.forward = [1, 0];
};

export default gameFunc;
