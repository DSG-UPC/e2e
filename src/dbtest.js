const db = require('../db/index_db')
const express = require('express')

app = express()

app.post('/addSub', (req, res) => {
    db.addSub(String(req.query.sub), String(req.query.med), String(req.query.prov), parseInt(req.query.lim))
    res.send()
})

app.listen(3000, () => {
    if(db.init()) {console.log(`Database initialization failed.`)}
})