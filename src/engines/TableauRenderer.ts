import Game from '../libs/Game';
import Snake from '../libs/Snake';
import { Food, Frame, Renderer, Some, Direction } from '../types';
import {
  Column,
  DataValue,
  Encoding,
  FieldInstance,
  Parameter,
  Tableau,
  Worksheet,
} from '../types/extensions-api-types';

async function getWorksheetEncodings(worksheet: Worksheet): Promise<Encoding[]> {
  const specs = await worksheet.getVisualSpecificationAsync();
  const encodings = specs?.marksSpecifications[0]?.encodings || [];

  return encodings;
}

class TableauRenderer implements Renderer {
  seperator = '::';
  pixel: number[] = [20, 20];
  game: Some<Game>;
  state: string = '01::0000';

  tableau: Tableau;
  worksheet: Some<Worksheet>;
  paramMode: Some<Parameter>;
  paramState: Some<Parameter>;
  xField: Some<FieldInstance>;
  yField: Some<FieldInstance>;
  colorField: Some<FieldInstance>;

  // predefined colors map
  colors: string[] = ['#FB8B24', '#04A777', '#016FB9', '#E2E8DD'];

  constructor(t: Tableau) {
    this.tableau = t;
    this.worksheet = t.extensions.worksheetContent?.worksheet;
    this.initTableau();
  }

  async initTableau() {
    // this.worksheet = this.tableau.extensions.worksheetContent?.worksheet;

    this.paramMode = await this.worksheet?.findParameterAsync('p_mode');
    this.paramState = await this.worksheet?.findParameterAsync('p_state');

    this.paramMode?.changeValueAsync(false).then(() => {
      // console.log('[mode] initial!');
    });

    // this.worksheet?.addEventListener(
    // 	this.tableau.TableauEventType.SummaryDataChanged,
    // 	async (e: SummaryDataChangedEvent): Promise<void> => {
    // 		console.log("trigger summary data");
    // 		this.initData(e.worksheet);
    // 	},
    // );
    //
    // if (this.worksheet) {
    // 	this.initData(this.worksheet);
    // 	console.log("encodings", await getWorksheetEncodings(this.worksheet));
    // }
  }

  async initData(worksheet: Worksheet) {
    // reset axis's
    this.xField = undefined;
    this.yField = undefined;
    this.worksheet = worksheet;

    const encodings = await getWorksheetEncodings(worksheet);
    encodings.forEach((encode: Encoding) => {
      if (encode.id === 'axis_x') {
        this.xField = encode.field;
      } else if (encode.id === 'axis_y') {
        this.yField = encode.field;
      } else if (encode.id === 'color') {
        this.colorField = encode.field;
      }
    });

    if (this.xField && this.yField) {
      // WE ARE ALLOWED TO VIEW THE GRAPH
      await this.queryDataFromWorksheet();
    } else {
      // WE SHOULD SHOW A MESSAGE THAT WE ARE MISSING SOME STUFF...
    }
  }

  screenGameStart() {}
  startGame() {
    this.paramMode?.changeValueAsync(true).then(() => {
      // console.log('[mode] updated!');
    });
  }
  stopGame() {
    // this.paramMode?.changeValueAsync(true).then(() => {
    // 	console.log("[mode] updated!", this.state);
    // });
  }

  async queryDataFromWorksheet() {
    let dt;
    try {
      dt = await this.worksheet?.getSummaryDataReaderAsync(undefined, {
        ignoreSelection: true,
      });
    } catch (error) {
      return;
    }

    // minimal state
    let maxX = 32,
      maxY = 32;

    const dataTable = await dt?.getAllPagesAsync();
    await dt?.releaseAsync();

    // init axis indexes
    const axisYIndex = dataTable.columns.find((col: Column) => col.fieldId === this.yField?.fieldId)?.index || 0;
    const axisXIndex = dataTable.columns.find((col: Column) => col.fieldId === this.xField?.fieldId)?.index || 0;

    const colorIndex = dataTable.columns.find((col: Column) => col.fieldId === this.colorField?.fieldId)?.index;

    const colors: { [color: string]: number } = {};

    // Fixed data setup
    const data = dataTable.data.map((row: DataValue[], index: number) => {
      const x = Math.round(row[axisXIndex].nativeValue / 1000);
      const y = Math.round(row[axisYIndex].nativeValue / 1000);

      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;

      // create new datapoint for scatterplot
      const f = new Food(x, y, index);

      // do we have a colorindex?
      if (colorIndex !== undefined) {
        const c = row[colorIndex].nativeValue;

        if (!colors[c]) {
          // get a color from the predefined colors
          colors[c] = this.colors[Object.keys(colors).length];
        }

        f.color = colors[c];
      }

      return f;
    });

    // to make the game/chart a square
    const size = maxX > maxY ? maxX : maxY;

    this.game?.setSize(size, size);
    this.game?.setData(data);

    // add enable option for snake feature when only having 1 category left after filter..
    if (colorIndex !== undefined && Object.keys(colors).length === 1) {
      this.game?.addSnake(new Snake(2, 5, 3, Direction.UP));
    }
  }

  init(game: Game) {
    this.game = game;
  }

  render(frame: Frame) {
    const score = `0000${frame.score}`;
    const state = this.createState(`0${frame.level}`, score.substring(score.length - 4));

    // only update dashboard parameter if the state was changed.
    if (state !== this.state) {
      this.paramState?.changeValueAsync(state).then(() => {
        // console.log('[Tableau] updated!', state);
      });
    }
  }

  createState(...state: string[]): string {
    return state.join(this.seperator);
  }

  // When a datapoint in the chart has been hovered
  hoverDatapoint(food: Food, x: number, y: number) {
    // hoverDatapoint
    this.worksheet
      ?.hoverTupleAsync(food.i + 1, {
        tooltipAnchorPoint: { x, y },
      })
      .catch((error) => console.error('Failed to hover because of: ', error));
  }

  hoverOut(_: Food) {
    this.worksheet?.hoverTupleAsync(0);
  }
}

export default TableauRenderer;
