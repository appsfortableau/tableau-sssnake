import Game from "./Game";
import Snake from "./Snake";

export interface Renderer {
	init: (game: Game) => void;
	render: (frame: Frame) => void;
}

export type Path = [number, number];

export class Food {
	x: number = 0;
	y: number = 0;

	constructor(x: number, y: number) {
		this.x = Math.round(x);
		this.y = Math.round(y);
	}
}

export class Frame {
	// where is the snake, and what is its body
	snake: Snake;
	// where is the current food located
	food: Food[];

	constructor(timestamp: number, snake: Snake, food: Food[]) {
		console.log("Frame timestamp:", timestamp);

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