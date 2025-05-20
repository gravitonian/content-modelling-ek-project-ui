import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap, switchMap, take } from 'rxjs/operators';

import {
  CreateClientSupplierAction, CreateClientSupplierSuccessAction, CreateClientSupplierFailureAction,
  CREATE_CLIENT_SUPPLIER_ACTION_TYPE, CREATE_CLIENT_SUPPLIER_SUCCESS_ACTION_TYPE, CREATE_CLIENT_SUPPLIER_FAILURE_ACTION_TYPE } from '../actions/client-supplier.actions';
import { CreateClientSupplierDialogComponent } from '../components/create-client-supplier-dialog.component';
import { SupplierClientData, CreateClientSupplierPayload } from '../models/ek-project.model';
import { EkProjectNodeService } from '../services/ek-project-node.service';

import { getCurrentFolder, ReloadDocumentListAction, SnackbarInfoAction, SnackbarErrorAction } from '@alfresco/aca-shared/store';

@Injectable()
export class ClientSupplierEffects {
  constructor(
    private actions$: Actions,
    private store: Store,
    private dialogRef: MatDialog,
    private ekProjectNodeService: EkProjectNodeService
  ) {}

  createClientSupplier$ = createEffect(() => this.actions$.pipe(
    ofType<CreateClientSupplierAction>(CREATE_CLIENT_SUPPLIER_ACTION_TYPE),
    tap(action => console.log('Action passed filter (CREATE_CLIENT_SUPPLIER_ACTION_TYPE):', action)),
    switchMap(() => {
      // Always get current folder from store
      return this.store.select(getCurrentFolder).pipe(
        take(1), // Ensure we only subscribe once to the store selector
        tap(currentFolder => {
          if (currentFolder) {
            console.log('Current folder from store:', currentFolder);
            this.openClientSupplierDialog(currentFolder);
          } else {
            console.error('No current folder available in store');
          }
        })
      );
    })
  ), { dispatch: false });

  // Success notification effect
  createClientSupplierSuccess$ = createEffect(() => this.actions$.pipe(
    ofType<CreateClientSupplierSuccessAction>(CREATE_CLIENT_SUPPLIER_SUCCESS_ACTION_TYPE),
    tap(action => console.log('Action passed filter (CREATE_CLIENT_SUPPLIER_SUCCESS_ACTION_TYPE):', action)),
    tap((action) => {
      this.store.dispatch(new SnackbarInfoAction('EK_PROJECT.DIALOGS.CREATE_CLIENT_SUPPLIER.MESSAGES.SUCCESS',
        {
            name: action.payload?.name || 'unknown'
        }
      ));

      // Refresh the document list to show the newly created item
      this.store.dispatch(new ReloadDocumentListAction());
    })
  ), { dispatch: false });

  // Failure notification effect
  createClientSupplierFailure$ = createEffect(() => this.actions$.pipe(
    ofType<CreateClientSupplierFailureAction>(CREATE_CLIENT_SUPPLIER_FAILURE_ACTION_TYPE),
    tap(action => console.log('Action passed filter (CREATE_CLIENT_SUPPLIER_FAILURE_ACTION_TYPE):', action)),
    tap((action) => {
      this.store.dispatch(new SnackbarErrorAction('EK_PROJECT.DIALOGS.CREATE_CLIENT_SUPPLIER.MESSAGES.FAILED',
        {
            error: action.error?.message || 'Unknown error'
        }
      ));
    })
  ), { dispatch: false });

  /**
   * Helper method to open the dialog and handle the result
   */
  private openClientSupplierDialog(folderNode: any) {
    const dialogRef = this.dialogRef.open(CreateClientSupplierDialogComponent, {
      width: '800px',
      disableClose: true,
      autoFocus: true,
      data: {
        node: folderNode
      }
    });

    dialogRef.afterClosed().subscribe((result: SupplierClientData) => {
      if (result) {
        console.log('Dialog returned:', result);

        // Create the structure expected by createClientSupplier
        const clientSupplierData: CreateClientSupplierPayload = {
          parentNodeId: folderNode.id,   // current folder id - parent for new supplier-client profile item
          nodeData: result
        };

        this.ekProjectNodeService.createClientSupplier(clientSupplierData)
          .subscribe({
            next: (createdNode) => {
              this.store.dispatch(new CreateClientSupplierSuccessAction(createdNode));
            },
            error: (error) => {
              this.store.dispatch(new CreateClientSupplierFailureAction(error));
            }
          });
      }
    });
  }
}
