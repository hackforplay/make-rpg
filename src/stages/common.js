/* global Hack, enchant, game */
// 全てのステージに共通する処理

const common = () => {
	// 呪文詠唱を止めるボタン
	const stopButton = new enchant.Sprite(80, 20);
	stopButton.image = game.assets['resources/stop_button'];
	stopButton.moveTo(0, 0);
	stopButton.ontouchstart = () => {
		window.STOP_FLAG = true;
	};
	Hack.menuGroup.addChild(stopButton);
	
	// ゲームリセットボタン
	const resetButton = new enchant.Sprite(80, 20);
	resetButton.image = game.assets['resources/reset_button'];
	resetButton.moveTo(0, 24);
	resetButton.ontouchstart = () => {
		Hack.dispatchEvent(new Event('reset'));
	};
	Hack.menuGroup.addChild(resetButton);

	// スコアの表示位置変更
	Hack.scoreLabel.moveTo(300, 8);
	Hack.scoreLabel.backgroundColor = 'rgba(0, 0, 0, 0.5)';

	// 階層ラベル (同じマップになんども enter することを想定している)
	Hack.floorLabel = new enchant.ui.ScoreLabel(120, 8);
	Hack.floorLabel.backgroundColor = 'rgba(0, 0, 0, 0.5)';
	Hack.floorLabel.score = 1;
	Hack.floorLabel.label = 'FLOOR:';
	Hack.menuGroup.addChild(Hack.floorLabel);

	// ライフラベルを隠す
	Hack.lifeLabel.parentNode.removeChild(Hack.lifeLabel);

	// 詠唱アニメーション
	Hack.on('code', () => {
		const chantEffect = new RPGObject();
		chantEffect.mod(Hack.assets.chantEffect);
		chantEffect.locate(player.mapX, player.mapY);
		// 詠唱中は操作できない
		player.speed = 0;
		setTimeout(() => {
			// 元に戻す
			player.speed = 1;
			// エフェクトを消す
			chantEffect.destroy();
		}, window.WAIT_TIME);
	});

};

export default common;