import { Action } from '@ngrx/store';
import { Node } from '@alfresco/js-api';

// need to match extension JSON action definition "type" - ek-project.json
export const TAKE_OWNERSHIP_ACTION_TYPE = 'TAKE_OWNERSHIP';
export const TAKE_OWNERSHIP_SUCCESS_ACTION_TYPE = 'TAKE_OWNERSHIP_SUCCESS';
export const TAKE_OWNERSHIP_FAILURE_ACTION_TYPE = 'TAKE_OWNERSHIP_FAILURE';

/**
 * The Alfresco Development Framework extension mechanism dispatches actions as follows:

 runActionById(id: string, additionalPayload?: any) {
     const action = this.extensions.getActionById(id);
     if (action) {
       const { type, payload } = action;
       const context = {
         selection: this.selection
       };
       const expression = this.extensions.runExpression(payload, context);

       this.store.dispatch({
         type,
         payload: expression,
         configuration: additionalPayload
       });
     } else {
       this.store.dispatch({
         type: id,
         configuration: additionalPayload
       });
     }
   }

   So you will always have a property called payload to check in your expression definitions for example.
 */
export class TakeOwnershipAction implements Action {
  readonly type = TAKE_OWNERSHIP_ACTION_TYPE;
  constructor(public payload: Node) {}
}

export class TakeOwnershipSuccessAction implements Action {
  readonly type = TAKE_OWNERSHIP_SUCCESS_ACTION_TYPE;
  constructor(public payload: Node) {}
}

export class TakeOwnershipFailureAction implements Action {
  readonly type = TAKE_OWNERSHIP_FAILURE_ACTION_TYPE;
  constructor(public payload: Node, public error: any) {}
}
