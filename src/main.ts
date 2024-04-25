import './style.css';

// our D3 Scatterplot builder.
import D3Scatterplot from './Demo';
const scatter = new D3Scatterplot();

(async (tableau: Tableau) => {
  console.log('[Tableau] Loading web app...');

  // 1. Initliaze the Tableau Extensions API
  await tableau.extensions.initializeAsync();

  const worksheet = tableau.extensions.worksheetContent?.worksheet;

  // Fetch the data from the worksheet.
  async function getDataFromWorksheet() {
    console.log('[Tableau] Fetching data...', worksheet);

    // Boilerplate: Connect with Tableau via Extensions API and fetch a summary of data.
    const dataTableReader = await worksheet!.getSummaryDataReaderAsync();
    const dataTable = await dataTableReader.getAllPagesAsync();
    await dataTableReader.releaseAsync();

    console.log('[Tableau] Columns:', dataTable.columns.map((t: Column) => t.fieldName).join(', '));
    console.log('[Tableau] Total rows found:', dataTable.totalRowCount);

    // 3. Render the Scatterplot
    // give the function the worksheet to handle columns
    await scatter.setData(worksheet!, dataTable);
    await scatter.render();
  }

  // 2. Get the data from the worksheet
  try {
    await getDataFromWorksheet();
  } catch (_) {
    document.getElementById('game').innerHTML += '<p class="error">No dimensions/measure found on the marks cards</p>';
  }

  // 4. Listen for Tableau events
  const events = tableau.TableauEventType;

  // Start listening for the Tableau event "SummaryDataChanged".
  worksheet?.addEventListener(events.SummaryDataChanged, getDataFromWorksheet);
  // Listen for Tableau Filter events
  worksheet?.addEventListener(events.FilterChanged, getDataFromWorksheet);

  // 5. Add Tableau Native tooltips

  // Adding Native Tableau tooltips and highlighting to the marks
  // in the Scatterplot, but let it feel as native Tableau.
  scatter.onHoverDatapoint((data, x: number, y: number) => {
    // first argument is the row index from Tableau starts from 1
    worksheet
      ?.hoverTupleAsync(data.i + 1, {
        tooltipAnchorPoint: { x, y },
      })
      .catch((error) => console.log('Failed to hover because of: ', error));
  });

  // 6. Add highlighting to the marks

  let selected: number[] = [];
  scatter.onClickDatapoint(async (data, mouseEvent: MouseEvent) => {
    const ctrlKeyPressed = !!mouseEvent.ctrlKey || !!mouseEvent.shiftKey || mouseEvent.metaKey;

    const selectOption = ctrlKeyPressed ? tableau.SelectOptions.Toggle : tableau.SelectOptions.Simple;

    const tupleId = data.i + 1;
    selected = scatter.toggleSelection(selected, tupleId, selectOption);

    worksheet!
      .selectTuplesAsync(selected, selectOption, {
        tooltipAnchorPoint: { x: mouseEvent.pageX, y: mouseEvent.pageY },
      })
      .catch((error) => console.log('Failed to select because of: ', error));
  });
})(window.tableau);

import { Column, Tableau } from './types/extensions-api-types';
