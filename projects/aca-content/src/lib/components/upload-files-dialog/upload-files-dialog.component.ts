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

import { Component, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { AppStore, getFileUploadingDialog } from '@alfresco/aca-shared/store';
import { CommonModule } from '@angular/common';
import { UploadModule } from '@alfresco/adf-content-services';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  standalone: true,
  imports: [CommonModule, UploadModule],
  selector: 'aca-upload-files-dialog',
  templateUrl: './upload-files-dialog.component.html',
  encapsulation: ViewEncapsulation.None
})
export class UploadFilesDialogComponent {
  showFileUploadingDialog$: Observable<boolean>;

  constructor(private store: Store<AppStore>) {
    this.showFileUploadingDialog$ = this.store.select(getFileUploadingDialog).pipe(delay(0), takeUntilDestroyed());
  }
}
