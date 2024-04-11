
export default class Snake {
	len: number = 2;

	// Body: [[x,y], [x, y]]
	path: Path[];

	constructor(x: number, y: number, len: number) {
		if (len > 0) {
			this.len = len;
		}

		const path: Path[] = [];
		for (let i = 0; i < this.len; i++) {
			path.push([x, y - i] as Path);
		}

		this.path = path;
	}
}
