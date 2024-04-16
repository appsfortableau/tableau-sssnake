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

	margins: {
		left: number;
		right: number;
		top: number;
		bottom: number;
	};

	container: HTMLElement | null = null;

	constructor() {
		this.container = document.getElementById("game");

		// set the dimensions and margins of the graph
		this.margins = { top: 0, right: 0, bottom: 25, left: 25 };
		const size = this.getSize();

		const graphWidth = size + this.margins.left + this.margins.right;
		const graphHeight = size + this.margins.top + this.margins.bottom;

		// append the svg object to the body of the page
		this.d3 = d3
			.select("#game")
			.append("svg")
			.attr("class", "game-svg")
			.attr("width", graphWidth)
			.attr("height", graphHeight)
			.attr("viewBox", `0 0 ${size} ${size}`);

		window.addEventListener("resize", () => {
			const size = this.getSize();

			const graphWidth = size + this.margins.left + this.margins.right;
			const graphHeight = size + this.margins.top + this.margins.bottom;

			this.d3.attr("width", graphWidth).attr("height", graphHeight);
		});
	}

	getSize(): number {
		const windowWidth = Math.round(this.container?.offsetWidth || 1024);
		const windowHeight = Math.round(this.container?.offsetHeight || 756);

		return windowHeight > windowWidth ? windowWidth : windowHeight;
	}

	init(game: Game) {
		this.game = game;

		const gridX = this.game.size[0];
		const gridY = this.game.size[1];
		const size = this.getSize();

		const offsetX = this.margins.left + this.margins.right;
		const offsetY = this.margins.top + this.margins.bottom;
		// Add X axis
		this.x = d3
			.scaleLinear()
			.domain([0, gridX])
			.range([0, size - offsetX]);

		this.y = d3
			.scaleLinear()
			.domain([0, gridY])
			.range([size - offsetY, 0]);

		const axis = this.d3.append("g");
		axis.attr("class", "axis-group");

		function labelFormatter(x: number): string | null {
			return x === 0 ? null : x.toString();
		}

		// Add X axis
		axis
			.append("g")
			.attr("transform", `translate(0, ${size - offsetY})`)
			.attr("class", "x-axis")
			.call(
				d3
					.axisBottom(this.x)
					.ticks(game.size[0])
					// .tickFormat(labelFormatter)
					.tickSize(-(size - offsetX)),
			)
			.selectAll(".tick text")
			.attr("transform", "translate(0, 5)")

		// Add Y axis
		axis
			.append("g")
			.attr("class", "y-axis")
			.call(
				d3
					.axisLeft(this.y)
					.ticks(game.size[1])
					.tickFormat(labelFormatter)
					.tickSize(-(size - offsetY)),
			)
			.selectAll(".tick text")
			.attr("transform", "translate(-5, 0)");

		// Customize axises
		axis.selectAll(".domain").remove();
		axis.select(".y-axis .tick:first-child line").remove();
		axis.select(".y-axis .tick:last-child line").remove();

		axis.select(".x-axis .tick:first-child text")
			.attr("transform", "translate(-10, 5)");
		axis.select(".x-axis .tick:last-child line").remove();
		axis.select(".x-axis .tick:first-child line").remove();

		// Add snake
		const groupSnake = this.d3.append("g");
		groupSnake.attr("class", "snake");
		// .attr(
		// 	"transform",
		// 	`translate(${this.margins.left}, ${this.margins.top})`,
		// );
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
		// groupFood.attr(
		// 	"transform",
		// 	`translate(${this.margins.left}, ${this.margins.top})`,
		// );
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
