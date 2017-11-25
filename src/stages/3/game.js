import 'hackforplay/core';
import * as sequence from 'sequence';

/* ここの部分は選手には見えません
 * デバッグ中につき魔道書は最初から表示されています
 */
var mDragonScore = 20; 

async function gameFunc() {

	resetMap();

	const player = self.player = new Player(); // プレイヤーをつくる
	player.locate(7, 8); // はじめの位置
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
		10|00 00 00 00 00 00 00 00 00 00 00 00 00 10|
		10|00 00 00 00 00 00 00 00 00 00 00 00 00 10|
		10|00 00 00 00 00 00 00 00 00 00 00 00 00 10|
		10|00 00 00 00 00 00 00 00 00 00 00 00 00 10|
		10|00 00 00 00 00 00 00 00 00 00 00 00 00 10|
		10|00 00 00 00 00 00 00 00 00 00 00 00 00 10|
		10|00 00 00 00 00 00 00 00 00 00 00 00 00 10|
		10|00 00 00 00 00 00 00 00 00 00 00 00 00 10|
		10|10|10|10|10|10|10|10|10|10|10|10|10|10|10|
	`);
	Hack.maps.map1 = map1;

	Hack.changeMap('map1'); // map1 をロード
	
	const item1 = new RPGObject();
	item1.mod(('▼ スキン', _kくだりかいだん));
	item1.locate(7, 1, 'map1');
	item1.layer = RPGMap.Layer.Under;
	item1.on(('▼ イベント', 'のった'), () => {
		resetMap();
	});


	const itemDragon = new RPGObject();
	itemDragon.mod(('▼ スキン', _dドラゴン));
	itemDragon.hp = 10;
	itemDragon.atk = 1;
	itemDragon.locate(7, 5, 'map1');
	itemDragon.scale(2, 2);
	itemDragon.setFrame('Idle', [10]);
	itemDragon.on(('▼ イベント', 'たおれたとき'), () => {
		Hack.score += mDragonScore;
	});

	const itemGem1 = new RPGObject();
	flagGem1 = false;	
	itemGem1.mod(('▼ スキン', _aあんこくきし));
	itemGem1.hp = 50;
	itemGem1.locate(4, 3, 'map1');
	itemGem1.endless(async(self, count) => {

		self.forward = [0, 1];

		await self.walk(); // あるく
		await self.walk(); // あるく
		await self.walk(); // あるく

		await self.wait(1); // やすむ
		self.forward = [0, -1];

		await self.walk(); // あるく
		await self.walk(); // あるく
		await self.walk(); // あるく

		await self.wait(1); // やすむ

		/*+ じどう*/
	});
	itemGem1.on(('▼ イベント', 'たおれたとき'), () => {
		flagGem1 = true;
	});


	const itemGem2 = new RPGObject();
	flagGem2 = false;	
	itemGem2.mod(('▼ スキン', _aあんこくきし));
	itemGem2.hp = 50;
	itemGem2.locate(10, 6, 'map1');
	itemGem2.endless(async(self, count) => {

		self.forward = [0, -1];

		await self.walk(); // あるく
		await self.walk(); // あるく
		await self.walk(); // あるく

		await self.wait(1); // やすむ
		self.forward = [0, 1];

		await self.walk(); // あるく
		await self.walk(); // あるく
		await self.walk(); // あるく

		await self.wait(1); // やすむ

		/*+ じどう*/
	});
	itemGem2.on(('▼ イベント', 'たおれたとき'), () => {
		flagGem2 = true;
	});


	const itemGem3 = new RPGObject();
	flagGem3 = false;
	itemGem3.mod(('▼ スキン', _aあんこくきし));
	itemGem3.hp = 50;
	itemGem3.locate(6, 2, 'map1');
	itemGem3.endless(async(self, count) => {

		self.forward = [1, 0];

		await self.walk(); // あるく
		await self.walk(); // あるく

		await self.wait(1); // やすむ
		self.forward = [-1, 0];

		await self.walk(); // あるく
		await self.walk(); // あるく

		await self.wait(1); // やすむ

		/*+ じどう*/
	});
	itemGem3.on(('▼ イベント', 'たおれたとき'), () => {
		flagGem3 = true;
	});

	/*+ モンスター アイテム せっち システム */

}

export default gameFunc;
