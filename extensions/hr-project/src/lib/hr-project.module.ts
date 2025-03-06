import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '@alfresco/adf-core';
import { provideExtensionConfig } from '@alfresco/adf-extensions';

@NgModule({
  imports: [CommonModule],
  providers: [
          provideExtensionConfig(['hr-project.json'])
        ]
})
export class HrProjectModule {
   constructor(translation: TranslationService) {
        translation.addTranslationFolder('hr-project', 'assets/hr-project');

      }
    }
