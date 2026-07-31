export type ID = string;

export type ISODateString = string;

export type Nullable<T> = T | null;

export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};
