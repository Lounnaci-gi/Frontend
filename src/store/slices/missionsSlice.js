import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  missions: [],
  loading: false,
  error: null,
  selectedMission: null,
  filters: {
    type: 'all', // 'monthly' ou 'special'
    status: 'all', // 'active', 'completed', 'cancelled'
    dateRange: null,
  },
  alerts: {
    monthlyMissions: [], // Alertes pour les missions mensuelles manquantes
  },
};

const missionsSlice = createSlice({
  name: 'missions',
  initialState,
  reducers: {
    fetchMissionsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchMissionsSuccess: (state, action) => {
      state.loading = false;
      state.missions = action.payload;
    },
    fetchMissionsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setSelectedMission: (state, action) => {
      state.selectedMission = action.payload;
    },
    addMission: (state, action) => {
      state.missions.push(action.payload);
    },
    updateMission: (state, action) => {
      const index = state.missions.findIndex(m => m.code === action.payload.code);
      if (index !== -1) {
        state.missions[index] = action.payload;
      }
    },
    cancelMission: (state, action) => {
      const mission = state.missions.find(m => m.code === action.payload.code);
      if (mission) {
        mission.status = 'cancelled';
        mission.cancellationDetails = action.payload.details;
      }
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    updateAlerts: (state, action) => {
      state.alerts = { ...state.alerts, ...action.payload };
    },
  },
});

export const {
  fetchMissionsStart,
  fetchMissionsSuccess,
  fetchMissionsFailure,
  setSelectedMission,
  addMission,
  updateMission,
  cancelMission,
  setFilters,
  updateAlerts,
} = missionsSlice.actions;

export default missionsSlice.reducer; 