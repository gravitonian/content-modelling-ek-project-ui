import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Node } from '@alfresco/js-api';

import { CM_TITLE_PROP_NAME, CM_DESCRIPTION_PROP_NAME } from '../models/ek-project.model';

@Component({
  selector: 'ek-set-title-description-dialog',
  templateUrl: './set-title-description-dialog.component.html',
  styleUrls: ['./set-title-description-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SetTitleDescriptionDialogComponent implements OnInit {
  form: FormGroup;
  node: Node;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<SetTitleDescriptionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { node: Node }
  ) {
    this.node = data.node;
  }

  ngOnInit() {
    // Grab the title and description that is currently set
    const properties = this.node.properties || {};

    this.form = this.formBuilder.group({
      title: [properties[CM_TITLE_PROP_NAME] || '', Validators.required],
      description: [properties[CM_DESCRIPTION_PROP_NAME] || '']
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const { title, description } = this.form.value;
      // Pass the values back to the caller
      this.dialogRef.close({ title, description });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
