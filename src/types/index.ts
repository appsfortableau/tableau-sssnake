import Game from "../Game";
import { SomeSnake } from "../Snake";

export interface Renderer {
	init: (game: Game) => void;
	render: (frame: Frame) => void;
	hoverDatapoint: (food: Food, x: number, y: number) => void;
	hoverOut: (food: Food) => void;
}

export type Some<T> = T | undefined;

export type Path = [number, number];

export class Food {
	i: number = 0;
	x: number = 0;
	y: number = 0;
	color: string = "#FB8B24";

	constructor(x: number, y: number, rowIndex: number) {
		this.x = Math.round(x);
		this.y = Math.round(y);
		this.i = rowIndex;
	}
}

export class Frame {
	// where is the snake, and what is its body
	snake: SomeSnake;
	// where is the current food located
	food: Food[];
	// what is the new/current score
	score: number = 0;
	// what is the level.
	level: number = 1;
	// what is the current Direction of the snake
	direction: Direction = Direction.UP;
	// what is the speed multiplier, float64/decimal
	speedMultuplier: number = 1;

	constructor(timestamp: number, snake: SomeSnake, food: Food[]) {
		console.log("[D3] Frame timestamp:", timestamp);
		this.snake = snake;
		this.food = food;
	}
}

// x, y
export type GameSize = [number, number];

export enum Direction {
	UP, // 0
	DOWN, // 1
	LEFT, // 2
	RIGHT, // 3
}
