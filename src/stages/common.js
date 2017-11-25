// 全てのステージに共通する処理

function common () {
	// 呪文詠唱を止めるボタン
	const stopButton = new Sprite(80, 20);
	stopButton.image = game.assets['resources/stop_button'];
	stopButton.moveTo(0, 0);
	stopButton.ontouchstart = () => {
		window.STOP_FLAG = true;
	};
	Hack.menuGroup.addChild(stopButton);
	
	// TODO: ゲームリセットボタン
}

export default common;