import { Action } from '@ngrx/store';
import { Node } from '@alfresco/js-api';

// need to match extension JSON action definition "type" - ek-project.json
export const CREATE_CLIENT_SUPPLIER_ACTION_TYPE = 'CREATE_CLIENT_SUPPLIER';
export const CREATE_CLIENT_SUPPLIER_SUCCESS_ACTION_TYPE = 'CREATE_CLIENT_SUPPLIER_SUCCESS';
export const CREATE_CLIENT_SUPPLIER_FAILURE_ACTION_TYPE = 'CREATE_CLIENT_SUPPLIER_FAILURE';

export class CreateClientSupplierAction implements Action {
  readonly type = CREATE_CLIENT_SUPPLIER_ACTION_TYPE;
  constructor(public payload: Node) {} // folder node
}

export class CreateClientSupplierSuccessAction implements Action {
  readonly type = CREATE_CLIENT_SUPPLIER_SUCCESS_ACTION_TYPE;
  constructor(public payload: Node) {} // new client suppplier profile  node
}

export class CreateClientSupplierFailureAction implements Action {
  readonly type = CREATE_CLIENT_SUPPLIER_FAILURE_ACTION_TYPE;
  constructor(public error: any) {}
}

