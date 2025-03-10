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

import { ContextMenu, ContextMenuActionTypes, CustomContextMenu } from '@alfresco/aca-shared/store';
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map } from 'rxjs/operators';
import { ContextMenuOverlayRef } from '../../components/context-menu/context-menu-overlay';
import { ContextMenuService } from '../../components/context-menu/context-menu.service';

@Injectable()
export class ContextMenuEffects {
  private overlayRef: ContextMenuOverlayRef = null;

  contextMenuService = inject(ContextMenuService);
  actions$ = inject(Actions);

  contextMenu$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<ContextMenu>(ContextMenuActionTypes.ContextMenu),
        map((action) => {
          if (this.overlayRef) {
            this.overlayRef.close();
          }

          this.overlayRef = this.contextMenuService.open({
            source: action.event,
            hasBackdrop: false,
            backdropClass: 'cdk-overlay-transparent-backdrop',
            panelClass: 'cdk-overlay-pane'
          });
        })
      ),
    { dispatch: false }
  );

  customContextMenu$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<CustomContextMenu>(ContextMenuActionTypes.CustomContextMenu),
        map((action) => {
          if (action.payload?.length) {
            if (this.overlayRef) {
              this.overlayRef.close();
            }
            this.overlayRef = this.contextMenuService.open(
              {
                source: action.event,
                hasBackdrop: false,
                backdropClass: 'cdk-overlay-transparent-backdrop',
                panelClass: 'cdk-overlay-pane'
              },
              action.payload
            );
          }
        })
      ),
    { dispatch: false }
  );
}
