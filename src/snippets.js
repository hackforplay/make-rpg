export default [
	/* プレイヤーに命令する関数 */
	{
		prefix: 'wait',
		text: 'wait(1) // やすめ\n'
	},
	{
		prefix: 'turnRight',
		text: 'turnRight() // まわれ右\n'
	},
	{
		prefix: 'turnLeft',
		text: 'turnLeft() // まわれ左\n'
	},
	{
		prefix: 'dash',
		text: 'dash() // ダッシュ！\n'
	},
	{
		prefix: 'headUp',
		text: 'headUp() // 上を向け\n'
	},
	{
		prefix: 'headRight',
		text: 'headRight() // 右を向け\n'
	},
	{
		prefix: 'headDown',
		text: 'headDown() // 下を向け\n'
	},
	{
		prefix: 'headLeft',
		text: 'headLeft() // 左を向け\n'
	},
	{
		prefix: 'attack',
		text: 'attack() // まほうでこうげき\n'
	},
	{
		prefix: 'locate',
		text: 'locate(7, 5) // しゅんかんいどう\n'
	},
	/* ループ (策定中) */
	{
		prefix: 'for',
		text: `
// くりかえす
for (let かず = 0; かず < 10; かず++) {

}
`
	},
	{
		prefix: 'forfor',
		text: `
// くりかえす を くりかえす
for (let よこ = 0; よこ < 10; よこ += 1) {
	// くりかえす
	for (let たて = 0; たて < 5; たて += 1) {

	}
}
`
	},
	{
		prefix: 'forof',
		text: `
// ひとつずつ とりだす
for (const かず of [0, 1, 2, 3, 4, 5]) {

}
`
	}
];
