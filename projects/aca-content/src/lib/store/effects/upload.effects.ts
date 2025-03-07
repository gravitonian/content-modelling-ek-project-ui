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

import {
  AppStore,
  getCurrentFolder,
  UnlockWriteAction,
  UploadActionTypes,
  UploadFilesAction,
  UploadFileVersionAction,
  UploadFolderAction
} from '@alfresco/aca-shared/store';
import { FileUtils, NotificationService } from '@alfresco/adf-core';
import { inject, Injectable, NgZone, RendererFactory2 } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';
import { ContentManagementService } from '../../services/content-management.service';
import { Node } from '@alfresco/js-api';
import { FileModel, UploadService } from '@alfresco/adf-content-services';

@Injectable()
export class UploadEffects {
  private notificationService = inject(NotificationService);

  private readonly fileInput: HTMLInputElement;
  private readonly folderInput: HTMLInputElement;
  private readonly fileVersionInput: HTMLInputElement;
  private readonly uploadMenuButtonSelector = 'app-toolbar-menu button[id="app.toolbar.upload"]';

  store = inject(Store<AppStore>);
  actions$ = inject(Actions);
  ngZone = inject(NgZone);
  uploadService = inject(UploadService);
  contentService = inject(ContentManagementService);

  constructor() {
    const renderer = inject(RendererFactory2).createRenderer(null, null);

    this.fileInput = renderer.createElement('input') as HTMLInputElement;
    this.fileInput.id = 'app-upload-files';
    this.fileInput.type = 'file';
    this.fileInput.style.display = 'none';
    this.fileInput.setAttribute('multiple', '');
    this.fileInput.addEventListener('change', (event) => this.upload(event));
    renderer.appendChild(document.body, this.fileInput);

    this.fileVersionInput = renderer.createElement('input') as HTMLInputElement;
    this.fileVersionInput.id = 'app-upload-file-version';
    this.fileVersionInput.type = 'file';
    this.fileVersionInput.style.display = 'none';
    this.fileVersionInput.addEventListener('change', () => {
      this.uploadVersion();
    });
    renderer.appendChild(document.body, this.fileVersionInput);

    this.folderInput = renderer.createElement('input') as HTMLInputElement;
    this.folderInput.id = 'app-upload-folder';
    this.folderInput.type = 'file';
    this.folderInput.style.display = 'none';
    this.folderInput.setAttribute('directory', '');
    this.folderInput.setAttribute('webkitdirectory', '');
    this.folderInput.addEventListener('change', (event) => this.upload(event));
    renderer.appendChild(document.body, this.folderInput);
  }

  uploadFiles$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<UploadFilesAction>(UploadActionTypes.UploadFiles),
        map(() => {
          this.registerFocusingElementAfterModalClose(this.fileInput, this.uploadMenuButtonSelector);
          this.fileInput.click();
        })
      ),
    { dispatch: false }
  );

  uploadFolder$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<UploadFolderAction>(UploadActionTypes.UploadFolder),
        map(() => {
          this.registerFocusingElementAfterModalClose(this.folderInput, this.uploadMenuButtonSelector);
          this.folderInput.click();
        })
      ),
    { dispatch: false }
  );

  uploadVersion$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<UploadFileVersionAction>(UploadActionTypes.UploadFileVersion),
        map((action) => {
          if (action?.payload) {
            const node = action?.payload?.detail?.data?.node?.entry;
            const file: any = action?.payload?.detail?.files[0]?.file;
            this.contentService.versionUpdateDialog(node, file);
          } else if (!action?.payload) {
            this.registerFocusingElementAfterModalClose(this.fileVersionInput, action.configuration?.focusedElementOnCloseSelector);
            this.fileVersionInput.click();
          }
        })
      ),
    { dispatch: false }
  );

  uploadVersion() {
    this.contentService
      .getNodeInfo()
      .pipe(
        catchError(() => {
          this.notificationService.showError('VERSION.ERROR.GENERIC');
          return of(null);
        })
      )
      .subscribe((node: Node) => {
        if (node) {
          this.contentService.versionUpdateDialog(node, this.fileVersionInput.files[0]);
          this.fileVersionInput.value = '';
        }
      });
  }

  private upload(event: any): void {
    this.store
      .select(getCurrentFolder)
      .pipe(take(1))
      .subscribe((node) => {
        if (node?.id) {
          const input = event.currentTarget as HTMLInputElement;
          const files = FileUtils.toFileArray(input.files).map(
            (file: any) =>
              new FileModel(file, {
                parentId: node.id,
                path: (file.webkitRelativePath || '').replace(/\/[^\/]*$/, ''),
                nodeType: 'cm:content'
              })
          );

          this.uploadQueue(files);
          event.target.value = '';
        }
      });
  }

  private uploadQueue(files: FileModel[]) {
    if (files.length > 0) {
      this.ngZone.run(() => {
        this.uploadService.addToQueue(...files);
        this.uploadService.uploadFilesInTheQueue();
      });
    }
  }

  uploadAndUnlock(file: FileModel | null) {
    if (!file) {
      return;
    }

    this.ngZone.run(() => {
      this.uploadService.addToQueue(file);
      this.uploadService.uploadFilesInTheQueue();

      const subscription = this.uploadService.fileUploadComplete.subscribe((completed) => {
        if (file.data?.entry?.properties?.['cm:lockType'] === 'WRITE_LOCK' && file.data?.entry?.id === completed.data.entry.id) {
          this.store.dispatch(new UnlockWriteAction(completed.data));
        }

        subscription.unsubscribe();
      });
    });
  }

  private registerFocusingElementAfterModalClose(input: HTMLInputElement, focusedElementSelector: string): void {
    input.addEventListener(
      'click',
      () => {
        window.addEventListener(
          'focus',
          () => {
            const elementToFocus = document.querySelector<HTMLElement>(focusedElementSelector);
            elementToFocus.addEventListener('focus', () => elementToFocus.classList.add('cdk-program-focused'), {
              once: true
            });
            elementToFocus.focus();
          },
          {
            once: true
          }
        );
      },
      {
        once: true
      }
    );
  }
}
