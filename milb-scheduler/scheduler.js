// MiLB Scheduler

// Access Stats API and Generate a CSV File of the MiLB Schedule
async function generateSchedule() {
  const statsAPI = 'https://statsapi.mlb.com/api/v1';
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
  const seasonYear = getYear(startDateElement.value);

  const scheduleParams = {
    fields: ['dates','date','games','gamePk','gameDate','teams','away','team','id','home','team','id'],
    scheduleTypes: 'games',
    startDate: startDateValue,
    endDate: endDateValue,
    sportId: classValue
  };

  const teamParams = {
    fields: ['teams','id','shortName'],
    activeStatus: 'Y',
    season: seasonYear,
    sportId: classValue
  }

  const scheduleParamsString = new URLSearchParams(scheduleParams).toString();
  const teamParamsString = new URLSearchParams(teamParams).toString();

  // console.log(searchParams.toString());

  const scheduleResponse = await fetch(`${statsAPI}/schedule/?${scheduleParamsString}`);
  const scheduleObject = await scheduleResponse.json();

  const teamResponse = await fetch(`${statsAPI}/teams/?${teamParamsString}`);
  const teamObject = await teamResponse.json();

  let schedule = [];

  // Loop through the StatsAPI response and organize the date in a matrix
  for (i=0; i<scheduleObject.dates.length; i++) {
    let gamesDate = scheduleObject.dates[i];
    for (j=0; j<gamesDate.games.length; j++){
      const gameDetails = gamesDate.games[j];
      const gameDate = convertDate(gameDetails.gameDate);
      const startTime = getStartTime(gameDetails.gameDate);
      const weekDay = getWeekday(gameDetails.gameDate);

      let awayTeamName;
      let homeTeamName;

      console.log(gameDetails);

      // const away = teamObject.teams.find(obj => gameDetails.teams.away.team.id.test(obj.id));

      // console.log(away);

      for (let k=0; k<teamObject.teams.length; k++) {
        // Check if the current object has a key that matches the regular expression
        if (gameDetails.teams.away.team.id === teamObject.teams[k].id) {
          // If there is a match, replace the matched string with the value of key2 in the current object
           awayTeamName = teamObject.teams[k].shortName;
          //  console.log()
        }
        if (gameDetails.teams.home.team.id === teamObject.teams[k].id) {
          // If there is a match, replace the matched string with the value of key2 in the current object
           homeTeamName = teamObject.teams[k].shortName;
        }
      }

      const gameInfo = [gameDetails.gamePk, `${awayTeamName} @ ${homeTeamName}`, weekDay, gameDate, startTime];
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

function getYear(isoDate) {
  const date = new Date(isoDate);
  const year = date.getFullYear();

  console.log(year);

  return year; // output: "1/1/2022"
}

function getWeekday(isoDate) {
  const dateTime = new Date(isoDate);

  const locale = "en-US";
  const options = {
    weekday: "long",
    timeZone: "America/New_York"
  };
  
  const formatter = new Intl.DateTimeFormat(locale, options);
  const formattedTime = formatter.format(dateTime);

  return formattedTime;
}

// Download a CSV file of the Schedule
function download(data) {

  let lineArray = [];
  let OrganizedArray = ['Game PK', 'Game', 'Day', 'Date', 'Time (ET)'];

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