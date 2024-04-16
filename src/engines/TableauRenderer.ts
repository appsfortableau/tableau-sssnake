import Game from "./Game";
import { Frame, Renderer } from "./types";

module mytableau {
	export type extensions = {
		dashboardContent: {
			dashboard: tableau.Dashboard;
		};
		worksheetContent: {
			worksheet: Worksheet;
		};
	};

	export interface Parameter extends tableau.Parameter {
		changeValueAsync(
			newValue: string | number | boolean | Date,
		): Promise<tableau.DataValue>;
	}

	export interface Worksheet extends tableau.Worksheet {
		findParameterAsync(
			paramName: string,
		): Promise<tableau.Parameter | undefined>;
		getParametersAsync(): Promise<tableau.Parameter[]>;
	}
}

class TableauRenderer implements Renderer {
	seperator = "::";
	pixel: number[] = [20, 20];
	game: Game | undefined;
	state: string = "01::0000";

	tableau: mytableau.extensions;
	worksheet: mytableau.Worksheet;
	paramState: mytableau.Parameter | undefined;

	constructor(t: mytableau.extensions) {
		this.tableau = t;
		this.worksheet = this.tableau.worksheetContent.worksheet;
	}

	async initTableau() {
		this.worksheet = this.tableau.worksheetContent.worksheet;

		this.paramState = await this.worksheet?.findParameterAsync("state");
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
