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
			if (e.key === " ") {
				this.speed = this.normalSpeed;
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

		// make sure we cannot go out of the game area
		this.outOfBounds(head, dir);

		// collision detection, did we hit some food....
		const [hitted, food, foodIndex] = this.collideWithFood(head);
		if (hitted && foodIndex > -1) {
			// increment scores and such
			this.eaten += 1;
			this.level = Math.round(this.eaten / this.foodPerLevel) + 1;
			this.score += (this.eaten / this.foodPerLevel) * this.pointsPerFood;
			// this.speed = this.speed / (this.level * .75)

			// increment snake.
			this.snake.path.unshift(head);

			// generate new food, within bound, and not colliding with snake
			const foodList = [...this.food];
			foodList.splice(foodIndex, 1);

			// generate a new food item
			this.newFoodItem(foodList);

			console.log("New food list", foodList);

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
				console.log([true, food, parseInt(i)]);
				return [true, food, parseInt(i)];
			}
		}

		return [false, null, -1];
	}

	newFoodItem(food: Food[]) {
		const exclude = [...this.snake.path, ...food].map((x) => JSON.stringify(x));

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

	createFood(x: number, y: number) {
		const snake = document.createElement("div");
		snake.setAttribute("id", `food_${x}_${y}`);
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

			this.createFood(food.x, food.y);
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

		// check which items should be removed
		const domFood = Array.from(this.container.querySelectorAll(".food"));
		const foodIds: string[] = frame.food.map(
			(food: Food) => `food_${food.x}_${food.y}`,
		);
		const foodElementIds: string[] = domFood.map(
			(x: HTMLElement) => x.getAttribute("id") || "",
		);

		// get items we need to remove
		const removeFood = foodElementIds.filter((x) => !foodIds.includes(x));
		const addFood = foodIds.filter((x) => !foodElementIds.includes(x));

		console.log("==============================");
		console.log("Food elements", foodElementIds);
		console.log("Food items", foodIds);

		console.log("Remove food elements", removeFood);
		console.log("Add food elements", addFood);

		removeFood.map((id: string) => document.getElementById(id).remove());
		addFood.map((id: string) => {
			const parts = id.split("_");
			this.createFood(parseInt(parts[1]), parseInt(parts[2]));
		});

		// .forEach((item) => {
		// 	const id = item.getAttribute("id");
		//
		// 	if (!frame.food.find((f: Food) => `food_${f.x}_${f.y}` === id)) {
		// 		item.remove();
		// 	}
		// });

		// check which items there should be added.
		// for (const x in frame.food) {
		//
		// }
	}
}

const engine = new BrowserRenderer();

const game = new Game(engine);

game.start();

console.log(game);
