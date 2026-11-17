export interface OrderDto {
  _id: string;
  ownerId: string;
  customerId: string;
  measurementId?: string | null;
  orderNumber: string;
  price: number;
  advancePaid: number;
  status: string;
  orderDate: string;
  dueDate: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
