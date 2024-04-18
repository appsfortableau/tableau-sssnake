import Game from "../Game";
import { Food, Frame, Renderer, Some } from "../types";
import {
	Encoding,
	Field,
	FieldInstance,
	Parameter,
	SummaryDataChangedEvent,
	Tableau,
	TableauEvent,
	VisualSpecification,
	Worksheet,
} from "../types/extensions-api-types";

async function getWorksheetEncodings(
	worksheet: Worksheet,
): Promise<Encoding[]> {
	const specs = await worksheet.getVisualSpecificationAsync();
	const encodings = specs?.marksSpecifications[0]?.encodings || [];

	return encodings;
}

class TableauRenderer implements Renderer {
	seperator = "::";
	pixel: number[] = [20, 20];
	game: Some<Game>;
	state: string = "01::0000";

	tableau: Tableau;
	worksheet: Some<Worksheet>;
	paramState: Some<Parameter>;
	axisX: Some<FieldInstance>;
	axisY: Some<FieldInstance>;

	constructor(t: Tableau) {
		this.tableau = t;
		this.worksheet = t.extensions.worksheetContent?.worksheet;
	}

	async initTableau() {
		this.worksheet = this.tableau.extensions.worksheetContent?.worksheet;

		this.paramState = await this.worksheet?.findParameterAsync("state");

		this.worksheet?.addEventListener(
			this.tableau.TableauEventType.SummaryDataChanged,
			async (e: SummaryDataChangedEvent): Promise<void> => {
				this.axisX = undefined;
				this.axisY = undefined;
				const encodings = await getWorksheetEncodings(e.worksheet);
				encodings.forEach((encode: Encoding) => {
					if (encode.id === "axis_x") {
						this.axisX = encode.field;
					} else if (encode.id === "axis_y") {
						this.axisY = encode.field;
					}
				});

				if (this.axisX && this.axisY) {
					this.queryDataFromWorksheet();

					// WE ARE ALLOWED TO VIEW THE GRAPH
				} else {
					// WE SHOULD SHOW A MESSAGE THAT WE ARE MISSING SOME STUFF...
				}
				console.log("encodings are changing?", encodings);
			},
		);

		if (this.worksheet) {
			console.log("encodings", await getWorksheetEncodings(this.worksheet));
		}
	}

	async queryDataFromWorksheet() {
		const dt = await this.worksheet?.getSummaryDataReaderAsync();
		if (!dt) {
			console.log("WE ARE FAILURES");
			return;
		}
		const pageCount = dt?.pageCount || 0;

		const maxX = 32,
			maxY = 32;
		const data: Food[] = [];

		for (let currentPage = 0; currentPage < pageCount; currentPage++) {
			const dataTablePage = await dt?.getPageAsync(currentPage);
			console.log(dataTablePage);
			// TODO: HELP SRI, FIX ME!
		}
		await dt?.releaseAsync();

		// [
		// 	new Food(32 * 0.6, 32 * 0.5),
		// 	new Food(32 * 0.1, 32 * 0.8),
		// 	new Food(32 * 0.87, 32 * 0.9),
		// 	new Food(32 * 0.81, 32 * 0.95),
		// ]
		this.game?.setSize(maxX, maxY);
		this.game?.setData(data);

		// what if we are in a game????
		this.game?.runFrame(new Date().getTime());
		// game mode like:
		// this.game?.start();
	}

	init(game: Game) {
		this.game = game;
	}

	render(frame: Frame) {
		const state = this.createState(frame.level, frame.score);

		// only update dashboard parameter if the state was changed.
		if (state === this.state) {
			return;
		}

		this.paramState?.changeValueAsync(this.state).then(() => {
			console.log("[state] updated!", this.state);
		});
	}

	createState(...state: (string | number)[]): string {
		return state.join(this.seperator);
	}
}

export default TableauRenderer;
