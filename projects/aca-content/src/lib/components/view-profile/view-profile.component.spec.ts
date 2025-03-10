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

import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ViewProfileComponent } from './view-profile.component';
import { AppTestingModule } from '../../testing/app-testing.module';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { AppService } from '@alfresco/aca-shared';

describe('ViewProfileComponent', () => {
  let fixture: ComponentFixture<ViewProfileComponent>;
  let component: ViewProfileComponent;
  let router: Router;
  const appServiceMock = {
    toggleAppNavBar$: new Subject(),
    appNavNarMode$: new BehaviorSubject<'collapsed' | 'expanded'>('expanded')
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppTestingModule, ViewProfileComponent],
      providers: [
        {
          provide: AppService,
          useValue: appServiceMock
        }
      ]
    });

    fixture = TestBed.createComponent(ViewProfileComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    router.initialNavigation();
  });

  it('should company dropdown remains close', async () => {
    expect(component.loginSectionDropdown).toBe(false);
    expect(component.contactSectionDropdown).toBe(false);
  });

  it('should toggle the appService toggleAppNavBar$ Subject', () => {
    spyOn(appServiceMock.toggleAppNavBar$, 'next');
    component.toggleClick();
    expect(appServiceMock.toggleAppNavBar$.next).toHaveBeenCalled();
  });

  it('should save button is disabled if form has invalid mobile number', () => {
    component.ngOnInit();
    const profileFormGroup = component.profileForm;

    profileFormGroup.setValue({
      jobTitle: 'Developer',
      location: 'US',
      telephone: '2744245',
      mobile: 'AB8866322112',
      oldPassword: 'admin@123',
      newPassword: 'admin@1234',
      verifyPassword: 'admin@1234',
      companyName: 'test Name',
      companyPostCode: '12345',
      companyAddress: 'test address',
      companyTelephone: '27442266',
      companyEmail: 'email@test.com'
    });

    expect(profileFormGroup.valid).toEqual(false);
    expect(component.isSaveButtonDisabled()).toBeTruthy();
  });

  it('should save button is disabled if form has invalid email', () => {
    component.ngOnInit();
    const profileFormGroup = component.profileForm;

    profileFormGroup.setValue({
      jobTitle: 'Developer',
      location: 'US',
      telephone: '27442445',
      mobile: '457554',
      oldPassword: 'admin@123',
      newPassword: 'admin@1234',
      verifyPassword: 'admin@1234',
      companyName: 'test Name',
      companyPostCode: '12345',
      companyAddress: 'test address',
      companyTelephone: '27442266',
      companyEmail: 'email'
    });

    expect(profileFormGroup.valid).toEqual(false);
    expect(component.isSaveButtonDisabled()).toBeTruthy();
  });

  it('should save button is enabled if form has valid inputs', () => {
    component.ngOnInit();
    const profileFormGroup = component.profileForm;

    profileFormGroup.setValue({
      jobTitle: 'Developer',
      location: 'US',
      telephone: '274-422-55',
      mobile: '886-632-2112',
      oldPassword: 'test@123',
      newPassword: 'test@1234',
      verifyPassword: 'test@1234',
      companyName: 'testCompany',
      companyPostCode: '12345',
      companyAddress: 'test address',
      companyTelephone: '274-22-66',
      companyEmail: 'testEmail@test.com'
    });

    expect(profileFormGroup.valid).toEqual(true);
    expect(component.isSaveButtonDisabled()).toBeFalsy();
  });

  it('should navigate to personal files when back button is clicked', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.navigateToPersonalFiles();

    expect(navigateSpy).toHaveBeenCalledWith(['/personal-files'], { replaceUrl: true });
  });

  it('should expand or compress general dropdown when arrow button is clicked', () => {
    spyOn(component, 'toggleGeneralDropdown').and.callThrough();
    component.generalSectionDropdown = false;
    fixture.detectChanges();

    const generalToggleIcon = fixture.debugElement.query(By.css('#toggle-general-dropdown'));
    generalToggleIcon.triggerEventHandler('click', null);

    expect(component.toggleGeneralDropdown).toHaveBeenCalled();
    expect(component.generalSectionButtonsToggle).toBe(true);
  });

  it('should expand or compress contact dropdown when arrow button is clicked', () => {
    spyOn(component, 'toggleContactDropdown').and.callThrough();
    component.contactSectionDropdown = false;
    fixture.detectChanges();

    const contactToggleIcon = fixture.debugElement.query(By.css('#toggle-contact-dropdown'));
    contactToggleIcon.triggerEventHandler('click', null);

    expect(component.toggleContactDropdown).toHaveBeenCalled();
    expect(component.contactSectionButtonsToggle).toBe(true);
  });

  it('should toggle form view when edit or cancel buttons is clicked for general form', () => {
    spyOn(component, 'toggleGeneralButtons').and.callThrough();
    fixture.detectChanges();

    const generalEditButton = fixture.debugElement.query(By.css('#general-edit-button'));
    generalEditButton.triggerEventHandler('click', null);
    fixture.detectChanges();

    const generalCancelButton = fixture.debugElement.query(By.css('#general-cancel-button'));
    generalCancelButton.triggerEventHandler('click', null);

    expect(component.toggleGeneralButtons).toHaveBeenCalledTimes(2);
  });

  it('should toggle form view when edit or cancel buttons is clicked for contact form', () => {
    spyOn(component, 'toggleContactButtons').and.callThrough();
    fixture.detectChanges();

    const contactEditButton = fixture.debugElement.query(By.css('#contact-edit-button'));
    contactEditButton.triggerEventHandler('click', null);
    fixture.detectChanges();

    const contactCancelButton = fixture.debugElement.query(By.css('#contact-cancel-button'));
    contactCancelButton.triggerEventHandler('click', null);

    expect(component.toggleContactButtons).toHaveBeenCalledTimes(2);
  });
});
