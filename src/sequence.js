/* global Hack:false, feeles:false */

// シーケンスオブジェクトが入るキュー
// 魔道書実行時にすべてのシーケンスが追加され、
// 以降は次の魔道書実行時まで追加されない
const queue = [];

// コードを受け取ってから実行を開始するまでの待機時間
window.WAIT_TIME = 3000;

// 魔道書の実行をハンドルする
feeles.connected.then(({ port }) => {
	// ChannelMessage の port
	port.addEventListener('message', e => {
		// shot: コードをおくる
		if (e.data.query === 'shot') {
			// キューをリセット
			queue.splice(0,	 queue.length);
			// 魔道書実行イベントを発行
			const event = new Event('code');
			Hack.dispatchEvent(event);
			// 待機してからスタート
			setTimeout(() => {
				if (!window.player) {
					throw new Error('sequence: player is not found');
				}
				Hack.log('start!');
				next(window.player);
			}, window.WAIT_TIME + 10);
		}
	});
});

// 最初のシーケンスオブジェクトを実行する
// 実行後もキューはそのまま残り続ける
let cursor = 0;
const next = async player => {
	const task = queue[cursor];
	if (task) {
		console.info('runnging: ', task, cursor);
		await task(player); // タスクを実行, 終わるまで待つ
		cursor++; // カーソルをひとつ進める
		next(player);
	} else {
		// もうシーケンスが存在しない
		cursor = 0; // リセットして待機
	}
};

const wait = (time = 100) => new Promise(resolve => {
	setTimeout(resolve, time);
});

// num マス前に歩く
export const walk = num => {
	queue.push(async player => {
		await player.walk(num);
	});
};

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

// 壁にぶつかるまで高速で移動
export const dash = (num = 15) => {
	queue.push(async player => {
		// 仮実装
		player.speed = 999;
		await player.walk(num);
		player.speed = 1;
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

// num 回攻撃する
export const attack = num => {
	queue.push(async player => {
		await player.attack(num);
	});
};

// 絶対座標で移動する
export const locate = (x, y) => {
	queue.push(async () => {
		player.locate(x, y);
		await wait();
	});
};

// num 回だけシーケンスを最初からリピートする
// ただし一度過ぎ去ったあとは２重ループの実現ためにカウントをリセット
// repeat(0) ... リピートしない。つねにスルー
// repeat(1) ... １回目はリピート, ２回目はスルー, ３回目はリピート...
// repeat(2) ... リピート, リピート, スルー, リピート, リピート, スルー...
// repeat(n) ... n + 1 の倍数回はスルー, それ以外はリピート
export const repeat = num => {
	Hack.log('repeat');
	let count = 0; // (この中だけのローカルスコープ)
	if (num < 1) return; // つねにスルー

	queue.push(() => {
		if (++count % (num + 1) > 0) {
			// n + 1 の倍数回以外
			cursor = -1; // カーソルを一番最初に戻す
		}
	});
};

