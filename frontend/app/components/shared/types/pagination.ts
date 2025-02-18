export interface Pagination<N>{
    page: number;
    pageSize: number;
    total: number;
    data: N[];
}
