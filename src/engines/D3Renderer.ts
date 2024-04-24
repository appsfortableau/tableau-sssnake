import Game from "../libs/Game";
import * as d3 from "d3";
import { Food, Frame, Renderer } from "../types";
import { EyeElm } from "../libs/Snake";
import { HoverDatapointCallback, ClickDatapointCallback } from "../Demo";

type D3Selecion = d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
type D3Selected = d3.Selection<d3.BaseType, Food, d3.BaseType, unknown>;

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
	//@ts-ignore
	onHoverCb: HoverDatapointCallback;
	onClickCb: ClickDatapointCallback;
	selection: number[] = [];

	constructor() {
		this.container = document.getElementById("game");
	}

	buildSvg() {
		// set the dimensions and margins of the graph
		const size = this.getSize();
		d3.select("#game > *").remove();

		// append the svg object to the body of the page
		this.d3 = d3
			.select("#game")
			.append("svg")
			.attr("class", "game-svg")
			.attr("width", size)
			.attr("height", size)
			.attr("viewBox", `0 0 ${size} ${size}`);

		this.d3.append("defs").html(`
				<linearGradient id="food-shadow" x1="0%" y1="0%" x2="0%" y2="100%">
					<stop stop-color="#FB8B24" stop-opacity="0.5"/>
					<stop offset="1" stop-color="#FB8B24" stop-opacity="0"/>
				</linearGradient>

				<filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
					<feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur"/>
					<feOffset in="blur" dx="0" dy="0" result="offsetBlur"/>
					<feFlood flood-color="red" result="color"/>
					<feComposite in="color" in2="offsetBlur" operator="in" result="shadow"/>
					<feMerge>
						<feMergeNode in="shadow"/>
						<feMergeNode in="SourceGraphic"/>
					</feMerge>
				</filter>
			`);

		window.addEventListener("resize", () => {
			const size = this.getSize();

			this.d3.attr("width", size).attr("height", size);
		});
	}

	getSize(): number {
		const windowWidth = Math.round(window.innerWidth * 0.9);
		const windowHeight = Math.round(window.innerHeight * 0.9);

		return windowHeight > windowWidth ? windowWidth : windowHeight;
	}

	init(game: Game) {
		this.game = game;

		this.buildSvg();

		const gridX = this.game.size[0];
		const gridY = this.game.size[1];
		const size = this.getSize();

		this.snakeFoodSize = Math.round(size / game.size[0] / 2);

		// Add X axis
		this.x = d3.scaleLinear().domain([0, gridX]).range([0, size]);

		this.y = d3.scaleLinear().domain([0, gridY]).range([size, 0]);

		const axis = this.d3.append("g");
		axis.attr("class", "axis-group");

		// Add X axis
		axis
			.append("g")
			.attr("transform", `translate(0, ${size})`)
			.attr("class", "x-axis")
			.call(
				d3
					.axisBottom(this.x)
					.ticks(game.size[0])
					.tickFormat((y: number): string | null =>
						y === 0 ? null : `${y}k`,
					)
					.tickSize(-size),
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
						x === 0 ? null : `${x}k`,
					)
					.tickSize(-size),
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
						.y(([_, y]) => this.y(y)),
					// .curve(d3.curveNatural),
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

		// Food circle
		this.drawFood(groupFood.selectAll("g.food-elm").data(game.food));
	}

	render(frame: Frame) {
		if (this.container === null) {
			throw new Error("Container not found. cannot render the game");
		}

		if (frame.snake) {
			const snakePath = frame.snake.path;
			const snake = this.d3.select(".snake");

			if (snake.select("path").size() === 0) {
				snake
					.append("path")
					.attr("stroke-width", this.snakeFoodSize)
					.attr("class", "snake-body");
				snake.append("g").attr("class", "snake-eyes");
			}

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
		groupFood.selectAll("g.food-elm").remove();

		this.drawFood(groupFood.selectAll("g.food-elm").data(frame.food));
	}

	drawFood(groupFood: D3Selected) {
		const food = groupFood
			.join("g")
			.attr("class", "food-elm")
			.attr("data-tuple", (food: Food) => food.i + 1);

		// // Shadows
		// food
		// 	.append("rect")
		// 	.attr(
		// 		"x",
		// 		(food: Food) => this.x(food.x) - (this.snakeFoodSize * 1.15) / 2,
		// 	)
		// 	.attr("y", (food: Food) => this.y(food.y))
		// 	.attr("width", this.snakeFoodSize * 1.15)
		// 	.attr("height", this.snakeFoodSize * 6)
		// 	.attr("fill", "url(#food-shadow)")
		// 	.attr("class", "food-shadow");

		const offset = (this.snakeFoodSize / 2) * -1;
		// Food items
		food
			.append("rect")
			.attr("x", (food: Food) => this.x(food.x))
			.attr("y", (food: Food) => this.y(food.y))
			.attr("transform", `translate(${offset}, ${offset})`)
			.attr("width", this.snakeFoodSize)
			.attr("height", this.snakeFoodSize)
			// .append("circle")
			// .attr("cx", (food: Food) => this.x(food.x))
			// .attr("cy", (food: Food) => this.y(food.y))
			.attr("id", (food: Food) => `food_${food.x}_${food.y}`)
			// .attr("r", this.snakeFoodSize / FOOD_RATIO)
			.attr("class", "food")
			.attr("style", (food: Food) => `--fill-color: ${food.color}`)
			// .attr("fill", (food: Food) => food.color)
			.on("mousemove", (e) => {
				const self = d3.select(e.target);
				const food = self.data()[0] as Food;

				this.onHoverCb && this.onHoverCb(food, e.clientX, e.clientY);
				// this.game?.hoverDatapoint(food, e.clientX, e.clientY);
			})
			.on("mouseout", (e) => {
				const self = d3.select(e.target);
				const food = self.data()[0] as Food;

				this.game?.hoverOut(food);
			})
			.on("click", (e: MouseEvent) => {
				const self = d3.select(e.target);
				const food = self.data()[0] as Food;

				this.d3.selectAll(".food-elm.active").classed("active", false);

				const tupleId = food.i + 1;
				this.toggleSelection(tupleId, e);

				// highlight the active onces!
				this.selection.forEach((tuple: number) => {
					this.d3
						.select(`.food-elm[data-tuple='${tuple}']`)
						.classed("active", true);
				});

				this.d3
					.select(".food-group")
					.classed("has-selection", this.selection.length > 0);

				this.onClickCb && this.onClickCb(food, e);
			});
	}

	onHover(cb: HoverDatapointCallback) {
		this.onHoverCb = cb;
	}

	onClick(cb: ClickDatapointCallback) {
		this.onClickCb = cb;
	}

	toggleSelection(tupleId: number, mouseEvent: MouseEvent): number[] {
		const ctrlKeyPressed =
			!!mouseEvent.ctrlKey || !!mouseEvent.shiftKey || mouseEvent.metaKey;
		const option = ctrlKeyPressed
			? tableau.SelectOptions.Toggle
			: tableau.SelectOptions.Simple;

		switch (option) {
			case tableau.SelectOptions.Toggle:
				if (this.selection.includes(tupleId)) {
					const i = this.selection.findIndex((x: number) => x === tupleId);
					this.selection.splice(i, 1);
				} else {
					this.selection.push(tupleId);
				}
				break;
			case tableau.SelectOptions.Simple:
				if (this.selection.includes(tupleId) && this.selection.length === 1) {
					this.selection = [];
				} else {
					this.selection = [tupleId];
				}
				break;
		}

		return this.selection;
	}

	// When a datapoint in the chart has been hovered
	hoverDatapoint(_: Food, _1: number, _2: number) {
		//
	}

	hoverOut(_: Food) {
		//
	}
}

export default D3Renderer;
