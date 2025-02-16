declare module 'react-native-calendar-picker' {
  import { ComponentType } from 'react';
  import { StyleProp, TextStyle, ViewStyle } from 'react-native';

  export interface CalendarPickerProps {
    width?: number;
    height?: number;
    selectedDayColor?: string;
    selectedDayTextColor?: string;
    todayBackgroundColor?: string;
    todayTextStyle?: StyleProp<TextStyle>;
    textStyle?: StyleProp<TextStyle>;
    monthTitleStyle?: StyleProp<TextStyle>;
    yearTitleStyle?: StyleProp<TextStyle>;
    previousTitle?: string;
    nextTitle?: string;
    previousTitleStyle?: StyleProp<TextStyle>;
    nextTitleStyle?: StyleProp<TextStyle>;
    onDateChange: (date: Date | null) => void;
    minDate?: Date;
    maxDate?: Date;
    initialDate?: Date;
    selectedStartDate?: Date;
    selectedEndDate?: Date;
    allowRangeSelection?: boolean;
    dayShape?: 'circle' | 'square';
    selectedDayStyle?: StyleProp<ViewStyle>;
    dayLabelsWrapper?: StyleProp<ViewStyle>;
    customDayHeaderStyles?: (date: Date) => StyleProp<ViewStyle>;
    customDatesStyles?: (date: Date) => StyleProp<ViewStyle>;
  }

  const CalendarPicker: ComponentType<CalendarPickerProps>;
  export default CalendarPicker;
} 