const QuickChart = require('quickchart-js');
const { exec } = require('child_process');
const fs = require('fs')
const math = require('mathjs')

var steps = [1, 5, 10, 25, 50, 75, 100, 200, 250, 300, 350, 400, 450, 500]
var rates, times
var timeSamples = []
var timeAverages = []
var rateSamples = []
var rateAverages = []

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
    let partial = []
    ys.map(pair => partial.push(pair['y']))
    timeAverages.push(JSON.parse(`{"x":${x},"y":${math.median(partial)}}`))
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
      },
      scales: {
        xAxes: [
          {
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Batch Size'
            }
          }
        ],
        yAxes: [
          {
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Time'
            }
          }
        ]
      }
    }
  })
    .setWidth(800).setHeight(400).setBackgroundColor('transparent');

  // Print the chart URL
  console.log(myChart.getUrl());
})
fs.readFile(`rates.txt`, 'utf8', (err, data) => {
  if (err) {
    console.error(err)
    return
  }
  rates = data.split('\n')
  rates.pop()
  rates.map(pair => {
    rateSamples.push(JSON.parse(pair))
  })
  console.log(rateSamples)

  steps.map(x => {
    let ys = rateSamples.filter(pair => pair['x'] == x)
    let partial = []
    ys.map(pair => partial.push(pair['y']))
    rateAverages.push(JSON.parse(`{"x":${x},"y":${math.median(partial)}}`))
  })
  console.log(rateAverages)


  const myChart = new QuickChart();
  myChart.setConfig({
    type: 'scatter',
    data: {
      datasets: [
        {
          type: `scatter`,
          label: `Samples`,
          data: rateSamples
        },
        {
          type: `line`,
          label: `Averages`,
          fill: false,
          data: rateAverages
        }
      ]
    },
    options: {
      title: {
        display: true,
        text: `Transaction Rate`
      },
      scales: {
        xAxes: [
          {
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Batch Size'
            }
          }
        ],
        yAxes: [
          {
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Transactions per second'
            }
          }
        ]
      }
    }
  })
    .setWidth(800).setHeight(400).setBackgroundColor('transparent');

  // Print the chart URL
  console.log(myChart.getUrl());
})
