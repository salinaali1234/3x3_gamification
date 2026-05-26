export type CmCustomerData = {
  uuid?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  mobile?: string;
};

export type CmOrder = {
  uuid: string;
  batch_id?: string;
  status?: string;
  completed_at?: string | null;
  customer_data?: CmCustomerData;
};

export type CmSyncResult = {
  fetched: number;
  created: number;
  skipped: number;
  errors: string[];
};
