var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input, Directive, QueryList, ContentChildren, ViewContainerRef, TemplateRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import jsDAL from '../../L2.DAL';
export let L2GridColumn = class L2GridColumn {
    constructor() {
        this.bound = null;
        this.display = null;
    }
};
__decorate([
    Input(), 
    __metadata('design:type', String)
], L2GridColumn.prototype, "bound", void 0);
__decorate([
    Input(), 
    __metadata('design:type', String)
], L2GridColumn.prototype, "display", void 0);
L2GridColumn = __decorate([
    Directive({ selector: 'column' }), 
    __metadata('design:paramtypes', [])
], L2GridColumn);
export class L2GridTemplateColumnRow {
    constructor() {
    }
}
let L2GridTemplateColumn_1 = class L2GridTemplateColumn {
    constructor(templateRef) {
        this.templateRef = templateRef;
        this.bound = null;
        this.display = null;
    }
};
export let L2GridTemplateColumn = L2GridTemplateColumn_1;
__decorate([
    Input(), 
    __metadata('design:type', String)
], L2GridTemplateColumn.prototype, "bound", void 0);
__decorate([
    Input(), 
    __metadata('design:type', String)
], L2GridTemplateColumn.prototype, "display", void 0);
L2GridTemplateColumn = L2GridTemplateColumn_1 = __decorate([
    Directive({
        selector: '[templatecolumn]',
        inputs: ['bound', 'display'],
        providers: [{ provide: L2GridColumn, useExisting: L2GridTemplateColumn }] // 'cheat' so that  @ContentChildren(L2GridColumn) picks up this column type as well
    }), 
    __metadata('design:paramtypes', [TemplateRef])
], L2GridTemplateColumn);
export let L2GridColumnCollection = class L2GridColumnCollection {
    ngAfterContentInit() {
    }
};
__decorate([
    ContentChildren(L2GridColumn), 
    __metadata('design:type', QueryList)
], L2GridColumnCollection.prototype, "columnList", void 0);
L2GridColumnCollection = __decorate([
    Directive({ selector: 'columns' }), 
    __metadata('design:paramtypes', [])
], L2GridColumnCollection);
export let L2GridNoResults = class L2GridNoResults {
};
L2GridNoResults = __decorate([
    Directive({ selector: 'no-results' }), 
    __metadata('design:paramtypes', [])
], L2GridNoResults);
export let L2Grid = class L2Grid {
    constructor(viewContainerRef, changeDetectorRef) {
        this.viewContainerRef = viewContainerRef;
        this.changeDetectorRef = changeDetectorRef;
        this._dataSource = null;
        this.isDataBound = false;
        this._autoExecute = true;
        this._isLoading = false;
        this.showHeaderStats = false;
        this.showFooterStats = true;
    }
    get dataSource() { return this._dataSource; }
    set isLoading(v) { this._isLoading = v; this.changeDetectorRef.markForCheck(); }
    get isLoading() {
        return this._isLoading;
    }
    set lastDurationInMilliseconds(val) { this._lastDurationInMilliseconds = val; }
    get lastDurationInMilliseconds() { return this._lastDurationInMilliseconds; }
    set dataSource(value) {
        if (jsDAL.Sproc.looksLikeADuck(value)) {
            this.sproc = value;
        }
        else {
            this._dataSource = value;
            if (value != null)
                this.isDataBound = true;
            this.changeDetectorRef.markForCheck();
        }
    }
    set autoExecute(value) {
        this._autoExecute = value;
    }
    set sproc(value) {
        this._sproc = value;
        if (!this.isLoading) {
            this.isLoading = this._sproc.isLoading;
        }
        this._sproc.then(r => {
            this.lastDurationInMilliseconds = this._sproc.lastExecutionTime;
            if (!r.Message) {
                this._dataSource = r.Data.Table0;
                this.isDataBound = true;
            }
            else {
                this._dataSource = [];
                this.isDataBound = true;
            }
            this._isLoading = false;
            this.changeDetectorRef.markForCheck();
        }).catch(e => {
            this._isLoading = false;
            throw e;
        });
    }
    get autoExecute() {
        return this._autoExecute;
    }
    ngOnInit() {
        // if we source our data from a Sproc rather than static data
        if (this._sproc) {
            if (this.autoExecute) {
                this._isLoading = true;
                this._sproc.ExecQuery();
            }
        }
    }
    getColumnNames() {
        if (this.columnCollections == null)
            return null;
        return this.columnCollections.first.columnList.map(c => c.display ? c.display : "");
    }
    ngAfterContentInit() {
        if (this.columnCollections && this.columnCollections.length > 1)
            throw new Error("You may have only one <columns> element.");
    }
    getFieldData(col, row) {
        var ret = row[col.bound];
        if (ret === undefined)
            return "";
        else
            return ret;
    }
};
__decorate([
    Input(), 
    __metadata('design:type', Boolean)
], L2Grid.prototype, "showHeaderStats", void 0);
__decorate([
    Input(), 
    __metadata('design:type', Boolean)
], L2Grid.prototype, "showFooterStats", void 0);
__decorate([
    Input(), 
    __metadata('design:type', Object)
], L2Grid.prototype, "dataSource", null);
__decorate([
    Input(), 
    __metadata('design:type', Boolean), 
    __metadata('design:paramtypes', [Boolean])
], L2Grid.prototype, "autoExecute", null);
__decorate([
    ContentChildren(L2GridColumnCollection), 
    __metadata('design:type', QueryList)
], L2Grid.prototype, "columnCollections", void 0);
L2Grid = __decorate([
    Component({
        selector: 'l2-grid',
        template: require('./l2-grid.html'),
        styles: [require('./l2-grid.css')],
        //templateUrl: './l2-grid.html',
        //styleUrls: ['./l2-grid.css'],
        changeDetection: ChangeDetectionStrategy.OnPush
    }), 
    __metadata('design:paramtypes', [ViewContainerRef, ChangeDetectorRef])
], L2Grid);
//# sourceMappingURL=l2-grid.js.map