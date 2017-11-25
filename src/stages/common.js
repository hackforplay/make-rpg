/* global enchant, game */
// 全てのステージに共通する処理

import Hack from 'hackforplay/hack';
import { Event } from 'enchantjs/enchant';
import { resetQueue } from 'sequence';

const common = () => {
	// 呪文詠唱を止めるボタン
	const stopButton = new enchant.Sprite(80, 20);
	stopButton.image = game.assets['resources/stop_button'];
	stopButton.moveTo(0, 270);
	stopButton.ontouchstart = () => {
		resetQueue();
	};
	Hack.menuGroup.addChild(stopButton);
	
	// ゲームリセットボタン
	const resetButton = new enchant.Sprite(80, 20);
	resetButton.image = game.assets['resources/reset_button'];
	resetButton.moveTo(0, 296);
	resetButton.ontouchstart = () => {
		Hack.dispatchEvent(new Event('reset'));
		// リセットはストップをかねる
		resetQueue();
	};
	Hack.menuGroup.addChild(resetButton);

	// タイムオーバー
	Hack.on('gameclear', () => {
		// 時間切れ！
		window.STOP_FLAG = true;
	});

	// スコアの表示位置変更
	Hack.scoreLabel.moveTo(180, 8);
	Hack.scoreLabel.backgroundColor = 'rgba(0, 0, 0, 0.5)';

	// 階層ラベル (同じマップになんども enter することを想定している)
	Hack.floorLabel = new enchant.ui.ScoreLabel(8, 8);
	Hack.floorLabel.backgroundColor = 'rgba(0, 0, 0, 0.5)';
	Hack.floorLabel.score = 1;
	Hack.floorLabel.label = 'FLOOR:';
	Hack.menuGroup.addChild(Hack.floorLabel);

	// ライフラベルを隠す
	Hack.lifeLabel.parentNode.removeChild(Hack.lifeLabel);

	// 詠唱アニメーション
	let chantEffect = null;
	Hack.on('code', () => {
		if (chantEffect) chantEffect.remove();
		chantEffect = new RPGObject();
		chantEffect.mod(Hack.assets.chantEffect);
		chantEffect.locate(player.mapX, player.mapY);
		chantEffect.compositeOperation = 'lighter';
		chantEffect.scale(0);
		chantEffect.tl.scaleTo(1, 1, 8, 'QUAD_EASEOUT');
		// 詠唱中は操作できない
		player.stop();
		chantEffect.setTimeout(() => {
			// 元に戻す
			player.resume();
			// エフェクトを消す
			chantEffect.tl.fadeOut(4).removeFromScene();
		}, window.WAIT_TIME / 1000 * game.fps);
	});

	Hack.on('scorechange', ({ oldValue, newValue }) => {
		// スコアが増えたときに出る数字
		const scoreEffect = new enchant.ui.ScoreLabel();
		scoreEffect.score = (newValue - oldValue); // 取得したスコア
		Object.defineProperty(scoreEffect, 'easing', { value: 0, writable: false });
		scoreEffect.label = '';
		scoreEffect.moveTo(player.center.x - (scoreEffect.score.toString().length * scoreEffect.fontSize / 2), player.y);
		// いい感じのエフェクト
		scoreEffect.tl.moveBy(0, -8, 8).removeFromScene();
		// scorechange のタイミングでシーンに追加する場合は enterframe を呼ばないと label が反映されない
		scoreEffect.dispatchEvent(new Event('enterframe'));
		Hack.world.addChild(scoreEffect);
	});

};

// タイマーをスタートさせる
Hack.startTimer = () => {
	// 時間制限タイマー
	const limitTimer = new enchant.ui.TimeLabel(352, 8, 'countdown');
	limitTimer.time = (window.TIME_LIMIT / 1000) >> 0;
	limitTimer.backgroundColor = 'rgba(0, 0, 0, 0.5)';
	Hack.menuGroup.addChild(limitTimer);

	let isEnd = false;
	// ゲーム終了
	function end() {
		isEnd = true;
		// クリア（これ以降はスコアが増えない）
		Hack.gameclear();
	}
	
	limitTimer._listeners.enterframe.push(() => {
		const time = Math.max(limitTimer._time / game.fps, 0);
		// 時間切れ
		if (!isEnd && time <= 0) end();
		limitTimer.text = limitTimer.label + Math.ceil(time);
	});
};

export default common;