import 'enchantjs/enchant';
import 'enchantjs/ui.enchant';



enchant.Node.prototype.name = 'node';

Object.defineProperty(enchant.Node.prototype, 'order', {

	set(value) {
		if (value === this._order) return;
		this._order = value;

		// childNodes の並びを再計算
		if (this.parentNode &&
			this.parentNode.sortChildren &&
			this.parentNode.autoSorting
		) {

			this.parentNode.sortChildren();

		}

	},
	get() {
		return this._order || 0;
	}
});



function extend(base, func) {
	const init = base.prototype.initialize;
	base.prototype.initialize = function() {
		init.apply(this, arguments);
		func.call(this);
	}
}


extend(enchant.Group, function() {

	// 自動で子要素をソートするか
	// 重いのでデフォルトは false
	this.autoSorting = false;

	this.on('childadded', (a) => {

		if (this.autoSorting) {
			this.sortChildren();
		}

	});

});

extend(enchant.Scene, function() {

	// シーンは自動で子要素をソートする
	this.autoSorting = true;

});


// 子要素を order でソートする
enchant.Group.prototype.sortChildren = function() {

	this.childNodes = this.childNodes.sort((a, b) => {
		return a.order - b.order;
	});

	if (!this._layers) return;

	// 描画順はシーンのレイヤーの childNodes で管理されている？
	Object.keys(this._layers).forEach((name) => {

		const layer = this._layers[name];

		layer.childNodes = layer.childNodes.sort((a, b) => {
			return a.order - b.order;
		});

	});


};
