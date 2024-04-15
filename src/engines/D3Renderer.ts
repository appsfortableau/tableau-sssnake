import Game from "../Game";
import * as d3 from "d3";
import { Food, Frame, Renderer } from "../types";

type D3Selecion = d3.Selection<SVGGElement, unknown, HTMLElement, any>;

class D3Renderer implements Renderer {
	pixel: number[] = [20, 20];
	game: Game | undefined;

	// d3 container
	d3: D3Selecion;
	// d3 x axis
	x: any;
	// d3 y axis
	y: any;

	container: HTMLElement | null = null;

	constructor() {
		this.container = document.getElementById("game");
		// this.setContainerSize();

		// set the dimensions and margins of the graph
		const margin = { top: 0, right: 0, bottom: 0, left: 0 },
			width = (this.container?.offsetWidth || 470) - margin.left - margin.right,
			height =
				(this.container?.offsetHeight || 470) - margin.top - margin.bottom;

		// append the svg object to the body of the page
		this.d3 = d3
			.select("#game")
			.append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", `translate(${margin.left}, ${margin.top})`);
	}

	// createSnake(i: number, x: number, y: number) {
	// 	// Add dots
	// 	this.d3
	// 		.append("g")
	// 		.selectAll("dot")
	// 		.data([[x, y]])
	// 		.join("circle")
	// 		.attr("cx", ([x1]: [number, number]) => x(x1))
	// 		.attr("cy", ([y1]: [number, number]) => y(y1))
	// 		.attr("r", 5)
	// 		.style("fill", "#69b3a2");
	//
	// 	// const snake = document.createElement("div");
	// 	// snake.setAttribute("id", "snake_" + i);
	// 	// snake.classList.add("snake");
	// 	// snake.style.width = this.pixel + "px";
	// 	// snake.style.height = this.pixel + "px";
	// 	//
	// 	// snake.style.left = `${x * this.pixel[0]}px`;
	// 	// snake.style.bottom = `${y * this.pixel[1]}px`;
	// 	//
	// 	// this.container?.appendChild(snake);
	// }

	// createFood(x: number, y: number) {
	// 	const snake = document.createElement("div");
	// 	snake.setAttribute("id", `food_${x}_${y}`);
	// 	snake.classList.add("food");
	// 	snake.style.width = this.pixel + "px";
	// 	snake.style.height = this.pixel + "px";
	//
	// 	snake.style.left = `${x * this.pixel[0]}px`;
	// 	snake.style.bottom = `${y * this.pixel[1]}px`;
	//
	// 	this.container?.appendChild(snake);
	// }

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

		// Add X axis
		this.x = d3
			.scaleLinear()
			.domain([0, this.game.size[0]])
			.range([0, this.container?.offsetWidth || 480]);

		this.y = d3
			.scaleLinear()
			.domain([0, this.game.size[1]])
			.range([this.container?.offsetHeight || 400, 0]);

		// for (const x in game.snake.path) {
		// 	const path = game.snake.path[x];
		//
		// 	this.createSnake(parseInt(x), path[0], path[1]);
		// }

		// Add snake
		const groupSnake = this.d3.append("g");
		groupSnake.attr("class", "snake");
		// groupSnake
		// 	.selectAll("dot")
		// 	.data(game.snake.path)
		// 	.join("circle")
		// 	.attr("cx", ([x]: [number, number]) => this.x(x))
		// 	.attr("cy", ([_, y]: [number, number]) => this.y(y))
		// 	.attr("r", 5)
		// 	.style("fill", "#69b3a2");

		groupSnake
			.append("path")
			.datum(game.snake.path)
			.attr("fill", "none")
			.attr("stroke", "steelblue")
			.attr("stroke-width", 10)
			.attr("stroke-linecap", "round")
			.attr(
				"d",
				d3
					.line()
					.x(([x]) => this.x(x))
					.y(([_, y]) => this.y(y))
					// .curve(d3.curveCatmullRom.alpha(0.5)),
					.curve(d3.curveNatural),
			)
			.attr("class", "snake-line");

		// Add food
		const groupFood = this.d3.append("g");
		groupFood.attr("class", "food");
		groupFood
			.selectAll("dot")
			.data(game.food)
			.join("circle")
			.attr("cx", (food: Food) => this.x(food.x))
			.attr("cy", (food: Food) => this.y(food.y))
			.attr("r", 5)
			.style("fill", "#ff0000");
	}

	render(frame: Frame) {
		if (this.container === null) {
			throw new Error("Container not found. cannot render the game");
		}

		// this.d3
		// 	.select(".snake")
		// 	.selectAll("circle")
		// 	.data(frame.snake.path)
		// 	.transition()
		// 	.duration(10)
		// 	.attr("cx", ([x]: [number, number]) => this.x(x))
		// 	.attr("cy", ([_, y]: [number, number]) => this.y(y));

		this.d3
			.select(".snake")
			.select("path")
			.datum(frame.snake.path)
			.transition()
			.duration(50)
			.attr(
				"d",
				d3
					.line()
					.x(([x]) => this.x(x))
					.y(([_, y]) => this.y(y))
					// .curve(d3.curveCatmullRom.alpha(0.5)),
					.curve(d3.curveNatural),
			);

		// check which items should be removed
		const groupFood = this.d3.select(".food");
		groupFood
			.selectAll("circle")
			.data(frame.food)
			.join("circle")
			.attr("cx", (food: Food) => this.x(food.x))
			.attr("cy", (food: Food) => this.y(food.y))
			.attr("id", (food: Food) => `food_${food.x}_${food.y}`)
			.attr("r", 5)
			.style("fill", "#ff0000");
	}
}
export default D3Renderer;
