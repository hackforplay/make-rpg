import 'enchantjs/enchant';
import 'enchantjs/ui.enchant';
import 'hackforplay/rpg-kit-main';

import EventEmitter from 'mod/EventEmitter3';

const clamp = function(value, min, max) {
	return Math.max(min, Math.min(max, value));
};



enchant.Map.prototype.cvsRender = function cvsRender(ctx) {

	if (this.width !== 0 && this.height !== 0) {
		var core = enchant.Core.instance;
		this.updateBuffer();
		ctx.save();
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		var cvs = this._context.canvas;
		ctx.drawImage(cvs, 0, 0 /* , core.width, core.height */ );
		ctx.restore();
	}
};



enchant.Map.prototype.redraw = function(x, y, width, height) {

	x = 0;
	y = 0;
	width = this.width;
	height = this.height;

	var core = enchant.Core.instance;
	var surface = new enchant.Surface(width, height);
	this._surface = surface;
	var canvas = surface._element;
	canvas.style.position = 'absolute';
	if (enchant.ENV.RETINA_DISPLAY && core.scale === 2) {
		canvas.width = width * 2;
		canvas.height = height * 2;
		this._style.webkitTransformOrigin = '0 0';
		this._style.webkitTransform = 'scale(0.5)';
	} else {
		canvas.width = width;
		canvas.height = height;
	}
	this._context = canvas.getContext('2d');


	if (this._image == null) {
		return;
	}
	var image, tileWidth, tileHeight, dx, dy;
	if (this._doubledImage) {
		image = this._doubledImage;
		tileWidth = this._tileWidth * 2;
		tileHeight = this._tileHeight * 2;
		dx = -this._offsetX * 2;
		dy = -this._offsetY * 2;
		x *= 2;
		y *= 2;
		width *= 2;
		height *= 2;
	} else {
		image = this._image;
		tileWidth = this._tileWidth;
		tileHeight = this._tileHeight;
		dx = -this._offsetX;
		dy = -this._offsetY;
	}
	var row = image.width / tileWidth | 0;
	var col = image.height / tileHeight | 0;
	var left = Math.max((x + dx) / tileWidth | 0, 0);
	var top = Math.max((y + dy) / tileHeight | 0, 0);
	var right = Math.ceil((x + dx + width) / tileWidth);
	var bottom = Math.ceil((y + dy + height) / tileHeight);

	var source = image._element;
	var context = this._context;
	var canvas = context.canvas;


	context.clearRect(x, y, width, height);
	for (var i = 0, len = this._data.length; i < len; i++) {
		var data = this._data[i];
		var r = Math.min(right, data[0].length);
		var b = Math.min(bottom, data.length);
		for (y = top; y < b; y++) {
			for (x = left; x < r; x++) {
				var n = data[y][x];
				if (0 <= n && n < row * col) {
					var sx = (n % row) * tileWidth;
					var sy = (n / row | 0) * tileHeight;
					context.drawImage(source, sx, sy, tileWidth, tileHeight,
						x * tileWidth - dx, y * tileHeight - dy, tileWidth, tileHeight);
				}
			}
		}
	}

}

enchant.Event.RESIZE = 'resize';
enchant.Event.RENDERED = 'rendered';


enchant.CanvasRenderer.prototype.listener = new EventEmitter();
enchant.CanvasRenderer.prototype.override = null;

enchant.CanvasRenderer.instance.render = function(context, node, event) {

	// safari 対策
	if (!node.scene && !node._scene) return;

	context = this.override || context;

	// render start
	this.listener.emit('renderStart', node);

	enchant.CanvasRenderer.prototype.render.call(this, context, node, event);

	// render end
	this.listener.emit('renderEnd', node);

	node.dispatchEvent(new enchant.Event(enchant.Event.RENDERED));
};



var init = window.RPGMap.prototype.initialize;
window.RPGMap.prototype.initialize = function(ux, uy, x, y) {

	init.apply(this, arguments);

	// FIX PATCH
	x = x !== undefined ? x : 15;
	y = y !== undefined ? y : 10;
	// ---- tera

	this._surface = new enchant.Surface(ux * x, uy * y);

};


enchant.CanvasRenderer.instance.listener.on('renderStart', (node) => {



	if (!Hack.map || node !== enchant.Core.instance.rootScene._layers.Canvas) return;

	enchant.CanvasRenderer.instance.override = Hack.map._surface.context;

});


const Camera = enchant.Class.create(enchant.Node, {

	initialize(x, y, w, h) {
		enchant.Node.call(this);


		this.width = w || game.width;
		this.height = h || game.height;

		this.x = x || 0;
		this.y = y || 0;

		this.background = '#000';

		Camera.collection.push(this);
	},


	enabled: true,

	target: null,

	center: null,

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
	},

	getCenter: function() {
		if (this.center) return this.center;

		if (this.target) {

			if (this.target instanceof RPGObject) {

				return {

					x: this.target.x - this.target.offset.x + 16,
					y: this.target.y - this.target.offset.y + 16

				};

			}

			return {
				x: this.target.x,
				y: this.target.y
			};
		}

		if (Hack.map) {

			var map = Hack.map;

			return {
				x: map.width / 2,
				y: map.height / 2
			}

		}


		return {
			x: 0,
			y: 0
		};

	},

	clipScaleFunction: Math.min,


	getScale: function() {

		var scale = this.scale;

		if (this.clipScaleFunction) {

			var x = Hack.map.width / this.width;
			var y = Hack.map.height / this.height;
			var clip = this.clipScaleFunction(x, y);

			if (scale > clip) scale = clip;

		}


		return scale;
	},


	// 描画範囲を取得する
	getRenderRect: function() {
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

	},


	clamp: true,

	// 描画範囲を画面に収める
	clampRect(rect) {

		var w = this.getVisionSize().width;
		var h = this.getVisionSize().height;

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
	},

	_rectScale: function(rect, scale) {
		rect.x *= scale;
		rect.y *= scale;
		rect.width *= scale;
		rect.height *= scale;
		return rect;
	},


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
	},


	getVisionSize: function() {
		return {
			width: this.width * this.getScale(),
			height: this.height * this.getScale()
		};
	},

	scale: 1.0,

	zoom(value) {
		this.scale /= value;
	},


	// デフォルトの画面にシーンを描画するか
	rootCanvasRendering: false,


	border: false,
	borderColor: '#000',
	borderLineWidth: 1,

	borderStyle(lineWidth, color) {
		this.border = true;
		this.borderLineWidth = lineWidth;
		this.borderColor = color;
	},


	clip: true,


	render() {

		var ctx = enchant.Core.instance.rootScene._layers.Canvas.context;

		var center = this.getCenter();
		var x = center.x;
		var y = center.y;


		if (this.rootCanvasRendering) {
			ctx.drawImage(Hack.map._surface._element, 0, 0);
		}


		/*
		ctx.beginPath();
		ctx.arc(x, y, 60, 0, Math.PI*2, false);
		ctx.stroke();
		*/

		var rect = this.getRenderRect();
		var r = rect;


		// ctx.strokeRect(r.x, r.y, r.width, r.height);

		ctx.save();

		ctx.translate(this.x, this.y);

		if (this.clip) {
			ctx.beginPath();
			ctx.rect(0, 0, this.width, this.height);
			ctx.clip();
		}

		this.dispatchEvent((function() {

			var e = new enchant.Event(enchant.Event.RENDER);

			e.rect = r;

			e.context = ctx;

			return e;

		})());


		if (this.background) {

			ctx.fillStyle = this.background;
			ctx.fillRect(0, 0, this.width, this.height);

		}



		ctx.drawImage(Hack.map._surface._element, r.x, r.y, r.width, r.height, 0, 0, this.width, this.height);


		if (this.border) {
			ctx.strokeStyle = this.borderColor;
			ctx.lineWidth = this.borderLineWidth;
			ctx.strokeRect(0, 0, this.width, this.height);
		}

		this.dispatchEvent((function() {

			var e = new enchant.Event(enchant.Event.RENDERED);

			e.rect = r;

			e.context = ctx;
			return e;

		})());



		if (this.clip) {
			ctx.beginPath();
			ctx.rect(0, 0, game.width, game.height);
			ctx.clip();
		}

		ctx.restore();

	}

});

Camera.collection = [];



// 1f 前のキャプチャ画像を保持する機能
Camera.prototype.record = function() {

	// 既に録画しているなら
	if (this.recordCanvas) return;

	this.recording = true;

	this.recordCanvas = new enchant.Surface(this.width, this.height);


	this.on(enchant.Event.RESIZE, function() {
		this.recordCanvas = new enchant.Surface(this.width, this.height);
	});

	this.on(enchant.Event.RENDER, function(e) {

		if (!this.recording) return;

		var r = e.rect;

		var ctx = this.recordCanvas.context;

		ctx.drawImage(Hack.map._surface._element, r.x, r.y, r.width, r.height, 0, 0, this.width, this.height);

	});


};

Camera.prototype.recordStop = function() {

	this.recording = false;

};


Camera.background = '#000';


enchant.CanvasRenderer.instance.listener.on('renderEnd', function(node) {
	if (!Hack.map || node !== Hack.map.scene) return;

	enchant.CanvasRenderer.instance.override = null;
	enchant.Core.instance.rootScene._layers.Canvas.context.fillStyle = Camera.background;
	enchant.Core.instance.rootScene._layers.Canvas.context.fillRect(0, 0, game.width, game.height);


	Camera.collection.forEach(function(camera) {

		camera.render();

	});

});


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

var camera = new Camera();
camera.resize(game.width, game.height);
Hack.camera = camera;

game.on('load', function() {

	// ターゲットが指定されていない場合はHack.playerになる
	Hack.camera.target = Hack.camera.target || Hack.player;

});


window.Camera = Camera;
Camera.main = Hack.camera;
