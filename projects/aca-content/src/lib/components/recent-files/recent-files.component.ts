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

import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NodeEntry } from '@alfresco/js-api';
import { debounceTime } from 'rxjs/operators';
import {
  ContextActionsDirective,
  InfoDrawerComponent,
  PageComponent,
  PageLayoutComponent,
  PaginationDirective,
  ToolbarComponent
} from '@alfresco/aca-shared';
import { DocumentListPresetRef, DynamicColumnComponent } from '@alfresco/adf-extensions';
import { CommonModule } from '@angular/common';
import { DocumentListModule } from '@alfresco/adf-content-services';
import { DataTableModule, EmptyContentComponent, PaginationComponent } from '@alfresco/adf-core';
import { DocumentListDirective } from '../../directives/document-list.directive';
import { TranslateModule } from '@ngx-translate/core';
import { SearchAiInputContainerComponent } from '../knowledge-retrieval/search-ai/search-ai-input-container/search-ai-input-container.component';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    DocumentListModule,
    DocumentListDirective,
    ContextActionsDirective,
    DataTableModule,
    PaginationComponent,
    PaginationDirective,
    InfoDrawerComponent,
    PageLayoutComponent,
    TranslateModule,
    ToolbarComponent,
    SearchAiInputContainerComponent,
    EmptyContentComponent,
    DynamicColumnComponent
  ],
  templateUrl: './recent-files.component.html',
  encapsulation: ViewEncapsulation.None,
  selector: 'aca-recent-files'
})
export class RecentFilesComponent extends PageComponent implements OnInit {
  columns: DocumentListPresetRef[] = [];

  ngOnInit() {
    super.ngOnInit();

    this.subscriptions = this.subscriptions.concat([
      this.uploadService.fileUploadComplete.pipe(debounceTime(300)).subscribe(() => this.reload()),
      this.uploadService.fileUploadDeleted.pipe(debounceTime(300)).subscribe(() => this.reload())
    ]);

    this.columns = this.extensions.documentListPresets.recent || [];
  }

  onNodeDoubleClick(node: NodeEntry) {
    if (node?.entry) {
      this.showPreview(node, { location: this.router.url });
    }
  }

  handleNodeClick(event: Event) {
    this.onNodeDoubleClick((event as CustomEvent).detail?.node);
  }
}
