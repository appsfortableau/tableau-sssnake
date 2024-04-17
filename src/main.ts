import "./style.css";

// const Tableau = window.tableau;
// const TableauEventType = window.tableau.TableauEventType;

import Game from "./Game";
import D3Renderer from "./engines/D3Renderer";
import TableauRenderer from "./engines/TableauRenderer";
import { Direction, Food } from "./types";
import Snake from "./Snake";

(() => {
	function updateDataAndRender(e) {
		console.log(e);
	}

	function configure() {
		console.log("Open configurer");
	}

	const d3 = new D3Renderer();
	// const tabl = new TableauRenderer(window.tableau.extensions);

	const game = new Game([d3], new Snake(2, 5, 3, Direction.UP));

	game.setData([new Food(32 * 0.6, 32 * 0.5)]);
	game.initEngines();

	// game.runFrame(new Date().getTime());
	game.start();

	// console.log("Loading Tableau");
	// Tableau.extensions.initializeAsync({ configure: configure }).then(
	// 	() => {
	// 		// console.log(Tableau);
	// 		// engine.initTableau();
	// 		// // Get the worksheet that the Viz Extension is running in
	// 		// const worksheet = Tableau.extensions.worksheetContent.worksheet;
	// 		// console.log(worksheet);
	// 		//
	// 		// console.log(`The name of the worksheet is ${worksheet.name}`);
	// 		//
	// 		// // Listen to event for when the summary data backing the worksheet has changed.
	// 		// // This tells us that we should refresh the data and encoding map.
	// 		// worksheet.addEventListener(
	// 		// 	TableauEventType.SummaryDataChanged,
	// 		// 	updateDataAndRender,
	// 		// );
	// 		game.start();
	// 	},
	// 	(err: Error) => {
	// 		console.log(err);
	// 		// Something went wrong in initialization.
	// 		console.log("Error while Initializing: " + err.toString());
	// 	},
	// );
})();
