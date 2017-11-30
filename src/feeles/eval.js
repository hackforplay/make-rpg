import enchant from '../enchantjs/enchant';
import Hack from '../hackforplay/hack';
import * as sequence from '../sequence';

// コードを受け取ってから実行を開始するまでの待機時間
window.WAIT_TIME = 3000;

// 魔道書実行の強制停止フラグ
window.STOP_FLAG = false;

// setTimeout の戻り値を保持する
let timerId;

export default function (code) {
	// 魔道書の実行をフック

	// ゲーム終了後は eval できない
	if (!Hack.isPlaying) return;
	
	// 魔道書実行イベントを発行
	Hack.dispatchEvent(new Event('code'));
		
	// 待機してからスタート
	clearInterval(timerId);
	timerId = feeles.setTimeout(() => {

		window.STOP_FLAG = false;

		// RUN!
		run(code);

	}, window.WAIT_TIME);	
}

// ['attack', 'dash', ...]
const asyncMethodKeywords = Object.keys(sequence);
// 特定の関数がコールされているとき、そこに await キーワードを付け足す
// /(attack|dash|...)\(\)/g
const regExp = new RegExp(`($${asyncMethodKeywords.join('|')})\\(\\)`,  'g');

function run(code) {
	try {
		// <<<< 全体を async function で囲み, await を補完 >>>>
		code = `
(async function () {
	${code.replace(regExp, 'await $1()')}
})()`;

		// eval
		eval(code);

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
	// 魔道書実行の強制停止フラグ
	window.STOP_FLAG = true;
	
	// WIP
}