import axiosInstance from './axiosInstance';

// Get all asset groups
export const fetchAssetGroups = async () => {
  const res = await axiosInstance.get('/asset-groups');
  return res.data.assetGroups;
};

// Create asset group
export const createAssetGroup = async (data) => {
  const res = await axiosInstance.post('/asset-groups', data);
  return res.data.assetGroup;
};

// Update asset group
export const updateAssetGroup = async (id, data) => {
  const res = await axiosInstance.put(`/asset-groups/${id}`, data);
  return res.data.assetGroup;
};

// Delete asset group
export const deleteAssetGroup = async (id) => {
  const res = await axiosInstance.delete(`/asset-groups/${id}`);
  return res.data.message;
};
