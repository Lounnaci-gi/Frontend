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

  // Gestionnaire de changement de mois pour les missions mensuelles
  const handleMonthChange = (date) => {
    if (date) {
      const { start, end } = getMonthStartAndEnd(date);
      setFormData(prev => ({
        ...prev,
        selectedMonth: date,
        startDate: start,
        endDate: end
      }));
    }
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

  // Fonction pour vérifier les missions mensuelles existantes
  const checkExistingMonthlyMission = async (employeeId, startDate, endDate) => {
    if (!employeeId || !startDate || !endDate) return null;
    
    try {
      const startOfMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      const endOfMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
      
      const response = await axiosInstance.get('/missions', {
        params: {
          employee: employeeId,
          type: 'monthly',
          startDate: startOfMonth.toISOString(),
          endDate: endOfMonth.toISOString()
        }
      });
      
      // Filtrer les missions qui se chevauchent avec le mois
      const conflictingMissions = response.data.filter(mission => {
        const missionStart = new Date(mission.startDate);
        const missionEnd = new Date(mission.endDate);
        
        return (
          (missionStart >= startOfMonth && missionStart <= endOfMonth) ||
          (missionEnd >= startOfMonth && missionEnd <= endOfMonth) ||
          (missionStart <= startOfMonth && missionEnd >= endOfMonth)
        );
      });
      
      return conflictingMissions.length > 0 ? conflictingMissions[0] : null;
    } catch (error) {
      console.error('Erreur lors de la vérification des missions existantes:', error);
      return null;
    }
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

  // Vérifier les missions existantes quand l'employé ou le mois change
  useEffect(() => {
    const validateExistingMission = async () => {
      if (formData.type === 'monthly' && formData.employeeId && formData.startDate && formData.endDate) {
        const existingMission = await checkExistingMonthlyMission(
          formData.employeeId,
          formData.startDate,
          formData.endDate
        );
        
        if (existingMission && (!mission || existingMission._id !== mission._id)) {
          const monthName = formData.startDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
          setError(`L'employé a déjà une mission mensuelle pour ${monthName}`);
        } else {
          setError(null);
        }
      }
    };

    validateExistingMission();
  }, [formData.employeeId, formData.startDate, formData.endDate, formData.type, mission]);

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  // Gestionnaire de soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validation pour les missions mensuelles
      if (formData.type === 'monthly' && formData.employeeId && formData.startDate && formData.endDate) {
        const existingMission = await checkExistingMonthlyMission(
          formData.employeeId, 
          formData.startDate, 
          formData.endDate
        );
        
        if (existingMission && (!mission || existingMission._id !== mission._id)) {
          const monthName = formData.startDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
          setError(`L'employé a déjà une mission mensuelle pour ${monthName}`);
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
      
      // Gestion spécifique des erreurs de validation
      if (error.response?.data?.code === 'MONTHLY_MISSION_EXISTS') {
        setError(error.response.data.message);
      } else {
        setError(error.response?.data?.message || 'Une erreur est survenue');
      }
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
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ar}>
                  <DatePicker
                    label="شهر المهمة"
                    value={formData.selectedMonth}
                    onChange={handleMonthChange}
                    views={['month', 'year']}
                    openTo="month"
                    format="MM/yyyy"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        helperText: formData.selectedMonth ? 
                          `من ${formatGregorianDate(formData.startDate)} إلى ${formatGregorianDate(formData.endDate)}` : 
                          ''
                      }
                    }}
                  />
                </LocalizationProvider>
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