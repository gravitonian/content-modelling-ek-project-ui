import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { Node } from '@alfresco/js-api';
import { NodeAction, ContentNodeSelectorComponent, ContentNodeSelectorComponentData } from '@alfresco/adf-content-services';

@Component({
  selector: 'ek-contract-picker',
  templateUrl: './contract-picker.component.html',
  styleUrls: ['./contract-picker.component.scss']
})
export class ContractPickerComponent implements OnInit {
  @Input() selectedContracts: Node[] = [];
  @Output() contractsSelected = new EventEmitter<Node[]>();

  constructor(
    private dialog: MatDialog,
    private translateService: TranslateService
  ) {}

  ngOnInit() {}

  openContractSelector() {
    // Look up i18n for dialog title
    const dialogTitle = this.translateService.instant('EK_PROJECT.DIALOGS.CONTRACT_PICKER.TITLE');

    // Look up contracts folder id
    const contractFolderId = '2c6cdf4b-d621-40cd-acdf-4bd62150cd80';

    const data: ContentNodeSelectorComponentData = {
      title: dialogTitle,                                           // Contract picker dialog title
      actionName: NodeAction.CHOOSE,                                // Button text is Choose
      currentFolderId: contractFolderId,                            // This would be the ID of your contracts folder
      selectionMode: 'multiple',                                    // Can select multiple contracts to connect to this new supplier/client profile
      where: '(isFile=true)',                                       // Filter for contract type nodes, so we don't include folders
      isSelectionValid: (selection: Node) => selection.isFile,      // Has to be a file
      select: new Subject<Node[]>()                                 // Selected contract files end up here
    };

    const dialogRef = this.dialog.open(ContentNodeSelectorComponent, {
      width: '630px',
      panelClass: 'adf-content-node-selector-dialog',
      data
    });

    // Create a copy of selected contracts
    const selectedItems = this.selectedContracts.slice();

    data.select.subscribe((nodes: Node[]) => {
      if (nodes.length > 0) {
        // Merge with previously selected contracts, avoiding duplicates
        nodes.forEach(node => {
          if (!this.isNodeSelected(node, selectedItems)) {
            selectedItems.push(node);
          }
        });

        this.selectedContracts = selectedItems;
        this.contractsSelected.emit(this.selectedContracts);
        dialogRef.close();
      }
    });
  }

  removeContract(contract: Node) {
    const index = this.selectedContracts.findIndex(item => item.id === contract.id);
    if (index !== -1) {
      this.selectedContracts.splice(index, 1);
      this.contractsSelected.emit(this.selectedContracts);
    }
  }

  private isNodeSelected(node: Node, selectedNodes: Node[]): boolean {
    return selectedNodes.some(selectedNode => selectedNode.id === node.id);
  }
}
