export interface MeasurementDto {
  _id: string;
  ownerId: string;
  customerId: string;
  measurementName: string;
  measurementDate?: string;
  kameezLength?: string;
  sleeveLength?: string;
  shoulderWidth?: string;
  neck?: string;
  chest?: string;
  waist?: string;
  bottomWidth?: string;
  shalwarLength?: string;
  bottomOpening?: string;
  cuff?: string;
  collarStyle?: string;
  hasChakPattiKaaj?: boolean;
  hasChestPocket?: boolean;
  hasSidePockets?: boolean;
  hasShalwarPocket?: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MeasurementListData {
  measurements: MeasurementDto[];
  total: number;
}
