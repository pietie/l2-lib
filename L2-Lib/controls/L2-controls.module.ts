import { NgModule } from '@angular/core';

import { L2Grid, L2GridColumn, L2GridColumnCollection, L2GridNoResults, L2GridTemplateColumn, L2GridTemplateColumnRow } from './l2-grid/l2-grid';

@NgModule({
    declarations: [
        L2Grid, L2GridColumn, L2GridColumnCollection, L2GridNoResults, L2GridTemplateColumn, L2GridTemplateColumnRow

    ],
    imports: [

    ],
    providers: [],
    entryComponents: [],
    bootstrap: []
})
export class L2ControlsModule { }