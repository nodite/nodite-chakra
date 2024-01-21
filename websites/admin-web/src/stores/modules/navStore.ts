/*
 * File: navStore.ts                                                           *
 * Project: @nodite-light/admin-web                                            *
 * Created Date: We Dec 2023                                                   *
 * Author: Oscaner Miao                                                        *
 * -----                                                                       *
 * Last Modified: Thu Dec 21 2023                                              *
 * Modified By: Oscaner Miao                                                   *
 * -----                                                                       *
 * Copyright (c) 2023 @nodite                                                  *
 * ----------	---	---------------------------------------------------------    *
 */

import { NavigationConfig } from '@/types/config';

type NavState = {
  routesLoaded: boolean;
  routes: NavigationConfig.Router[];
  sidebarLoaded: boolean;
  sidebar: NavigationConfig.Menu[];
};

export const useNavStore = defineStore('nav', {
  state: (): NavState => ({
    routesLoaded: false,
    routes: [],
    sidebarLoaded: false,
    sidebar: [],
  }),

  persist: [{ storage: sessionStorage, paths: ['sidebarLoaded', 'sidebar'] }],

  getters: {
    isRouterReady(state: NavState): boolean {
      return state.routesLoaded;
    },
  },

  actions: {},
});
