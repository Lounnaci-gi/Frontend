import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  Alert,
  Snackbar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  Paper,
  Grid,
  Divider,
  Card,
  CardContent,
  IconButton,
  Chip,
  Avatar,
  Fade,
  Slide,
} from '@mui/material';
import {
  Person as PersonIcon,
  Work as WorkIcon,
  ContactMail as ContactIcon,
  PhotoCamera as PhotoIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { createEmployee, updateEmployee } from '../../redux/actions/employeeActions';
import EmployeeCard from './EmployeeCard';
import axiosInstance from '../../config/axios';

const statuses = [
  { value: 'active', label: 'نشط', color: 'success' },
  { value: 'retired', label: 'متقاعد', color: 'error' },
  { value: 'onLeave', label: 'في إجازة', color: 'warning' },
  { value: 'exempt', label: 'معفى', color: 'info' },
];

const sexeOptions = [
  { value: 'M', label: 'ذكر' },
  { value: 'F', label: 'أنثى' }
];

const EmployeeForm = ({ open, onClose, employee }) => {
  const dispatch = useDispatch();
  const cardRef = useRef();
  const formRef = useRef(null);
  const [isMatriculeValid, setIsMatriculeValid] = useState(employee ? true : false);
  const [isCheckingMatricule, setIsCheckingMatricule] = useState(false);
  const [formData, setFormData] = useState({
    matricule: '',
    nom: '',
    prenom: '',
    dateNaissance: '',
    lieuNaissance: '',
    adresse: '',
    telephone: '',
    email: '',
    dateEmbauche: '',
    poste: '',
    centre: '',
    sexe: '',
    status: 'active',
    photo: null
  });

  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (employee) {
      setFormData({
        ...employee,
        dateNaissance: employee.dateNaissance ? new Date(employee.dateNaissance).toISOString().split('T')[0] : '',
        dateEmbauche: employee.dateEmbauche ? new Date(employee.dateEmbauche).toISOString().split('T')[0] : '',
        photo: null
      });
      if (employee.photo) {
        setPhotoPreview(employee.photo);
      }
    } else {
      setFormData({
        matricule: '',
        nom: '',
        prenom: '',
        dateNaissance: '',
        lieuNaissance: '',
        adresse: '',
        telephone: '',
        email: '',
        dateEmbauche: '',
        poste: '',
        centre: '',
        sexe: '',
        status: 'active',
        photo: null
      });
      setPhotoPreview(null);
    }
    setErrors({});
  }, [employee]);

  useEffect(() => {
    if (open && formRef.current) {
      setTimeout(() => {
        formRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  }, [open]);

  const checkMatriculeExists = async (matricule) => {
    if (!matricule || matricule.length < 4) return;
    
    setIsCheckingMatricule(true);
    try {
      if (employee && employee.matricule === matricule) {
        setErrors(prev => ({
          ...prev,
          matricule: ''
        }));
        setIsMatriculeValid(true);
        return;
      }

      const response = await axiosInstance.get(`/employees?matricule=${matricule}`);
      const exists = response.data.some(emp => emp.matricule === matricule);

      if (exists) {
        setErrors(prev => ({
          ...prev,
          matricule: 'رقم التسجيل موجود مسبقاً'
        }));
        setIsMatriculeValid(false);
      } else {
        setErrors(prev => ({
          ...prev,
          matricule: ''
        }));
        setIsMatriculeValid(true);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du matricule:', error);
      setErrors(prev => ({
        ...prev,
        matricule: ''
      }));
      setIsMatriculeValid(true);
    } finally {
      setIsCheckingMatricule(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    switch (name) {
      case 'matricule':
        const numericValue = value.replace(/[^0-9]/g, '').slice(0, 5);
        setFormData(prev => ({
          ...prev,
          [name]: numericValue
        }));
        if (numericValue.length >= 4) {
          checkMatriculeExists(numericValue);
        } else {
          setIsMatriculeValid(false);
          setErrors(prev => ({ ...prev, matricule: '' }));
        }
        break;

      case 'telephone':
        const phoneValue = value.replace(/[^0-9]/g, '');
        let formattedPhone = '';
        if (phoneValue.length > 0) {
          formattedPhone = phoneValue.slice(0, 10);
          if (formattedPhone.length > 4) {
            formattedPhone = formattedPhone.slice(0, 4) + ' ' + formattedPhone.slice(4);
          }
          if (formattedPhone.length > 7) {
            formattedPhone = formattedPhone.slice(0, 7) + ' ' + formattedPhone.slice(7);
          }
          if (formattedPhone.length > 10) {
            formattedPhone = formattedPhone.slice(0, 10) + ' ' + formattedPhone.slice(10);
          }
        }
        setFormData(prev => ({
          ...prev,
          [name]: formattedPhone
        }));
        break;

      case 'email':
        setFormData(prev => ({
          ...prev,
          [name]: value.slice(0, 50)
        }));
        break;

      case 'nom':
      case 'prenom':
        const arabicNameValue = value.replace(/[^\u0600-\u06FF\s]/g, '').slice(0, 30);
        setFormData(prev => ({
          ...prev,
          [name]: arabicNameValue
        }));
        break;

      case 'lieuNaissance':
      case 'adresse':
        setFormData(prev => ({
          ...prev,
          [name]: value.slice(0, 100)
        }));
        break;

      case 'centre':
      case 'poste':
        const arabicValue = value.replace(/[^\u0600-\u06FF\s-]/g, '').slice(0, 50);
        setFormData(prev => ({
          ...prev,
          [name]: arabicValue
        }));
        break;

      case 'sexe':
      case 'status':
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
        break;

      default:
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
    }

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        photo: file
      }));
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'dateNaissance' && formData.dateEmbauche) {
      const birthDate = new Date(value);
      const hireDate = new Date(formData.dateEmbauche);
      
      const ageAtHire = hireDate.getFullYear() - birthDate.getFullYear();
      const monthDiff = hireDate.getMonth() - birthDate.getMonth();
      const dayDiff = hireDate.getDate() - birthDate.getDate();
      const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? ageAtHire - 1 : ageAtHire;
      
      if (hireDate < birthDate) {
        setErrors(prev => ({
          ...prev,
          dateEmbauche: 'تاريخ التوظيف لا يمكن أن يكون قبل تاريخ الميلاد'
        }));
      } else if (actualAge < 18) {
        setErrors(prev => ({
          ...prev,
          dateEmbauche: 'يجب أن يكون عمر الموظف 18 سنة على الأقل عند التوظيف'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          dateEmbauche: ''
        }));
      }
    }
    
    if (name === 'dateEmbauche' && formData.dateNaissance) {
      const birthDate = new Date(formData.dateNaissance);
      const hireDate = new Date(value);
      
      const ageAtHire = hireDate.getFullYear() - birthDate.getFullYear();
      const monthDiff = hireDate.getMonth() - birthDate.getMonth();
      const dayDiff = hireDate.getDate() - birthDate.getDate();
      const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? ageAtHire - 1 : ageAtHire;
      
      if (hireDate < birthDate) {
        setErrors(prev => ({
          ...prev,
          dateEmbauche: 'تاريخ التوظيف لا يمكن أن يكون قبل تاريخ الميلاد'
        }));
      } else if (actualAge < 18) {
        setErrors(prev => ({
          ...prev,
          dateEmbauche: 'يجب أن يكون عمر الموظف 18 سنة على الأقل عند التوظيف'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          dateEmbauche: ''
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.matricule || !formData.nom || !formData.prenom || 
        !formData.dateNaissance || !formData.dateEmbauche || 
        !formData.sexe || !formData.status || !formData.centre || !formData.poste) {
      setErrors(prev => ({
        ...prev,
        submit: 'يرجى ملء جميع الحقول المطلوبة'
      }));
      return;
    }

    const formDataToSend = new FormData();
    
    try {
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (employee) {
        await dispatch(updateEmployee(employee._id, formDataToSend));
        setSuccessMessage('تم تحديث الموظف بنجاح');
      } else {
        await dispatch(createEmployee(formDataToSend));
        setSuccessMessage('تم إضافة الموظف بنجاح');
        
        setFormData({
          matricule: '',
          nom: '',
          prenom: '',
          dateNaissance: '',
          lieuNaissance: '',
          adresse: '',
          telephone: '',
          email: '',
          dateEmbauche: '',
          poste: '',
          centre: '',
          sexe: '',
          status: 'active',
          photo: null
        });
        setPhotoPreview(null);
        setErrors({});
        setIsMatriculeValid(false);
      }
      
      setTimeout(() => {
        onClose();
        setSuccessMessage('');
      }, 2000);
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        submit: error.response?.data?.message || error.message || 'حدث خطأ أثناء الحفظ'
      }));
    }
  };

  return (
    <Fade in={open} timeout={500}>
      <Box
        ref={formRef}
        sx={{
          width: '100%',
          maxWidth: '1200px',
          mx: 'auto',
          bgcolor: 'background.paper',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          mt: 3,
          mb: 3,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          position: 'relative',
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
            {employee ? <EditIcon /> : <AddIcon />}
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
              {employee ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {employee ? 'قم بتحديث معلومات الموظف' : 'أدخل معلومات الموظف الجديد'}
            </Typography>
          </Box>
        </Box>

        <Box
          component="form" 
          onSubmit={handleSubmit} 
          noValidate 
          sx={{ 
            p: 4,
            direction: 'ltr',
          }}
        >
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
                    <PersonIcon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      المعلومات الشخصية
                    </Typography>
                  </Box>

                  <Stack spacing={3}>
                    {/* Nom et Prénom */}
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="الاسم"
                          name="nom"
                          value={formData.nom}
                          onChange={handleChange}
                          error={!!errors.nom}
                          helperText={errors.nom || 'أحرف عربية فقط'}
                          required
                          InputLabelProps={{ shrink: true }}
                          disabled={!isMatriculeValid}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            }
                          }}
                          inputProps={{
                            maxLength: 30
                          }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="اللقب"
                          name="prenom"
                          value={formData.prenom}
                          onChange={handleChange}
                          error={!!errors.prenom}
                          helperText={errors.prenom || 'أحرف عربية فقط'}
                          required
                          InputLabelProps={{ shrink: true }}
                          disabled={!isMatriculeValid}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            }
                          }}
                          inputProps={{
                            maxLength: 30
                          }}
                        />
                      </Grid>
                    </Grid>

                    {/* Date et lieu de naissance */}
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          type="date"
                          label="تاريخ الميلاد"
                          name="dateNaissance"
                          value={formData.dateNaissance}
                          onChange={handleDateChange}
                          error={!!errors.dateNaissance}
                          helperText={errors.dateNaissance}
                          InputLabelProps={{ shrink: true }}
                          required
                          disabled={!isMatriculeValid}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="مكان الميلاد"
                          name="lieuNaissance"
                          value={formData.lieuNaissance}
                          onChange={handleChange}
                          error={!!errors.lieuNaissance}
                          helperText={errors.lieuNaissance || '100 حرف كحد أقصى'}
                          required
                          InputLabelProps={{ shrink: true }}
                          disabled={!isMatriculeValid}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            }
                          }}
                          inputProps={{
                            maxLength: 100
                          }}
                        />
                      </Grid>
                    </Grid>

                    {/* Adresse */}
                    <TextField
                      fullWidth
                      label="العنوان"
                      name="adresse"
                      value={formData.adresse}
                      onChange={handleChange}
                      error={!!errors.adresse}
                      helperText={errors.adresse || '100 حرف كحد أقصى'}
                      required
                      InputLabelProps={{ shrink: true }}
                      disabled={!isMatriculeValid}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                      inputProps={{
                        maxLength: 100
                      }}
                    />

                    {/* Sexe */}
                    <FormControl 
                      fullWidth
                      error={!!errors.sexe} 
                      required
                      disabled={!isMatriculeValid}
                    >
                      <InputLabel>الجنس</InputLabel>
                      <Select
                        name="sexe"
                        value={formData.sexe}
                        onChange={handleChange}
                        label="الجنس"
                        sx={{
                          borderRadius: 2,
                        }}
                      >
                        {sexeOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.sexe && (
                        <Typography color="error" variant="caption">
                          {errors.sexe}
                        </Typography>
                      )}
                    </FormControl>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Section 2: Informations professionnelles */}
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
                    <WorkIcon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      المعلومات المهنية
                    </Typography>
                  </Box>

                  <Stack spacing={3}>
                    {/* Matricule */}
                    <TextField
                      fullWidth
                      label="رقم التسجيل"
                      name="matricule"
                      value={formData.matricule}
                      onChange={handleChange}
                      error={!!errors.matricule}
                      helperText={
                        errors.matricule || 
                        (isCheckingMatricule ? 'جاري التحقق...' : 
                         isMatriculeValid ? 'رقم التسجيل متاح' : 
                         'أدخل 4 إلى 5 أرقام للتحقق')
                      }
                      required
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                      inputProps={{
                        maxLength: 5,
                        minLength: 4,
                        pattern: '[0-9]*'
                      }}
                    />

                    {/* Centre et Poste */}
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="المركز"
                          name="centre"
                          value={formData.centre}
                          onChange={handleChange}
                          error={!!errors.centre}
                          helperText={errors.centre || '50 حرف كحد أقصى'}
                          required
                          InputLabelProps={{ shrink: true }}
                          disabled={!isMatriculeValid}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            }
                          }}
                          inputProps={{
                            maxLength: 50
                          }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="الوظيفة"
                          name="poste"
                          value={formData.poste}
                          onChange={handleChange}
                          error={!!errors.poste}
                          helperText={errors.poste || '50 حرف كحد أقصى'}
                          required
                          InputLabelProps={{ shrink: true }}
                          disabled={!isMatriculeValid}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            }
                          }}
                          inputProps={{
                            maxLength: 50
                          }}
                        />
                      </Grid>
                    </Grid>

                    {/* Date d'embauche */}
                    <TextField
                      fullWidth
                      type="date"
                      label="تاريخ التوظيف"
                      name="dateEmbauche"
                      value={formData.dateEmbauche}
                      onChange={handleDateChange}
                      error={!!errors.dateEmbauche}
                      helperText={errors.dateEmbauche}
                      InputLabelProps={{ shrink: true }}
                      required
                      disabled={!isMatriculeValid}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />

                    {/* Statut */}
                    <FormControl 
                      fullWidth
                      error={!!errors.status} 
                      required
                      disabled={!isMatriculeValid}
                    >
                      <InputLabel>الحالة</InputLabel>
                      <Select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        label="الحالة"
                        sx={{
                          borderRadius: 2,
                        }}
                      >
                        {statuses.map((status) => (
                          <MenuItem key={status.value} value={status.value}>
                            <Chip 
                              label={status.label} 
                              color={status.color} 
                              size="small" 
                              sx={{ mr: 1 }}
                            />
                            {status.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.status && (
                        <Typography color="error" variant="caption">
                          {errors.status}
                        </Typography>
                      )}
                    </FormControl>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Section 3: Contact et Photo */}
            <Grid item xs={12}>
              <Card
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
                    <ContactIcon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      معلومات الاتصال والصورة
                    </Typography>
                  </Box>

                  <Grid container spacing={3}>
                    {/* Contact */}
                    <Grid item xs={12} md={8}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="رقم الهاتف (اختياري)"
                            name="telephone"
                            value={formData.telephone}
                            onChange={handleChange}
                            error={!!errors.telephone}
                            helperText={errors.telephone || 'مثال: 0663 97 94 46'}
                            InputLabelProps={{ shrink: true }}
                            disabled={!isMatriculeValid}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                direction: 'ltr',
                                textAlign: 'right'
                              },
                              '& .MuiInputBase-input': {
                                textAlign: 'right',
                                direction: 'ltr'
                              }
                            }}
                            inputProps={{
                              maxLength: 13,
                              style: { 
                                textAlign: 'right',
                                direction: 'ltr'
                              }
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="البريد الإلكتروني (اختياري)"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            error={!!errors.email}
                            helperText={errors.email || '50 حرف كحد أقصى'}
                            InputLabelProps={{ shrink: true }}
                            disabled={!isMatriculeValid}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              }
                            }}
                            inputProps={{
                              maxLength: 50
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>

                    {/* Photo */}
                    <Grid item xs={12} md={4}>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 2,
                          p: 2,
                          border: '2px dashed',
                          borderColor: 'divider',
                          borderRadius: 2,
                          bgcolor: 'grey.50',
                        }}
                      >
                        {photoPreview ? (
                          <Avatar
                            src={photoPreview}
                            sx={{
                              width: 100,
                              height: 100,
                              border: '3px solid',
                              borderColor: 'primary.main',
                            }}
                          />
                        ) : (
                          <Avatar
                            sx={{
                              width: 100,
                              height: 100,
                              bgcolor: 'grey.300',
                              border: '3px solid',
                              borderColor: 'grey.400',
                            }}
                          >
                            <PhotoIcon sx={{ fontSize: 40, color: 'grey.600' }} />
                          </Avatar>
                        )}
                        
                        <Button
                          variant="outlined"
                          component="label"
                          startIcon={<PhotoIcon />}
                          disabled={!isMatriculeValid}
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                          }}
                        >
                          {photoPreview ? 'تغيير الصورة' : 'إضافة صورة'}
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handlePhotoChange}
                            disabled={!isMatriculeValid}
                          />
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
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
              onClick={onClose}
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
              type="submit" 
              variant="contained" 
              startIcon={<SaveIcon />}
              onClick={handleSubmit}
              disabled={!isMatriculeValid && !employee}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                px: 4,
                background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                }
              }}
            >
              {employee ? 'تحديث الموظف' : 'حفظ الموظف'}
            </Button>
          </Box>

          {/* Messages d'erreur */}
          {errors.submit && (
            <Alert 
              severity="error" 
              sx={{ 
                mt: 3,
                borderRadius: 2,
              }}
            >
              {errors.submit}
            </Alert>
          )}

          <Snackbar
            open={!!successMessage}
            autoHideDuration={3000}
            onClose={() => setSuccessMessage('')}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert 
              onClose={() => setSuccessMessage('')} 
              severity="success" 
              sx={{ 
                width: '100%',
                borderRadius: 2,
              }}
            >
              {successMessage}
            </Alert>
          </Snackbar>

          {/* Composant EmployeeCard caché pour l'impression */}
          <Box sx={{ display: 'none' }}>
            <EmployeeCard ref={cardRef} employee={employee || formData} />
          </Box>
        </Box>
      </Box>
    </Fade>
  );
};

export default EmployeeForm; 