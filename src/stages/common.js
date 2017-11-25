/* global Hack, Sprite, game */
// 全てのステージに共通する処理

const common = () => {
	// 呪文詠唱を止めるボタン
	const stopButton = new Sprite(80, 20);
	stopButton.image = game.assets['resources/stop_button'];
	stopButton.moveTo(0, 0);
	stopButton.ontouchstart = () => {
		window.STOP_FLAG = true;
	};
	Hack.menuGroup.addChild(stopButton);
	
	// ゲームリセットボタン
	const resetButton = new Sprite(80, 20);
	resetButton.image = game.assets['resources/reset_button'];
	resetButton.moveTo(0, 24);
	resetButton.ontouchstart = () => {
		Hack.dispatchEvent(new Event('reset'));
	};
	Hack.menuGroup.addChild(resetButton);
};

export default common;