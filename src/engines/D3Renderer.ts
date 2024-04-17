import Game from "../Game";
import * as d3 from "d3";
import { Direction, Food, Frame, Renderer } from "../types";
import { EyeElm } from "../Snake";

type D3Selecion = d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;

const FOOD_RATIO = 1.75;

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

	// default size
	snakeFoodSize: number = 10;

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

		this.d3.append("defs").html(`
				<linearGradient id="food-shadow" x1="0%" y1="0%" x2="0%" y2="100%">
					<stop stop-color="#FB8B24" stop-opacity="0.5"/>
					<stop offset="1" stop-color="#FB8B24" stop-opacity="0"/>
				</linearGradient>
			`);

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

		this.snakeFoodSize = Math.round(size / game.size[0] / 2);

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

		// Add X axis
		axis
			.append("g")
			.attr("transform", `translate(0, ${size - offsetY})`)
			.attr("class", "x-axis")
			.call(
				d3
					.axisBottom(this.x)
					.ticks(game.size[0])
					.tickSize(-(size - offsetX)),
			)
			.selectAll(".tick text")
			.attr("transform", "translate(0, 5)");

		// Add Y axis
		const yAxis = d3.axisLeft(this.y);
		axis
			.append("g")
			.attr("class", "y-axis")
			.call(
				yAxis
					.ticks(game.size[1])
					.tickFormat((x: number): string | null =>
						x === 0 ? null : x.toString(),
					)
					.tickSize(-(size - offsetY)),
				0,
			)
			.selectAll(".tick text")
			.attr("transform", "translate(-5, 0)");

		// Customize axises
		axis.selectAll(".domain").remove();
		axis.select(".y-axis .tick:first-child line").remove();
		axis.select(".y-axis .tick:last-child line").remove();

		axis
			.select(".x-axis .tick:first-child text")
			.attr("transform", "translate(-10, 5)");
		axis.select(".x-axis .tick:last-child line").remove();
		axis.select(".x-axis .tick:first-child line").remove();

		// Add snake
		const groupSnake = this.d3.append("g");
		groupSnake.attr("class", "snake");

		if (game.snake) {
			const snakePath = game.snake.path;

			groupSnake
				.append("path")
				.datum(snakePath)
				.attr("stroke-width", this.snakeFoodSize)
				.attr("class", "snake-body")
				.attr(
					"d",
					d3
						.line()
						.x(([x]) => this.x(x))
						.y(([_, y]) => this.y(y))
						.curve(d3.curveNatural),
				);

			// console.log(game.snake.eyesRotation(), 'asdfasdf')

			// eyes
			groupSnake
				.append("g")
				.attr("class", "snake-eyes")
				.selectAll("dot")
				.attr(
					"transform",
					`translate(${this.x(snakePath[0][0])}, ${this.y(
						snakePath[0][1],
					)}) rotate(${game.snake.eyesRotation()})`,
				)
				.data(game.snake.eyes(this.snakeFoodSize))
				.join("circle")
				.attr("cx", (eye: EyeElm) => eye.x)
				.attr("cy", (eye: EyeElm) => eye.y)
				.attr("r", (eye: EyeElm) => eye.size)
				.attr("fill", (eye: EyeElm) => eye.color);
		}

		// Add food
		const groupFood = this.d3.append("g");
		groupFood.attr("class", "food-group");

		// Food shadow/gradient
		groupFood
			.selectAll("dot")
			.data(game.food)
			.join("rect")
			.attr(
				"x",
				(food: Food) => this.x(food.x) - (this.snakeFoodSize * 1.15) / 2,
			)
			.attr("y", (food: Food) => this.y(food.y))
			.attr("width", this.snakeFoodSize * 1.15)
			.attr("height", this.snakeFoodSize * 6)
			.attr("fill", "url(#food-shadow)")
			.attr("class", "food-shadow");

		// Food circle
		groupFood
			.selectAll("dot")
			.data(game.food)
			.join("circle")
			.attr("cx", (food: Food) => this.x(food.x))
			.attr("cy", (food: Food) => this.y(food.y))
			.attr("r", this.snakeFoodSize / FOOD_RATIO)
			.attr("class", "food");
	}

	render(frame: Frame) {
		if (this.container === null) {
			throw new Error("Container not found. cannot render the game");
		}

		if (frame.snake) {
			const snakePath = frame.snake.path;
			const snake = this.d3.select(".snake");
			snake
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

			// eyes
			snake
				.select(".snake-eyes")
				.attr(
					"transform",
					`translate(${this.x(snakePath[0][0])}, ${this.y(
						snakePath[0][1],
					)}) rotate(${frame.snake.eyesRotation()})`,
				)
				.selectAll("circle")
				.data(frame.snake.eyes(this.snakeFoodSize))
				.join("circle")
				.attr("cx", (eye: EyeElm) => eye.x)
				.attr("cy", (eye: EyeElm) => eye.y)
				.attr("r", (eye: EyeElm) => eye.size)
				.attr("fill", (eye: EyeElm) => eye.color);
		}

		// check which items should be removed
		const groupFood = this.d3.select(".food-group");
		groupFood
			.selectAll("circle")
			.data(frame.food)
			.join("circle")
			.attr("cx", (food: Food) => this.x(food.x))
			.attr("cy", (food: Food) => this.y(food.y))
			.attr("id", (food: Food) => `food_${food.x}_${food.y}`)
			.attr("r", this.snakeFoodSize / FOOD_RATIO)
			.attr("class", "food");
	}
}

export default D3Renderer;
