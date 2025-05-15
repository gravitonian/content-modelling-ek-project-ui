import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '@alfresco/adf-core';
import { provideExtensionConfig } from '@alfresco/adf-extensions';

import { ExtensionsModule, ExtensionService } from '@alfresco/adf-extensions';

import { RegulatoryFrameworksComponent } from './components/regulatory-frameworks.component';


@NgModule({
  imports: [
    CommonModule,
    ExtensionsModule,           // Used to register alfresco content app extensions
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

      }
    }
