import { apiSlice } from "./apiSlice";

export const commonApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get API with ID
    getApiWithId: builder.query({
      query: ({ url, id }) => ({
        url: `${url}/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, { url, id }) => [
        { type: "LIST_API", id: `${url}-${id}` },
        "LIST_API",
      ],
    }),

    // Get API with params (for searching and pagination)
    getApi: builder.query({
      query: ({ url, params }) => {
        const queryObject = {
          url,
          method: "GET",
        };
        if (params) {
          queryObject.params = params;
        }
        return queryObject;
      },
      providesTags: (result, error, { url }) => [
        { type: "LIST_API", id: url },
        "LIST_API",
      ],
    }),

    // POST API
    postApi: builder.mutation({
      query: (data) => {
        return {
          url: data.end_point,
          method: "POST",
          body: data.body,
          headers: {
            "Content-Type": "application/json",
          },
        };
      },
      invalidatesTags: ["LIST_API"],
    }),

    // POST API with FormData
    postFormDataApi: builder.mutation({
      query: (data) => {
        // Convert object to FormData if it's not already
        let formData = data.body;
        if (!(data.body instanceof FormData)) {
          formData = new FormData();
          Object.keys(data.body).forEach((key) => {
            if (data.body[key] !== null && data.body[key] !== undefined) {
              // Handle file uploads
              if (
                data.body[key] instanceof File ||
                data.body[key] instanceof FileList
              ) {
                if (data.body[key] instanceof FileList) {
                  // Handle multiple files
                  Array.from(data.body[key]).forEach((file, index) => {
                    formData.append(`${key}[${index}]`, file);
                  });
                } else {
                  formData.append(key, data.body[key]);
                }
              } else if (typeof data.body[key] === "object") {
                // Handle nested objects (convert to JSON string)
                formData.append(key, JSON.stringify(data.body[key]));
              } else {
                formData.append(key, data.body[key]);
              }
            }
          });
        }

        return {
          url: data.end_point,
          method: "POST",
          body: formData,
          // Don't set Content-Type for FormData - browser handles boundary
        };
      },
      invalidatesTags: ["LIST_API"],
    }),

    // Update API with JSON (PUT method)
    updateApiJson: builder.mutation({
      query: (data) => ({
        url: data.end_point,
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: data.body,
      }),
      invalidatesTags: ["LIST_API"],
    }),

    // Update API with FormData (POST with _method=PUT)
    updateApi: builder.mutation({
      query: (data) => {
        // For FormData, append _method for Laravel-style method spoofing
        if (data.body instanceof FormData) {
          data.body.append("_method", "PUT");
        }
        return {
          url: data.end_point,
          method: "POST",
          body: data.body,
        };
      },
      invalidatesTags: ["LIST_API"],
    }),

    // Update FormData API (auto convert plain data to FormData, with _method=PUT)
    updateFormDataAutoApi: builder.mutation({
      query: (data) => {
        // Convert object to FormData if it's not already
        let formData = data.body;
        if (!(data.body instanceof FormData)) {
          formData = new FormData();
          Object.keys(data.body).forEach((key) => {
            if (data.body[key] !== null && data.body[key] !== undefined) {
              // Handle file uploads
              if (
                data.body[key] instanceof File ||
                data.body[key] instanceof FileList
              ) {
                if (data.body[key] instanceof FileList) {
                  // Handle multiple files
                  Array.from(data.body[key]).forEach((file, index) => {
                    formData.append(`${key}[${index}]`, file);
                  });
                } else {
                  formData.append(key, data.body[key]);
                }
              } else if (typeof data.body[key] === "object") {
                // Handle nested objects (convert to JSON string)
                formData.append(key, JSON.stringify(data.body[key]));
              } else {
                formData.append(key, data.body[key]);
              }
            }
          });
        }
        // Laravel-style method spoofing
        formData.append("_method", "PUT");
        return {
          url: data.end_point,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["LIST_API"],
    }),

    // Update FormData API with POST method (auto convert plain data to FormData)
    updateFormDataPostApi: builder.mutation({
      query: (data) => {
        // Convert object to FormData if it's not already
        let formData = data.body;
        if (!(data.body instanceof FormData)) {
          formData = new FormData();
          Object.keys(data.body).forEach((key) => {
            if (data.body[key] !== null && data.body[key] !== undefined) {
              // Handle file uploads
              if (
                data.body[key] instanceof File ||
                data.body[key] instanceof FileList
              ) {
                if (data.body[key] instanceof FileList) {
                  // Handle multiple files
                  Array.from(data.body[key]).forEach((file, index) => {
                    formData.append(`${key}[${index}]`, file);
                  });
                } else {
                  formData.append(key, data.body[key]);
                }
              } else if (typeof data.body[key] === "object") {
                // Handle nested objects (convert to JSON string)
                formData.append(key, JSON.stringify(data.body[key]));
              } else {
                formData.append(key, data.body[key]);
              }
            }
          });
        }
        return {
          url: data.end_point,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["LIST_API"],
    }),

    // PATCH API for partial updates
    patchApi: builder.mutation({
      query: (data) => ({
        url: data.end_point,
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: data.body,
      }),
      invalidatesTags: ["LIST_API"],
    }),

    // Delete API
    deleteApi: builder.mutation({
      query: (data) => {
        return {
          url: data.end_point,
          method: "DELETE",
          body: data.body,
        };
      },
      invalidatesTags: ["LIST_API"],
    }),

    // Login endpoint
    login: builder.mutation({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      transformResponse: (response) => {
        if (!response.status) {
          throw new Error(response.message || "Login failed");
        }
        return response.data;
      },
      transformErrorResponse: (response) => {
        // Handle API error responses
        if (response.data) {
          return {
            status: response.status,
            data: response.data,
          };
        }
        return response;
      },
      invalidatesTags: ["Auth"],
    }),

    // Register endpoint
    register: builder.mutation({
      query: (userData) => ({
        url: "/register",
        method: "POST",
        body: userData,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      transformResponse: (response) => {
        if (!response.status) {
          throw new Error(response.message || "Registration failed");
        }
        return response.data;
      },
      transformErrorResponse: (response) => {
        // Handle API error responses
        if (response.data) {
          return {
            status: response.status,
            data: response.data,
          };
        }
        return response;
      },
    }),

    // Verify email endpoint
    verifyEmail: builder.mutation({
      query: ({ token }) => ({
        url: "/verify-email",
        method: "POST",
        body: { token },
        headers: {
          "Content-Type": "application/json",
        },
      }),
      transformResponse: (response) => {
        if (!response.status) {
          throw new Error(response.message || "Email verification failed");
        }
        return response.data;
      },
      transformErrorResponse: (response) => {
        if (response.data) {
          return {
            status: response.status,
            data: response.data,
          };
        }
        return response;
      },
    }),

    // Logout endpoint
    logoutApi: builder.mutation({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth", "LIST_API"],
    }),

    // Course creation API with proper array and boolean handling
    createCourse: builder.mutation({
      query: (courseData) => {
        const formData = new FormData();

        // Handle each field with proper type conversion
        Object.keys(courseData).forEach((key) => {
          const value = courseData[key];

          if (value !== null && value !== undefined) {
            if (value instanceof File) {
              // Handle file uploads
              formData.append(key, value);
            } else if (typeof value === "boolean") {
              // Handle boolean values - convert to "1"/"0" for backend
              formData.append(key, value ? "1" : "0");
            } else if (Array.isArray(value)) {
              // Handle arrays - append each item with array notation
              value.forEach((item, index) => {
                formData.append(`${key}[${index}]`, item);
              });
            } else {
              // Handle strings and numbers
              formData.append(key, value);
            }
          }
        });

        return {
          url: "/courses",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["LIST_API"],
    }),

    // Course update API with proper array and boolean handling
    updateCourse: builder.mutation({
      query: ({ id, courseData }) => {
        const formData = new FormData();

        // Handle each field with proper type conversion
        Object.keys(courseData).forEach((key) => {
          const value = courseData[key];

          if (value !== null && value !== undefined) {
            if (value instanceof File) {
              // Handle file uploads
              formData.append(key, value);
            } else if (typeof value === "boolean") {
              // Handle boolean values - convert to "1"/"0" for backend
              formData.append(key, value ? "1" : "0");
            } else if (Array.isArray(value)) {
              // Handle arrays - append each item with array notation
              value.forEach((item, index) => {
                formData.append(`${key}[${index}]`, item);
              });
            } else {
              // Handle strings and numbers
              formData.append(key, value);
            }
          }
        });

        return {
          url: `/update-course/${id}`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["LIST_API"],
    }),

    // Submit inquiry API
    submitInquiry: builder.mutation({
      query: (inquiryData) => ({
        url: "/inquiries",
        method: "POST",
        body: inquiryData,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["LIST_API"],
    }),

    // Forgot password endpoint
    forgotPassword: builder.mutation({
      query: ({ email }) => ({
        url: "/forgot-password",
        method: "POST",
        body: { email },
        headers: {
          "Content-Type": "application/json",
        },
      }),
      transformResponse: (response) => {
        if (!response.status) {
          throw new Error(response.message || "Failed to send reset email");
        }
        return response.data;
      },
      transformErrorResponse: (response) => {
        if (response.data) {
          return {
            status: response.status,
            data: response.data,
          };
        }
        return response;
      },
    }),

    // Reset password endpoint
    resetPassword: builder.mutation({
      query: ({ token, password }) => ({
        url: "/reset-password",
        method: "POST",
        body: { token, password },
        headers: {
          "Content-Type": "application/json",
        },
      }),
      transformResponse: (response) => {
        if (!response.status) {
          throw new Error(response.message || "Password reset failed");
        }
        return response.data;
      },
      transformErrorResponse: (response) => {
        if (response.data) {
          return {
            status: response.status,
            data: response.data,
          };
        }
        return response;
      },
    }),

    // Resend verification email endpoint
    resendVerificationEmail: builder.mutation({
      query: ({ email }) => ({
        url: "/resend-verification-email",
        method: "POST",
        body: { email },
        headers: {
          "Content-Type": "application/json",
        },
      }),
      transformResponse: (response) => {
        if (!response.status) {
          throw new Error(response.message || "Failed to resend verification email");
        }
        return response.data;
      },
      transformErrorResponse: (response) => {
        if (response.data) {
          return {
            status: response.status,
            data: response.data,
          };
        }
        return response;
      },
    }),
  }),
});

export const {
  useGetApiQuery,
  useGetApiWithIdQuery,
  usePostFormDataApiMutation,
  useUpdateApiJsonMutation,
  usePostApiMutation,
  useUpdateApiMutation,
  useUpdateFormDataAutoApiMutation,
  useUpdateFormDataPostApiMutation,
  usePatchApiMutation,
  useDeleteApiMutation,
  useLoginMutation,
  useRegisterMutation,
  useVerifyEmailMutation,
  useLogoutApiMutation,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useSubmitInquiryMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useResendVerificationEmailMutation,
} = commonApi;
