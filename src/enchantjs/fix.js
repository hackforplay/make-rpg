import {
	Event,
	EventTarget,

	Node,

	Group
} from 'enchantjs/enchant';

const initializeEvent = Event.prototype.initialize;

// Event の第二引数に props を追加する
Event.prototype.initialize = function $initialize(name, props) {

	initializeEvent.call(this, name);

	if (!props) return;

	for (const [key, value] of Object.entries(props)) {
		this[key] = value;
	}
	
};


Node.prototype.name = 'Node';

// Node#order を追加
Object.defineProperty(Node.prototype, 'order', {
	get() {
		return this._order || 0;
	},
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

	}
});



// 子要素を order でソートする
Group.prototype.sortChildren = function sortChildren() {

	this.childNodes.sort((a, b) => {
		return a.order - b.order;
	});

	if (!this._layers) return;


	for (const layer of Object.values(this._layers)) {

		layer.childNodes.sort((a, b) => {
			return a.order - b.order;
		});

	}

};








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
