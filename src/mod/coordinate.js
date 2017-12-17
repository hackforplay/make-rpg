// マウスで指した場所の座標がつねに表示される
import enchant from 'enchantjs/enchant';
import Hack from 'hackforplay/hack';
import 'hackforplay/core';

const game = enchant.Core.instance;
const { MutableText } = enchant.ui;

game.on('load', () => {
	if (Hack.coordinateLabel) {
		// すでに coordinateLabel が存在していた
		throw new Error('Hack.coordinateLabel has already exist');
	}

	// ラベルを初期化
	const label = new MutableText(360, 300);
	// Hack に参照を追加
	Hack.coordinateLabel = label;
	// クリックの邪魔にならないように
	label.touchEnabled = false;

	// マウスの位置を追跡
	game._element.addEventListener('mousemove', event => {
		const { clientX, clientY } = event;
		const rect = Hack.camera.getRenderRect();

		// "2 3" のように表示
		label.text = [
			((clientX + rect.x) / 32) >> 0,
			((clientY + rect.y) / 32) >> 0
		].join(' ');
		// マウスの位置より上にラベルをおく
		const x = clientX - label.width / 2; // マウスの中心
		label.moveTo(x, clientY);
	});

	// フォーカスが外れたら非表示にする
	window.addEventListener('focus', () => {
		label.visible = true;
	});
	window.addEventListener('blur', () => {
		label.visible = false;
	});

	Hack.menuGroup.addChild(label);
});
