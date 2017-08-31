import enchant from 'enchantjs/enchant';
import RPGObject from './object';


const HumanBase = enchant.Class.create(RPGObject, {

	initialize(width, height, offsetX, offsetY) {
		RPGObject.call(this, width, height, offsetX, offsetY);
		this.hp = 3;
		this.atk = 1;
		this.directionType = 'quadruple';
		this.forward = [0, 1];
	}

});


export default HumanBase;
