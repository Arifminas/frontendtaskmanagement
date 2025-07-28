import React, { useEffect, useState } from 'react';
import { fetchBranches } from '../../Api/branches';

const BranchList = () => {
  const [branches, setBranches] = useState([]);
  
  useEffect(() => {
    fetchBranches()
      .then(data => setBranches(data))
      .catch(err => console.error('Failed to load branches', err));
  }, []);
  
  return (
    <ul>
      {branches.map(branch => (
        <li key={branch._id}>{branch.name}</li>
      ))}
    </ul>
  );
};

export default BranchList;
