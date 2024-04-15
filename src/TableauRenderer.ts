import Game from "./Game";
import { Food, Frame, Renderer } from "./types";

module mytableau {
	export type extensions = {
		dashboardContent: {
			dashboard: tableau.Dashboard;
		};
		worksheetContent: {
			worksheet: Worksheet;
		};
	};

	export interface Parameter extends tableau.Parameter {
		changeValueAsync(
			newValue: string | number | boolean | Date,
		): Promise<tableau.DataValue>;
	}

	export interface Worksheet extends tableau.Worksheet {
		findParameterAsync(
			paramName: string,
		): Promise<tableau.Parameter | undefined>;
		getParametersAsync(): Promise<tableau.Parameter[]>;
	}
}

class TableauRenderer implements Renderer {
	pixel: number[] = [20, 20];
	game: Game | undefined;

	container: HTMLElement | null = null;

	tableau: mytableau.extensions;
	worksheet: mytableau.Worksheet;
	paramScore: mytableau.Parameter | undefined;
	paramLevel: mytableau.Parameter | undefined;

	constructor(t: mytableau.extensions) {
		this.container = document.getElementById("game");
		this.tableau = t;
	}

	async initTableau() {
		this.worksheet = this.tableau.worksheetContent.worksheet;
		this.paramScore = await this.worksheet.findParameterAsync("score");
		this.paramLevel = await this.worksheet.findParameterAsync("level");
	}

	createSnake(i: number, x: number, y: number) {
		const snake = document.createElement("div");
		snake.setAttribute("id", "snake_" + i);
		snake.classList.add("snake");
		snake.style.width = this.pixel[0] + "px";
		snake.style.height = this.pixel[1] + "px";

		snake.style.left = `${x * this.pixel[0]}px`;
		snake.style.bottom = `${y * this.pixel[1]}px`;

		this.container?.appendChild(snake);
	}

	createFood(x: number, y: number) {
		const snake = document.createElement("div");
		snake.setAttribute("id", `food_${x}_${y}`);
		snake.classList.add("food");
		snake.style.width = this.pixel[0] + "px";
		snake.style.height = this.pixel[1] + "px";

		snake.style.left = `${x * this.pixel[0]}px`;
		snake.style.bottom = `${y * this.pixel[1]}px`;

		this.container?.appendChild(snake);
	}

	setContainerSize() {
		if (this.container === null) {
			throw new Error("Container not found. cannot render the game");
		} else if (!this.game) {
			throw new Error("Game not initialized yet.");
		}

		this.pixel = [
			(window.innerWidth - 10) / this.game.size[0], // borders
			(window.innerHeight - 10) / this.game.size[0], // borders
		];
		this.container.style.width = `${this.game.size[0] * this.pixel[0]}px`;
		this.container.style.height = `${this.game.size[1] * this.pixel[1]}px`;
	}

	init(game: Game) {
		this.game = game;

		this.setContainerSize();
		window.addEventListener("resize", this.setContainerSize);

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

		this.paramScore?.changeValueAsync(frame.score).then(() => {
			console.log("[score] updated!", frame.score);
		});
		this.paramLevel?.changeValueAsync(frame.level).then(() => {
			console.log("[level] updated!", frame.level);
		});

		for (const x in frame.snake.path) {
			const path = frame.snake.path[x];

			const prevSnake = this.container.querySelector(`#snake_${x}`);
			if (prevSnake) {
				prevSnake.style.left = `${path[0] * this.pixel[0]}px`;
				prevSnake.style.bottom = `${path[1] * this.pixel[1]}px`;
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
export default TableauRenderer;
