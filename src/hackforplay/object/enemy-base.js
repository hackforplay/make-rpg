import enchant from 'enchantjs/enchant';
import RPGObject from './object';



const EnemyBase = enchant.Class.create(RPGObject, {

	initialize(width, height, offsetX, offsetY) {
		RPGObject.call(this, width, height, offsetX, offsetY);

		this.directionType = 'double';
		this.forward = [-1, 0];
		this.hp = 3;
		this.atk = 1;
	}
});


export default EnemyBase;
