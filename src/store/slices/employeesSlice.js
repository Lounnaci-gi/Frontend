import { createSlice } from '@reduxjs/toolkit';
import {
  CREATE_EMPLOYEE_REQUEST,
  CREATE_EMPLOYEE_SUCCESS,
  CREATE_EMPLOYEE_FAILURE,
  UPDATE_EMPLOYEE_REQUEST,
  UPDATE_EMPLOYEE_SUCCESS,
  UPDATE_EMPLOYEE_FAILURE
} from '../../redux/actions/employeeActions';

const initialState = {
  employees: [],
  loading: false,
  error: null,
  selectedEmployee: null,
  filters: {
    status: 'all',
    department: 'all',
    center: 'all',
  },
};

const employeesSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    fetchEmployeesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchEmployeesSuccess: (state, action) => {
      state.loading = false;
      state.employees = action.payload;
    },
    fetchEmployeesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setSelectedEmployee: (state, action) => {
      state.selectedEmployee = action.payload;
    },
    updateEmployee: (state, action) => {
      const index = state.employees.findIndex(emp => emp.matricule === action.payload.matricule);
      if (index !== -1) {
        state.employees[index] = action.payload;
      }
    },
    addEmployee: (state, action) => {
      state.employees.push(action.payload);
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Employee
      .addCase(CREATE_EMPLOYEE_REQUEST, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(CREATE_EMPLOYEE_SUCCESS, (state, action) => {
        state.loading = false;
        state.employees.push(action.payload);
      })
      .addCase(CREATE_EMPLOYEE_FAILURE, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Employee
      .addCase(UPDATE_EMPLOYEE_REQUEST, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(UPDATE_EMPLOYEE_SUCCESS, (state, action) => {
        state.loading = false;
        const index = state.employees.findIndex(emp => emp._id === action.payload._id);
        if (index !== -1) {
          state.employees[index] = action.payload;
        }
      })
      .addCase(UPDATE_EMPLOYEE_FAILURE, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  fetchEmployeesStart,
  fetchEmployeesSuccess,
  fetchEmployeesFailure,
  setSelectedEmployee,
  updateEmployee,
  addEmployee,
  setFilters,
} = employeesSlice.actions;

export default employeesSlice.reducer; 