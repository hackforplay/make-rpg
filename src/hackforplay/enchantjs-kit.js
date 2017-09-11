import 'enchantjs/enchant';
import 'enchantjs/ui.enchant';
import 'enchantjs/fix';

// enchant.js wrapper for HackforPlay
// v1.0

// すべてのenchantモジュールをグローバルにエクスポート
enchant();

// スクリーンのサイズを定義
feeles.env.VIEW = {
	width: 480,
	height: 320,
};

// コアインスタンスを生成
window.Hack = new EventTarget();
window.game = new Core(feeles.env.VIEW.width, feeles.env.VIEW.height);



// Hack.start
Hack.start = function() {


	// game start
	Hack.dispatchEvent(new Event('load'));
	game.start();
	window.focus();

};


// リサイズ時にゲームの scale を調節
document.documentElement.style.overflow = 'hidden';
window.addEventListener('resize', function() {
	var fWidth = parseInt(window.innerWidth, 10),
		fHeight = parseInt(window.innerHeight, 10);
	if (fWidth && fHeight) {
		game.scale = Math.min(
			fWidth / game.width,
			fHeight / game.height
		);
	} else {
		game.scale = 1;
	}
});

// クリック時に再度フォーカス
Hack.focusOnClick = true;
window.addEventListener('click', function() {
	if (Hack.focusOnClick) {
		window.document.activeElement.blur(); // Blur an enchantBook
		window.parent.focus(); // Blur an input in parent window
		window.focus(); // focus game
	}
});

// 'capture' メッセージを受けてcanvasの画像を返す
window.addEventListener('message', function(event) {
	if (typeof event.data === 'object' && event.data.query === 'capture') {
		var canvas;
		try {
			canvas = enchant.Core.instance.currentScene._layers.Canvas._element;
		} catch (e) {
			if (!game.ready) {
				game.on('load', send);
			}
			return;
		}
	}
	send();

	function send() {
		return;
		var canvas = enchant.Core.instance.currentScene._layers.Canvas._element;
		event.source.postMessage({
			query: event.data.responseQuery,
			value: canvas.toDataURL(),
			width: canvas.width,
			height: canvas.height,
		}, event.origin);
	}
});

// TODO: enchant.jsで利用するメンバのヒントを親ウィンドウに投げる
