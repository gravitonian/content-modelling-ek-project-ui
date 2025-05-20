import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Node } from '@alfresco/js-api';

import { SupplierClientData } from '../models/ek-project.model';

// These must match content model definition constraint
export enum ProfileType {
  CLIENT_ID = 'Client',
  SUPPLIER_ID = 'Supplier'
}

@Component({
  selector: 'ek-supplier-client-dialog',
  templateUrl: './create-client-supplier-dialog.component.html',
  styleUrls: ['./create-client-supplier-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CreateClientSupplierDialogComponent implements OnInit {
  form: FormGroup;

  profileTypes = [
    { value: ProfileType.SUPPLIER_ID, label: 'EK_PROJECT.DIALOGS.CREATE_CLIENT_SUPPLIER.FIELDS.PROFILE_TYPES.SUPPLIER' },
    { value: ProfileType.CLIENT_ID, label: 'EK_PROJECT.DIALOGS.CREATE_CLIENT_SUPPLIER.FIELDS.PROFILE_TYPES.CLIENT' }
  ];
  complianceCertifications = [
    { value: 'ISO 9001', checked: false },
    { value: 'ISO 27001', checked: false },
    { value: 'FDA Approved', checked: false },
    { value: 'HIPAA Compliant', checked: false },
    { value: 'GDPR Compliant', checked: false }
  ];
  selectedContracts: Node[] = [];

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<CreateClientSupplierDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { editData?: SupplierClientData }
  ) {}

  ngOnInit() {
    this.createForm();

    // If edit mode, populate form with existing data
    if (this.data && this.data.editData) {
      this.form.patchValue(this.data.editData);

      // Handle certifications (convert array to checkboxes)
      if (this.data.editData.complianceCertifications) {
        this.complianceCertifications.forEach(cert => {
          cert.checked = this.data.editData.complianceCertifications.includes(cert.value);
        });
      }

      // Handle contracts - would need to fetch contract nodes by IDs
      // This would typically be handled by a service
    }
  }

  createForm() {
    this.form = this.formBuilder.group({
      name: ['', [Validators.required]],
      title: [''],
      description: [''],
      profileName: ['', [Validators.required]],
      profileType: [ProfileType.SUPPLIER_ID, [Validators.required]],
      contactAddress: [''],
      contactPhone: [''],
      contactEmail: ['', [Validators.email]],
    });
  }

  onContractsSelected(contracts: Node[]) {
    this.selectedContracts = contracts;
  }

  onSubmit() {
    if (this.form.valid) {
      // Get form values
      const formValues = this.form.value;

      // Get selected certifications
      const selectedCertifications = this.complianceCertifications
        .filter(cert => cert.checked)
        .map(cert => cert.value);

      // Get contract IDs
      const contractIds = this.selectedContracts.map(contract => contract.id);

      // Create the final data object
      const supplierClientData: SupplierClientData = {
        ...formValues,
        complianceCertifications: selectedCertifications,
        relatedContractIds: contractIds
      };

      // Return data to caller
      this.dialogRef.close(supplierClientData);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  toggleCertification(cert: any) {
    cert.checked = !cert.checked;
  }
}
