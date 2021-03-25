const db = require('../db/index_db')
const express = require('express')

app = express()

app.post('/addSub', (req, res) => {
    db.addSub(String(req.query.sub), String(req.query.med), String(req.query.prov), parseInt(req.query.lim))
    res.send()
})

app.delete('/delSub', (req, res) => {
    db.delSub(String(req.query.sub), String(req.query.med), String(req.query.prov))
    res.send()
})

app.get('/subAgmt', (req, res) => {
    db.subAgmt(String(req.query.sub))
    res.send()
})

app.get('/medAgmt', (req, res) => {
    db.medAgmt(String(req.query.med))
    res.send()
})

app.get('/provAgmt', (req, res) => {
    db.provAgmt(String(req.query.prov))
    res.send()
})

app.get('/subLim', (req, res) => {
    db.subLim(String(req.query.sub), String(req.query.med), String(req.query.prov))
    .then(x => {
        res.send(x)
    })
})

app.listen(3000, () => {
    if(db.init()) {console.log(`Database initialization failed.`)}
})