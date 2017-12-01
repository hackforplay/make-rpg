const methodNames = [
	'wait',
	'turnRight',
	'turnLeft',
	'dash',
	'headUp',
	'headRight',
	'headDown',
	'headLeft',
	'attack',
	'locate',
];

// { [id]: resolve() }
const resolveStore = {};

// メインスレッドと通信
// (実際の処理はメインスレッドで行う)
self.addEventListener('message', function(event) {
	const resolve = resolveStore[event.data.id];
	if (resolve) {
		// 登録された Promise を終わらせる
		resolve();
	} else {
		// かならず存在しているはず. 何かがおかしい
		const error = new Error('worker.js: resolve function not found');
		error.messageEvent = event;
		throw error;
	}
});

// methodNames をグローバルにエクスポート
for (const name of methodNames) {
	self[name] = (...args) => {
		// ユニークな数値 (timeoutId) を生成するハック
		const id = setTimeout(() => {});
	
		const promise = new Promise(resolve => {
			// resolve する関数を外のストアに保持
			// メインスレッドの処理が終わったらメッセージを受け取ってコールする
			resolveStore[id] = resolve;
		});

		// メインスレッドに処理スタートを依頼する
		self.postMessage({
			id,
			name,
			args
		});

		// これが終わるまでは await
		return promise;
	};
}
