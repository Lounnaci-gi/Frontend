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
import ReactDOM from 'react-dom';

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
  const [existingTransports, setExistingTransports] = useState([]);
  const [progressMessage, setProgressMessage] = useState('');
  const [progressPercentage, setProgressPercentage] = useState(0);

  // États pour les dialogues
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupMissionDialogOpen, setGroupMissionDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState(null);
  const [missionToDelete, setMissionToDelete] = useState(null);
  const [printDialogOpen, setPrintDialogOpen] = useState(false); // État pour le dialogue d'impression

  // États pour les filtres des missions
  const [missionStatusFilter, setMissionStatusFilter] = useState('all');
  const [missionCentreFilter, setMissionCentreFilter] = useState('all');
  const [missionTypeFilter, setMissionTypeFilter] = useState('all');
  const [missionDateFilter, setMissionDateFilter] = useState('all');

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
    // Mise à jour silencieuse de l'interface
  }, [employeesWithExistingMissions]);

  // Effet pour mettre à jour la liste des employés avec des missions existantes
  useEffect(() => {
    if (missions.length > 0 && selectedMonth) {
      const { startDate, endDate } = getMonthStartAndEnd(selectedMonth);
      
      // Trouver les employés qui ont déjà une mission mensuelle pour le mois sélectionné
      const employeesWithMissions = missions
        .filter(mission => 
          mission.type === 'monthly' &&
          mission.status === 'active' &&
          new Date(mission.startDate) >= startDate &&
          new Date(mission.endDate) <= endDate
        )
        .map(mission => mission.employee);
      
      setEmployeesWithExistingMissions(employeesWithMissions);
    } else {
      setEmployeesWithExistingMissions([]);
    }
  }, [missions, selectedMonth]);

  const getEmployeeStatus = (employee) => {
    const hasExistingMission = employeesWithExistingMissions.some(emp => emp._id === employee._id);
    const isSelected = selectedEmployees.some(emp => emp._id === employee._id);
    
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
    
    // Réinitialiser les filtres des missions quand on change d'onglet
    if (newValue === 1) {
      setMissionStatusFilter('all');
      setMissionCentreFilter('all');
      setMissionTypeFilter('all');
      setMissionDateFilter('all');
      setSearchTerm('');
    }
  };

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredMissions = useMemo(() => {
    let filtered = missions.filter((mission) => {
      // Filtre de recherche textuelle amélioré
      let matchesSearch = true;
      if (searchTerm && searchTerm.trim() !== '') {
        const searchLower = searchTerm.toLowerCase();
        
        // Rechercher dans les champs spécifiques de la mission
        const searchableFields = [
          mission.code_mission || '',
          mission.employee?.nom || '',
          mission.employee?.prenom || '',
          mission.employee?.matricule || '',
          mission.employee?.poste || '',
          mission.employee?.centre || '',
          mission.employee?.telephone || '',
          mission.type || '',
          mission.status || '',
          // Rechercher dans les destinations
          ...(Array.isArray(mission.destinations) 
            ? mission.destinations.map(dest => dest.name || dest || '').filter(Boolean)
            : [mission.destination || '']
          )
        ];
        
        matchesSearch = searchableFields.some(field => 
          field.toString().toLowerCase().includes(searchLower)
        );
      }
      
      // Filtre par onglet
      const matchesTab = tabValue === 0 ? true : mission.type === (tabValue === 1 ? 'monthly' : 'special');
      
      // Filtre par statut
      const matchesStatus = missionStatusFilter === 'all' || mission.status === missionStatusFilter;
      
      // Filtre par centre
      const matchesCentre = missionCentreFilter === 'all' || 
        (mission.employee?.centre && mission.employee.centre === missionCentreFilter);
      
      // Filtre par type
      const matchesType = missionTypeFilter === 'all' || mission.type === missionTypeFilter;
      
      // Filtre par date
      let matchesDate = true;
      if (missionDateFilter !== 'all' && mission.startDate) {
        const missionDate = new Date(mission.startDate);
        const today = new Date();
        
        switch (missionDateFilter) {
          case 'this_month':
            matchesDate = missionDate.getMonth() === today.getMonth() && 
                         missionDate.getFullYear() === today.getFullYear();
            break;
          case 'last_month':
            const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            matchesDate = missionDate.getMonth() === lastMonth.getMonth() && 
                         missionDate.getFullYear() === lastMonth.getFullYear();
            break;
          case 'this_year':
            matchesDate = missionDate.getFullYear() === today.getFullYear();
            break;
          case 'last_year':
            matchesDate = missionDate.getFullYear() === today.getFullYear() - 1;
            break;
          default:
            matchesDate = true;
        }
      }
      
      return matchesSearch && matchesTab && matchesStatus && matchesCentre && matchesType && matchesDate;
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
  }, [missions, searchTerm, tabValue, sortConfig, missionStatusFilter, missionCentreFilter, missionTypeFilter, missionDateFilter]);

  // Extraire les centres uniques des missions
  const missionCentres = useMemo(() => {
    const centres = missions
      .map(mission => mission.employee?.centre)
      .filter(centre => centre && centre.trim() !== '')
      .sort((a, b) => a.localeCompare(b));
    
    return [...new Set(centres)];
  }, [missions]);

  // Compter les filtres actifs
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (missionStatusFilter !== 'all') count++;
    if (missionCentreFilter !== 'all') count++;
    if (missionTypeFilter !== 'all') count++;
    if (missionDateFilter !== 'all') count++;
    if (searchTerm && searchTerm.trim() !== '') count++;
    return count;
  }, [missionStatusFilter, missionCentreFilter, missionTypeFilter, missionDateFilter, searchTerm]);

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
    // Vérifier si l'employé a déjà une mission mensuelle en cours
    if (hasExistingMonthlyMission(employee._id)) {
      const monthName = missionDates.startDate?.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) || 'ce mois';
      const errorMsg = `${employee.nom} ${employee.prenom} a déjà une mission mensuelle pour ${monthName}`;
      setError(errorMsg);
      return;
    }
    
    // Vérifier si l'employé est déjà sélectionné
    const isAlreadySelected = selectedEmployees.some(emp => emp._id === employee._id);
    
    if (isAlreadySelected) {
      setSelectedEmployees(prev => prev.filter(emp => emp._id !== employee._id));
    } else {
      setSelectedEmployees(prev => [...prev, employee]);
      setError(null);
    }
  };

  const handleSelectAll = () => {
    // Filtrer seulement les employés qui n'ont PAS de mission mensuelle en cours
    const availableEmployees = filteredEmployees.filter(emp => !hasExistingMonthlyMission(emp._id));
    
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
    if (!date) {
      throw new Error('La date est requise pour créer une mission mensuelle');
    }
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return { startDate, endDate };
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
    // Vérifier que les missions sont chargées
    if (!missions || missions.length === 0) {
      return false;
    }
    
    // Vérifier si l'employé a une mission mensuelle active
    for (const mission of missions) {
      if (mission.type === 'monthly' && 
          mission.status === 'active' && 
          mission.employee && 
          mission.employee._id === employeeId) {
        return true;
      }
    }
    
    return false;
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
    setProgressMessage('');
    setProgressPercentage(0);
  };

  // Modification de la fonction handleCreateGroupMission
  const handleCreateGroupMission = async () => {
    if (!formValid) {
      setShowValidationErrors(true);
      return;
    }

    if (!selectedMonth) {
      setError('Veuillez sélectionner un mois pour la mission');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setProgressMessage('جاري التحضير...');
    setProgressPercentage(0);

    try {
      setProgressMessage('جاري التحقق من وسيلة النقل...');
      setProgressPercentage(5);
      // Vérifier si le moyen de transport existe déjà
      let transport;
      try {
        // D'abord, essayer de trouver le transport existant
        const transportResponse = await axiosInstance.get('/transports', {
          params: {
            nom: selectedTransportMode
          }
        });
        
        if (transportResponse.data && transportResponse.data.length > 0) {
          transport = transportResponse.data[0];
        } else {
          // Si le transport n'existe pas, le créer
          const createResponse = await axiosInstance.post('/transports', {
            nom: selectedTransportMode
          });
          transport = createResponse.data;
        }
      } catch (error) {
        if (error.response?.data?.code === 'DUPLICATE_KEY') {
          // Si on a une erreur de doublon, réessayer de récupérer le transport
          const retryResponse = await axiosInstance.get('/transports', {
            params: {
              nom: selectedTransportMode
            }
          });
          if (retryResponse.data && retryResponse.data.length > 0) {
            transport = retryResponse.data[0];
          } else {
            throw new Error('Impossible de récupérer le transport après erreur de doublon');
          }
        } else {
          throw error;
        }
      }

      if (!transport) {
        throw new Error('Impossible de créer ou récupérer le transport');
      }

      // Obtenir les dates de début et de fin du mois
      const { startDate, endDate } = getMonthStartAndEnd(selectedMonth);
      
      if (!startDate || !endDate) {
        throw new Error('Impossible de déterminer les dates de début et de fin du mois');
      }

      setProgressMessage(`جاري إنشاء ${selectedEmployees.length} مهمة...`);
      setProgressPercentage(15);

      // Déboguer les destinations
      console.log('Destinations sélectionnées:', selectedDestinations);

      // Préparer les données pour la création groupée
      const groupMissionData = {
        employees: selectedEmployees.map(emp => emp._id),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        destinations: selectedDestinations.map(destName => ({
          name: destName,
          type: 'mission',
          address: destName,
          city: 'Alger',
          country: 'Algeria'
        })),
        transportMode: transport._id,
        type: 'monthly'
      };

      console.log('Données à envoyer:', JSON.stringify(groupMissionData, null, 2));

      // Démarrer la simulation de progression
      const progressInterval = simulateProgress(15, 85, 8000); // 8 secondes pour la création

      // Utiliser la route backend pour la création groupée
      const response = await axiosInstance.post('/missions/group', groupMissionData, {
        timeout: 120000 // 2 minutes de timeout
      });
      
      // Arrêter la simulation et passer à la fin
      clearInterval(progressInterval);
      setProgressMessage('جاري تحديث القائمة...');
      setProgressPercentage(90);
      
      if (response.data && response.data.missions) {
        // Rafraîchir la liste des missions
        dispatch(fetchMissionsStart());
        const missionsResponse = await axiosInstance.get('/missions');
        dispatch(fetchMissionsSuccess(missionsResponse.data));

        // Réinitialiser le formulaire
        resetForm();
        setGroupMissionDialogOpen(false);
        setProgressMessage('');
        setProgressPercentage(100);
        
        // Afficher un message de succès avec les détails
        let message = `✅ ${response.data.missions.length} mission(s) créée(s) avec succès`;
        if (response.data.failed && response.data.failed.length > 0) {
          message += `\n\n⚠️ ${response.data.failed.length} mission(s) non créée(s):`;
          response.data.failed.forEach(fail => {
            message += `\n- ${fail.employee}: ${fail.reason}`;
          });
        }
        setError(message);
      } else {
        throw new Error('Réponse invalide du serveur');
      }
    } catch (error) {
      console.error('Erreur lors de la création des missions:', error);
      console.error('Détails de l\'erreur:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      let errorMessage = 'Une erreur est survenue lors de la création des missions';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setProgressMessage('');
      setProgressPercentage(0);
    } finally {
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

  // Modification du gestionnaire de changement de destination
  const handleDestinationChange = (event, newValue) => {
    // S'assurer que newValue ne contient que des chaînes
    const stringValues = newValue.map(value => {
      if (typeof value === 'string') {
        return value;
      } else if (value && typeof value === 'object' && value.name) {
        return value.name;
      } else {
        return String(value);
      }
    });
    
    setSelectedDestinations(stringValues);
    // Vider le champ de saisie après la sélection
    setDestinationInput('');
  };

  // Modification du gestionnaire de changement de texte
  const handleInputTextChange = (e, setInput) => {
    setInput(e.target.value);
  };

  // Modification du gestionnaire de perte de focus
  const handleInputBlur = (input, setInput, setSelected, isDestination = false, options = []) => {
    if (input.trim() && !selectedDestinations.includes(input.trim())) {
      if (isDestination) {
        setSelected(prev => [...prev, input.trim()]);
      } else {
        setSelected(input.trim());
      }
    }
    setInput('');
  };

  // Modification du gestionnaire de touche
  const handleInputKeyDown = (e, input, setInput, setSelected, isDestination = false, options = []) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      if (isDestination && !selectedDestinations.includes(input.trim())) {
        setSelected(prev => [...prev, input.trim()]);
      } else if (!isDestination) {
        setSelected(input.trim());
      }
      setInput('');
    }
  };

  // Charger les moyens de transport existants
  useEffect(() => {
    const fetchTransports = async () => {
      try {
        const response = await axiosInstance.get('/transports');
        setExistingTransports(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement des moyens de transport:', error);
      }
    };
    fetchTransports();
  }, []);

  // Modification du gestionnaire de changement de moyen de transport
  const handleTransportModeChange = (event, newValue) => {
    setSelectedTransportMode(newValue);
    setTransportModeInput('');
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
      
      // Récupérer les missions de l'employé avec les filtres appropriés
      const response = await axiosInstance.get('/missions', {
        params: {
          employee: employeeId,
          type: 'monthly',
          status: ['active', 'completed']
        }
      });
      
      // Filtrer les missions mensuelles qui sont dans le même mois
      const conflictingMissions = response.data.filter(mission => {
        const missionStart = new Date(mission.startDate);
        const missionYear = missionStart.getFullYear();
        const missionMonth = missionStart.getMonth();
        
        // Vérifier si la mission est dans le même mois et année
        const isSameMonth = missionYear === targetYear && missionMonth === targetMonth;
        
        return isSameMonth;
      });
      
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

  // Ajout de la fonction handleInputPaste
  const handleInputPaste = (e, setInput) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    setInput(pastedText);
  };

  // Fonction pour simuler la progression en temps réel
  const simulateProgress = (startPercentage, endPercentage, duration = 5000) => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * (endPercentage - startPercentage) + startPercentage, endPercentage);
      setProgressPercentage(Math.round(progress));
      
      if (progress >= endPercentage) {
        clearInterval(interval);
      }
    }, 100);
    
    return interval;
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
                {filteredEmployees.filter(emp => !hasExistingMonthlyMission(emp._id)).every(emp => 
                  selectedEmployees.some(selected => selected._id === emp._id)
                ) ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
              </Button>
              <Typography>
                {selectedEmployees.length} موظف محدد
              </Typography>
              {employeesWithExistingMissions.length > 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  {employeesWithExistingMissions.length} موظف لديه مهمة شهرية جارية
                </Typography>
              )}
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

  // Fonction d'impression simple avec la mise en forme originale
  const handlePrintMission = () => {
    try {
      console.log('Impression de la mission avec la mise en forme originale');
      
      // Créer une nouvelle fenêtre pour l'impression
      const printWindow = window.open('data:text/html;charset=utf-8,', '_blank');
      if (!printWindow) {
        alert('Veuillez autoriser les popups pour l\'impression');
        return;
      }

      const employee = selectedMission.employee || {};
      const startDate = selectedMission.startDate ? new Date(selectedMission.startDate).toLocaleDateString('fr-FR') : '________________';
      const endDate = selectedMission.endDate ? new Date(selectedMission.endDate).toLocaleDateString('fr-FR') : '________________';

      const content = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <title></title>
          <style>
            body {
              font-family: 'Arabic Typesetting', 'Traditional Arabic', Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: white;
              direction: rtl;
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
            }
            .print-container {
              padding: 40px;
              position: relative;
              min-height: 297mm;
              width: 210mm;
              margin: 0 auto;
              background-color: white;
              font-family: 'Arabic Typesetting', 'Traditional Arabic', Arial, sans-serif;
              direction: rtl;
            }
            .title {
              text-align: center;
              position: absolute;
              top: 5cm;
              left: 50%;
              transform: translateX(-50%);
              font-size: 3.5em;
              font-weight: bold;
              font-family: 'Arabic Typesetting', 'Traditional Arabic', Arial, sans-serif;
              text-decoration: underline;
              width: 4.35cm;
            }
            .region-left {
              position: absolute;
              top: 5cm;
              right: 1cm;
              font-size: 2.3em;
              font-family: 'Arabic Typesetting', 'Traditional Arabic', Arial, sans-serif;
            }
            .code-right {
              position: absolute;
              top: 5cm;
              left: 1cm;
              font-size: 2em;
              font-family: 'Arabic Typesetting', 'Traditional Arabic', Arial, sans-serif;
            }
            .wilaya-left {
              position: absolute;
              top: 5.8cm;
              right: 1cm;
              font-size: 2.3em;
              font-family: 'Arabic Typesetting', 'Traditional Arabic', Arial, sans-serif;
            }
            .label {
              position: absolute;
              right: 1cm;
              font-size: 2.2em;
              font-family: 'Arabic Typesetting', 'Traditional Arabic', Arial, sans-serif;
            }
            .label-nom { top: 8cm; }
            .label-prenom { top: 10cm; }
            .label-centre { top: 12cm; }
            .label-poste { top: 14cm; }
            .label-raison { top: 16cm; }
            .label-start { top: 18cm; }
            .label-end { top: 20cm; }
            .label-transport { top: 22cm; }
            .label-destination { top: 24cm; }
            
            .value {
              position: absolute;
              left: 50%;
              transform: translateX(-50%);
              font-size: 2.2em;
              font-family: 'Arabic Typesetting', 'Traditional Arabic', Arial, sans-serif;
              min-width: 8cm;
              text-align: center;
            }
            .value-nom { top: 8cm; }
            .value-prenom { top: 10cm; }
            .value-centre { top: 12cm; }
            .value-poste { top: 14cm; }
            .value-raison { top: 16cm; }
            .value-start { top: 18cm; }
            .value-end { top: 20cm; }
            .value-transport { top: 22cm; }
            .value-destination { top: 24cm; }
            
            .dots-left {
              position: absolute;
              left: 4cm;
              font-size: 2.2em;
              font-family: 'Arabic Typesetting', 'Traditional Arabic', Arial, sans-serif;
              width: 3cm;
            }
            .dots-left-nom { top: 8cm; }
            .dots-left-prenom { top: 10cm; }
            .dots-left-centre { top: 12cm; }
            .dots-left-poste { top: 14cm; }
            .dots-left-raison { top: 16cm; }
            .dots-left-start { top: 18cm; }
            .dots-left-end { top: 20cm; }
            .dots-left-transport { top: 22cm; }
            .dots-left-destination { top: 24cm; }
            
            .dots-right {
              position: absolute;
              right: 4cm;
              font-size: 2.2em;
              font-family: 'Arabic Typesetting', 'Traditional Arabic', Arial, sans-serif;
              width: 3cm;
              text-align: right;
            }
            .dots-right-nom { top: 8cm; }
            .dots-right-prenom { top: 10cm; }
            .dots-right-centre { top: 12cm; }
            .dots-right-poste { top: 14cm; }
            .dots-right-raison { top: 16cm; }
            .dots-right-start { top: 18cm; }
            .dots-right-end { top: 20cm; }
            .dots-right-transport { top: 22cm; }
            .dots-right-destination { top: 24cm; }
            
            .date-footer {
              position: absolute;
              top: 26cm;
              left: 2cm;
              font-size: 2em;
              font-family: 'Arabic Typesetting', 'Traditional Arabic', Arial, sans-serif;
            }
            
            @media print {
              body {
                margin: 0;
                padding: 0;
              }
              .print-container {
                padding: 0;
                margin: 0;
                width: 100%;
                min-height: auto;
              }
              @page {
                margin: 0;
                size: A4;
              }
              /* Masquer les éléments d'en-tête automatiques */
              @page :first {
                margin-top: 0;
              }
              @page :left {
                margin-left: 0;
              }
              @page :right {
                margin-right: 0;
              }
              /* Masquer la date/heure et pagination */
              @page {
                margin-header: 0;
                margin-footer: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <div class="title">تكليف بمهمة</div>
            <div class="region-left">منطقة الجزائر</div>
            <div class="code-right">${selectedMission.code_mission || 'N/A'}</div>
            <div class="wilaya-left">ولاية المدية</div>
            
            <div class="label label-nom">اللقب</div>
            <div class="label label-prenom">الاسم</div>
            <div class="label label-centre">التعيين</div>
            <div class="label label-poste">المهنة</div>
            <div class="label label-raison">سبب التنقل</div>
            <div class="label label-start">تاريخ الانطلاق</div>
            <div class="label label-end">تاريخ الرجوع</div>
            <div class="label label-transport">وسيلة النقل</div>
            <div class="label label-destination">يسافر الى</div>
            
            <div class="value value-nom">${employee.nom || '________________'}</div>
            <div class="value value-prenom">${employee.prenom || '________________'}</div>
            <div class="value value-centre">${employee.centre || '________________'}</div>
            <div class="value value-poste">${employee.poste || employee.fonction || '________________'}</div>
            <div class="value value-raison">مهمة</div>
            <div class="value value-start">${startDate}</div>
            <div class="value value-end">${endDate}</div>
            <div class="value value-transport">${selectedMission.transportMode?.nom || '________________'}</div>
            <div class="value value-destination">${selectedMission.destinations && selectedMission.destinations.length > 0 ? (typeof selectedMission.destinations[0] === 'object' ? selectedMission.destinations[0].name : selectedMission.destinations[0]) : '________________'}</div>
            
            <div class="dots-left dots-left-nom">....................</div>
            <div class="dots-left dots-left-prenom">....................</div>
            <div class="dots-left dots-left-centre">....................</div>
            <div class="dots-left dots-left-poste">....................</div>
            <div class="dots-left dots-left-raison">....................</div>
            <div class="dots-left dots-left-start">....................</div>
            <div class="dots-left dots-left-end">....................</div>
            <div class="dots-left dots-left-transport">....................</div>
            <div class="dots-left dots-left-destination">....................</div>
            
            <div class="dots-right dots-right-nom">....................</div>
            <div class="dots-right dots-right-prenom">....................</div>
            <div class="dots-right dots-right-centre">....................</div>
            <div class="dots-right dots-right-poste">....................</div>
            <div class="dots-right dots-right-raison">....................</div>
            <div class="dots-right dots-right-start">....................</div>
            <div class="dots-right dots-right-end">....................</div>
            <div class="dots-right dots-right-transport">....................</div>
            <div class="dots-right dots-right-destination">....................</div>
            
            <div class="date-footer">المدية : ${new Date().toLocaleDateString('fr-FR')}</div>
          </div>
        </body>
        </html>
      `;

      // Écrire le contenu dans la fenêtre
      printWindow.document.write(content);
      printWindow.document.close();
      
      // Attendre que le contenu soit chargé puis imprimer
      printWindow.onload = () => {
        setTimeout(() => {
          console.log('Impression en cours...');
          // Désactiver les en-têtes et pieds de page
          printWindow.document.title = '';
          printWindow.print();
          printWindow.close();
          setPrintDialogOpen(false);
          console.log('Impression terminée');
        }, 500);
      };

    } catch (error) {
      console.error('Erreur lors de l\'impression:', error);
      alert(`Erreur lors de l'impression: ${error.message}`);
    }
  };

  const handlePrintMonthlyMission = async (mission) => {
    try {
      // Vérifier si le transport est déjà peuplé
      let transport = mission.transportMode;
      
      // Si le transport n'est pas peuplé (ancien format), le récupérer
      if (!transport || typeof transport === 'string') {
        try {
          // Essayer d'abord de récupérer le transport par ID
          const transportResponse = await axiosInstance.get(`/transports/${mission.transportMode}`);
          transport = transportResponse.data;
        } catch (error) {
          console.error('Erreur lors de la récupération du transport par ID:', error);
          // Si la recherche par ID échoue, récupérer tous les transports et chercher par ID
          try {
            const transportsResponse = await axiosInstance.get('/transports');
            transport = transportsResponse.data.find(t => t._id === mission.transportMode);
          } catch (fallbackError) {
            console.error('Erreur lors de la récupération de tous les transports:', fallbackError);
            throw new Error('Impossible de récupérer les détails du transport');
          }
        }
      }

      if (!transport) {
        console.error('Transport non trouvé pour l\'ID:', mission.transportMode);
        throw new Error('Impossible de récupérer les détails du transport');
      }

      // Récupérer les détails des destinations
      const destinations = await Promise.all(
        mission.destinations.map(async (destId) => {
          try {
            const response = await axiosInstance.get(`/locations/${destId}`);
            return response.data;
          } catch (error) {
            console.error('Erreur lors de la récupération de la destination:', error);
            return null;
          }
        })
      );

      // Récupérer les détails de l'employé
      const employeeResponse = await axiosInstance.get(`/employees/${mission.employee}`);
      const employee = employeeResponse.data;

      // Créer une nouvelle fenêtre pour l'impression
      const printWindow = window.open('data:text/html;charset=utf-8,', '_blank');
      if (!printWindow) {
        alert('Veuillez autoriser les popups pour l\'impression');
        return;
      }

      // Formater les dates
      const startDate = new Date(mission.startDate).toLocaleDateString('ar-SA');
      const endDate = new Date(mission.endDate).toLocaleDateString('ar-SA');

      // Créer le contenu HTML
      const content = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <title></title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap');
            body {
              font-family: 'Cairo', sans-serif;
              margin: 0;
              padding: 20px;
              background-color: white;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              border: 1px solid #ccc;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              margin: 0;
              color: #333;
            }
            .info-section {
              margin-bottom: 20px;
            }
            .info-section h2 {
              color: #2c3e50;
              border-bottom: 2px solid #3498db;
              padding-bottom: 5px;
              margin-bottom: 15px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
            }
            .info-item {
              margin-bottom: 10px;
            }
            .info-item strong {
              color: #2c3e50;
              display: inline-block;
              width: 150px;
            }
            .destinations {
              margin-top: 20px;
            }
            .destination-item {
              background-color: #f8f9fa;
              padding: 10px;
              margin-bottom: 10px;
              border-radius: 5px;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              color: #666;
            }
            @media print {
              body {
                padding: 0;
              }
              .container {
                border: none;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>مهمة شهرية</h1>
            </div>
            
            <div class="info-section">
              <h2>معلومات المهمة</h2>
              <div class="info-grid">
                <div class="info-item">
                  <strong>رقم المهمة:</strong>
                  <span>${mission.code_mission || mission.code}</span>
                </div>
                <div class="info-item">
                  <strong>تاريخ البداية:</strong>
                  <span>${startDate}</span>
                </div>
                <div class="info-item">
                  <strong>تاريخ النهاية:</strong>
                  <span>${endDate}</span>
                </div>
                <div class="info-item">
                  <strong>وسيلة النقل:</strong>
                  <span>${transport.nom}</span>
                </div>
              </div>
            </div>

            <div class="info-section">
              <h2>معلومات الموظف</h2>
              <div class="info-grid">
                <div class="info-item">
                  <strong>الاسم:</strong>
                  <span>${employee.nom} ${employee.prenom}</span>
                </div>
                <div class="info-item">
                  <strong>الرقم الوظيفي:</strong>
                  <span>${employee.matricule}</span>
                </div>
                <div class="info-item">
                  <strong>الوظيفة:</strong>
                  <span>${employee.fonction}</span>
                </div>
                <div class="info-item">
                  <strong>القسم:</strong>
                  <span>${employee.departement}</span>
                </div>
              </div>
            </div>

            <div class="info-section">
              <h2>الوجهات</h2>
              <div class="destinations">
                ${destinations.filter(dest => dest).map(dest => `
                  <div class="destination-item">
                    <div class="info-item">
                      <strong>الاسم:</strong>
                      <span>${dest.name}</span>
                    </div>
                    <div class="info-item">
                      <strong>العنوان:</strong>
                      <span>${dest.address}</span>
                    </div>
                    <div class="info-item">
                      <strong>المدينة:</strong>
                      <span>${dest.city}</span>
                    </div>
                    <div class="info-item">
                      <strong>البلد:</strong>
                      <span>${dest.country}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="footer">
              <p>تم إنشاء هذه الوثيقة في ${new Date().toLocaleDateString('ar-SA')}</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Écrire le contenu dans la fenêtre et imprimer
      printWindow.document.write(content);
      printWindow.document.close();
      
      // Attendre que le contenu soit chargé avant d'imprimer
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };

    } catch (error) {
      console.error('Erreur lors de l\'impression:', error);
      alert(`Erreur lors de l'impression: ${error.message}`);
    }
  };

  // Fonction pour imprimer toutes les missions filtrées
  const handlePrintAllFilteredMissions = async () => {
    if (filteredMissions.length === 0) {
      alert('لا توجد مهام للطباعة');
      return;
    }

    try {
      console.log('Début de l\'impression des missions. Nombre de missions:', filteredMissions.length);
      
      // Préparer les données pour toutes les missions
      const missionsData = await Promise.all(
        filteredMissions.map(async (mission) => {
          try {
            console.log('Traitement de la mission:', mission.code_mission);
            console.log('Structure de la mission:', JSON.stringify(mission, null, 2));
            
            // Récupérer les détails de l'employé
            let employeeId;
            if (mission.employee) {
              if (typeof mission.employee === 'object') {
                employeeId = mission.employee._id;
                console.log('Employee est un objet, ID:', employeeId);
              } else {
                employeeId = mission.employee;
                console.log('Employee est un ID:', employeeId);
              }
            } else {
              console.error('Pas d\'employé trouvé pour la mission:', mission.code_mission);
              return null;
            }

            if (!employeeId) {
              console.error('ID d\'employé invalide pour la mission:', mission.code_mission);
              return null;
            }

            console.log('Tentative de récupération de l\'employé avec l\'ID:', employeeId);
            const employeeResponse = await axiosInstance.get(`/employees/${employeeId}`);
            const employee = employeeResponse.data;
            console.log('Données employé récupérées:', employee.nom, employee.prenom);

            // Récupérer les détails des destinations
            const destinations = await Promise.all(
              (Array.isArray(mission.destinations) ? mission.destinations : [mission.destination])
                .filter(Boolean)
                .map(async (dest) => {
                  try {
                    // Gérer le cas où dest est un objet ou un ID
                    const destId = typeof dest === 'object' ? dest._id : dest;
                    console.log('Tentative de récupération de la destination avec l\'ID:', destId);
                    
                    if (!destId) {
                      console.error('ID de destination invalide');
                      return null;
                    }

                    const response = await axiosInstance.get(`/locations/${destId}`);
                    return response.data;
                  } catch (error) {
                    console.error('Erreur lors de la récupération de la destination:', error);
                    console.error('Détails de l\'erreur:', error.response?.data || error.message);
                    return null;
                  }
                })
            ).then(dests => dests.filter(Boolean)); // Filtrer les destinations nulles
            console.log('Destinations récupérées:', destinations.length);

            // Récupérer les détails du transport
            let transport = mission.transportMode;
            if (!transport || typeof transport === 'string') {
              try {
                const transportResponse = await axiosInstance.get(`/transports/${mission.transportMode}`);
                transport = transportResponse.data;
              } catch (error) {
                console.error('Erreur lors de la récupération du transport:', error);
                transport = { nom: 'غير محدد' };
              }
            }
            console.log('Transport récupéré:', transport.nom);

            const missionData = {
              ...mission,
              employee,
              destinations,
              transport
            };
            console.log('Mission complète préparée:', missionData);
            return missionData;
          } catch (error) {
            console.error('Erreur lors de la récupération des données de la mission:', error);
            console.error('Détails de l\'erreur:', error.response?.data || error.message);
            return null;
          }
        })
      );

      // Filtrer les missions avec des données valides
      const validMissionsData = missionsData.filter(data => data !== null);
      console.log('Nombre de missions valides:', validMissionsData.length);

      if (validMissionsData.length === 0) {
        alert('Aucune mission valide à imprimer');
        return;
      }

      // Ouvrir le dialogue d'impression
      setPrintDialogOpen(true);
      setSelectedMission(validMissionsData[0]); // Sélectionner la première mission pour l'aperçu
      console.log('Première mission sélectionnée pour l\'aperçu:', validMissionsData[0].code_mission);

      // Fonction pour imprimer toutes les missions
      const printAllMissions = async () => {
        console.log('Début de l\'impression de toutes les missions');
        for (let i = 0; i < validMissionsData.length; i++) {
          console.log(`Impression de la mission ${i + 1}/${validMissionsData.length}`);
          setSelectedMission(validMissionsData[i]);
          
          // Attendre que le composant soit mis à jour
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Créer une nouvelle fenêtre d'impression pour chaque mission
          const printWindow = window.open('data:text/html;charset=utf-8,', '_blank');
          if (!printWindow) {
            alert('Veuillez autoriser les popups pour l\'impression');
            return;
          }

          // Rendre le composant d'impression
          const printContent = ReactDOM.render(
            <MissionPrint mission={validMissionsData[i]} ref={printRef} />,
            printWindow.document.body
          );

          // Attendre que le contenu soit chargé
          await new Promise(resolve => setTimeout(resolve, 500));

          // Imprimer
          printWindow.print();
          
          // Fermer la fenêtre après l'impression
          printWindow.close();

          // Attendre un peu entre chaque impression
          if (i < validMissionsData.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        console.log('Fin de l\'impression de toutes les missions');
        setPrintDialogOpen(false);
      };

      // Modifier le bouton d'impression dans le dialogue
      const printButton = document.querySelector('.MuiDialogActions-root button:last-child');
      if (printButton) {
        printButton.onclick = printAllMissions;
        console.log('Bouton d\'impression modifié pour imprimer toutes les missions');
      } else {
        console.error('Bouton d\'impression non trouvé dans le dialogue');
      }
    } catch (error) {
      console.error('Erreur lors de l\'impression groupée:', error);
      alert(`Erreur lors de l'impression: ${error.message}`);
    }
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
                {/* Interface de filtres pour les missions */}
                <Paper sx={{ mb: 2, p: 2 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 2, 
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'stretch', sm: 'center' },
                    justifyContent: 'space-between'
                  }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        فلاتر المهام
                        {activeFiltersCount > 0 && (
                          <Chip
                            label={`${activeFiltersCount} نشط`}
                            size="small"
                            color="primary"
                            sx={{ ml: 1, height: 20 }}
                          />
                        )}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {filteredMissions.length} مهمة
                        {searchTerm && searchTerm.trim() !== '' && (
                          <span style={{ color: 'primary.main', fontWeight: 'bold' }}>
                            {' '}(نتيجة البحث)
                          </span>
                        )}
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setMissionStatusFilter('all');
                          setMissionCentreFilter('all');
                          setMissionTypeFilter('all');
                          setMissionDateFilter('all');
                          setSearchTerm('');
                        }}
                        sx={{ ml: 1 }}
                      >
                        إعادة تعيين
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<PrintIcon />}
                        onClick={() => handlePrintAllFilteredMissions()}
                        disabled={filteredMissions.length === 0}
                        sx={{ ml: 1 }}
                      >
                        طباعة جميع المهام ({filteredMissions.length})
                      </Button>
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 2,
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'stretch', sm: 'center' }
                    }}>
                      {/* Filtre par statut */}
                      <FormControl sx={{ minWidth: 150 }}>
                        <InputLabel>الحالة</InputLabel>
                        <Select
                          value={missionStatusFilter}
                          onChange={(e) => setMissionStatusFilter(e.target.value)}
                          label="الحالة"
                        >
                          <MenuItem value="all">جميع الحالات</MenuItem>
                          <MenuItem value="active">نشط</MenuItem>
                          <MenuItem value="completed">مكتمل</MenuItem>
                          <MenuItem value="cancelled">ملغي</MenuItem>
                        </Select>
                      </FormControl>

                      {/* Filtre par centre */}
                      <FormControl sx={{ minWidth: 150 }}>
                        <InputLabel>المركز</InputLabel>
                        <Select
                          value={missionCentreFilter}
                          onChange={(e) => setMissionCentreFilter(e.target.value)}
                          label="المركز"
                        >
                          <MenuItem value="all">جميع المراكز</MenuItem>
                          {missionCentres.map((centre) => (
                            <MenuItem key={centre} value={centre}>
                              {centre}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      {/* Filtre par type */}
                      <FormControl sx={{ minWidth: 150 }}>
                        <InputLabel>النوع</InputLabel>
                        <Select
                          value={missionTypeFilter}
                          onChange={(e) => setMissionTypeFilter(e.target.value)}
                          label="النوع"
                        >
                          <MenuItem value="all">جميع الأنواع</MenuItem>
                          <MenuItem value="monthly">شهرية</MenuItem>
                          <MenuItem value="special">خاصة</MenuItem>
                        </Select>
                      </FormControl>

                      {/* Filtre par date */}
                      <FormControl sx={{ minWidth: 150 }}>
                        <InputLabel>التاريخ</InputLabel>
                        <Select
                          value={missionDateFilter}
                          onChange={(e) => setMissionDateFilter(e.target.value)}
                          label="التاريخ"
                        >
                          <MenuItem value="all">جميع التواريخ</MenuItem>
                          <MenuItem value="this_month">هذا الشهر</MenuItem>
                          <MenuItem value="last_month">الشهر الماضي</MenuItem>
                          <MenuItem value="this_year">هذا العام</MenuItem>
                          <MenuItem value="last_year">العام الماضي</MenuItem>
                        </Select>
                      </FormControl>

                      {/* Recherche textuelle */}
                      <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="بحث في المهام..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ minWidth: 200 }}
                      />
                    </Box>
                  </Box>
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
            maxWidth="lg"
            fullWidth
            PaperProps={{
              sx: {
                '@media print': {
                  boxShadow: 'none',
                  margin: 0,
                  maxWidth: 'none',
                  width: '100%'
                }
              }
            }}
          >
            <DialogContent sx={{ 
              p: 0,
              direction: 'ltr',
              '@media print': {
                p: 0,
                overflow: 'visible'
              }
            }}>
              {selectedMission && (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end',
                  direction: 'ltr',
                  '@media print': {
                    display: 'block'
                  }
                }}>
                  <MissionPrint mission={selectedMission} ref={printRef} />
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{
              '@media print': {
                display: 'none'
              }
            }}>
              <Button onClick={() => setPrintDialogOpen(false)}>إلغاء</Button>
              <Button onClick={handlePrintMission} color="primary" variant="contained">
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
                                options={existingTransports.map(transport => transport.nom)}
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
                                    onKeyDown={(e) => handleInputKeyDown(e, transportModeInput, setTransportModeInput, setSelectedTransportMode, false)}
                                    onBlur={() => handleInputBlur(transportModeInput, setTransportModeInput, setSelectedTransportMode, false)}
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
                                severity={error.includes('succès') ? 'success' : 'error'} 
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
                    flexDirection: 'column',
                    gap: 2,
                    mt: 4,
                    pt: 3,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                  }}>
                    {/* Message de progression */}
                    {progressMessage && (
                      <Box sx={{ width: '100%' }}>
                        <Alert 
                          severity="info" 
                          sx={{ 
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 2
                          }}
                        >
                          <CircularProgress size={16} />
                          {progressMessage}
                        </Alert>
                        
                        {/* Barre de progression */}
                        <Box sx={{ width: '100%', mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              التقدم
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {progressPercentage}%
                            </Typography>
                          </Box>
                          <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, overflow: 'hidden' }}>
                            <Box 
                              sx={{ 
                                width: `${progressPercentage}%`, 
                                height: 8, 
                                bgcolor: 'primary.main',
                                transition: 'width 0.3s ease-in-out',
                                borderRadius: 1
                              }} 
                            />
                          </Box>
                        </Box>
                      </Box>
                    )}
                    
                    <Box sx={{ 
                      display: 'flex',
                      justifyContent: 'flex-end', 
                      gap: 2,
                    }}>
                      <Button
                        onClick={() => {
                          setGroupMissionDialogOpen(false);
                          resetForm(); // Réinitialiser le formulaire lors de la fermeture
                        }}
                        variant="outlined"
                        disabled={isSubmitting}
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
            </Box>
          </Fade>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default Missions; 