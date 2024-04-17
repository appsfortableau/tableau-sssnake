import { Direction, Path } from "./types";

export type SomeSnake = Snake | undefined;

class Snake {
	dir: Direction;
	len: number = 2;
	path: Path[];

	constructor(
		x: number,
		y: number,
		len: number,
		dir: Direction = Direction.UP,
	) {
		this.dir = dir;
		if (len > 0) {
			this.len = len;
		}

		const orgX = x;
		const orgY = y;

		const path: Path[] = [];
		for (let i = 0; i < this.len; i++) {
			if (dir === Direction.UP) {
				y = orgY - i;
			} else if (dir === Direction.DOWN) {
				y = orgY + i;
			} else if (dir === Direction.LEFT) {
				x = orgX + i;
			} else if (dir === Direction.RIGHT) {
				x = orgX - i;
			}

			path.push([x, y] as Path);
		}

		this.path = path;
	}

	eyes(size: number): EyeElm[] {
		const eyes = new SnakeEye(size, this.dir);

		return [
			// left eye
			eyes.generate(EyeType.EYE, EyeSide.LEFT),
			// left pupil
			eyes.generate(EyeType.PUPIL, EyeSide.LEFT),
			// right eye
			eyes.generate(EyeType.EYE, EyeSide.RIGHT),
			// right eye
			eyes.generate(EyeType.PUPIL, EyeSide.RIGHT),
		];
	}

	eyesRotation(): number {
		if (this.dir === Direction.RIGHT) {
			return 90;
		} else if (this.dir === Direction.DOWN) {
			return 90 * 2;
		} else if (this.dir === Direction.LEFT) {
			return 90 * 3;
		}
		return 0;
	}
}

export default Snake;

export enum EyeType {
	EYE,
	PUPIL,
}

export enum EyeSide {
	LEFT,
	RIGHT,
}

export type EyeElm = {
	x: number;
	y: number;
	size: number;
	color: string;
};

export class SnakeEye {
	size: number;
	dir: Direction;

	constructor(size: number, dir: Direction = Direction.UP) {
		this.size = size;
		this.dir = dir;
	}

	generate(type: EyeType, side: EyeSide) {
		const ratio = side === EyeSide.LEFT ? -1 : 1;
		const offset = type === EyeType.EYE ? 0.1 : -0.1;

		const x = this.size - this.size / 2;
		const y = this.size * offset;

		return {
			y,
			x: x * ratio,
			color: type === EyeType.EYE ? "#ffffff" : "#010101",
			size: type === EyeType.PUPIL ? this.size / 6 : this.size / 2.5,
		};
	}
}
