import { QueryList, AfterContentInit, ViewContainerRef, TemplateRef, ChangeDetectorRef } from '@angular/core';
export declare class L2GridColumn {
    bound: string;
    display: string;
}
export declare class L2GridTemplateColumnRow {
    constructor();
}
export declare class L2GridTemplateColumn {
    private templateRef;
    bound: string;
    display: string;
    constructor(templateRef: TemplateRef<L2GridTemplateColumnRow>);
}
export declare class L2GridColumnCollection implements AfterContentInit {
    columnList: QueryList<L2GridColumn>;
    ngAfterContentInit(): void;
}
export declare class L2GridNoResults {
}
export declare class L2Grid implements AfterContentInit {
    private viewContainerRef;
    private changeDetectorRef;
    private _dataSource;
    private _sproc;
    private isDataBound;
    private _autoExecute;
    private _isLoading;
    private _lastDurationInMilliseconds;
    showHeaderStats: boolean;
    showFooterStats: boolean;
    dataSource: any;
    isLoading: boolean;
    lastDurationInMilliseconds: number;
    autoExecute: boolean;
    private sproc;
    ngOnInit(): void;
    columnCollections: QueryList<L2GridColumnCollection>;
    constructor(viewContainerRef: ViewContainerRef, changeDetectorRef: ChangeDetectorRef);
    private getColumnNames();
    ngAfterContentInit(): void;
    private getFieldData(col, row);
}
