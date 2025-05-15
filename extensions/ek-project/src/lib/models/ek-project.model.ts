// Content model property definitions - from out-of-the-box model
export const CM_OWNER_PROP_NAME = 'cm:owner';
export const CM_TITLE_PROP_NAME = 'cm:title';
export const CM_DESCRIPTION_PROP_NAME = 'cm:description';

// Content model property definitions - from EK Project model
export const EK_SUPPLIER_CLIENT_PROFILE_CONTENT_TYPE = 'ek:supplierClientProfileData';
export const EK_SUPPLIER_CLIENT_PROFILE_NAME_PROP_NAME = 'ek:profileName';
export const EK_SUPPLIER_CLIENT_PROFILE_TYPE_PROP_NAME = 'ek:profileType';
export const EK_SUPPLIER_CLIENT_PROFILE_CONTACT_ADDRESS_PROP_NAME = 'ek:contactAddress';
export const EK_SUPPLIER_CLIENT_PROFILE_CONTACT_PHONE_PROP_NAME = 'ek:contactPhone';
export const EK_SUPPLIER_CLIENT_PROFILE_CONTACT_EMAIL_PROP_NAME = 'ek:contactEmail';
export const EK_SUPPLIER_CLIENT_COMPLIANCE_CERT_PROP_NAME = 'ek:complianceCertifications';
export const EK_SUPPLIER_CLIENT_PROFILE_REL_CONTRACTS_PROP_NAME = 'ek:profileRelatedContracts';
export const EK_REGULATORY_FRAMEWORK_ASPECT_NAME = 'ek:regulatoryFramework';
export const EK_REGULATORY_FRAMEWORKS_PROP_NAME = 'ek:regulatoryFrameworks';

// Client/Supplier profile data
export interface SupplierClientData {
  name: string;                         // Required
  title: string;
  description: string;
  profileName: string;                  // Required
  profileType: string;                  // Required - one of client or supplier
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  complianceCertifications: string[];   // ISO 9001,ISO 27001,FDA Approved,HIPAA Compliant,GDPR Compliant
  relatedContractIds: string[];         // Need to be able to show picker for alfresco nodes
}

// Action payload
export interface CreateClientSupplierPayload {
  parentNodeId: string;
  nodeData: SupplierClientData;
}
