import { Worksheet } from '../SheetInterfaces';
/**
 * The `WorksheetContent` namespace is the namespace associated with Viz Extensions.
 * The `WorksheetContent` namespace contains the `Worksheet` interface. Use the [Worksheet Interface](./worksheet.html) to
 * access worksheet objects and to add or remove event listeners.
 * @category Viz Extensions
 * @beta
 */
export interface WorksheetContent {
    /**
     * @returns  The worksheet object representing the Tableau
     *           worksheet where the extension is running.
     */
    readonly worksheet: Worksheet;
}
//# sourceMappingURL=WorksheetContent.d.ts.map