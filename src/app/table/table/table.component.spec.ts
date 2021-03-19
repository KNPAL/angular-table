
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
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { TableModule } from 'primeng/table';
import { TableComponent } from './table.component';
import * as MockStub from '../../../core/mocks/data.stub';
import { TableActionService } from 'src/app/core/services/table-action.service';
import { APPLICATION_COLUMNS } from 'src/app/byoc/shared/configurations/table-columns/application-grid-column';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('TableComponent', () => {
  let component: TableComponent;
  let fixture: ComponentFixture<TableComponent>;
  let service: TableActionService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, TableModule, HttpClientTestingModule],
      providers: [TableActionService],
      declarations: [TableComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(TableActionService);
    component.tableId = 'tableId';
    component.SearchableFields = ['containerName', 'tagName'];
    component.DataSource = MockStub.GetApplicationsStub;
    component.Columns = APPLICATION_COLUMNS;
    fixture.detectChanges();
  });

  it('should create TableComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should render the table based on conditions', () => {
    component.UserWriteAccess = true;
    component.ngOnInit();
    expect(component.showEditAction).toEqual(true);
  });

  it('should have disabled the body checkbox (individual selection) if showCheckbox is false ', fakeAsync(() => {
    component.showCheckbox = false;
    fixture.detectChanges();
    const tableEl = fixture.debugElement.query(By.css('#tableId'));
    const el = tableEl.query(By.css('tbody')).query(By.css('tr')).query(By.css('td'));
    const checkEl = el.query(By.css('.p-hidden-accessible'));
    expect(checkEl).toBeNull();
  }));

  it('should have checked the checkbox', fakeAsync(() => {
    component.showCheckbox = true;
    component.DataSource = [MockStub.GetTagsStub];
    fixture.detectChanges();
    const tableEl = fixture.debugElement.query(By.css('#tableId'));
    const el = tableEl.query(By.css('tbody')).query(By.css('tr')).query(By.css('td')).query(By.css('.p-hidden-accessible'));
    const checkEl = el.nativeElement.querySelector('input');
    expect(checkEl.checked).toBe(false);
    checkEl.click();
    fixture.detectChanges();
    expect(checkEl.checked).toBe(true);
    expect(component.selectedData.length).toBeGreaterThanOrEqual(1);
  }));

  it('should have checked the checkbox and Delete button to be disabled', fakeAsync(() => {
    component.showCheckbox = true;
    component.DataSource = MockStub.GetApplicationsStub;
    fixture.detectChanges();
    const tableEl = fixture.debugElement.query(By.css('#tableId'));
    const el = tableEl.query(By.css('tbody')).query(By.css('tr')).query(By.css('td')).query(By.css('.p-hidden-accessible'));
    const checkEl = el.nativeElement.querySelector('input');
    expect(checkEl.checked).toBe(false);
    fixture.detectChanges();
    expect(component.selectedData).not.toBeDefined();
  }));

  it('should have checked the checkbox and Delete button to be enabled', fakeAsync(() => {
    component.showCheckbox = true;
    component.DataSource = MockStub.GetApplicationsStub;
    fixture.detectChanges();
    const tableEl = fixture.debugElement.query(By.css('#tableId'));
    const el = tableEl.query(By.css('tbody')).query(By.css('tr')).query(By.css('td')).query(By.css('.p-hidden-accessible'));
    const checkEl = el.nativeElement.querySelector('input');
    expect(checkEl.checked).toBe(false);
    checkEl.click();
    fixture.detectChanges();
    expect(checkEl.checked).toBe(true);
    expect(component.selectedData.length).toBeGreaterThanOrEqual(1);
  }));

  it('should have called onEditClick(test1) if clicked on and application data is present', fakeAsync(() => {
    spyOn(component, 'onEditClick');
    component.showCheckbox = true;
    component.editableTable = true;
    component.showEditAction = true;
    component.DataSource = MockStub.GetApplicationsStub;

    fixture.detectChanges();
    const tableEl = fixture.debugElement.query(By.css('#tableId'));
    const el = tableEl.query(By.css('tbody')).query(By.css('tr')).query(By.css('.text-center')).query(By.css('.d-inline'));
    el.nativeElement.querySelector('button').click();
    fixture.whenStable().then(() => {
      expect(component.onEditClick).toHaveBeenCalled();
    });
  }));

  it('should have called not disbaled actions and enabled DeleteAction', fakeAsync(() => {
    spyOn(component, 'onDeleteClick');
    component.showCheckbox = true;
    component.editableTable = true;
    component.showEditAction = false;
    component.showDeleteAction = true;
    component.DataSource = MockStub.GetApplicationsStub;

    fixture.detectChanges();
    const tableEl = fixture.debugElement.query(By.css('#tableId'));
    const el = tableEl.query(By.css('tbody')).query(By.css('tr')).query(By.css('.text-center')).query(By.css('.d-inline'));
    el.nativeElement.querySelector('button').click();
    fixture.whenStable().then(() => {
      expect(component.onDeleteClick).toHaveBeenCalled();
    });
  }));

  it('should have added a new row when clicked on Add new', () => {
    spyOn(component, 'addNewRow').and.callThrough();
    component.CreateNewRow = { applicationId: -1, name: '', description: '' };
    expect(component.addNewRow()).toEqual({ applicationId: -1, name: '', description: '' });
  });

  it('should have expanded to show details when clicked on expandd icon => onRowExpand()', () => {
    component.onRowExpand({ data: {} });
    expect(component.currentSelectedRow).toEqual({});
  });

  it('should have called onEditClick()', () => {
    component.onEditClick('Hello');
    service.editEventEmitter.subscribe((data) => {
      expect(data).toEqual('Hello');
    });
  });

  it('should have called onCancelClick(data, index)', () => {
    component.onCancelClick('Hello', 0);
    service.cancelEventEmitter.subscribe((data) => {
      expect(data).toEqual(['Hello', 0]);
    });
  });

  it('should have called onSaveClick(data, index)', () => {
    component.onSaveClick('Hello', 0);
    service.saveEventEmitter.subscribe((data) => {
      expect(data).toEqual(['Hello', 0]);
    });
  });

  it('should have called onDeleteClick(data)', () => {
    component.onDeleteClick('Hello');
    service.deleteEventEmitter.subscribe((data) => {
      expect(data).toEqual('Hello');
    });
  });

  it('should have called onDeleteSelected()', () => {
    component.selectedData = [];
    component.onDeleteSelected();
    service.deleteEventEmitter.subscribe((data) => {
      expect(data).toEqual([]);
    });
  });

  it('should have called onRowSelect(event)', () => {
    component.onRowSelect({ data: {} });
    service.selectEventEmitter.subscribe((data) => {
      expect(data).toEqual({});
    });
  });

});
