import 'hackforplay/core';
import * as sequence from 'sequence';
import map from './map';

/* ここの部分は選手には見えません
 * デバッグ中につき魔道書は最初から表示されています
 */
var mTresureBoxScore = 50;

async function gameFunc() {
	resetMap();

	const player = (self.player = new Player()); // プレイヤーをつくる
	player.locate(1, 1); // はじめの位置
	player.on(('▼ イベント', 'こうげきするとき'), event => {
		const 使い手 = event.target;
		const ビーム = new RPGObject();
		ビーム.mod(('▼ スキン', Hack.assets.energyBall));
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

	// せつめい
	const description = new enchant.Sprite(388, 224);
	description.image = game.assets['resources/start_message_02'];
	description.moveTo(46, 48);
	Hack.menuGroup.addChild(description);

	const startButton = new enchant.Sprite(120, 32);
	startButton.image = game.assets['resources/start_button'];
	startButton.moveTo(180, 220);
	Hack.menuGroup.addChild(startButton);
	startButton.ontouchstart = () => {
		Hack.menuGroup.removeChild(description);
		Hack.menuGroup.removeChild(startButton);
		// タイマー開始
		Hack.startTimer();
	};

	Hack.on('gameclear', function () {
		// 一旦削除
		const score = Hack.score;
		Hack.scoreLabel.score = 0;
		Hack.menuGroup.removeChild(Hack.scoreLabel);
		setTimeout(() => {
			// スコアラベル表示
			Hack.scoreLabel.moveBy(0, 210);
			Hack.overlayGroup.addChild(Hack.scoreLabel);
			Hack.scoreLabel.score = score;
		}, 1000);

		// 次へボタン
		const nextButton = new enchant.Sprite(120, 32);
		nextButton.image = game.assets['resources/next_button'];
		nextButton.moveTo(180, 260);
		nextButton.ontouchstart = () => {
			// stage 3 へ
			feeles.replace('stages/3/index.html');
		};

		setTimeout(() => {		
			Hack.overlayGroup.addChild(nextButton);		
		}, 4000);
	});

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
	for (var i=3; i<=13; i+=2) {
		for (var j=2; j<100; j+=2) {
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
