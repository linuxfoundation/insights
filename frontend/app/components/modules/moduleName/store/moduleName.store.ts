import {defineStore} from 'pinia';

export interface ModuleNameState {
    token: string | null,
}

const useModuleNameStore = defineStore('moduleName', {
    state: () => ({
        token: null
    } as ModuleNameState),
    actions: {
        someAction(id: string): Promise<string> {
            this.token = id;
            return Promise.resolve(id);
        }
    },
});

export default useModuleNameStore;
