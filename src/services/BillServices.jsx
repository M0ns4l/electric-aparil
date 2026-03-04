import api from "./api";

export const getBills = (params) => {
  return api.get("/bills", { params });
};

export const getBill = (ID) => {
  return api.get(`/bills/${ID}`);
};

export const createBill = (data) => {
  return api.post("/bills", data);
};

export const updateBill = (ID, data) => {
  return api.put(`/bills/${ID}`, data);
};

export const deleteBill = (ID) => {
  return api.delete(`/bills/${ID}`);
};
