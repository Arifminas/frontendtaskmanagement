// src/components/notifications/NotificationBell.jsx
import React, { useState } from 'react';
import { IconButton, Badge, Menu, MenuItem, ListItemText, Divider, Button } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';

export default function NotificationBell() {
  const { items, unread, markRead, markAllRead } = useNotifications();
  const [anchor, setAnchor] = useState(null);
  const open = Boolean(anchor);
  const navigate = useNavigate();

  return (
    <>
      <IconButton color="inherit" onClick={(e) => setAnchor(e.currentTarget)}>
        <Badge badgeContent={unread} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu anchorEl={anchor} open={open} onClose={() => setAnchor(null)} PaperProps={{ sx: { width: 360, maxHeight: 420 } }}>
        <MenuItem disableRipple>
          <ListItemText primary="Notifications" secondary={`${unread} unread`} />
          <Button size="small" onClick={markAllRead}>Mark all read</Button>
        </MenuItem>
        <Divider />
        {items.slice(0, 10).map(n => (
          <MenuItem
            key={n._id}
            dense
            onClick={() => {
              markRead(n._id);
              setAnchor(null);
              if (n.link) navigate(n.link);
            }}
            sx={{ opacity: n.read ? 0.6 : 1 }}
          >
            <ListItemText
              primary={n.title}
              secondary={n.message}
              primaryTypographyProps={{ fontWeight: n.read ? 400 : 700 }}
            />
          </MenuItem>
        ))}
        {items.length === 0 && <MenuItem disabled>No notifications</MenuItem>}
      </Menu>
    </>
  );
}

