/* global Hack:false, feeles:false, RPGObject:false */

// シーケンスオブジェクトが入るキュー
// 魔道書実行時にすべてのシーケンスが追加され、
// 以降は次の魔道書実行時まで追加されない
const queue = [];

// コードを受け取ってから実行を開始するまでの待機時間
window.WAIT_TIME = 3000;
// 魔道書実行の強制停止フラグ
window.STOP_FLAG = false;
// 魔道書の詠唱中or実行中フラグ
window.IS_CHANTING = false;

// 1 フレームで走れる最大距離
const DASH_STEP_LIMIT = 3;

// 停止フラグを持った関数
class SequenceObject {
	constructor(sequence) {
		this.isStop = false;
		this.sequence = sequence;
	}
	async run(...args) {
		if (this.isStop) return;
		await this.sequence(...args);
	}
	stop() {
		this.isStop = true;
	}
}
queue.push = function(sequence) {
	Array.prototype.push.call(this, new SequenceObject(sequence));
};

// コードを送った回数
let shotCount = 0;

// 魔道書の実行をハンドルする
feeles.connected.then(({ port }) => {
	// ChannelMessage の port
	port.addEventListener('message', async ({ data }) => {
		// shot: コードをおくる
		if (data.query !== 'shot') return;
		if (!Hack.isPlaying) return;

		// console.warn('1: コードが発行されました');

		++shotCount;
		// キューをリセット
		await resetQueue();

		// 魔道書実行イベントを発行
		Hack.dispatchEvent(new Event('code'));

		// console.warn('4: 魔道書イベントを発行しました');
		// 待機してからスタート
		(function() {
			// ショットを送った回数を束縛
			const localCount = shotCount;

			setTimeout(() => {
				if (localCount !== shotCount) return;

				// console.warn('5: 魔道書を実行しました');
				if (!window.player) {
					throw new Error('sequence: player is not found');
				}
				window.STOP_FLAG = false;
				next(window.player);
			}, window.WAIT_TIME + 10);
		})();

		// 魔道書の詠唱中or実行中フラグ
		window.IS_CHANTING = true;
	});
});

let cursor = 0;
let nextResolver = null;

// シーケンスを再生中か
let isPlaying = false;

// キューをリセットする
export async function resetQueue() {

	// console.warn('2: キューをリセットします');

	window.STOP_FLAG = true;

	// 以前のキューを停止する
	queue.forEach((queue) => queue.stop());

	queue.length = 0;

	// 現在実行中のキューを待機する
	if (isPlaying) {
		await new Promise((resolve) => nextResolver = () => {
			resolve();
		});
		nextResolver = null;
	}
	isPlaying = false;
	cursor = 0;
	// console.warn('3: キューをリセットしました');
	
	// 魔道書の詠唱中or実行中フラグ
	window.IS_CHANTING = false;
}

// 最初のシーケンスオブジェクトを実行する
// 実行後もキューはそのまま残り続ける
const next = async player => {

	isPlaying = true;

	if (window.STOP_FLAG) {
		// 強制終了フラグ
		return;
	}
	const task = queue[cursor];
	if (task) {
		// console.info('runnging: ', task, cursor);
		await task.run(player); // タスクを実行, 終わるまで待つ
		cursor++; // カーソルをひとつ進める
		// next 通知
		if (nextResolver) nextResolver();

		next(player);
	} else {
		// もうシーケンスが存在しない
		isPlaying = false;
		cursor = 0; // リセットして待機

		// 魔道書の詠唱中or実行中フラグ
		window.IS_CHANTING = false;
	}
};

const wait = (time = 100) => new Promise(resolve => {
	setTimeout(resolve, time);
});

// // num マス前に歩く
// export const walk = num => {
// 	queue.push(async player => {
// 		await player.walk(num);
// 	});
// };

// 右に回転
export const turnRight = () => {
	queue.push(async player => {
		player.turn(-1);
		await wait();
	});
};

// 左に回転
export const turnLeft = () => {
	queue.push(async player => {
		player.turn(1);
		await wait();
	});
};

// num マス分高速に移動 (最大100)
// 指定がない場合は壁にぶつかるまで高速で移動
// 例外として、マップが変わったときは停止する
export const dash = (num = 100) => {
	queue.push(async player => {
		for (let moved = 1; moved <= num; moved++) {
			const { mapX, mapY, map } = player; // 移動前の値

			walkWithoutAnimation(player); // ノーフレームで１マス進む

			// 1 フレームで走れる最大距離に達したなら
			if (!(moved % DASH_STEP_LIMIT)) {
				// 1 フレーム待機する
				await new Promise((resolve) => player.setTimeout(resolve, 1));
			}
			if (player.mapX === mapX && player.mapY === mapY) {
				break; // mapX, mapY が同じなら壁と判断して終了
			}
			if (player.map !== map) {
				break; // 別のマップに移動した場合も終了
			}
		}
	});
};

// 上を向く
export const headUp = () => {
	queue.push(async player => {
		player.forward = [0, -1];
		await wait();
	});
};

// 右を向く
export const headRight = () => {
	queue.push(async player => { 
		player.forward = [1, 0];
		await wait();
	});
};

// 下を向く
export const headDown = () => {
	queue.push(async player => { 
		player.forward = [0, 1];
		await wait();
	});
};

// 左を向く
export const headLeft = () => {
	queue.push(async player => { 
		player.forward = [-1, 0];
		await wait();
	});
};

/*
// 向き変更＋移動

// 上に歩く
export function walkUp(step) {
	headUp();
	walk(step);
}

// 下に歩く
export function walkDown(step) {
	headDown();
	walk(step);
}

// 左に歩く
export function walkLeft(step) {
	headLeft();
	walk(step);
}

// 右に歩く
export function walkRight(step) {
	headRight();
	walk(step);
}

// 上に走る
export function dashUp(step) {
	headUp();
	dash(step);
}

// 下に走る
export function dashDown(step) {
	headDown();
	dash(step);
}

// 左に走る
export function dashLeft(step) {
	headLeft();
	dash(step);
}

// 右に走る
export function dashRight(step) {
	headRight();
	dash(step);
}
*/

// num 回攻撃する
export const attack = () => {
	queue.push(async player => {
		await player.attack();
	});
};

// 絶対座標で移動する
// x, y は小数点以下で切り捨てられる
export const locate = (x, y) => {
	queue.push(async player => {
		await wait(); // 進んだことが見えるように
		player.locate(x >> 0, y >> 0);
		// 階段の先へ
		player.dispatchEvent(new Event('walkend'));
		await wait(); // 進んだことが見えるように
	});
};

// num 回だけシーケンスを最初からリピートする
// ただし一度過ぎ去ったあとは２重ループの実現ためにカウントをリセット
// repeat(1) ... リピートしない。つねにスルー
// repeat(2) ... １回目はリピート, ２回目はスルー, ３回目はリピート...
// repeat(3) ... リピート, リピート, スルー, リピート, リピート, スルー...
// repeat(n) ... n + 1 の倍数回はスルー, それ以外はリピート
export const repeat = num => {
	--num;
	let count = 0; // (この中だけのローカルスコープ)
	if (num < 1) return; // つねにスルー
	num = Math.min(num, 1000); // 限界
	queue.push(() => {
		if (++count % (num + 1) > 0) {
			// n + 1 の倍数回以外
			cursor = -1; // カーソルを一番最初に戻す
		}
	});
};

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