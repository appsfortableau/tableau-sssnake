import "./style.css";

import Game from "./Game";
import D3Renderer from "./engines/D3Renderer";
import TableauRenderer from "./engines/TableauRenderer";
import { Direction, Food } from "./types";
import Snake from "./Snake";
import { Tableau } from "./types/extensions-api-types";

((tableau: Tableau) => {
	function configure() {
		console.log("Open configurer");
	}

	console.log(tableau);

	const d3 = new D3Renderer();
	const tabl = new TableauRenderer(tableau);

	const game = new Game([d3, tabl]);

	tableau.extensions.initializeAsync({ configure: configure }).then(
		() => {
			console.log(tableau);
			tabl.initTableau();

			// game.setSize(32, 32);
			game.addSnake(new Snake(2, 5, 3, Direction.UP));

			// set data/food
			game.setData([
				new Food(32 * 0.6, 32 * 0.5),
				new Food(32 * 0.1, 32 * 0.8),
				new Food(32 * 0.87, 32 * 0.9),
				new Food(32 * 0.81, 32 * 0.95),
			]);

			// must be done before rendering, so the engines are initialized
			// with the first set of settings/configuration.
			game.initEngines();

			// Render only the first frame, and do not start the game
			game.runFrame(new Date().getTime());
			// // Get the worksheet that the Viz Extension is running in
			// const worksheet = tableau.extensions.worksheetContent?.worksheet;
			// console.log(worksheet);
			// console.log(`The name of the worksheet is ${worksheet.name}`);

			// actually start the game..
			// game.start();
		},
		(err: Error) => {
			console.log(err);
			// Something went wrong in initialization.
			console.log("Error while Initializing: " + err.toString());
		},
	);
})(window.tableau);
