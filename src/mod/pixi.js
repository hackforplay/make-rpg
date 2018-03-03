import 'hackforplay/core';
import * as PIXI from 'modules/pixi.min';
import 'modules/pixi.filters';
import { radians } from 'hackforplay/utils/math-utils';

const app = new PIXI.Application(feeles.env.VIEW.width, feeles.env.VIEW.height, {
	autoStart: false,
	transparent: true
});

game._pixi_app = app;

const renderer = app.renderer;

// RPGObject の生成を監視する
game.on('construct-RPGObject', ({ instance }) => {

	let image = null;
	instance._pixi_sprite = null;

	// RPGObject が破棄されたら PIXI の Sprite も破棄する
	instance.on('destroy', () => {
		if (!instance._pixi_sprite) return;
		app.stage.removeChild(instance._pixi_sprite);
		instance._pixi_sprite = null;
	});

	instance.on('render', () => {

		// RPGObject の image が変わったらテクスチャを更新する
		if (image !== instance.image._element) {
			image = instance.image._element;

			const baseTexture = new PIXI.BaseTexture(image);
			const texture = new PIXI.Texture(baseTexture);

			// 既に Sprite が存在していたら破棄する
			if (instance._pixi_sprite) {
				app.stage.removeChild(instance._pixi_sprite);
				instance._pixi_sprite = null;
			}

			instance._pixi_sprite = new PIXI.Sprite(texture);
			instance.dispatchEvent(new Event('pixi'));
			app.stage.addChild(instance._pixi_sprite);
		}

		const sprite = instance._pixi_sprite;

		// Sprite が存在しないなら描画しない
		if (!sprite) return;

		// enchantjs の Sprite と PIXI の Sprite を同期する
		sprite.x = instance.x + instance.width / 2;
		sprite.y = instance.y + instance.height / 2;
		sprite.alpha = instance.opacity;
		sprite.texture.frame = {
			x: instance._frameLeft,
			y: instance._frameTop,
			width: instance.width,
			height: instance.height
		};
		sprite.scale = new PIXI.Point(instance.scaleX, instance.scaleY);
		sprite.anchor.set(0.5, 0.5);
		sprite.rotation = radians(instance.rotation);
	});
});

// RPGMap の生成を監視する
game.on('construct-RPGMap', ({ instance }) => {
	const context = instance._surface.context;

	context._pixi_renderer = true;

	// 背景用の Sprite を生成する
	const background = new PIXI.Sprite(PIXI.Texture.fromCanvas(instance._surface._element));
	app.stage.addChild(background);

	instance.scene.on('prerender', () => {
		// renderer.clear();
	});

	// マップのシーンが描画されたら PIXI でレンダリングして上書きする
	instance.scene.on('postrender', () => {
		background.texture.update();
		app.render();
		instance._surface.context.drawImage(app.renderer.view, 0, 0);
	});
});

const _cvsRender = RPGObject.prototype.cvsRender;
RPGObject.prototype.cvsRender = function cvsRender(context) {
	if (context._pixi_renderer) return;
	_cvsRender.call(this, context);
}
