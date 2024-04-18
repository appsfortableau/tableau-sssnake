import { FieldBase } from './DataSourceInterfaces';
import { ColumnType, EncodingType, MarkType } from './Namespaces/Tableau';
/**
 * @since 1.11.0
 * Represents a collection of fields on various encodings as well as other viz specific information for a worksheet
 */
export interface VisualSpecification {
    readonly rowFields: FieldInstance[];
    readonly columnFields: FieldInstance[];
    readonly activeMarksSpecificationIndex: number;
    readonly marksSpecifications: MarksSpecification[];
}
/**
 * @since 1.11.0
 * Represents a collection of fields on various encodings for a single marks card
 */
export interface MarksSpecification {
    readonly primitiveType: MarkType;
    readonly encodings: Encoding[];
}
/**
 * @since 1.11.0
 * Represents a single field and its associated encoding on a marks card
 */
export interface Encoding {
    readonly id: string;
    readonly type: EncodingType;
    readonly field: FieldInstance;
}
/**
 * @since 1.11.0
 * Represents a field and its properties
 */
export interface FieldInstance extends FieldBase {
    /**
     * @returns The unique representation of the field across all data sources in the workbook. In summary data, this includes aggregation.
     * Note that the fieldId could change if you change the data source.
     * For example after replacing the data source [Clipboard_20210305T164000].[sum:Sales:qk] could become
     * [federated.12usuoq1171o1b1ebdyh60fjnev1].[sum:Sales:qk].
     */
    readonly fieldId: string;
    /**
     * @returns  The type of the column, either discrete or continuous.
     */
    readonly columnType: ColumnType;
}
//# sourceMappingURL=VisualModelInterface.d.ts.map