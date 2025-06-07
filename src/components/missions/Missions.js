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
  const { employees: employeesFromStore, loading: employeesLoading } = useSelector((state) => state.employees);
  const { missions, loading: missionsLoading } = useSelector((state) => state.missions);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCentre, setSelectedCentre] = useState('all');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedDestinations, setSelectedDestinations] = useState([]);
  const [selectedTransportMode, setSelectedTransportMode] = useState('');
  const [missionDates, setMissionDates] = useState({
    startDate: null,
    endDate: null
  });
  const [formErrors, setFormErrors] = useState({});
  const [groupMissionDialogOpen, setGroupMissionDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [missionToDelete, setMissionToDelete] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [centres, setCentres] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all',
    centre: 'all',
    poste: 'all',
    sexe: 'all'
  });
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [destinationInput, setDestinationInput] = useState('');
  const [transportModeInput, setTransportModeInput] = useState('');
  const [formValid, setFormValid] = useState(false);
  const [error, setError] = useState(null);
  const [employees, setEmployees] = useState([]);
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

  const filteredMissions = useMemo(() => {
    return missions.filter((mission) => {
      const matchesSearch = Object.values(mission).some((value) =>
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesTab = tabValue === 0 ? true : mission.type === (tabValue === 1 ? 'monthly' : 'special');
      return matchesSearch && matchesTab;
    });
  }, [missions, searchTerm, tabValue]);

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

  const handlePrintClick = (employee) => {
    setSelectedEmployee(employee);
    setPrintDialogOpen(true);
  };

  const handlePrintConfirm = () => {
    // Logique d'impression
    setPrintDialogOpen(false);
  };

  const handlePrintCancel = () => {
    setPrintDialogOpen(false);
    setSelectedEmployee(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            المهام
          </Typography>
          <Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenForm()}
              sx={{ ml: 1 }}
            >
              مهمة جديدة
            </Button>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setFilterDialogOpen(true)}
              sx={{ ml: 1 }}
            >
              تصفية
            </Button>
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="بحث..."
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

        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label="جميع المهام" />
          <Tab label="المهام الشهرية" />
          <Tab label="المهام الخاصة" />
        </Tabs>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>الكود</TableCell>
                <TableCell>الموظف</TableCell>
                <TableCell>التواريخ</TableCell>
                <TableCell>الوجهة</TableCell>
                <TableCell>النوع</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell>الإجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMissions
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((mission) => (
                  <TableRow key={mission._id}>
                    <TableCell>{mission.code}</TableCell>
                    <TableCell>{mission.employee?.nom} {mission.employee?.prenom}</TableCell>
                    <TableCell>{formatMissionDates(mission)}</TableCell>
                    <TableCell>{mission.destination}</TableCell>
                    <TableCell>
                      <Chip
                        label={mission.type === 'monthly' ? 'شهري' : 'خاص'}
                        color={missionTypeColors[mission.type]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={mission.status === 'active' ? 'نشط' : mission.status === 'completed' ? 'مكتمل' : 'ملغي'}
                        color={statusColors[mission.status]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenForm(mission)}
                        sx={{ ml: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(mission)}
                        sx={{ ml: 1 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handlePrintClick(mission.employee)}
                        sx={{ ml: 1 }}
                      >
                        <PrintIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredMissions.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
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

      {/* Dialog pour l'impression */}
      <Dialog
        open={printDialogOpen}
        onClose={handlePrintCancel}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>طباعة المهمة</DialogTitle>
        <DialogContent>
          {selectedEmployee && (
            <Box ref={cardRef}>
              <Typography variant="h6">
                {selectedEmployee.nom} {selectedEmployee.prenom}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePrintCancel}>إلغاء</Button>
          <Button onClick={handlePrintConfirm} color="primary">
            طباعة
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Missions; 