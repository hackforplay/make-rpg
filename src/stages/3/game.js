import 'hackforplay/core';
import * as sequence from 'sequence';

/* ここの部分は選手には見えません
 * デバッグ中につき魔道書は最初から表示されています
 */
var mDragonScore = 20; 
var flagGem1 = false;
var flagGem2 = false;
var flagGem3 = false;
async function gameFunc() {

	resetMap();

	const player = self.player = new Player(); // プレイヤーをつくる
	player.locate(7, 8); // はじめの位置
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
	feeles.openCode('stages/3/code.js');

	for (const key of Object.keys(sequence)) {
		// コード側から使えるようにする
		feeles.setAlias(key, sequence[key]);
	}

}

function resetMap() {
	const map1 = Hack.createMap(`
		10|10|10|10|10|10|10|10|10|10|10|10|10|10|10|
		10|08 10|08 10|08 08 08 08 08 08 08 10|10|10|
		10|08 10|08 10|08 08 08 08 08 08 08 10|10|10|
		10|08 10|08 08 08 08 08 08 08 08 08 10|08 10|
		10|08 08 08 08 08 08 08 08 08 08 08 08 08 10|
		10|08 08 08 08 08 08 08 08 08 08 08 08 08 10|
		10|08 08 08 08 08 08 08 08 08 08 08 08 08 10|
		10|10|10|10|08 08 08 08 08 10|08 08 08 08 10|
		10|10|10|08 08 08 08 08 08 10|08 08 08 08 10|
		10|10|10|10|10|10|10|10|10|10|10|10|10|10|10|
	`);
	Hack.maps.map1 = map1;

	Hack.changeMap('map1'); // map1 をロード
	
	const itemStairs = new RPGObject();
	itemStairs.mod(('▼ スキン', _kくだりかいだん));
	itemStairs.locate(7, 1, 'map1');
	itemStairs.layer = RPGMap.Layer.Under;
	itemStairs.on(('▼ イベント', 'のった'), () => {
		resetMap();
		player.locate(7, 8); // はじめの位置
	});


	const itemDragon = new RPGObject();
	itemDragon.mod(('▼ スキン', _dドラゴン));
	// itemDragon.hp = 10;
	itemDragon.atk = 1;
	itemDragon.locate(7, 5, 'map1');
	itemDragon.scale(2, 2);
	itemDragon.forward = [0, 1];
	itemDragon.setFrame('Idle', [10]);
	itemDragon.on(('▼ イベント', 'たおれたとき'), () => {
		Hack.score += mDragonScore;
	});
	itemDragon.on(('▼ イベント', 'こうげきされた'), () => {
		// 全てのフラグが立っている。
		if (flagGem1 && flagGem2 && flagGem3) {

		} 
		// そうでない＝攻撃を受け付けない
		else {
			itemGem1.color = "red";
			itemGem2.color = "red";
			itemGem3.color = "red";

			itemBarrier.tl.show().delay(10).fadeTo(0.7, 30).then(()=> {
				itemGem1.color = "brown";
				itemGem2.color = "brown";
				itemGem3.color = "brown";
			});
			// itemBarrier.tl.fadeIn(0).delay(10).fadeOut(20);
		}
	});

	const itemGem1 = new RPGObject();
	flagGem1 = false;	
	itemGem1.mod(('▼ スキン', _tつぼ));
	itemGem1.hp = 50;
	itemGem1.locate(4, 3, 'map1');
	itemGem1.tl.moveBy(0, 96, 60).moveBy(0, -96, 60).loop();
	itemGem1.on(('▼ イベント', 'たおれたとき'), () => {
		flagGem1 = true;
		if (flagGem2 && flagGem3) {
			itemDragon.hp = 999;
			itemBarrier.visible = false;
		}
	});


	const itemGem2 = new RPGObject();
	flagGem2 = false;	
	itemGem2.mod(('▼ スキン', _tつぼ));
	itemGem2.hp = 50;
	itemGem2.locate(10, 6, 'map1');
	itemGem2.tl.moveBy(0, -96, 60).moveBy(0, 96, 60).loop();
	itemGem2.on(('▼ イベント', 'たおれたとき'), () => {
		flagGem2 = true;
		if (flagGem1 && flagGem3) {
			itemDragon.hp = 999;
			itemBarrier.visible = false;
		}
	});


	const itemGem3 = new RPGObject();
	flagGem3 = false;
	itemGem3.mod(('▼ スキン', _tつぼ));
	itemGem3.hp = 50;
	itemGem3.locate(8, 2, 'map1');
	itemGem3.tl.moveBy(-64, 0, 60).moveBy(64, 0, 60).loop();
	itemGem3.on(('▼ イベント', 'たおれたとき'), () => {
		flagGem3 = true;
		if (flagGem1 && flagGem2) {
			itemDragon.hp = 999;
			itemBarrier.visible = false;
		}
	});
	const itemBarrier = new Sprite(160, 128);
	itemBarrier.image = game.assets['resources/barrier'];
	itemBarrier.moveTo(160, 96);
	itemBarrier.opacity = 0.7;
	Hack.defaultParentNode.addChild(itemBarrier);

	/*+ モンスター アイテム せっち システム */

}

export default gameFunc;
