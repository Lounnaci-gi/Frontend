import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Checkbox,
  Tooltip,
  Grid,
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Print as PrintIcon,
  QrCode as QrCodeIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { fetchMissionsStart, fetchMissionsSuccess, fetchMissionsFailure } from '../../store/slices/missionsSlice';
import axiosInstance from '../../config/axios';
import MissionForm from './MissionForm';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

// Fonction utilitaire pour formater les dates en grégorien
const formatGregorianDate = (date) => {
  if (!date) return '';
  return format(new Date(date), 'dd/MM/yyyy', { locale: ar });
};

// Fonction utilitaire pour formater les dates de mission
const formatMissionDates = (mission) => {
  if (!mission.startDate || !mission.endDate) return '';
  return `${formatGregorianDate(mission.startDate)} - ${formatGregorianDate(mission.endDate)}`;
};

const statusColors = {
  active: 'success',
  completed: 'info',
  cancelled: 'error',
};

const missionTypeColors = {
  monthly: 'primary',
  special: 'secondary',
};

const Missions = () => {
  const dispatch = useDispatch();
  const { missions } = useSelector((state) => state.missions);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [missionToDelete, setMissionToDelete] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCentre, setSelectedCentre] = useState('all');
  const [centres, setCentres] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [groupMissionDialogOpen, setGroupMissionDialogOpen] = useState(false);
  const [selectedDestinations, setSelectedDestinations] = useState([]);
  const [destinationInput, setDestinationInput] = useState('');
  const [missionDates, setMissionDates] = useState({
    startDate: null,
    endDate: null,
  });
  const [groupMissionData, setGroupMissionData] = useState({
    destination: '',
    dateDebut: null,
    dateFin: null
  });
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedTransportMode, setSelectedTransportMode] = useState('');
  const [transportModeInput, setTransportModeInput] = useState('');
  const [formValid, setFormValid] = useState(false);
  const [transportModes, setTransportModes] = useState([
    'سيارة الخدمة',
    'سيارة شخصية',
    'شاحنة',
    'شاحنة صهريج'
  ]);

  // Fonction pour vérifier si une chaîne ne contient que des caractères arabes (incluant espaces)
  const isArabicText = (text) => {
    if (text === null || typeof text !== 'string') return false; 
    if (text.trim() === '') return true; // Allow empty/whitespace for typing, validation handles required fields

    const latinPattern = /[a-zA-Z]/; 
    if (latinPattern.test(text)) {
      console.log(`isArabicText: Caractères latins détectés dans "${text}"`);
      return false;
    }
    
    const nonArabicAndSpacePattern = /[^\u0600-\u06FF\s]/;
    if (nonArabicAndSpacePattern.test(text)) {
        console.log(`isArabicText: Caractères non arabes ou non-espaces détectés dans "${text}"`);
        return false;
    }
    return true;
  };

  // Unified function to handle key down events for input fields (blocking Latin, committing on Enter)
  const handleInputKeyDown = (event, inputState, setInputState, setSelectedState, isMultiple = false, optionsList = null) => {
    // Prevent Latin character input
    const latinPattern = /[a-zA-Z]/;
    if (latinPattern.test(event.key)) {
      event.preventDefault();
      setError('يرجى استخدام الأحرف العربية فقط');
      return;
    }

    // Handle Enter key for committing values
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent default form submission
      const typedText = inputState.trim();

      if (typedText !== '' && isArabicText(typedText)) {
        if (isMultiple) {
          setSelectedState(prev => {
            if (!prev.includes(typedText)) {
              return [...prev, typedText];
            }
            return prev;
          });
        } else {
          setSelectedState(typedText);
          if (optionsList && !optionsList.includes(typedText)) {
            setTransportModes(prev => [...prev, typedText]); // Add to options if new transport mode
          }
        }
        setInputState(''); // Clear input after adding
        setError(null);
      } else if (typedText !== '' && !isArabicText(typedText)) {
        setError('يرجى استخدام الأحرف العربية فقط');
      }
    }
  };

  // Unified function to handle input text change (for controlled components)
  const handleInputTextChange = (event, setInputState) => {
    const typedText = event.target.value;
    if (isArabicText(typedText)) {
      setInputState(typedText); // Only update state if text is Arabic
      setError(null);
    } else {
      setError('يرجى استخدام الأحرف العربية فقط');
    }
  };

  // Unified function to handle paste for validation and setting input state
  const handleInputPaste = (e, setInputState) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    if (isArabicText(pastedText)) {
      setInputState(pastedText); // Set input value
      setError(null);
    } else {
      setError('يرجى استخدام الأحرف العربية فقط');
    }
  };

  // Unified function to handle blur for committing values
  const handleInputBlur = (inputState, setInputState, setSelectedState, isMultiple = false, optionsList = null) => {
    const typedText = inputState.trim();
    if (typedText !== '' && isArabicText(typedText)) {
      if (isMultiple) {
        setSelectedState(prev => {
          if (!prev.includes(typedText)) {
            return [...prev, typedText];
          }
          return prev;
        });
      } else {
        setSelectedState(typedText);
        if (optionsList && !optionsList.includes(typedText)) {
          setTransportModes(prev => [...prev, typedText]);
        }
      }
      setInputState('');
      setError(null);
    } else if (typedText !== '' && !isArabicText(typedText)) {
      setError('يرجى استخدام الأحرف العربية فقط');
    }
  };

  // Fonction pour valider et mettre à jour les destinations (gère les chips sélectionnées)
  const handleDestinationChange = (event, newValue) => {
    console.log('handleDestinationChange (chips) - newValue:', newValue);
    const validNewValue = newValue.filter(item => item && item.trim() !== '' && isArabicText(item));
    setSelectedDestinations(validNewValue);
    setError(null);
  };

  // Fonction pour valider et mettre à jour le moyen de transport (gère la valeur sélectionnée)
  const handleTransportModeChange = (event, newValue) => {
    console.log('handleTransportModeChange (value) - newValue:', newValue);
    if (newValue === null || newValue.trim() === '') {
      setSelectedTransportMode('');
      setError(null);
      return;
    }
    if (!isArabicText(newValue)) {
      setError('يرجى استخدام الأحرف العربية فقط في وسيلة النقل');
      return;
    }
    if (!transportModes.includes(newValue)) {
      setTransportModes(prev => [...prev, newValue]);
    }
    setSelectedTransportMode(newValue);
    setError(null);
  };

  // useEffect pour la validation du formulaire
  useEffect(() => {
    const isValid = Boolean(
      selectedMonth && 
      selectedEmployees.length > 0 && 
      selectedTransportMode && 
      selectedDestinations.length > 0
    );
    console.log('Validation du formulaire:', {
      selectedMonth: Boolean(selectedMonth),
      hasEmployees: selectedEmployees.length > 0,
      hasTransport: Boolean(selectedTransportMode),
      hasDestinations: selectedDestinations.length > 0,
      isValid
    });
    setFormValid(isValid);
  }, [selectedMonth, selectedEmployees, selectedTransportMode, selectedDestinations]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/employees');
        console.log('Raw employees data:', response.data);
        
        if (Array.isArray(response.data)) {
          const activeEmployees = response.data.filter(emp => 
            emp.status === 'active' || emp.status === 'نشط' || emp.status === 'Active'
          );
          console.log('Active employees:', activeEmployees);
          setEmployees(activeEmployees);
          
          const centresList = activeEmployees
            .map(emp => emp.centre)
            .filter(centre => centre && centre.trim() !== '')
            .sort((a, b) => a.localeCompare(b));
          
          const uniqueCentres = [...new Set(centresList)];
          console.log('Unique centres:', uniqueCentres);
          setCentres(uniqueCentres);
        } else {
          console.error('Invalid employees data format:', response.data);
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        dispatch(fetchMissionsStart());
        const response = await axiosInstance.get('/missions');
        console.log('Missions data:', response.data);
        console.log('Sample mission employee:', response.data[0]?.employee);
        dispatch(fetchMissionsSuccess(response.data));
      } catch (error) {
        dispatch(fetchMissionsFailure(error.message));
      }
    };

    fetchMissions();
  }, [dispatch]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
  };

  const filteredMissions = missions.filter((mission) => {
    const matchesSearch = Object.values(mission).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesTab = tabValue === 0 ? true : mission.type === (tabValue === 1 ? 'monthly' : 'special');
    return matchesSearch && matchesTab;
  });

  const handleOpenForm = (mission = null) => {
    setSelectedMission(mission);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setSelectedMission(null);
    setFormOpen(false);
  };

  const handleDeleteClick = (mission) => {
    setMissionToDelete(mission);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axiosInstance.delete(`/missions/${missionToDelete._id}`);
      dispatch(fetchMissionsStart());
      const response = await axiosInstance.get('/missions');
      dispatch(fetchMissionsSuccess(response.data));
      setDeleteDialogOpen(false);
      setMissionToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setMissionToDelete(null);
  };

  const handleFormSuccess = async () => {
    dispatch(fetchMissionsStart());
    const response = await axiosInstance.get('/missions');
    dispatch(fetchMissionsSuccess(response.data));
  };

  const filteredEmployees = useMemo(() => {
    console.log('Filtering employees:', {
      total: employees.length,
      selectedCentre,
      searchTerm
    });
    
    return employees.filter(employee => {
      const matchesCentre = selectedCentre === 'all' || employee.centre === selectedCentre;
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        employee.nom?.toLowerCase().includes(searchTermLower) ||
        employee.prenom?.toLowerCase().includes(searchTermLower) ||
        employee.matricule?.toLowerCase().includes(searchTermLower) ||
        employee.poste?.toLowerCase().includes(searchTermLower) ||
        employee.code?.toLowerCase().includes(searchTermLower);
      
      console.log('Employee filter check:', {
        matricule: employee.matricule,
        code: employee.code,
        centre: employee.centre,
        poste: employee.poste,
        selectedCentre,
        matchesCentre,
        matchesSearch
      });
      
      return matchesCentre && matchesSearch;
    });
  }, [employees, selectedCentre, searchTerm]);

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployees(prev => {
      const isSelected = prev.some(emp => emp._id === employee._id);
      if (isSelected) {
        return prev.filter(emp => emp._id !== employee._id);
      } else {
        return [...prev, employee];
      }
    });
  };

  const handleSelectAll = () => {
    const allSelected = filteredEmployees.every(emp => 
      selectedEmployees.some(selected => selected._id === emp._id)
    );

    if (allSelected) {
      setSelectedEmployees(prev => 
        prev.filter(emp => !filteredEmployees.some(filtered => filtered._id === emp._id))
      );
    } else {
      const newSelected = [...selectedEmployees];
      filteredEmployees.forEach(emp => {
        if (!newSelected.some(selected => selected._id === emp._id)) {
          newSelected.push(emp);
        }
      });
      setSelectedEmployees(newSelected);
    }
  };

  const getMonthStartAndEnd = (date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return { start, end };
  };

  const handleMonthChange = (date) => {
    console.log('handleMonthChange appelé avec:', date);
    if (date) {
      const { start, end } = getMonthStartAndEnd(date);
      setSelectedMonth(date);
      setMissionDates({
        startDate: start,
        endDate: end
      });
      console.log('selectedMonth et missionDates mis à jour:', { date, start, end });
    } else {
        setSelectedMonth(null);
        setMissionDates({ startDate: null, endDate: null });
    }
  };

  // Fonction pour générer un code unique de mission au format NNNNN/YYYY
  const generateMissionCode = (sequenceNumber, missionYear) => {
    const paddedSequence = String(sequenceNumber).padStart(5, '0');
    return `${paddedSequence}/${missionYear}`;
  };

  const handleCreateGroupMission = async () => {
    try {
      if (!formValid) {
        console.log('Validation du formulaire échouée:', {
          selectedMonth,
          selectedEmployees: selectedEmployees.length,
          selectedTransportMode,
          selectedDestinations: selectedDestinations.length
        });
        setError('يرجى ملء جميع الحقول المطلوبة');
        return;
      }

      // Validation supplémentaire des dates
      if (!missionDates.startDate || !missionDates.endDate) {
        console.error('Dates manquantes:', missionDates);
        setError('يرجى تحديد شهر المهمة');
        return;
      }

      // Validation des employés
      if (selectedEmployees.length === 0) {
        console.error('Aucun employé sélectionné');
        setError('يرجى تحديد موظف واحد على الأقل');
        return;
      }

      // Validation des destinations
      if (selectedDestinations.length === 0) {
        console.error('Aucune destination sélectionnée');
        setError('يرجى تحديد وجهة واحدة على الأقل');
        return;
      }

      // Validation du mode de transport
      if (!selectedTransportMode || selectedTransportMode.trim() === '') {
        console.error('Mode de transport manquant');
        setError('يرجى تحديد وسيلة النقل');
        return;
      }

      // Création des missions individuelles pour chaque employé
      const missionsToCreate = selectedEmployees.map((employee, index) => {
        if (!employee._id || !employee.matricule) {
          throw new Error(`Données employé incomplètes: ${employee.nom} ${employee.prenom}`);
        }

        // Extraction de l'année de la mission
        const missionYear = missionDates.startDate.getFullYear();
        // Génération d'un code unique pour chaque mission selon le format désiré
        const missionCode = generateMissionCode(index + 1, missionYear);
        console.log('Code de mission généré:', missionCode);

        return {
          code: missionCode,
          type: 'monthly',
          status: 'active',
          destination: selectedDestinations[0],
          startDate: missionDates.startDate.toISOString(),
          endDate: missionDates.endDate.toISOString(),
          employee: employee._id,
          transportMode: selectedTransportMode.trim(),
        };
      });

      console.log('Missions à créer:', missionsToCreate.map(mission => ({
        code: mission.code,
        employee: mission.employee,
        destination: mission.destination,
        dates: {
          start: formatGregorianDate(mission.startDate),
          end: formatGregorianDate(mission.endDate)
        },
        transportMode: mission.transportMode
      })));

      try {
        // Création des missions une par une avec gestion des erreurs individuelles
        const results = await Promise.allSettled(
          missionsToCreate.map(missionData => 
            axiosInstance.post('/missions', missionData)
          )
        );

        // Vérification des résultats
        const errors = results.filter(result => result.status === 'rejected');
        const successes = results.filter(result => result.status === 'fulfilled');

        if (errors.length > 0) {
          console.error('Erreurs lors de la création des missions:', errors);
          const errorMessages = errors.map(error => {
            if (error.reason?.response?.data?.message) {
              return error.reason.response.data.message;
            }
            return error.reason?.message || 'Erreur inconnue';
          });
          setError(`Erreurs lors de la création de ${errors.length} mission(s):\n${errorMessages.join('\n')}`);
        }

        if (successes.length > 0) {
          console.log('Missions créées avec succès:', successes.map(res => res.value.data));
          
          // Réinitialisation du formulaire
          setGroupMissionDialogOpen(false);
          setSelectedEmployees([]);
          setSelectedDestinations([]);
          setDestinationInput('');
          setSelectedTransportMode('');
          setTransportModeInput('');
          setSelectedMonth(null);
          setMissionDates({ startDate: null, endDate: null });
          setError(null);
          setFormValid(false);
          
          // Rafraîchir la liste des missions
          dispatch(fetchMissionsStart());
          const missionsResponse = await axiosInstance.get('/missions');
          dispatch(fetchMissionsSuccess(missionsResponse.data));
        }
      } catch (error) {
        console.error('Erreur détaillée lors de la création de la mission:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            data: JSON.parse(error.config?.data || '{}')
          }
        });

        let errorMessage = 'Une erreur est survenue lors de la création de la mission';
        
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.status === 400) {
          if (error.response?.data?.errors) {
            const validationErrors = error.response.data.errors;
            errorMessage = Object.entries(validationErrors)
              .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
              .join('\n');
          } else {
            errorMessage = 'البيانات المدخلة غير صحيحة';
          }
        } else if (error.response?.status === 401) {
          errorMessage = 'غير مصرح لك بإنشاء المهام';
        } else if (error.response?.status === 500) {
          errorMessage = 'خطأ في الخادم، يرجى المحاولة مرة أخرى لاحقاً';
        }
        
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Erreur inattendue:', error);
      setError('حدث خطأ غير متوقع');
    }
  };

  const renderEmployeesList = () => {
    console.log('Rendering employees list:', {
      loading,
      totalEmployees: employees.length,
      filteredEmployees: filteredEmployees.length,
      selectedCentre,
      searchTerm
    });
    
    return (
      <>
        <Paper sx={{ mb: 2, p: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'flex-end'
          }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>المركز</InputLabel>
              <Select
                value={selectedCentre}
                onChange={(e) => {
                  console.log('Selected centre changed:', e.target.value);
                  setSelectedCentre(e.target.value);
                }}
                label="المركز"
              >
                <MenuItem value="all">جميع المراكز</MenuItem>
                {centres.map((centre) => (
                  <MenuItem key={centre} value={centre}>
                    {centre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="بحث عن موظف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Paper>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 2,
          px: 3,
          mx: 0,
          mb: 2,
          flexDirection: 'row-reverse'
        }}>
          <Box sx={{ width: '40px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }} />
          <Box sx={{ width: '40px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }} />
          <Typography sx={{ width: '80px', textAlign: 'right', px: 0 }}>
            الحالة
          </Typography>
          <Typography sx={{ width: '100px', textAlign: 'right', px: 0 }}>
            الهاتف
          </Typography>
          <Typography sx={{ width: '80px', textAlign: 'right', px: 0 }}>
            الجنس
          </Typography>
          <Typography sx={{ width: '120px', textAlign: 'right', px: 0 }}>
            الوظيفة
          </Typography>
          <Typography sx={{ width: '200px', textAlign: 'left', px: 0, pl: 2 }}>
            الاسم و اللقب
          </Typography>
          <Typography sx={{ width: '80px', textAlign: 'left', px: 0, pl: 2 }}>
            رمز الموظف
          </Typography>
        </Box>

        <Box sx={{ 
          mb: 2, 
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          px: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleSelectAll}
              sx={{ minWidth: '150px' }}
              disabled={filteredEmployees.length === 0}
            >
              {filteredEmployees.every(emp => 
                selectedEmployees.some(selected => selected._id === emp._id)
              ) ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
            </Button>
            {selectedEmployees.length > 0 && (
              <Typography>
                {selectedEmployees.length} موظف محدد
              </Typography>
            )}
          </Box>
          {selectedEmployees.length > 0 && (
            <Button
              variant="contained"
              startIcon={<AssignmentIcon />}
              onClick={() => setGroupMissionDialogOpen(true)}
            >
              إنشاء مهمة للموظفين المحددين
            </Button>
          )}
        </Box>

        <Paper sx={{ mt: 2 }}>
          <List sx={{ px: 3, mx: 0 }}>
            {filteredEmployees.length > 0 ? (
              filteredEmployees
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((employee, index) => (
                  <React.Fragment key={employee._id}>
                    <ListItem
                      sx={{
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                        flexDirection: 'row-reverse',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        justifyContent: 'flex-start',
                        px: 0,
                        mx: 0
                      }}
                    >
                      <Box sx={{ width: '40px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <Checkbox
                          edge="end"
                          checked={selectedEmployees.some(emp => emp._id === employee._id)}
                          onChange={() => handleEmployeeSelect(employee)}
                        />
                      </Box>
                      <ListItemIcon sx={{ width: '40px', minWidth: '40px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <PersonIcon color="primary" />
                      </ListItemIcon>
                      <Typography sx={{ 
                        width: '80px', 
                        textAlign: 'right', 
                        px: 0,
                        pr: 2
                      }}>
                        {employee.matricule}
                      </Typography>
                      <Box sx={{ width: '200px', textAlign: 'right', px: 0, pr: 2 }}>
                        <Typography sx={{ fontWeight: 'medium' }}>
                          {`${employee.nom} ${employee.prenom}`}
                        </Typography>
                      </Box>
                      <Typography sx={{ width: '120px', textAlign: 'right', px: 0 }}>
                        {employee.poste || '-'}
                      </Typography>
                      <Typography sx={{ 
                        width: '120px', 
                        textAlign: 'right', 
                        px: 0,
                        pr: 2
                      }}>
                        {employee.centre || 'غير محدد'}
                      </Typography>
                      <Typography sx={{ width: '80px', textAlign: 'right', px: 0 }}>
                        {employee.sexe === 'M' ? 'ذكر' : 'أنثى'}
                      </Typography>
                      <Typography sx={{ width: '100px', textAlign: 'right', px: 0 }}>
                        {employee.telephone || '-'}
                      </Typography>
                      <Box sx={{ width: '80px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <Chip
                          label="نشط"
                          color="success"
                          size="small"
                        />
                      </Box>
                    </ListItem>
                    {index < filteredEmployees.length - 1 && <Divider />}
                  </React.Fragment>
                ))
            ) : (
              <ListItem>
                <ListItemText 
                  primary="لا يوجد موظفون نشطين في هذه الفئة"
                  sx={{ textAlign: 'center' }}
                />
              </ListItem>
            )}
          </List>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredEmployees.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="عدد الصفوف في الصفحة"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} من ${count}`}
          />
        </Paper>
      </>
    );
  };

  return (
    <Box sx={{ 
      flexGrow: 1,
      p: { xs: 2, sm: 3 },
      maxWidth: '100%',
      overflow: 'hidden',
      marginLeft: { sm: '240px' },
      width: { sm: 'calc(100% - 240px)' },
      position: 'relative',
      zIndex: 1,
      bgcolor: 'background.default',
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        mb: 3,
        flexDirection: 'row-reverse'
      }}>
        <Typography variant="h4" component="h1">
          المهام
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
        >
          إضافة مهمة
        </Button>
      </Box>

      <Paper sx={{ mb: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTabs-flexContainer': {
              justifyContent: 'flex-end',
            },
            '& .MuiTab-root': {
              minWidth: 120,
              textAlign: 'right',
            }
          }}
        >
          <Tab label="المهام الشهرية" />
          <Tab label="المهام" />
        </Tabs>

        {tabValue === 0 && (
          <>
            <Paper sx={{ mb: 2, p: 2 }}>
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'stretch', sm: 'center' },
                justifyContent: 'flex-end'
              }}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>المركز</InputLabel>
                  <Select
                    value={selectedCentre}
                    onChange={(e) => {
                      console.log('Selected centre changed:', e.target.value);
                      setSelectedCentre(e.target.value);
                    }}
                    label="المركز"
                  >
                    <MenuItem value="all">جميع المراكز</MenuItem>
                    {centres.map((centre) => (
                      <MenuItem key={centre} value={centre}>
                        {centre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="بحث عن موظف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Paper>

            <Box sx={{ 
              mb: 2, 
              display: 'flex', 
              justifyContent: 'flex-end', 
              alignItems: 'center',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              px: 3
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleSelectAll}
                  sx={{ minWidth: '150px' }}
                  disabled={filteredEmployees.length === 0}
                >
                  {filteredEmployees.every(emp => 
                    selectedEmployees.some(selected => selected._id === emp._id)
                  ) ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
                </Button>
                {selectedEmployees.length > 0 && (
                  <Typography>
                    {selectedEmployees.length} موظف محدد
                  </Typography>
                )}
              </Box>
              {selectedEmployees.length > 0 && (
                <Button
                  variant="contained"
                  startIcon={<AssignmentIcon />}
                  onClick={() => setGroupMissionDialogOpen(true)}
                >
                  إنشاء مهمة للموظفين المحددين
                </Button>
              )}
            </Box>

            <Paper sx={{ mt: 2 }}>
              <List sx={{ px: 3, mx: 0 }}>
                {filteredEmployees.length > 0 ? (
                  filteredEmployees
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((employee, index) => (
                      <React.Fragment key={employee._id}>
                        <ListItem
                          sx={{
                            '&:hover': {
                              bgcolor: 'action.hover',
                            },
                            flexDirection: 'row-reverse',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            justifyContent: 'flex-start',
                            px: 0,
                            mx: 0
                          }}
                        >
                          <Box sx={{ width: '40px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <Checkbox
                              edge="end"
                              checked={selectedEmployees.some(emp => emp._id === employee._id)}
                              onChange={() => handleEmployeeSelect(employee)}
                            />
                          </Box>
                          <ListItemIcon sx={{ width: '40px', minWidth: '40px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <PersonIcon color="primary" />
                          </ListItemIcon>
                          <Typography sx={{ 
                            width: '80px', 
                            textAlign: 'right', 
                            px: 0,
                            pr: 2
                          }}>
                            {employee.matricule}
                          </Typography>
                          <Box sx={{ width: '200px', textAlign: 'right', px: 0, pr: 2 }}>
                            <Typography sx={{ fontWeight: 'medium' }}>
                              {`${employee.nom} ${employee.prenom}`}
                            </Typography>
                          </Box>
                          <Typography sx={{ width: '120px', textAlign: 'right', px: 0 }}>
                            {employee.poste || '-'}
                          </Typography>
                          <Typography sx={{ 
                            width: '120px', 
                            textAlign: 'right', 
                            px: 0,
                            pr: 2
                          }}>
                            {employee.centre || 'غير محدد'}
                          </Typography>
                          <Typography sx={{ width: '80px', textAlign: 'right', px: 0 }}>
                            {employee.sexe === 'M' ? 'ذكر' : 'أنثى'}
                          </Typography>
                          <Typography sx={{ width: '100px', textAlign: 'right', px: 0 }}>
                            {employee.telephone || '-'}
                          </Typography>
                          <Box sx={{ width: '80px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <Chip
                              label="نشط"
                              color="success"
                              size="small"
                            />
                          </Box>
                        </ListItem>
                        {index < filteredEmployees.length - 1 && <Divider />}
                      </React.Fragment>
                    ))
                ) : (
                  <ListItem>
                    <ListItemText 
                      primary="لا يوجد موظفون نشطين في هذه الفئة"
                      sx={{ textAlign: 'center' }}
                    />
                  </ListItem>
                )}
              </List>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredEmployees.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="عدد الصفوف في الصفحة"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} من ${count}`}
              />
            </Paper>
          </>
        )}
        {tabValue === 1 && <MissionForm />}
      </Paper>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>الحالة</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>الهاتف</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>الجنس</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>الوظيفة</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>اللقب</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>الاسم</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>رمز الموظف</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>المهمة</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMissions
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((mission) => (
                <TableRow key={mission._id}>
                  <TableCell align="right">{mission.employee.status === 'active' ? 'نشط' : mission.employee.status === 'inactive' ? 'غير نشط' : mission.employee.status}</TableCell>
                  <TableCell align="right">{mission.employee.telephone || '-'}</TableCell>
                  <TableCell align="right">{mission.employee.sexe === 'M' ? 'ذكر' : 'أنثى'}</TableCell>
                  <TableCell align="right">{mission.employee.fonction}</TableCell>
                  <TableCell align="right">{mission.employee.prenom}</TableCell>
                  <TableCell align="right">{mission.employee.nom}</TableCell>
                  <TableCell align="right">{mission.employee.code}</TableCell>
                  <TableCell align="right">{formatMissionDates(mission)}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <MissionForm
        open={formOpen}
        handleClose={handleCloseForm}
        mission={selectedMission}
        onSuccess={handleFormSuccess}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent>
          <DialogContentText>
            هل أنت متأكد من حذف هذه المهمة؟
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>إلغاء</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            حذف
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={groupMissionDialogOpen}
        onClose={() => {
          setGroupMissionDialogOpen(false);
          setSelectedEmployees([]);
          setSelectedDestinations([]);
          setDestinationInput(''); // Reset input states
          setSelectedTransportMode('');
          setTransportModeInput(''); // Reset input states
          setSelectedMonth(null);
          setMissionDates({ startDate: null, endDate: null });
          setError(null);
          setFormValid(false);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          إنشاء مهمة جماعية
          <Typography variant="subtitle1" sx={{ mt: 1, color: 'text.secondary' }}>
            عدد الموظفين المحددين: {selectedEmployees.length}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="شهر المهمة"
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  views={['month', 'year']}
                  openTo="month"
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth 
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={[]}
                freeSolo
                value={selectedDestinations}
                onChange={handleDestinationChange} // This handles changes to the selected chips
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
                    required
                    value={destinationInput} // Controlled input
                    onChange={(e) => handleInputTextChange(e, setDestinationInput)} // Update input state and validate
                    onKeyDown={(e) => handleInputKeyDown(e, destinationInput, setDestinationInput, setSelectedDestinations, true)} // Handle Enter and Latin keys
                    onBlur={() => handleInputBlur(destinationInput, setDestinationInput, setSelectedDestinations, true)} // Commit on blur
                    inputProps={{
                      ...params.inputProps,
                      onPaste: (e) => handleInputPaste(e, setDestinationInput), // Handle paste
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                freeSolo
                options={transportModes}
                value={selectedTransportMode}
                onChange={handleTransportModeChange} // This handles selection from options or pressing Enter
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="وسيلة النقل"
                    required
                    placeholder="أضف وسيلة نقل"
                    value={transportModeInput} // Controlled input
                    onChange={(e) => handleInputTextChange(e, setTransportModeInput)} // Update input state and validate
                    onKeyDown={(e) => handleInputKeyDown(e, transportModeInput, setTransportModeInput, setSelectedTransportMode, false, transportModes)} // Handle Enter and Latin keys
                    onBlur={() => handleInputBlur(transportModeInput, setTransportModeInput, setSelectedTransportMode, false, transportModes)} // Commit on blur
                    inputProps={{
                      ...params.inputProps,
                      onPaste: (e) => handleInputPaste(e, setTransportModeInput), // Handle paste
                    }}
                  />
                )}
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
          <Button
            onClick={handleCreateGroupMission}
            variant="contained"
            color="primary"
            disabled={!formValid}
            sx={{ 
              '&.Mui-disabled': {
                backgroundColor: 'rgba(0, 0, 0, 0.12)',
                color: 'rgba(0, 0, 0, 0.26)'
              }
            }}
          >
            إنشاء المهمة
          </Button>
          <Button 
            onClick={() => {
              setGroupMissionDialogOpen(false);
              setSelectedEmployees([]);
              setSelectedDestinations([]);
              setDestinationInput(''); // Reset input states
              setSelectedTransportMode('');
              setTransportModeInput(''); // Reset input states
              setSelectedMonth(null);
              setMissionDates({ startDate: null, endDate: null });
              setError(null);
              setFormValid(false);
            }}
            variant="outlined"
            color="error"
          >
            إلغاء
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Missions; 