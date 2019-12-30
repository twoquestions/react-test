import React, { useState, useEffect } from 'react';
import './App.css';

interface TimeEntry {
  startTime: Date,
  endTime?: Date,
  description: string
}

function setName(name: string, entries: Array<TimeEntry>): void {
  let val = JSON.stringify(entries);
  sessionStorage.setItem(name, val);
}

function getTimesheetsFromStorage(): Array<TimeEntry> {
  let sheets = [] as Array<TimeEntry>;
  try {
    sheets = JSON.parse(sessionStorage.getItem('timesheet') || '[]');
  } catch {
    sheets = [];
  }
  sheets = sheets.map((sh) => {
    sh.startTime = new Date(sh.startTime);
    if (sh.endTime) sh.endTime = new Date(sh.endTime);
    return sh;
  })
  return sheets;
}

/// Only gets number of hours, minutes, and seconds, leaving
/// this on overnight will give weird results.
function getDuration(startTime: Date, endTime: Date): string {
  let millisInHour = 1000 * 60 * 60;
  let millisInMinute = 1000 * 60;
  let millisInSecond = 1000;

  let milliDuration = endTime.getTime() - startTime.getTime();
  let hours = Math.floor(milliDuration / millisInHour);
  milliDuration -= hours * millisInHour;
  let minutes = Math.floor(milliDuration / millisInMinute);
  milliDuration -= minutes * millisInMinute;
  let seconds = Math.floor(milliDuration / millisInSecond);

  let duration = '';
  if (hours > 0) duration += `${hours} hours,`;
  if (minutes > 0) duration += `${minutes} minutes,`;
  duration += `${seconds} seconds`;
  return duration;
}

function currentlyInActivity(sheets: Array<TimeEntry>): boolean {
  return sheets.length > 0 && 
         sheets[0].endTime === undefined;
}

const App: React.FC = () => {
  const [sheets, setSheets] = useState(getTimesheetsFromStorage());
  const [taskname, setTaskname] = useState('');
  useEffect(() => {
    setName('timesheet', sheets);
  });
  return (
    <div className="App">
      <h1>Timesheet</h1>
      {currentlyInActivity(sheets) ?
        <button onClick={() => {
          setSheets(sheets.map((sh, i) => {
            if (i === 0) sh.endTime = new Date();
            return sh;
          }));
        }}>Clock out</button>
        :
        <div>
          <input placeholder="Enter a task" value={taskname}
            onChange={(ev) => setTaskname(ev.currentTarget.value)} />
          <button onClick={() => {
            setSheets([{
              startTime: new Date(),
              description: taskname,
            }, ...sheets]);
            setTaskname('');
          }}
          disabled={taskname.length === 0}
          >Clock in</button>
        </div>
      }
      <table>
        <thead>
          <tr>
            <th>Start time</th>
            <th>End time</th>
            <th>Duration</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {sheets.map((val) => {
            let endtime = val.endTime?.toLocaleTimeString() || new Date().toLocaleTimeString();
            let duration = '';
            let displayEndtime = '';

            if (val.endTime) {
              displayEndtime = endtime;
              duration = getDuration(val.startTime, val.endTime);
            } else {
              duration = getDuration(val.startTime, new Date());
            }

            return (<tr key={val.startTime.getTime()}>
              <td>{val.startTime.toLocaleTimeString()}</td>
              <td>{displayEndtime}</td>
              <td>{duration}</td>
              <td>{val.description}</td>
            </tr>);
          })}
        </tbody>
      </table>
    </div>
  );
}

export default App;
