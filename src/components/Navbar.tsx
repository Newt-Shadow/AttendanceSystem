// Navbar.jsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { logout } from '../lib/api';
import SchoolIcon from '@mui/icons-material/School';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import Brightness2Icon from '@mui/icons-material/Brightness2';
import BrightnessAutoIcon from '@mui/icons-material/BrightnessAuto';

interface NavbarProps {
  themeMode: 'light' | 'dark' | 'auto';
  setThemeMode: (mode: 'light' | 'dark' | 'auto') => void;
}

export function Navbar({ themeMode, setThemeMode }: NavbarProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        background: (theme) =>
          theme.palette.mode === 'light'
            ? 'rgba(255,255,255,0.15)'
            : 'rgba(0,0,0,0.3)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        py: 1,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 4 } }}>
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: isHovered ? 1.15 : 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <SchoolIcon sx={{ fontSize: 40, color: 'text.primary' }} />
            <Typography
              variant="h4"
              sx={{
                fontWeight: 'bold',
                fontFamily: '"Poppins", "Roboto", sans-serif',
                letterSpacing: '-0.5px',
                color: 'text.primary',
              }}
            >
              ProxyO
            </Typography>
          </Box>
        </motion.div>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel
              id="theme-select-label"
              sx={{ color: (theme) => theme.palette.text.primary, '&.Mui-focused': { color: (theme) => theme.palette.primary.main } }}
            >
              Theme
            </InputLabel>
            <Select
              labelId="theme-select-label"
              value={themeMode}
              label="Theme"
              onChange={(e) => setThemeMode(e.target.value as 'light' | 'dark' | 'auto')}
              sx={{
                color: 'text.primary',
                bgcolor: 'rgba(255,255,255,0.15)',
                borderRadius: '8px',
                '& .MuiSvgIcon-root': { color: (theme) => theme.palette.text.primary },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: (theme) => theme.palette.text.primary },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: (theme) => theme.palette.primary.main },
              }}
            >
              <MenuItem value="light">
                <WbSunnyIcon sx={{ mr: 1 }} /> Light
              </MenuItem>
              <MenuItem value="dark">
                <Brightness2Icon sx={{ mr: 1 }} /> Dark
              </MenuItem>
              <MenuItem value="auto">
                <BrightnessAutoIcon sx={{ mr: 1 }} /> Auto
              </MenuItem>
            </Select>
          </FormControl>
          <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.3 }}>
            <Button
              onClick={handleLogout}
              sx={{
                borderRadius: '16px',
                px: 5,
                py: 1.5,
                bgcolor: 'rgba(255,255,255,0.15)',
                color: (theme) => theme.palette.text.primary,
                fontWeight: 600,
                fontSize: '1rem',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.25)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Logout
            </Button>
          </motion.div>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
