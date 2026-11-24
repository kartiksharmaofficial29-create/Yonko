import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
  }),
  tagTypes: ['Ticket', 'Machine', 'Technician', 'Dashboard'],
  endpoints: (builder) => ({
    getDashboard: builder.query({
      query: () => '/dashboard/',
      providesTags: ['Dashboard'],
    }),

    getTickets: builder.query({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.append('status', params.status);
        if (params?.priority) queryParams.append('priority', params.priority);
        if (params?.category) queryParams.append('category', params.category);
        if (params?.machine_id) queryParams.append('machine_id', params.machine_id);
        if (params?.search) queryParams.append('search', params.search);
        if (params?.limit) queryParams.append('limit', params.limit);
        const qs = queryParams.toString();
        return `/tickets/${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Ticket'],
    }),

    getTicketById: builder.query({
      query: (id) => `/tickets/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Ticket', id }],
    }),

    getTicketEvents: builder.query({
      query: (id) => `/tickets/${id}/events/`,
      providesTags: (result, error, id) => [{ type: 'Ticket', id }],
    }),

    createTicket: builder.mutation({
      query: (body) => ({
        url: '/tickets/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Ticket', 'Dashboard', 'Machine'],
    }),

    analyzeTicket: builder.mutation({
      query: (id) => ({
        url: `/tickets/${id}/analyze/`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Ticket', id }, 'Dashboard'],
    }),

    getMatches: builder.query({
      query: (id) => `/tickets/${id}/matches/`,
      providesTags: (result, error, id) => [{ type: 'Ticket', id }],
    }),

    assignTechnician: builder.mutation({
      query: ({ id, technician_id, notes }) => ({
        url: `/tickets/${id}/assign/`,
        method: 'POST',
        body: { technician_id, notes },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Ticket', id }, 'Technician', 'Dashboard'],
    }),

    updateTicketStatus: builder.mutation({
      query: ({ id, status, notes }) => ({
        url: `/tickets/${id}/status_update/`,
        method: 'POST',
        body: { status, notes },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Ticket', id }, 'Dashboard', 'Technician'],
    }),

    updateTicket: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/tickets/${id}/`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Ticket', id }, 'Dashboard'],
    }),

    getMachines: builder.query({
      query: (search) => `/machines/${search ? `?search=${encodeURIComponent(search)}` : ''}`,
      providesTags: ['Machine'],
    }),

    createMachine: builder.mutation({
      query: (body) => ({
        url: '/machines/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Machine', 'Dashboard'],
    }),

    getTechnicians: builder.query({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.available) queryParams.append('available', 'true');
        if (params?.search) queryParams.append('search', params.search);
        const qs = queryParams.toString();
        return `/technicians/${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Technician'],
    }),

    createTechnician: builder.mutation({
      query: (body) => ({
        url: '/technicians/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Technician', 'Dashboard'],
    }),

    toggleTechnicianAvailability: builder.mutation({
      query: (id) => ({
        url: `/technicians/${id}/toggle_availability/`,
        method: 'POST',
      }),
      invalidatesTags: ['Technician', 'Dashboard'],
    }),

    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login/',
        method: 'POST',
        body: credentials,
      }),
    }),

    getMe: builder.query({
      query: () => '/auth/me/',
    }),
  }),
});

export const {
  useGetDashboardQuery,
  useGetTicketsQuery,
  useGetTicketByIdQuery,
  useGetTicketEventsQuery,
  useCreateTicketMutation,
  useAnalyzeTicketMutation,
  useGetMatchesQuery,
  useAssignTechnicianMutation,
  useUpdateTicketStatusMutation,
  useUpdateTicketMutation,
  useGetMachinesQuery,
  useCreateMachineMutation,
  useGetTechniciansQuery,
  useCreateTechnicianMutation,
  useToggleTechnicianAvailabilityMutation,
  useLoginMutation,
  useGetMeQuery,
} = apiSlice;

// Aliases for seamless page integration
export const useGetDashboardStatsQuery = useGetDashboardQuery;
export const useGetTicketQuery = useGetTicketByIdQuery;
export const useAssignTicketMutation = useAssignTechnicianMutation;
