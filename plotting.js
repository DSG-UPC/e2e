const QuickChart = require('quickchart-js');
const { exec } = require('child_process');
const fs = require('fs')

var steps = [1, 5, 10, 25, 50, 75, 100, 200]
var rates, times
var timeSamples = []
var timeAverages = []

fs.readFile(`times.txt`, 'utf8', (err, data) => {
  if (err) {
    console.error(err)
    return
  }
  times = data.split('\n')
  times.pop()
  times.map(pair => {
    timeSamples.push(JSON.parse(pair))
  })
  console.log(timeSamples)

  steps.map(x => {
    let ys = timeSamples.filter(pair => pair['x'] == x)
    let partial = 0
    ys.map(pair => partial += pair['y'])
    timeAverages.push(JSON.parse(`{"x":${x},"y":${partial / ys.length}}`))
  })
  console.log(timeAverages)


  const myChart = new QuickChart();
  myChart.setConfig({
    type: 'scatter',
    data: {
      datasets: [
        {
          type: `scatter`,
          label: `Samples`,
          data: timeSamples
        },
        {
          type: `line`,
          label: `Averages`,
          fill: false,
          data: timeAverages
        }
      ]
    },
    options: {
      title: {
        display: true,
        text: `Total Time Required`
      }
    }
  })
    .setWidth(800).setHeight(400).setBackgroundColor('transparent');

  // Print the chart URL
  console.log(myChart.getUrl());
})
