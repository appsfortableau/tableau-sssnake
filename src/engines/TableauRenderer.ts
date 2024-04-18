import Game from "./Game";
import { Frame, Renderer } from "./types";
import {
	Extensions,
	Parameter,
	VisualSpecification,
	Worksheet,
} from "@tableau/extensions-api-types";

// module mytableau {
//   export type extensions = {
//     dashboardContent: {
//       dashboard: tableau.Dashboard;
//     };
//     worksheetContent: {
//       worksheet: Worksheet;
//     };
//   };
//
//   export interface Parameter extends tableau.Parameter {
//     changeValueAsync(
//       newValue: string | number | boolean | Date
//     ): Promise<tableau.DataValue>;
//   }
//
//   export interface Worksheet extends tableau.Worksheet {
//     findParameterAsync(
//       paramName: string
//     ): Promise<tableau.Parameter | undefined>;
//     getParametersAsync(): Promise<tableau.Parameter[]>;
//   }
// }

class TableauRenderer implements Renderer {
	seperator = "::";
	pixel: number[] = [20, 20];
	game: Game | undefined;
	state: string = "01::0000";

	tableau: Extensions;
	worksheet: Worksheet;
	paramState: Parameter | undefined;
	encodings: VisualSpecification | undefined;

	constructor(t: any) {
		this.tableau = t.extensions as Extensions;
		this.worksheet = t.extensions.worksheetContent.worksheet;
	}

	async initTableau() {
		this.worksheet = this.tableau.worksheetContent?.worksheet;

		this.paramState = await this.worksheet?.findParameterAsync("state");
		this.encodings = await this.worksheet?.getVisualSpecificationAsync();
		console.log(this.encodings);
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
