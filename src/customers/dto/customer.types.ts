export interface CustomerDto {
  _id: string;
  ownerId: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerListData {
  customers: CustomerDto[];
  total: number;
}
