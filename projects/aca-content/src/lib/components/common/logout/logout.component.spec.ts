/*!
 * Copyright © 2005-2025 Hyland Software, Inc. and its affiliates. All rights reserved.
 *
 * Alfresco Example Content Application
 *
 * This file is part of the Alfresco Example Content Application.
 * If the software was purchased under a paid Alfresco license, the terms of
 * the paid license agreement will prevail. Otherwise, the software is
 * provided under the following open source license terms:
 *
 * The Alfresco Example Content Application is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * The Alfresco Example Content Application is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * from Hyland Software. If not, see <http://www.gnu.org/licenses/>.
 */

import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AppTestingModule } from '../../../testing/app-testing.module';
import { LogoutComponent } from './logout.component';
import { Store } from '@ngrx/store';
import { SetSelectedNodesAction } from '@alfresco/aca-shared/store';

describe('LogoutComponent', () => {
  let fixture: ComponentFixture<LogoutComponent>;
  let component: LogoutComponent;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppTestingModule, LogoutComponent],
      providers: [
        {
          provide: Store,
          useValue: {
            dispatch: jasmine.createSpy('dispatch')
          }
        }
      ]
    });

    store = TestBed.inject(Store);
    fixture = TestBed.createComponent(LogoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should reset selected nodes from store', () => {
    component.onLogoutEvent();

    expect(store.dispatch).toHaveBeenCalledWith(new SetSelectedNodesAction([]));
  });
});
