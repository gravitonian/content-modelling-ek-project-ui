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

import { DestroyRef, Directive, HostListener, inject, Input, OnInit } from '@angular/core';
import { debounceTime } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppStore, ContextMenu, CustomContextMenu } from '@alfresco/aca-shared/store';
import { ContentActionRef } from '@alfresco/adf-extensions';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive({
  standalone: true,
  selector: '[acaContextActions]',
  exportAs: 'acaContextActions'
})
export class ContextActionsDirective implements OnInit {
  // eslint-disable-next-line
  @Input('acaContextEnable')
  enabled = true;

  @Input()
  customActions: ContentActionRef[] = [];

  @HostListener('contextmenu', ['$event'])
  onContextMenuEvent(event: MouseEvent) {
    if (event) {
      event.preventDefault();

      if (this.enabled) {
        const target = this.getTarget(event);
        if (target) {
          this.execute(event, target);
        }
      }
    }
  }

  private execute$: Subject<any> = new Subject();

  private readonly destroyRef = inject(DestroyRef);

  constructor(private store: Store<AppStore>) {}

  ngOnInit() {
    this.execute$.pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef)).subscribe((event: MouseEvent) => {
      if (this.customActions?.length) {
        this.store.dispatch(new CustomContextMenu(event, this.customActions));
      } else {
        this.store.dispatch(new ContextMenu(event));
      }
    });
  }
  execute(event: MouseEvent, target: Element) {
    if (!this.isSelected(target)) {
      target.dispatchEvent(new MouseEvent('click'));
    }

    if (this.isEmptyTable(target)) {
      return null;
    }

    this.execute$.next(event);
  }

  private getTarget(event: MouseEvent): Element {
    const target = event.target as Element;
    return this.findAncestor(target, 'adf-datatable-cell');
  }

  private isSelected(target: Element): boolean {
    if (!target) {
      return false;
    }

    return this.findAncestor(target, 'adf-datatable-row').classList.contains('adf-is-selected');
  }

  private isEmptyTable(target: Element): boolean {
    return this.findAncestor(target, 'adf-datatable-cell').classList.contains('adf-no-content-container');
  }

  private findAncestor(el: Element, className: string): Element {
    while (el && !el.classList.contains(className)) {
      el = el.parentElement;
    }
    return el;
  }
}
