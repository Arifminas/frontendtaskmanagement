import { useState, useEffect } from 'react';
import axiosInstance from '../Api/axiosInstance';

export const useAxios = (config) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance(config);
      setData(res.data);
      setError(null);
    } catch (err) {
      setError(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [config.url]); // refetch if url changes

  return { data, loading, error, refetch: fetchData };
};
