import React, { forwardRef } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import QRCode from 'qrcode.react';
import { formatGregorianDate } from '../../utils/dateUtils';

const MissionPrint = forwardRef(({ mission }, ref) => {
  const employee = mission.employee || {};

  // Préparer les données pour le QR code
  const qrData = JSON.stringify({
    code_mission: mission.code_mission || 'N/A',
    employee: {
      nom: employee.nom || 'N/A',
      prenom: employee.prenom || 'N/A',
      matricule: employee.matricule || 'N/A',
      poste: employee.poste || 'N/A',
      centre: employee.centre || 'N/A',
    },
    type: mission.type || 'N/A',
    destinations: mission.destinations && mission.destinations.length > 0 ? mission.destinations.map(d => d.name || d).join(', ') : 'N/A',
    transportMode: mission.transportMode || 'سيارة المصلحة',
  });

  return (
    <Box ref={ref} sx={{ p: 4, position: 'relative', minHeight: '297mm' }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, fontSize: '24pt' }}>N°: {mission.code_mission || 'N/A'}</Typography>
        <Typography variant="h5" sx={{ mb: 1, fontSize: '20pt' }}>تكليف مهمة</Typography>
        <Typography variant="h6" sx={{ mb: 1, fontSize: '16pt' }}>منطقة الجزائر</Typography>
        <Typography variant="h6" sx={{ mb: 1, fontSize: '16pt' }}>وحدة المدية</Typography>
      </Box>

      {/* Employee Info */}
      <Box sx={{ mt: 4 }}>
        <Grid container alignItems="center" sx={{ mb: 1, direction: 'ltr' }}>
          <Grid item xs={4} sx={{ textAlign: 'left' }}>
            <Typography variant="body1" sx={{ fontSize: '14pt' }}>الاسم:</Typography>
          </Grid>
          <Grid item xs={8} sx={{ textAlign: 'center' }}>
            <Typography variant="body1" sx={{ fontSize: '14pt' }}>{employee.prenom || 'N/A'}</Typography>
          </Grid>
        </Grid>
        <Grid container alignItems="center" sx={{ mb: 1, direction: 'ltr' }}>
          <Grid item xs={4} sx={{ textAlign: 'left' }}>
            <Typography variant="body1" sx={{ fontSize: '14pt' }}>اللقب:</Typography>
          </Grid>
          <Grid item xs={8} sx={{ textAlign: 'center' }}>
            <Typography variant="body1" sx={{ fontSize: '14pt' }}>{employee.nom || 'N/A'}</Typography>
          </Grid>
        </Grid>
        <Grid container alignItems="center" sx={{ mb: 1, direction: 'ltr' }}>
          <Grid item xs={4} sx={{ textAlign: 'left' }}>
            <Typography variant="body1" sx={{ fontSize: '14pt' }}>التعيين:</Typography>
          </Grid>
          <Grid item xs={8} sx={{ textAlign: 'center' }}>
            <Typography variant="body1" sx={{ fontSize: '14pt' }}>{employee.centre || 'N/A'}</Typography>
          </Grid>
        </Grid>
        <Grid container alignItems="center" sx={{ mb: 1, direction: 'ltr' }}>
          <Grid item xs={4} sx={{ textAlign: 'left' }}>
            <Typography variant="body1" sx={{ fontSize: '14pt' }}>المهنة:</Typography>
          </Grid>
          <Grid item xs={8} sx={{ textAlign: 'center' }}>
            <Typography variant="body1" sx={{ fontSize: '14pt' }}>{employee.poste || 'N/A'}</Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Mission Type */}
      <Box sx={{ mt: 4 }}>
        <Grid container alignItems="center" sx={{ mb: 1, direction: 'ltr' }}>
          <Grid item xs={4} sx={{ textAlign: 'left' }}>
            <Typography variant="body1" sx={{ fontSize: '14pt' }}>سبب التنقل:</Typography>
          </Grid>
          <Grid item xs={8} sx={{ textAlign: 'center' }}>
            <Typography variant="body1" sx={{ fontSize: '14pt' }}>مهمة</Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Mission Dates */}
      <Box sx={{ mt: 4 }}>
        <Grid container alignItems="center" sx={{ mb: 1, direction: 'ltr' }}>
          <Grid item xs={4} sx={{ textAlign: 'left' }}>
            <Typography variant="body1" sx={{ fontSize: '14pt' }}>تاريخ الانطلاق:</Typography>
          </Grid>
          <Grid item xs={8} sx={{ textAlign: 'center' }}>
            <Typography variant="body1" sx={{ fontSize: '14pt' }}>{formatGregorianDate(mission.startDate)}</Typography>
          </Grid>
        </Grid>
        <Grid container alignItems="center" sx={{ mb: 1, direction: 'ltr' }}>
          <Grid item xs={4} sx={{ textAlign: 'left' }}>
            <Typography variant="body1" sx={{ fontSize: '14pt' }}>تاريخ الرجوع:</Typography>
          </Grid>
          <Grid item xs={8} sx={{ textAlign: 'center' }}>
            <Typography variant="body1" sx={{ fontSize: '14pt' }}>{formatGregorianDate(mission.endDate)}</Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Transport and Destination */}
      <Box sx={{ mt: 4 }}>
        <Grid container alignItems="center" sx={{ mb: 1, direction: 'ltr' }}>
          <Grid item xs={4} sx={{ textAlign: 'left' }}>
            <Typography variant="body1" sx={{ fontSize: '14pt' }}>وسيلة النقل:</Typography>
          </Grid>
          <Grid item xs={8} sx={{ textAlign: 'center' }}>
            <Typography variant="body1" sx={{ fontSize: '14pt' }}>{mission.transport?.nom || mission.transportMode}</Typography>
          </Grid>
        </Grid>
        <Grid container alignItems="center" sx={{ mb: 1, direction: 'ltr' }}>
          <Grid item xs={4} sx={{ textAlign: 'left' }}>
            <Typography variant="body1" sx={{ fontSize: '14pt' }}>يسافر الى:</Typography>
          </Grid>
          <Grid item xs={8} sx={{ textAlign: 'center' }}>
            <Typography variant="body1" sx={{ fontSize: '14pt' }}>
              {mission.destinations && mission.destinations.length > 0 
                ? mission.destinations.map(d => d.name || d).join(', ') 
                : 'N/A'}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Footer / Signature Area (Removed) */}

      {/* Address at the very bottom */}
      <Box sx={{ position: 'absolute', bottom: '10mm', left: '20mm', right: '20mm', textAlign: 'center', fontSize: '8pt', borderTop: '1px solid black', pt: 0.5 }}>
        <Typography variant="caption">
          المقر الإجتماعي: حي قريطن، المدية - Médéa - Tél: (025) 74 13 35/32 Fax: (025) 74 13 43
        </Typography>
        <Typography variant="caption" display="block">
          على السلطات المدنية و العسكرية أن تسمح بكل حرية و في جميع الظروف لحاملي هذا الأمر بالمهمة و تسهيل له و تساعده لتأدية مهامه
        </Typography>
      </Box>
    </Box>
  );
});

export default MissionPrint; 