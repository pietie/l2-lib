var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@angular/material';
import { L2Grid, L2GridColumn, L2GridColumnCollection, L2GridNoResults, L2GridTemplateColumn } from './l2-grid/l2-grid';
var L2ControlsModule = (function () {
    function L2ControlsModule() {
    }
    return L2ControlsModule;
}());
L2ControlsModule = __decorate([
    NgModule({
        declarations: [
            L2Grid, L2GridColumn, L2GridColumnCollection, L2GridNoResults, L2GridTemplateColumn /*, L2GridTemplateColumnRow*/
        ],
        imports: [
            CommonModule, MaterialModule
        ],
        exports: [
            L2Grid, L2GridColumn, L2GridColumnCollection, L2GridNoResults, L2GridTemplateColumn
        ],
        providers: [],
        entryComponents: [],
        bootstrap: []
    })
], L2ControlsModule);
export { L2ControlsModule };
//# sourceMappingURL=L2-controls.module.js.map