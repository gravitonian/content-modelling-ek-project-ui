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

import { AppHookService, AppSettingsService, ContentApiService, NodePermissionService } from '@alfresco/aca-shared';
import {
  AppStore,
  DeletedNodeInfo,
  DeleteStatus,
  getAppSelection,
  NavigateRouteAction,
  NavigateToParentFolder,
  NodeInfo,
  RefreshPreviewAction,
  SetSelectedNodesAction,
  ShowLoaderAction,
  SnackbarAction,
  SnackbarErrorAction,
  SnackbarInfoAction,
  SnackbarUserAction,
  SnackbarWarningAction,
  UndoDeleteNodesAction,
  UnlockWriteAction,
  ViewNodeVersionAction
} from '@alfresco/aca-shared/store';
import {
  DocumentListService,
  FolderDialogComponent,
  LibraryDialogComponent,
  NewVersionUploaderDataAction,
  NewVersionUploaderDialogData,
  NewVersionUploaderService,
  NodeAspectService,
  NodesApiService,
  ShareDialogComponent
} from '@alfresco/adf-content-services';
import { NotificationService, TranslationService, ConfirmDialogComponent, DialogComponent, DialogSize } from '@alfresco/adf-core';
import { DeletedNodesPaging, Node, NodeEntry, PathInfo, SiteBodyCreate, SiteEntry } from '@alfresco/js-api';
import { inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { forkJoin, Observable, of, zip } from 'rxjs';
import { catchError, map, mergeMap, take, tap } from 'rxjs/operators';
import { NodeActionsService } from './node-actions.service';
import { Router } from '@angular/router';
import { FolderInformationComponent } from '../dialogs/folder-details/folder-information.component';

interface RestoredNode {
  status: number;
  entry: Node;
  statusCode?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ContentManagementService {
  private notificationService = inject(NotificationService);
  private readonly createMenuButtonSelector = 'app-toolbar-menu button[id="app.toolbar.create"]';

  constructor(
    private nodesApiService: NodesApiService,
    private store: Store<AppStore>,
    private contentApi: ContentApiService,
    private permission: NodePermissionService,
    private dialogRef: MatDialog,
    private nodeActionsService: NodeActionsService,
    private translation: TranslationService,
    private nodeAspectService: NodeAspectService,
    private appHookService: AppHookService,
    private newVersionUploaderService: NewVersionUploaderService,
    private router: Router,
    private appSettingsService: AppSettingsService,
    private documentListService: DocumentListService
  ) {}

  addFavorite(nodes: Array<NodeEntry>) {
    if (nodes && nodes.length > 0) {
      this.contentApi.addFavorite(nodes).subscribe(() => {
        const favoriteNodes = nodes.map((node) => {
          const newNode = JSON.parse(JSON.stringify(node));
          newNode.entry.isFavorite = true;
          return newNode;
        });

        this.store.dispatch(new SetSelectedNodesAction(favoriteNodes));
      });
    }
  }

  removeFavorite(nodes: Array<NodeEntry>) {
    if (nodes && nodes.length > 0) {
      this.contentApi.removeFavorite(nodes).subscribe(() => {
        const favoriteNodes = nodes.map((node) => {
          const newNode = JSON.parse(JSON.stringify(node));
          newNode.entry.isFavorite = false;
          return newNode;
        });

        this.store.dispatch(new SetSelectedNodesAction(favoriteNodes));
      });
    }
  }

  manageVersions(node: any, focusedElementOnCloseSelector?: string) {
    if (node?.entry) {
      // shared and favorite
      const id = node.entry.nodeId || (node as any).entry.guid;

      if (id) {
        this.contentApi.getNodeInfo(id).subscribe((entry) => {
          this.openVersionManagerDialog(entry, focusedElementOnCloseSelector);
        });
      } else {
        this.openVersionManagerDialog(node.entry, focusedElementOnCloseSelector);
      }
    }
  }

  manageAspects(node: any, focusedElementOnCloseSelector?: string) {
    if (node?.entry) {
      // shared and favorite
      const id = node.entry.nodeId || (node as any).entry.guid;

      if (id) {
        this.contentApi.getNodeInfo(id).subscribe((entry) => {
          this.openAspectListDialog(entry, focusedElementOnCloseSelector);
        });
      } else {
        this.openAspectListDialog(node.entry, focusedElementOnCloseSelector);
      }
    }
  }

  versionUpdateDialog(node: Node, file: File) {
    this.contentApi.getNodeVersions(node.id).subscribe(({ list }) => {
      const newVersionUploaderDialogData = {
        node,
        file,
        currentVersion: list.entries[0].entry,
        title: 'VERSION.DIALOG.TITLE',
        showComments: this.appSettingsService.uploadAllowComments,
        allowDownload: this.appSettingsService.uploadAllowDownload
      } as NewVersionUploaderDialogData;
      const dialogConfig: MatDialogConfig = { width: '600px' };

      this.newVersionUploaderService.openUploadNewVersionDialog(newVersionUploaderDialogData, dialogConfig).subscribe(
        (data) => {
          if (data.action === NewVersionUploaderDataAction.upload) {
            if (data.newVersion.value.entry.properties['cm:lockType'] === 'WRITE_LOCK') {
              this.store.dispatch(new UnlockWriteAction(data.newVersion.value));
            }
          }
        },
        (error) => this.notificationService.showError(error)
      );
    });
  }

  shareNode(node: any, focusedElementOnCloseSelector?: string): void {
    if (node?.entry) {
      // shared and favorite
      const id = node.entry.nodeId || (node as any).entry.guid;

      if (id) {
        this.contentApi.getNodeInfo(id).subscribe((entry) => {
          this.openShareLinkDialog({ entry }, focusedElementOnCloseSelector);
        });
      } else {
        this.openShareLinkDialog(node, focusedElementOnCloseSelector);
      }
    }
  }

  openShareLinkDialog(node: any, focusedElementOnCloseSelector?: string) {
    const baseShareUrl = this.appSettingsService.baseShareUrl;

    this.dialogRef
      .open(ShareDialogComponent, {
        restoreFocus: true,
        width: '600px',
        panelClass: 'adf-share-link-dialog',
        data: {
          node,
          baseShareUrl
        }
      })
      .afterClosed()
      .subscribe(() => {
        this.store.dispatch(new SetSelectedNodesAction([node]));
        this.appHookService.linksUnshared.next();
        this.focusAfterClose(focusedElementOnCloseSelector);
      });
  }

  createFolder(parentNodeId: string) {
    const dialogInstance = this.dialogRef.open(FolderDialogComponent, {
      data: {
        parentNodeId,
        createTitle: undefined,
        nodeType: 'cm:folder'
      },
      width: '400px',
      role: 'dialog'
    });

    dialogInstance.componentInstance.error.subscribe((message: string) => {
      this.notificationService.showError(message);
    });

    dialogInstance.afterClosed().subscribe((node) => {
      if (node) {
        this.documentListService.reload();
      }
      this.focusAfterClose(this.createMenuButtonSelector);
    });
  }

  editFolder(folder: NodeEntry, focusedElementOnCloseSelector?: string) {
    if (!folder) {
      return;
    }

    const dialog = this.dialogRef.open(FolderDialogComponent, {
      data: {
        folder: folder.entry
      },
      width: '400px'
    });

    dialog.componentInstance.error.subscribe((message: string) => {
      this.notificationService.showError(message);
    });

    dialog.afterClosed().subscribe((node) => {
      if (node) {
        this.store.dispatch(new SetSelectedNodesAction([{ entry: node }]));
        this.nodesApiService.nodeUpdated.next(node);
      }
      this.focusAfterClose(focusedElementOnCloseSelector);
    });
  }

  createLibrary(): Observable<string> {
    const dialogInstance = this.dialogRef.open(LibraryDialogComponent, {
      width: '400px'
    });

    dialogInstance.componentInstance.error.subscribe((message: string) => {
      this.notificationService.showError(message);
    });

    return dialogInstance.afterClosed().pipe(
      tap((node) => {
        if (node) {
          this.appHookService.libraryCreated.next(node);
        }
        this.focusAfterClose(this.createMenuButtonSelector);
      }),
      map((node: SiteEntry) => {
        if (node?.entry?.guid) {
          return node.entry.guid;
        }
        return null;
      })
    );
  }

  deleteLibrary(id: string): void {
    this.contentApi.deleteSite(id).subscribe(
      () => {
        this.appHookService.libraryDeleted.next(id);
        this.notificationService.showInfo('APP.MESSAGES.INFO.LIBRARY_DELETED');
        this.store.dispatch(new NavigateRouteAction(['/libraries']));
      },
      () => {
        this.notificationService.showError('APP.MESSAGES.ERRORS.DELETE_LIBRARY_FAILED');
      }
    );
  }

  leaveLibrary(siteId: string, focusedElementOnCloseSelector?: string): void {
    const dialogRef = this.dialogRef.open(ConfirmDialogComponent, {
      data: {
        title: 'APP.DIALOGS.CONFIRM_LEAVE.TITLE',
        message: 'APP.DIALOGS.CONFIRM_LEAVE.MESSAGE',
        yesLabel: 'APP.DIALOGS.CONFIRM_LEAVE.YES_LABEL',
        noLabel: 'APP.DIALOGS.CONFIRM_LEAVE.NO_LABEL'
      },
      minWidth: '250px'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.contentApi.leaveSite(siteId).subscribe(
          () => {
            this.appHookService.libraryLeft.next(siteId);
            this.notificationService.showInfo('APP.MESSAGES.INFO.LEFT_LIBRARY');
          },
          () => {
            this.notificationService.showError('APP.MESSAGES.ERRORS.LEAVE_LIBRARY_FAILED');
          }
        );
      }
      this.focusAfterClose(focusedElementOnCloseSelector);
    });
  }

  updateLibrary(siteId: string, siteBody: SiteBodyCreate) {
    this.contentApi.updateLibrary(siteId, siteBody).subscribe(
      (siteEntry: SiteEntry) => {
        this.appHookService.libraryUpdated.next(siteEntry);
        this.notificationService.showInfo('LIBRARY.SUCCESS.LIBRARY_UPDATED');
      },
      () => {
        this.notificationService.showError('LIBRARY.ERRORS.LIBRARY_UPDATE_ERROR');
      }
    );
  }

  async unshareNodes(links: Array<NodeEntry>) {
    const promises = links.map((link) => this.contentApi.deleteSharedLink(link.entry.id).toPromise());
    await Promise.all(promises);
    this.appHookService.linksUnshared.next();
  }

  canUpdateNode(node: NodeEntry | Node): boolean {
    return this.permission.check(node, ['update']);
  }

  canUploadContent(folderNode: NodeEntry | Node): boolean {
    return this.permission.check(folderNode, ['create']);
  }

  purgeDeletedNodes(nodes: NodeEntry[]) {
    if (!nodes || nodes.length === 0) {
      return;
    }

    const dialogRef = this.dialogRef.open(ConfirmDialogComponent, {
      data: {
        title: 'APP.DIALOGS.CONFIRM_PURGE.TITLE',
        message: 'APP.DIALOGS.CONFIRM_PURGE.MESSAGE',
        yesLabel: 'APP.DIALOGS.CONFIRM_PURGE.YES_LABEL',
        noLabel: 'APP.DIALOGS.CONFIRM_PURGE.NO_LABEL'
      },
      minWidth: '250px'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        const nodesToDelete: NodeInfo[] = nodes.map((node) => {
          const { name } = node.entry;
          const id = (node as any).entry.nodeId || node.entry.id;

          return {
            id,
            name
          };
        });
        this.purgeNodes(nodesToDelete);
      }
    });
  }

  restoreDeletedNodes(selection: NodeEntry[] = []) {
    if (!selection.length) {
      return;
    }

    const nodesWithPath = selection.filter((node) => node.entry.path);

    if (selection.length && !nodesWithPath.length) {
      const failedStatus = this.processStatus([]);
      failedStatus.fail.push(...selection);
      this.showRestoreNotification(failedStatus);
      this.documentListService.reload();
      return;
    }

    let status: DeleteStatus;

    forkJoin(nodesWithPath.map((node) => this.restoreNode(node)))
      .pipe(
        tap((restoredNodes) => {
          status = this.processStatus(restoredNodes);
        }),
        mergeMap(() => this.contentApi.getDeletedNodes())
      )
      .subscribe((nodes: DeletedNodesPaging) => {
        const selectedNodes = this.diff(status.fail, selection, false);
        const remainingNodes = this.diff(selectedNodes, nodes.list.entries);

        if (!remainingNodes.length) {
          this.showRestoreNotification(status);
          this.documentListService.reload();
        } else {
          this.restoreDeletedNodes(remainingNodes);
        }
      });
  }

  copyNodes(nodes: Array<NodeEntry>, focusedElementOnCloseSelector?: string) {
    zip(this.nodeActionsService.copyNodes(nodes, undefined, focusedElementOnCloseSelector), this.nodeActionsService.contentCopied).subscribe(
      (result) => {
        const [operationResult, newItems] = result;
        this.showCopyMessage(operationResult, nodes, newItems);
      },
      (error) => {
        this.showCopyMessage(error, nodes);
      }
    );
  }

  moveNodes(nodes: Array<NodeEntry>, focusedElementOnCloseSelector?: string) {
    const permissionForMove = '!';

    zip(this.nodeActionsService.moveNodes(nodes, permissionForMove, focusedElementOnCloseSelector), this.nodeActionsService.contentMoved).subscribe(
      (result) => {
        const [operationResult, moveResponse] = result;
        this.showMoveMessage(nodes, operationResult, moveResponse);

        this.documentListService.reload();
      },
      (error) => {
        this.showMoveMessage(nodes, error);
      }
    );
  }

  getErrorMessage(errorObject: { message: any }): string {
    let i18nMessageString = 'APP.MESSAGES.ERRORS.GENERIC';

    try {
      const {
        error: { statusCode }
      } = JSON.parse(errorObject.message);

      if (statusCode === 409) {
        i18nMessageString = 'APP.MESSAGES.ERRORS.NODE_MOVE';
      } else if (statusCode === 403) {
        i18nMessageString = 'APP.MESSAGES.ERRORS.PERMISSION';
      }
    } catch (err) {
      /* Do nothing, keep the original message */
    }

    return i18nMessageString;
  }

  getNodeInfo(): Observable<Node> {
    return this.store.select(getAppSelection).pipe(
      take(1),
      mergeMap(({ file }) => {
        const id = (file as any).entry.nodeId || (file as any).entry.guid;
        if (!id) {
          return of(file.entry);
        } else {
          return this.contentApi.getNodeInfo(id);
        }
      })
    );
  }

  unlockNode(node: NodeEntry): Promise<void | NodeEntry> {
    return this.contentApi.unlockNode(node.entry.id).catch(() => {
      this.notificationService.showError('APP.MESSAGES.ERRORS.UNLOCK_NODE', null, { fileName: node.entry.name });
    });
  }

  private showCopyMessage(info: any, nodes: Array<NodeEntry>, newItems?: Array<NodeEntry>) {
    const numberOfCopiedItems = newItems ? newItems.length : 0;
    const failedItems = nodes.length - numberOfCopiedItems;

    let i18nMessageString = 'APP.MESSAGES.ERRORS.GENERIC';

    if (typeof info === 'string') {
      if (info.toLowerCase().indexOf('succes') !== -1) {
        let i18MessageSuffix;

        if (failedItems) {
          if (numberOfCopiedItems) {
            i18MessageSuffix = numberOfCopiedItems === 1 ? 'PARTIAL_SINGULAR' : 'PARTIAL_PLURAL';
          } else {
            i18MessageSuffix = failedItems === 1 ? 'FAIL_SINGULAR' : 'FAIL_PLURAL';
          }
        } else {
          i18MessageSuffix = numberOfCopiedItems === 1 ? 'SINGULAR' : 'PLURAL';
        }

        i18nMessageString = `APP.MESSAGES.INFO.NODE_COPY.${i18MessageSuffix}`;
      }
    } else {
      try {
        const {
          error: { statusCode }
        } = JSON.parse(info.message);

        if (statusCode === 403) {
          i18nMessageString = 'APP.MESSAGES.ERRORS.PERMISSION';
        }
      } catch {}
    }

    const undo = numberOfCopiedItems > 0 ? this.translation.instant('APP.ACTIONS.UNDO') : '';

    const message = this.translation.instant(i18nMessageString, {
      success: numberOfCopiedItems,
      failed: failedItems
    });

    this.notificationService
      .openSnackMessageAction(message, undo, {
        panelClass: 'info-snackbar'
      })
      .onAction()
      .subscribe(() => this.undoCopyNodes(newItems));
  }

  private undoCopyNodes(nodes: NodeEntry[]) {
    const batch = this.nodeActionsService
      .flatten(nodes)
      .filter((item) => item.entry)
      .map((item) => this.contentApi.deleteNode(item.entry.id, { permanent: true }));

    forkJoin(...batch).subscribe(
      () => {
        this.appHookService.nodesDeleted.next(null);
        this.documentListService.reload();
      },
      (error) => {
        let i18nMessageString = 'APP.MESSAGES.ERRORS.GENERIC';

        let errorJson = null;
        try {
          errorJson = JSON.parse(error.message);
        } catch {}

        if (errorJson?.error?.statusCode === 403) {
          i18nMessageString = 'APP.MESSAGES.ERRORS.PERMISSION';
        }

        this.notificationService.showError(i18nMessageString);
      }
    );
  }

  private openVersionManagerDialog(node: any, focusedElementOnCloseSelector?: string) {
    // workaround Shared
    if (node.isFile || node.nodeId) {
      const newVersionUploaderDialogData: NewVersionUploaderDialogData = {
        node,
        showVersionsOnly: true,
        title: 'VERSION.DIALOG.TITLE',
        allowDownload: this.appSettingsService.uploadAllowDownload,
        showComments: this.appSettingsService.uploadAllowComments,
        showActions: this.appSettingsService.versionManagerShowActions,
        allowViewVersions: this.appSettingsService.versionManagerAllowViewVersions,
        allowVersionDelete: this.appSettingsService.versionManagerAllowVersionDelete
      };
      this.newVersionUploaderService
        .openUploadNewVersionDialog(newVersionUploaderDialogData, { width: '630px', role: 'dialog' }, focusedElementOnCloseSelector)
        .subscribe({
          next: (newVersionUploaderData) => {
            switch (newVersionUploaderData.action) {
              case NewVersionUploaderDataAction.refresh:
                this.documentListService.reload();
                this.store.dispatch(new RefreshPreviewAction(newVersionUploaderData.node));
                break;
              case NewVersionUploaderDataAction.view:
                this.store.dispatch(
                  new ViewNodeVersionAction(node.id, newVersionUploaderData.versionId, {
                    location: this.router.url
                  })
                );
                break;
              default:
                break;
            }
          }
        });
    } else {
      this.notificationService.showError('APP.MESSAGES.ERRORS.PERMISSION');
    }
  }

  private openAspectListDialog(node: any, focusedElementOnCloseSelector?: string) {
    // workaround Shared
    if (node.isFile || node.id) {
      this.nodeAspectService.updateNodeAspects(node.id, focusedElementOnCloseSelector);
    } else {
      this.notificationService.showError('APP.MESSAGES.ERRORS.PERMISSION');
    }
  }

  private undoMoveNodes(moveResponse, selectionParentId: string) {
    const movedNodes = moveResponse?.['succeeded'] ?? [];
    const partiallyMovedNodes = moveResponse?.['partiallySucceeded'] ?? [];

    const restoreDeletedNodesBatch = this.nodeActionsService.moveDeletedEntries.map((folderEntry) =>
      this.contentApi.restoreNode(folderEntry.nodeId || folderEntry.id).pipe(map((node) => node.entry))
    );

    zip(...restoreDeletedNodesBatch, of(null))
      .pipe(
        mergeMap(() => {
          const nodesToBeMovedBack = [...partiallyMovedNodes, ...movedNodes];

          const revertMoveBatch = this.nodeActionsService
            .flatten(nodesToBeMovedBack)
            .filter((node) => node.entry || node.itemMoved?.entry)
            .map((node) => {
              if (node.itemMoved) {
                return this.nodeActionsService.moveNodeAction(node.itemMoved.entry, node.initialParentId);
              } else {
                return this.nodeActionsService.moveNodeAction(node.entry, selectionParentId);
              }
            });

          return zip(...revertMoveBatch, of(null));
        })
      )
      .subscribe(
        () => {
          this.documentListService.reload();
        },
        (error) => {
          let message = 'APP.MESSAGES.ERRORS.GENERIC';

          let errorJson = null;
          try {
            errorJson = JSON.parse(error.message);
          } catch {}

          if (errorJson?.error?.statusCode === 403) {
            message = 'APP.MESSAGES.ERRORS.PERMISSION';
          }

          this.notificationService.showError(message);
        }
      );
  }

  deleteNodes(items: NodeEntry[], allowUndo = true): void {
    const batch: Observable<DeletedNodeInfo>[] = [];

    items.forEach((node) => {
      batch.push(this.deleteNode(node));
    });

    forkJoin(...batch).subscribe((data: DeletedNodeInfo[]) => {
      const status = this.processStatus(data);
      const message = this.getDeleteMessage(status);

      if (message && status.someSucceeded && allowUndo) {
        message.userAction = new SnackbarUserAction('APP.ACTIONS.UNDO', new UndoDeleteNodesAction([...status.success]));
      }

      this.store.dispatch(message);

      if (status.someSucceeded) {
        this.appHookService.nodesDeleted.next();
        this.documentListService.reload();
      }
      this.store.dispatch(new ShowLoaderAction(false));
    });
  }

  undoDeleteNodes(items: DeletedNodeInfo[]): void {
    const batch: Observable<DeletedNodeInfo>[] = [];

    items.forEach((item) => {
      batch.push(this.undoDeleteNode(item));
    });

    forkJoin(...batch).subscribe((data) => {
      const processedData = this.processStatus(data);

      if (processedData.fail.length) {
        const message = this.getUndoDeleteMessage(processedData);
        this.store.dispatch(message);
      }

      if (processedData.someSucceeded) {
        this.documentListService.reload();
      }
    });
  }

  private undoDeleteNode(item: DeletedNodeInfo): Observable<DeletedNodeInfo> {
    const { id, name } = item;

    return this.contentApi.restoreNode(id).pipe(
      map(() => ({
        id,
        name,
        status: 1
      })),
      catchError(() =>
        of({
          id,
          name,
          status: 0
        })
      )
    );
  }

  private getUndoDeleteMessage(status: DeleteStatus): SnackbarAction {
    if (status.someFailed && !status.oneFailed) {
      return new SnackbarErrorAction('APP.MESSAGES.ERRORS.NODE_RESTORE_PLURAL', { number: status.fail.length });
    }

    if (status.oneFailed) {
      return new SnackbarErrorAction('APP.MESSAGES.ERRORS.NODE_RESTORE', {
        name: status.fail[0].name
      });
    }

    return null;
  }

  private restoreNode(node: NodeEntry): Observable<RestoredNode> {
    const { entry } = node;

    return this.contentApi.restoreNode(entry.id).pipe(
      map(() => ({
        status: 1,
        entry
      })),
      catchError((error) => {
        const { statusCode } = JSON.parse(error.message).error;

        return of({
          status: 0,
          statusCode,
          entry
        });
      })
    );
  }

  private purgeNodes(selection: NodeInfo[] = []) {
    if (!selection.length) {
      return;
    }

    const batch = selection.map((node) => this.purgeDeletedNode(node));

    forkJoin(batch).subscribe((purgedNodes) => {
      const status = this.processStatus(purgedNodes);

      if (status.success.length) {
        this.documentListService.reload();
      }

      this.sendPurgeMessage(status);
    });
  }

  private purgeDeletedNode(node: NodeInfo): Observable<DeletedNodeInfo> {
    const { id, name } = node;

    return this.contentApi.purgeDeletedNode(id).pipe(
      map(() => ({
        status: 1,
        id,
        name
      })),
      catchError(() =>
        of({
          status: 0,
          id,
          name
        })
      )
    );
  }

  private processStatus(data: Array<{ status: number }> = []): DeleteStatus {
    const status = {
      fail: [],
      success: [],
      get someFailed() {
        return !!this.fail.length;
      },
      get someSucceeded() {
        return !!this.success.length;
      },
      get oneFailed() {
        return this.fail.length === 1;
      },
      get oneSucceeded() {
        return this.success.length === 1;
      },
      get allSucceeded() {
        return this.someSucceeded && !this.someFailed;
      },
      get allFailed() {
        return this.someFailed && !this.someSucceeded;
      },
      reset() {
        this.fail = [];
        this.success = [];
      }
    };

    return data.reduce((acc, node) => {
      if (node.status) {
        acc.success.push(node);
      } else {
        acc.fail.push(node);
      }

      return acc;
    }, status);
  }

  private sendPurgeMessage(status: DeleteStatus): void {
    if (status.oneSucceeded && status.someFailed && !status.oneFailed) {
      this.notificationService.showWarning('APP.MESSAGES.INFO.TRASH.NODES_PURGE.PARTIAL_SINGULAR', null, {
        name: status.success[0].name,
        failed: status.fail.length
      });
      return;
    }

    if (status.someSucceeded && !status.oneSucceeded && status.someFailed) {
      this.notificationService.showWarning('APP.MESSAGES.INFO.TRASH.NODES_PURGE.PARTIAL_PLURAL', null, {
        number: status.success.length,
        failed: status.fail.length
      });
      return;
    }

    if (status.oneSucceeded) {
      this.notificationService.showInfo('APP.MESSAGES.INFO.TRASH.NODES_PURGE.SINGULAR', null, { name: status.success[0].name });
      return;
    }

    if (status.oneFailed) {
      this.notificationService.showError('APP.MESSAGES.ERRORS.TRASH.NODES_PURGE.SINGULAR', null, { name: status.fail[0].name });
      return;
    }

    if (status.allSucceeded) {
      this.notificationService.showInfo('APP.MESSAGES.INFO.TRASH.NODES_PURGE.PLURAL', null, { number: status.success.length });
      return;
    }

    if (status.allFailed) {
      this.notificationService.showError('APP.MESSAGES.ERRORS.TRASH.NODES_PURGE.PLURAL', null, { number: status.fail.length });
      return;
    }
  }

  private showRestoreNotification(status: DeleteStatus): void {
    const message = this.getRestoreMessage(status);

    if (message) {
      if (status.oneSucceeded && !status.someFailed) {
        const isSite = this.isSite(status.success[0].entry);
        const path: PathInfo = status.success[0].entry.path;
        const parent = path.elements[path.elements.length - 1];
        const route = isSite ? ['/libraries', parent.id] : ['/personal-files', parent.id];

        let navigate;

        if (this.isLibraryContent(path)) {
          navigate = new NavigateToParentFolder(status.success[0]);
        } else {
          navigate = new NavigateRouteAction(route);
        }

        message.userAction = new SnackbarUserAction('APP.ACTIONS.VIEW', navigate);
      }

      this.store.dispatch(message);
    }
  }

  private isSite(entry: Node): boolean {
    return entry.nodeType === 'st:site';
  }

  private isLibraryContent(path: PathInfo): boolean {
    return path && path.elements.length >= 2 && path.elements[1].name === 'Sites';
  }

  private getRestoreMessage(status: DeleteStatus): SnackbarAction {
    if (status.someFailed && !status.oneFailed) {
      return new SnackbarErrorAction('APP.MESSAGES.ERRORS.TRASH.NODES_RESTORE.PARTIAL_PLURAL', {
        number: status.fail.length
      });
    }

    if (status.oneFailed && status.fail[0].statusCode) {
      if (status.fail[0].statusCode === 409) {
        return new SnackbarErrorAction('APP.MESSAGES.ERRORS.TRASH.NODES_RESTORE.NODE_EXISTS', {
          name: status.fail[0].entry.name
        });
      } else {
        return new SnackbarErrorAction('APP.MESSAGES.ERRORS.TRASH.NODES_RESTORE.GENERIC', {
          name: status.fail[0].entry.name
        });
      }
    }

    if (status.oneFailed && !status.fail[0].statusCode) {
      return new SnackbarErrorAction('APP.MESSAGES.ERRORS.TRASH.NODES_RESTORE.LOCATION_MISSING', {
        name: status.fail[0].entry.name
      });
    }

    if (status.allSucceeded && !status.oneSucceeded) {
      return new SnackbarInfoAction('APP.MESSAGES.INFO.TRASH.NODES_RESTORE.PLURAL');
    }

    if (status.allSucceeded && status.oneSucceeded) {
      return new SnackbarInfoAction('APP.MESSAGES.INFO.TRASH.NODES_RESTORE.SINGULAR', {
        name: status.success[0].entry.name
      });
    }

    return null;
  }

  private diff(selection: any[], list: any[], fromList = true): any {
    const ids = selection.map((item) => item.entry.id);

    return list.filter((item) => {
      if (fromList) {
        return ids.includes(item.entry.id) ? item : null;
      } else {
        return !ids.includes(item.entry.id) ? item : null;
      }
    });
  }

  private deleteNode(node: any): Observable<DeletedNodeInfo> {
    const { name } = node.entry;
    const id = node.entry.nodeId || node.entry.id;

    return this.contentApi.deleteNode(id).pipe(
      map(() => ({
        id,
        name,
        status: 1
      })),
      catchError(() =>
        of({
          id,
          name,
          status: 0
        })
      )
    );
  }

  private getDeleteMessage(status: DeleteStatus): SnackbarAction {
    if (status.allFailed && !status.oneFailed) {
      return new SnackbarErrorAction('APP.MESSAGES.ERRORS.NODE_DELETION_PLURAL', { number: status.fail.length });
    }

    if (status.allSucceeded && !status.oneSucceeded) {
      return new SnackbarInfoAction('APP.MESSAGES.INFO.NODE_DELETION.PLURAL', {
        number: status.success.length
      });
    }

    if (status.someFailed && status.someSucceeded && !status.oneSucceeded) {
      return new SnackbarWarningAction('APP.MESSAGES.INFO.NODE_DELETION.PARTIAL_PLURAL', {
        success: status.success.length,
        failed: status.fail.length
      });
    }

    if (status.someFailed && status.oneSucceeded) {
      return new SnackbarWarningAction('APP.MESSAGES.INFO.NODE_DELETION.PARTIAL_SINGULAR', {
        success: status.success.length,
        failed: status.fail.length
      });
    }

    if (status.oneFailed && !status.someSucceeded) {
      return new SnackbarErrorAction('APP.MESSAGES.ERRORS.NODE_DELETION', {
        name: status.fail[0].name
      });
    }

    if (status.oneSucceeded && !status.someFailed) {
      return new SnackbarInfoAction('APP.MESSAGES.INFO.NODE_DELETION.SINGULAR', { name: status.success[0].name });
    }

    return null;
  }

  private showMoveMessage(nodes: Array<NodeEntry>, info: any, moveResponse?: any) {
    const succeeded = moveResponse?.['succeeded'].length ?? 0;
    const partiallySucceeded = moveResponse?.['partiallySucceeded'].length ?? 0;
    const failures = moveResponse?.['failed'].length ?? 0;

    let successMessage = '';
    let partialSuccessMessage = '';
    let failedMessage = '';
    let errorMessage = '';

    if (typeof info === 'string') {
      // in case of success
      if (info.toLowerCase().indexOf('succes') !== -1) {
        const i18nMessageString = 'APP.MESSAGES.INFO.NODE_MOVE.';
        let i18MessageSuffix = '';

        if (succeeded) {
          i18MessageSuffix = succeeded === 1 ? 'SINGULAR' : 'PLURAL';
          successMessage = `${i18nMessageString}${i18MessageSuffix}`;
        }

        if (partiallySucceeded) {
          i18MessageSuffix = partiallySucceeded === 1 ? 'PARTIAL.SINGULAR' : 'PARTIAL.PLURAL';
          partialSuccessMessage = `${i18nMessageString}${i18MessageSuffix}`;
        }

        if (failures) {
          // if moving failed for ALL nodes, emit error
          if (failures === nodes.length) {
            const errors = this.nodeActionsService.flatten(moveResponse['failed']);
            errorMessage = this.getErrorMessage(errors[0]);
          } else {
            i18MessageSuffix = 'PARTIAL.FAIL';
            failedMessage = `${i18nMessageString}${i18MessageSuffix}`;
          }
        }
      } else {
        errorMessage = 'APP.MESSAGES.ERRORS.GENERIC';
      }
    } else {
      errorMessage = this.getErrorMessage(info);
    }

    const undo = succeeded + partiallySucceeded > 0 ? this.translation.instant('APP.ACTIONS.UNDO') : '';
    failedMessage = errorMessage ? errorMessage : failedMessage;

    const beforePartialSuccessMessage = successMessage && partialSuccessMessage ? ' ' : '';
    const beforeFailedMessage = (successMessage || partialSuccessMessage) && failedMessage ? ' ' : '';

    const initialParentId = this.nodeActionsService.getEntryParentId(nodes[0].entry);

    const messages = this.translation.instant([successMessage, partialSuccessMessage, failedMessage], {
      success: succeeded,
      failed: failures,
      partially: partiallySucceeded
    });

    // TODO: review in terms of i18n
    this.notificationService
      .openSnackMessageAction(
        messages[successMessage] + beforePartialSuccessMessage + messages[partialSuccessMessage] + beforeFailedMessage + messages[failedMessage],
        undo,
        {
          panelClass: 'info-snackbar'
        }
      )
      .onAction()
      .subscribe(() => this.undoMoveNodes(moveResponse, initialParentId));
  }

  private focusAfterClose(focusedElementSelector: string): void {
    if (focusedElementSelector) {
      document.querySelector<HTMLElement>(focusedElementSelector)?.focus();
    }
  }

  showFolderInformation(node: NodeEntry) {
    this.dialogRef.open(DialogComponent, {
      data: {
        title: 'APP.FOLDER_INFO.TITLE',
        confirmButtonTitle: 'APP.FOLDER_INFO.DONE',
        isCancelButtonHidden: true,
        isCloseButtonHidden: false,
        dialogSize: DialogSize.Large,
        contentComponent: FolderInformationComponent,
        componentData: node.entry
      },
      width: '700px'
    });
  }
}
