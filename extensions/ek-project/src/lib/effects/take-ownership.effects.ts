import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
//import { MatSnackBar } from '@angular/material/snack-bar';

import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { TranslateService } from '@ngx-translate/core';
import { tap } from 'rxjs/operators';

import {
  TakeOwnershipAction, TakeOwnershipSuccessAction, TakeOwnershipFailureAction,
  TAKE_OWNERSHIP_ACTION_TYPE, TAKE_OWNERSHIP_SUCCESS_ACTION_TYPE, TAKE_OWNERSHIP_FAILURE_ACTION_TYPE } from '../actions/take-ownership.actions';
import { EkProjectNodeService } from '../services/ek-project-node.service';

import { ConfirmDialogComponent } from '@alfresco/adf-core';
import { ReloadDocumentListAction ,SnackbarInfoAction, SnackbarErrorAction } from '@alfresco/aca-shared/store';

@Injectable()
export class TakeOwnershipEffects {
  constructor(
    private actions$: Actions,
    private ekProjectNodeService: EkProjectNodeService,
    private dialogRef: MatDialog,
    //private snackBar: MatSnackBar,
    private translateService: TranslateService,
    private store: Store
  ) {}

  // Effect for doing the ownership change
  takeOwnership$ = createEffect(() => this.actions$.pipe(
    tap(action => console.log('Action received in effect:', action)),
    ofType<TakeOwnershipAction>(TAKE_OWNERSHIP_ACTION_TYPE),
    tap(action => console.log('Action passed filter (TAKE_OWNERSHIP_ACTION_TYPE):', action)),
    tap((action) => {
      if (action.payload) {
        const message = this.translateService.instant(
          'EK_PROJECT.DIALOGS.CONFIRM_TAKE_OWNERSHIP.MESSAGES.CONFIRM',
          { name: action.payload?.name || 'unknown' }
        );

        const dialogRef = this.dialogRef.open(ConfirmDialogComponent, {
          data: {
            title: 'EK_PROJECT.DIALOGS.CONFIRM_TAKE_OWNERSHIP.TITLE',
            message: message,
            yesLabel: 'APP.DIALOGS.CONFIRM_LEAVE.YES_LABEL',
            noLabel: 'APP.DIALOGS.CONFIRM_LEAVE.NO_LABEL'
          },
          minWidth: '250px'
        });

        dialogRef.afterClosed().subscribe((result) => {
          if (result === true) { // Clicked OK
            this.ekProjectNodeService.currentUserTakeNodeOwnership(action.payload)
              .subscribe({
                next: (updatedNode) => {
                  this.store.dispatch(new TakeOwnershipSuccessAction(updatedNode));
                },
                error: (error) => {
                  this.store.dispatch(new TakeOwnershipFailureAction(action.payload, error));
                }
              });
          }
        });
      }
    })
  ), { dispatch: false });

  // Success notification effect
  takeOwnershipSuccess$ = createEffect(() => this.actions$.pipe(
    ofType<TakeOwnershipSuccessAction>(TAKE_OWNERSHIP_SUCCESS_ACTION_TYPE),
    tap(action => console.log('Action passed filter (TAKE_OWNERSHIP_SUCCESS_ACTION_TYPE):', action)),
    tap((action) => {
      this.store.dispatch(new SnackbarInfoAction('EK_PROJECT.DIALOGS.CONFIRM_TAKE_OWNERSHIP.MESSAGES.SUCCESS',
        {
            name: action.payload?.name || 'unknown'
        }
      ));

      // Reload the document list to make sure Take Ownership menu item is not available when right clicking
      this.store.dispatch(new ReloadDocumentListAction());

      /*
      const message = this.translateService.instant(
        'EK_PROJECT.MESSAGES.TAKE_OWNERSHIP_UPDATE_SUCCESS',
        { name: action.payload?.name || 'unknown' }
      );

      this.snackBar.open(message, this.translateService.instant('APP.ACTIONS.CLOSE'), {
        duration: 4000,
        panelClass: 'info-snackbar'
      });
      */
    })
  ), { dispatch: false });

  // Failure notification effect
  takeOwnershipFailure$ = createEffect(() => this.actions$.pipe(
    ofType<TakeOwnershipFailureAction>(TAKE_OWNERSHIP_FAILURE_ACTION_TYPE),
    tap(action => console.log('Action passed filter (TAKE_OWNERSHIP_FAILURE_ACTION_TYPE):', action)),
    tap((action) => {
      this.store.dispatch(new SnackbarErrorAction('EK_PROJECT.DIALOGS.CONFIRM_TAKE_OWNERSHIP.MESSAGES.FAILED',
        {
            name: action.payload?.name || 'unknown',
            error: action.error?.message || 'Unknown error'
        }
      ));

    })
  ), { dispatch: false });
}

