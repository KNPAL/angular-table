
/*
    // Copyright (c) 2021 Intel Corporation
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    */
import { Component, DoCheck, Input, OnInit } from '@angular/core';
import { LOCAL_STRINGS } from 'src/assets/locale/constant';
import { TableActionService } from 'src/app/core/services/table-action.service';
import { ByocService } from 'src/app/core';
import { Router } from '@angular/router';
import { ByocRoutes } from '../../constants/routes.names';

@Component({
  selector: 'intl-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit, DoCheck {

  @Input() DataSource: any[];
  @Input() isFilterable: boolean;
  @Input() CreateNewRow;
  @Input() Columns: any[];
  @Input() TableName: string;
  @Input() tableId: string;
  @Input() uniqueDataKey: string;
  @Input() SearchableFields: string[];
  @Input() MultiSelect: boolean;
  @Input() ExpandedColums: any[];
  @Input() RowDeleteAllowed: boolean;
  @Input() SearchPlaceholder: string;
  @Input() UserWriteAccess: boolean;
  @Input() showAssignAction: boolean;
  @Input() tableSelectionMode: string;
  colSpanSize: number;
  selectedData: any[];
  currentSelectedRow: any;
  showCheckbox: boolean;
  editableTable: boolean;
  showEditAction: boolean;
  showDeleteAction: boolean;
  showCreateNewIcon: boolean;
  devCloudStrings = LOCAL_STRINGS;
  emptyRowPresent: boolean;
  expand = [];
  constructor(public tableActionService: TableActionService, public byocService: ByocService, private router: Router) {
  }

  ngOnInit(): void {
    this.colSpanSize = this.Columns.length;
    if (this.UserWriteAccess) {
      this.showCreateNewIcon = !!this.CreateNewRow;
      this.showCheckbox = this.MultiSelect;
      this.showDeleteAction = this.RowDeleteAllowed;
      this.editableTable = !this.Columns.findIndex(column => column.isEditable === true);
      if (this.editableTable) {
        this.showEditAction = true;
        this.colSpanSize += 2;
      } else {
        this.showDeleteAction = false;
      }
    }
  }

  onEditClick(data: any): void {
    this.tableActionService.editEventEmitter.emit(data);
  }

  ngDoCheck(): void {
    this.emptyRowPresent = !this.DataSource.findIndex(item => item[this.uniqueDataKey] === -1);
  }

  onSaveClick(data: any, i: number): void {
    this.selectedData = [];
    this.tableActionService.saveEventEmitter.emit([data, i]);
  }

  onCancelClick(data: any, i: number): void {
    this.selectedData = []; // slie
    this.tableActionService.cancelEventEmitter.emit([data, i]);
  }

  onDeleteClick(data: any): void {
    this.tableActionService.deleteEventEmitter.emit(data);
  }

  onDeleteSelected(): void {
    this.tableActionService.deleteEventEmitter.emit(this.selectedData);
  }

  onRowSelect(event): void {
    this.tableActionService.selectEventEmitter.emit(event.data);
  }

  addNewRow(): any {
    return this.CreateNewRow;
  }

  getExtandedTableDetails(column): any {
    return column[this.Columns.find(item => item.expandedDataSource).expandedDataSource];
  }

  onRowExpand(eve): void {
    this.currentSelectedRow = eve.data;
  }

  disableDeleteBtn(): boolean {
    if (this.emptyRowPresent) {
      return true;
    }
    return !this.selectedData || !this.selectedData.length;
  }

  disableSaveBtn(data): boolean {
    let retValue = false;
    const tempArray = this.Columns.filter(column => column.isEditable).map(obj => obj.key);
    tempArray.forEach(element => {
      if (!data[element] && !data[element].trim()) {
        retValue = true;
      }
    });
    return retValue;
  }

  onAssignClick(data: any): void {
    const value = {
      tableName: this.TableName,
      selectedData: data
    };
    this.tableActionService.assignEventEmitter.emit(value);
  }

  unassign(data, currentData): void {
    this.tableActionService.unassignEventEmitter.emit({ data, currentData });
  }

  navigateToCreateContainer(): void {
    this.router.navigate([ByocRoutes.Create_Container]);
  }
}
