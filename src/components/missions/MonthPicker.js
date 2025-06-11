import React from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ar } from 'date-fns/locale';

// Configuration personnalisée pour les noms de mois en arabe
const customArabicLocale = {
  ...ar,
  localize: {
    ...ar.localize,
    month: (n) => {
      const months = [
        'جانفي',
        'فيفري', 
        'مارس',
        'أفريل',
        'ماي',
        'جوان',
        'جويلية',
        'أوت',
        'سبتمبر',
        'أكتوبر',
        'نوفمبر',
        'ديسمبر'
      ];
      return months[n];
    }
  }
};

const isDateInAllowedRange = (date) => {
  const today = new Date();
  const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const selectedDate = new Date(date.getFullYear(), date.getMonth(), 1);

  return selectedDate >= currentMonth && selectedDate <= nextMonth;
};

const MonthPicker = ({ value, onChange, error, showValidationErrors }) => {
  const handleMonthChange = (date) => {
    if (!date) {
      onChange(null);
      return;
    }

    if (!isDateInAllowedRange(date)) {
      onChange(null, 'يمكن إنشاء المهام الشهرية فقط للشهر الحالي أو الشهر القادم');
      return;
    }

    onChange(date, null);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={customArabicLocale}>
      <DatePicker
        label="شهر المهمة"
        value={value}
        onChange={handleMonthChange}
        views={['month', 'year']}
        openTo="month"
        minDate={new Date(new Date().getFullYear(), new Date().getMonth(), 1)}
        maxDate={new Date(new Date().getFullYear(), new Date().getMonth() + 1, 31)}
        slotProps={{
          textField: {
            fullWidth: false,
            required: true,
            error: Boolean(error),
            helperText: error || (showValidationErrors && !value ? 'يرجى تحديد شهر المهمة' : ''),
            size: "medium",
            sx: {
              width: '300px',
              '& .MuiInputBase-root': {
                fontSize: '1rem',
                height: '56px',
                minHeight: '56px'
              },
              '& .MuiInputLabel-root': {
                fontSize: '1rem'
              },
              '& .MuiOutlinedInput-input': {
                fontSize: '1rem',
                padding: '16px 14px'
              }
            }
          },
          popper: {
            sx: {
              '& .MuiPickersMonth-root': {
                fontSize: '1rem',
                minHeight: '48px',
                padding: '12px'
              },
              '& .MuiPickersYear-yearButton': {
                fontSize: '1rem',
                padding: '12px'
              }
            }
          }
        }}
      />
    </LocalizationProvider>
  );
};

export default MonthPicker; 