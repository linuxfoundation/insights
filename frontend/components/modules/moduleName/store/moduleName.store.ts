import { defineStore } from 'pinia';
import state from './moduleName.state';
import getters from './moduleName.getters';
import actions from './moduleName.actions';

const useModuleNameStore = defineStore('moduleName', {
  state,
  getters,
  actions,
});

export default useModuleNameStore;
