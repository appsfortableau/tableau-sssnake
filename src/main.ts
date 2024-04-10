import "./style.css";

// x, y, width, height
type GameSize = [number, number];

enum Direction {
	UP,
	DOWN,
	LEFT,
	RIGHT,
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

	constructor(engine: Renderer) {
		this.engine = engine;
		this.snake = new Snake(2, 5, 4);
		this.food = [new Food(this.size[0] * 0.6, this.size[1] * 0.5)];

		console.log("inital", this.snake);
	}

	start() {
		this.tick = 0;
		window.requestAnimationFrame(this.gameLoop.bind(this));

		setTimeout(() => {
			window.requestAnimationFrame(this.gameLoop.bind(this));
		}, 500);

		setTimeout(() => {
			this.dir = Direction.RIGHT;
			window.requestAnimationFrame(this.gameLoop.bind(this));
		}, 1000);
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
		// window.requestAnimationFrame(this.gameLoop.bind(this));
	}

	updateFrame(timestamp: number, dir: Direction) {
		const head = Object.assign([], this.snake.path[0]);
		const path = this.snake.path.slice(0, -1);

		console.log("original path", path);
		console.log("updating frane?");
		console.log("path", path);
		console.log("head", head);

		if (dir == Direction.UP) {
			head[1] = head[1] + 1;
		} else if (dir == Direction.RIGHT) {
			head[0] = head[0] + 1;
		} else if (dir == Direction.LEFT) {
			head[0] = head[0] - 1;
		} else if (dir == Direction.DOWN) {
			head[1] = head[1] - 1;
		}

		this.snake.path = [head].concat(path);
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
	render: (frame: Frame) => void;
}

class VizRenderer implements Renderer {
	// how to render the game, as VizExtension
	render(frame: Frame) {
		console.log("Render frame: ", frame.snake);
	}
}

const engine = new VizRenderer();

const game = new Game(engine);

game.start();

console.log(game);
