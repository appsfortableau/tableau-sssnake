import "./style.css";

// const Tableau = window.tableau;
// const TableauEventType = window.tableau.TableauEventType;

import Game from "./Game";
import D3Renderer from "./engines/D3Renderer";

(() => {
	function updateDataAndRender(e) {
		console.log(e);
	}

	function configure() {
		console.log("Open configurer");
	}

	const engine = new D3Renderer();
	const game = new Game(engine);

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
