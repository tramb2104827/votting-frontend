import React from 'react';
import { TextField } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
import vi from 'date-fns/locale/vi';

function DatePicker({ label, value, onChange, minDate, maxDate, disabled = false }) {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
      <MuiDatePicker
        label={label}
        value={value}
        onChange={onChange}
        minDate={minDate}
        maxDate={maxDate}
        disabled={disabled}
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            required
            disabled={disabled}
          />
        )}
        format="dd/MM/yyyy"
        localeText={{
          previousMonth: 'Tháng trước',
          nextMonth: 'Tháng sau',
          today: 'Hôm nay',
          cancel: 'Hủy',
          clear: 'Xóa',
          ok: 'OK',
        }}
      />
    </LocalizationProvider>
  );
}

export default DatePicker; 