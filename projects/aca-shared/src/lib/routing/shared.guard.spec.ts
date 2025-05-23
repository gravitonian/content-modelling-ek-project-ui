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

import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { isQuickShareEnabled } from '@alfresco/aca-shared/store';
import { AppSharedRuleGuard } from './shared.guard';

describe('AppSharedRuleGuard', () => {
  let state: RouterStateSnapshot;
  const route: ActivatedRouteSnapshot = new ActivatedRouteSnapshot();
  const storeSpy = jasmine.createSpyObj('Store', ['select']);
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: Store, useValue: storeSpy }]
    });

    state = { url: 'some-url' } as RouterStateSnapshot;
  });

  it('should allow activation if quick share is enabled', (done) => {
    storeSpy.select.and.returnValue(of(true));
    const guard = TestBed.runInInjectionContext(() => AppSharedRuleGuard(route, state)) as Observable<boolean>;

    guard.subscribe((response) => {
      expect(storeSpy.select).toHaveBeenCalledWith(isQuickShareEnabled);
      expect(response).toBeTrue();
      done();
    });
  });

  it('should not allow activation if quick share is disabled', (done) => {
    storeSpy.select.and.returnValue(of(false));
    const guard = TestBed.runInInjectionContext(() => AppSharedRuleGuard(route, state)) as Observable<boolean>;

    guard.subscribe((response) => {
      expect(storeSpy.select).toHaveBeenCalledWith(isQuickShareEnabled);
      expect(response).toBeFalse();
      done();
    });
  });
});
