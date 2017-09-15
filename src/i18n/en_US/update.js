import 'hackforplay/core';

/* Let's make details of the game! (Update Function)  */
function update() {

	if (player.hp <= 0) {
		// If player's HP is 0 or less...

		Hack.gameover(); // GAME OVER!!
		player.destroy(); // Remove player
	}

	/*+ Rules */
}

export default update;
