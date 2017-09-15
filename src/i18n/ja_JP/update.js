import 'hackforplay/core';

/* こまかいゲームのルールを作ろう (アップデート関数) */
function update() {

	if (player.hp <= 0) {
		// HP が 0 以下のとき

		Hack.gameover(); // ゲームオーバー
		player.destroy(); // プレイヤーを消す
	}

	/*+ ルールついか */
}

export default update;
