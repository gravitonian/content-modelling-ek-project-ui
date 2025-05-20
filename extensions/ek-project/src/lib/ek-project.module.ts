import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './material.module';

import { TranslateModule } from '@ngx-translate/core';
import { EffectsModule } from '@ngrx/effects';

import { ExtensionsModule, ExtensionService } from '@alfresco/adf-extensions';
import { TranslationService } from '@alfresco/adf-core';
import { provideExtensionConfig } from '@alfresco/adf-extensions';

// Custom Ek Project components
import { CreateClientSupplierDialogComponent } from './components/create-client-supplier-dialog.component';
import { ContractPickerComponent } from './components/contract-picker.component';
import { ClientSupplierEffects } from './effects/client-supplier.effects';
import { SetTitleDescriptionDialogComponent } from './components/set-title-description-dialog.component';
import { SetTitleDescriptionEffects } from './effects/set-title-description.effects';
import { TakeOwnershipEffects } from './effects/take-ownership.effects';
import { canTakeOwnership } from './evaluators/take-ownership.evaluator';
import { isClientSupplierProfileFolder } from './evaluators/is-client-supplier-profile-folder.evaluator';
import { RegulatoryFrameworksComponent } from './components/regulatory-frameworks.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,                // For template-driven forms
    ReactiveFormsModule,        // For reactive forms
    MaterialModule,             // For use in templates, UI component library for Angular applications that implements Google's Material Design principles
    TranslateModule.forChild(), // For translate pipe
    ExtensionsModule,           // Used to register alfresco content app extensions
    // Register ngRx effects
    EffectsModule.forFeature([ClientSupplierEffects, SetTitleDescriptionEffects, TakeOwnershipEffects])
  ],
  // Register components belonging to this module, template compilation
  declarations: [
    SetTitleDescriptionDialogComponent,
    CreateClientSupplierDialogComponent,
    ContractPickerComponent
  ],
  // Export only if used by other modules
  //exports: [
  //],
  providers: [
      // Provide EK Project extension configuration
      provideExtensionConfig(['ek-project.json'])
    ]
})
export class EkProjectModule {
   constructor(extensions: ExtensionService,
     translation: TranslationService) {
        // Register new components to be used in extension JSON (i.e. ek-project.json)
        // Need to be imported above
        // For example:
        extensions.setComponents({
          'regulatory-frameworks-component': RegulatoryFrameworksComponent
        //  'set-title-description.dialog': SetTitleDescriptionDialogComponent
        });

        // Register evaluators to be used in extension JSON (i.e. ek-project.json)
        extensions.setEvaluators({
            'ekproject.evaluator.canTakeOwnerShip': canTakeOwnership,
            'ekproject.evaluator.isClientSupplierProfileFolder': isClientSupplierProfileFolder
        });

        // Add the translation labels (e.g. en.json) for this module
        translation.addTranslationFolder('ek-project', 'assets/ek-project');
   }
}
