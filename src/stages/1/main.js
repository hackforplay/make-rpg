import 'hackforplay/core';

import gameFunc from './game';

// ゲームをつくる
game.onload = async() => {

	// gameOnLoad より先に実行するイベント
	// lifelabel などが gameOnLoad 時に参照できない対策
	game.dispatchEvent(new enchant.Event('awake'));

	Hack.maps = Hack.maps || {};
	
	gameFunc();

	// Hack.player がないとき self.player を代わりに入れる
	if (self.player && !Hack.player) {
		Hack.player = self.player;
	}

};

// ゲームスタート
Hack.start();
