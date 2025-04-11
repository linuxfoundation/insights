export interface Category {
    id: string;
    name: string;
}

export interface CategoryGroup {
    id: string;
    name: string;
    categories: Category[];
}
