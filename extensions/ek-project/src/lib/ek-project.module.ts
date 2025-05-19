import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';
import { EffectsModule } from '@ngrx/effects';

import { TranslationService } from '@alfresco/adf-core';
import { provideExtensionConfig } from '@alfresco/adf-extensions';
import { ExtensionsModule, ExtensionService } from '@alfresco/adf-extensions';

// Custom Ek Project components
import { TakeOwnershipEffects } from './effects/take-ownership.effects';
import { canTakeOwnership } from './evaluators/take-ownership.evaluator';
import { RegulatoryFrameworksComponent } from './components/regulatory-frameworks.component';


@NgModule({
  imports: [
    CommonModule,
    ExtensionsModule,           // Used to register alfresco content app extensions

    TranslateModule.forChild(), // For translate pipe

    // Register ngRx effects
    EffectsModule.forFeature([TakeOwnershipEffects])
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
