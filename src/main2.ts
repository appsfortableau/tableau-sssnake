import "./style.css";

import Game from "./libs/Game";
import D3Renderer from "./engines/D3Renderer";
import TableauRenderer from "./engines/TableauRenderer";
import { Tableau } from "./types/extensions-api-types";

((tableau: Tableau) => {
	console.log(tableau);

	const d3 = new D3Renderer();
	const tabl = new TableauRenderer(tableau);

	const game = new Game([d3, tabl]);
	tableau.extensions.initializeAsync().then(
		() => {
			tabl.initTableau();

			// must be done before rendering, so the engines are initialized
			// with the first set of settings/configuration.
			game.initEngines();

			// Render only the first frame, and do not start the game
			game.runFrame(new Date().getTime());

			// actually start the game..
			// game.start();
		},
		(err: Error) => {
			console.log(err);
			// Something went wrong in initialization.
			console.log("Error while Initializing: " + err.toString());
		},
	);

	// some fallback
	// if (!tableau.extensions.worksheetContent) {
	// 	game.setSize(32, 32);
	// 	game.addSnake(new Snake(2, 5, 3, Direction.UP));
	//
	// 	// set data/food
	// 	game.setData([
	// 		new Food(32 * 0.6, 32 * 0.5, 0),
	// 		new Food(32 * 0.1, 32 * 0.8, 1),
	// 		new Food(32 * 0.87, 32 * 0.9, 2),
	// 		new Food(32 * 0.81, 32 * 0.95, 3),
	// 	]);
	//
	// 	game.initEngines();
	//
	// 	// Render only the first frame, and do not start the game
	// 	game.runFrame(new Date().getTime());
	// }
})(window.tableau);
