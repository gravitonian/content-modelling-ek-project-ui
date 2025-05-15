import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { FormsModule } from '@angular/forms';

import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { Node, Category, CategoryLinkBody } from '@alfresco/js-api';
import { CategoryService } from '@alfresco/adf-content-services';
import { CategorySelectorDialogComponent, CategorySelectorDialogOptions } from '@alfresco/adf-content-services';

import { EK_REGULATORY_FRAMEWORK_ASPECT_NAME } from '../models/ek-project.model';

@Component({
  selector: 'ek-project-regulatory-frameworks',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    MatChipsModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <div class="regulatory-frameworks-panel">
      <!-- Edit controls -->
      <div class="frameworks-header">
        <button
          *ngIf="supportsFrameworks && canEdit"
          mat-icon-button
          color="primary"
          (click)="openCategoryPicker()"
          [matTooltip]="'EK_PROJECT.DIALOGS.REGULATORY_FRAMEWORKS.MESSAGES.ADD_FRAMEWORK' | translate">
          <mat-icon>add</mat-icon>
        </button>
      </div>

      <!-- No frameworks message -->
      <div *ngIf="!hasFrameworks" class="no-frameworks">
        {{ 'EK_PROJECT.DIALOGS.REGULATORY_FRAMEWORKS.MESSAGES.NO_FRAMEWORKS' | translate }}
      </div>

      <!-- Frameworks list with remove option -->
      <mat-chip-set *ngIf="hasFrameworks">
        <mat-chip
          *ngFor="let framework of frameworks"
          [matTooltip]="framework.description || framework.name"
          [removable]="canEdit"
          (removed)="removeFramework(framework)">
          {{ framework.name }}
          <mat-icon *ngIf="canEdit" matChipRemove>cancel</mat-icon>
        </mat-chip>
      </mat-chip-set>
    </div>
  `,
  styles: [`
    .regulatory-frameworks-panel {
      padding: 16px;
    }

    .frameworks-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .frameworks-header h3 {
      margin: 0;
    }

    .no-frameworks {
      color: rgba(0, 0, 0, 0.54);
      font-style: italic;
      margin: 8px 0;
    }

    mat-chip-set {
      margin-top: 8px;
    }
  `],
  encapsulation: ViewEncapsulation.None
})
export class RegulatoryFrameworksComponent implements OnInit {
  @Input() data: { node: Node };

  frameworks: any[] = [];
  hasFrameworks = false;
  supportsFrameworks = false;
  canEdit = false;
  private node: Node;

  constructor(
    private categoryService: CategoryService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    // Extract the node from the data object
    this.node = this.data?.node;

    // Check if user can edit
    this.canEdit = this.hasWritePermission(this.node);

    // Load existing regulatory framework categories for this node
    this.loadFrameworks();
  }

  /**
   * Check if user has write permission
   */
  private hasWritePermission(node: Node): boolean {
    if (!node || !node.allowableOperations) {
      return false;
    }

    return node.allowableOperations.includes('update');
  }

  /**
   * Load frameworks from node properties using CategoryService
   */
  private loadFrameworks() {
    if (!this.node) {
      console.warn('No node available to load regulatory framework categories for');
      return;
    }

    // Check if node has the aspect/property
    if (this.node.aspectNames &&
        this.node.aspectNames.includes(EK_REGULATORY_FRAMEWORK_ASPECT_NAME)) {
      this.supportsFrameworks = true;
    }

    // Use CategoryService to get linked categories
    this.categoryService.getCategoryLinksForNode(this.node.id).subscribe({
      next: (categoryPaging) => {
        if (categoryPaging.list.entries.length > 0) {
          this.hasFrameworks = true;

          // Map entries to our frameworks format
          this.frameworks = categoryPaging.list.entries.map(entry => {
            return {
              id: entry.entry.id,
              name: entry.entry.name,
              // Just use empty string for description since entry.entry doesn't have properties
              description: ''
            };
          });
        } else {
          this.hasFrameworks = false;
          this.frameworks = [];
        }
      },
      error: (err) => {
        console.error('Error loading regulatory framework categories', err);
        this.hasFrameworks = false;
        this.frameworks = [];
      }
    });
  }

  /**
  * Open category picker dialog to add new frameworks
  */
  openCategoryPicker() {
    // Create data object with Subject for selection
    const data: CategorySelectorDialogOptions = {
      select: new Subject<Category[]>(),
      multiSelect: true
    };

    // Open dialog with CategorySelectorDialogComponent
    const dialogRef = this.dialog.open(CategorySelectorDialogComponent, {
      width: '500px',
      data
    });

    // Subscribe to the selection Subject
    data.select.subscribe(selectedCategories => {
      if (selectedCategories && selectedCategories.length > 0) {
        this.addFrameworks(selectedCategories);
      }
    });

    // Clean up subscription when dialog closes
    dialogRef.afterClosed().subscribe(() => {
      data.select.complete();
    });
  }

  /**
   * Add new frameworks to the node using CategoryService
   */
  addFrameworks(newCategories: Category[]) {
    // Create array of CategoryLinkBody objects
    const categoryLinkBodies = newCategories.map(category => {
      const linkBody = new CategoryLinkBody();
      linkBody.categoryId = category.id;
      return linkBody;
    });

    // Use categoryService to link categories to node
    this.categoryService.linkNodeToCategory(this.node.id, categoryLinkBodies).subscribe({
      next: () => {
        // Reload frameworks after successful update
        this.loadFrameworks();

        // Show success message
        this.snackBar.open('Regulatory frameworks updated', 'Close', {
          duration: 2000
        });
      },
      error: (err) => {
        console.error('Error adding regulatory frameworks', err);

        // Show error message
        this.snackBar.open(`Error adding regulatory frameworks: ${err.message || 'Server error'}`, 'Close', {
          duration: 5000,
          panelClass: ['mat-snack-bar-container-error']
        });
      }
    });
  }

  /**
   * Remove a regulatory framework category from the node using CategoryService
   */
  removeFramework(framework: any) {
    // Use categoryService to unlink category from node
    this.categoryService.unlinkNodeFromCategory(this.node.id, framework.id).subscribe({
      next: () => {
        // Reload frameworks after successful removal
        this.loadFrameworks();

        // Show success message
        this.snackBar.open('Regulatory framework removed', 'Close', {
          duration: 2000
        });
      },
      error: (err) => {
        console.error('Error removing regulatory framework', err);

        // Show error message
        this.snackBar.open(`Error removing regulatory framework: ${err.message || 'Server error'}`, 'Close', {
          duration: 5000,
          panelClass: ['mat-snack-bar-container-error']
        });
      }
    });
  }
}
