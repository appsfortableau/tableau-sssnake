/**
 * This is the entry point for the type declarations module.
 * It starts with the Tableau Namespace which contains all the child namespaces and the enums.
 * Extension developers can access 'tableau' from the global namespace.
 *
 * Also, export all the required interfaces used in developing extensions
 */

import * as TableauExtensions from "./ExternalContract/Extensions/Namespaces/Tableau";
import * as TableauShared from "./ExternalContract/Shared/Namespaces/Tableau";

export type Tableau = typeof TableauExtensions & typeof TableauShared;

declare global {
	let tableau: Tableau;
}

export * from "./ExtensionsApiExternalContractTypes";
