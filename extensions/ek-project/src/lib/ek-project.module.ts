import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '@alfresco/adf-core';
import { provideExtensionConfig } from '@alfresco/adf-extensions';

@NgModule({
  imports: [CommonModule],
  providers: [
          provideExtensionConfig(['ek-project.json'])
        ]
})
export class EkProjectModule {
   constructor(translation: TranslationService) {
        translation.addTranslationFolder('ek-project', 'assets/ek-project');

      }
    }
