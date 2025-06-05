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
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { createEmployee, updateEmployee } from '../../redux/actions/employeeActions';
import EmployeeCard from './EmployeeCard';
import axiosInstance from '../../config/axios';

const statuses = [
  { value: 'active', label: 'نشط' },
  { value: 'retired', label: 'متقاعد' },
  { value: 'onLeave', label: 'في إجازة' },
  { value: 'exempt', label: 'معفى' },
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
        const dialogElement = formRef.current.closest('.MuiDialog-root');
        if (dialogElement) {
          const dialogPaper = dialogElement.querySelector('.MuiDialog-paper');
          if (dialogPaper) {
            const rect = dialogPaper.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const targetPosition = rect.top + scrollTop - 20; // 20px de marge en haut
            
            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });
          }
        }
      }, 300);
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
    
    // Validation spéciale pour chaque champ
    switch (name) {
      case 'matricule':
        // Ne permet que les chiffres et limite à 5 caractères
        const numericValue = value.replace(/[^0-9]/g, '').slice(0, 5);
        setFormData(prev => ({
          ...prev,
          [name]: numericValue
        }));
        // Vérifier le matricule après un délai de 500ms
        if (numericValue.length >= 4) {
          checkMatriculeExists(numericValue);
        } else {
          setIsMatriculeValid(false);
          setErrors(prev => ({ ...prev, matricule: '' })); // Clear matricule error if too short
        }
        break;

      case 'telephone':
        // Format: 0663 97 94 46 (13 caractères au total avec les espaces)
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
        // Limite à 50 caractères
        setFormData(prev => ({
          ...prev,
          [name]: value.slice(0, 50)
        }));
        break;

      case 'nom':
      case 'prenom':
        // Ne permet que les lettres arabes et espaces
        const arabicNameValue = value.replace(/[^\u0600-\u06FF\s]/g, '').slice(0, 30);
        setFormData(prev => ({
          ...prev,
          [name]: arabicNameValue
        }));
        break;

      case 'lieuNaissance':
      case 'adresse':
        // Limite à 100 caractères
        setFormData(prev => ({
          ...prev,
          [name]: value.slice(0, 100)
        }));
        break;

      case 'centre':
      case 'poste':
        // Permettre les lettres arabes, espaces et tirets
        const arabicValue = value.replace(/[^\u0600-\u06FF\s-]/g, '').slice(0, 50);
        setFormData(prev => ({
          ...prev,
          [name]: arabicValue
        }));
        break;

      case 'sexe':
      case 'status':
        // Pour les champs de type Select, on accepte directement la valeur
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

    // Effacer l'erreur du champ modifié
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
    
    // Si on change la date de naissance, vérifier la date d'embauche
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
    
    // Si on change la date d'embauche, vérifier par rapport à la date de naissance
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

    // Vérification des champs requis de base
    if (!formData.matricule || !formData.nom || !formData.prenom || 
        !formData.dateNaissance || !formData.dateEmbauche || 
        !formData.sexe || !formData.status || !formData.centre || !formData.poste) {
      setErrors(prev => ({
        ...prev,
        submit: 'يرجى ملء جميع الحقول المطلطلبين (بما في ذلك المركز والوظيفة)'
      }));
      return;
    }

    const formDataToSend = new FormData();
    
    try {
      // Ajouter tous les champs au FormData
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
      }
      
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        submit: error.response?.data?.message || error.message || 'حدث خطأ أثناء الحفظ'
      }));
    }
  };

  return (
    <Box
      ref={formRef}
      sx={{
        width: '100%',
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 3,
        mt: 3,
        mb: 3,
        p: 3,
        position: 'relative',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          direction: 'ltr',
          width: '100%',
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
          mt: 2,
          p: 3
        }}
      >
        <Typography variant="h6" sx={{ mb: 3, textAlign: 'left' }}>
          {employee ? 'تعديل موظف' : 'إضافة موظف جديد'}
        </Typography>
        <Box
          component="form" 
          onSubmit={handleSubmit} 
          noValidate 
          sx={{ 
            mt: 0,
            direction: 'ltr',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            '& .MuiFormControl-root': {
              width: '100%',
              position: 'relative'
            }
          }}
        >
          <Stack spacing={3}>
            <TextField
              fullWidth={false}
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
                width: '100px',
                '& .MuiInputBase-root': {
                  width: '100px'
                }
              }}
              inputProps={{
                maxLength: 5,
                minLength: 4,
                pattern: '[0-9]*'
              }}
            />

            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth={false}
                label="الاسم"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                error={!!errors.nom}
                helperText={errors.nom || 'أحرف عربية فقط (30 حرف كحد أقصى)'}
                required
                InputLabelProps={{ shrink: true }}
                sx={{ width: '150px' }}
                inputProps={{
                  maxLength: 30
                }}
                disabled={!isMatriculeValid}
              />

              <TextField
                fullWidth={false}
                label="اللقب"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                error={!!errors.prenom}
                helperText={errors.prenom || 'أحرف عربية فقط (30 حرف كحد أقصى)'}
                required
                InputLabelProps={{ shrink: true }}
                sx={{ width: '150px' }}
                inputProps={{
                  maxLength: 30
                }}
                disabled={!isMatriculeValid}
              />
            </Stack>

            <Box
              sx={{
                opacity: isMatriculeValid ? 1 : 0.5,
                pointerEvents: isMatriculeValid ? 'auto' : 'none',
                transition: 'opacity 0.3s ease-in-out'
              }}
            >
              <Stack spacing={3}>
                <Stack direction="row" spacing={2}>
                  <TextField
                    fullWidth={false}
                    type="date"
                    label="تاريخ الميلاد"
                    name="dateNaissance"
                    value={formData.dateNaissance}
                    onChange={handleDateChange}
                    error={!!errors.dateNaissance}
                    helperText={errors.dateNaissance}
                    InputLabelProps={{ shrink: true }}
                    required
                    sx={{ 
                      width: '180px',
                      '& .MuiInputBase-root': {
                        width: '180px'
                      }
                    }}
                    disabled={!isMatriculeValid}
                  />

                  <TextField
                    fullWidth={false}
                    label="مكان الميلاد"
                    name="lieuNaissance"
                    value={formData.lieuNaissance}
                    onChange={handleChange}
                    error={!!errors.lieuNaissance}
                    helperText={errors.lieuNaissance || '100 حرف كحد أقصى'}
                    required
                    InputLabelProps={{ shrink: true }}
                    sx={{ width: '150px' }}
                    inputProps={{
                      maxLength: 100
                    }}
                    disabled={!isMatriculeValid}
                  />
                </Stack>

                <TextField
                  fullWidth={false}
                  label="العنوان"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  error={!!errors.adresse}
                  helperText={errors.adresse || '100 حرف كحد أقصى'}
                  required
                  InputLabelProps={{ shrink: true }}
                  sx={{ width: '200px' }}
                  inputProps={{
                    maxLength: 100
                  }}
                  disabled={!isMatriculeValid}
                />

                <FormControl 
                  error={!!errors.sexe} 
                  required
                  sx={{ 
                    width: '120px',
                    '& .MuiInputBase-root': {
                      width: '120px'
                    }
                  }}
                  disabled={!isMatriculeValid}
                >
                  <InputLabel id="sexe-label">الجنس</InputLabel>
                  <Select
                    labelId="sexe-label"
                    name="sexe"
                    value={formData.sexe}
                    onChange={handleChange}
                    label="الجنس"
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

                <TextField
                  fullWidth={false}
                  label="المركز"
                  name="centre"
                  value={formData.centre}
                  onChange={handleChange}
                  error={!!errors.centre}
                  helperText={errors.centre || 'أحرف عربية، مسافات، وشرطات (50 حرف كحد أقصى)'}
                  required
                  InputLabelProps={{ shrink: true }}
                  sx={{ width: '150px' }}
                  inputProps={{
                    maxLength: 50
                  }}
                  disabled={!isMatriculeValid}
                />

                <TextField
                  fullWidth={false}
                  label="الوظيفة"
                  name="poste"
                  value={formData.poste}
                  onChange={handleChange}
                  error={!!errors.poste}
                  helperText={errors.poste || 'أحرف عربية، مسافات، وشرطات (50 حرف كحد أقصى)'}
                  required
                  InputLabelProps={{ shrink: true }}
                  sx={{ width: '150px' }}
                  inputProps={{
                    maxLength: 50
                  }}
                  disabled={!isMatriculeValid}
                />

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
                  sx={{ 
                    width: '180px',
                    '& .MuiInputBase-root': {
                      width: '180px'
                    }
                  }}
                  disabled={!isMatriculeValid}
                />

                <Stack direction="row" spacing={2}>
                  <TextField
                    fullWidth={false}
                    label="رقم الهاتف (اختياري)"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    error={!!errors.telephone}
                    helperText={errors.telephone || 'مثال: 0663 97 94 46'}
                    InputLabelProps={{ shrink: true }}
                    sx={{ 
                      width: '250px',
                      '& .MuiInputBase-root': {
                        width: '250px',
                        direction: 'ltr',
                        textAlign: 'right'
                      },
                      '& .MuiInputBase-input': {
                        textAlign: 'right',
                        direction: 'ltr'
                      }
                    }}
                    inputProps={{
                      maxLength: 13, // Augmenté pour accommoder le format complet avec espaces
                      style: { 
                        textAlign: 'right',
                        direction: 'ltr'
                      }
                    }}
                    disabled={!isMatriculeValid}
                  />

                  <TextField
                    fullWidth={false}
                    label="البريد الإلكتروني (اختياري)"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email || '50 حرف كحد أقصى'}
                    InputLabelProps={{ shrink: true }}
                    sx={{ 
                      width: '250px',
                      '& .MuiInputBase-root': {
                        width: '250px'
                      }
                    }}
                    inputProps={{
                      maxLength: 50
                    }}
                    disabled={!isMatriculeValid}
                  />
                </Stack>

                <FormControl 
                  error={!!errors.status} 
                  required
                  sx={{ 
                    width: '120px',
                    '& .MuiInputBase-root': {
                      width: '120px'
                    }
                  }}
                  disabled={!isMatriculeValid}
                >
                  <InputLabel id="status-label">الحالة</InputLabel>
                  <Select
                    labelId="status-label"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    label="الحالة"
                  >
                    {statuses.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
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

                <Stack 
                  direction="row" 
                  spacing={2} 
                  alignItems="center"
                  sx={{ 
                    p: 2,
                    border: '1px dashed',
                    borderColor: 'divider',
                    borderRadius: 1,
                    minHeight: '56px'
                  }}
                >
                  <Button
                    variant="contained"
                    component="label"
                    color="primary"
                    disabled={!isMatriculeValid}
                  >
                    إضافة صورة (اختياري)
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handlePhotoChange}
                      disabled={!isMatriculeValid}
                    />
                  </Button>
                  {photoPreview && (
                    <Box sx={{ 
                      width: 100, 
                      height: 100, 
                      overflow: 'hidden', 
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: 'divider'
                    }}>
                      <img 
                        src={photoPreview} 
                        alt="Aperçu" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </Box>
                  )}
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </Box>
        <Box sx={{ 
          direction: 'ltr', 
          display: 'flex',
          justifyContent: 'flex-start', 
          mt: 3,
          gap: 2
        }}>
          <Button onClick={onClose} sx={{ mr: 1 }}>
            إلغاء
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            onClick={handleSubmit}
            disabled={!isMatriculeValid && !employee}
          >
            {employee ? 'تحديث' : 'حفظ'}
          </Button>
        </Box>

        {/* Display submit error after buttons */}
        {errors.submit && (
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            {errors.submit}
          </Alert>
        )}

        <Snackbar
          open={!!successMessage}
          autoHideDuration={2000}
          onClose={() => setSuccessMessage('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
            {successMessage}
          </Alert>
        </Snackbar>

        {/* Ajouter le composant EmployeeCard caché pour l'impression */}
        <Box sx={{ display: 'none' }}>
          <EmployeeCard ref={cardRef} employee={employee || formData} />
        </Box>
      </Box>
    </Box>
  );
};

export default EmployeeForm; 