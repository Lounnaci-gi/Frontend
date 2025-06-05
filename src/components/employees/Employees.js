import React, { useEffect, useState, useRef } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Card,
  CardContent,
  CardMedia,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Person as PersonIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { useReactToPrint } from 'react-to-print';
import { fetchEmployeesStart, fetchEmployeesSuccess, fetchEmployeesFailure } from '../../store/slices/employeesSlice';
import axiosInstance from '../../config/axios';
import EmployeeForm from './EmployeeForm';
import EmployeeCard from './EmployeeCard';

// Obtenir l'URL de base de l'API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Fonction pour obtenir l'URL complète de la photo
const getPhotoUrl = (photoPath) => {
  if (!photoPath) return null;
  return `${API_URL}${photoPath}`;
};

// Fonction utilitaire pour formater les dates avec des chiffres latins
const formatDate = (date) => {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const statusColors = {
  active: 'success',
  retired: 'error',
  onLeave: 'warning',
  exempt: 'info',
};

const statuses = [
  { value: 'active', label: 'نشط' },
  { value: 'retired', label: 'متقاعد' },
  { value: 'onLeave', label: 'في إجازة' },
  { value: 'exempt', label: 'معفى' },
];

// Composant pour l'aperçu des détails de l'employé
const EmployeePreview = ({ employee }) => {
  return (
    <Card sx={{ 
      maxWidth: 300,
      direction: 'ltr',
      bgcolor: 'background.paper',
      boxShadow: 3,
      transition: 'all 0.3s ease-in-out',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: 6,
      },
      position: 'relative',
      overflow: 'visible',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '120px',
        background: 'linear-gradient(45deg, #1976d2 0%, #2196f3 100%)',
        zIndex: 0,
      }
    }}>
      <Box sx={{ 
        position: 'relative', 
        height: 120,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1
      }}>
        {employee.photo ? (
          <CardMedia
            component="img"
            image={getPhotoUrl(employee.photo)}
            alt={`${employee.nom} ${employee.prenom}`}
            sx={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              position: 'absolute',
              bottom: -50,
              left: '50%',
              transform: 'translateX(-50%)',
              border: '4px solid',
              borderColor: 'background.paper',
              objectFit: 'cover',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateX(-50%) scale(1.05)',
                boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
              }
            }}
          />
        ) : (
          <Box
            sx={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              position: 'absolute',
              bottom: -50,
              left: '50%',
              transform: 'translateX(-50%)',
              border: '4px solid',
              borderColor: 'background.paper',
              bgcolor: 'grey.200',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateX(-50%) scale(1.05)',
                boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
              }
            }}
          >
            <PersonIcon sx={{ fontSize: 60, color: 'grey.500' }} />
          </Box>
        )}
      </Box>
      <CardContent sx={{ 
        pt: 7,
        px: 3,
        '&:last-child': { pb: 3 }
      }}>
        <Box sx={{ 
          textAlign: 'left',
          direction: 'ltr',
          '& > *': {
            textAlign: 'left',
            direction: 'ltr',
          }
        }}>
          <Typography 
            variant="h6" 
            gutterBottom 
            sx={{ 
              direction: 'ltr',
              fontWeight: 'bold',
              color: 'primary.main',
              mb: 2,
              textAlign: 'left'
            }}
          >
            {employee.nom} {employee.prenom}
          </Typography>
          <Typography 
            variant="subtitle2" 
            color="text.secondary" 
            gutterBottom 
            sx={{ 
              direction: 'ltr',
              mb: 2,
              fontStyle: 'italic',
              textAlign: 'left'
            }}
          >
            {employee.poste}
          </Typography>
          <Divider sx={{ 
            my: 2,
            '&::before, &::after': {
              borderColor: 'primary.light',
            }
          }} />
          <Box sx={{ 
            mt: 2,
            direction: 'ltr',
            '& > *': {
              mb: 1.5,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: 1,
              '& strong': {
                color: 'primary.main',
                minWidth: '120px',
                textAlign: 'left'
              },
              '& span': {
                textAlign: 'left'
              }
            }
          }}>
            <Typography variant="body2" sx={{ direction: 'ltr' }}>
              <strong>الرقم الوظيفي:</strong>
              <span>{employee.matricule}</span>
            </Typography>
            <Typography variant="body2" sx={{ direction: 'ltr' }}>
              <strong>النعيين:</strong>
              <span>{employee.centre || '-'}</span>
            </Typography>
            <Typography variant="body2" sx={{ direction: 'ltr' }}>
              <strong>تاريخ الميلاد:</strong>
              <span>{formatDate(employee.dateNaissance)}</span>
            </Typography>
            <Typography variant="body2" sx={{ direction: 'ltr' }}>
              <strong>تاريخ التوظيف:</strong>
              <span>{formatDate(employee.dateEmbauche)}</span>
            </Typography>
            <Typography variant="body2" sx={{ direction: 'ltr' }}>
              <strong>الحالة:</strong>
              <Chip 
                label={statuses.find(s => s.value === employee.status)?.label || 'نشط'}
                color={statusColors[employee.status] || 'success'}
                size="small"
                sx={{ 
                  height: 24,
                  '& .MuiChip-label': {
                    px: 1,
                    fontSize: '0.75rem'
                  }
                }}
              />
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const Employees = () => {
  const dispatch = useDispatch();
  const cardRef = useRef(null);
  const formRef = useRef(null);
  const { employees, loading: employeesLoading } = useSelector((state) => state.employees);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    centre: 'all',
    poste: 'all',
    sexe: 'all'
  });
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [hoveredEmployee, setHoveredEmployee] = useState(null);

  const fetchEmployees = async () => {
    try {
      dispatch(fetchEmployeesStart());
      const response = await axiosInstance.get('/employees');
      dispatch(fetchEmployeesSuccess(response.data));
    } catch (error) {
      dispatch(fetchEmployeesFailure(error.message));
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [dispatch]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilterReset = () => {
    setFilters({
      status: 'all',
      centre: 'all',
      poste: 'all',
      sexe: 'all'
    });
  };

  // Obtenir les valeurs uniques pour les filtres
  const uniqueCentres = [...new Set(employees.map(emp => emp.centre))].filter(Boolean);
  const uniquePostes = [...new Set(employees.map(emp => emp.poste))].filter(Boolean);

  // Filtrer les employés
  const filteredEmployees = employees.filter((employee) => {
    // Filtrage par recherche
    const searchMatch = Object.values(employee).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filtrage par statut
    const statusMatch = filters.status === 'all' || employee.status === filters.status;

    // Filtrage par centre
    const centreMatch = filters.centre === 'all' || employee.centre === filters.centre;

    // Filtrage par poste
    const posteMatch = filters.poste === 'all' || employee.poste === filters.poste;

    // Filtrage par sexe
    const sexeMatch = filters.sexe === 'all' || employee.sexe === filters.sexe;

    return searchMatch && statusMatch && centreMatch && posteMatch && sexeMatch;
  });

  const handleOpenForm = (employee = null) => {
    setSelectedEmployee(employee);
    setOpenForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedEmployee(null);
    fetchEmployees();
  };

  const handleDeleteClick = (employee) => {
    setEmployeeToDelete(employee);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axiosInstance.delete(`/employees/${employeeToDelete._id}`);
      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);
      fetchEmployees();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      // Vous pouvez ajouter une notification d'erreur ici
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setEmployeeToDelete(null);
  };

  const handlePrint = useReactToPrint({
    content: () => cardRef.current,
    pageStyle: `
      @page {
        size: 85.6mm 107.96mm;
        margin: 0;
      }
      @media print {
        body {
          margin: 0;
          padding: 0;
        }
        @page {
          margin: 0;
        }
      }
    `,
    onBeforeGetContent: () => {
      if (!selectedEmployee || !cardRef.current) {
        console.error('Impossible d\'imprimer : employé non sélectionné ou référence manquante');
        return Promise.reject();
      }
      return Promise.resolve();
    }
  });

  const handlePrintClick = (employee) => {
    setSelectedEmployee(employee);
    setPrintDialogOpen(true);
  };

  const handlePrintConfirm = async () => {
    try {
      await handlePrint();
      setPrintDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de l\'impression:', error);
    }
  };

  return (
    <Box sx={{ 
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      bgcolor: 'background.default',
    }}>
      <Box sx={{ 
        width: '100%',
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2,
        p: 2,
        bgcolor: 'background.paper',
        borderRadius: '8px 8px 0 0',
        boxShadow: 1,
        flexDirection: 'row-reverse',
      }}>
        <Typography variant="h4" component="h1" sx={{ textAlign: 'right' }}>
          الموظفون
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
        >
          إضافة موظف
        </Button>
      </Box>

      <Box sx={{ 
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        borderRadius: '0 0 8px 8px',
        boxShadow: 1,
      }}>
        {/* Barre de recherche et filtres */}
        <Box sx={{ 
          width: '100%',
          p: 2,
          display: 'flex', 
          gap: 2,
          flexWrap: 'wrap',
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
          flexDirection: 'row-reverse',
          justifyContent: 'flex-start',
        }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<FilterListIcon />}
            onClick={() => setFilterDialogOpen(true)}
          >
            تصفية
          </Button>
          <TextField
            sx={{ 
              flexGrow: 1,
              minWidth: '300px',
              maxWidth: '400px',
              '& .MuiInputBase-root': {
                direction: 'rtl',
              },
              '& .MuiInputLabel-root': {
                right: 0,
                left: 'auto',
                transformOrigin: 'right',
              },
              '& .MuiInputAdornment-root': {
                marginLeft: 0,
                marginRight: 8,
              }
            }}
            variant="outlined"
            size="small"
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

        <TableContainer sx={{ 
          width: '100%',
          '& .MuiTable-root': {
            width: '100%',
            tableLayout: 'fixed',
          },
          '& .MuiTableCell-root': {
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            padding: '8px 16px',
          }
        }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '8%' }}>الإجراءات</TableCell>
                <TableCell sx={{ width: '7%' }}>الحالة</TableCell>
                <TableCell sx={{ width: '8%' }}>تاريخ التوظيف</TableCell>
                <TableCell sx={{ width: '10%' }}>النعيين</TableCell>
                <TableCell sx={{ width: '10%' }}>الوظيفة</TableCell>
                <TableCell sx={{ width: '6%' }}>الجنس</TableCell>
                <TableCell sx={{ width: '8%' }}>تاريخ الميلاد</TableCell>
                <TableCell sx={{ width: '12%' }}>الاسم</TableCell>
                <TableCell sx={{ width: '12%' }}>اللقب</TableCell>
                <TableCell sx={{ width: '8%' }}>الرقم الوظيفي</TableCell>
                <TableCell sx={{ width: '6%' }}>الصورة</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEmployees
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((employee) => (
                  <TableRow
                    key={employee._id}
                    onMouseEnter={() => setHoveredEmployee(employee)}
                    onMouseLeave={() => setHoveredEmployee(null)}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="تعديل">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenForm(employee)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="حذف">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(employee)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="طباعة البطاقة المهنية">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => handlePrintClick(employee)}
                          >
                            <PrintIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={statuses.find(s => s.value === employee.status)?.label || 'نشط'}
                        color={statusColors[employee.status] || 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {formatDate(employee.dateEmbauche)}
                    </TableCell>
                    <TableCell>{employee.centre || '-'}</TableCell>
                    <TableCell>{employee.poste}</TableCell>
                    <TableCell>{employee.sexe === 'M' ? 'ذكر' : 'أنثى'}</TableCell>
                    <TableCell>
                      {formatDate(employee.dateNaissance)}
                    </TableCell>
                    <TableCell>{employee.nom}</TableCell>
                    <TableCell>{employee.prenom}</TableCell>
                    <TableCell>{employee.matricule}</TableCell>
                    <TableCell>
                      {employee.photo ? (
                        <Box
                          component="img"
                          src={getPhotoUrl(employee.photo)}
                          alt={`${employee.nom} ${employee.prenom}`}
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid',
                            borderColor: 'primary.main',
                            backgroundColor: 'grey.100',
                            display: 'block',
                            margin: '0 auto'
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            bgcolor: 'grey.200',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px solid',
                            borderColor: 'grey.400',
                            margin: '0 auto'
                          }}
                        >
                          <PersonIcon sx={{ color: 'grey.500' }} />
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredEmployees.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50]}
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

      {openForm && (
        <Box 
          ref={formRef} 
          sx={{ 
            width: '100%',
            mt: 3,
            mb: 3
          }}
        >
          <EmployeeForm 
            open={openForm} 
            onClose={handleCloseForm}
            employee={selectedEmployee}
          />
        </Box>
      )}

      {hoveredEmployee && (
        <Box sx={{
          position: 'fixed',      
          right: '50%',
          maxHeight: 'calc(100vh - 40px)',
          bgcolor: 'background.paper',
          boxShadow: 3,          
          zIndex: 9999,
          borderRadius: '14px',
          opacity: hoveredEmployee ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
          pointerEvents: 'none',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '30%',
            height: '100%',
            bgcolor: 'rgba(255, 255, 255, 0.3)',
            transform: 'skewX(-20deg)',
            animation: 'shine 1.5s ease-in-out forwards'
          }
        }}>
          <style>
            {`
              @keyframes shine {
                0% {
                  left: -100%;
                }
                100% {
                  left: 150%;
                }
              }
            `}
          </style>
          <EmployeePreview employee={hoveredEmployee} />
        </Box>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          تأكيد الحذف
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            هل أنت متأكد من حذف الموظف {employeeToDelete?.nom} {employeeToDelete?.prenom}؟
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            إلغاء
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            حذف
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>تصفية الموظفين</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>الحالة</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                label="الحالة"
              >
                <MenuItem value="all">الكل</MenuItem>
                {statuses.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>الجنس</InputLabel>
              <Select
                value={filters.sexe}
                onChange={(e) => handleFilterChange('sexe', e.target.value)}
                label="الجنس"
              >
                <MenuItem value="all">الكل</MenuItem>
                <MenuItem value="M">ذكر</MenuItem>
                <MenuItem value="F">أنثى</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>المركز</InputLabel>
              <Select
                value={filters.centre}
                onChange={(e) => handleFilterChange('centre', e.target.value)}
                label="المركز"
              >
                <MenuItem value="all">الكل</MenuItem>
                {uniqueCentres.map((centre) => (
                  <MenuItem key={centre} value={centre}>
                    {centre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>الوظيفة</InputLabel>
              <Select
                value={filters.poste}
                onChange={(e) => handleFilterChange('poste', e.target.value)}
                label="الوظيفة"
              >
                <MenuItem value="all">الكل</MenuItem>
                {uniquePostes.map((poste) => (
                  <MenuItem key={poste} value={poste}>
                    {poste}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFilterReset}>
            إعادة تعيين
          </Button>
          <Button onClick={() => setFilterDialogOpen(false)}>
            إغلاق
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={printDialogOpen}
        onClose={() => setPrintDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>طباعة البطاقة المهنية</DialogTitle>
        <DialogContent>
          <DialogContentText>
            هل تريد طباعة البطاقة المهنية لـ {selectedEmployee?.nom} {selectedEmployee?.prenom}؟
          </DialogContentText>
          {selectedEmployee && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <EmployeeCard ref={cardRef} employee={selectedEmployee} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPrintDialogOpen(false)}>
            إلغاء
          </Button>
          <Button onClick={handlePrintConfirm} color="primary" variant="contained">
            طباعة
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Employees; 