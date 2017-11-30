/* global Hack:false, feeles:false, RPGObject:false */

import enchant from 'enchantjs/enchant';
import 'hackforplay/rpg-kit-main';

// 1 フレームで走れる最大距離
const DASH_STEP_LIMIT = 3;

// プレイヤーを非同期で取得
const _player = new Promise((resolve, reject) => {
	enchant.Core.instance.on('load', () => {
		if (!window.player) {
			reject(new Error('sequence.js: player is not found'));
		}
		resolve(window.player);
	});
});

const sleep = player => new Promise(resolve => {
	// ここの変数は調整できる
	const commonFrameDelay = 3;
	player.setTimeout(resolve, commonFrameDelay);
});

// second 秒 await する
export async function wait(second = 0.1) {
	return new Promise(resolve => {
		feeles.setTimeout(resolve, second * 1000);
	});
}

// 右に回転

export async function turnRight () {
	const player = await _player;
	player.turn(-1);
	await sleep(player);
}

// 左に回転
export async function turnLeft () {
	const player = await _player;
	player.turn(1);
	await sleep(player);
}

// num マス分高速に移動 (最大100)
// 指定がない場合は壁にぶつかるまで高速で移動
// 例外として、マップが変わったときは停止する
export async function dash (num = 100) {
	const player = await _player;

	for (let moved = 1; moved <= num; moved++) {
		const { mapX, mapY, map } = player; // 移動前の値

		walkWithoutAnimation(player); // ノーフレームで１マス進む

		// 1 フレームで走れる最大距離に達したなら
		if (!(moved % DASH_STEP_LIMIT)) {
			// 1 フレーム待機する
			await new Promise(resolve => player.setTimeout(resolve, 1));
		}
		if (player.mapX === mapX && player.mapY === mapY) {
			break; // mapX, mapY が同じなら壁と判断して終了
		}
		if (player.map !== map) {
			break; // 別のマップに移動した場合も終了
		}
	}
}

// 上を向く
export async function headUp () {
	const player = await _player;
	
	player.forward = [0, -1];
	await sleep(player);
}

// 右を向く
export async function headRight () {
	const player = await _player;

	player.forward = [1, 0];
	await sleep(player);
}

// 下を向く
export async function headDown () {
	const player = await _player;

	player.forward = [0, 1];
	await sleep(player);
}

// 左を向く
export async function headLeft () {
	const player = await _player;

	player.forward = [-1, 0];
	await sleep(player);
}

// num 回攻撃する
export async function attack () {
	const player = await _player;

	await player.attack();
}

// 絶対座標で移動する
// x, y は小数点以下で切り捨てられる
export async function locate (x, y) {
	const player = await _player;

	await sleep(player); // 進んだことが見えるように
	player.locate(x >> 0, y >> 0);
	// 階段の先へ
	player.dispatchEvent(new Event('walkend'));
	await sleep(player); // 進んだことが見えるように
}

const walkWithoutAnimation = player => {
	// マップのタイル数
	const tx = Hack.map.tileNumX;
	const ty = Hack.map.tileNumY;

	// 画面外
	if (nextX < 0 || nextX >= tx || nextY < 0 || nextY >= ty) {
		return; // 画面外なら歩かない
	}

	// タイルのサイズ
	const tw = Hack.map.tileWidth;
	const th = Hack.map.tileHeight;

	// 移動先
	const nextX = player.mapX + player.forward.x;
	const nextY = player.mapY + player.forward.y;
		
	// マップの当たり判定
	if (Hack.map.hitTest(nextX * tw, nextY * th)) {
		return;
	}

	// 歩く先にあるオブジェクト
	const hits = RPGObject.collection
		.filter((obj) => {
			return obj.isKinematic &&
					obj.collisionFlag &&
					obj.mapX === nextX &&
					obj.mapY === nextY;
		});

	// 障害物があるので歩けない
	if (hits.length) {
		return;
	}

	// 移動する
	player.moveBy(player.forward.x * tw, player.forward.y * th);
	player.dispatchEvent(new Event('walkend'));
};