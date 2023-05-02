// MiLB Scheduler

// Access Stats API and Generate a CSV File of the MiLB Schedule
async function generateSchedule() {
  const statsAPI = 'https://statsapi.mlb.com/api/v1/schedule/';
  const startDateElement = document.getElementById('startdate');
  const endDateElement = document.getElementById('enddate');

  // Get the value for the MiLB Class
  const classInput = document.getElementsByName('class');
  let classValue;
            
  for (let i=0; i<classInput.length; i++) {
    if (classInput[i].checked) {
      classValue = classInput[i].value;
    }
  } 
  const startDateValue = convertDate(startDateElement.value);
  const endDateValue = convertDate(endDateElement.value);

  const params = {
    fields: ['dates','date','games','gamePk','gameDate','teams','away','team','name','home','team','name'],
    scheduleTypes: 'games',
    startDate: startDateValue,
    endDate: endDateValue,
    sportId: classValue
  };

  const searchParams = new URLSearchParams(params);
  const searchParamsString = searchParams.toString();

  // console.log(searchParams.toString());

  const statsResponse = await fetch(`${statsAPI}?${searchParamsString}`);
  const statsObject = await statsResponse.json();

  // console.log(statsObject);

  let schedule = [];

  // Loop through the StatsAPI response and organize the date in a matrix
  for (i=0; i<statsObject.dates.length; i++) {
    let gamesDate = statsObject.dates[i];
    for (j=0; j<gamesDate.games.length; j++){
      const gameDetails = gamesDate.games[j];
      const gameDate = convertDate(gameDetails.gameDate);
      const startTime = getStartTime(gameDetails.gameDate);
      const gameInfo = [gameDetails.gamePk, gameDate, gameDetails.teams.away.team.name, gameDetails.teams.home.team.name, startTime]
      schedule.push(gameInfo);
    }
  }

  // console.log(schedule);

  download(schedule);

}

function convertDate(isoDate) {
  const date = new Date(isoDate);

  const month = date.getMonth() + 1; // getMonth() returns 0-based month
  const day = date.getDate();
  const year = date.getFullYear();
  
  const formattedDate = `${month}/${day}/${year}`;
  return formattedDate; // output: "1/1/2022"
}

function getStartTime(isoDate) {
  const dateTime = new Date(isoDate);

  const locale = "en-US";
  const options = {
    hour: "numeric",
    minute: "numeric",
    timeZone: "America/New_York"
  };
  
  const formatter = new Intl.DateTimeFormat(locale, options);
  const formattedTime = formatter.format(dateTime);

  return formattedTime;
}

// Download a CSV file of the Schedule
function download(data) {

  let lineArray = [];
  let OrganizedArray = ['Game PK', 'Date', 'Away Team', 'Home Team', 'Start Time'];

  data.unshift(OrganizedArray);
  
  data.forEach(function (infoArray, index) {
    let line = infoArray.join(",");
      // lineArray.push(index == 0 ? "data:text/csv;charset=utf-8," + line : line);
      lineArray.push(line);
  });

  data = lineArray.join("\n");

  const blob = new Blob([data], {type: 'text/csv'});
  if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveBlob(blob, 'milb-schedule.csv');
  }
  else {
      const elem = window.document.createElement('a');
      elem.href = window.URL.createObjectURL(blob);
      elem.download = 'milb-schedule.csv';        
      document.body.appendChild(elem);
      elem.click();        
      document.body.removeChild(elem);
  }

  progressLabelOutput.classList.add('label-success');
  progressLabelOutput.classList.remove('label-warning');
  progressLabelOutput.innerText = 'Complete';
}