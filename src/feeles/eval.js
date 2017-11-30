import enchant from '../enchantjs/enchant';
import Hack from '../hackforplay/hack';
import * as sequence from '../sequence';
import workerJs from 'raw-loader!worker';

// コードを受け取ってから実行を開始するまでの待機時間
window.WAIT_TIME = 3000;

// setTimeout の戻り値を保持する
let timerId;

export default function (code) {
	// 魔道書の実行をフック

	// 前回の Worker をとじる
	kill();
			
	// ゲーム終了後は eval できない
	if (!Hack.isPlaying) return;
	
	// 魔道書実行イベントを発行
	Hack.dispatchEvent(new Event('code'));
		
	// 待機してからスタート
	clearInterval(timerId);
	timerId = feeles.setTimeout(() => {

		// RUN!
		run(code);

	}, window.WAIT_TIME);	
}

// もう一つのスレッドを保持する変数
// null でないとき: thread が running
let worker = null;

// ['attack', 'dash', ...]
const asyncMethodKeywords = Object.keys(sequence);
// 特定の関数がコールされているとき、そこに await キーワードを付け足す
// /(attack|dash|...)\(/g
const regExp = new RegExp(`($${asyncMethodKeywords.join('|')})\\(`,  'g');

function run(code) {
	try {
		// workerJs とがっちゃんこして,
		// 全体を async function で囲み, await を補完
		code = `${workerJs}
(async function () {
	${code.replace(regExp, 'await $1(')}
})()`;

		// code (javascript) が取得できる URL
		const url = URL.createObjectURL(
			new Blob([code], { type: 'text/javascript' })
		);

		// 前回の Worker をとじる
		kill();
		
		// 実行開始!
		worker = new Worker(url);

		// Worker から受け取ったリクエストを処理し,
		// 終わり次第メッセージを返す
		worker.addEventListener('message', event => {
			const { id, name, args } = event.data;
			// Worker 側から指定されたメソッドをコール
			sequence[name](...args).then(() => {
				event.target.postMessage({
					id
				});
			});
		});

		worker.addEventListener('error', error => {
			// もう一度メインスレッドで例外を投げる
			throw error;
		});

	} catch (error) {
		// Hack.onerror を発火
		const Event = enchant.Event;
		const errorEvent = new Event('error');
		errorEvent.target = Hack;
		errorEvent.error = error;
		Hack.dispatchEvent(errorEvent);
	}
}

// 現在実行中のプロセス（Workerをkill）
export function kill () {
	if (worker) {
		// worker が running なら
		worker.terminate();
		worker = null;			
	}
}