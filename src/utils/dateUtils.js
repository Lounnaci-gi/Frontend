import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export const formatGregorianDate = (date) => {
  if (!date) return '';
  return format(new Date(date), 'dd/MM/yyyy', { locale: ar });
}; 