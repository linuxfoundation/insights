export default {
    someAction(id: string): Promise<void> {
        this.token = id;
        return Promise.resolve(id);
    }
};
