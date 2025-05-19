import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';

import {
  SetTitleDescriptionAction, SetTitleDescriptionSuccessAction, SetTitleDescriptionFailureAction,
  SET_TITLE_DESCRIPTION_ACTION_TYPE, SET_TITLE_DESCRIPTION_SUCCESS_ACTION_TYPE, SET_TITLE_DESCRIPTION_FAILURE_ACTION_TYPE } from '../actions/set-title-description.actions';
import { SetTitleDescriptionDialogComponent } from '../components/set-title-description-dialog.component';
import { EkProjectNodeService } from '../services/ek-project-node.service';

import { ReloadDocumentListAction, SnackbarInfoAction, SnackbarErrorAction } from '@alfresco/aca-shared/store';

@Injectable()
export class SetTitleDescriptionEffects {

  constructor(
    private actions$: Actions,
    private store: Store,
    private dialogRef: MatDialog,
    private ekProjectNodeService: EkProjectNodeService
  ) {}

  setTitleDescription$ = createEffect(() => this.actions$.pipe(
    ofType<SetTitleDescriptionAction>(SET_TITLE_DESCRIPTION_ACTION_TYPE),
    tap(action => console.log('Action passed filter (SET_TITLE_DESCRIPTION_ACTION_TYPE):', action)),
    tap((action) => {
      if (action.payload) {
        const dialogRef = this.dialogRef.open(SetTitleDescriptionDialogComponent, {
          width: '500px',
          disableClose: true,
          autoFocus: true,
          panelClass: 'aca-set-title-description-dialog-panel',
          data: {
            node: action.payload
          }
        });

        dialogRef.afterClosed().subscribe((result) => {
         if (result && result.title) { // Check if result exists AND has a title
           console.log('Dialog returned:', result.title, result.description);
           this.ekProjectNodeService.setTitleDescription(action.payload, result.title, result.description)
             .subscribe({
               next: (updatedNode) => {
                 this.store.dispatch(new SetTitleDescriptionSuccessAction(updatedNode));
               },
               error: (error) => {
                 this.store.dispatch(new SetTitleDescriptionFailureAction(action.payload, error));
               }
             });
         }
        });
      }
    })
  ), { dispatch: false });

  // Success notification effect
  setTitleDescriptionSuccess$ = createEffect(() => this.actions$.pipe(
    ofType<SetTitleDescriptionSuccessAction>(SET_TITLE_DESCRIPTION_SUCCESS_ACTION_TYPE),
    tap(action => console.log('Action passed filter (SET_TITLE_DESCRIPTION_SUCCESS_ACTION_TYPE):', action)),
    tap((action) => {
      this.store.dispatch(new SnackbarInfoAction('EK_PROJECT.DIALOGS.SET_TITLE_DESCRIPTION.MESSAGES.SUCCESS',
        {
            name: action.payload?.name || 'unknown'
        }
      ));

      // Reload the document list to make sure a changed Title and Description available when right clicking
      this.store.dispatch(new ReloadDocumentListAction());
    })
  ), { dispatch: false });

  // Failure notification effect
  setTitleDescriptionFailure$ = createEffect(() => this.actions$.pipe(
    ofType<SetTitleDescriptionFailureAction>(SET_TITLE_DESCRIPTION_FAILURE_ACTION_TYPE),
    tap(action => console.log('Action passed filter (SET_TITLE_DESCRIPTION_FAILURE_ACTION_TYPE):', action)),
    tap((action) => {
      this.store.dispatch(new SnackbarErrorAction('EK_PROJECT.DIALOGS.SET_TITLE_DESCRIPTION.MESSAGES.FAILED',
        {
            name: action.payload?.name || 'unknown',
            error: action.error?.message || 'Unknown error'
        }
      ));
    })
  ), { dispatch: false });

}
