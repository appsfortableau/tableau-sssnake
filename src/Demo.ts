import D3Renderer from "./engines/D3Renderer";
import TableauRenderer from "./engines/TableauRenderer";
import Game from "./libs/Game";
import {
	DataTable,
	SelectOptions,
	Tableau,
	Worksheet,
} from "./types/extensions-api-types";

export type HoverDatapointCallback = (data: any, x: number, y: number) => void;
export type ClickDatapointCallback = (
	data: any,
	mouseEvent: MouseEvent,
) => void;

class Demo {
	d3: D3Renderer;
	tabl: TableauRenderer;
	scatter: Game;
	//@ts-ignore
	worksheet: Worksheet;

	constructor() {
		this.d3 = new D3Renderer();
		this.tabl = new TableauRenderer(tableau);
		this.scatter = new Game([this.d3, this.tabl]);
	}

	async setDataForD3(worksheet: Worksheet, _: DataTable) {
		this.worksheet = worksheet;

		document.querySelectorAll("#game .error").forEach((d) => {
			d.remove();
		});

		if (!this.scatter.hasInitEngines) {
			await this._initialize();
		}
	}

	async _initialize(): Promise<Demo> {
		console.log("[D3] Initialize Scatterplot");
		// must be done before rendering, so the engines are initialized
		// with the first set of settings/configuration.
		this.scatter.initEngines();
		await this.tabl.initData(this.worksheet);
		return this;
	}

	show(): Demo {
		// run initial frame directly
		this.scatter.runFrame(new Date().getTime());
		return this;
	}

	async render(): Promise<Demo> {
		if (!this.scatter.hasInitEngines) {
			return this;
		}
		console.log("[D3] Render Scatterplot");
		await this.tabl.initData(this.worksheet);
		return this.show();
	}

	onHoverDatapoint(cb: HoverDatapointCallback): void {
		this.d3.onHover(cb);
	}

	onClickDatapoint(cb: ClickDatapointCallback): void {
		this.d3.onClick(cb);
	}

	toggleSelection(
		selection: number[],
		tupleId: number,
		option: SelectOptions,
	): number[] {
		switch (option) {
			case tableau.SelectOptions.Toggle:
				if (selection.includes(tupleId)) {
					const i = selection.findIndex((x: number) => x === tupleId);
					selection.splice(i, 1);
				} else {
					selection.push(tupleId);
				}
				break;
			case tableau.SelectOptions.Simple:
				if (selection.includes(tupleId) && selection.length === 1) {
					selection = [];
				} else {
					selection = [tupleId];
				}
				break;
		}

		return selection;
	}
}

export default Demo;
