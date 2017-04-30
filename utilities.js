'use strict'

function getRandomEvent(arr, min, max) {
  let index = Math.floor(Math.random() * (max - min)) + min;
  return arr[index]
}

function convertDateTime(str) {

  const months = ['January ', 'February ', 'March ', 'April ', 'May ', 'June ', 'July ', 'August ', 'September ', 'October ', 'November ', 'December '];

  const month = +str.slice(5, 7),
    date = +str.slice(8, 10) + ', ',
    year = str.slice(0, 4) + ' ',
    min = str.slice(14, 16);

  let hour = +str.slice(11, 13);
  let isPM;
  if (hour >= 12) {
    isPM = 'pm';
  } else {
    isPM = 'am';
  }

  if (hour > 12) {
    hour -= 12;
  }
  let dateTime = months[month - 1] + date + year + hour + ':' + min + isPM;

  return dateTime;
}

module.exports = {
  convertDateTime: convertDateTime,
  getRandomEvent: getRandomEvent
}