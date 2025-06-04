import axiosInstance from '../../config/axios';

// Action Types
export const CREATE_EMPLOYEE_REQUEST = 'CREATE_EMPLOYEE_REQUEST';
export const CREATE_EMPLOYEE_SUCCESS = 'CREATE_EMPLOYEE_SUCCESS';
export const CREATE_EMPLOYEE_FAILURE = 'CREATE_EMPLOYEE_FAILURE';

export const UPDATE_EMPLOYEE_REQUEST = 'UPDATE_EMPLOYEE_REQUEST';
export const UPDATE_EMPLOYEE_SUCCESS = 'UPDATE_EMPLOYEE_SUCCESS';
export const UPDATE_EMPLOYEE_FAILURE = 'UPDATE_EMPLOYEE_FAILURE';

// Action Creators
export const createEmployee = (employeeData) => async (dispatch) => {
  try {
    dispatch({ type: CREATE_EMPLOYEE_REQUEST });

    const response = await axiosInstance.post('/employees', employeeData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    dispatch({
      type: CREATE_EMPLOYEE_SUCCESS,
      payload: response.data
    });

    return response.data;
  } catch (error) {
    dispatch({
      type: CREATE_EMPLOYEE_FAILURE,
      payload: error.response?.data?.message || 'Erreur lors de la création de l\'employé'
    });
    throw error;
  }
};

export const updateEmployee = (id, employeeData) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_EMPLOYEE_REQUEST });

    const response = await axiosInstance.put(`/employees/${id}`, employeeData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    dispatch({
      type: UPDATE_EMPLOYEE_SUCCESS,
      payload: response.data
    });

    return response.data;
  } catch (error) {
    dispatch({
      type: UPDATE_EMPLOYEE_FAILURE,
      payload: error.response?.data?.message || 'Erreur lors de la mise à jour de l\'employé'
    });
    throw error;
  }
}; 