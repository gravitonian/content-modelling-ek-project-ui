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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppTestingModule } from '../../testing/app-testing.module';
import { ContextMenuItemComponent } from './context-menu-item.component';
import { AppExtensionService } from '@alfresco/aca-shared';
import { ContextMenuComponent } from './context-menu.component';

describe('ContextMenuComponent', () => {
  let fixture: ComponentFixture<ContextMenuItemComponent>;
  let component: ContextMenuItemComponent;
  let extensionsService: AppExtensionService;
  let contextItem;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppTestingModule, ContextMenuComponent]
    });

    fixture = TestBed.createComponent(ContextMenuItemComponent);
    component = fixture.componentInstance;
    extensionsService = TestBed.inject(AppExtensionService);

    contextItem = {
      type: 'button',
      id: 'action-button',
      title: 'Test Button',
      actions: {
        click: 'TEST_EVENT'
      }
    };
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should render defined menu actions items', () => {
    component.actionRef = contextItem;
    fixture.detectChanges();

    const buttonElement = fixture.nativeElement.querySelector('button');
    expect(buttonElement.querySelector('[data-automation-id="action-button-label"]').innerText.trim()).toBe(contextItem.title);
  });

  it('should not run action when entry has no click attribute defined', () => {
    spyOn(extensionsService, 'runActionById');
    contextItem.actions = {};
    component.actionRef = contextItem;
    fixture.detectChanges();

    fixture.nativeElement.querySelector('#action-button').dispatchEvent(new MouseEvent('click'));

    expect(extensionsService.runActionById).not.toHaveBeenCalled();
  });

  it('should run action with provided action id', () => {
    spyOn(extensionsService, 'runActionById');
    component.actionRef = contextItem;
    fixture.detectChanges();

    fixture.nativeElement.querySelector('#action-button').dispatchEvent(new MouseEvent('click'));

    expect(extensionsService.runActionById).toHaveBeenCalledWith(contextItem.actions.click);
  });
});
