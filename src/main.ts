import './style.css';

// our D3 Scatterplot builder.
import D3Scatterplot from './ScatterPlot';
const scatter = new D3Scatterplot();

(async (tableau: Tableau) => {
  console.log('Web app is running');

  // 1. Initliaze the Tableau Extensions API
  // await tableau.extensions.initializeAsync();

  // 2. Get the data from the worksheet
  // const worksheet = tableau.extensions.worksheetContent?.worksheet;

  // Fetch the data from the worksheet.
  async function getDataFromWorksheet() {
    // Boilerplate: Connect with Tableau via Extensions API and fetch a summary of data.
    const dataTableReader = await worksheet!.getSummaryDataReaderAsync();
    const dataTable = await dataTableReader.getAllPagesAsync();
    await dataTableReader.releaseAsync();

    // 3. Render the Scatterplot
    await scatter.setData(worksheet!, dataTable);
    await scatter.render();
  }

  // try {
  //   await getDataFromWorksheet();
  // } catch (_) {
  //   document.getElementById('scatter-plot')!.innerHTML +=
  //     '<p class="error">No dimensions/measure found on the marks cards</p>';
  // }

  // 4. Listen for Tableau events
  // const events = tableau.TableauEventType;

  // Start listening for the Tableau event "SummaryDataChanged".
  // worksheet?.addEventListener(events.SummaryDataChanged, getDataFromWorksheet);
  // Listen for Tableau Filter events
  // worksheet?.addEventListener(events.FilterChanged, getDataFromWorksheet);

  // 5. Add Tableau Native tooltips
  // scatter.onHoverDatapoint((data, mouseX: number, mouseY: number) => {
  //   // first argument is the row index from Tableau starts from 1
  //   const tupleId = data.i + 1;
  //   worksheet
  //     ?.hoverTupleAsync(tupleId, {
  //       tooltipAnchorPoint: { x: mouseX, y: mouseY },
  //     })
  //     .catch((error) => console.error('Failed to hover because of: ', error));
  // });

  // 6. Add highlighting to the marks
  // let selectedTupleIds: number[] = [];
  // scatter.onClickDatapoint(async (data, mouseEvent: MouseEvent) => {
  //   const ctrlKeyPressed = !!mouseEvent.ctrlKey || !!mouseEvent.shiftKey || mouseEvent.metaKey;
  //   const selectOption = ctrlKeyPressed ? tableau.SelectOptions.Toggle : tableau.SelectOptions.Simple;

  //   const tupleId = data.i + 1;
  //   selectedTupleIds = scatter.toggleSelection(selectedTupleIds, tupleId, selectOption);

  //   worksheet!
  //     .selectTuplesAsync(selectedTupleIds, selectOption, {
  //       tooltipAnchorPoint: { x: mouseEvent.pageX, y: mouseEvent.pageY },
  //     })
  //     .catch((error) => console.error('Failed to select because of: ', error));
  // });
})(window.tableau);

import { Column, Tableau } from './types/extensions-api-types';
