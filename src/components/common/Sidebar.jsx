import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Box,
  Avatar,
  Typography,
  Chip,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Badge,
  Fab
} from '@mui/material';
import {
  Dashboard,
  Assignment,
  People,
  BarChart,
  Category,
  ExpandMore,
  Settings,
  Support,
  Business,
  LocalShipping,
  Person,
  Apartment,
  Task,
  AdminPanelSettings,
  Group,
  Description,
  AccountTree,
  AssignmentInd,
  Add,
  ViewList,
  PriorityHigh,
  Close,
  ChevronLeft,
  Menu
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';

// Custom hooks for better organization
const useResponsive = () => {
  const theme = useTheme();
  return {
    isMobile: useMediaQuery('(max-width:767px)'),
    isTablet: useMediaQuery('(min-width:768px) and (max-width:1023px)'),
    isDesktop: useMediaQuery('(min-width:1024px)'),
    isSmallMobile: useMediaQuery('(max-width:480px)')
  };
};

const useSidebarState = (collapsed, isMobile) => {
  const [isHovered, setIsHovered] = useState(false);
  const [openSections, setOpenSections] = useState({});

  const isExpanded = useMemo(() => {
    if (isMobile) return false;
    return !collapsed || isHovered;
  }, [isMobile, collapsed, isHovered]);

  return {
    isHovered,
    setIsHovered,
    openSections,
    setOpenSections,
    isExpanded
  };
};

// Configuration objects
const MENU_CONFIG = {
  main: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: <Dashboard />,
      path: '/dashboard',
      roles: ['admin', 'coordinator', 'user']
    },
    {
      id: 'userManagement',
      title: 'User Management',
      icon: <People />,
      roles: ['admin', 'coordinator'],
      hasSubmenu: true,
      children: [
        { title: 'All Users', path: '/users', icon: <ViewList /> },
        { title: 'Create User', path: '/users/create', icon: <Add /> },
        { title: 'Role Assignment', path: '/roles', icon: <AdminPanelSettings /> }
      ]
    },
    {
      id: 'departmentManagement',
      title: 'Department Management',
      icon: <Category />,
      roles: ['admin', 'coordinator'],
      hasSubmenu: true,
      children: [
        { title: 'All Departments', path: '/departments', icon: <ViewList /> },
        { title: 'Assign Team Leads', path: '/departments/assign-leads', icon: <AssignmentInd /> },
        { title: 'Department Hierarchy', path: '/departments/hierarchy', icon: <AccountTree /> }
      ]
    },
    {
      id: 'taskManagement',
      title: 'Task Management',
      icon: <Assignment />,
      roles: ['admin', 'coordinator', 'user'],
      hasSubmenu: true,
      badge: 5,
      children: [
        { title: 'My Tasks', path: '/tasks', icon: <ViewList /> },
        { title: 'Create Task', path: '/tasks/create', icon: <Add /> },
        { title: 'Priority Settings', path: '/tasks/priorities', icon: <PriorityHigh /> }
      ]
    },
    {
      id: 'reportGeneration',
      title: 'Reports & Analytics',
      icon: <BarChart />,
      roles: ['admin', 'coordinator'],
      hasSubmenu: true,
      children: [
        { title: 'User Reports', path: '/reports/user-wise', icon: <Person /> },
        { title: 'Task Reports', path: '/reports/task-wise', icon: <Assignment /> },
        { title: 'Department Reports', path: '/reports/department-wise', icon: <Category /> },
        { title: 'Daily Reports', path: '/reports/daily', icon: <Description /> }
      ]
    },
    {
      id: 'assetManagement',
      title: 'Asset Management',
      icon: <Business />,
      roles: ['admin', 'coordinator', 'user'],
      hasSubmenu: true,
      children: [
        { title: 'All Assets', path: '/assets', icon: <ViewList /> },
        { title: 'Assign Assets', path: '/assets/assign', icon: <AssignmentInd /> }
      ]
    }
  ],
  bottom: [
    {
      id: 'settings',
      title: 'Settings',
      icon: <Settings />,
      path: '/settings',
      roles: ['admin', 'coordinator', 'user']
    },
    {
      id: 'help',
      title: 'Help & Support',
      icon: <Support />,
      path: '/help',
      roles: ['admin', 'coordinator', 'user']
    }
  ]
};

// Styled components using sx prop patterns
const getDrawerStyles = (isExpanded, breakpoint, darkMode) => ({
  width: isExpanded ? 
    (breakpoint === 'mobile' ? 320 : breakpoint === 'tablet' ? 260 : 300) :
    (breakpoint === 'tablet' ? 70 : 80),
  '& .MuiDrawer-paper': {
    width: isExpanded ? 
      (breakpoint === 'mobile' ? 320 : breakpoint === 'tablet' ? 260 : 300) :
      (breakpoint === 'tablet' ? 70 : 80),
    background: darkMode 
      ? 'linear-gradient(180deg, #2a3f6f 0%, #1a2752 100%)'
      : 'linear-gradient(180deg, #1a2752 0%, #2a3f6f 100%)',
    borderRight: '1px solid rgba(255, 255, 255, 0.1)',
    color: 'white',
    overflowX: 'hidden',
    backdropFilter: 'blur(20px)',
    boxShadow: isExpanded 
      ? '0 8px 32px rgba(0, 0, 0, 0.2)' 
      : '0 4px 16px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&::-webkit-scrollbar': { width: isExpanded ? '6px' : '4px' },
    '&::-webkit-scrollbar-track': { 
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '3px'
    },
    '&::-webkit-scrollbar-thumb': {
      background: 'rgba(255, 255, 255, 0.2)',
      borderRadius: '3px',
      '&:hover': { background: 'rgba(255, 255, 255, 0.3)' }
    }
  }
});

const getListItemStyles = (isActive, isChild, showText, theme) => ({
  pl: isChild ? (showText ? 4 : 3) : (showText ? 2 : 1.5),
  pr: showText ? 2 : 1.5,
  py: 1.5,
  mx: showText ? 1 : 0.5,
  my: 0.5,
  borderRadius: showText ? 3 : 2,
  minHeight: showText ? 'auto' : 48,
  justifyContent: showText ? 'flex-start' : 'center',
  background: isActive 
    ? 'linear-gradient(135deg, #dc267f 0%, #b91c5c 100%)'
    : 'transparent',
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    background: isActive 
      ? 'linear-gradient(135deg, #e91e63 0%, #c2185b 100%)'
      : 'rgba(255, 255, 255, 0.08)',
    transform: 'translateX(4px)',
    boxShadow: isActive 
      ? '0 8px 25px rgba(220, 38, 127, 0.4)'
      : '0 4px 15px rgba(0, 0, 0, 0.15)'
  },
  '&:before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: isActive ? (showText ? '4px' : '100%') : '0px',
    background: 'linear-gradient(to bottom, #dc267f, #b91c5c)',
    transition: 'width 0.2s ease-in-out',
    borderRadius: showText ? '0px 4px 4px 0px' : '8px'
  }
});

// Main Components
const LogoSection = React.memo(({ isExpanded, isMobile, userRole, darkMode, onToggle, onClose }) => (
  <Box
    sx={{
      p: !isExpanded && !isMobile ? 2 : 3,
      background: darkMode 
        ? 'linear-gradient(135deg, #2a3f6f 0%, #1a2752 100%)'
        : 'linear-gradient(135deg, #dc267f 0%, #b91c5c 100%)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: !isExpanded && !isMobile ? 'center' : 'space-between',
      minHeight: !isExpanded && !isMobile ? 80 : 'auto',
      transition: 'all 0.3s ease'
    }}
  >
    {!isExpanded && !isMobile ? (
      <Tooltip title="Task Management System" placement="right" arrow>
        <Avatar
          sx={{
            width: 52,
            height: 52,
            bgcolor: 'rgba(255, 255, 255, 0.15)',
            cursor: 'pointer',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.25)',
              transform: 'scale(1.05)'
            }
          }}
          onClick={onToggle}
        >
          <Task sx={{ fontSize: 28, color: 'white' }} />
        </Avatar>
      </Tooltip>
    ) : (
      <>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
          <Avatar
            sx={{
              width: 52,
              height: 52,
              bgcolor: 'rgba(255, 255, 255, 0.15)',
              border: '2px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <Task sx={{ fontSize: 28, color: 'white' }} />
          </Avatar>
          
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              style={{ flex: 1 }}
            >
              <Typography variant="h6" sx={{ 
                fontWeight: 700, 
                color: 'white', 
                fontSize: '1.1rem',
                lineHeight: 1.2
              }}>
                Task
              </Typography>
              <Typography variant="body2" sx={{ 
                color: 'rgba(255, 255, 255, 0.85)', 
                fontSize: '0.8rem' 
              }}>
                Management System
              </Typography>
              <Chip
                label={userRole.toUpperCase()}
                size="small"
                sx={{
                  mt: 0.5,
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontSize: '0.7rem',
                  height: 22,
                  fontWeight: 600
                }}
              />
            </motion.div>
          </AnimatePresence>
        </Box>

        <IconButton
          onClick={isMobile ? onClose : onToggle}
          sx={{
            color: 'white',
            bgcolor: 'rgba(255, 255, 255, 0.1)',
            width: 36,
            height: 36,
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              transform: 'rotate(90deg)'
            }
          }}
        >
          {isMobile ? <Close /> : <ChevronLeft />}
        </IconButton>
      </>
    )}
  </Box>
));

const MenuItem = React.memo(({ 
  item, 
  isChild = false, 
  isActive = false, 
  showText = true, 
  openSections = {}, 
  onToggleSection 
}) => {
  const shouldShowTooltip = !showText && !isChild;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Tooltip
        title={shouldShowTooltip ? item.title : ''}
        placement="right"
        arrow
        disableInteractive
      >
        <ListItem
          component={item.path ? NavLink : 'div'}
          to={item.path || undefined}
          onClick={item.hasSubmenu ? () => onToggleSection(item.id) : undefined}
          sx={getListItemStyles(isActive, isChild, showText)}
        >
          <ListItemIcon
            sx={{
              color: isActive ? 'white' : 'rgba(255, 255, 255, 0.85)',
              minWidth: showText ? 40 : 0,
              justifyContent: 'center',
              '& .MuiSvgIcon-root': {
                fontSize: isChild ? 20 : 24,
                transition: 'transform 0.2s ease',
              },
              '&:hover .MuiSvgIcon-root': {
                transform: 'scale(1.1)'
              }
            }}
          >
            {item.badge ? (
              <Badge
                badgeContent={item.badge}
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    bgcolor: '#ff4444',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    animation: 'pulse 2s infinite'
                  }
                }}
              >
                {item.icon}
              </Badge>
            ) : (
              item.icon
            )}
          </ListItemIcon>
          
          <AnimatePresence>
            {showText && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', alignItems: 'center', flex: 1 }}
              >
                <ListItemText
                  primary={item.title}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontSize: isChild ? '0.85rem' : '0.95rem',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? 'white' : 'rgba(255, 255, 255, 0.92)',
                      whiteSpace: 'nowrap'
                    }
                  }}
                />
                
                {item.hasSubmenu && (
                  <Box 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.7)',
                      transition: 'transform 0.2s ease',
                      transform: openSections[item.id] ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}
                  >
                    <ExpandMore />
                  </Box>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </ListItem>
      </Tooltip>
    </motion.div>
  );
});

const NavigationContent = React.memo(({ 
  menuItems, 
  bottomItems, 
  showText, 
  openSections, 
  onToggleSection,
  isActive,
  isExactActive 
}) => (
  <>
    <Box sx={{ flexGrow: 1, overflow: 'auto', py: 1 }}>
      <List component="nav">
        {menuItems.map((item, index) => (
          <React.Fragment key={item.id}>
            <MenuItem
              item={item}
              isActive={item.path ? isExactActive(item.path) : isActive([`/${item.id}`])}
              showText={showText}
              openSections={openSections}
              onToggleSection={onToggleSection}
            />
            
            {item.hasSubmenu && showText && (
              <AnimatePresence>
                {openSections[item.id] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Collapse in={openSections[item.id]} timeout={0}>
                      <List component="div" disablePadding>
                        {item.children?.map((child) => (
                          <MenuItem
                            key={child.path}
                            item={child}
                            isChild
                            isActive={isExactActive(child.path)}
                            showText={showText}
                          />
                        ))}
                      </List>
                    </Collapse>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </React.Fragment>
        ))}
      </List>
    </Box>

    <Box sx={{ 
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      background: 'rgba(0, 0, 0, 0.1)' 
    }}>
      <List sx={{ py: 1 }}>
        {bottomItems.map((item) => (
          <MenuItem
            key={item.id}
            item={item}
            isActive={isExactActive(item.path)}
            showText={showText}
          />
        ))}
      </List>
      
      {showText && (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ 
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.7rem' 
          }}>
            © 2025 TAM System v2.1.0
          </Typography>
          <Box sx={{ 
            mt: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: 1 
          }}>
            <Box sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: '#4caf50',
              animation: 'pulse 2s infinite'
            }} />
            <Typography variant="caption" sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.65rem' 
            }}>
              Online
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  </>
));

const MobileFAB = React.memo(({ onOpen, darkMode }) => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    style={{ 
      position: 'fixed', 
      top: 20, 
      left: 20, 
      zIndex: 1300,
      pointerEvents: 'auto'
    }}
  >
    <Fab
      size="medium"
      onClick={() => {
        console.log('FAB clicked'); // Debug log
        if (onOpen) onOpen();
      }}
      sx={{
        background: darkMode 
          ? 'linear-gradient(135deg, #2a3f6f 0%, #1a2752 100%)'
          : 'linear-gradient(135deg, #dc267f 0%, #b91c5c 100%)',
        color: 'white',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        '&:hover': {
          boxShadow: '0 12px 35px rgba(0, 0, 0, 0.4)',
          transform: 'translateY(-2px)'
        },
        '&:active': {
          transform: 'scale(0.95)'
        }
      }}
    >
      <Menu sx={{ fontSize: 24 }} />
    </Fab>
  </motion.div>
));

// Main Sidebar Component
const Sidebar = ({ 
  userRole = 'user', 
  open = false, 
  onClose, 
  collapsed = false, 
  onToggleCollapse, 
  darkMode = false,
  onOpen 
}) => {
  const location = useLocation();
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const { 
    isHovered, 
    setIsHovered, 
    openSections, 
    setOpenSections, 
    isExpanded 
  } = useSidebarState(collapsed, isMobile);

  // Event handlers
  const handleMouseEnter = useCallback(() => {
    if (!isMobile && collapsed) setIsHovered(true);
  }, [isMobile, collapsed]);

  const handleMouseLeave = useCallback(() => {
    if (!isMobile && collapsed) setIsHovered(false);
  }, [isMobile, collapsed]);

  const toggleSection = useCallback((section) => {
    if (isMobile || isExpanded) {
      setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    }
  }, [isMobile, isExpanded]);

  // Active path detection
  const isActive = useCallback((paths) => 
    paths.some(path => location.pathname.startsWith(path)), [location.pathname]);
  
  const isExactActive = useCallback((path) => 
    location.pathname === path, [location.pathname]);

  // Filter menu items by user role
  const filteredMenuItems = useMemo(() => 
    MENU_CONFIG.main.filter(item => item.roles.includes(userRole)), [userRole]);
  
  const filteredBottomItems = useMemo(() => 
    MENU_CONFIG.bottom.filter(item => item.roles.includes(userRole)), [userRole]);

  // Auto-expand sections based on current route
  useEffect(() => {
    const newOpenSections = {};
    filteredMenuItems.forEach(item => {
      if (item.hasSubmenu && item.children) {
        newOpenSections[item.id] = item.children.some(child => 
          location.pathname.startsWith(child.path)
        );
      }
    });
    setOpenSections(newOpenSections);
  }, [location, filteredMenuItems]);

  const breakpoint = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';
  const drawerStyles = getDrawerStyles(isExpanded, breakpoint, darkMode);

  // Mobile view
  if (isMobile) {
    return (
      <>
        {!open && <MobileFAB onOpen={onOpen} darkMode={darkMode} />}
        <Drawer
          variant="temporary"
          open={open}
          onClose={onClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            ...drawerStyles,
            '& .MuiDrawer-backdrop': {
              bgcolor: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(8px)'
            }
          }}
        >
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <LogoSection 
              isExpanded={true} 
              isMobile={true} 
              userRole={userRole}
              darkMode={darkMode}
              onClose={onClose} 
            />
            <NavigationContent
              menuItems={filteredMenuItems}
              bottomItems={filteredBottomItems}
              showText={true}
              openSections={openSections}
              onToggleSection={toggleSection}
              isActive={isActive}
              isExactActive={isExactActive}
            />
          </Box>
        </Drawer>
      </>
    );
  }

  // Desktop/Tablet view
  return (
    <motion.div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Drawer variant="permanent" sx={drawerStyles}>
        <LogoSection 
          isExpanded={isExpanded} 
          isMobile={false} 
          userRole={userRole}
          darkMode={darkMode}
          onToggle={onToggleCollapse} 
        />
        <NavigationContent
          menuItems={filteredMenuItems}
          bottomItems={filteredBottomItems}
          showText={isExpanded}
          openSections={openSections}
          onToggleSection={toggleSection}
          isActive={isActive}
          isExactActive={isExactActive}
        />
      </Drawer>
    </motion.div>
  );
};

export default React.memo(Sidebar);