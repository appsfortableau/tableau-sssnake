import "./style.css";

import {
	Column,
	FilterChangedEvent,
	Tableau,
} from "./types/extensions-api-types";
import D3Scatterplot from "./Demo";

(async (tableau: Tableau) => {
	console.log("[Tableau] Loading web app...");

	await tableau.extensions.initializeAsync();

	// our D3 Scatterplot builder.
	const scatter = new D3Scatterplot();
	const events = tableau.TableauEventType;
	const worksheet = tableau.extensions.worksheetContent?.worksheet;

	// Listen for when the data has changed.
	async function summaryDataEvent() {
		// Connect with Tableau via Extensions API and fetch a summary of data.
		const dataTableReader = await worksheet.getSummaryDataReaderAsync();
		const dataTable = await dataTableReader.getAllPagesAsync();
		await dataTableReader.releaseAsync();

		console.log(
			"[Tableau] Columns:",
			dataTable.columns.map((t: Column) => t.fieldName).join(", "),
		);
		console.log("[Tableau] Total rows found:", dataTable.totalRowCount);

		// give the function the worksheet to handle columns
		await scatter.setDataForD3(worksheet, dataTable);
		await scatter.render();
	}
	try {
		await summaryDataEvent();
	} catch (_) {
		document.getElementById("game").innerHTML +=
			'<p class="error">No dimensions/measure found on the marks cards</p>';
	}
	// Start listening for the Tableau event "SummaryDataChanged".
	worksheet?.addEventListener(events.SummaryDataChanged, summaryDataEvent);

	// Adding Native Tableau tooltips and highlighting to the marks
	// in the Scatterplot, but let it feel as native Tableau.
	scatter.onHoverDatapoint((data, x: number, y: number) => {
		// first argument is the row index from Tableau starts from 1
		worksheet
			?.hoverTupleAsync(data.i + 1, {
				tooltipAnchorPoint: { x, y },
			})
			.catch((error) => console.log("Failed to hover because of: ", error));
	});

	let selected: number[] = [];
	scatter.onClickDatapoint(async (data, mouseEvent: MouseEvent) => {
		const ctrlKeyPressed =
			!!mouseEvent.ctrlKey || !!mouseEvent.shiftKey || mouseEvent.metaKey;

		const selectOption = ctrlKeyPressed
			? tableau.SelectOptions.Toggle
			: tableau.SelectOptions.Simple;

		const tupleId = data.i + 1;
		selected = scatter.toggleSelection(selected, tupleId, selectOption);

		worksheet
			.selectTuplesAsync(selected, selectOption, {
				tooltipAnchorPoint: { x: mouseEvent.pageX, y: mouseEvent.pageY },
			})
			.catch((error) => console.log("Failed to select because of: ", error));
	});

	// Listen for Tableau Filter events
	worksheet?.addEventListener(events.FilterChanged, summaryDataEvent);
})(window.tableau);
