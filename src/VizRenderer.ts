import Game from "./Game";
import { Frame, Renderer } from "./types";

class VizRenderer implements Renderer {
	// initialize the renderer engine
	init(game: Game): void {
		console.log("Initialize renderer", game);
	}

	// how to render the game, as VizExtension
	render(frame: Frame): void {
		console.log("Render frame: ", frame.snake);
	}
}

export default VizRenderer;
