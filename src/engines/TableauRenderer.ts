import Game from "../Game";
import { Food, Frame, Renderer, Some } from "../types";
import {
	Column,
	DataValue,
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
			async (e: SummaryDataChangedEvent): Promise<void> =>
				this.initData(e.worksheet),
		);

		if (this.worksheet) {
			this.initData(this.worksheet);
			console.log("encodings", await getWorksheetEncodings(this.worksheet));
		}
	}

	async initData(worksheet: Worksheet) {
		// reset axis's
		this.axisX = undefined;
		this.axisY = undefined;

		const encodings = await getWorksheetEncodings(worksheet);
		encodings.forEach((encode: Encoding) => {
			if (encode.id === "axis_x") {
				this.axisX = encode.field;
			} else if (encode.id === "axis_y") {
				this.axisY = encode.field;
			}
		});

		console.log("axis", this.axisX, this.axisY);

		if (this.axisX && this.axisY) {
			// WE ARE ALLOWED TO VIEW THE GRAPH
			this.queryDataFromWorksheet();
		} else {
			// WE SHOULD SHOW A MESSAGE THAT WE ARE MISSING SOME STUFF...
		}

		console.log("encodings are changing?", encodings);
	}

	async queryDataFromWorksheet() {
		const pageSize = 1000;
		const dt = await this.worksheet?.getSummaryDataReaderAsync(pageSize);
		if (!dt) {
			console.log("WE ARE FAILURES");
			return;
		}

		let maxX = 32,
			maxY = 32;

		const dataTablePage = await dt?.getPageAsync(0);
		// init axis indexes
		const axisYIndex =
			dataTablePage.columns.find(
				(col: Column) => col.fieldId === this.axisY?.fieldId,
			)?.index || 0;
		const axisXIndex =
			dataTablePage.columns.find(
				(col: Column) => col.fieldId === this.axisX?.fieldId,
			)?.index || 0;

		// Fixed data setup
		const data = dataTablePage.data.map((row: DataValue[]) => {
			const x = row[axisXIndex].nativeValue;
			const y = row[axisYIndex].nativeValue;

			if (x > maxX) maxX = x;
			if (y > maxY) maxY = y;

			return new Food(x, y);
		});

		await dt?.releaseAsync();

		// to make the game/chart a square
		const size = maxX > maxY ? maxX : maxY;

		this.game?.setSize(size, size);
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
