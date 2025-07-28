import React from 'react';
import { 
  Box, 
  CircularProgress, 
  Typography, 
  useTheme, 
  useMediaQuery,
  alpha,
  Skeleton
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Task as TaskIcon, Category as CategoryIcon } from '@mui/icons-material';

// Color palette matching your sidebar design
const colorPalette = {
  primary: '#dc267f',
  secondary: '#b91c5c',
  accent: '#2a3f6f',
  dark: '#1a2752',
  light: '#f8fafc',
  surface: '#ffffff',
  gradient: 'linear-gradient(135deg, #dc267f 0%, #b91c5c 100%)',
  darkGradient: 'linear-gradient(135deg, #2a3f6f 0%, #1a2752 100%)',
};

// Enhanced Loading Spinner with multiple variants
const LoadingSpinner = ({ 
  size = 'medium', 
  variant = 'circular',
  message = 'Loading...',
  fullScreen = false,
  darkMode = false,
  showMessage = true,
  overlay = false,
  color = 'primary'
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:767px)');

  // Size configurations
  const sizeConfig = {
    small: { spinner: 24, container: 60, fontSize: '0.875rem' },
    medium: { spinner: 40, container: 80, fontSize: '1rem' },
    large: { spinner: 56, container: 100, fontSize: '1.125rem' },
    xlarge: { spinner: 72, container: 120, fontSize: '1.25rem' },
  };

  const config = sizeConfig[size];

  // Color configurations
  const colorConfig = {
    primary: colorPalette.primary,
    secondary: colorPalette.secondary,
    accent: colorPalette.accent,
    gradient: colorPalette.gradient,
  };

  const spinnerColor = colorConfig[color] || colorPalette.primary;

  // Animation variants
  const containerVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: { 
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  const iconVariants = {
    animate: {
      rotate: [0, 360],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Circular Progress Spinner
  const CircularSpinner = () => (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
      }}
    >
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        {/* Background circle */}
        <CircularProgress
          variant="determinate"
          value={100}
          size={config.spinner}
          thickness={3}
          sx={{
            color: alpha(spinnerColor, 0.2),
            position: 'absolute',
          }}
        />
        {/* Animated progress circle */}
        <CircularProgress
          variant="indeterminate"
          size={config.spinner}
          thickness={3}
          sx={{
            color: spinnerColor,
            animationDuration: '1.4s',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            },
          }}
        />
        {/* Center icon */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <motion.div variants={iconVariants} animate="animate">
            <TaskIcon 
              sx={{ 
                fontSize: config.spinner * 0.4,
                color: spinnerColor,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
              }} 
            />
          </motion.div>
        </Box>
      </Box>
      
      {showMessage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Typography
            variant="body2"
            sx={{
              color: darkMode ? 'rgba(255,255,255,0.8)' : colorPalette.accent,
              fontSize: config.fontSize,
              fontWeight: 500,
              textAlign: 'center',
              letterSpacing: '0.5px',
            }}
          >
            {message}
          </Typography>
        </motion.div>
      )}
    </motion.div>
  );

  // Dots Spinner
  const DotsSpinner = () => (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
      }}
    >
      <Box sx={{ display: 'flex', gap: 1 }}>
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            animate={{
              scale: [1, 1.5, 1],
              backgroundColor: [spinnerColor, alpha(spinnerColor, 0.5), spinnerColor],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: index * 0.2,
              ease: "easeInOut"
            }}
            style={{
              width: config.spinner * 0.2,
              height: config.spinner * 0.2,
              borderRadius: '50%',
              backgroundColor: spinnerColor,
            }}
          />
        ))}
      </Box>
      
      {showMessage && (
        <Typography
          variant="body2"
          sx={{
            color: darkMode ? 'rgba(255,255,255,0.8)' : colorPalette.accent,
            fontSize: config.fontSize,
            fontWeight: 500,
            textAlign: 'center',
          }}
        >
          {message}
        </Typography>
      )}
    </motion.div>
  );

  // Pulse Spinner
  const PulseSpinner = () => (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
      }}
    >
      <motion.div
        variants={pulseVariants}
        animate="animate"
        style={{
          width: config.spinner,
          height: config.spinner,
          borderRadius: '50%',
          background: color === 'gradient' ? colorPalette.gradient : spinnerColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 0 20px ${alpha(spinnerColor, 0.3)}`,
        }}
      >
        <CategoryIcon 
          sx={{ 
            fontSize: config.spinner * 0.5,
            color: 'white',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
          }} 
        />
      </motion.div>
      
      {showMessage && (
        <Typography
          variant="body2"
          sx={{
            color: darkMode ? 'rgba(255,255,255,0.8)' : colorPalette.accent,
            fontSize: config.fontSize,
            fontWeight: 500,
            textAlign: 'center',
          }}
        >
          {message}
        </Typography>
      )}
    </motion.div>
  );

  // Skeleton Loader
  const SkeletonLoader = ({ lines = 3, showAvatar = true }) => (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ width: '100%', maxWidth: '400px' }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
        {showAvatar && (
          <Skeleton
            variant="circular"
            width={40}
            height={40}
            sx={{ 
              bgcolor: darkMode ? alpha(colorPalette.dark, 0.3) : alpha(colorPalette.primary, 0.1),
            }}
          />
        )}
        <Box sx={{ flex: 1 }}>
          {Array.from({ length: lines }).map((_, index) => (
            <Skeleton
              key={index}
              variant="text"
              width={index === lines - 1 ? '60%' : '100%'}
              height={24}
              sx={{
                bgcolor: darkMode ? alpha(colorPalette.dark, 0.3) : alpha(colorPalette.primary, 0.1),
                mb: 1,
              }}
            />
          ))}
        </Box>
      </Box>
    </motion.div>
  );

  // Render appropriate spinner variant
  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return <DotsSpinner />;
      case 'pulse':
        return <PulseSpinner />;
      case 'skeleton':
        return <SkeletonLoader />;
      case 'circular':
      default:
        return <CircularSpinner />;
    }
  };

  // Container styles
  const containerStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: fullScreen ? '100vh' : config.container,
    width: fullScreen ? '100vw' : '100%',
    padding: fullScreen ? 0 : '2rem',
    position: overlay ? 'fixed' : 'relative',
    top: overlay ? 0 : 'auto',
    left: overlay ? 0 : 'auto',
    right: overlay ? 0 : 'auto',
    bottom: overlay ? 0 : 'auto',
    zIndex: overlay ? 9999 : 'auto',
    backgroundColor: overlay 
      ? alpha(darkMode ? colorPalette.dark : '#ffffff', 0.9)
      : 'transparent',
    backdropFilter: overlay ? 'blur(8px)' : 'none',
    transition: 'all 0.3s ease',
  };

  return (
    <AnimatePresence mode="wait">
      <Box sx={containerStyles}>
        {renderSpinner()}
      </Box>
    </AnimatePresence>
  );
};

// Pre-configured spinner variants for common use cases
export const SmallSpinner = (props) => (
  <LoadingSpinner size="small" variant="circular" showMessage={false} {...props} />
);

export const FullPageSpinner = (props) => (
  <LoadingSpinner 
    size="large" 
    variant="circular" 
    fullScreen 
    message="Loading application..." 
    {...props} 
  />
);

export const OverlaySpinner = (props) => (
  <LoadingSpinner 
    size="medium" 
    variant="pulse" 
    overlay 
    color="gradient"
    message="Processing..." 
    {...props} 
  />
);

export const SkeletonSpinner = (props) => (
  <LoadingSpinner variant="skeleton" showMessage={false} {...props} />
);

export default LoadingSpinner;