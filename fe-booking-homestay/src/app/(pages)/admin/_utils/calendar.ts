export const getMonthDays = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1);

  // vị trí của ngày 1 trong tuần (0-6, chủ nhật là 0)
  const startDay = (firstDay.getDay() + 6) % 7;

  // Lấy ngày cuối cùng của tháng hiện tại -> Số ngày trong tháng
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Tương tự -> số ngày của tháng trước
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days = [];

  // Thêm ngày của tháng trước vào đầu nếu tháng không bắt đầu từ thứ 2
  for (let i = startDay - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, daysInPrevMonth - i),
      currentMonth: false,
    });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: new Date(year, month, i),
      currentMonth: true,
    });
  }

  while (days.length % 7 !== 0) {
    const next: number = days.length - (startDay + daysInMonth) + 1;
    days.push({
      date: new Date(year, month + 1, next),
      currentMonth: false,
    });
  }

  return days;
};

export const toDateKey = (dateInput: Date | string | number) => {
  const date = new Date(dateInput);

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
};
