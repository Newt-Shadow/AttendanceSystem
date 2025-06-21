// components/Geolocation.tsx
'use client';

import { useState, useEffect } from 'react';
import { calculateDistance } from '~/lib/haversine';
import { Typography } from '@mui/material';

interface GeolocationProps {
  onLocationChange: (isWithinRadius: boolean, latitude: number, longitude: number) => void;
}

export default function Geolocation({ onLocationChange }: GeolocationProps) {
  const [error, setIsError] = useState<string | null>(null);
  const [departmentCoords, setDepartmentCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    // Fetch department coordinates
    const fetchDepartment = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          throw new Error('Failed to fetch user data');
        }
        const user = await res.json();
        if (!user?.department || !user.department?.lat || !user.department?.lng) {
          throw new Error('Department coordinates not available');
        }
        setDepartmentCoords({ lat: user.department.lat, lng: user.department.lng });
      } catch (err) {
        setIsError(err instanceof Error ? err.message : 'Failed to load department coordinates');
      }
    };

    fetchDepartment();

    if (!navigator.geolocation) {
      setIsError('Geolocation is not supported by this browser');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (!departmentCoords) {
          setIsError('Department coordinates not loaded');
          onLocationChange(false, latitude, longitude);
          return;
        }
        const distance = calculateDistance(latitude, longitude, departmentCoords.lat, departmentCoords.lng);
        onLocationChange(distance <= 200, latitude, longitude); // 200m radius
      },
      (err) => {
        setIsError(err.message);
        onLocationChange(false, 0, 0);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [onLocationChange, departmentCoords]);

  if (error) {
    return (
      <Typography color="error" variant="body2" sx={{ mt: 2 }}>
        Geolocation Error: {error}
      </Typography>
    );
  }
  return null;
}