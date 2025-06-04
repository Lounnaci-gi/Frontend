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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Print as PrintIcon,
  QrCode as QrCodeIcon,
} from '@mui/icons-material';
import { fetchMissionsStart, fetchMissionsSuccess, fetchMissionsFailure } from '../../store/slices/missionsSlice';
import axiosInstance from '../../config/axios';

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

  const filteredMissions = missions.filter((mission) => {
    const matchesSearch = Object.values(mission).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesTab = tabValue === 0 ? true : mission.type === (tabValue === 1 ? 'monthly' : 'special');
    return matchesSearch && matchesTab;
  });

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          المهام
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {/* TODO: Ouvrir le formulaire d'ajout */}}
        >
          إضافة مهمة
        </Button>
      </Box>

      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="جميع المهام" />
          <Tab label="المهام الشهرية" />
          <Tab label="المهام الخاصة" />
        </Tabs>

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
                <TableCell>رمز المهمة</TableCell>
                <TableCell>الموظف</TableCell>
                <TableCell>الوجهة</TableCell>
                <TableCell>التاريخ</TableCell>
                <TableCell>النوع</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell>الإجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMissions
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((mission) => (
                  <TableRow key={mission.code}>
                    <TableCell>{mission.code}</TableCell>
                    <TableCell>
                      {`${mission.employee.firstName} ${mission.employee.lastName}`}
                    </TableCell>
                    <TableCell>{mission.destinations.join(', ')}</TableCell>
                    <TableCell>
                      {`${formatDate(mission.startDate)} - ${formatDate(mission.endDate)}`}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={mission.type === 'monthly' ? 'شهرية' : 'خاصة'}
                        color={missionTypeColors[mission.type]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          mission.status === 'active'
                            ? 'نشطة'
                            : mission.status === 'completed'
                            ? 'مكتملة'
                            : 'ملغاة'
                        }
                        color={statusColors[mission.status]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => {/* TODO: Ouvrir le formulaire d'édition */}}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {/* TODO: Confirmer l'annulation */}}
                      >
                        <DeleteIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => {/* TODO: Afficher le QR code */}}
                      >
                        <QrCodeIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => {/* TODO: Imprimer la mission */}}
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
          labelRowsPerPage="عدد الصفوف في الصفحة"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} من ${count}`
          }
        />
      </Paper>
    </Box>
  );
};

export default Missions; 