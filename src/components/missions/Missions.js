import React, { useEffect, useState, useMemo, useRef } from 'react';
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
import { useReactToPrint } from 'react-to-print';
import MissionPrint from './MissionPrint';

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
  const cardRef = useRef(null);
  const printRef = useRef(); // Ref pour le composant d'impression
  const { employees: employeesFromStore, loading: employeesLoading } = useSelector((state) => state.employees);
  const { missions, loading: missionsLoading } = useSelector((state) => state.missions);
  
  // États de base
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [centres, setCentres] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCentre, setSelectedCentre] = useState('all');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedDestinations, setSelectedDestinations] = useState([]);
  const [selectedTransportMode, setSelectedTransportMode] = useState('');
  const [missionDates, setMissionDates] = useState({
    startDate: null,
    endDate: null,
  });
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [transportModeInput, setTransportModeInput] = useState('');
  const [formValid, setFormValid] = useState(false);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [destinationInput, setDestinationInput] = useState('');
  const [showCreateMissionButton, setShowCreateMissionButton] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'code_mission', direction: 'asc' });

  // États pour les dialogues
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupMissionDialogOpen, setGroupMissionDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState(null);
  const [missionToDelete, setMissionToDelete] = useState(null);
  const [printDialogOpen, setPrintDialogOpen] = useState(false); // État pour le dialogue d'impression

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Mission-${selectedMission?.code_mission || 'Impression'}`, // Nom du fichier PDF
    pageStyle: `@page { size: A4; margin: 0; } body { margin: 0; }`,
    onAfterPrint: () => setPrintDialogOpen(false), // Fermer le dialogue après impression
  });

  const [transportModes, setTransportModes] = useState([
    'سيارة الخدمة',
    'سيارة شخصية',
    'شاحنة',
    'شاحنة صهريج'
  ]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/employees');
        
        if (Array.isArray(response.data)) {
          const activeEmployees = response.data.filter(emp => 
            emp.status === 'active' || emp.status === 'نشط' || emp.status === 'Active'
          );
          setEmployees(activeEmployees);
          
          const centresList = activeEmployees
            .map(emp => emp.centre)
            .filter(centre => centre && centre.trim() !== '')
            .sort((a, b) => a.localeCompare(b));
          
          const uniqueCentres = [...new Set(centresList)];
          setCentres(uniqueCentres);
        }
      } catch (error) {
        setError('Erreur lors de la récupération des employés');
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
        dispatch(fetchMissionsSuccess(response.data));
      } catch (error) {
        dispatch(fetchMissionsFailure(error.message));
      }
    };

    fetchMissions();
  }, [dispatch]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      const matchesCentre = selectedCentre === 'all' || employee.centre === selectedCentre;
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        employee.nom?.toLowerCase().includes(searchTermLower) ||
        employee.prenom?.toLowerCase().includes(searchTermLower) ||
        employee.matricule?.toLowerCase().includes(searchTermLower) ||
        employee.poste?.toLowerCase().includes(searchTermLower) ||
        employee.code?.toLowerCase().includes(searchTermLower);
      
      return matchesCentre && matchesSearch;
    });
  }, [employees, selectedCentre, searchTerm]);

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

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredMissions = useMemo(() => {
    let filtered = missions.filter((mission) => {
      const matchesSearch = Object.values(mission).some((value) =>
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesTab = tabValue === 0 ? true : mission.type === (tabValue === 1 ? 'monthly' : 'special');
      return matchesSearch && matchesTab;
    });

    // Tri des missions
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';
        
        if (sortConfig.direction === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      });
    }

    return filtered;
  }, [missions, searchTerm, tabValue, sortConfig]);

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
      setDeleteDialogOpen(false);
      setMissionToDelete(null);
      handleFormSuccess();
    } catch (error) {
      setError(error.response?.data?.message || 'Une erreur est survenue lors de la suppression de la mission');
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

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployees(prev => {
      const isSelected = prev.some(emp => emp._id === employee._id);
      const newSelection = isSelected 
        ? prev.filter(emp => emp._id !== employee._id)
        : [...prev, employee];
      
      // Mettre à jour l'état du bouton en fonction de la sélection
      setShowCreateMissionButton(newSelection.length > 0);
      
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    const allSelected = filteredEmployees.every(emp => 
      selectedEmployees.some(selected => selected._id === emp._id)
    );

    if (allSelected) {
      setSelectedEmployees(prev => {
        const newSelection = prev.filter(emp => !filteredEmployees.some(filtered => filtered._id === emp._id));
        setShowCreateMissionButton(newSelection.length > 0);
        return newSelection;
      });
    } else {
      const newSelected = [...selectedEmployees];
      filteredEmployees.forEach(emp => {
        if (!newSelected.some(selected => selected._id === emp._id)) {
          newSelected.push(emp);
        }
      });
      setSelectedEmployees(newSelected);
      setShowCreateMissionButton(true);
    }
  };

  const getMonthStartAndEnd = (date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return { start, end };
  };

  const handleMonthChange = (date) => {
    if (date) {
      const { start, end } = getMonthStartAndEnd(date);
      setSelectedMonth(date);
      setMissionDates({
        startDate: start,
        endDate: end
      });
    } else {
      setSelectedMonth(null);
      setMissionDates({ startDate: null, endDate: null });
    }
  };

  // Fonction pour générer un code de mission séquentiel
  const generateMissionCode = (sequenceNumber, missionYear) => {
    const paddedSequence = String(sequenceNumber).padStart(5, '0');
    return `${paddedSequence}/${missionYear}`;
  };

  const handleCreateGroupMission = async () => {
    setShowValidationErrors(true);
    try {
      if (!formValid) {
        setError('يرجى ملء جميع الحقول المطلوبة');
        return;
      }

      if (!missionDates.startDate || !missionDates.endDate) {
        setError('يرجى تحديد شهر المهمة');
        return;
      }

      if (selectedEmployees.length === 0) {
        setError('يرجى تحديد موظف واحد على الأقل');
        return;
      }

      if (selectedDestinations.length === 0) {
        setError('يرجى تحديد وجهة واحدة على الأقل');
        return;
      }

      if (!selectedTransportMode || selectedTransportMode.trim() === '') {
        setError('يرجى تحديد وسيلة النقل');
        return;
      }

      const missionsToCreate = selectedEmployees.map((employee) => {
        if (!employee._id || !employee.matricule) {
          throw new Error(`Données employé incomplètes: ${employee.nom} ${employee.prenom}`);
        }

        const missionData = {
          type: 'monthly',
          status: 'active',
          employee: employee._id,
          destinations: selectedDestinations.map(dest => ({
            name: dest,
            type: 'mission',
            address: dest,
            city: 'Alger',
            country: 'Algeria'
          })),
          startDate: missionDates.startDate.toISOString(),
          endDate: missionDates.endDate.toISOString(),
          transportMode: selectedTransportMode.trim(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        console.log('Données de mission à créer:', {
          employeeId: missionData.employee,
          employeeInfo: {
            matricule: employee.matricule,
            nom: employee.nom,
            prenom: employee.prenom,
            centre: employee.centre,
            fonction: employee.poste
          },
          destinations: missionData.destinations,
          dates: {
            start: formatGregorianDate(missionData.startDate),
            end: formatGregorianDate(missionData.endDate)
          },
          transportMode: missionData.transportMode
        });

        return missionData;
      });

      try {
        // Créer les missions une par une pour éviter les conflits
        const createdMissions = [];
        for (const missionData of missionsToCreate) {
          try {
            const response = await axiosInstance.post('/missions', missionData);
            createdMissions.push(response.data);
          } catch (error) {
            console.error('Erreur lors de la création de la mission:', {
              missionData,
              error: error.response?.data || error.message
            });
            throw error;
          }
        }

        if (createdMissions.length > 0) {
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
          setShowValidationErrors(false);
          
          dispatch(fetchMissionsStart());
          const missionsResponse = await axiosInstance.get('/missions');
          dispatch(fetchMissionsSuccess(missionsResponse.data));
        }
      } catch (error) {
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
        }
        
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Erreur inattendue:', error);
      setError('حدث خطأ غير متوقع');
    }
  };

  // Fonction pour vérifier si une chaîne ne contient que des caractères arabes
  const isArabicText = (text) => {
    if (text === null || typeof text !== 'string') return false;
    if (text.trim() === '') return true;
    const latinPattern = /[a-zA-Z]/;
    if (latinPattern.test(text)) return false;
    const nonArabicAndSpacePattern = /[^\u0600-\u06FF\s]/;
    return !nonArabicAndSpacePattern.test(text);
  };

  // Fonction pour gérer les événements clavier
  const handleInputKeyDown = (event, inputState, setInputState, setSelectedState, isMultiple = false, optionsList = null) => {
    // Gérer la touche Backspace
    if (event.key === 'Backspace' && inputState === '') {
      if (isMultiple) {
        // Pour les destinations multiples
        setSelectedState(prev => {
          const newState = [...prev];
          newState.pop();
          return newState;
        });
      } else {
        // Pour le moyen de transport
        setSelectedState('');
      }
      return;
    }

    const latinPattern = /[a-zA-Z]/;
    if (latinPattern.test(event.key)) {
      event.preventDefault();
      setError('يرجى استخدام الأحرف العربية فقط');
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
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
    }
  };

  // Fonction pour gérer les changements de texte
  const handleInputTextChange = (event, setInputState) => {
    const typedText = event.target.value;
    if (isArabicText(typedText)) {
      setInputState(typedText);
      setError(null);
    } else {
      setError('يرجى استخدام الأحرف العربية فقط');
    }
  };

  // Fonction pour gérer le collage de texte
  const handleInputPaste = (e, setInputState) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    if (isArabicText(pastedText)) {
      setInputState(pastedText);
      setError(null);
    } else {
      setError('يرجى استخدام الأحرف العربية فقط');
    }
  };

  // Fonction pour gérer la perte de focus
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

  // Fonction pour gérer les changements de destination
  const handleDestinationChange = (event, newValue) => {
    const validNewValue = newValue.filter(item => item && item.trim() !== '' && isArabicText(item));
    setSelectedDestinations(validNewValue);
    setError(null);
  };

  // Fonction pour gérer les changements de mode de transport
  const handleTransportModeChange = (event, newValue) => {
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
    setSelectedTransportMode(newValue.trim());
    setError(null);
  };

  // Modification de la logique de validation
  useEffect(() => {
    const validationState = {
      selectedMonth: Boolean(selectedMonth),
      hasEmployees: selectedEmployees.length > 0,
      hasTransport: Boolean(selectedTransportMode && selectedTransportMode.trim() !== ''),
      hasDestinations: selectedDestinations.length > 0,
      hasStartDate: Boolean(missionDates.startDate),
      hasEndDate: Boolean(missionDates.endDate)
    };

    setFormValid(Object.values(validationState).every(Boolean));
  }, [
    selectedMonth,
    selectedEmployees,
    selectedTransportMode,
    selectedDestinations,
    missionDates.startDate,
    missionDates.endDate
  ]);

  const handleCreateMonthlyMission = () => {
    setGroupMissionDialogOpen(true);
  };

  const renderEmployeesList = () => {
    return (
      <>
        <Paper sx={{ mb: 2, p: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between'
          }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {showCreateMissionButton && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleCreateMonthlyMission}
                  sx={{ minWidth: 200 }}
                >
                  إنشاء مهمة شهرية
                </Button>
              )}
              <Button
                variant="outlined"
                onClick={handleSelectAll}
                startIcon={<Checkbox 
                  checked={filteredEmployees.length > 0 && filteredEmployees.every(emp => 
                    selectedEmployees.some(selected => selected._id === emp._id)
                  )}
                  indeterminate={
                    filteredEmployees.some(emp => 
                      selectedEmployees.some(selected => selected._id === emp._id)
                    ) && 
                    !filteredEmployees.every(emp => 
                      selectedEmployees.some(selected => selected._id === emp._id)
                    )
                  }
                  sx={{ p: 0 }}
                />}
              >
                {filteredEmployees.every(emp => 
                  selectedEmployees.some(selected => selected._id === emp._id)
                ) ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
              </Button>
              <Typography variant="body2" color="text.secondary">
                {selectedEmployees.length} موظف محدد
              </Typography>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              gap: 2,
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'stretch', sm: 'center' }
            }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>المركز</InputLabel>
                <Select
                  value={selectedCentre}
                  onChange={(e) => {
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
          </Box>
        </Paper>

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
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ar}>
      <Box sx={{ direction: 'rtl' }}>
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

            {tabValue === 0 && renderEmployeesList()}
            {tabValue === 1 && <MissionForm />}
          </Paper>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="right" sx={{ fontWeight: 'bold', width: '120px' }}>الإجراءات</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>الهاتف</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>النوع</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>تاريخ الانتهاء</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>تاريخ البدء</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>الوجهة</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>المركز</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>الوظيفة</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>الاسم</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>اللقب</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>رمز الموظف</TableCell>
                  <TableCell 
                    align="right" 
                    onClick={() => handleSort('code_mission')}
                    style={{ cursor: 'pointer' }}
                  >
                    رمز المهمة {sortConfig.key === 'code_mission' && (
                      <span>{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
                    )}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMissions
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((mission) => (
                    <TableRow key={mission._id}>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <Tooltip title="طباعة">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => {
                                setSelectedMission(mission);
                                setPrintDialogOpen(true);
                              }}
                            >
                              <PrintIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="تعديل">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleOpenForm(mission)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="حذف">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDeleteClick(mission)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                      <TableCell align="right">{mission.employee.telephone || '-'}</TableCell>
                      <TableCell align="right">{mission.type === 'monthly' ? 'شهرية' : 'خاصة'}</TableCell>
                      <TableCell align="right">{formatGregorianDate(mission.endDate)}</TableCell>
                      <TableCell align="right">{formatGregorianDate(mission.startDate)}</TableCell>
                      <TableCell align="right">
                        {Array.isArray(mission.destinations) && mission.destinations.length > 0 
                          ? mission.destinations.map(dest => dest.name || dest).join('، ')
                          : mission.destination || '-'}
                      </TableCell>
                      <TableCell align="right">{mission.employee.centre || '-'}</TableCell>
                      <TableCell align="right">{mission.employee.poste || '-'}</TableCell>
                      <TableCell align="right">{mission.employee.nom}</TableCell>
                      <TableCell align="right">{mission.employee.prenom}</TableCell>
                      <TableCell align="right">{mission.employee.matricule}</TableCell>
                      <TableCell align="right">{mission.code_mission || '-'}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={filteredMissions.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </TableContainer>

          {/* Dialog pour le formulaire de mission */}
          <Dialog
            open={formOpen}
            onClose={handleCloseForm}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              {selectedMission ? 'تعديل المهمة' : 'مهمة جديدة'}
            </DialogTitle>
            <DialogContent>
              <MissionForm
                mission={selectedMission}
                onSuccess={handleFormSuccess}
                onClose={handleCloseForm}
              />
            </DialogContent>
          </Dialog>

          {/* Dialog de confirmation de suppression */}
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
              <Button onClick={handleDeleteConfirm} color="error">
                حذف
              </Button>
            </DialogActions>
          </Dialog>

          {/* Dialog pour l'impression de la mission */}
          <Dialog
            open={printDialogOpen}
            onClose={() => setPrintDialogOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogContent>
              {selectedMission && <MissionPrint mission={selectedMission} ref={printRef} />}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setPrintDialogOpen(false)}>إلغاء</Button>
              <Button onClick={handlePrint} color="primary" variant="contained">
                طباعة
              </Button>
            </DialogActions>
          </Dialog>

          {/* Dialog pour la création de mission groupée */}
          <Dialog
            open={groupMissionDialogOpen}
            onClose={() => {
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
              setShowValidationErrors(false);
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
            <DialogContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="شهر المهمة"
                      value={selectedMonth}
                      onChange={handleMonthChange}
                      views={['month', 'year']}
                      openTo="month"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                          helperText: showValidationErrors && !selectedMonth ? 'يرجى تحديد شهر المهمة' : ''
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12}>
                  <Autocomplete
                    multiple
                    options={[]}
                    freeSolo
                    value={selectedDestinations}
                    onChange={handleDestinationChange}
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
                        helperText={showValidationErrors && selectedDestinations.length === 0 ? 'يرجى تحديد وجهة واحدة على الأقل' : ''}
                        value={destinationInput}
                        onChange={(e) => handleInputTextChange(e, setDestinationInput)}
                        onKeyDown={(e) => handleInputKeyDown(e, destinationInput, setDestinationInput, setSelectedDestinations, true)}
                        onBlur={() => handleInputBlur(destinationInput, setDestinationInput, setSelectedDestinations, true)}
                        inputProps={{
                          ...params.inputProps,
                          onPaste: (e) => handleInputPaste(e, setDestinationInput),
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
                    onChange={handleTransportModeChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="وسيلة النقل"
                        required
                        helperText={showValidationErrors && (!selectedTransportMode || selectedTransportMode.trim() === '') ? 'يرجى تحديد وسيلة النقل' : ''}
                        placeholder="أضف وسيلة نقل"
                        value={transportModeInput}
                        onChange={(e) => handleInputTextChange(e, setTransportModeInput)}
                        onKeyDown={(e) => handleInputKeyDown(e, transportModeInput, setTransportModeInput, setSelectedTransportMode, false, transportModes)}
                        onBlur={() => handleInputBlur(transportModeInput, setTransportModeInput, setSelectedTransportMode, false, transportModes)}
                        inputProps={{
                          ...params.inputProps,
                          onPaste: (e) => handleInputPaste(e, setTransportModeInput),
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
              >
                إنشاء المهمة
              </Button>
              <Button 
                onClick={() => {
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
                  setShowValidationErrors(false);
                }}
                variant="outlined"
                color="error"
              >
                إلغاء
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default Missions; 