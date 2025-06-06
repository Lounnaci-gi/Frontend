import React, { useEffect, useState } from 'react';
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
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// Fonction utilitaire pour formater les dates avec des chiffres latins
const formatDate = (date) => {
  const d = new Date(date);
  // Conversion explicite en chiffres latins
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  
  // Retourne la date au format JJ/MM/AAAA avec des chiffres latins
  return `${day}/${month}/${year}`;
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
  const [loading, setLoading] = useState(false);
  const [selectedCentre, setSelectedCentre] = useState('all');
  const [centres, setCentres] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [groupMissionDialogOpen, setGroupMissionDialogOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState('');
  const [missionDates, setMissionDates] = useState({
    startDate: null,
    endDate: null,
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        console.log('Fetching employees...');
        const response = await axiosInstance.get('/employees');
        console.log('Employees response:', response.data);
        
        // Vérifier la structure des données
        if (Array.isArray(response.data)) {
          // Log détaillé pour voir la structure exacte des données
          console.log('Sample employee data:', response.data[0]);
          console.log('Employee status type:', typeof response.data[0]?.status);
          console.log('Employee status value:', response.data[0]?.status);
          
          // Filtrer les employés actifs en vérifiant les deux valeurs possibles
          const activeEmployees = response.data.filter(emp => 
            emp.status === 'active' || emp.status === 'نشط' || emp.status === 'Active'
          );
          
          console.log('Number of active employees:', activeEmployees.length);
          console.log('Active employees:', activeEmployees);
          setEmployees(activeEmployees);
          
          // Extraire les centres uniques des employés actifs
          const uniqueCentres = [...new Set(activeEmployees.map(emp => emp.centre || 'غير محدد'))];
          console.log('Unique centres:', uniqueCentres);
          setCentres(uniqueCentres);
        } else {
          console.error('Invalid employees data format:', response.data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des employés:', error);
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

  const filteredEmployees = employees.filter(employee => {
    if (!employee) {
      console.log('Invalid employee data:', employee);
      return false;
    }
    
    const matchesCentre = selectedCentre === 'all' || employee.centre === selectedCentre;
    const matchesSearch = searchTerm === '' || 
      `${employee.nom || ''} ${employee.prenom || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCentre && matchesSearch;
  });

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
      // Désélectionner tous les employés filtrés
      setSelectedEmployees(prev => 
        prev.filter(emp => !filteredEmployees.some(filtered => filtered._id === emp._id))
      );
    } else {
      // Sélectionner tous les employés filtrés qui ne sont pas déjà sélectionnés
      const newSelected = [...selectedEmployees];
      filteredEmployees.forEach(emp => {
        if (!newSelected.some(selected => selected._id === emp._id)) {
          newSelected.push(emp);
        }
      });
      setSelectedEmployees(newSelected);
    }
  };

  const handleCreateGroupMission = async () => {
    try {
      const missionData = {
        type: 'monthly',
        status: 'active',
        destinations: [selectedDestination],
        startDate: missionDates.startDate,
        endDate: missionDates.endDate,
        employees: selectedEmployees.map(emp => emp._id),
      };

      await axiosInstance.post('/missions', missionData);
      setGroupMissionDialogOpen(false);
      setSelectedEmployees([]);
      setSelectedDestination('');
      setMissionDates({ startDate: null, endDate: null });
      
      // Rafraîchir la liste des missions
      dispatch(fetchMissionsStart());
      const response = await axiosInstance.get('/missions');
      dispatch(fetchMissionsSuccess(response.data));
    } catch (error) {
      console.error('Erreur lors de la création de la mission groupée:', error);
    }
  };

  const renderEmployeesList = () => {
    console.log('Rendering employees list. Total active employees:', employees.length);
    console.log('Filtered employees:', filteredEmployees.length);
    console.log('Selected centre:', selectedCentre);
    console.log('Search term:', searchTerm);
    
    return (
      <Box sx={{ mt: 3 }}>
        {loading ? (
          <Typography sx={{ textAlign: 'center', py: 2 }}>
            جاري التحميل...
          </Typography>
        ) : employees.length === 0 ? (
          <Typography sx={{ textAlign: 'center', py: 2, color: 'error.main' }}>
            لا يوجد موظفين نشطين
          </Typography>
        ) : (
          <>
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              mb: 2,
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'stretch', sm: 'center' },
              justifyContent: 'flex-end'
            }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>النعيين</InputLabel>
                <Select
                  value={selectedCentre}
                  onChange={(e) => setSelectedCentre(e.target.value)}
                  label="النعيين"
                >
                  <MenuItem value="all">جميع النعيين</MenuItem>
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

            <Box sx={{ 
              mb: 2, 
              display: 'flex', 
              justifyContent: 'flex-end', 
              alignItems: 'center',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2
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

            <Paper>
              <Box sx={{
                p: 2,
                borderBottom: 1,
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'row-reverse',
                alignItems: 'center',
                gap: 2,
                justifyContent: 'flex-end',
                bgcolor: 'background.paper',
                px: 3
              }}>
                <Box sx={{ width: '40px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                  <Typography sx={{ visibility: 'hidden' }}>✓</Typography>
                </Box>
                <Box sx={{ width: '40px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                  <Typography sx={{ visibility: 'hidden' }}>👤</Typography>
                </Box>
                <Typography sx={{
                  minWidth: '80px',
                  textAlign: 'left',
                  fontWeight: 'bold',
                  color: 'text.primary'
                }}>
                  الرمز
                </Typography>
                <Typography sx={{
                  minWidth: '200px',
                  textAlign: 'left',
                  fontWeight: 'bold',
                  color: 'text.primary'
                }}>
                  الاسم و اللقب
                </Typography>
                <Typography sx={{
                  minWidth: '120px',
                  textAlign: 'right',
                  fontWeight: 'bold',
                  color: 'text.primary'
                }}>
                  الوظيفة
                </Typography>
                <Typography sx={{
                  minWidth: '80px',
                  textAlign: 'right',
                  fontWeight: 'bold',
                  color: 'text.primary'
                }}>
                  الجنس
                </Typography>
                <Typography sx={{
                  minWidth: '100px',
                  textAlign: 'right',
                  fontWeight: 'bold',
                  color: 'text.primary'
                }}>
                  الهاتف
                </Typography>
                <Box sx={{ minWidth: '80px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                  <Typography sx={{ visibility: 'hidden' }}>الحالة</Typography>
                </Box>
              </Box>
              <List sx={{ px: 3 }}>
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee, index) => (
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
                          justifyContent: 'flex-end'
                        }}
                      >
                        <Box sx={{ width: '40px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <Checkbox
                            edge="end"
                            checked={selectedEmployees.some(emp => emp._id === employee._id)}
                            onChange={() => handleEmployeeSelect(employee)}
                          />
                        </Box>
                        <ListItemIcon sx={{ minWidth: 'auto', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <PersonIcon color="primary" />
                        </ListItemIcon>
                        <Typography sx={{ minWidth: '80px', textAlign: 'left' }}>
                          {employee.matricule}
                        </Typography>
                        <ListItemText
                          primary={`${employee.nom} ${employee.prenom}`}
                          sx={{
                            textAlign: 'left',
                            minWidth: '200px',
                            '& .MuiListItemText-primary': {
                              fontWeight: 'medium',
                            },
                          }}
                        />
                        <Typography sx={{ minWidth: '120px', textAlign: 'right' }}>
                          {employee.poste || '-'}
                        </Typography>
                        <Typography sx={{ minWidth: '80px', textAlign: 'right' }}>
                          {employee.sexe === 'M' ? 'ذكر' : 'أنثى'}
                        </Typography>
                        <Typography sx={{ minWidth: '100px', textAlign: 'right' }}>
                          {employee.telephone || '-'}
                        </Typography>
                        <Box sx={{ minWidth: '80px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
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
            </Paper>
          </>
        )}

        <Dialog
          open={groupMissionDialogOpen}
          onClose={() => setGroupMissionDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>إنشاء مهمة للموظفين المحددين</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="الوجهة"
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
                required
              />
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="تاريخ البداية"
                  value={missionDates.startDate}
                  onChange={(date) => setMissionDates(prev => ({ ...prev, startDate: date }))}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth required />
                  )}
                />
                <DatePicker
                  label="تاريخ النهاية"
                  value={missionDates.endDate}
                  onChange={(date) => setMissionDates(prev => ({ ...prev, endDate: date }))}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth required sx={{ mt: 2 }} />
                  )}
                />
              </LocalizationProvider>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setGroupMissionDialogOpen(false)}>
              إلغاء
            </Button>
            <Button
              onClick={handleCreateGroupMission}
              variant="contained"
              disabled={!selectedDestination || !missionDates.startDate || !missionDates.endDate}
            >
              إنشاء المهمة
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
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

        {tabValue === 0 && renderEmployeesList()}
        {tabValue === 1 && <MissionForm />}
      </Paper>

      <Box sx={{ p: 2, display: 'flex', gap: 2 }}>
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
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={() => {/* TODO: Ouvrir les filtres */}}
        >
          تصفية
        </Button>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="right">رمز الموظف</TableCell>
              <TableCell align="right">الاسم</TableCell>
              <TableCell align="right">اللقب</TableCell>
              <TableCell align="right">الوظيفة</TableCell>
              <TableCell align="right">الجنس</TableCell>
              <TableCell align="right">الهاتف</TableCell>
              <TableCell align="right">الحالة</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMissions
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((mission) => (
                <TableRow key={mission.code}>
                  <TableCell align="right">{mission.employee.code}</TableCell>
                  <TableCell align="right">{mission.employee.nom}</TableCell>
                  <TableCell align="right">{mission.employee.prenom}</TableCell>
                  <TableCell align="right">{mission.employee.fonction}</TableCell>
                  <TableCell align="right">{mission.employee.sexe === 'M' ? 'ذكر' : 'أنثى'}</TableCell>
                  <TableCell align="right">{mission.employee.telephone || '-'}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Chip
                        label={
                          mission.employee.status === 'active'
                            ? 'نشط'
                            : mission.employee.status === 'inactive'
                            ? 'غير نشط'
                            : mission.employee.status
                        }
                        color={mission.employee.status === 'active' ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
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
        labelRowsPerPage="عدد الصفوف في الصفحة"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} من ${count}`
        }
      />

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
    </Box>
  );
};

export default Missions; 