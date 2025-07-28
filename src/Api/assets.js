import axiosInstance from './axiosInstance';

// Fetch all assets
export const fetchAssets = async () => {
  const response = await axiosInstance.get('/assets');
  return response.data.assets;
};

// Fetch asset by ID
export const fetchAssetById = async (assetId) => {
  const response = await axiosInstance.get(`/assets/${assetId}`);
  return response.data.asset;
};

// Create new asset
export const createAsset = async (assetData) => {
  const response = await axiosInstance.post('/assets', assetData);
  return response.data.asset;
};

// Update existing asset
export const updateAsset = async (assetId, assetData) => {
  const response = await axiosInstance.put(`/assets/${assetId}`, assetData);
  return response.data.asset;
};

// Assign asset to user
export const assignAssetToUser = async (assetId, userId) => {
  const response = await axiosInstance.post(`/assets/${assetId}/assign`, { userId });
  return response.data;
};

// Transfer asset
export const transferAsset = async (assetId, transferData) => {
  const response = await axiosInstance.post(`/assets/${assetId}/transfer`, transferData);
  return response.data;
};

// Delete asset
export const deleteAsset = async (assetId) => {
  const response = await axiosInstance.delete(`/assets/${assetId}`);
  return response.data;
};

