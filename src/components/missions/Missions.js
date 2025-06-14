import React, { useEffect, useState, useMemo, useRef, Suspense } from 'react';
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
  Card,
  CardContent,
  Avatar,
  Fade,
  Stack,
  Alert,
  CircularProgress,
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
  Save as SaveIcon,
  Cancel as CancelIcon,
  Group as GroupIcon,
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

// Importation dynamique de MonthPicker pour éviter les dépendances circulaires
const MonthPicker = React.lazy(() => import('./MonthPicker'));

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
  const [employeesWithExistingMissions, setEmployeesWithExistingMissions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingDestinations, setExistingDestinations] = useState([]);

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
      const matchesCentre = selectedCentre === 'all' || 
        (employee.centre && employee.centre.trim() === selectedCentre.trim());
      
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

  // Mise à jour de l'état du bouton de création de mission
  useEffect(() => {
    setShowCreateMissionButton(selectedEmployees.length > 0);
  }, [selectedEmployees]);

  // Effet pour forcer la mise à jour de l'interface quand les missions existantes changent
  useEffect(() => {
    console.log('🔄 Mise à jour de l\'interface - Employés avec missions existantes:', employeesWithExistingMissions.length);
    console.log('📋 Liste des employés avec missions:', employeesWithExistingMissions.map(emp => `${emp.nom} ${emp.prenom}`));
  }, [employeesWithExistingMissions]);

  const getEmployeeStatus = (employee) => {
    const hasExistingMission = employeesWithExistingMissions.some(emp => emp._id === employee._id);
    const isSelected = selectedEmployees.some(emp => emp._id === employee._id);
    
    // Log de débogage pour les employés avec missions existantes
    if (hasExistingMission) {
      console.log(`🔍 ${employee.nom} ${employee.prenom} a une mission existante - selectable: false`);
    }
    
    if (hasExistingMission) {
      return {
        status: 'existing_mission',
        label: 'مهمة موجودة',
        color: 'warning',
        selectable: false,
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        textColor: 'text.disabled'
      };
    } else if (isSelected) {
      return {
        status: 'selected',
        label: 'محدد',
        color: 'success',
        selectable: true,
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        textColor: 'text.primary'
      };
    } else {
      return {
        status: 'available',
        label: 'متاح',
        color: 'primary',
        selectable: true,
        backgroundColor: 'transparent',
        textColor: 'text.primary'
      };
    }
  };

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
    console.log(`\n🎯 Tentative de sélection de ${employee.nom} ${employee.prenom} (${employee.matricule})`);
    
    const employeeStatus = getEmployeeStatus(employee);
    console.log(`📊 Statut de l'employé:`, employeeStatus);
    
    // Si l'employé n'est pas sélectionnable, ne rien faire
    if (!employeeStatus.selectable) {
      const monthName = missionDates.startDate?.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) || 'ce mois';
      const errorMsg = `${employee.nom} ${employee.prenom} a déjà une mission mensuelle pour ${monthName}`;
      setError(errorMsg);
      console.log('❌ Employé non sélectionnable - mission existante:', errorMsg);
      return;
    }
    
    // Vérifier si l'employé est déjà sélectionné
    const isAlreadySelected = selectedEmployees.some(emp => emp._id === employee._id);
    console.log(`🔍 Employé déjà sélectionné: ${isAlreadySelected}`);
    
    if (isAlreadySelected) {
      setSelectedEmployees(prev => prev.filter(emp => emp._id !== employee._id));
      console.log('✅ Employé désélectionné:', employee.nom, employee.prenom);
    } else {
      setSelectedEmployees(prev => [...prev, employee]);
      setError(null);
      console.log('✅ Employé sélectionné:', employee.nom, employee.prenom);
    }
    
    console.log(`📋 Nombre total d'employés sélectionnés: ${selectedEmployees.length + (isAlreadySelected ? -1 : 1)}`);
  };

  const handleSelectAll = () => {
    const availableEmployees = filteredEmployees.filter(emp => getEmployeeStatus(emp).selectable);
    const allAvailableSelected = availableEmployees.every(emp => 
      selectedEmployees.some(selected => selected._id === emp._id)
    );

    if (allAvailableSelected) {
      // Désélectionner tous les employés disponibles
      setSelectedEmployees(prev => 
        prev.filter(emp => !availableEmployees.some(available => available._id === emp._id))
      );
    } else {
      // Sélectionner tous les employés disponibles qui ne sont pas déjà sélectionnés
      const newSelected = [...selectedEmployees];
      availableEmployees.forEach(emp => {
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

  // Ajout de la fonction de validation des dates
  const isDateInAllowedRange = (date) => {
    const today = new Date();
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const selectedDate = new Date(date.getFullYear(), date.getMonth(), 1);

    return selectedDate >= currentMonth && selectedDate <= nextMonth;
  };

  const handleMonthChange = (date) => {
    if (!date) {
      setSelectedMonth(null);
      setMissionDates({ startDate: null, endDate: null });
      setError(null);
      return;
    }

    if (!isDateInAllowedRange(date)) {
      setError('يمكن إنشاء المهام الشهرية فقط للشهر الحالي أو الشهر القادم');
      setSelectedMonth(null);
      setMissionDates({ startDate: null, endDate: null });
      return;
    }

    const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    setSelectedMonth(date);
    setMissionDates({ startDate, endDate });
    setError(null);
  };

  // Fonction pour générer un code de mission séquentiel
  const generateMissionCode = (sequenceNumber, missionYear) => {
    const paddedSequence = String(sequenceNumber).padStart(5, '0');
    return `${paddedSequence}/${missionYear}`;
  };

  // Ajout de la fonction de vérification des missions existantes
  const hasExistingMonthlyMission = (employeeId) => {
    const today = new Date();
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    return missions.some(mission => 
      mission.type === 'monthly' &&
      mission.status === 'active' &&
      mission.employee._id === employeeId &&
      new Date(mission.startDate) >= currentMonth &&
      new Date(mission.endDate) <= nextMonth
    );
  };

  // Fonction pour réinitialiser le formulaire
  const resetForm = () => {
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
  };

  // Modification de la fonction handleCreateGroupMission
  const handleCreateGroupMission = async () => {
    if (!formValid || isSubmitting) {
      setShowValidationErrors(true);
      return;
    }

    try {
      setIsSubmitting(true);
      setLoading(true);
      setError(null);

      // Vérifier les missions existantes pour chaque employé
      const employeesWithExistingMissions = selectedEmployees.filter(employee => 
        hasExistingMonthlyMission(employee._id)
      );

      if (employeesWithExistingMissions.length > 0) {
        const employeeNames = employeesWithExistingMissions
          .map(emp => `${emp.nom} ${emp.prenom}`)
          .join(', ');
        setError(`الموظفون التاليون لديهم بالفعل مهمة شهرية لهذا الشهر: ${employeeNames}`);
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

        return missionData;
      });

      // Créer les missions une par une
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
        resetForm(); // Réinitialiser le formulaire
        
        dispatch(fetchMissionsStart());
        const missionsResponse = await axiosInstance.get('/missions');
        dispatch(fetchMissionsSuccess(missionsResponse.data));
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Une erreur est survenue lors de la création des missions');
    } finally {
      setLoading(false);
      setIsSubmitting(false);
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
    // Gérer la touche Backspace seulement quand le champ est vide
    if (event.key === 'Backspace' && inputState === '') {
      if (isMultiple) {
        // Pour les destinations multiples, supprimer la dernière destination
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

    // Permettre tous les caractères de contrôle (Backspace, Delete, etc.) pour l'édition normale
    if (event.ctrlKey || event.metaKey || event.altKey || 
        ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Tab'].includes(event.key)) {
      return; // Laisser passer les touches de contrôle
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
    
    // Vérifier s'il y a des caractères latins
    const latinPattern = /[a-zA-Z]/;
    if (latinPattern.test(typedText)) {
      setError('يرجى استخدام الأحرف العربية فقط');
      return; // Ne pas mettre à jour l'état si il y a des caractères latins
    }
    
    // Permettre tous les autres caractères (arabe, chiffres, espaces, ponctuation)
    setInputState(typedText);
    setError(null);
  };

  // Fonction pour gérer le collage de texte
  const handleInputPaste = (e, setInputState) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    
    // Vérifier s'il y a des caractères latins
    const latinPattern = /[a-zA-Z]/;
    if (latinPattern.test(pastedText)) {
      setError('يرجى استخدام الأحرف العربية فقط');
      return;
    }
    
    // Permettre le collage de texte arabe
    setInputState(pastedText);
    setError(null);
  };

  // Fonction pour gérer la perte de focus
  const handleInputBlur = (inputState, setInputState, setSelectedState, isMultiple = false, optionsList = null) => {
    const typedText = inputState.trim();
    if (typedText !== '') {
      // Vérifier s'il y a des caractères latins
      const latinPattern = /[a-zA-Z]/;
      if (latinPattern.test(typedText)) {
        setError('يرجى استخدام الأحرف العربية فقط');
        return;
      }
      
      // Ajouter le texte valide
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

  // Fonction pour vérifier les missions mensuelles existantes pour un employé
  const checkEmployeeMonthlyMission = async (employeeId, startDate, endDate) => {
    if (!employeeId || !startDate || !endDate) return null;
    
    try {
      // Calculer le mois cible (année et mois)
      const targetYear = startDate.getFullYear();
      const targetMonth = startDate.getMonth();
      
      console.log(`Vérification pour employé ${employeeId} - Mois cible: ${targetMonth + 1}/${targetYear}`);
      
      const response = await axiosInstance.get('/missions', {
        params: {
          employee: employeeId,
          type: 'monthly'
        }
      });
      
      console.log(`Missions trouvées pour l'employé:`, response.data.length);
      
      // Filtrer les missions mensuelles qui sont dans le même mois
      const conflictingMissions = response.data.filter(mission => {
        const missionStart = new Date(mission.startDate);
        const missionYear = missionStart.getFullYear();
        const missionMonth = missionStart.getMonth();
        
        // Vérifier si la mission est dans le même mois et année
        const isSameMonth = missionYear === targetYear && missionMonth === targetMonth;
        
        console.log(`Mission ${mission.code_mission}: ${missionMonth + 1}/${missionYear} - Même mois: ${isSameMonth}`);
        
        return isSameMonth;
      });
      
      console.log(`Missions en conflit trouvées:`, conflictingMissions.length);
      
      return conflictingMissions.length > 0 ? conflictingMissions[0] : null;
    } catch (error) {
      console.error('Erreur lors de la vérification des missions existantes:', error);
      return null;
    }
  };

  // Charger les destinations existantes
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await axiosInstance.get('/locations/missions');
        setExistingDestinations(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement des destinations:', error);
      }
    };
    fetchDestinations();
  }, []);

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
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
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
              >
                {filteredEmployees.filter(emp => getEmployeeStatus(emp).selectable).every(emp => 
                  selectedEmployees.some(selected => selected._id === emp._id)
                ) ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
              </Button>
              <Typography>
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

        <List sx={{ px: 3, mx: 0 }}>
          {filteredEmployees.length > 0 ? (
            filteredEmployees
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((employee, index) => {
                const hasMission = hasExistingMonthlyMission(employee._id);
                return (
                  <React.Fragment key={employee._id}>
                    <ListItem
                      sx={{
                        '&:hover': {
                          bgcolor: hasMission ? 'action.disabledBackground' : 'action.hover',
                        },
                        flexDirection: 'row-reverse',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        justifyContent: 'flex-start',
                        px: 0,
                        mx: 0,
                        opacity: hasMission ? 0.7 : 1
                      }}
                    >
                      <Box sx={{ width: '40px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <Checkbox
                          edge="end"
                          checked={selectedEmployees.some(emp => emp._id === employee._id)}
                          onChange={() => handleEmployeeSelect(employee)}
                          disabled={hasMission}
                        />
                      </Box>
                      <ListItemIcon sx={{ width: '40px', minWidth: '40px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <PersonIcon color={hasMission ? "disabled" : "primary"} />
                      </ListItemIcon>
                      <Typography sx={{ 
                        width: '80px', 
                        textAlign: 'right', 
                        px: 0,
                        pr: 2
                      }}>
                        {employee.matricule}
                      </Typography>
                      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
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
                        {hasMission ? (
                          <Chip
                            label="مهمة شهرية جارية"
                            color="warning"
                            size="small"
                          />
                        ) : (
                          <Chip
                            label="نشط"
                            color="success"
                            size="small"
                          />
                        )}
                      </Box>
                    </ListItem>
                    {index < filteredEmployees.length - 1 && <Divider />}
                  </React.Fragment>
                );
              })
          ) : (
            <ListItem>
              <ListItemText 
                primary="لا يوجد موظفون نشطين في هذه الفئة"
                sx={{ textAlign: 'center' }}
              />
            </ListItem>
          )}
        </List>
        
        {/* Pagination pour la liste des employés */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <TablePagination
            component="div"
            count={filteredEmployees.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="عدد الصفوف في الصفحة"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} من ${count}`
            }
            sx={{
              width: '100%',
              borderTop: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          />
        </Box>
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
            {tabValue === 1 && (
              <>
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
                            <TableCell align="right">{mission.employee?.telephone || '-'}</TableCell>
                            <TableCell align="right">{mission.type === 'monthly' ? 'شهرية' : 'خاصة'}</TableCell>
                            <TableCell align="right">{formatGregorianDate(mission.endDate)}</TableCell>
                            <TableCell align="right">{formatGregorianDate(mission.startDate)}</TableCell>
                            <TableCell align="right">
                              {Array.isArray(mission.destinations) && mission.destinations.length > 0 
                                ? mission.destinations.map(dest => dest.name || dest).join('، ')
                                : mission.destination || '-'}
                            </TableCell>
                            <TableCell align="right">{mission.employee?.centre || '-'}</TableCell>
                            <TableCell align="right">{mission.employee?.poste || '-'}</TableCell>
                            <TableCell align="right">{mission.employee?.nom}</TableCell>
                            <TableCell align="right">{mission.employee?.prenom}</TableCell>
                            <TableCell align="right">{mission.employee?.matricule}</TableCell>
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
                    labelRowsPerPage="عدد الصفوف في الصفحة"
                    labelDisplayedRows={({ from, to, count }) =>
                      `${from}-${to} من ${count}`
                    }
                    sx={{
                      width: '100%',
                      borderTop: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                    }}
                  />
                </TableContainer>
              </>
            )}
          </Paper>

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
          <Fade in={groupMissionDialogOpen} timeout={300}>
            <Box
              sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: 'rgba(0,0,0,0.5)',
                zIndex: 1300,
                display: groupMissionDialogOpen ? 'flex' : 'none',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
                overflow: 'auto',
              }}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setGroupMissionDialogOpen(false);
                  resetForm(); // Réinitialiser le formulaire lors de la fermeture
                }
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  maxWidth: '800px',
                  mx: 'auto',
                  bgcolor: 'background.paper',
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider',
                  position: 'relative',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                }}
              >
                {/* Header avec dégradé */}
                <Box
                  sx={{
                    background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
                    color: 'white',
                    p: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      width: 56,
                      height: 56,
                    }}
                  >
                    <GroupIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                      إنشاء مهمة جماعية
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      عدد الموظفين المحددين: {selectedEmployees.length}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ p: 4 }}>
                  <Grid container spacing={4}>
                    {/* Section 1: Informations de base */}
                    <Grid item xs={12} md={6}>
                      <Card
                        elevation={0}
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          height: '100%',
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
                            <AssignmentIcon color="primary" />
                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                              معلومات المهمة
                            </Typography>
                          </Box>

                          <Stack spacing={3}>
                            {/* Sélection du mois */}
                            <Box>
                              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                الشهر المطلوب
                              </Typography>
                              <Suspense fallback={<Box sx={{ height: 56, bgcolor: 'grey.100', borderRadius: 1 }} />}>
                                <MonthPicker
                                  value={selectedMonth}
                                  onChange={(date, error) => {
                                    setSelectedMonth(date);
                                    setError(error);
                                    if (date) {
                                      const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
                                      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
                                      setMissionDates({ startDate, endDate });
                                    } else {
                                      setMissionDates({ startDate: null, endDate: null });
                                    }
                                  }}
                                  error={error}
                                  showValidationErrors={showValidationErrors}
                                />
                              </Suspense>
                            </Box>

                            {/* Destinations */}
                            <Box>
                              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                الوجهات
                              </Typography>
                              <Autocomplete
                                multiple
                                options={existingDestinations.map(dest => dest.name)}
                                freeSolo
                                value={selectedDestinations}
                                onChange={handleDestinationChange}
                                renderTags={(value, getTagProps) =>
                                  value.map((option, index) => (
                                    <Chip
                                      label={option}
                                      {...getTagProps({ index })}
                                      key={index}
                                      sx={{ borderRadius: 1 }}
                                    />
                                  ))
                                }
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    placeholder="أضف وجهة"
                                    required
                                    helperText={showValidationErrors && selectedDestinations.length === 0 ? 'يرجى تحديد وجهة واحدة على الأقل' : ''}
                                    value={destinationInput}
                                    onChange={(e) => handleInputTextChange(e, setDestinationInput)}
                                    onKeyDown={(e) => handleInputKeyDown(e, destinationInput, setDestinationInput, setSelectedDestinations, true)}
                                    onBlur={() => handleInputBlur(destinationInput, setDestinationInput, setSelectedDestinations, true)}
                                    sx={{
                                      '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                      }
                                    }}
                                    inputProps={{
                                      ...params.inputProps,
                                      onPaste: (e) => handleInputPaste(e, setDestinationInput),
                                    }}
                                  />
                                )}
                              />
                            </Box>

                            {/* Mode de transport */}
                            <Box>
                              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                وسيلة النقل
                              </Typography>
                              <Autocomplete
                                freeSolo
                                options={transportModes}
                                value={selectedTransportMode}
                                onChange={handleTransportModeChange}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    placeholder="أضف وسيلة نقل"
                                    required
                                    helperText={showValidationErrors && (!selectedTransportMode || selectedTransportMode.trim() === '') ? 'يرجى تحديد وسيلة النقل' : ''}
                                    value={transportModeInput}
                                    onChange={(e) => handleInputTextChange(e, setTransportModeInput)}
                                    onKeyDown={(e) => handleInputKeyDown(e, transportModeInput, setTransportModeInput, setSelectedTransportMode, false, transportModes)}
                                    onBlur={() => handleInputBlur(transportModeInput, setTransportModeInput, setSelectedTransportMode, false, transportModes)}
                                    sx={{
                                      '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                      }
                                    }}
                                    inputProps={{
                                      ...params.inputProps,
                                      onPaste: (e) => handleInputPaste(e, setTransportModeInput),
                                    }}
                                  />
                                )}
                              />
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Section 2: Résumé et validation */}
                    <Grid item xs={12} md={6}>
                      <Card
                        elevation={0}
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          height: '100%',
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
                            <PersonIcon color="primary" />
                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                              ملخص المهمة
                            </Typography>
                          </Box>

                          <Stack spacing={3}>
                            {/* Informations de la mission */}
                            <Box>
                              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'text.secondary' }}>
                                تفاصيل المهمة
                              </Typography>
                              <Box sx={{ 
                                p: 2, 
                                bgcolor: 'grey.50', 
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'divider'
                              }}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                  <strong>عدد الموظفين:</strong> {selectedEmployees.length}
                                </Typography>
                                {selectedMonth && (
                                  <Typography variant="body2" sx={{ mb: 1 }}>
                                    <strong>الشهر:</strong> {format(selectedMonth, 'MMMM yyyy', { locale: ar })}
                                  </Typography>
                                )}
                                {selectedDestinations.length > 0 && (
                                  <Typography variant="body2" sx={{ mb: 1 }}>
                                    <strong>الوجهات:</strong> {selectedDestinations.join('، ')}
                                  </Typography>
                                )}
                                {selectedTransportMode && (
                                  <Typography variant="body2">
                                    <strong>وسيلة النقل:</strong> {selectedTransportMode}
                                  </Typography>
                                )}
                              </Box>
                            </Box>

                            {/* Messages d'erreur */}
                            {error && (
                              <Alert 
                                severity="error" 
                                sx={{ 
                                  borderRadius: 2,
                                }}
                              >
                                {error}
                              </Alert>
                            )}

                            {/* Validation du formulaire */}
                            <Box>
                              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'text.secondary' }}>
                                حالة التحقق
                              </Typography>
                              <Box sx={{ 
                                p: 2, 
                                bgcolor: formValid ? 'success.50' : 'warning.50', 
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: formValid ? 'success.200' : 'warning.200'
                              }}>
                                <Typography variant="body2" sx={{ 
                                  color: formValid ? 'success.main' : 'warning.main',
                                  fontWeight: 600
                                }}>
                                  {formValid ? '✓ النموذج صالح' : '⚠ يرجى إكمال جميع الحقول المطلوبة'}
                                </Typography>
                              </Box>
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Actions */}
                  <Box sx={{ 
                    display: 'flex',
                    justifyContent: 'flex-end', 
                    gap: 2,
                    mt: 4,
                    pt: 3,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                  }}>
                    <Button
                      onClick={() => {
                        setGroupMissionDialogOpen(false);
                        resetForm(); // Réinitialiser le formulaire lors de la fermeture
                      }}
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        px: 3,
                      }}
                    >
                      إلغاء
                    </Button>
                    <Button 
                      onClick={handleCreateGroupMission}
                      variant="contained" 
                      startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                      disabled={!formValid || isSubmitting}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        px: 4,
                        background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                        },
                        '& .MuiCircularProgress-root': {
                          color: 'white',
                        }
                      }}
                    >
                      {isSubmitting ? 'جاري الإنشاء...' : 'إنشاء المهمة'}
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Fade>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default Missions; 