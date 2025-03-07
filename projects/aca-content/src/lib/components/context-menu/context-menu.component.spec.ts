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
import { ContextMenuComponent } from './context-menu.component';
import { ContextMenuOverlayRef } from './context-menu-overlay';
import { ContentActionType } from '@alfresco/adf-extensions';

import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppExtensionService } from '@alfresco/aca-shared';

describe('ContextMenuComponent', () => {
  let fixture: ComponentFixture<ContextMenuComponent>;
  let component: ContextMenuComponent;
  let extensionsService: AppExtensionService;

  const contextItem = {
    type: ContentActionType.button,
    id: 'action-button',
    title: 'Test Button',
    actions: {
      click: 'TEST_EVENT'
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppTestingModule],
      providers: [
        {
          provide: ContextMenuOverlayRef,
          useValue: {
            close: jasmine.createSpy('close')
          }
        },
        {
          provide: Store,
          useValue: {
            dispatch: () => {},
            select: () => of({ count: 1 })
          }
        }
      ]
    });

    fixture = TestBed.createComponent(ContextMenuComponent);
    component = fixture.componentInstance;

    extensionsService = TestBed.inject(AppExtensionService);
  });

  it('should load context menu actions on init', () => {
    spyOn(extensionsService, 'getAllowedContextMenuActions').and.returnValue(of([contextItem]));
    fixture.detectChanges();

    expect(component.actions.length).toBe(1);
  });

  it('should render defined context menu actions items', async () => {
    spyOn(extensionsService, 'getAllowedContextMenuActions').and.returnValue(of([contextItem]));
    fixture.detectChanges();
    await fixture.whenStable();

    const contextMenuElements = document.body.querySelector('.aca-context-menu')?.querySelectorAll('button');
    const actionButtonLabel: HTMLElement = contextMenuElements?.[0].querySelector(`[data-automation-id="${contextItem.id}-label"]`);

    expect(contextMenuElements?.length).toBe(1);
    expect(actionButtonLabel.innerText).toBe(contextItem.title);
  });

  it('should not render context menu if no actions items', async () => {
    spyOn(extensionsService, 'getAllowedContextMenuActions').and.returnValue(of([]));
    fixture.detectChanges();
    await fixture.whenStable();

    const contextMenuElements = document.body.querySelector('.aca-context-menu');

    expect(contextMenuElements).toBeNull();
  });
});
