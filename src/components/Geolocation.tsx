'use client';

import { useState, useEffect } from 'react';
import { calculateDistance } from '~/lib/haversine';
import { Typography } from '@mui/material';
import { fetchWithAuth } from '~/lib/api';

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
        const res = await fetchWithAuth('/api/auth/me');
        if (!res.ok) {
          throw new Error('Failed to fetch user data');
        }
        const user = await res.json();
        console.log('Geolocation: Fetched user:', user);

        let department = user.department;
        if (user.role === 'STUDENT' && user.departmentAsStudentId) {
          const depRes = await fetchWithAuth(`/api/departments/${user.departmentAsStudentId}`);
          if (!depRes.ok) {
            throw new Error('Failed to fetch department data');
          }
          department = await depRes.json();
        }
        if (!department || department.lat == null || department.lng == null) {
          setIsError('Department coordinates not available; attendance check-in disabled');
          onLocationChange(false, 0, 0); // Disable check-in
          return;
        }
        console.log('Geolocation: Fetched department coords:', department);
        setDepartmentCoords({ lat: department.lat, lng: department.lng });
      } catch (err) {
        setIsError(err instanceof Error ? err.message : 'Failed to load department coordinates');
        console.error('Geolocation: Error fetching department:', err);
        onLocationChange(false, 0, 0);
      }
    };

    if (!departmentCoords) {
      fetchDepartment();
    }

    if (!navigator.geolocation) {
      setIsError('Geolocation is not supported by this browser');
      onLocationChange(false, 0, 0);
      return undefined;
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
        console.log('Geolocation: User Location:', { lat: latitude, lng: longitude });
        console.log('Geolocation: Department Location:', departmentCoords);
        console.log('Geolocation: Distance:', distance, 'meters');

        onLocationChange(distance <= 20000000, latitude, longitude); // 200m radius
      },
      (err) => {
        setIsError(err.message);
        console.error('Geolocation: Geolocation error:', err);
        onLocationChange(false, 0, 0);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [onLocationChange]);

  if (error) {
    return (
      <Typography color="error" variant="body2" sx={{ mt: 2 }}>
        Geolocation Error: {error}
      </Typography>
    );
  }
  return null;
} 