import 'hackforplay/rpg-kit-main';
import 'hackforplay/camera';
import 'hackforplay/loader';

import * as synonyms from './synonyms';


// Assign synonyms
for (const [from, to] of synonyms.assets) {
	self[to] = Hack.assets[from];
}


/*
// Game start
game.onload = function() {

	var map = Hack.maps['map1'];
	map.load(); // Load Map;  Hack.defaultParentNode == map.scene

	// ( Keep this line -- ここはけさないでね ) //


	// プレイヤー（騎士）
	var player = Hack.player = new Player();
	player.mod(Hack.assets.knight);
	player.locate(3, 5);
	player.hp = 3;
	player.atk = 1;
	player.onbecomedead = function() {
		this.destroy();
		Hack.gameover();
	}
	player.tag = 'player';


};


// Before game start
Hack.onload = function() {

	MapObject.dictionary = {
		clay: 320,
		clayWall: 340,
		clayFloor: 323,
		stone: 321,
		stoneWall: 341,
		stoneFloor: 342,
		warp: 324,
		warpRed: 325,
		warpGreen: 326,
		warpYellow: 327,
		magic: 328,
		usedMagic: 329,
		pot: 400,
		rock: 401,
		upStair: 402,
		box: 420,
		flower: 421,
		downStair: 422,
		trap: 440,
		usedTrap: 441,
		step: 442,
		castle: 500,
		village: 501,
		caveGate: 502,
		tree: 520,
		table: 521,
		openedBox: 522,
		beam: 540,
		diamond: 560,
		sapphire: 561,
		ruby: 562,
		heart: 563,
		skull: 564,
		coin: 565,
		star: 566,
		key: 567,
		bomb: 580,
		coldBomb: 581,
		egg: 582,
		poo: 583,
		sandySoil: 45,
		claySoil: 323,
		grassland: 322,
		waterside: 205,
		flatGray: 135,
		squareGray: 93,
	};

	Hack.maps = {};

	// map1
	Hack.maps['map1'] = new RPGMap(32, 32, 15, 10);
	Hack.maps['map1'].imagePath = 'enchantjs/x2/dotmat.gif';
	Hack.maps['map1'].type = 'grassland';

};

*/


//Hack.start();
