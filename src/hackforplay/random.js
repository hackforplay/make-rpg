class Random {

	static dir4() {
		return [{
				x: -1,
				y: 0
			},
			{
				x: 1,
				y: 0
			},
			{
				x: 0,
				y: -1
			},
			{
				x: 0,
				y: 1
			},
		][random(0, 4)];
	}

	static dir2() {

	}

}

export default Random;
