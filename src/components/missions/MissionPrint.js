import React, { forwardRef } from 'react';
import { Box, Typography } from '@mui/material';
import QRCode from 'qrcode.react';

const MissionPrint = forwardRef(({ mission }, ref) => {
  const employee = mission.employee || {};
  
  // Données pour le QR code
  const qrData = JSON.stringify({
    nom: employee.nom || 'N/A',
    prenom: employee.prenom || 'N/A',
    fonction: employee.fonction || employee.poste || 'N/A',
    centre: employee.centre || 'N/A'
  });

  return (
    <Box ref={ref} sx={{ 
      p: 4, 
      position: 'relative', 
      minHeight: '297mm',
      width: '210mm',
      margin: '0 auto',
      backgroundColor: 'white',
      fontFamily: 'Cairo, Arial, sans-serif',
      direction: 'rtl',
      '@media print': {
        p: 0,
        margin: 0,
        width: '100%',
        minHeight: 'auto'
      }
    }}>
      {/* Import de la police Google Fonts */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap');
          @media print {
            @page {
              size: A4;
              margin: 0;
            }
            body {
              margin: 0;
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
              font-family: 'Cairo', Arial, sans-serif !important;
            }
          }
        `}
      </style>
      
      <Typography variant="h4" sx={{ 
        textAlign: 'center',
        position: 'absolute',
        top: '5cm',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '3.5em',
        fontWeight: 'bold',
        fontFamily: '"Arabic Typesetting", "Traditional Arabic", Arial, sans-serif',
        textDecoration: 'underline',
        width: '4.35cm',
        '@media print': {
          fontSize: '2.5em',
          top: '3cm'
        }
      }}>
        تكليف بمهمة
      </Typography>
      <Typography variant="h5" sx={{ 
        position: 'absolute',
        top: '5cm',
        left: '1cm',
        fontSize: '2.3em',
        fontFamily: '"Arabic Typesetting", "Traditional Arabic", Arial, sans-serif'
      }}>
        منطقة الجزائر
      </Typography>
      <Typography variant="h5" sx={{ 
        position: 'absolute',
        top: '5cm',
        right: '1cm',
        fontSize: '2em',
        fontFamily: '"Arabic Typesetting", "Traditional Arabic", Arial, sans-serif'
      }}>
        {mission.code_mission || 'N/A'}
      </Typography>
      <Box sx={{
        position: 'absolute',
        top: '5.8cm',
        right: '1cm',
        width: '2cm',
        height: '2cm'
      }}>
        <QRCode 
          value={qrData} 
          size={76} // 2cm = 76px environ
          level="M"
          includeMargin={true}
        />
      </Box>
      <Typography variant="h5" sx={{ 
        position: 'absolute',
        top: '5.8cm',
        left: '1cm',
        fontSize: '2.3em',
        fontFamily: '"Arabic Typesetting", "Traditional Arabic", Arial, sans-serif'
      }}>
        ولاية المدية
      </Typography>

      {/* Désignations à gauche */}
      <Typography variant="body1" sx={{ 
        position: 'absolute',
        top: '8cm',
        left: '1cm',
        fontSize: '2.2em',
        fontFamily: '"Arabic Typesetting", "Traditional Arabic", Arial, sans-serif'
      }}>
        اللقب
      </Typography>
      <Typography variant="body1" sx={{ 
        position: 'absolute',
        top: '10cm',
        left: '1cm',
        fontSize: '2.2em',
        fontFamily: '"Arabic Typesetting", "Traditional Arabic", Arial, sans-serif'
      }}>
        الاسم
      </Typography>
      <Typography variant="body1" sx={{ 
        position: 'absolute',
        top: '12cm',
        left: '1cm',
        fontSize: '2.2em',
        fontFamily: '"Arabic Typesetting", "Traditional Arabic", Arial, sans-serif'
      }}>
        التعيين
      </Typography>
      <Typography variant="body1" sx={{ 
        position: 'absolute',
        top: '14cm',
        left: '1cm',
        fontSize: '2.2em',
        fontFamily: '"Arabic Typesetting", "Traditional Arabic", Arial, sans-serif'
      }}>
        المهنة
      </Typography>
      <Typography variant="body1" sx={{ 
        position: 'absolute',
        top: '16cm',
        left: '1cm',
        fontSize: '2.2em',
        fontFamily: '"Arabic Typesetting", "Traditional Arabic", Arial, sans-serif'
      }}>
        سبب التنقل
      </Typography>
      <Typography variant="body1" sx={{ 
        position: 'absolute',
        top: '18cm',
        left: '1cm',
        fontSize: '2.2em',
        fontFamily: '"Arabic Typesetting", "Traditional Arabic", Arial, sans-serif'
      }}>
        تاريخ الانطلاق
      </Typography>
      <Typography variant="body1" sx={{ 
        position: 'absolute',
        top: '20cm',
        left: '1cm',
        fontSize: '2.2em',
        fontFamily: '"Arabic Typesetting", "Traditional Arabic", Arial, sans-serif'
      }}>
        تاريخ الرجوع
      </Typography>
      <Typography variant="body1" sx={{ 
        position: 'absolute',
        top: '22cm',
        left: '1cm',
        fontSize: '2.2em',
        fontFamily: '"Arabic Typesetting", "Traditional Arabic", Arial, sans-serif'
      }}>
        وسيلة النقل
      </Typography>
      <Typography variant="body1" sx={{ 
        position: 'absolute',
        top: '24cm',
        left: '1cm',
        fontSize: '2.2em',
        fontFamily: '"Arabic Typesetting", "Traditional Arabic", Arial, sans-serif'
      }}>
        يسافر الى
      </Typography>

      {/* Champs correspondants au milieu */}
      <Typography variant="body1" sx={{ 
        position: 'absolute',
        top: '8cm',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '2.2em',
        fontFamily: '"Arabic Typesetting", "Traditional Arabic", Arial, sans-serif',
        minWidth: '8cm',
        textAlign: 'center'
      }}>
        {employee.nom || '________________'}
      </Typography>
      <Typography variant="body1" sx={{ 
        position: 'absolute',
        top: '8cm',
        left: '4cm',
        fontSize: '2.2em',
        fontFamily: '"Arabic Typesetting", "Traditional Arabic", Arial, sans-serif',
        width: '3cm'
      }}>
        ....................
      </Typography>
      <Typography variant="body1" sx={{ 
        position: 'absolute',
        top: '8cm',
        right: '4cm',
        fontSize: '2.2em',
        fontFamily: '"Arabic Typesetting", "Traditional Arabic", Arial, sans-serif',
        width: '3cm',
        textAlign: 'right'
      }}>
        ....................
      </Typography>
      <Typography variant="body1" sx={{ 
        position: 'absolute',
        top: '10cm',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '2.2em',
        fontFamily: '"Arabic Typesetting", "Traditional Arabic", Arial, sans-serif',
        minWidth: '8cm',
        textAlign: 'center'
      }}>
        {employee.prenom || '________________'}
      </Typography>
      <Typography variant="body1" sx={{ 
        position: 'absolute',
        top: '10cm',
        left: '4cm',
        fontSize: '2.2em',
        fontFamily: '"Arabic Typesetting", "Traditional Arabic", Arial, sans-serif',
        width: '3cm'
      }}>
        ....................
      </Typography>
      <Typography variant="body1" sx={{ 
        position: 'absolute',
        top: '10cm',
        right: '4cm',
        fontSize: '2.2em',
        fontFamily: '"Arabic Typesetting", "Traditional Arabic", Arial, sans-serif',
        width: '3cm',
        textAlign: 'right'
      }}>
        ....................
      </Typography>
      <Typography variant="body1" sx={{ 
        position: 'absolute',
        top: '12cm',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '2.2em',
        fontFamily: '"Arabic Typesetting", "Traditional Arabic", Arial, sans-serif',
        minWidth: '8cm',
        textAlign: 'center'
      }}>
        {employee.centre || '________________'}
      </Typography>
      <Typography variant="body1" sx={{ 
        position: 'absolute',
        top: '12cm',
        left: '4cm',
        fontSize: '2.2em',
        fontFamily: '"Arabic Typesetting", "Traditional Arabic", Arial, sans-serif',
        width: '3cm'
      }}>
        ....................
      </Typography>
      <Typography variant="body1" sx={{ 
        position: 'absolute',
        top: '12cm',
        right: '4cm',
        fontSize: '2.2em',
        fontFamily: '"Arabic Typesetting", "Traditional Arabic", Arial, sans-serif',
        width: '3cm',
        textAlign: 'right'
      }}>
        ....................
      </Typography>
      <Typography variant="body1" sx={{ 
        position: 'absolute',
        top: '14cm',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '2.2em',
        fontFamily: '"Arabic Typesetting", "Traditional Arabic", Arial, sans-serif',
        minWidth: '8cm',
        textAlign: 'center'
      }}>
        {employee.poste || employee.fonction || '________________'}
      </Typography>
      <Typography variant="body1" sx={{ 
        position: 'absolute',
        top: '14cm',
        left: '4cm',
        fontSize: '2.2em',
        fontFamily: '"Arabic Typesetting", "Traditional Arabic", Arial, sans-serif',
        width: '3cm'
      }}>
        ....................
      </Typography>
      <Typography variant="body1" sx={{ 
        position: 'absolute',
        top: '14cm',
        right: '4cm',
        fontSize: '2.2em',
        fontFamily: '"Arabic Typesetting", "Traditional Arabic", Arial, sans-serif',
        width: '3cm',
        textAlign: 'right'
      }}>
        ....................
      </Typography>
      <Typography variant="body1" sx={{ 
        position: 'absolute',
        top: '16cm',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '2.2em',
        fontFamily: '"Arabic Typesetting", "Traditional Arabic", Arial, sans-serif',
        minWidth: '8cm',
        textAlign: 'center'
      }}>
        مهمة
      </Typography>
      <Typography variant="body1" sx={{ 
        position: 'absolute',
        top: '16cm',
        left: '4cm',
        fontSize: '2.2em',
        fontFamily: '"Arabic Typesetting", "Traditional Arabic", Arial, sans-serif',
        width: '3cm'
      }}>
        ....................
      </Typography>
      <Typography variant="body1" sx={{ 
        position: 'absolute',
        top: '16cm',
        right: '4cm',
        fontSize: '2.2em',
        fontFamily: '"Arabic Typesetting", "Traditional Arabic", Arial, sans-serif',
        width: '3cm',
        textAlign: 'right'
      }}>
        ....................
      </Typography>
      <Typography variant="body1" sx={{ 
        position: 'absolute',
        top: '18cm',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '2.2em',
        fontFamily: '"Arabic Typesetting", "Traditional Arabic", Arial, sans-serif',
        minWidth: '8cm',
        textAlign: 'center'
      }}>
        {mission.startDate ? new Date(mission.startDate).toLocaleDateString('fr-FR') : '________________'}
      </Typography>
      <Typography variant="body1" sx={{ 
        position: 'absolute',
        top: '18cm',
        left: '4cm',
        fontSize: '2.2em',
        fontFamily: '"Arabic Typesetting", "Traditional Arabic", Arial, sans-serif',
        width: '3cm'
      }}>
        ....................
      </Typography>
      <Typography variant="body1" sx={{ 
        position: 'absolute',
        top: '18cm',
        right: '4cm',
        fontSize: '2.2em',
        fontFamily: '"Arabic Typesetting", "Traditional Arabic", Arial, sans-serif',
        width: '3cm',
        textAlign: 'right'
      }}>
        ....................
      </Typography>
      <Typography variant="body1" sx={{ 
        position: 'absolute',
        top: '20cm',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '2.2em',
        fontFamily: '"Arabic Typesetting", "Traditional Arabic", Arial, sans-serif',
        minWidth: '8cm',
        textAlign: 'center'
      }}>
        {mission.endDate ? new Date(mission.endDate).toLocaleDateString('fr-FR') : '________________'}
      </Typography>
      <Typography variant="body1" sx={{ 
        position: 'absolute',
        top: '20cm',
        left: '4cm',
        fontSize: '2.2em',
        fontFamily: '"Arabic Typesetting", "Traditional Arabic", Arial, sans-serif',
        width: '3cm'
      }}>
        ....................
      </Typography>
      <Typography variant="body1" sx={{ 
        position: 'absolute',
        top: '20cm',
        right: '4cm',
        fontSize: '2.2em',
        fontFamily: '"Arabic Typesetting", "Traditional Arabic", Arial, sans-serif',
        width: '3cm',
        textAlign: 'right'
      }}>
        ....................
      </Typography>
      <Typography variant="body1" sx={{ 
        position: 'absolute',
        top: '22cm',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '2.2em',
        fontFamily: '"Arabic Typesetting", "Traditional Arabic", Arial, sans-serif',
        minWidth: '8cm',
        textAlign: 'center'
      }}>
        {mission.transportMode?.nom || '________________'}
      </Typography>
      <Typography variant="body1" sx={{ 
        position: 'absolute',
        top: '22cm',
        left: '4cm',
        fontSize: '2.2em',
        fontFamily: '"Arabic Typesetting", "Traditional Arabic", Arial, sans-serif',
        width: '3cm'
      }}>
        ....................
      </Typography>
      <Typography variant="body1" sx={{ 
        position: 'absolute',
        top: '22cm',
        right: '4cm',
        fontSize: '2.2em',
        fontFamily: '"Arabic Typesetting", "Traditional Arabic", Arial, sans-serif',
        width: '3cm',
        textAlign: 'right'
      }}>
        ....................
      </Typography>
      <Typography variant="body1" sx={{ 
        position: 'absolute',
        top: '24cm',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '2.2em',
        fontFamily: '"Arabic Typesetting", "Traditional Arabic", Arial, sans-serif',
        minWidth: '8cm',
        textAlign: 'center'
      }}>
        {mission.destinations && mission.destinations.length > 0 ? mission.destinations[0].name : '________________'}
      </Typography>
      <Typography variant="body1" sx={{ 
        position: 'absolute',
        top: '24cm',
        left: '4cm',
        fontSize: '2.2em',
        fontFamily: '"Arabic Typesetting", "Traditional Arabic", Arial, sans-serif',
        width: '3cm'
      }}>
        ....................
      </Typography>
      <Typography variant="body1" sx={{ 
        position: 'absolute',
        top: '24cm',
        right: '4cm',
        fontSize: '2.2em',
        fontFamily: '"Arabic Typesetting", "Traditional Arabic", Arial, sans-serif',
        width: '3cm',
        textAlign: 'right'
      }}>
        ....................
      </Typography>

      {/* Date en bas à droite */}
      <Typography variant="body1" sx={{ 
        position: 'absolute',
        bottom: '2cm',
        right: '2cm',
        fontSize: '2em',
        fontFamily: '"Arabic Typesetting", "Traditional Arabic", Arial, sans-serif'
      }}>
        المدية : {new Date().toLocaleDateString('fr-FR')}
      </Typography>
    </Box>
  );
});

export default MissionPrint; 