import {
	Core,
	Node,
	Event,
	Sprite,
	Surface,
	Group
} from 'enchantjs/enchant';
import 'enchantjs/ui.enchant';
import 'enchantjs/fix';
import 'hackforplay/rpg-kit-main';

const clamp = function(value, min, max) {
	return Math.max(min, Math.min(max, value));
};


class Camera extends Sprite {

	constructor(x, y, w, h) {
		super(w, h);

		// this.opacity = 0.5;

		w = w || game.width;
		h = h || game.height;

		this.image = new Surface(w, h);

		this.w = w;
		this.h = h;

		this.x = x || 0;
		this.y = y || 0;


		this.background = '#000';


		this.enabled = true;
		this.target = null;
		this.center = null;
		this.clip = true;
		this.clipScaleFunction = Math.min;
		this.clamp = true;
		this.scale = 1.0;
		// デフォルトの画面にシーンを描画するか
		this.rootCanvasRendering = false;
		this.border = false;
		this.borderColor = '#000';
		this.borderLineWidth = 1;

		Camera.collection.push(this);

		Hack.cameraGroup.addChild(this);

	}


	get w() { return this.width; }
	get h() { return this.height; }

	set w(value) {
		this.width = value;
		this.image._element.width = value;
	}

	set h(value) {
		this.height = value;
		this.image._element.height = value;
	}


	resize(width, height) {

		width = Math.ceil(width);
		height = Math.ceil(height);

		if (this.width === width && this.height === height) return;

		var previousWidth = this.width;
		var previousHeight = this.height;

		this.width = width;
		this.height = height;


		this.dispatchEvent((function() {

			var e = new enchant.Event(enchant.Event.RESIZE);

			return e;

		})());

		return this;
	}

	getCenter() {

		// center 固定
		if (this.center) return this.center;

		// target
		if (this.target && this.target instanceof RPGObject) {
			return this.target.center;
		}

		// マップの中心
		if (Hack.map) {

			const map = Hack.map;

			return {
				x: map.width / 2,
				y: map.height / 2
			}

		}

		console.error('Camera#getCenter');
	}

	getScale() {

		// クリップしない
		if (!this.clipScaleFunction) return this.scale;

		const x = Hack.map.width / this.w;
		const y = Hack.map.height / this.h;

		const clip = this.clipScaleFunction(x, y);
		if (this.scale > clip) return clip;

		return this.scale;
	}


	// 描画範囲を取得する
	getRenderRect() {
		var center = this.getCenter();

		var x = center.x;
		var y = center.y;

		var scale = this.getScale();

		var w = this.width * scale;
		var h = this.height * scale;

		x -= w / 2;
		y -= h / 2;


		var rect = {

			x: x,
			y: y,
			width: w,
			height: h

		};


		if (this.clamp) rect = this.clampRect(rect);

		return rect;

	}


	// 描画範囲を画面に収める
	clampRect(rect) {

		const { w, h } = this.getVisionSize();

		var over = false;

		var _d_x = false;
		var _d_y = false;

		if (w < rect.width) {
			_d_x = true;
			rect.x = (rect.width - w) / 2;
		}
		if (h < rect.height) {
			_d_y = true;
			rect.y = (rect.height - h) / 2;
		}


		var b = false;


		if (w > Hack.map.width) {
			_d_x = true;
			rect.x = -(w - Hack.map.width) / 2;
		}

		if (h > Hack.map.height) {
			_d_y = true;
			rect.y = -(h - Hack.map.height) / 2;

		}

		if (over || b) {
			return rect;
		}




		if (!_d_x) rect.x = clamp(rect.x, 0.0, Hack.map.width - w);
		if (!_d_y) rect.y = clamp(rect.y, 0.0, Hack.map.height - h);


		return rect;
	}

	_rectScale(rect, scale) {
		rect.x *= scale;
		rect.y *= scale;
		rect.width *= scale;
		rect.height *= scale;
		return rect;
	}


	// カメラ上の座標を計算する
	getNodeRect(node) {

		var renderRect = this.getRenderRect();
		var scale = this.getScale();

		var x = node.x - renderRect.x;
		var y = node.y - renderRect.y;

		var rect = {
			x: x,
			y: y,
			width: node.width,
			height: node.height,
		};

		return this._rectScale(rect, 1.0 / scale);
	}


	getVisionSize() {
		const scale = this.getScale();
		return {
			w: this.w * scale,
			h: this.h * scale
		};
	}


	zoom(value) {
		this.scale /= value;
	}


	borderStyle(lineWidth, color) {
		this.border = true;
		this.borderLineWidth = lineWidth;
		this.borderColor = color;
	}


	render() {


		var center = this.getCenter();

		if (!center) return;

		var x = center.x;
		var y = center.y;


		var rect = this.getRenderRect();
		var r = rect;


		// ctx.strokeRect(r.x, r.y, r.width, r.height);


		this.dispatchEvent((function() {

			var e = new enchant.Event(enchant.Event.RENDER);

			e.rect = r;


			return e;

		})());



		this.image.context.drawImage(
			Hack.map._surface._element,

			r.x, r.y, r.width, r.height,
			0, 0, this.w, this.h);

		/*

		this.dispatchEvent(new Event('postrender', {
			texture: this.image,
			context: this.image.context,
			rect: r,
		}));

		*/


		this.image.context.fillStyle = 'red';
		this.image.context.fillRect(0, 0, 100, 100);



	}

}

Camera.collection = [];


Camera.background = '#000';



// カメラを並べる
Camera.arrange = function(x, y, border, filter) {

	var for2d = function(x, y, callback) {
		for (var a = 0; a < x; ++a) {
			for (var b = 0; b < y; ++b) {
				callback(a, b);
			}
		}
	};


	// 枠を表示する
	if (border === undefined ? true : border) {
		Camera.collection.forEach(function(camera) {
			camera.border = true;
		});
	}

	// 並べるカメラだけ取得
	var index = 0;
	var cameras = Camera.collection.filter(filter || function(camera) {
		return camera.enabled;
	});

	// 再配置
	for2d(y, x, function(y2, x2) {

		if (index >= cameras.length) return;
		var camera = cameras[index++];

		camera.moveTo(game.width / x * x2, game.height / y * y2);
		camera.resize(game.width / x, game.height / y);

	});

};

Camera.layout = Camera.arrange;


window.Camera = Camera;
Camera.main = Hack.camera;

export default Camera;
