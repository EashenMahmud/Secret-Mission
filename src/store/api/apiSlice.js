import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Create base API slice
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      // Don't set Content-Type here - let individual endpoints handle it
      return headers;
    },
  }),
  tagTypes: ['User', 'Auth', 'LIST_API', 'Profile'],
  endpoints: () => ({}), // Empty endpoints - will be injected
});

// Export the base API slice
export const api = apiSlice;
