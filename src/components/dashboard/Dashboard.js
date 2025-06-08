import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { fetchMissionsStart, fetchMissionsSuccess, fetchMissionsFailure } from '../../store/slices/missionsSlice';
import { fetchEmployeesStart, fetchEmployeesSuccess, fetchEmployeesFailure } from '../../store/slices/employeesSlice';
import axiosInstance from '../../config/axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Déplacer le composant StatCard en dehors du composant Dashboard
const StatCard = React.memo(({ title, value, icon, color, subtitle }) => (
  <Card 
    sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      transition: 'all 0.3s ease-in-out',
      borderRadius: 3,
      '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: '0 10px 20px rgba(0,0,0,0.12), 0 6px 6px rgba(0,0,0,0.16)',
      },
      bgcolor: 'background.paper',
      border: '1px solid',
      borderColor: `${color}.light`,
    }}
  >
    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box 
          sx={{ 
            color: `${color}.main`, 
            ml: 2,
            p: 2,
            borderRadius: '50%',
            bgcolor: `${color}.lighter`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
          {title}
        </Typography>
      </Box>
      <Typography 
        variant="h4" 
        component="div" 
        sx={{ 
          mt: 'auto',
          fontWeight: 'bold',
          color: `${color}.dark`,
          mb: 1,
        }}
      >
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.4 }}>
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
));

// Définir le nom du composant pour le débogage
StatCard.displayName = 'StatCard';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { missions, alerts, loading: missionsLoading } = useSelector((state) => state.missions);
  const { employees, loading: employeesLoading } = useSelector((state) => state.employees);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        // Fetch missions
        dispatch(fetchMissionsStart());
        const missionsResponse = await axiosInstance.get('/missions');
        if (isMounted) {
          dispatch(fetchMissionsSuccess(missionsResponse.data));
        }

        // Fetch employees
        dispatch(fetchEmployeesStart());
        const employeesResponse = await axiosInstance.get('/employees');
        if (isMounted) {
          dispatch(fetchEmployeesSuccess(employeesResponse.data));
        }
      } catch (error) {
        if (isMounted) {
          console.error('Erreur lors de la récupération des données:', error);
          const errorMessage = error.response?.data?.message || error.message || 'Une erreur est survenue lors de la récupération des données';
          dispatch(fetchMissionsFailure(errorMessage));
          dispatch(fetchEmployeesFailure(errorMessage));
        }
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  const activeMissions = missions.filter(m => m.status === 'active');
  const monthlyMissions = missions.filter(m => m.type === 'monthly' && m.status === 'active');
  const specialMissions = missions.filter(m => m.type === 'special' && m.status === 'active');
  const completedMissions = missions.filter(m => m.status === 'completed');

  // Calculer le pourcentage des employés en mission mensuelle
  const monthlyMissionPercentage = useMemo(() => {
    if (employees.length === 0) return 0;
    const employeesWithMonthlyMission = new Set(monthlyMissions.map(m => m.employee?._id)).size;
    return Math.round((employeesWithMonthlyMission / employees.length) * 100);
  }, [monthlyMissions, employees]);

  // Obtenir les 3 dernières missions
  const lastThreeMissions = useMemo(() => {
    return [...missions]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);
  }, [missions]);

  // Calculer le nombre de centres uniques
  const uniqueCentres = useMemo(() => {
    const centres = employees
      .map(emp => emp.centre)
      .filter(centre => centre && centre.trim() !== '');
    return [...new Set(centres)].length;
  }, [employees]);

  if (missionsLoading || employeesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2, color: 'text.secondary' }}>
          جاري التحميل...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      flexGrow: 1,
      p: { xs: 2, sm: 3 },
      overflowX: 'hidden',
      position: 'relative',
      zIndex: 1,
      bgcolor: 'background.default',
      minHeight: '100vh',
      direction: 'rtl',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end'
    }}>
      <Box sx={{ width: '100%', textAlign: 'right' }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            mb: 4,
            fontWeight: 'bold',
            color: 'text.primary',
            pt: 2,
            textAlign: 'right',
            borderBottom: '2px solid',
            borderColor: 'primary.main',
            pb: 2,
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          لوحة التحكم
        </Typography>
      </Box>

      {/* Statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="إجمالي الموظفين"
            value={employees.length}
            icon={<PeopleIcon fontSize="large" />}
            color="primary"
            subtitle="عدد الموظفين المسجلين في النظام"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="المهام النشطة"
            value={activeMissions.length}
            icon={<AssignmentIcon fontSize="large" />}
            color="secondary"
            subtitle="المهام الجارية حالياً"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="المهام الشهرية"
            value={`${monthlyMissionPercentage}%`}
            icon={<TrendingUpIcon fontSize="large" />}
            color="info"
            subtitle={`${monthlyMissions.length} مهمة نشطة - ${monthlyMissionPercentage}% من الموظفين`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="المهام المكتملة"
            value={completedMissions.length}
            icon={<CheckCircleIcon fontSize="large" />}
            color="success"
            subtitle="المهام التي تم إنجازها"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="المراكز"
            value={uniqueCentres}
            icon={<BusinessIcon fontSize="large" />}
            color="warning"
            subtitle="عدد المراكز المسجلة في النظام"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.3s ease-in-out',
              borderRadius: 3,
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 10px 20px rgba(0,0,0,0.12), 0 6px 6px rgba(0,0,0,0.16)',
              },
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'primary.light',
            }}
          >
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box 
                  sx={{ 
                    color: 'primary.main', 
                    ml: 1,
                    p: 1,
                    borderRadius: '50%',
                    bgcolor: 'primary.lighter',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
                  }}
                >
                  <AssignmentIcon fontSize="medium" />
                </Box>
                <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                  المهام النشطة الأخيرة
                </Typography>
              </Box>
              <Box sx={{ flexGrow: 1, overflow: 'auto', mt: 1 }}>
                {lastThreeMissions.length > 0 ? (
                  <List sx={{ p: 0 }}>
                    {lastThreeMissions.map((mission, index) => (
                      <ListItem 
                        key={mission._id}
                        sx={{ 
                          p: 0.5,
                          mb: 0.5,
                          bgcolor: 'background.default',
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'primary.lighter',
                          flexDirection: 'row-reverse',
                          minHeight: '40px'
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: '32px' }}>
                          <LocationIcon fontSize="small" color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'primary.dark' }}>
                              {mission.code_mission || '-'}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {`${mission.employee?.nom || ''} ${mission.employee?.prenom || ''}`}
                            </Typography>
                          }
                          sx={{ textAlign: 'right', py: 0 }}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Alert 
                    icon={<CheckCircleIcon fontSize="small" />} 
                    severity="info"
                    sx={{ mt: 1, py: 0.5 }}
                  >
                    لا توجد مهام نشطة حالياً
                  </Alert>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alertes */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper 
            sx={{ 
              p: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 3,
              borderRadius: 2,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'warning.lighter',
            }}
          >
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ 
                fontWeight: 'bold',
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: 'warning.dark',
              }}
            >
              <WarningIcon color="warning" />
              تنبيهات المهام
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
              {alerts.monthlyMissions.length > 0 ? (
                <List>
                  {alerts.monthlyMissions.map((alert, index) => (
                    <ListItem 
                      key={index}
                      sx={{ 
                        mb: 1,
                        bgcolor: 'background.default',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'warning.lighter',
                      }}
                    >
                      <ListItemIcon>
                        <WarningIcon color="warning" />
                      </ListItemIcon>
                      <ListItemText
                        primary={alert.message}
                        secondary={alert.details}
                        primaryTypographyProps={{ fontWeight: 'medium', color: 'warning.dark' }}
                        secondaryTypographyProps={{ color: 'text.secondary' }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Alert 
                  icon={<CheckCircleIcon />} 
                  severity="success"
                  sx={{ mt: 2 }}
                >
                  لا توجد تنبيهات للمهام
                </Alert>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default React.memo(Dashboard); 