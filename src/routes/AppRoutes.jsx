// src/routes/AppRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Layout from '../components/common/Layout';
import Register from '../pages/Auth/Register';
import VerifyOtp from '../pages/Auth/VerifyOtp';
import Login from '../pages/Auth/Login';
import Dashboard from '../pages/dashboard/Dashboard';
import Unauthorized from '../pages/Unauthorized';

import ProtectedRoute from './ProtectedRoute';
import TaskList from '../pages/tasks/TaskList';
import TaskDetail from '../pages/tasks/TaskDetail';
import CreateTask from '../pages/tasks/CreateTask';
import EditTask from '../pages/tasks/EditTask';

import StaffList from '../pages/staff/StaffList';
import StaffForm from '../pages/staff/StaffForm';

import UserProfile from '../pages/settings/UserProfile';
import UserList from '../pages/users/UserList';
import UserForm from '../pages/users/UserForm';
import UserEdit from '../pages/users/UserEdit';
import Profile from '../pages/users/Profile';
import RoleAssignment from '../pages/users/RoleAssignment';

import DepartmentList from '../pages/departments/DepartmentList';
import DepartmentForm from '../pages/departments/DepartmentForm';
import AssignLeads from '../pages/departments/AssignLeads';
import DepartmentHierarchy from '../pages/departments/DepartmentHierarchy';
import DepartmentMapView from '../pages/departments/DepartmentMapView';

import AssetList from '../pages/assets/AssetList';
import AssetForm from '../pages/assets/AssetForm';
import AssignAsset from '../pages/assets/AssignAsset';
import TransferAsset from '../pages/assets/TransferAsset';

import TaskReports from '../pages/reports/TaskReports';
import AssetReports from '../pages/reports/AssetReports';

import PublicChat from '../pages/chat/PublicChat';
import DepartmentChat from '../pages/chat/DepartmentChat';

import AccountSettings from '../pages/settings/AccountSettings';

// Notifications provider for private sections
import NotificationProvider from '../contexts/NotificationContext';

const AppRoutes = () => (
  <Routes>
    {/* Redirect root to dashboard */}
    <Route path="/" element={<Navigate to="/dashboard" replace />} />

    {/* Public routes */}
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/verify-otp" element={<VerifyOtp />} />

    {/* Protected: all roles */}
    <Route element={<ProtectedRoute allowedRoles={['admin', 'coordinator', 'user']} />}>
      <Route
        element={
          <NotificationProvider>
            <Layout />
          </NotificationProvider>
        }
      >
        {/* Chat base redirect */}
        <Route path="/chat" element={<Navigate to="/chat/public" replace />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/tasks" element={<TaskList />} />
        <Route path="/tasks/create" element={<CreateTask />} />
        <Route path="/tasks/:taskId" element={<TaskDetail />} />
        <Route path="/tasks/edit/:id" element={<EditTask />} />

        <Route path="/departments/map" element={<DepartmentMapView />} />

        <Route path="/settings" element={<UserProfile />} />
        <Route path="/chat/public" element={<PublicChat />} />
        <Route path="/chat/department" element={<DepartmentChat />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Route>

    {/* Protected: admin + coordinator */}
    <Route element={<ProtectedRoute allowedRoles={['admin', 'coordinator']} />}>
      <Route
        element={
          <NotificationProvider>
            <Layout />
          </NotificationProvider>
        }
      >
        <Route path="/staff" element={<StaffList />} />
        <Route path="/staff/create" element={<StaffForm />} />
        <Route path="/staff/:staffId" element={<StaffForm />} />

        <Route path="/users" element={<UserList />} />
        <Route path="/users/create" element={<UserForm />} />
        <Route path="/users/:userId" element={<UserForm />} />
        <Route path="/users/edit/:userId" element={<UserEdit />} />

        <Route path="/roles" element={<RoleAssignment />} />

        <Route path="/departments" element={<DepartmentList />} />
        <Route path="/departments/create" element={<DepartmentForm />} />
        <Route path="/departments/:departmentId" element={<DepartmentForm />} />
        <Route path="/departments/assign-leads" element={<AssignLeads />} />
        <Route path="/departments/hierarchy" element={<DepartmentHierarchy />} />

        <Route path="/assets" element={<AssetList />} />
        <Route path="/assets/create" element={<AssetForm />} />
        <Route path="/assets/:assetId" element={<AssetForm />} />
        <Route path="/assets/assign" element={<AssignAsset />} />
        <Route path="/assets/transfer" element={<TransferAsset />} />

        <Route path="/reports/tasks" element={<TaskReports />} />
        <Route path="/reports/assets" element={<AssetReports />} />
      </Route>
    </Route>

    {/* Protected (generic) — avoid /settings clash, use /account */}
    <Route element={<ProtectedRoute />}>
      <Route
        element={
          <NotificationProvider>
            <Layout />
          </NotificationProvider>
        }
      >
        <Route path="/account" element={<AccountSettings />} />
      </Route>
    </Route>

    <Route path="/unauthorized" element={<Unauthorized />} />

    {/* Fallback */}
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default AppRoutes;
