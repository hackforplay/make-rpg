/**
 * @param next String 次に読み込むHTMLのパス
 */
export function gameclear(next) {

	Hack.gameclear();

	const button = new Sprite(165, 69);
	button.image = game.assets['hackforplay/new_button_next.png'];
	button.moveTo(156, 320);
	button.ontouchend = () => {
		feeles.replace(next);
	};
	button.tl
		.delay(20)
		.moveBy(0, -100, 30);
	game.rootScene.addChild(button);

}
