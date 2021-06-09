const { exec } = require('child_process');

exec(`node \src\\measures\\index.js ${process.argv[2]}`, (err, stdout, stderr) => {
    if (err) {
        console.log(`error: ${err}`)
        return
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`)
        return
    }
    console.log(`stdout: ${stdout}`)
})
setTimeout(() => {
    exec(`node \src\\measures\\index.js ${process.argv[2]}`, (err, stdout, stderr) => {
        if (err) {
            console.log(`error: ${err}`)
            return
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`)
            return
        }
        console.log(`stdout: ${stdout}`)
    })
}, 2000)
setTimeout(() => {
    exec(`node \src\\measures\\index.js ${process.argv[2]}`, (err, stdout, stderr) => {
        if (err) {
            console.log(`error: ${err}`)
            return
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`)
            return
        }
        console.log(`stdout: ${stdout}`)
    })
}, 2000)
setTimeout(() => {
    exec(`node \src\\measures\\index.js ${process.argv[2]}`, (err, stdout, stderr) => {
        if (err) {
            console.log(`error: ${err}`)
            return
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`)
            return
        }
        console.log(`stdout: ${stdout}`)
    })
}, 2000)
setTimeout(() => {
    exec(`node \src\\measures\\index.js ${process.argv[2]}`, (err, stdout, stderr) => {
        if (err) {
            console.log(`error: ${err}`)
            return
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`)
            return
        }
        console.log(`stdout: ${stdout}`)
    })
}, 2000)