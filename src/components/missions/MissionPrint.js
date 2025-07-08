import React, { forwardRef } from 'react';
import { Box, Typography } from '@mui/material';
import QRCode from 'qrcode.react';
import { QRCodeSVG } from 'qrcode.react';

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
            canvas, svg { display: inline !important; visibility: visible !important; }
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

      {/* Date en bas à droite */}
      <Typography variant="body1" sx={{ 
        position: 'absolute',
        bottom: '4cm',
        right: '2cm',
        fontSize: '2em',
        fontFamily: '"Arabic Typesetting", "Traditional Arabic", Arial, sans-serif'
      }}>
        المدية : {new Date().toLocaleDateString('fr-FR')}
      </Typography>
    </Box>
  );
});

// Version simplifiée pour impression multiple
export const MissionPrintSimple = ({ mission }) => {
  const employee = mission.employee || {};
  const qrData = JSON.stringify({
    nom: employee.nom || '',
    prenom: employee.prenom || '',
    fonction: employee.fonction || employee.poste || '',
    centre: employee.centre || '',
    code_mission: mission.code_mission || '',
    startDate: mission.startDate || '',
    endDate: mission.endDate || '',
  });
  return (
    <div style={{
      width: '100%',
      height: '297mm',
      boxSizing: 'border-box',
      padding: '4cm 1.5cm 1.5cm 1.5cm',
      margin: 0,
      background: 'white',
      fontFamily: 'Cairo, "Arabic Typesetting", Arial, sans-serif',
      direction: 'rtl',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      position: 'relative',
    }}>
      {/* En-tête */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5em' }}>
        {/* Unité/structure à droite */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 120 }}>
          <div style={{ fontSize: '1.1em', fontWeight: 'bold', marginBottom: '0.2em' }}>منطقة الجزائر</div>
          <div style={{ fontSize: '1.1em', fontWeight: 'bold' }}>وحدة المدية</div>
        </div>
        {/* Titre centré sur la même ligne */}
        <div style={{ fontSize: '2em', fontWeight: 'bold', textDecoration: 'underline', fontFamily: '"Arabic Typesetting", "Traditional Arabic", Arial, sans-serif', flex: 1, textAlign: 'center' }}>
          تكليف بمهمة
        </div>
        {/* QR code en dessous du numéro mission à gauche */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 120 }}>
          <div style={{ fontSize: '1em', fontWeight: 'bold', marginBottom: '0.5em' }}>N°: {mission.code_mission || ''}</div>
          <QRCodeSVG value={qrData} size={60} level="M" includeMargin={true} />
        </div>
      </div>
      {/* Tableau des champs avec pointillés */}
      <div style={{ width: '90%', margin: '0 auto', marginBottom: '2em' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '1.2em' }}>
          <tbody>
            <tr style={{ height: '2cm' }}>
              <td style={{ fontWeight: 'bold', textAlign: 'right', width: '35%' }}>الاسم :</td>
              <td style={{ textAlign: 'center', width: '85%', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', height: '100%', paddingRight: '0' }}>
                  <span style={{ color: '#000' }}>...........................</span>
                  <span style={{ marginLeft: '0.2cm', marginRight: '0.2cm', minWidth: '4.5cm' }}>{employee.prenom || ''}</span>
                  <span style={{ color: '#000' }}>...........................</span>
                </div>
              </td>
            </tr>
            <tr style={{ height: '2cm' }}>
              <td style={{ fontWeight: 'bold', textAlign: 'right' }}>اللقب :</td>
              <td style={{ textAlign: 'center', width: '85%', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', height: '100%', paddingRight: '0' }}>
                  <span style={{ color: '#000' }}>...........................</span>
                  <span style={{ marginLeft: '0.2cm', marginRight: '0.2cm', minWidth: '4.5cm' }}>{employee.nom || ''}</span>
                  <span style={{ color: '#000' }}>...........................</span>
                </div>
              </td>
            </tr>
            <tr style={{ height: '2cm' }}>
              <td style={{ fontWeight: 'bold', textAlign: 'right' }}>التعيين :</td>
              <td style={{ textAlign: 'center', width: '85%', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', height: '100%', paddingRight: '0' }}>
                  <span style={{ color: '#000' }}>...........................</span>
                  <span style={{ marginLeft: '0.2cm', marginRight: '0.2cm', minWidth: '4.5cm' }}>{employee.centre || ''}</span>
                  <span style={{ color: '#000' }}>...........................</span>
                </div>
              </td>
            </tr>
            <tr style={{ height: '2cm' }}>
              <td style={{ fontWeight: 'bold', textAlign: 'right' }}>المهنة :</td>
              <td style={{ textAlign: 'center', width: '85%', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', height: '100%', paddingRight: '0' }}>
                  <span style={{ color: '#000' }}>...........................</span>
                  <span style={{ marginLeft: '0.2cm', marginRight: '0.2cm', minWidth: '4.5cm' }}>{employee.poste || employee.fonction || ''}</span>
                  <span style={{ color: '#000' }}>...........................</span>
                </div>
              </td>
            </tr>
            <tr style={{ height: '2cm' }}>
              <td style={{ fontWeight: 'bold', textAlign: 'right' }}>سبب التنقل :</td>
              <td style={{ textAlign: 'center', width: '85%', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', height: '100%', paddingRight: '0' }}>
                  <span style={{ color: '#000' }}>...........................</span>
                  <span style={{ marginLeft: '0.2cm', marginRight: '0.2cm', minWidth: '4.5cm' }}>مهمة</span>
                  <span style={{ color: '#000' }}>...........................</span>
                </div>
              </td>
            </tr>
            <tr style={{ height: '2cm' }}>
              <td style={{ fontWeight: 'bold', textAlign: 'right' }}>تاريخ الانطلاق :</td>
              <td style={{ textAlign: 'center', width: '85%', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', height: '100%', paddingRight: '0' }}>
                  <span style={{ color: '#000' }}>...........................</span>
                  <span style={{ marginLeft: '0.2cm', marginRight: '0.2cm', minWidth: '4.5cm' }}>{mission.startDate ? new Date(mission.startDate).toLocaleDateString('fr-FR') : ''}</span>
                  <span style={{ color: '#000' }}>...........................</span>
                </div>
              </td>
            </tr>
            <tr style={{ height: '2cm' }}>
              <td style={{ fontWeight: 'bold', textAlign: 'right' }}>تاريخ الرجوع :</td>
              <td style={{ textAlign: 'center', width: '85%', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', height: '100%', paddingRight: '0' }}>
                  <span style={{ color: '#000' }}>...........................</span>
                  <span style={{ marginLeft: '0.2cm', marginRight: '0.2cm', minWidth: '4.5cm' }}>{mission.endDate ? new Date(mission.endDate).toLocaleDateString('fr-FR') : ''}</span>
                  <span style={{ color: '#000' }}>...........................</span>
                </div>
              </td>
            </tr>
            <tr style={{ height: '2cm' }}>
              <td style={{ fontWeight: 'bold', textAlign: 'right' }}>وسيلة النقل :</td>
              <td style={{ textAlign: 'center', width: '85%', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', height: '100%', paddingRight: '0' }}>
                  <span style={{ color: '#000' }}>...........................</span>
                  <span style={{ marginLeft: '0.2cm', marginRight: '0.2cm', minWidth: '4.5cm' }}>{mission.transportMode?.nom || ''}</span>
                  <span style={{ color: '#000', width: '4cm' }}>...........................</span>
                </div>
              </td>
            </tr>
            <tr style={{ height: '2cm' }}>
              <td style={{ fontWeight: 'bold', textAlign: 'right' }}>يسافر الى :</td>
              <td style={{ textAlign: 'center', width: '85%', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', height: '100%', paddingRight: '0' }}>
                  <span style={{ color: '#000' }}>...........................</span>
                  <span style={{ marginLeft: '0.2cm', marginRight: '0.2cm', minWidth: '4.5cm' }}>{mission.destinations && mission.destinations.length > 0 ? mission.destinations[0].name : ''}</span>
                  <span style={{ color: '#000' }}>...........................</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {/* Date et lieu en bas à gauche */}
      <div style={{ position: 'absolute', left: '2cm', bottom: '3.5cm', fontSize: '1.1em' }}>
        المدية : {new Date().toLocaleDateString('fr-FR')}
      </div>
      {/* Espace pour cachet/signature en bas à droite */}
      <div style={{ position: 'absolute', right: '2cm', bottom: '1.5cm', fontSize: '1.1em', minWidth: 120 }}>
        {/* Cachet/Signature */}
      </div>
    </div>
  );
};

// Version responsive pour mobile
export const MissionPrintMobile = ({ mission }) => {
  const employee = mission.employee || {};
  const qrData = JSON.stringify({
    nom: employee.nom || '',
    prenom: employee.prenom || '',
    fonction: employee.fonction || employee.poste || '',
    centre: employee.centre || '',
    code_mission: mission.code_mission || '',
    startDate: mission.startDate || '',
    endDate: mission.endDate || '',
  });
  
  return (
    <div style={{
      width: '100%',
      padding: '16px',
      background: 'white',
      fontFamily: 'Cairo, "Arabic Typesetting", Arial, sans-serif',
      direction: 'rtl',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      margin: '8px 0',
    }}>
      {/* En-tête mobile */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '20px',
        borderBottom: '2px solid #e0e0e0',
        paddingBottom: '16px'
      }}>
        <div style={{ fontSize: '1.2em', fontWeight: 'bold', marginBottom: '8px' }}>
          تكليف بمهمة
        </div>
        <div style={{ fontSize: '0.9em', color: '#666' }}>
          N°: {mission.code_mission || ''}
        </div>
        <div style={{ marginTop: '8px' }}>
          <QRCodeSVG value={qrData} size={40} level="M" includeMargin={true} />
        </div>
      </div>
      
      {/* Informations de l'employé */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '8px 0',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <span style={{ fontWeight: 'bold', fontSize: '0.9em' }}>الاسم:</span>
          <span style={{ fontSize: '0.9em' }}>{employee.prenom || ''}</span>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '8px 0',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <span style={{ fontWeight: 'bold', fontSize: '0.9em' }}>اللقب:</span>
          <span style={{ fontSize: '0.9em' }}>{employee.nom || ''}</span>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '8px 0',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <span style={{ fontWeight: 'bold', fontSize: '0.9em' }}>التعيين:</span>
          <span style={{ fontSize: '0.9em' }}>{employee.centre || ''}</span>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '8px 0',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <span style={{ fontWeight: 'bold', fontSize: '0.9em' }}>المهنة:</span>
          <span style={{ fontSize: '0.9em' }}>{employee.poste || employee.fonction || ''}</span>
        </div>
      </div>
      
      {/* Informations de la mission */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '8px 0',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <span style={{ fontWeight: 'bold', fontSize: '0.9em' }}>سبب التنقل:</span>
          <span style={{ fontSize: '0.9em' }}>مهمة</span>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '8px 0',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <span style={{ fontWeight: 'bold', fontSize: '0.9em' }}>تاريخ الانطلاق:</span>
          <span style={{ fontSize: '0.9em' }}>
            {mission.startDate ? new Date(mission.startDate).toLocaleDateString('fr-FR') : ''}
          </span>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '8px 0',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <span style={{ fontWeight: 'bold', fontSize: '0.9em' }}>تاريخ الرجوع:</span>
          <span style={{ fontSize: '0.9em' }}>
            {mission.endDate ? new Date(mission.endDate).toLocaleDateString('fr-FR') : ''}
          </span>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '8px 0',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <span style={{ fontWeight: 'bold', fontSize: '0.9em' }}>وسيلة النقل:</span>
          <span style={{ fontSize: '0.9em' }}>{mission.transportMode?.nom || ''}</span>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '8px 0',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <span style={{ fontWeight: 'bold', fontSize: '0.9em' }}>يسافر الى:</span>
          <span style={{ fontSize: '0.9em' }}>
            {mission.destinations && mission.destinations.length > 0 ? mission.destinations[0].name : ''}
          </span>
        </div>
      </div>
      
      {/* Date et signature */}
      <div style={{ 
        marginTop: '16px', 
        textAlign: 'center',
        fontSize: '0.8em',
        color: '#666'
      }}>
        المدية : {new Date().toLocaleDateString('fr-FR')}
      </div>
    </div>
  );
};

// Version responsive pour mobile de MissionPrint principal
export const MissionPrintMobileIndividual = ({ mission }) => {
  const employee = mission.employee || {};
  
  // Données pour le QR code
  const qrData = JSON.stringify({
    nom: employee.nom || 'N/A',
    prenom: employee.prenom || 'N/A',
    fonction: employee.fonction || employee.poste || 'N/A',
    centre: employee.centre || 'N/A'
  });

  return (
    <div style={{
      width: '100%',
      padding: '16px',
      background: 'white',
      fontFamily: 'Cairo, "Arabic Typesetting", Arial, sans-serif',
      direction: 'rtl',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      margin: '8px 0',
    }}>
      {/* En-tête mobile */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '20px',
        borderBottom: '2px solid #e0e0e0',
        paddingBottom: '16px'
      }}>
        <div style={{ fontSize: '1.4em', fontWeight: 'bold', marginBottom: '8px', textDecoration: 'underline' }}>
          تكليف بمهمة
        </div>
        <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '8px' }}>
          منطقة الجزائر - ولاية المدية
        </div>
        <div style={{ fontSize: '1em', fontWeight: 'bold', marginBottom: '8px' }}>
          N°: {mission.code_mission || ''}
        </div>
        <div style={{ marginTop: '8px' }}>
          <QRCodeSVG value={qrData} size={50} level="M" includeMargin={true} />
        </div>
      </div>
      
      {/* Informations de l'employé */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '12px 0',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <span style={{ fontWeight: 'bold', fontSize: '1em' }}>الاسم:</span>
          <span style={{ fontSize: '1em' }}>{employee.prenom || ''}</span>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '12px 0',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <span style={{ fontWeight: 'bold', fontSize: '1em' }}>اللقب:</span>
          <span style={{ fontSize: '1em' }}>{employee.nom || ''}</span>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '12px 0',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <span style={{ fontWeight: 'bold', fontSize: '1em' }}>التعيين:</span>
          <span style={{ fontSize: '1em' }}>{employee.centre || ''}</span>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '12px 0',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <span style={{ fontWeight: 'bold', fontSize: '1em' }}>المهنة:</span>
          <span style={{ fontSize: '1em' }}>{employee.poste || employee.fonction || ''}</span>
        </div>
      </div>
      
      {/* Informations de la mission */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '12px 0',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <span style={{ fontWeight: 'bold', fontSize: '1em' }}>سبب التنقل:</span>
          <span style={{ fontSize: '1em' }}>مهمة</span>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '12px 0',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <span style={{ fontWeight: 'bold', fontSize: '1em' }}>تاريخ الانطلاق:</span>
          <span style={{ fontSize: '1em' }}>
            {mission.startDate ? new Date(mission.startDate).toLocaleDateString('fr-FR') : ''}
          </span>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '12px 0',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <span style={{ fontWeight: 'bold', fontSize: '1em' }}>تاريخ الرجوع:</span>
          <span style={{ fontSize: '1em' }}>
            {mission.endDate ? new Date(mission.endDate).toLocaleDateString('fr-FR') : ''}
          </span>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '12px 0',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <span style={{ fontWeight: 'bold', fontSize: '1em' }}>وسيلة النقل:</span>
          <span style={{ fontSize: '1em' }}>{mission.transportMode?.nom || ''}</span>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '12px 0',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <span style={{ fontWeight: 'bold', fontSize: '1em' }}>يسافر الى:</span>
          <span style={{ fontSize: '1em' }}>
            {mission.destinations && mission.destinations.length > 0 ? mission.destinations[0].name : ''}
          </span>
        </div>
      </div>
      
      {/* Date et signature */}
      <div style={{ 
        marginTop: '20px', 
        textAlign: 'center',
        fontSize: '0.9em',
        color: '#666',
        borderTop: '1px solid #e0e0e0',
        paddingTop: '16px'
      }}>
        المدية : {new Date().toLocaleDateString('fr-FR')}
      </div>
    </div>
  );
};

export default MissionPrint; 