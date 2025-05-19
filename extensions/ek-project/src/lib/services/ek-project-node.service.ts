import { Injectable } from '@angular/core';
import { Observable /*, throwError*/ } from 'rxjs';

import { Node, NodeBodyCreate } from '@alfresco/js-api';
import { AuthenticationService } from '@alfresco/adf-core';
import { NodesApiService } from '@alfresco/adf-content-services';

import { CM_TITLE_PROP_NAME, CM_DESCRIPTION_PROP_NAME, CM_OWNER_PROP_NAME,
  EK_SUPPLIER_CLIENT_PROFILE_CONTENT_TYPE, EK_SUPPLIER_CLIENT_PROFILE_NAME_PROP_NAME,
  EK_SUPPLIER_CLIENT_PROFILE_TYPE_PROP_NAME, EK_SUPPLIER_CLIENT_PROFILE_CONTACT_ADDRESS_PROP_NAME,
  EK_SUPPLIER_CLIENT_PROFILE_CONTACT_PHONE_PROP_NAME, EK_SUPPLIER_CLIENT_PROFILE_CONTACT_EMAIL_PROP_NAME,
  EK_SUPPLIER_CLIENT_COMPLIANCE_CERT_PROP_NAME, EK_SUPPLIER_CLIENT_PROFILE_REL_CONTRACTS_PROP_NAME,
  CreateClientSupplierPayload } from '../models/ek-project.model';

@Injectable({
  providedIn: 'root'    // Service is available application-wide
})
export class EkProjectNodeService {
  constructor(
    private nodesApiService: NodesApiService,
    private authenticationService: AuthenticationService
  ) {}

  currentUserTakeNodeOwnership(node: Node): Observable<Node> {

    // For testing: simulate an error
    // Return an observable that throws this custom error
    //const errorWithNode = {
    //  message: 'Simulated error in take ownership service',
    //  node: node
    //};
    //return throwError(() => errorWithNode);

    // For testing: simulate success
    //return of(node);

    return this.nodesApiService.updateNode(
      node.id,
      {
        properties: {
          [CM_OWNER_PROP_NAME]: this.authenticationService.getEcmUsername()
        }
      }
    );
  }

  setTitleDescription(node: Node, title: String, description: String): Observable<Node> {

    // For testing: simulate an error
    // Return an observable that throws this custom error
    //const errorWithNode = {
    //  message: 'Simulated error in set title & description service',
    //  node: node
    //};
    //return throwError(() => errorWithNode);

    return this.nodesApiService.updateNode(
      node.id,
      {
        properties: {
          [CM_TITLE_PROP_NAME]: title,
          [CM_DESCRIPTION_PROP_NAME]: description
        }
      }
    );
  }

  createClientSupplier(clientSupplierData: CreateClientSupplierPayload): Observable<Node> {
      const { parentNodeId, nodeData } = clientSupplierData;

      // Prepare node body for creation according to the API docs
      const nodeBody: NodeBodyCreate = {
        name: nodeData.name,
        nodeType: EK_SUPPLIER_CLIENT_PROFILE_CONTENT_TYPE,
        properties: {
          [CM_TITLE_PROP_NAME]: nodeData.title,
          [CM_DESCRIPTION_PROP_NAME]: nodeData.description,
          [EK_SUPPLIER_CLIENT_PROFILE_NAME_PROP_NAME]: nodeData.profileName,
          [EK_SUPPLIER_CLIENT_PROFILE_TYPE_PROP_NAME]: nodeData.profileType,
          [EK_SUPPLIER_CLIENT_PROFILE_CONTACT_ADDRESS_PROP_NAME]: nodeData.contactAddress,
          [EK_SUPPLIER_CLIENT_PROFILE_CONTACT_PHONE_PROP_NAME]: nodeData.contactPhone,
          [EK_SUPPLIER_CLIENT_PROFILE_CONTACT_EMAIL_PROP_NAME]: nodeData.contactEmail,
          [EK_SUPPLIER_CLIENT_COMPLIANCE_CERT_PROP_NAME]: nodeData.complianceCertifications
        }
      };

      // Add target associations if there are related contracts
      if (nodeData.relatedContractIds && nodeData.relatedContractIds.length > 0) {
        nodeBody.targets = nodeData.relatedContractIds.map(contractId => ({
          targetId: contractId,
          assocType: EK_SUPPLIER_CLIENT_PROFILE_REL_CONTRACTS_PROP_NAME
        }));
      }

      // Create the node with associations
      return this.nodesApiService.createNode(parentNodeId, nodeBody);
    }
}
