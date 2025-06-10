import React from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import arLocale from 'date-fns/locale/ar-SA';

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
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={arLocale}>
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
            fullWidth: true,
            required: true,
            error: Boolean(error),
            helperText: error || (showValidationErrors && !value ? 'يرجى تحديد شهر المهمة' : '')
          }
        }}
      />
    </LocalizationProvider>
  );
};

export default MonthPicker; 