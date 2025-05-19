import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './material.module';

import { TranslateModule } from '@ngx-translate/core';
import { EffectsModule } from '@ngrx/effects';

import { TranslationService } from '@alfresco/adf-core';
import { provideExtensionConfig } from '@alfresco/adf-extensions';
import { ExtensionsModule, ExtensionService } from '@alfresco/adf-extensions';

// Custom Ek Project components
import { TakeOwnershipEffects } from './effects/take-ownership.effects';
import { canTakeOwnership } from './evaluators/take-ownership.evaluator';
import { RegulatoryFrameworksComponent } from './components/regulatory-frameworks.component';
import { SetTitleDescriptionDialogComponent } from './components/set-title-description-dialog.component';
import { SetTitleDescriptionEffects } from './effects/set-title-description.effects';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,                // For template-driven forms
    ReactiveFormsModule,        // For reactive forms
    MaterialModule,             // For use in templates, UI component library for Angular applications that implements Google's Material Design principles
    ExtensionsModule,           // Used to register alfresco content app extensions
    TranslateModule.forChild(), // For translate pipe

    // Register ngRx effects
    EffectsModule.forFeature([TakeOwnershipEffects, SetTitleDescriptionEffects])
  ],
  // Register components belonging to this module, template compilation
  declarations: [
    SetTitleDescriptionDialogComponent
  ],
  providers: [
          provideExtensionConfig(['ek-project.json'])
        ]
})
export class EkProjectModule {
   constructor(extensions: ExtensionService, translation: TranslationService) {
        translation.addTranslationFolder('ek-project', 'assets/ek-project');

        // Register new components to be used in extension JSON (i.e. ek-project.json)
        // Need to be imported above
        // For example:
        extensions.setComponents({
          'regulatory-frameworks-component': RegulatoryFrameworksComponent
        });

      // Register evaluators to be used in extension JSON (i.e. ek-project.json)
      extensions.setEvaluators({
          'ekproject.evaluator.canTakeOwnerShip': canTakeOwnership
      });

      }
    }
