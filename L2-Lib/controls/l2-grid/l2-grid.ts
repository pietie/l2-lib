////import { Component, Input, Output, EventEmitter, Directive, QueryList, ContentChildren, AfterContentInit, ViewContainerRef, TemplateRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
////import { Observable } from 'rxjs/Observable';

////import { jsDAL } from '../../L2.DAL';


////@Directive({ selector: 'column' })
////export class L2GridColumn {
////    @Input() bound: string = null;
////    @Input() display: string = null;


////}

 
////export class L2GridTemplateColumnRow {
////    constructor(/*public $implicit: anypublic $implicit: any, public index: number, public count: number*/) {
////    }
////}

////@Directive({
////    selector: '[templatecolumn]', //inputs: [ 'row', 'index' ]
////    inputs: [ 'bound', 'display'],
////    providers: [{ provide: L2GridColumn, useExisting: L2GridTemplateColumn }] // 'cheat' so that  @ContentChildren(L2GridColumn) picks up this column type as well

////})
////export class L2GridTemplateColumn {
////    @Input() bound: string = null;
////    @Input() display: string = null;

////    constructor(private templateRef: TemplateRef<L2GridTemplateColumnRow>) {
////    }
////}


////@Directive({ selector: 'columns' })
////export class L2GridColumnCollection implements AfterContentInit {
////    @ContentChildren(L2GridColumn) columnList: QueryList<L2GridColumn>;

////    ngAfterContentInit() {
////    }
////}


////@Directive({ selector: 'no-results' })
////export class L2GridNoResults {

////}

////declare var require:any;

////@Component({
////    selector: 'l2-grid',
////    template: require('./l2-grid.html'), // temporary solution until I figure out how to compile and package this project properly
////    styles: [ require('./l2-grid.css')],
////    //templateUrl: './l2-grid.html',
////    //styleUrls: ['./l2-grid.css'],
////    changeDetection: ChangeDetectionStrategy.OnPush
////})
////export class L2Grid implements AfterContentInit {

////    private _dataSource: any = null;
////    private _sproc: jsDAL.Sproc;
////    private isDataBound: boolean = false;
////    private _autoExecute: boolean = true;
////    private _isLoading: boolean = false;
////    private _lastDurationInMilliseconds: number;

////    @Input() public showHeaderStats: boolean = false;
////    @Input() public showFooterStats: boolean = true;

////    get dataSource(): any { return this._dataSource; }

////    set isLoading(v: boolean) { this._isLoading = v; this.changeDetectorRef.markForCheck(); }
////    get isLoading(): boolean {
////        return this._isLoading;
////    }

////    set lastDurationInMilliseconds(val: number) { this._lastDurationInMilliseconds = val; }
////    get lastDurationInMilliseconds(): number { return this._lastDurationInMilliseconds; }

////    @Input() set dataSource(value: any) {

////        if (jsDAL.Sproc.looksLikeADuck(value)) {
////            this.sproc = value;
////        }
////        else {
////            this._dataSource = value;
////            if (value != null) this.isDataBound = true;

////            this.changeDetectorRef.markForCheck();
////        }
////    }

////    @Input() set autoExecute(value: boolean) {
////        this._autoExecute = value;
////    }

////    private set sproc(value: jsDAL.Sproc) {

////        this._sproc = value;
////        if (!this.isLoading) {
////            this.isLoading = this._sproc.isLoading;
////        }
////        this._sproc.then(r => {
////            this.lastDurationInMilliseconds = this._sproc.lastExecutionTime;
////            if (!r.Message) {
////                this._dataSource = r.Data.Table0;
////                this.isDataBound = true;
////            }
////            else {
////                this._dataSource = [];
////                this.isDataBound = true;
////            }
////            this._isLoading = false;

////            this.changeDetectorRef.markForCheck();

////        }).catch(e => {
////            this._isLoading = false;
////            throw e;
////        });
////    }

////    get autoExecute(): boolean {
////        return this._autoExecute;
////    }

////    ngOnInit() {
////        // if we source our data from a Sproc rather than static data
////        if (this._sproc) {
////            if (this.autoExecute) {
////                this._isLoading = true;
////                this._sproc.ExecQuery();
////            }

////        }
////    }




////    @ContentChildren(L2GridColumnCollection) columnCollections: QueryList<L2GridColumnCollection>;

////    constructor(private viewContainerRef: ViewContainerRef, private changeDetectorRef: ChangeDetectorRef) {
////    }


////    private getColumnNames(): string[] {
        
        
////        if (this.columnCollections == null) return null;
////        return this.columnCollections.first.columnList.map(c => c.display ? c.display : "");
////    }


////    ngAfterContentInit() {
////        if (this.columnCollections && this.columnCollections.length > 1) throw new Error("You may have only one <columns> element.");
////    }

////    private getFieldData(col: L2GridColumn, row: any) {

////        var ret = row[col.bound];

////        if (ret === undefined) return "";
////        else return ret;
////    }
////}
