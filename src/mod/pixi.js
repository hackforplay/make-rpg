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

	instance.filters = [];
	instance.filterAutoUpdate = true;

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
		sprite.filters = instance.filters;
		sprite.scale = new PIXI.Point(instance.scaleX, instance.scaleY);
		sprite.anchor.set(0.5, 0.5);
		sprite.rotation = radians(instance.rotation);
	});
});
let renderTexture = PIXI.RenderTexture.create(800, 600);

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

game.filterTimeScale = 0.01;

/**
 * フィルターを適用する
 * @param {string} name フィルタ名
 * @param {array}  args 引数
 */
RPGObject.prototype.filter = Camera.prototype.filter = function (name, ...args) {
	name = name.replace(/(^.|-.)/g, (value) => value.slice(-1).toUpperCase());
	const filter = new PIXI.filters[name + 'Filter'](...args);
	// time が存在するなら自動更新処理を入れる
	if (filter.time !== undefined) {
		filter.updater = () => {
			if (!this.filterAutoUpdate) return;
			filter.time += game.filterTimeScale;
			if (filter._rpg_repeat !== undefined) {
				filter.time = filter.time % filter._rpg_repeat;
			}
		};
		this.on('enterframe', filter.updater);
	}
	this.filters.push(filter);
	return filter;
}

// Camera の生成を監視する
game.on('construct-Camera', ({ instance }) => {

	instance.filters = [];
	instance.filterAutoUpdate = true;

	instance._pixi_sprite = new PIXI.Sprite(PIXI.Texture.fromCanvas(instance.image._element));
	instance._pixi_renderTexture = PIXI.RenderTexture.create(instance.w, instance.h);

	let imageData = instance.image.context.createImageData(instance.w, instance.h);

	instance.on('resize', () => {
		instance._pixi_renderTexture.resize(instance.w, instance.h);
		imageData = instance.image.context.createImageData(instance.w, instance.h);
	});

	instance.on('postrender', () => {
		if (!instance.filters.length) return;
		instance._pixi_sprite.filters = instance.filters;
		instance._pixi_sprite.texture.update();
		renderer.render(instance._pixi_sprite, instance._pixi_renderTexture);
		imageData.data.set(renderer.extract.pixels(instance._pixi_renderTexture));
		instance.image.context.putImageData(imageData, 0, 0);
	});
});

PIXI.Filter.prototype.repeat = function (value) {
	this._rpg_repeat = value;
	return this;
}