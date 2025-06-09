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
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import axiosInstance from '../../config/axios';
import MonthPicker from './MonthPicker';

// Fonction utilitaire pour formater les dates en grégorien
const formatGregorianDate = (date) => {
  if (!date) return '';
  return format(new Date(date), 'dd/MM/yyyy', { locale: ar });
};

const MissionForm = ({ open, handleClose, mission = null, onSuccess }) => {
  const [formData, setFormData] = useState({
    code_mission: '',
    employeeId: '',
    destinations: [],
    startDate: null,
    endDate: null,
    selectedMonth: null,
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

  // Ajout de la fonction de validation des dates
  const isDateInAllowedRange = (date) => {
    const today = new Date();
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const selectedDate = new Date(date.getFullYear(), date.getMonth(), 1);

    return selectedDate >= currentMonth && selectedDate <= nextMonth;
  };

  // Modification du gestionnaire de changement de mois
  const handleMonthChange = (date) => {
    if (!date) {
      setFormData(prev => ({
        ...prev,
        selectedMonth: null,
        startDate: null,
        endDate: null
      }));
      setError(null);
      return;
    }

    if (!isDateInAllowedRange(date)) {
      setError('يمكن إنشاء المهام الشهرية فقط للشهر الحالي أو الشهر القادم');
      setFormData(prev => ({
        ...prev,
        selectedMonth: null,
        startDate: null,
        endDate: null
      }));
      return;
    }

    const { start, end } = getMonthStartAndEnd(date);
    setFormData(prev => ({
      ...prev,
      selectedMonth: date,
      startDate: start,
      endDate: end
    }));
    setError(null);
  };

  // Gestionnaire de changement de type de mission
  const handleTypeChange = (event) => {
    const newType = event.target.value;
    setFormData(prev => {
      if (newType === 'monthly' && prev.selectedMonth) {
        const { start, end } = getMonthStartAndEnd(prev.selectedMonth);
        return {
          ...prev,
          type: newType,
          startDate: start,
          endDate: end
        };
      }
      return {
        ...prev,
        type: newType,
        selectedMonth: null,
        startDate: null,
        endDate: null
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
          code_mission: mission.code_mission || '',
          employeeId: mission.employee?._id || '',
          destinations: mission.destinations || [],
          startDate: new Date(mission.startDate) || null,
          endDate: new Date(mission.endDate) || null,
          selectedMonth: new Date(mission.startDate) || null,
          type: mission.type || 'monthly',
          status: mission.status || 'active',
          description: mission.description || '',
        });
      } else {
        // Pour une nouvelle mission mensuelle, définir le mois courant
        const today = new Date();
        const { start, end } = getMonthStartAndEnd(today);
        setFormData({
          code_mission: '',
          employeeId: '',
          destinations: [],
          startDate: start,
          endDate: end,
          selectedMonth: today,
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

  // Ajout de la fonction de vérification des missions existantes
  const hasExistingMonthlyMission = (employeeId, selectedMonth) => {
    if (!selectedMonth) return false;
    
    const monthStart = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    const monthEnd = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
    
    return missions.some(mission => 
      mission.type === 'monthly' &&
      mission.employee === employeeId &&
      new Date(mission.startDate) >= monthStart &&
      new Date(mission.endDate) <= monthEnd &&
      mission._id !== (mission?._id) // Exclure la mission en cours d'édition
    );
  };

  // Modification du gestionnaire de soumission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Vérifier si l'employé a déjà une mission mensuelle pour ce mois
      if (formData.type === 'monthly' && formData.employeeId && formData.selectedMonth) {
        if (hasExistingMonthlyMission(formData.employeeId, formData.selectedMonth)) {
          setError('هذا الموظف لديه بالفعل مهمة شهرية لهذا الشهر');
          setLoading(false);
          return;
        }
      }

      const missionData = {
        ...formData,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
        type: formData.type || 'monthly',
        status: formData.status || 'active'
      };

      if (mission) {
        await axiosInstance.put(`/missions/${mission._id}`, missionData);
      } else {
        await axiosInstance.post('/missions', missionData);
      }

      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la mission:', error);
      setError(error.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {mission ? 'تعديل المهمة' : 'إنشاء مهمة جديدة'}
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="رمز المهمة"
                value={formData.code_mission}
                onChange={handleChange('code_mission')}
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
              <FormControl fullWidth margin="normal">
                <InputLabel>نوع المهمة</InputLabel>
                <Select
                  value={formData.type}
                  onChange={handleTypeChange}
                  required
                >
                  <MenuItem value="monthly">مهمة شهرية</MenuItem>
                  <MenuItem value="special">مهمة خاصة</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {formData.type === 'monthly' ? (
              <Grid item xs={12}>
                <MonthPicker
                  value={formData.selectedMonth}
                  onChange={(date, error) => {
                    setFormData(prev => ({
                      ...prev,
                      selectedMonth: date,
                      startDate: date ? new Date(date.getFullYear(), date.getMonth(), 1) : null,
                      endDate: date ? new Date(date.getFullYear(), date.getMonth() + 1, 0) : null
                    }));
                    setError(error);
                  }}
                  error={error}
                  showValidationErrors={true}
                />
              </Grid>
            ) : (
              <>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ar}>
                    <DatePicker
                      label="تاريخ البداية"
                      value={formData.startDate}
                      onChange={(date) => setFormData(prev => ({ ...prev, startDate: date }))}
                      format="dd/MM/yyyy"
                      slotProps={{
                        textField: {
                          fullWidth: true
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ar}>
                    <DatePicker
                      label="تاريخ النهاية"
                      value={formData.endDate}
                      onChange={(date) => setFormData(prev => ({ ...prev, endDate: date }))}
                      format="dd/MM/yyyy"
                      slotProps={{
                        textField: {
                          fullWidth: true
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
              </>
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
        </Box>
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
    </Dialog>
  );
};

export default MissionForm; 