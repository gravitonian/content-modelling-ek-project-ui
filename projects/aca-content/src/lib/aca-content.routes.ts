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

import { FilesComponent } from './components/files/files.component';
import { LibrariesComponent } from './components/libraries/libraries.component';
import { FavoriteLibrariesComponent } from './components/favorite-libraries/favorite-libraries.component';
import { SearchResultsComponent } from './components/search/search-results/search-results.component';
import { SearchLibrariesResultsComponent } from './components/search/search-libraries-results/search-libraries-results.component';
import { AppSharedRuleGuard, ExtensionRoute, ExtensionsDataLoaderGuard, GenericErrorComponent, PluginEnabledGuard } from '@alfresco/aca-shared';
import { AuthGuard, UnsavedChangesGuard } from '@alfresco/adf-core';
import { FavoritesComponent } from './components/favorites/favorites.component';
import { RecentFilesComponent } from './components/recent-files/recent-files.component';
import { SharedFilesComponent } from './components/shared-files/shared-files.component';
import { DetailsComponent } from './components/details/details.component';
import { HomeComponent } from './components/home/home.component';
import { ViewProfileComponent } from './components/view-profile/view-profile.component';
import { ViewProfileRuleGuard } from './components/view-profile/view-profile.guard';
import { Data, Route, Routes } from '@angular/router';
import { SharedLinkViewComponent } from './components/shared-link-view/shared-link-view.component';
import { TrashcanComponent } from './components/trashcan/trashcan.component';
import { ShellLayoutComponent } from '@alfresco/adf-core/shell';
import { SearchAiResultsComponent } from './components/knowledge-retrieval/search-ai/search-ai-results/search-ai-results.component';
import { SavedSearchesSmartListComponent } from './components/search/search-save/list/smart-list/saved-searches-smart-list.component';

export const CONTENT_ROUTES: ExtensionRoute[] = [
  {
    path: 'preview/s/:id',
    children: [
      {
        path: '',
        component: SharedLinkViewComponent,
        data: {
          title: 'APP.PREVIEW.TITLE'
        }
      }
    ]
  },
  {
    path: 'view',
    component: ShellLayoutComponent,
    children: [
      {
        path: ':nodeId',
        outlet: 'viewer',
        children: [
          {
            path: '',
            loadChildren: () => import('@alfresco/aca-content/viewer').then((m) => m.AcaViewerModule)
          }
        ]
      }
    ]
  }
];

const createViewRoutes = (navigateSource: string, additionalData: Data = {}): Routes => [
  {
    path: 'view/:nodeId',
    outlet: 'viewer',
    children: [
      {
        path: '',
        data: {
          navigateSource
        },
        loadChildren: () => import('@alfresco/aca-content/viewer').then((m) => m.AcaViewerModule)
      }
    ],
    ...additionalData
  },
  {
    path: 'view/:nodeId/:versionId',
    outlet: 'viewer',
    children: [
      {
        path: '',
        data: {
          navigateSource
        },
        loadChildren: () => import('@alfresco/aca-content/viewer').then((m) => m.AcaViewerModule)
      }
    ]
  }
];

export const CONTENT_LAYOUT_ROUTES: Route = {
  path: '',
  canActivate: [ExtensionsDataLoaderGuard],
  children: [
    {
      path: 'profile',
      canActivate: [ViewProfileRuleGuard],
      component: ViewProfileComponent
    },
    {
      path: '',
      component: HomeComponent
    },
    {
      path: 'personal-files',
      children: [
        {
          path: '',
          component: FilesComponent,
          data: {
            sortingPreferenceKey: 'personal-files',
            title: 'APP.BROWSE.PERSONAL.TITLE',
            defaultNodeId: '-my-'
          }
        },
        {
          path: 'details/:nodeId',
          children: [
            {
              path: '',
              component: DetailsComponent,
              data: {
                navigateSource: 'personal-files'
              }
            },
            {
              path: ':activeTab',
              component: DetailsComponent,
              data: {
                title: 'APP.BROWSE.PERSONAL.PERMISSIONS.TITLE',
                navigateSource: 'personal-files'
              }
            }
          ]
        },
        ...createViewRoutes('personal-files')
      ]
    },
    {
      path: 'personal-files/:folderId',
      children: [
        {
          path: '',
          component: FilesComponent,
          data: {
            title: 'APP.BROWSE.PERSONAL.TITLE',
            sortingPreferenceKey: 'personal-files'
          }
        },
        ...createViewRoutes('personal-files')
      ]
    },
    {
      path: 'libraries',
      children: [
        {
          path: '',
          component: LibrariesComponent,
          data: {
            title: 'APP.BROWSE.LIBRARIES.MENU.MY_LIBRARIES.TITLE',
            sortingPreferenceKey: 'libraries'
          }
        }
      ]
    },
    {
      path: 'libraries/:folderId',
      children: [
        {
          path: '',
          component: FilesComponent,
          data: {
            title: 'APP.BROWSE.LIBRARIES.MENU.MY_LIBRARIES.TITLE',
            sortingPreferenceKey: 'libraries-files'
          }
        },
        ...createViewRoutes('libraries', {
          data: {
            navigateSource: 'libraries'
          }
        })
      ]
    },
    {
      path: 'favorite',
      children: [
        {
          path: '',
          pathMatch: 'full',
          redirectTo: 'libraries'
        },
        {
          path: 'libraries',
          component: FavoriteLibrariesComponent,
          data: {
            title: 'APP.BROWSE.LIBRARIES.MENU.FAVORITE_LIBRARIES.TITLE',
            sortingPreferenceKey: 'favorite-libraries'
          }
        }
      ]
    },
    {
      path: 'favorite/libraries/:folderId',
      children: [
        {
          path: '',
          component: FilesComponent,
          data: {
            title: 'APP.BROWSE.LIBRARIES.MENU.FAVORITE_LIBRARIES.TITLE',
            sortingPreferenceKey: 'libraries-files'
          }
        },
        ...createViewRoutes('libraries')
      ]
    },
    {
      path: 'favorites',
      data: {
        sortingPreferenceKey: 'favorites'
      },
      children: [
        {
          path: '',
          component: FavoritesComponent,
          data: {
            title: 'APP.BROWSE.FAVORITES.TITLE',
            sortingPreferenceKey: 'favorites'
          }
        },
        ...createViewRoutes('favorites')
      ]
    },
    {
      path: 'recent-files',
      data: {
        sortingPreferenceKey: 'recent-files'
      },
      children: [
        {
          path: '',
          component: RecentFilesComponent,
          data: {
            title: 'APP.BROWSE.RECENT.TITLE'
          }
        },
        ...createViewRoutes('recent-files')
      ]
    },
    {
      path: 'shared',
      children: [
        {
          path: '',
          data: {
            title: 'APP.BROWSE.SHARED.TITLE',
            sortingPreferenceKey: 'shared-files'
          },
          component: SharedFilesComponent
        },
        ...createViewRoutes('shared')
      ],
      canActivateChild: [AppSharedRuleGuard],
      canActivate: [AppSharedRuleGuard]
    },
    {
      path: 'trashcan',
      children: [
        {
          path: '',
          component: TrashcanComponent,
          data: {
            title: 'APP.BROWSE.TRASHCAN.TITLE',
            sortingPreferenceKey: 'trashcan'
          }
        }
      ]
    },
    {
      path: 'search',
      children: [
        {
          path: '',
          component: SearchResultsComponent,
          data: {
            title: 'APP.BROWSE.SEARCH.TITLE',
            sortingPreferenceKey: 'search'
          }
        },
        ...createViewRoutes('search')
      ]
    },
    {
      path: 'search-libraries',
      children: [
        {
          path: '',
          component: SearchLibrariesResultsComponent,
          data: {
            title: 'APP.BROWSE.SEARCH.TITLE',
            sortingPreferenceKey: 'search-libraries'
          }
        },
        {
          path: 'view/:nodeId',
          outlet: 'viewer',
          children: [
            {
              path: '',
              data: {
                navigateSource: 'search'
              },
              loadChildren: () => import('@alfresco/aca-content/viewer').then((m) => m.AcaViewerModule)
            }
          ]
        }
      ]
    },
    {
      path: 'nodes/:nodeId',
      children: [
        {
          path: '',
          loadChildren: () => import('@alfresco/aca-content/folder-rules').then((m) => m.AcaFolderRulesModule)
        }
      ]
    },
    {
      path: 'knowledge-retrieval',
      canDeactivate: [UnsavedChangesGuard],
      canActivate: [PluginEnabledGuard],
      data: {
        plugin: 'plugins.knowledgeRetrievalEnabled'
      },
      children: [
        {
          path: '',
          component: SearchAiResultsComponent
        },
        ...createViewRoutes('knowledge-retrieval')
      ]
    },
    {
      path: 'saved-searches',
      children: [
        {
          path: '',
          component: SavedSearchesSmartListComponent
        }
      ]
    },
    {
      path: '**',
      component: GenericErrorComponent
    }
  ],
  canActivateChild: [AuthGuard]
};
