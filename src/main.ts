import "./style.css";

import Game from "./Game";
import BrowserRenderer from "./BrowserRenderer";

const engine = new BrowserRenderer();

const game = new Game(engine);

game.start();
