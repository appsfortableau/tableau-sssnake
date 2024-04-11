import Game from "./Game";
import { Food, Frame, Renderer } from "./types";

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

			this.createSnake(parseInt(x), path[0], path[1]);
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

			this.createSnake(parseInt(x), path[0], path[1]);
		}

		// check which items should be removed
		const domFood = Array.from(this.container.querySelectorAll(".food"));
		const foodIds: string[] = frame.food.map(
			(food: Food) => `food_${food.x}_${food.y}`,
		);
		const foodElementIds: string[] = domFood.map(
			(x: Element) => x.getAttribute("id") || "",
		);

		// get items we need to remove
		const removeFood = foodElementIds.filter((x) => !foodIds.includes(x));
		const addFood = foodIds.filter((x) => !foodElementIds.includes(x));

		// make differences from diff perspectives to remove and/or add food.
		removeFood.map((id: string) => document.getElementById(id)?.remove());
		addFood.map((id: string) => {
			const [_, x, y] = id.split("_");
			this.createFood(parseInt(x), parseInt(y));
		});
	}
}
export default BrowserRenderer;
