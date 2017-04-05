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
export var L2GridColumn = (function () {
    function L2GridColumn() {
        this.bound = null;
        this.display = null;
    }
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
    return L2GridColumn;
}());
export var L2GridTemplateColumnRow = (function () {
    function L2GridTemplateColumnRow() {
    }
    return L2GridTemplateColumnRow;
}());
export var L2GridTemplateColumn = (function () {
    function L2GridTemplateColumn(templateRef) {
        this.templateRef = templateRef;
    }
    L2GridTemplateColumn = __decorate([
        Directive({
            selector: '[templatecolumn]',
            providers: [{ provide: L2GridColumn, useExisting: L2GridTemplateColumn }] // 'cheat' so that  @ContentChildren(L2GridColumn) picks up this column type as well
        }), 
        __metadata('design:paramtypes', [TemplateRef])
    ], L2GridTemplateColumn);
    return L2GridTemplateColumn;
}());
export var L2GridColumnCollection = (function () {
    function L2GridColumnCollection() {
    }
    L2GridColumnCollection.prototype.ngAfterContentInit = function () {
    };
    __decorate([
        ContentChildren(L2GridColumn), 
        __metadata('design:type', QueryList)
    ], L2GridColumnCollection.prototype, "columnList", void 0);
    L2GridColumnCollection = __decorate([
        Directive({ selector: 'columns' }), 
        __metadata('design:paramtypes', [])
    ], L2GridColumnCollection);
    return L2GridColumnCollection;
}());
export var L2GridNoResults = (function () {
    function L2GridNoResults() {
    }
    L2GridNoResults = __decorate([
        Directive({ selector: 'no-results' }), 
        __metadata('design:paramtypes', [])
    ], L2GridNoResults);
    return L2GridNoResults;
}());
export var L2Grid = (function () {
    function L2Grid(viewContainerRef, changeDetectorRef) {
        this.viewContainerRef = viewContainerRef;
        this.changeDetectorRef = changeDetectorRef;
        this._dataSource = null;
        this.isDataBound = false;
        this._autoExecute = true;
        this._isLoading = false;
        this.showHeaderStats = false;
        this.showFooterStats = true;
    }
    Object.defineProperty(L2Grid.prototype, "dataSource", {
        get: function () { return this._dataSource; },
        set: function (value) {
            if (jsDAL.Sproc.looksLikeADuck(value)) {
                this.sproc = value;
            }
            else {
                this._dataSource = value;
                if (value != null)
                    this.isDataBound = true;
                this.changeDetectorRef.markForCheck();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(L2Grid.prototype, "isLoading", {
        get: function () {
            return this._isLoading;
        },
        set: function (v) { this._isLoading = v; this.changeDetectorRef.markForCheck(); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(L2Grid.prototype, "lastDurationInMilliseconds", {
        get: function () { return this._lastDurationInMilliseconds; },
        set: function (val) { this._lastDurationInMilliseconds = val; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(L2Grid.prototype, "autoExecute", {
        get: function () {
            return this._autoExecute;
        },
        set: function (value) {
            this._autoExecute = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(L2Grid.prototype, "sproc", {
        set: function (value) {
            var _this = this;
            this._sproc = value;
            if (!this.isLoading) {
                this.isLoading = this._sproc.isLoading;
            }
            this._sproc.then(function (r) {
                _this.lastDurationInMilliseconds = _this._sproc.lastExecutionTime;
                if (!r.Message) {
                    _this._dataSource = r.Data.Table0;
                    _this.isDataBound = true;
                }
                else {
                    _this._dataSource = [];
                    _this.isDataBound = true;
                }
                _this._isLoading = false;
                _this.changeDetectorRef.markForCheck();
            }).catch(function (e) {
                _this._isLoading = false;
                throw e;
            });
        },
        enumerable: true,
        configurable: true
    });
    L2Grid.prototype.ngOnInit = function () {
        // if we source our data from a Sproc rather than static data
        if (this._sproc) {
            if (this.autoExecute) {
                this._isLoading = true;
                this._sproc.ExecQuery();
            }
        }
    };
    L2Grid.prototype.getColumnNames = function () {
        if (this.columnCollections == null)
            return null;
        return this.columnCollections.first.columnList.map(function (c) { return c.display ? c.display : ""; });
    };
    L2Grid.prototype.ngAfterContentInit = function () {
        if (this.columnCollections && this.columnCollections.length > 1)
            throw new Error("You may have only one <columns> element.");
    };
    L2Grid.prototype.getFieldData = function (col, row) {
        var ret = row[col.bound];
        if (ret === undefined)
            return "";
        else
            return ret;
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
            templateUrl: './l2-grid.html',
            styleUrls: ['./l2-grid.css'],
            changeDetection: ChangeDetectionStrategy.OnPush
        }), 
        __metadata('design:paramtypes', [ViewContainerRef, ChangeDetectorRef])
    ], L2Grid);
    return L2Grid;
}());
//# sourceMappingURL=l2-grid.js.map