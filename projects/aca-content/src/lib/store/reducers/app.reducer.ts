/*!
 * Copyright © 2005-2025 Hyland Software, Inc. and its affiliates. All rights reserved.
 *
 * Alfresco Example Content Application
 *
 * This file is part of the Alfresco Example Content Application.
 * If the software was purchased under a paid Alfresco license, the terms of
 * the paid license agreement will prevail. Otherwise, the software is
 * provided under the following open source license terms:
 *
 * The Alfresco Example Content Application is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * The Alfresco Example Content Application is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * from Hyland Software. If not, see <http://www.gnu.org/licenses/>.
 */

import { Action } from '@ngrx/store';
import {
  AppState,
  NodeActionTypes,
  SetUserProfileAction,
  SetCurrentFolderAction,
  SetCurrentUrlAction,
  SetSelectedNodesAction,
  SetRepositoryInfoAction,
  SetInfoDrawerStateAction,
  SetInfoDrawerMetadataAspectAction,
  SetCurrentNodeVersionAction,
  SetFileUploadingDialogAction,
  SetInfoDrawerPreviewStateAction,
  AppActionTypes,
  ShowLoaderAction,
  INITIAL_APP_STATE,
  SetSearchItemsTotalCountAction
} from '@alfresco/aca-shared/store';

export function appReducer(state: AppState = INITIAL_APP_STATE, action: Action): AppState {
  let newState: AppState;

  switch (action.type) {
    case NodeActionTypes.SetSelection:
      newState = updateSelectedNodes(state, action as SetSelectedNodesAction);
      break;
    case AppActionTypes.SetUserProfile:
      newState = updateUser(state, action as SetUserProfileAction);
      break;
    case AppActionTypes.SetCurrentFolder:
      newState = updateCurrentFolder(state, action as SetCurrentFolderAction);
      break;
    case AppActionTypes.SetCurrentVersion:
      newState = updateCurrentNodeVersion(state, action as SetCurrentNodeVersionAction);
      break;
    case AppActionTypes.SetCurrentUrl:
      newState = updateCurrentUrl(state, action as SetCurrentUrlAction);
      break;
    case AppActionTypes.ToggleInfoDrawer:
      newState = toggleInfoDrawer(state);
      break;
    case AppActionTypes.SetInfoDrawerState:
      newState = setInfoDrawer(state, action as SetInfoDrawerStateAction);
      break;
    case AppActionTypes.SetInfoDrawerMetadataAspect:
      newState = setInfoDrawerAspect(state, action as SetInfoDrawerMetadataAspectAction);
      break;
    case AppActionTypes.SetRepositoryInfo:
      newState = updateRepositoryStatus(state, action as SetRepositoryInfoAction);
      break;
    case AppActionTypes.SetFileUploadingDialog:
      newState = setUploadDialogVisibility(state, action as SetFileUploadingDialogAction);
      break;
    case AppActionTypes.ShowInfoDrawerPreview:
      newState = showInfoDrawerPreview(state);
      break;
    case AppActionTypes.SetInfoDrawerPreviewState:
      newState = setInfoDrawerPreview(state, action as SetInfoDrawerPreviewStateAction);
      break;
    case AppActionTypes.ShowLoaderAction:
      newState = showLoader(state, action as ShowLoaderAction);
      break;
    case AppActionTypes.SetSearchItemsTotalCount:
      newState = {
        ...state,
        searchItemsTotalCount: (action as SetSearchItemsTotalCountAction).payload
      };
      break;
    default:
      newState = { ...state };
  }

  return newState;
}

function updateUser(state: AppState, action: SetUserProfileAction): AppState {
  return { ...state, user: { ...action.payload } };
}

function updateCurrentFolder(state: AppState, action: SetCurrentFolderAction) {
  const newState = { ...state };
  newState.navigation.currentFolder = action.payload;
  return newState;
}

function updateCurrentNodeVersion(state: AppState, action: SetCurrentNodeVersionAction) {
  const newState = { ...state };
  newState.currentNodeVersion = action.payload;
  return newState;
}

function updateCurrentUrl(state: AppState, action: SetCurrentUrlAction) {
  const newState = { ...state };
  newState.navigation.url = action.payload;
  return newState;
}

function toggleInfoDrawer(state: AppState) {
  const newState = { ...state };

  let value = state.infoDrawerOpened;
  if (state.selection.isEmpty) {
    value = false;
  } else {
    value = !value;
  }

  newState.infoDrawerOpened = value;

  return newState;
}

function showInfoDrawerPreview(state: AppState) {
  const newState = { ...state };

  let value = state.infoDrawerPreview;
  if (state.selection.isEmpty) {
    value = false;
  } else {
    value = !value;
  }

  newState.infoDrawerPreview = value;

  return newState;
}

function updateSelectedNodes(state: AppState, action: SetSelectedNodesAction): AppState {
  const newState = { ...state };
  const nodes = [...action.payload];
  const count = nodes.length;
  const isEmpty = nodes.length === 0;

  let first = null;
  let last = null;
  let file = null;
  let folder = null;
  let library = null;

  if (nodes.length > 0) {
    first = nodes[0];
    last = nodes[nodes.length - 1];

    if (nodes.length === 1) {
      file = nodes.find(
        (entity: any) =>
          // workaround Shared
          !!(entity.entry.isFile || entity.entry.nodeId || entity.entry.sharedByUser)
      );
      folder = nodes.find((entity: any) => entity.entry.isFolder);
    }
  }

  const libraries: any[] = [...action.payload].filter((node: any) => node.isLibrary);
  if (libraries.length === 1) {
    library = libraries[0];
  }

  if (isEmpty) {
    newState.infoDrawerOpened = false;
  }

  newState.selection = {
    count,
    nodes,
    isEmpty,
    first,
    last,
    file,
    folder,
    libraries,
    library
  };
  return newState;
}

const setInfoDrawer = (state: AppState, action: SetInfoDrawerStateAction) => ({
  ...state,
  infoDrawerOpened: action.payload
});

const setInfoDrawerPreview = (state: AppState, action: SetInfoDrawerPreviewStateAction) => ({
  ...state,
  infoDrawerPreview: action.payload
});

const setInfoDrawerAspect = (state: AppState, action: SetInfoDrawerMetadataAspectAction) => ({
  ...state,
  infoDrawerMetadataAspect: action.payload
});

function updateRepositoryStatus(state: AppState, action: SetRepositoryInfoAction) {
  const newState = { ...state };
  newState.repository = action.payload;
  return newState;
}

function setUploadDialogVisibility(state: AppState, action: SetFileUploadingDialogAction): AppState {
  const newState = { ...state };
  newState.fileUploadingDialog = action.payload;
  return newState;
}

function showLoader(state: AppState, action: ShowLoaderAction): AppState {
  const newState = { ...state };
  newState.showLoader = action.payload;
  return newState;
}
