import "./style.css";

// x, y, width, height
type GameSize = [number, number];

enum Direction {
	UP, // 0
	DOWN, // 1
	LEFT, // 2
	RIGHT, // 3
}

class Game {
	engine: Renderer;
	lastFrame: Frame | undefined;

	score: number = 0;
	tick: number = 0;

	size: GameSize = [48, 48];

	// where is the snake, and what is its body
	snake: Snake;
	// where is the current food located
	food: Food[];

	dir: Direction = Direction.UP;

	speed: number = 500;

	constructor(engine: Renderer) {
		this.engine = engine;
		this.snake = new Snake(2, 5, 4);
		this.food = [new Food(this.size[0] * 0.6, this.size[1] * 0.5)];

		this.engine.init(this);
		this.keymaps();
	}

	keymaps() {
		window.addEventListener("keyup", (e: KeyboardEvent) => {
			if (e.key === " ") {
				this.speed = 500;
				return;
			}

			if (
				["ArrowUp", "w", "k"].includes(e.key) &&
				this.dir !== Direction.DOWN
			) {
				this.dir = Direction.UP;
			} else if (
				["ArrowDown", "s", "j"].includes(e.key) &&
				this.dir !== Direction.UP
			) {
				this.dir = Direction.DOWN;
			} else if (
				["ArrowLeft", "a", "h"].includes(e.key) &&
				this.dir !== Direction.RIGHT
			) {
				this.dir = Direction.LEFT;
			} else if (
				["ArrowRight", "d", "l"].includes(e.key) &&
				this.dir !== Direction.LEFT
			) {
				this.dir = Direction.RIGHT;
			}
		});

		window.addEventListener("keydown", (e: KeyboardEvent) => {
			if (e.key === " ") {
				this.speed = 100;
			}
		});
	}

	start() {
		this.tick = 0;
		window.requestAnimationFrame(this.gameLoop.bind(this));
	}

	gameLoop(timestamp: number) {
		const progress = timestamp - this.tick;

		// TODO: catch movement position: up, down, left, right

		// TODO: generate next frame to draw
		if (this.tick > 0) {
			this.updateFrame(progress, this.dir);
		}

		const snake: Snake = Object.assign({}, this.snake);
		const food: Food[] = Object.assign([], this.food);

		const frame = new Frame(timestamp, snake, food);
		this.engine.render(frame);
		this.lastFrame = frame;

		this.tick = timestamp;
		setTimeout(
			() => window.requestAnimationFrame(this.gameLoop.bind(this)),
			this.speed,
		);
	}

	updateFrame(timestamp: number, dir: Direction) {
		const head = Object.assign([], this.snake.path[0]);
		const path = this.snake.path.slice(0, -1);

		console.log("direction:", dir);

		if (dir == Direction.UP) {
			head[1] = head[1] + 1;
		} else if (dir == Direction.RIGHT) {
			head[0] = head[0] + 1;
		} else if (dir == Direction.LEFT) {
			head[0] = head[0] - 1;
		} else if (dir == Direction.DOWN) {
			head[1] = head[1] - 1;
		}

		this.outOfBounds(head, dir);

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
}

// Holds the current calculdated game state
class Frame {
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

type Path = [number, number];
class Snake {
	len: number = 2;

	// Body: [[x,y], [x, y]]
	path: Path[];

	constructor(x: number, y: number, len: number) {
		if (len > 0) {
			this.len = len;
		}

		const path: Path[] = [];
		for (let i = 0; i < this.len; i++) {
			console.log("pso", x, y - i);
			path.push([x, y - i] as Path);
		}

		this.path = path;
	}
}

class Food {
	x: number = 0;
	y: number = 0;

	constructor(x: number, y: number) {
		this.x = Math.round(x);
		this.y = Math.round(y);
	}
}

interface Renderer {
	init: (game: Game) => void;
	render: (frame: Frame) => void;
}

class VizRenderer implements Renderer {
	// how to render the game, as VizExtension
	render(frame: Frame) {
		console.log("Render frame: ", frame.snake);
	}
}

class BrowserRenderer implements Renderer {
	pixel: number = 20;

	container: HTMLElement | null = null;

	constructor() {
		this.container = document.getElementById("game");
	}

	createSnake(i: number, x: number, y: number) {
		const snake = document.createElement("div");
		snake.setAttribute("id", "snake_" + i);
		snake.classList.add("snake");
		snake.style.width = this.pixel + "px";
		snake.style.height = this.pixel + "px";

		snake.style.left = `${x * this.pixel}px`;
		snake.style.bottom = `${y * this.pixel}px`;

		this.container?.appendChild(snake);
	}

	createFood(i: number, x: number, y: number) {
		const snake = document.createElement("div");
		snake.setAttribute("id", "food_" + i);
		snake.classList.add("food");
		snake.style.width = this.pixel + "px";
		snake.style.height = this.pixel + "px";

		snake.style.left = `${x * this.pixel}px`;
		snake.style.bottom = `${y * this.pixel}px`;

		this.container?.appendChild(snake);
	}

	init(game: Game) {
		if (this.container === null) {
			throw new Error("Container not found. cannot render the game");
		}
		this.container.style.width = `${game.size[0] * this.pixel}px`;
		this.container.style.height = `${game.size[1] * this.pixel}px`;

		for (const x in game.snake.path) {
			const path = game.snake.path[x];

			this.createSnake(x, path[0], path[1]);
		}

		for (const x in game.food) {
			const food = game.food[x];

			this.createFood(x, food.x, food.y);
		}
	}

	render(frame: Frame) {
		if (this.container === null) {
			throw new Error("Container not found. cannot render the game");
		}

		for (const x in frame.snake.path) {
			const path = frame.snake.path[x];

			const prevSnake = this.container.querySelector(`#snake_${x}`);

			if (prevSnake) {
				prevSnake.style.left = `${path[0] * this.pixel}px`;
				prevSnake.style.bottom = `${path[1] * this.pixel}px`;
				continue;
			}

			this.createSnake(x, path[0], path[1]);
		}
	}
}

const engine = new BrowserRenderer();

const game = new Game(engine);

game.start();

console.log(game);
