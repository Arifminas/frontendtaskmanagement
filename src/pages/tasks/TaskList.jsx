import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Menu,
  useTheme,
  useMediaQuery,
  IconButton,
  Collapse,
  Fab,
  Tooltip,
  Avatar,
  Divider,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CardMedia,
  AvatarGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AppBar,
  Toolbar,
  FormControlLabel,
  Switch,
  Badge
} from '@mui/material';
import {
  Add as AddIcon,
  FilterList as FilterIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Comment as CommentIcon,
  Attachment as AttachmentIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Update as UpdateIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Download as DownloadIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  Group as GroupIcon,
  Menu as MenuIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  Sort as SortIcon,
  SortByAlpha as SortByAlphaIcon,
  AccessTime as AccessTimeIcon,
  DateRange as DateRangeIcon,
  Today as TodayIcon,
  FilterAlt as FilterAltIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchMyTasks, updateTaskStatus } from '../../Api/tasks';
import { useNavigate } from 'react-router-dom';
import { notifyError, notifySuccess } from '../../utils/notifications';
import TaskComments from './TaskComments';
import AttachmentModal from '../../components/common/AttachmentModal';
import RecommendedTasks from './RecommendedTasks';

// Helper function to render assignee avatars - Responsive
const AssigneeAvatars = ({ assignees, maxDisplay = 3, size = 'medium' }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const avatarSize = size === 'small' ? 24 : size === 'large' ? 40 : 32;
  const fontSize = size === 'small' ? '0.75rem' : size === 'large' ? '1rem' : '0.875rem';

  if (!assignees || assignees.length === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar sx={{ 
          width: avatarSize, 
          height: avatarSize, 
          backgroundColor: '#9e9e9e', 
          fontSize 
        }}>
          ?
        </Avatar>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            display: { xs: 'none', sm: 'block' }
          }}
        >
          Unassigned
        </Typography>
      </Box>
    );
  }

  if (assignees.length === 1) {
    const assignee = assignees[0];
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar sx={{ 
          width: avatarSize, 
          height: avatarSize, 
          backgroundColor: '#1a2752', 
          fontSize 
        }}>
          {assignee.name?.charAt(0) || 'U'}
        </Avatar>
        <Typography 
          variant="body2" 
          noWrap 
          sx={{ 
            maxWidth: 120,
            display: { xs: 'none', sm: 'block' }
          }}
        >
          {assignee.name || 'Unknown User'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <AvatarGroup 
        max={maxDisplay} 
        sx={{ 
          '& .MuiAvatar-root': { 
            width: avatarSize, 
            height: avatarSize, 
            fontSize,
            backgroundColor: '#1a2752',
            border: '2px solid white'
          }
        }}
      >
        {assignees.map((assignee, index) => (
          <Avatar key={assignee._id || index} title={assignee.name || 'Unknown User'}>
            {assignee.name?.charAt(0) || 'U'}
          </Avatar>
        ))}
      </AvatarGroup>
      <Typography 
        variant="body2" 
        sx={{ 
          ml: 1,
          display: { xs: 'none', sm: 'block' }
        }}
      >
        {assignees.length} assignee{assignees.length > 1 ? 's' : ''}
      </Typography>
    </Box>
  );
};

// Priority Badge Component - Responsive
const PriorityBadge = ({ priority, size = 'medium' }) => {
  const getColor = () => {
    switch (priority) {
      case 'high': return '#dc267f';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  return (
    <Chip
      label={priority}
      size={size === 'large' ? 'medium' : 'small'}
      sx={{
        backgroundColor: getColor(),
        color: 'white',
        fontWeight: 600,
        textTransform: 'capitalize',
        fontSize: size === 'large' ? '0.875rem' : '0.75rem',
        height: size === 'large' ? 32 : 24
      }}
    />
  );
};

// Status Badge Component - Responsive
const StatusBadge = ({ status, size = 'medium' }) => {
  const getColor = () => {
    switch (status) {
      case 'completed': return '#4caf50';
      case 'ongoing': return '#ff9800';
      case 'pending': return '#9e9e9e';
      default: return '#9e9e9e';
    }
  };

  return (
    <Chip
      label={status}
      size={size === 'large' ? 'medium' : 'small'}
      variant="outlined"
      sx={{
        borderColor: getColor(),
        color: getColor(),
        fontWeight: 600,
        textTransform: 'capitalize',
        fontSize: size === 'large' ? '0.875rem' : '0.75rem',
        height: size === 'large' ? 32 : 24
      }}
    />
  );
};

// Due Date Warning Component
const DueDateWarning = ({ dueDate, size = 'medium' }) => {
  if (!dueDate) return null;
  
  const due = new Date(dueDate);
  const now = new Date();
  const diffDays = (due - now) / (1000 * 60 * 60 * 24);

  if (diffDays < 0) {
    return (
      <Chip
        icon={<WarningIcon />}
        label="Overdue"
        size={size === 'large' ? 'medium' : 'small'}
        sx={{
          backgroundColor: '#dc267f',
          color: 'white',
          fontWeight: 600,
          ml: 1
        }}
      />
    );
  }
  
  if (diffDays <= 2) {
    return (
      <Chip
        icon={<ScheduleIcon />}
        label="Due Soon"
        size={size === 'large' ? 'medium' : 'small'}
        sx={{
          backgroundColor: '#ff9800',
          color: 'white',
          fontWeight: 600,
          ml: 1
        }}
      />
    );
  }
  
  return null;
};

// Last Updated Badge Component
const LastUpdatedBadge = ({ updatedAt, size = 'medium' }) => {
  if (!updatedAt) return null;

  const updated = new Date(updatedAt);
  const now = new Date();
  const diffHours = (now - updated) / (1000 * 60 * 60);
  const diffDays = diffHours / 24;

  let label = '';
  let color = '#9e9e9e';

  if (diffHours < 1) {
    label = 'Just updated';
    color = '#4caf50';
  } else if (diffHours < 24) {
    label = `${Math.floor(diffHours)}h ago`;
    color = '#ff9800';
  } else if (diffDays < 7) {
    label = `${Math.floor(diffDays)}d ago`;
    color = '#9e9e9e';
  } else {
    label = updated.toLocaleDateString();
    color = '#9e9e9e';
  }

  return (
    <Chip
      icon={<AccessTimeIcon />}
      label={label}
      size={size === 'large' ? 'medium' : 'small'}
      sx={{
        backgroundColor: color,
        color: 'white',
        fontWeight: 600,
        fontSize: size === 'large' ? '0.875rem' : '0.75rem',
        height: size === 'large' ? 32 : 24,
        ml: 1
      }}
    />
  );
};

// Responsive Task View Modal Component
const TaskViewModal = ({ open, onClose, task, onEdit }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const [imagePreview, setImagePreview] = useState(null);

  if (!task) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#4caf50';
      case 'ongoing': return '#ff9800';
      case 'pending': return '#9e9e9e';
      default: return '#9e9e9e';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#dc267f';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  const getFileIcon = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return <ImageIcon />;
    } else if (['pdf'].includes(extension)) {
      return <PdfIcon />;
    } else {
      return <DocIcon />;
    }
  };

  const isImage = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension);
  };

  const handleAttachmentClick = (attachment) => {
    const filename = attachment.split('/').pop();
    if (isImage(filename)) {
      setImagePreview(attachment);
    } else {
      window.open(attachment, '_blank');
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 3,
            maxHeight: isMobile ? '100vh' : '90vh',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)'
          }
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #1a2752 0%, #2a3f6f 100%)',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: isMobile ? 2 : 3,
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 1 : 0
          }}
        >
          <Box sx={{ textAlign: isMobile ? 'center' : 'left' }}>
            <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 700, mb: 0.5 }}>
              Task Details
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {task.title}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{
              color: 'white',
              position: isMobile ? 'absolute' : 'relative',
              top: isMobile ? 8 : 'auto',
              right: isMobile ? 8 : 'auto',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: isMobile ? 2 : 3, overflow: 'auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Header Info */}
            <Box sx={{ mb: 3 }}>
              <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 700, color: '#1a2752', mb: 2 }}>
                {task.title}
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                gap: 1, 
                flexWrap: 'wrap', 
                mb: 2,
                justifyContent: isMobile ? 'center' : 'flex-start'
              }}>
                <StatusBadge status={task.status} size={isMobile ? 'medium' : 'large'} />
                <PriorityBadge priority={task.priority} size={isMobile ? 'medium' : 'large'} />
                <LastUpdatedBadge updatedAt={task.updatedAt} size={isMobile ? 'medium' : 'large'} />
              </Box>

              {task.description && (
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {task.description}
                </Typography>
              )}
            </Box>

            {/* Progress Section */}
            <Paper
              elevation={1}
              sx={{
                p: isMobile ? 2 : 3,
                mb: 3,
                borderRadius: 2,
                border: '1px solid rgba(26, 39, 82, 0.1)'
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a2752', mb: 2 }}>
                Progress: {task.progress || 0}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={task.progress || 0}
                sx={{
                  height: isMobile ? 8 : 12,
                  borderRadius: 6,
                  backgroundColor: 'rgba(26, 39, 82, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 6,
                    background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)'
                  }
                }}
              />
            </Paper>

            {/* Assignment Details */}
            <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a2752', mb: 1 }}>
                  <BusinessIcon sx={{ mr: 1, fontSize: 20 }} />
                  Department
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {task.department?.name || 'Not specified'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a2752', mb: 1 }}>
                  <GroupIcon sx={{ mr: 1, fontSize: 20 }} />
                  Assignees ({task.assignees?.length || 0})
                </Typography>
                <AssigneeAvatars assignees={task.assignees} maxDisplay={isMobile ? 3 : 5} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a2752', mb: 1 }}>
                  <CalendarIcon sx={{ mr: 1, fontSize: 20 }} />
                  Due Date
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="body1" color="text.secondary">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date set'}
                  </Typography>
                  <DueDateWarning dueDate={task.dueDate} />
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a2752', mb: 1 }}>
                  <AccessTimeIcon sx={{ mr: 1, fontSize: 20 }} />
                  Last Updated
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {task.updatedAt ? new Date(task.updatedAt).toLocaleString() : 'Not available'}
                </Typography>
              </Grid>
            </Grid>

            {/* Attachments */}
            {task.attachments && task.attachments.length > 0 && (
              <Paper
                elevation={1}
                sx={{
                  p: isMobile ? 2 : 3,
                  borderRadius: 2,
                  border: '1px solid rgba(26, 39, 82, 0.1)'
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a2752', mb: 2 }}>
                  Attachments ({task.attachments.length})
                </Typography>
                
                <Grid container spacing={2}>
                  {task.attachments.map((attachment, index) => {
                    const filename = attachment.split('/').pop();
                    const isImg = isImage(filename);
                    
                    return (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card
                          sx={{
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 20px rgba(26, 39, 82, 0.15)'
                            }
                          }}
                          onClick={() => handleAttachmentClick(attachment)}
                        >
                          {isImg ? (
                            <CardMedia
                              component="img"
                              height={isMobile ? "100" : "120"}
                              image={attachment}
                              alt={filename}
                              sx={{ objectFit: 'cover' }}
                            />
                          ) : (
                            <Box
                              sx={{
                                height: isMobile ? 100 : 120,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'rgba(26, 39, 82, 0.04)'
                              }}
                            >
                              {getFileIcon(filename)}
                            </Box>
                          )}
                          <CardContent sx={{ p: 1.5 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                fontSize: isMobile ? '0.75rem' : '0.875rem'
                              }}
                              title={filename}
                            >
                              {filename}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Paper>
            )}
          </motion.div>
        </DialogContent>

        <DialogActions sx={{ 
          p: isMobile ? 2 : 3, 
          justifyContent: 'space-between',
          flexDirection: isMobile ? 'column-reverse' : 'row',
          gap: isMobile ? 1 : 0
        }}>
          <Button
            onClick={onClose}
            variant="outlined"
            fullWidth={isMobile}
            sx={{
              borderColor: '#1a2752',
              color: '#1a2752',
              '&:hover': {
                borderColor: '#dc267f',
                color: '#dc267f'
              }
            }}
          >
            Close
          </Button>
          
          {task.status !== 'completed' && (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => onEdit(task._id)}
              fullWidth={isMobile}
              sx={{
                backgroundColor: '#dc267f',
                '&:hover': {
                  backgroundColor: '#b91c5c'
                }
              }}
            >
              Edit Task
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog
        open={!!imagePreview}
        onClose={() => setImagePreview(null)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: { backgroundColor: 'rgba(0, 0, 0, 0.9)' }
        }}
      >
        <DialogContent sx={{ p: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              style={{
                maxWidth: '100%',
                maxHeight: isMobile ? '90vh' : '80vh',
                objectFit: 'contain'
              }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}>
          <Button
            onClick={() => setImagePreview(null)}
            sx={{ color: 'white' }}
          >
            Close
          </Button>
          <Button
            href={imagePreview}
            download
            target="_blank"
            startIcon={<DownloadIcon />}
            sx={{ color: 'white' }}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// Enhanced Mobile Task Card Component
const TaskCard = ({ task, onEdit, onStatusUpdate, onViewAttachments, onToggleComments, onViewTask, showComments }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const isSmallMobile = useMediaQuery(theme.breakpoints.down(400));

  const handleStatusMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleStatusMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = (status) => {
    onStatusUpdate(task._id, status);
    handleStatusMenuClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          mb: 2,
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(26, 39, 82, 0.1)',
          border: '1px solid rgba(26, 39, 82, 0.1)',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(26, 39, 82, 0.15)',
            transform: 'translateY(-2px)',
          },
          transition: 'all 0.3s ease'
        }}
      >
        <CardContent sx={{ pb: 1, p: isSmallMobile ? 1.5 : 2 }}>
          {/* Header */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start', 
            mb: 2,
            flexDirection: isSmallMobile ? 'column' : 'row',
            gap: isSmallMobile ? 1 : 0
          }}>
            <Typography 
              variant={isSmallMobile ? "subtitle1" : "h6"} 
              sx={{ 
                fontWeight: 700, 
                color: '#1a2752', 
                flexGrow: 1,
                lineHeight: 1.3,
                wordBreak: 'break-word'
              }}
            >
              {task.title}
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              gap: 0.5, 
              flexWrap: 'wrap',
              justifyContent: isSmallMobile ? 'flex-start' : 'flex-end',
              width: isSmallMobile ? '100%' : 'auto'
            }}>
              <StatusBadge status={task.status} size="small" />
              <PriorityBadge priority={task.priority} size="small" />
              <LastUpdatedBadge updatedAt={task.updatedAt} size="small" />
            </Box>
          </Box>

          {/* Description */}
          {task.description && (
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: isSmallMobile ? 2 : 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {task.description}
            </Typography>
          )}

          {/* Progress */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Progress</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{task.progress || 0}%</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={task.progress || 0}
              sx={{
                height: isSmallMobile ? 6 : 8,
                borderRadius: 4,
                backgroundColor: 'rgba(26, 39, 82, 0.1)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  backgroundColor: '#4caf50'
                }
              }}
            />
          </Box>

          {/* Details Grid */}
          <Grid container spacing={isSmallMobile ? 1 : 2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BusinessIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary" noWrap>
                  {task.department?.name || 'N/A'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <GroupIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary" noWrap>
                  {task.assignees?.length ? `${task.assignees.length} assignee(s)` : 'Unassigned'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <CalendarIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                </Typography>
                <DueDateWarning dueDate={task.dueDate} size="small" />
              </Box>
            </Grid>
            {/* Last Updated Row */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  Updated: {task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : 'N/A'}
                </Typography>
              </Box>
            </Grid>
            {/* Assignees Row */}
            <Grid item xs={12}>
              <AssigneeAvatars assignees={task.assignees} maxDisplay={isSmallMobile ? 2 : 3} size="small" />
            </Grid>
          </Grid>
        </CardContent>

        {/* Actions */}
        <CardActions sx={{ 
          px: isSmallMobile ? 1.5 : 2, 
          pb: isSmallMobile ? 1.5 : 2, 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          gap: 1,
          flexDirection: isSmallMobile ? 'column' : 'row'
        }}>
          <Box sx={{ 
            display: 'flex', 
            gap: 0.5, 
            flexWrap: 'wrap',
            width: isSmallMobile ? '100%' : 'auto',
            justifyContent: isSmallMobile ? 'space-around' : 'flex-start'
          }}>
            <Button
              size="small"
              variant="contained"
              startIcon={!isSmallMobile && <ViewIcon />}
              onClick={() => onViewTask(task)}
              sx={{
                backgroundColor: '#1a2752',
                color: 'white',
                minWidth: isSmallMobile ? '60px' : 'auto',
                fontSize: isSmallMobile ? '0.75rem' : '0.875rem',
                '&:hover': {
                  backgroundColor: '#0f1a3a'
                }
              }}
            >
              {isSmallMobile ? 'View' : 'View'}
            </Button>
            
            <Button
              size="small"
              variant="outlined"
              startIcon={!isSmallMobile && <EditIcon />}
              onClick={() => onEdit(task._id)}
              disabled={task.status === 'completed'}
              sx={{
                borderColor: '#1a2752',
                color: '#1a2752',
                minWidth: isSmallMobile ? '60px' : 'auto',
                fontSize: isSmallMobile ? '0.75rem' : '0.875rem',
                '&:hover': {
                  borderColor: '#dc267f',
                  color: '#dc267f',
                  backgroundColor: 'rgba(220, 38, 127, 0.04)'
                }
              }}
            >
              {isSmallMobile ? 'Edit' : 'Edit'}
            </Button>

            <Button
              size="small"
              variant="outlined"
              startIcon={!isSmallMobile && <UpdateIcon />}
              onClick={handleStatusMenuOpen}
              disabled={task.status === 'completed'}
              sx={{
                borderColor: '#1a2752',
                color: '#1a2752',
                minWidth: isSmallMobile ? '70px' : 'auto',
                fontSize: isSmallMobile ? '0.75rem' : '0.875rem',
                '&:hover': {
                  borderColor: '#dc267f',
                  color: '#dc267f',
                  backgroundColor: 'rgba(220, 38, 127, 0.04)'
                }
              }}
            >
              {isSmallMobile ? 'Status' : 'Status'}
            </Button>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleStatusMenuClose}
            >
              <MenuItem onClick={() => handleStatusChange('pending')}>Pending</MenuItem>
              <MenuItem onClick={() => handleStatusChange('ongoing')}>Ongoing</MenuItem>
              <MenuItem onClick={() => handleStatusChange('completed')}>Completed</MenuItem>
            </Menu>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            gap: 0.5,
            width: isSmallMobile ? '100%' : 'auto',
            justifyContent: isSmallMobile ? 'center' : 'flex-end'
          }}>
            <IconButton
              size="small"
              onClick={() => onViewAttachments(task.attachments)}
              sx={{ color: '#1a2752' }}
            >
              <AttachmentIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onToggleComments(task._id)}
              sx={{ color: showComments ? '#dc267f' : '#1a2752' }}
            >
              <CommentIcon />
            </IconButton>
          </Box>
        </CardActions>

        {/* Comments Section */}
        <Collapse in={showComments} timeout="auto" unmountOnExit>
          <Divider />
          <Box sx={{ p: isSmallMobile ? 1.5 : 2 }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#1a2752' }}>Comments</Typography>
            <TaskComments taskId={task._id} />
          </Box>
        </Collapse>
      </Card>
    </motion.div>
  );
};

// Responsive Header Component
const ResponsiveHeader = ({ 
  searchQuery, 
  setSearchQuery, 
  showFilters, 
  setShowFilters, 
  navigate,
  filteredTasksCount,
  totalTasksCount,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Paper
        elevation={2}
        sx={{
          p: isMobile ? 2 : 3,
          mb: 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #1a2752 0%, #2a3f6f 100%)',
          color: 'white'
        }}
      >
        {/* Mobile Header */}
        {isMobile ? (
          <Box>
            {/* Title Section */}
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                My Tasks
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                Manage and track your assigned tasks
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {filteredTasksCount} of {totalTasksCount} tasks
              </Typography>
            </Box>

            {/* Search Bar */}
            <Box sx={{ mb: 2 }}>
              <TextField
                size="small"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)', mr: 1 }} />
                  ),
                  endAdornment: searchQuery && (
                    <IconButton
                      size="small"
                      onClick={() => setSearchQuery('')}
                      sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  ),
                  sx: {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      border: '1px solid rgba(255, 255, 255, 0.5)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      border: '2px solid #dc267f',
                    },
                    '& .MuiInputBase-input': {
                      color: 'white',
                      '&::placeholder': {
                        color: 'rgba(255, 255, 255, 0.7)',
                        opacity: 1,
                      },
                    },
                  }
                }}
              />
            </Box>

            {/* Sort Controls Mobile */}
            <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => setSortBy(e.target.value)}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      border: '1px solid rgba(255, 255, 255, 0.5)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      border: '2px solid #dc267f',
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'white',
                    },
                  }}
                >
                  <MenuItem value="updatedAt">Last Updated</MenuItem>
                  <MenuItem value="createdAt">Created Date</MenuItem>
                  <MenuItem value="dueDate">Due Date</MenuItem>
                  <MenuItem value="priority">Priority</MenuItem>
                  <MenuItem value="status">Status</MenuItem>
                  <MenuItem value="title">Title</MenuItem>
                </Select>
              </FormControl>
              
              <IconButton
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                sx={{
                  color: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  },
                }}
              >
                <SortIcon sx={{ transform: sortOrder === 'desc' ? 'rotate(180deg)' : 'none' }} />
              </IconButton>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between', alignItems: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => setShowFilters(!showFilters)}
                size="small"
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': {
                    borderColor: '#dc267f',
                    backgroundColor: 'rgba(220, 38, 127, 0.1)'
                  }
                }}
              >
                Filters
              </Button>
              
              <Fab
                color="primary"
                size="medium"
                onClick={() => navigate('/tasks/create')}
                sx={{
                  backgroundColor: '#dc267f',
                  '&:hover': { backgroundColor: '#b91c5c' }
                }}
              >
                <AddIcon />
              </Fab>
            </Box>
          </Box>
        ) : (
          /* Desktop/Tablet Header */
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                My Tasks
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mb: 0.5 }}>
                Manage and track your assigned tasks
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Showing {filteredTasksCount} of {totalTasksCount} tasks
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Search Bar */}
              <Box sx={{ display: 'flex', alignItems: 'center', minWidth: isTablet ? '200px' : '250px' }}>
                <TextField
                  size="small"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)', mr: 1 }} />
                    ),
                    endAdornment: searchQuery && (
                      <IconButton
                        size="small"
                        onClick={() => setSearchQuery('')}
                        sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    ),
                    sx: {
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      borderRadius: 2,
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        border: '1px solid rgba(255, 255, 255, 0.5)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        border: '2px solid #dc267f',
                      },
                      '& .MuiInputBase-input': {
                        color: 'white',
                        '&::placeholder': {
                          color: 'rgba(255, 255, 255, 0.7)',
                          opacity: 1,
                        },
                      },
                    }
                  }}
                />
              </Box>

              {/* Sort Controls Desktop */}
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    label="Sort By"
                    onChange={(e) => setSortBy(e.target.value)}
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        border: '1px solid rgba(255, 255, 255, 0.5)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        border: '2px solid #dc267f',
                      },
                      '& .MuiSvgIcon-root': {
                        color: 'white',
                      },
                    }}
                  >
                    <MenuItem value="updatedAt">Last Updated</MenuItem>
                    <MenuItem value="createdAt">Created Date</MenuItem>
                    <MenuItem value="dueDate">Due Date</MenuItem>
                    <MenuItem value="priority">Priority</MenuItem>
                    <MenuItem value="status">Status</MenuItem>
                    <MenuItem value="title">Title</MenuItem>
                  </Select>
                </FormControl>
                
                <IconButton
                  onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                  sx={{
                    color: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.25)',
                    },
                  }}
                >
                  <SortIcon sx={{ transform: sortOrder === 'desc' ? 'rotate(180deg)' : 'none' }} />
                </IconButton>
              </Box>
              
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => setShowFilters(!showFilters)}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': {
                    borderColor: '#dc267f',
                    backgroundColor: 'rgba(220, 38, 127, 0.1)'
                  }
                }}
              >
                Filters
              </Button>
              
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/tasks/create')}
                sx={{
                  backgroundColor: '#dc267f',
                  '&:hover': { backgroundColor: '#b91c5c' },
                  fontWeight: 600
                }}
              >
                Create Task
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </motion.div>
  );
};

// Responsive Filters Component with Date Range
const ResponsiveFilters = ({ 
  showFilters, 
  statusFilter, 
  setStatusFilter, 
  priorityFilter, 
  setPriorityFilter,
  searchQuery,
  setSearchQuery,
  filteredTasksCount,
  totalTasksCount,
  dateFilter,
  setDateFilter,
  dateRangeStart,
  setDateRangeStart,
  dateRangeEnd,
  setDateRangeEnd
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getActiveFiltersCount = () => {
    let count = 0;
    if (statusFilter) count++;
    if (priorityFilter) count++;
    if (dateFilter && dateFilter !== 'all') count++;
    if (searchQuery) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Collapse in={showFilters}>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        transition={{ duration: 0.3 }}
      >
        <Paper
          elevation={1}
          sx={{
            p: isMobile ? 2 : 3,
            mb: 3,
            borderRadius: 2,
            border: '1px solid rgba(26, 39, 82, 0.1)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterAltIcon sx={{ mr: 1, color: '#1a2752' }} />
            <Typography variant="h6" sx={{ color: '#1a2752', fontWeight: 600 }}>
              Filters
            </Typography>
            {activeFiltersCount > 0 && (
              <Badge 
                badgeContent={activeFiltersCount} 
                color="primary" 
                sx={{ 
                  ml: 1,
                  '& .MuiBadge-badge': {
                    backgroundColor: '#dc267f'
                  }
                }}
              >
                <Box />
              </Badge>
            )}
          </Box>

          <Grid container spacing={isMobile ? 2 : 3}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#dc267f'
                    }
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="ongoing">Ongoing</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={priorityFilter}
                  label="Priority"
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  sx={{
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#dc267f'
                    }
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Date Filter</InputLabel>
                <Select
                  value={dateFilter}
                  label="Date Filter"
                  onChange={(e) => setDateFilter(e.target.value)}
                  sx={{
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#dc267f'
                    }
                  }}
                >
                  <MenuItem value="all">All Dates</MenuItem>
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="yesterday">Yesterday</MenuItem>
                  <MenuItem value="thisWeek">This Week</MenuItem>
                  <MenuItem value="lastWeek">Last Week</MenuItem>
                  <MenuItem value="thisMonth">This Month</MenuItem>
                  <MenuItem value="lastMonth">Last Month</MenuItem>
                  <MenuItem value="custom">Custom Range</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Custom Date Range */}
            {dateFilter === 'custom' && (
              <>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Start Date"
                    value={dateRangeStart}
                    onChange={(e) => setDateRangeStart(e.target.value)}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    sx={{
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#dc267f'
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    type="date"
                    label="End Date"
                    value={dateRangeEnd}
                    onChange={(e) => setDateRangeEnd(e.target.value)}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    sx={{
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#dc267f'
                      }
                    }}
                  />
                </Grid>
              </>
            )}

            {/* Search Results Info and Actions */}
            <Grid item xs={12}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2, 
                flexWrap: 'wrap',
                justifyContent: 'space-between'
              }}>
                <Typography variant="body2" color="text.secondary">
                  Showing {filteredTasksCount} of {totalTasksCount} tasks
                </Typography>
                
                {activeFiltersCount > 0 && (
                  <Button
                    size="small"
                    onClick={() => {
                      setStatusFilter('');
                      setPriorityFilter('');
                      setSearchQuery('');
                      setDateFilter('all');
                      setDateRangeStart('');
                      setDateRangeEnd('');
                    }}
                    sx={{
                      color: '#dc267f',
                      textTransform: 'none',
                      fontWeight: 600,
                      minWidth: 'auto',
                      '&:hover': {
                        backgroundColor: 'rgba(220, 38, 127, 0.04)'
                      }
                    }}
                  >
                    Clear All Filters ({activeFiltersCount})
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </motion.div>
    </Collapse>
  );
};

// Main TaskList Component with Enhanced Sorting and Filtering
const TaskList = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState([]);
  const [visibleCommentsTaskId, setVisibleCommentsTaskId] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewMode, setViewMode] = useState(isMobile ? 'card' : 'table');
  
  // New sorting and date filtering states
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [dateFilter, setDateFilter] = useState('all');
  const [dateRangeStart, setDateRangeStart] = useState('');
  const [dateRangeEnd, setDateRangeEnd] = useState('');

  // Load tasks function with proper error handling
  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      console.log('📡 Loading tasks...');
      const data = await fetchMyTasks();
      setTasks(data || []);
      setError('');
      console.log('✅ Tasks loaded successfully:', data?.length || 0, 'tasks');
    } catch (err) {
      console.error('❌ Failed to load tasks:', err);
      
      if (err.response?.status === 429) {
        setError('Too many requests. Please wait a moment and try again.');
      } else {
        setError('Failed to load tasks. Please try again.');
        notifyError('Failed to load tasks');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Load tasks on component mount
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Update view mode based on screen size
  useEffect(() => {
    if (isMobile) {
      setViewMode('card');
    }
  }, [isMobile]);

  const handleViewAttachments = (attachments) => {
    setSelectedAttachments(attachments || []);
    setShowAttachmentModal(true);
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    const task = tasks.find(t => t._id === taskId);
    if (task.status === 'completed') {
      notifyError('Cannot update status of a completed task');
      return;
    }
    if (task.status === newStatus) {
      notifyError(`Task is already "${newStatus}"`);
      return;
    }
    try {
      await updateTaskStatus(taskId, newStatus);
      notifySuccess(`Task status updated to "${newStatus}"`);
      loadTasks(); // Reload tasks after status update
    } catch {
      notifyError('Failed to update task status');
    }
  };

  const handleEdit = (taskId) => {
    const task = tasks.find(t => t._id === taskId);
    if (task.status === 'completed') {
      notifyError('Completed tasks cannot be edited');
    } else {
      navigate(`/tasks/edit/${taskId}`);
    }
  };

  const handleToggleComments = (taskId) => {
    setVisibleCommentsTaskId(prev => prev === taskId ? null : taskId);
  };

  const handleViewTask = (task) => {
    setSelectedTask(task);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedTask(null);
  };

  const handleEditFromModal = (taskId) => {
    handleCloseViewModal();
    navigate(`/tasks/edit/${taskId}`);
  };

  // Date filtering helper function
  const isWithinDateRange = (taskDate, filterType) => {
    if (!taskDate) return filterType === 'all';
    
    const date = new Date(taskDate);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    switch (filterType) {
      case 'all':
        return true;
      case 'today':
        return date >= today;
      case 'yesterday':
        return date >= yesterday && date < today;
      case 'thisWeek':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return date >= weekStart;
      case 'lastWeek':
        const lastWeekStart = new Date(today);
        lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
        const lastWeekEnd = new Date(today);
        lastWeekEnd.setDate(today.getDate() - today.getDay() - 1);
        return date >= lastWeekStart && date <= lastWeekEnd;
      case 'thisMonth':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return date >= monthStart;
      case 'lastMonth':
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        return date >= lastMonthStart && date <= lastMonthEnd;
      case 'custom':
        if (!dateRangeStart && !dateRangeEnd) return true;
        const startDate = dateRangeStart ? new Date(dateRangeStart) : new Date(0);
        const endDate = dateRangeEnd ? new Date(dateRangeEnd) : new Date();
        return date >= startDate && date <= endDate;
      default:
        return true;
    }
  };

  // Sorting helper function
  const sortTasks = (tasksToSort) => {
    return [...tasksToSort].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'updatedAt':
        case 'createdAt':
        case 'dueDate':
          aValue = a[sortBy] ? new Date(a[sortBy]) : new Date(0);
          bValue = b[sortBy] ? new Date(b[sortBy]) : new Date(0);
          break;
        case 'title':
          aValue = (a.title || '').toLowerCase();
          bValue = (b.title || '').toLowerCase();
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority] || 0;
          bValue = priorityOrder[b.priority] || 0;
          break;
        case 'status':
          const statusOrder = { pending: 1, ongoing: 2, completed: 3 };
          aValue = statusOrder[a.status] || 0;
          bValue = statusOrder[b.status] || 0;
          break;
        default:
          aValue = a[sortBy] || '';
          bValue = b[sortBy] || '';
      }

      if (sortOrder === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
    });
  };

  // Apply filters, date filtering, and search
  const filteredTasks = sortTasks(
    tasks.filter(task => {
      // Status filter
      if (statusFilter && task.status !== statusFilter) return false;
      
      // Priority filter
      if (priorityFilter && task.priority !== priorityFilter) return false;
      
      // Date filter (based on updatedAt)
      if (!isWithinDateRange(task.updatedAt, dateFilter)) return false;
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title?.toLowerCase().includes(query);
        const matchesDescription = task.description?.toLowerCase().includes(query);
        const matchesAssignees = task.assignees?.some(assignee => 
          assignee.name?.toLowerCase().includes(query) ||
          assignee.email?.toLowerCase().includes(query)
        );
        const matchesDepartment = task.department?.name?.toLowerCase().includes(query);
        
        if (!matchesTitle && !matchesDescription && !matchesAssignees && !matchesDepartment) {
          return false;
        }
      }
      
      return true;
    })
  );

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (loading) {
    return (
      <Container sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh',
        px: isMobile ? 2 : 3
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ color: '#1a2752' }} />
          <Typography variant="body1" sx={{ mt: 2, color: '#1a2752' }}>
            Loading tasks...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 3, px: isMobile ? 2 : 3 }}>
        <Alert 
          severity="error" 
          sx={{ borderRadius: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={loadTasks}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container 
      maxWidth="xl" 
      sx={{ 
        py: isMobile ? 2 : 3,
        px: isMobile ? 1 : 3
      }}
    >
      {/* Responsive Header */}
      <ResponsiveHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        navigate={navigate}
        filteredTasksCount={filteredTasks.length}
        totalTasksCount={tasks.length}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />

      {/* Responsive Filters */}
      <ResponsiveFilters
        showFilters={showFilters}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredTasksCount={filteredTasks.length}
        totalTasksCount={tasks.length}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        dateRangeStart={dateRangeStart}
        setDateRangeStart={setDateRangeStart}
        dateRangeEnd={dateRangeEnd}
        setDateRangeEnd={setDateRangeEnd}
      />

      {/* View Mode Toggle for Desktop/Tablet */}
      {!isMobile && (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant={viewMode === 'card' ? 'contained' : 'outlined'}
            startIcon={<ViewModuleIcon />}
            onClick={() => setViewMode('card')}
            size="small"
            sx={{ 
              mr: 1,
              backgroundColor: viewMode === 'card' ? '#1a2752' : 'transparent',
              borderColor: '#1a2752',
              color: viewMode === 'card' ? 'white' : '#1a2752',
              '&:hover': {
                backgroundColor: viewMode === 'card' ? '#0f1a3a' : 'rgba(26, 39, 82, 0.04)'
              }
            }}
          >
            Card
          </Button>
          <Button
            variant={viewMode === 'table' ? 'contained' : 'outlined'}
            startIcon={<ViewListIcon />}
            onClick={() => setViewMode('table')}
            size="small"
            sx={{
              backgroundColor: viewMode === 'table' ? '#1a2752' : 'transparent',
              borderColor: '#1a2752',
              color: viewMode === 'table' ? 'white' : '#1a2752',
              '&:hover': {
                backgroundColor: viewMode === 'table' ? '#0f1a3a' : 'rgba(26, 39, 82, 0.04)'
              }
            }}
          >
            Table
          </Button>
        </Box>
      )}

      {/* Content */}
      {filteredTasks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            sx={{
              p: isMobile ? 4 : 6,
              textAlign: 'center',
              borderRadius: 3,
              border: '2px dashed rgba(26, 39, 82, 0.2)',
              mx: isMobile ? 1 : 0
            }}
          >
            <CheckCircleIcon sx={{ fontSize: isMobile ? 48 : 64, color: 'rgba(26, 39, 82, 0.3)', mb: 2 }} />
            <Typography variant={isMobile ? "h6" : "h5"} sx={{ color: '#1a2752', fontWeight: 600, mb: 1 }}>
              No tasks found
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3, px: isMobile ? 2 : 0 }}>
              {statusFilter || priorityFilter || searchQuery || dateFilter !== 'all'
                ? 'No tasks match your current filters or search criteria.' 
                : 'You don\'t have any tasks assigned yet.'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/tasks/create')}
              fullWidth={isMobile}
              sx={{
                backgroundColor: '#dc267f',
                '&:hover': { backgroundColor: '#b91c5c' },
                maxWidth: isMobile ? '100%' : '250px'
              }}
            >
              Create Your First Task
            </Button>
          </Paper>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {isMobile || viewMode === 'card' ? (
            // Card View (Mobile + Desktop Card Mode)
            <Grid container spacing={isMobile ? 2 : 3}>
              {filteredTasks.map(task => (
                <Grid item xs={12} sm={6} lg={4} xl={3} key={task._id}>
                  <TaskCard
                    task={task}
                    onEdit={handleEdit}
                    onStatusUpdate={handleStatusUpdate}
                    onViewAttachments={handleViewAttachments}
                    onToggleComments={handleToggleComments}
                    onViewTask={handleViewTask}
                    showComments={visibleCommentsTaskId === task._id}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            // Desktop Table View
            <TableContainer
              component={Paper}
              sx={{
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(26, 39, 82, 0.1)',
                border: '1px solid rgba(26, 39, 82, 0.1)',
                overflowX: 'auto'
              }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'rgba(26, 39, 82, 0.04)' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#1a2752', minWidth: 200 }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1a2752', minWidth: 100 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1a2752', minWidth: 100 }}>Priority</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1a2752', minWidth: 150 }}>Progress</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1a2752', minWidth: 180 }}>Assignees</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1a2752', minWidth: 120 }}>Due Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1a2752', minWidth: 140 }}>Last Updated</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1a2752', minWidth: 220 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTasks.map(task => {
                    const TaskRowWithMenu = () => {
                      const [statusMenuAnchor, setStatusMenuAnchor] = useState(null);

                      const handleStatusMenuOpen = (event) => {
                        setStatusMenuAnchor(event.currentTarget);
                      };

                      const handleStatusMenuClose = () => {
                        setStatusMenuAnchor(null);
                      };

                      const handleStatusChange = (status) => {
                        handleStatusUpdate(task._id, status);
                        handleStatusMenuClose();
                      };

                      return (
                        <React.Fragment>
                          <TableRow
                            hover
                            sx={{
                              '&:hover': {
                                backgroundColor: 'rgba(26, 39, 82, 0.02)'
                              }
                            }}
                          >
                            <TableCell>
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a2752' }}>
                                  {task.title}
                                </Typography>
                                {task.description && (
                                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                    {task.description.length > 50 
                                      ? `${task.description.substring(0, 50)}...` 
                                      : task.description}
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={task.status} />
                            </TableCell>
                            <TableCell>
                              <PriorityBadge priority={task.priority} />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ minWidth: 120 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {task.progress || 0}%
                                  </Typography>
                                </Box>
                                <LinearProgress
                                  variant="determinate"
                                  value={task.progress || 0}
                                  sx={{
                                    height: 6,
                                    borderRadius: 3,
                                    backgroundColor: 'rgba(26, 39, 82, 0.1)',
                                    '& .MuiLinearProgress-bar': {
                                      borderRadius: 3,
                                      backgroundColor: '#4caf50'
                                    }
                                  }}
                                />
                              </Box>
                            </TableCell>
                            <TableCell>
                              <AssigneeAvatars assignees={task.assignees} maxDisplay={2} />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                <Typography variant="body2">
                                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                                </Typography>
                                <DueDateWarning dueDate={task.dueDate} />
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                <Typography variant="body2">
                                  {task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : 'N/A'}
                                </Typography>
                                <LastUpdatedBadge updatedAt={task.updatedAt} size="small" />
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                                <Tooltip title="View Task Details">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleViewTask(task)}
                                    sx={{ color: '#1a2752' }}
                                  >
                                    <ViewIcon />
                                  </IconButton>
                                </Tooltip>
                                
                                <Tooltip title="Edit Task">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleEdit(task._id)}
                                    disabled={task.status === 'completed'}
                                    sx={{ color: '#1a2752' }}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>

                                <Tooltip title="Update Status">
                                  <IconButton
                                    size="small"
                                    onClick={handleStatusMenuOpen}
                                    disabled={task.status === 'completed'}
                                    sx={{ color: '#1a2752' }}
                                  >
                                    <UpdateIcon />
                                  </IconButton>
                                </Tooltip>

                                <Menu
                                  anchorEl={statusMenuAnchor}
                                  open={Boolean(statusMenuAnchor)}
                                  onClose={handleStatusMenuClose}
                                  PaperProps={{
                                    sx: {
                                      borderRadius: 2,
                                      border: '1px solid rgba(26, 39, 82, 0.1)',
                                      boxShadow: '0 8px 32px rgba(26, 39, 82, 0.15)'
                                    }
                                  }}
                                >
                                  <MenuItem 
                                    onClick={() => handleStatusChange('pending')}
                                    disabled={task.status === 'pending'}
                                  >
                                    Pending
                                  </MenuItem>
                                  <MenuItem 
                                    onClick={() => handleStatusChange('ongoing')}
                                    disabled={task.status === 'ongoing'}
                                  >
                                    Ongoing
                                  </MenuItem>
                                  <MenuItem 
                                    onClick={() => handleStatusChange('completed')}
                                    disabled={task.status === 'completed'}
                                  >
                                    Completed
                                  </MenuItem>
                                </Menu>
                                
                                <Tooltip title="View Attachments">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleViewAttachments(task.attachments)}
                                    sx={{ color: '#1a2752' }}
                                  >
                                    <AttachmentIcon />
                                  </IconButton>
                                </Tooltip>
                                
                                <Tooltip title="Toggle Comments">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleToggleComments(task._id)}
                                    sx={{ color: visibleCommentsTaskId === task._id ? '#dc267f' : '#1a2752' }}
                                  >
                                    {visibleCommentsTaskId === task._id ? <ExpandLessIcon /> : <CommentIcon />}
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                          </TableRow>
                          
                          {/* Comments Row */}
                          {visibleCommentsTaskId === task._id && (
                            <TableRow>
                              <TableCell colSpan={8} sx={{ backgroundColor: 'rgba(26, 39, 82, 0.02)' }}>
                                <Collapse in={visibleCommentsTaskId === task._id} timeout="auto">
                                  <Box sx={{ py: 2 }}>
                                    <Typography variant="h6" sx={{ mb: 2, color: '#1a2752' }}>
                                      Comments
                                    </Typography>
                                    <TaskComments taskId={task._id} />
                                  </Box>
                                </Collapse>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    };

                    return <TaskRowWithMenu key={task._id} />;
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </motion.div>
      )}

      {/* Attachment Modal */}
      <AttachmentModal
        show={showAttachmentModal}
        onHide={() => setShowAttachmentModal(false)}
        attachments={selectedAttachments}
      />

      {/* Task View Modal */}
      <TaskViewModal
        open={showViewModal}
        onClose={handleCloseViewModal}
        onEdit={handleEditFromModal}
        task={selectedTask}
      />

      {/* Recommended Tasks Component */}
      <RecommendedTasks />

      {/* Floating Action Button for Mobile Create Task (Alternative positioning) */}
      {isMobile && (
        <Fab
          color="primary"
          onClick={() => navigate('/tasks/create')}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            backgroundColor: '#dc267f',
            '&:hover': { backgroundColor: '#b91c5c' },
            zIndex: 1000
          }}
        >
          <AddIcon />
        </Fab>
      )}
    </Container>
  );
};

export default TaskList;