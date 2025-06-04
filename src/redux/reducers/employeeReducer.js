import {
  CREATE_EMPLOYEE_REQUEST,
  CREATE_EMPLOYEE_SUCCESS,
  CREATE_EMPLOYEE_FAILURE
} from '../actions/employeeActions';

const initialState = {
  employees: [],
  loading: false,
  error: null
};

const employeeReducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_EMPLOYEE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    case CREATE_EMPLOYEE_SUCCESS:
      return {
        ...state,
        loading: false,
        employees: [...state.employees, action.payload],
        error: null
      };
    case CREATE_EMPLOYEE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    default:
      return state;
  }
};

export default employeeReducer; 