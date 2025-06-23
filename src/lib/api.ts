// src/lib/api.ts
interface User {
  id: number;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  name: string;
  email: string;
  departmentAsStudentId?: number;
  semesterAsStudentId?: number;
  departmentAsTeacherId?: number;
}

interface LoginSuccessResponse {
  message: string;
  token: string;
  user: User;
}

interface LoginErrorResponse {
  error: string;
}

type LoginResponse = LoginSuccessResponse | LoginErrorResponse;

interface RegisterSuccessResponse {
  message: string;
  token: string;
  user: User;
}

interface RegisterErrorResponse {
  error: string;
}

type RegisterResponse = RegisterSuccessResponse | RegisterErrorResponse;

export async function login(email: string, password: string): Promise<User> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = (await response.json()) as LoginResponse;
  if (response.ok && 'token' in data) {
    console.log('Login: Storing token in sessionStorage:', data.token.substring(0, 20) + '...');
    sessionStorage.setItem('jwt_token', data.token);
    return data.user;
  } else {
    throw new Error('error' in data ? data.error : 'Login failed');
  }
}

export async function register(
  name: string,
  email: string,
  password: string,
  role: string,
  departmentId?: number,
  semesterId?: number
): Promise<User> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role, departmentId, semesterId }),
  });

  const data = (await response.json()) as RegisterResponse;
  if (response.ok && 'token' in data) {
    console.log('Register: Storing token in sessionStorage:', data.token.substring(0, 20) + '...');
    sessionStorage.setItem('jwt_token', data.token);
    return data.user;
  } else {
    throw new Error('error' in data ? data.error : 'Registration failed');
  }
}

export async function logout() {
  console.log('Logout: Removing token from sessionStorage');
  sessionStorage.removeItem('jwt_token');
}

export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = sessionStorage.getItem('jwt_token');
  if (!token) {
    console.log('fetchWithAuth: No token found');
    throw new Error('No token found');
  }

  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(url, { ...options, headers });
  if (response.status === 401) {
    console.log('fetchWithAuth: 401 Unauthorized, clearing token');
    sessionStorage.removeItem('jwt_token');
    throw new Error('Unauthorized');
  }
  return response;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetchWithAuth('/api/auth/me');
    const data = await response.json();
    console.log('getCurrentUser: Fetched user:', data);
    return response.ok ? data : null;
  } catch (error) {
    console.error('getCurrentUser: Error fetching user:', error);
    return null;
  }
}