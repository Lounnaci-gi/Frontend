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

// Importation dynamique de MonthPicker pour éviter les dépendances circulaires
const MonthPicker = React.lazy(() => import('./MonthPicker'));

// Styles CSS pour les animations
const styles = `
  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.2);
      opacity: 0.7;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes shimmer {
    0% {
      background-position: -200px 0;
    }
    100% {
      background-position: calc(200px + 100%) 0;
    }
  }
`;

// Configuration personnalisée pour les noms de mois en arabe
const customArabicLocale = {
  ...ar,
  localize: {
    ...ar.localize,
    month: (n) => {
      const months = [
        'جانفي',
        'فيفري', 
        'مارس',
        'أفريل',
        'ماي',
        'جوان',
        'جويلية',
        'أوت',
        'سبتمبر',
        'أكتوبر',
        'نوفمبر',
        'ديسمبر'
      ];
      return months[n];
    }
  }
};

// Fonction utilitaire pour formater les dates en grégorien
const formatGregorianDate = (date) => {
  if (!date) return '';
  return format(new Date(date), 'dd/MM/yyyy', { locale: customArabicLocale });
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

  // Ajout de la fonction de vérification des missions existantes
  const hasExistingMonthlyMission = async (employeeId, selectedMonth) => {
    if (!selectedMonth || !employeeId) return false;
    
    const monthStart = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    const monthEnd = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
    
    try {
      const response = await axiosInstance.get('/missions', {
        params: {
          employee: employeeId,
          type: 'monthly',
          startDate: monthStart.toISOString(),
          endDate: monthEnd.toISOString()
        }
      });
      
      // Filtrer les missions qui se chevauchent avec le mois, en excluant la mission en cours d'édition
      const existingMissions = response.data.filter(mission => {
        const missionStart = new Date(mission.startDate);
        const missionEnd = new Date(mission.endDate);
        
        return (
          mission._id !== (mission?._id) && // Exclure la mission en cours d'édition
          ((missionStart >= monthStart && missionStart <= monthEnd) ||
           (missionEnd >= monthStart && missionEnd <= monthEnd) ||
           (missionStart <= monthStart && missionEnd >= monthEnd))
        );
      });
      
      return existingMissions.length > 0;
    } catch (error) {
      console.error('Erreur lors de la vérification des missions existantes:', error);
      return false;
    }
  };

  // Modification du gestionnaire de soumission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Vérifier si l'employé a déjà une mission mensuelle pour ce mois
      if (formData.type === 'monthly' && formData.employeeId && formData.selectedMonth) {
        if (await hasExistingMonthlyMission(formData.employeeId, formData.selectedMonth)) {
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
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }
      }}
    >
      <style>{styles}</style>
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textAlign: 'center',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          py: 3,
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60px',
            height: '3px',
            background: 'linear-gradient(90deg, #ff6b6b, #feca57)',
            borderRadius: '2px'
          }
        }}
      >
        {mission ? 'تعديل المهمة' : 'إنشاء مهمة جديدة'}
      </DialogTitle>
      <DialogContent 
        sx={{ 
          p: 4,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          minHeight: '500px'
        }}
      >
        <Box 
          component="form" 
          onSubmit={handleSubmit} 
          sx={{ 
            mt: 2,
            '& .MuiTextField-root, & .MuiFormControl-root': {
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                },
                '&.Mui-focused': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.2)',
                }
              }
            }
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="رمز المهمة"
                value={formData.code_mission}
                onChange={handleChange('code_mission')}
                required
                margin="normal"
                sx={{
                  '& .MuiInputLabel-root': {
                    color: '#667eea',
                    fontWeight: 600
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#e0e6ed',
                    },
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                      borderWidth: 2,
                    }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel sx={{ color: '#667eea', fontWeight: 600 }}>الموظف</InputLabel>
                <Select
                  value={formData.employeeId}
                  onChange={handleChange('employeeId')}
                  required
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e0e6ed',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#667eea',
                      borderWidth: 2,
                    }
                  }}
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
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        fontWeight: 600,
                        '& .MuiChip-deleteIcon': {
                          color: 'rgba(255, 255, 255, 0.8)',
                          '&:hover': {
                            color: 'white',
                          }
                        }
                      }}
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
                    sx={{
                      '& .MuiInputLabel-root': {
                        color: '#667eea',
                        fontWeight: 600
                      },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#e0e6ed',
                        },
                        '&:hover fieldset': {
                          borderColor: '#667eea',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#667eea',
                          borderWidth: 2,
                        }
                      }
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel sx={{ color: '#667eea', fontWeight: 600 }}>نوع المهمة</InputLabel>
                <Select
                  value={formData.type}
                  onChange={handleTypeChange}
                  required
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e0e6ed',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#667eea',
                      borderWidth: 2,
                    }
                  }}
                >
                  <MenuItem value="monthly">مهمة شهرية</MenuItem>
                  <MenuItem value="special">مهمة خاصة</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {formData.type === 'monthly' ? (
              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    boxShadow: '0 4px 15px rgba(240, 147, 251, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '2px',
                      background: 'linear-gradient(90deg, #ff6b6b, #feca57, #48dbfb)',
                    }
                  }}
                >
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
                </Box>
              </Grid>
            ) : (
              <>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={customArabicLocale}>
                    <DatePicker
                      label="تاريخ البداية"
                      value={formData.startDate}
                      onChange={(date) => setFormData(prev => ({ ...prev, startDate: date }))}
                      format="dd/MM/yyyy"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: "small",
                          sx: {
                            '& .MuiInputBase-root': {
                              fontSize: '0.875rem',
                              height: '40px'
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: '0.875rem',
                              color: '#667eea',
                              fontWeight: 600
                            },
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: '#e0e6ed',
                              },
                              '&:hover fieldset': {
                                borderColor: '#667eea',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#667eea',
                                borderWidth: 2,
                              }
                            }
                          }
                        },
                        popper: {
                          sx: {
                            '& .MuiPickersMonth-root': {
                              fontSize: '0.875rem',
                              minHeight: '36px'
                            },
                            '& .MuiPickersYear-yearButton': {
                              fontSize: '0.875rem'
                            }
                          }
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={customArabicLocale}>
                    <DatePicker
                      label="تاريخ النهاية"
                      value={formData.endDate}
                      onChange={(date) => setFormData(prev => ({ ...prev, endDate: date }))}
                      format="dd/MM/yyyy"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: "small",
                          sx: {
                            '& .MuiInputBase-root': {
                              fontSize: '0.875rem',
                              height: '40px'
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: '0.875rem',
                              color: '#667eea',
                              fontWeight: 600
                            },
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: '#e0e6ed',
                              },
                              '&:hover fieldset': {
                                borderColor: '#667eea',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#667eea',
                                borderWidth: 2,
                              }
                            }
                          }
                        },
                        popper: {
                          sx: {
                            '& .MuiPickersMonth-root': {
                              fontSize: '0.875rem',
                              minHeight: '36px'
                            },
                            '& .MuiPickersYear-yearButton': {
                              fontSize: '0.875rem'
                            }
                          }
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
              </>
            )}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel sx={{ color: '#667eea', fontWeight: 600 }}>الحالة</InputLabel>
                <Select
                  value={formData.status}
                  onChange={handleChange('status')}
                  required
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e0e6ed',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#667eea',
                      borderWidth: 2,
                    }
                  }}
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
                sx={{
                  '& .MuiInputLabel-root': {
                    color: '#667eea',
                    fontWeight: 600
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#e0e6ed',
                    },
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                      borderWidth: 2,
                    }
                  }
                }}
              />
            </Grid>
          </Grid>
          {error && (
            <Box 
              sx={{ 
                color: '#f44336',
                mt: 3,
                p: 2,
                borderRadius: 2,
                background: 'rgba(244, 67, 54, 0.1)',
                border: '1px solid rgba(244, 67, 54, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#f44336',
                  animation: 'pulse 2s infinite'
                }}
              />
              {error}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          p: 3,
          background: 'rgba(255, 255, 255, 0.9)',
          borderTop: '1px solid rgba(0, 0, 0, 0.1)',
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
        }}
      >
        <Button 
          onClick={handleClose}
          sx={{
            borderRadius: 2,
            px: 4,
            py: 1.5,
            background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
            color: 'white',
            fontWeight: 600,
            '&:hover': {
              background: 'linear-gradient(135deg, #ff8a8e 0%, #febfdf 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(255, 154, 158, 0.4)',
            }
          }}
        >
          إلغاء
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{
            borderRadius: 2,
            px: 4,
            py: 1.5,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontWeight: 600,
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
            },
            '&:disabled': {
              background: 'linear-gradient(135deg, #bdc3c7 0%, #95a5a6 100%)',
              transform: 'none',
              boxShadow: 'none',
            }
          }}
        >
          {loading ? 'جاري الحفظ...' : mission ? 'تحديث' : 'حفظ'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MissionForm; 