import Game from "../Game";
import * as d3 from "d3";
import { Food, Frame, Renderer } from "../types";

type D3Selecion = d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;

class D3Renderer implements Renderer {
	pixel: number[] = [50, 50];
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

		// set the dimensions and margins of the graph
		const margin = { top: 0, right: 0, bottom: 0, left: 0 };
		const size = this.getSize();

		// append the svg object to the body of the page
		this.d3 = d3
			.select("#game")
			.append("svg")
			.attr("class", "game-svg")
			.attr("width", size)
			.attr("height", size)
			.attr("transform", `translate(${margin.left}, ${margin.top})`)
			.attr("viewBox", `0 0 ${size} ${size}`);

		window.addEventListener("resize", () => {
			const size = this.getSize();

			this.d3.attr("width", size).attr("height", size);
		});
	}

	getSize(): number {
		const windowWidth = Math.round(this.container?.offsetWidth || 1024);
		const windowHeight = Math.round(this.container?.offsetHeight || 756);

		return windowHeight > windowWidth ? windowWidth : windowHeight;
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
		groupFood.attr("class", "food-group");
		groupFood
			.selectAll("dot")
			.data(game.food)
			.join("circle")
			.attr("cx", (food: Food) => this.x(food.x))
			.attr("cy", (food: Food) => this.y(food.y))
			.attr("r", 5)
			.attr("class", "food");
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
		const groupFood = this.d3.select(".food-group");
		groupFood
			.selectAll("circle")
			.data(frame.food)
			.join("circle")
			.attr("cx", (food: Food) => this.x(food.x))
			.attr("cy", (food: Food) => this.y(food.y))
			.attr("id", (food: Food) => `food_${food.x}_${food.y}`)
			.attr("r", 5)
			.attr("class", "food");
	}
}
export default D3Renderer;
