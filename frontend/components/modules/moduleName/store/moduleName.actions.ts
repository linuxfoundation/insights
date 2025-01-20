export default {
  someAction(id: string): Promise<any> {
    this.token = id;
    return Promise.resolve(id);
  },
};
