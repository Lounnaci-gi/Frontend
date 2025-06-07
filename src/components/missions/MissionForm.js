import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  Autocomplete,
  Grid,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axiosInstance from '../../config/axios';

const MissionForm = ({ open, handleClose, mission = null, onSuccess }) => {
  const [formData, setFormData] = useState({
    code: '',
    employeeId: '',
    destinations: [],
    startDate: null,
    endDate: null,
    type: 'monthly',
    status: 'active',
    description: '',
  });

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fonction pour obtenir le premier et dernier jour du mois
  const getMonthStartAndEnd = (date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return { start, end };
  };

  // Gestionnaire de changement de date pour les missions mensuelles
  const handleDateChange = (date) => {
    if (formData.type === 'monthly' && date) {
      const { start, end } = getMonthStartAndEnd(date);
      setFormData(prev => ({
        ...prev,
        startDate: start,
        endDate: end
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        startDate: date
      }));
    }
  };

  // Gestionnaire de changement de type de mission
  const handleTypeChange = (event) => {
    const newType = event.target.value;
    setFormData(prev => {
      if (newType === 'monthly' && prev.startDate) {
        const { start, end } = getMonthStartAndEnd(prev.startDate);
        return {
          ...prev,
          type: newType,
          startDate: start,
          endDate: end
        };
      }
      return {
        ...prev,
        type: newType
      };
    });
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axiosInstance.get('/employees');
        setEmployees(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement des employés:', error);
      }
    };

    if (open) {
      fetchEmployees();
      if (mission) {
        setFormData({
          code: mission.code || '',
          employeeId: mission.employee?._id || '',
          destinations: mission.destinations || [],
          startDate: new Date(mission.startDate) || null,
          endDate: new Date(mission.endDate) || null,
          type: mission.type || 'monthly',
          status: mission.status || 'active',
          description: mission.description || '',
        });
      } else {
        // Pour une nouvelle mission mensuelle, définir la date de début au premier jour du mois courant
        const today = new Date();
        const { start, end } = getMonthStartAndEnd(today);
        setFormData({
          code: '',
          employeeId: '',
          destinations: [],
          startDate: start,
          endDate: end,
          type: 'monthly',
          status: 'active',
          description: '',
        });
      }
    }
  }, [open, mission]);

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mission) {
        await axiosInstance.put(`/missions/${mission._id}`, formData);
      } else {
        await axiosInstance.post('/missions', formData);
      }
      onSuccess();
      handleClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {mission ? 'تعديل المهمة' : 'إضافة مهمة جديدة'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="رمز المهمة"
                value={formData.code}
                onChange={handleChange('code')}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>الموظف</InputLabel>
                <Select
                  value={formData.employeeId}
                  onChange={handleChange('employeeId')}
                  required
                >
                  {employees.map((employee) => (
                    <MenuItem key={employee._id} value={employee._id}>
                      {`${employee.nom} ${employee.prenom}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={[]}
                freeSolo
                value={formData.destinations}
                onChange={(event, newValue) => {
                  setFormData({
                    ...formData,
                    destinations: newValue,
                  });
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option}
                      {...getTagProps({ index })}
                      key={index}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="الوجهات"
                    placeholder="أضف وجهة"
                    margin="normal"
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>نوع المهمة</InputLabel>
                <Select
                  value={formData.type}
                  onChange={handleTypeChange}
                  label="نوع المهمة"
                >
                  <MenuItem value="monthly">مهمة شهرية</MenuItem>
                  <MenuItem value="special">مهمة خاصة</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="تاريخ البداية"
                  value={formData.startDate}
                  onChange={handleDateChange}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            {formData.type === 'special' && (
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="تاريخ النهاية"
                    value={formData.endDate}
                    onChange={(date) => setFormData(prev => ({ ...prev, endDate: date }))}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>الحالة</InputLabel>
                <Select
                  value={formData.status}
                  onChange={handleChange('status')}
                  required
                >
                  <MenuItem value="active">نشطة</MenuItem>
                  <MenuItem value="completed">مكتملة</MenuItem>
                  <MenuItem value="cancelled">ملغاة</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="الوصف"
                value={formData.description}
                onChange={handleChange('description')}
                multiline
                rows={4}
                margin="normal"
              />
            </Grid>
          </Grid>
          {error && (
            <Box sx={{ color: 'error.main', mt: 2 }}>
              {error}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>إلغاء</Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? 'جاري الحفظ...' : mission ? 'تحديث' : 'حفظ'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default MissionForm; 