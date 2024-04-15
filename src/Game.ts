import Snake from "./Snake";
import { Direction, Food, Frame, GameSize, Path, Renderer } from "./types";

const KEY_SHIFT = "Shift";

export default class Game {
	engine: Renderer;
	lastFrame: Frame | undefined;

	// score/level vars
	score: number = 0;
	level: number = 1;
	eaten: number = 0;
	pointsPerFood: number = 10;
	foodPerLevel: number = 5;

	// game engine vars
	dir: Direction = Direction.UP;
	tick: number = 0;
	size: GameSize = [48, 48];
	speed: number = 1000;
	normalSpeed: number = 0;
	turboSpeed: number = 0;

	// where is the snake, and what is its body
	snake: Snake;
	// where is the current food located
	food: Food[];

	constructor(engine: Renderer) {
		this.engine = engine;
		this.snake = new Snake(2, 5, 4);
		this.food = [new Food(this.size[0] * 0.6, this.size[1] * 0.5)];
		this.normalSpeed = this.speed;
		this.turboSpeed = this.speed / 5;

		this.engine.init(this);
		this.keymaps();
	}

	keymaps() {
		window.addEventListener("keyup", (e: KeyboardEvent) => {
			if (e.key === KEY_SHIFT) {
				this.speed = this.normalSpeed;
				return;
			}

			if (
				["arrowup", "w", "k"].includes(e.key.toLowerCase()) &&
				this.dir !== Direction.DOWN
			) {
				this.dir = Direction.UP;
			} else if (
				["arrowdown", "s", "j"].includes(e.key.toLowerCase()) &&
				this.dir !== Direction.UP
			) {
				this.dir = Direction.DOWN;
			} else if (
				["arrowleft", "a", "h"].includes(e.key.toLowerCase()) &&
				this.dir !== Direction.RIGHT
			) {
				this.dir = Direction.LEFT;
			} else if (
				["arrowright", "d", "l"].includes(e.key.toLowerCase()) &&
				this.dir !== Direction.LEFT
			) {
				this.dir = Direction.RIGHT;
			}
		});

		window.addEventListener("keydown", (e: KeyboardEvent) => {
			if (e.key === KEY_SHIFT) {
				this.speed = this.turboSpeed;
			}
		});
	}

	start() {
		this.tick = 0;
		window.requestAnimationFrame(this.gameLoop.bind(this));
	}

	gameLoop(timestamp: number) {
		const progress = timestamp - this.tick;

		// generate next frame to draw
		if (this.tick > 0) {
			this.updateFrame(progress, this.dir);
		}

		const snake: Snake = Object.assign({}, this.snake);
		const food: Food[] = Object.assign([], this.food);

		const frame = new Frame(timestamp, snake, food);
		frame.score = this.score;
		frame.level = this.level;
		frame.direction = this.dir;
		frame.speedMultuplier =
			Math.round((this.speed / this.normalSpeed) * 100) / 100;

		this.engine.render(frame);
		this.lastFrame = frame;

		this.tick = timestamp;
		setTimeout(
			() => window.requestAnimationFrame(this.gameLoop.bind(this)),
			this.speed,
		);
	}

	updateFrame(_: number, dir: Direction) {
		const head = Object.assign([], this.snake.path[0]);

		if (dir == Direction.UP) {
			head[1] = head[1] + 1;
		} else if (dir == Direction.RIGHT) {
			head[0] = head[0] + 1;
		} else if (dir == Direction.LEFT) {
			head[0] = head[0] - 1;
		} else if (dir == Direction.DOWN) {
			head[1] = head[1] - 1;
		}

		// make sure we cannot go out of the game area
		this.outOfBounds(head, dir);

		// collision detection, did we hit some food....
		const [hitted, _1, foodIndex] = this.collideWithFood(head);
		if (hitted && foodIndex > -1) {
			// increment scores and such
			this.eaten += 1;
			this.level = Math.round(this.eaten / this.foodPerLevel) + 1;
			this.score += (this.eaten / this.foodPerLevel) * this.pointsPerFood;
			// Increase speed when levelup, min on 10ms per level
			console.log("Speed increase", 10 * (this.level - 1) * 0.75);

			this.speed = this.normalSpeed - 10 * (this.level - 1) * 0.75;
			this.turboSpeed = this.speed / 5;

			// increment snake.
			this.snake.path.unshift(head);

			// generate new food, within bound, and not colliding with snake
			const foodList = [...this.food];
			foodList.splice(foodIndex, 1);

			// generate a new food item
			this.newFoodItem(foodList);

			this.food = foodList;

			return;
		}

		const path = this.snake.path.slice(0, -1);
		this.snake.path = [head].concat(path);
	}

	outOfBounds(head: Path, dir: Direction) {
		if (dir == Direction.UP) {
			if (head[1] >= this.size[1]) {
				head[1] = 0;
			}
		} else if (dir == Direction.DOWN) {
			if (head[1] < 0) {
				head[1] = this.size[1] - 1;
			}
		} else if (dir == Direction.LEFT) {
			if (head[0] < 0) {
				head[0] = this.size[0] - 1;
			}
		} else if (dir == Direction.RIGHT) {
			if (head[0] >= this.size[0]) {
				head[0] = 0;
			}
		}
	}

	collideWithFood(head: Path): [boolean, Food | null, number] {
		for (let i in this.food) {
			const food = this.food[i];

			if (food.x === head[0] && food.y === head[1]) {
				console.log("YUMMIIII");
				return [true, food, parseInt(i)];
			}
		}

		return [false, null, -1];
	}

	newFoodItem(food: Food[]) {
		const exclude = [...this.snake.path, ...food].map((x) => JSON.stringify(x));

		// good be more efficient when after 50% of the game.
		// TODO: does it find 0,0 and 0,X or X,0??
		while (true) {
			const x = Math.floor(Math.random() * this.size[0]);
			const y = Math.floor(Math.random() * this.size[1]);

			if (!exclude.includes(JSON.stringify([x, y]))) {
				food.push(new Food(x, y));
				break;
			}
		}
	}
}
