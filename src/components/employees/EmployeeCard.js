import React, { forwardRef } from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';

const EmployeeCard = forwardRef(({ employee }, ref) => {
  // Obtenir l'URL de base de l'API
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // URL de l'image de fond depuis le dossier public
  const backgroundImageUrl = '/image.png';

  // Fonction pour obtenir l'URL complète de la photo
  const getPhotoUrl = (photoPath) => {
    if (!photoPath) return null;
    return `${API_URL}${photoPath}`;
  };

  // Fonction pour formater les dates
  const formatDate = (date) => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <Box
      ref={ref}
      sx={{
        width: '85.6mm',
        height: '107.96mm',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: 'white',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 2,
        boxSizing: 'border-box',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${backgroundImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.1,
          zIndex: 0
        }
      }}
    >
      {/* Contenu de la carte */}
      <Box sx={{ 
        position: 'relative',
        zIndex: 1,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1
      }}>
        {/* En-tête avec logo */}
        <Box sx={{ 
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          mb: 1
        }}>
          <Box
            component="img"
            src={backgroundImageUrl}
            alt="Logo"
            sx={{
              height: '40px',
              objectFit: 'contain'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </Box>

        {/* Photo de l'employé */}
        <Avatar
          src={getPhotoUrl(employee.photo)}
          alt={`${employee.nom} ${employee.prenom}`}
          sx={{
            width: '60px',
            height: '60px',
            border: '2px solid',
            borderColor: 'primary.main',
            mb: 1
          }}
        />

        {/* Informations de l'employé */}
        <Typography 
          variant="h6" 
          sx={{ 
            fontSize: '1rem',
            fontWeight: 'bold',
            textAlign: 'left',
            color: 'primary.main',
            width: '100%',
            direction: 'ltr'
          }}
        >
          {employee.nom} {employee.prenom}
        </Typography>

        <Typography 
          variant="subtitle2" 
          sx={{ 
            fontSize: '0.8rem',
            color: 'text.secondary',
            textAlign: 'left',
            mb: 1,
            width: '100%',
            direction: 'ltr'
          }}
        >
          {employee.poste}
        </Typography>

        <Box sx={{ 
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          mb: 1,
          direction: 'ltr'
        }}>
          <Typography variant="body2" sx={{ 
            fontSize: '0.7rem', 
            textAlign: 'left',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            direction: 'ltr'
          }}>
            <span>{employee.matricule}</span>
            <strong>الرقم الوظيفي:</strong>
          </Typography>
          <Typography variant="body2" sx={{ 
            fontSize: '0.7rem', 
            textAlign: 'left',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            direction: 'ltr'
          }}>
            <span>{employee.centre || '-'}</span>
            <strong>المركز:</strong>
          </Typography>
          <Typography variant="body2" sx={{ 
            fontSize: '0.7rem', 
            textAlign: 'left',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            direction: 'ltr'
          }}>
            <span>{formatDate(employee.dateNaissance)}</span>
            <strong>تاريخ الميلاد:</strong>
          </Typography>
          <Typography variant="body2" sx={{ 
            fontSize: '0.7rem', 
            textAlign: 'left',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            direction: 'ltr'
          }}>
            <span>{formatDate(employee.dateEmbauche)}</span>
            <strong>تاريخ التوظيف:</strong>
          </Typography>
        </Box>

        {/* QR Code */}
        <Box sx={{ 
          mt: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.5,
          direction: 'ltr'
        }}>
          <QRCodeSVG
            value={`${employee.matricule}|${employee.nom}|${employee.prenom}`}
            size={60}
            level="H"
            includeMargin={false}
          />
          <Typography 
            variant="caption" 
            sx={{ 
              fontSize: '0.6rem',
              color: 'text.secondary',
              textAlign: 'center',
              direction: 'ltr'
            }}
          >
            {employee.matricule}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
});

EmployeeCard.displayName = 'EmployeeCard';

export default EmployeeCard; 