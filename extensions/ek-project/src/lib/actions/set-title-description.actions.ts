import { Action } from '@ngrx/store';
import { Node } from '@alfresco/js-api';

// need to match extension JSON action definition "type" - ek-project.json
export const SET_TITLE_DESCRIPTION_ACTION_TYPE = 'SET_TITLE_DESCRIPTION';
export const SET_TITLE_DESCRIPTION_SUCCESS_ACTION_TYPE = 'SET_TITLE_DESCRIPTION_SUCCESS';
export const SET_TITLE_DESCRIPTION_FAILURE_ACTION_TYPE = 'SET_TITLE_DESCRIPTION_FAILURE';

export class SetTitleDescriptionAction implements Action {
  readonly type = SET_TITLE_DESCRIPTION_ACTION_TYPE;
  constructor(public payload: Node) {}
}

export class SetTitleDescriptionSuccessAction implements Action {
  readonly type = SET_TITLE_DESCRIPTION_SUCCESS_ACTION_TYPE;
  constructor(public payload: Node) {}
}

export class SetTitleDescriptionFailureAction implements Action {
  readonly type = SET_TITLE_DESCRIPTION_FAILURE_ACTION_TYPE;
  constructor(public payload: Node, public error: any) {}
}
