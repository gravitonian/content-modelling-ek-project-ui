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

import { SnackbarContentComponent, SnackBarData, TranslationService } from '@alfresco/adf-core';
import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { AppStore } from '../states/app.state';
import { SnackbarAction, SnackbarActionTypes, SnackbarErrorAction, SnackbarInfoAction, SnackbarWarningAction } from '../actions/snackbar.actions';

@Injectable()
export class SnackbarEffects {
  private store = inject(Store<AppStore>);
  private actions$ = inject(Actions);
  private snackBar = inject(MatSnackBar);
  private translationService = inject(TranslationService);

  infoEffect = createEffect(
    () =>
      this.actions$.pipe(
        ofType<SnackbarInfoAction>(SnackbarActionTypes.Info),
        map((action: SnackbarInfoAction) => {
          this.showSnackBar(action, 'adf-info-snackbar');
        })
      ),
    { dispatch: false }
  );

  warningEffect = createEffect(
    () =>
      this.actions$.pipe(
        ofType<SnackbarWarningAction>(SnackbarActionTypes.Warning),
        map((action: SnackbarWarningAction) => {
          this.showSnackBar(action, 'adf-warning-snackbar');
        })
      ),
    { dispatch: false }
  );

  errorEffect = createEffect(
    () =>
      this.actions$.pipe(
        ofType<SnackbarErrorAction>(SnackbarActionTypes.Error),
        map((action: SnackbarErrorAction) => {
          this.showSnackBar(action, 'adf-error-snackbar');
        })
      ),
    { dispatch: false }
  );

  private showSnackBar(action: SnackbarAction, panelClass: string) {
    const message = this.translate(action.payload, action.params);

    let actionName: string = null;
    if (action.userAction) {
      actionName = this.translate(action.userAction.title);
    }
    const snackBarRef = this.snackBar.openFromComponent<SnackbarContentComponent, SnackBarData>(SnackbarContentComponent, {
      ...(action.duration !== undefined && action.duration !== null && { duration: action.duration }),
      panelClass,
      data: {
        message,
        actionLabel: actionName,
        actionIcon: 'close',
        actionIconAriaLabel: 'CLOSE',
        showAction: true,
        callActionOnIconClick: false
      }
    });

    if (action.userAction) {
      snackBarRef.onAction().subscribe(() => {
        this.store.dispatch(action.userAction.action);
      });
    }
  }

  private translate(message: string, params?: any): string {
    return this.translationService.instant(message, params);
  }
}
