const express = require('express')
const cron = require('node-cron')
const Web3 = require('web3')
const { Pool } = require('pg')

const pool = new Pool({
    host: "localhost",
    port: 5432,
    database: "ereuse",
    user: "ereuse",
    password: "ereuse"
})
var accounts;
var web3;
//var tok;
var payments;

/* function getTok(at) {
    return new web3.eth.Contract(require('../build/contracts/DDToken.json').abi, at)
} */
app = express()

app.post('/regSub', (req, res) => {
    pool.query(`\
        insert into subs (sub) values ('${req.query.sub}');`, (err, result) => {
        if (err) { res.send(err) }
        else { res.send(`Row inserted succesfully.`) }
    })
})
app.post('/regMed', (req, res) => {
    pool.query(`\
        insert into meds (med) values ('${req.query.med}');`, (err, result) => {
        if (err) { res.send(err) }
        else { res.send(`Row inserted succesfully.`) }
    })
})
app.post('/regProv', (req, res) => {
    pool.query(`\
        insert into provs (prov) values ('${req.query.prov}');`, (err, result) => {
        if (err) { res.send(err) }
        else { res.send(`Row inserted succesfully.`) }
    })
})
app.post('/addSubscription', (req, res) => {
    pool.query(`\
        insert into subscriptions (sub, med, prov, lim, charge, unit, num, fwd, active) values (\
        '${req.query.sub}', '${req.query.med}', '${req.query.prov}', ${req.query.lim},\
        ${req.query.charge}, '${req.query.unit}', '${req.query.num}', 'false', false);`, (err, result) => {
        if (err) { res.send(err) }
        else { res.send(`Row inserted succesfully.`) }
    })

    /*
    * * * * * *
    | | | | | |
    | | | | | day of week
    | | | | month
    | | | day of month
    | | hour
    | minute
    second ( optional )
*/
})
app.post('/startSubscription', async (req, res) => {
    /* CHANGE: CHECK IF IT EXISTS IN THE DB */
    pool.query(`
    select * from subscriptions where
    sub = '${req.query.sub}' and med = '${req.query.med}' and prov = '${req.query.prov}'`, (err, result) => {
        if (err) { console.log(err) }
        else {
            console.log(result.rows)
            if (result.rows.length == 0) {
                res.send(`Subscription does not exist.`)
            }
            else if (result.rows.active == 'true') {
                res.send(`Subscription exists, and it is already active.`)
            }
            else {
                if (payments.has(`${req.query.sub}-to-${req.query.med}-to-${req.query.prov}`)) {
                    res.send(`This subscription is already active.`)
                }
                else {
                    pool.query(`update subscriptions set active = true where \
                    sub = '${req.query.sub}' and med = '${req.query.med}' and prov = '${req.query.prov}';`, (err, result) => {
                        if (err) res.send(err)
                        else {
                            var task0 = cron.schedule(`0,30 * * * * *`, async () => {
                                console.log(`${req.query.prov} sets amount + Return previous amount to ${req.query.sub}.`)
                            }, { scheduled: true })
                            var task1 = cron.schedule(`10,40 * * * * *`, async () => {
                                console.log(`${req.query.med} pulls money from ${req.query.sub}.`)
                            }, { scheduled: true })
                            var task2 = cron.schedule(`20,50 * * * * *`, async () => {
                                console.log(`Final pull enabled. ${req.query.prov} can pull from ${req.query.med} the funds of ${req.query.sub}.`)
                            }, { scheduled: true })
                            var tasks = [task0, task1, task2]
                            payments.set(`${req.query.sub}-to-${req.query.med}-to-${req.query.prov}`, tasks)
                            res.send(`Subscription active. ID is ${req.query.sub}-to-${req.query.med}-to-${req.query.prov}.`)
                        }
                    })
                }
            }
        }
    })
})
app.post('/asyncTransfer', (req, res) => {

})
app.delete('/stopSubscription', (req, res) => {
    pool.query(`\
    select * from subscriptions where
    sub = '${req.query.sub}' and med = '${req.query.med}' and prov = '${req.query.prov}';`, (err, result) => {
        if (err) console.log(err)
        else {
            console.log(result.rows)
            if (result.rows.length == 0) {
                res.send(`Subscription does not exist.`)
            }
            else if (result.rows.active == 'false') {
                res.send(`Subscription exists, and it is already stopped.`)
            }
            else {
                if (!payments.has(`${req.query.sub}-to-${req.query.med}-to-${req.query.prov}`)) {
                    res.send(`This subscription is not active.`)
                } else {
                    pool.query(`update subscriptions set active = false where \
                    sub = '${req.query.sub}' and med = '${req.query.med}' and prov = '${req.query.prov}';`, (err, result) => {
                        if (err) { res.send(err) }
                        else {
                            payments.get(`${req.query.sub}-to-${req.query.med}-to-${req.query.prov}`).map(task => {
                                task.stop()
                            })
                            payments.delete(`${req.query.sub}-to-${req.query.med}-to-${req.query.prov}`)
                            res.send(`Payment stopped. Subscription is now inactive.`)
                        }
                    })
                }
            }
        }
    })
})
app.delete('/delSubscription', (req, res) => {
    pool.query(`\
        delete from subscriptions where (\
        sub = '${req.query.sub}' and med = '${req.query.med}' and prov = '${req.query.prov}');`, (err, result) => {
        if (err) { res.send(err) }
        else {
            var temp = payments.get(`${req.query.sub}-to-${req.query.med}-to-${req.query.prov}`)
            if(temp !== undefined){
                temp.map(task => {
                    task.stop()
                })
                payments.delete(`${req.query.sub}-to-${req.query.med}-to-${req.query.prov}`)
                res.send(`Payment stopped. Subscription is now inactive and deleted.`)
            }
            else{
                res.send(`Subscription deleted.`)
            }
        }
    })
})
app.get('/subAgmt', (req, res) => {
    pool.query(`\
        select * from subscriptions where sub ilike \'%${req.query.sub}%\';`, (err, result) => {
        if (err) { res.send(err) }
        else { res.send(result.rows) }
    })
})
app.get('/medAgmt', (req, res) => {
    pool.query(`\
        select * from subscriptions where med ilike \'%${req.query.med}%\';`, (err, result) => {
        if (err) { res.send(err) }
        else { res.send(result.rows) }
    })
})
app.get('/provAgmt', (req, res) => {
    pool.query(`\
        select * from subscriptions where prov ilike \'%${req.query.prov}%\';`, (err, result) => {
        if (err) { res.send(err) }
        else { res.send(result.rows) }
    })
})
app.get('/subLim', (req, res) => {
    pool.query(`\
        select lim from subscriptions where \
        sub = '${req.query.sub}' and med = '${req.query.med}' and prov = '${req.query.prov}';`, (err, result) => {
        if (err) { res.send(err) }
        else { res.send(result.rows) }
    })
})
app.listen(3000, async () => {
    pool.query(
        `create table if not exists subs
        (sub varchar not null,
        primary key (sub));
        
        create table if not exists meds
        (med varchar not null,
        primary key (med));
        
        create table if not exists provs
        (prov varchar not null,
        primary key (prov));
        
        create table if not exists subscriptions
        (sub varchar not null, med varchar not null, prov varchar not null, lim integer not null, charge integer not null, unit varchar not null, num varchar not null, fwd boolean not null, active boolean not null,
        primary key (sub, med, prov),
        foreign key (sub) references subs (sub),
        foreign key (med) references meds (med),
        foreign key (prov) references provs (prov));`, async (err, result) => {
        if (err) {console.log(err)}
        else {
            console.log(`Database initialized succesfully. API is listening on port 3000.`)
            payments = new Map()
            web3 = new Web3('http://localhost:8545');
            accounts = await web3.eth.getAccounts();
            pool.query(`\
            insert into subs (sub) values ('${accounts[1]}'), ('${accounts[2]}'), \
            ('${accounts[3]}'), ('${accounts[4]}');\
            insert into meds (med) values ('${accounts[0]}');\
            insert into provs (prov) values ('${accounts[5]}'), ('${accounts[6]}'), \
            ('${accounts[7]}'), ('${accounts[8]}');`, (err, result) => {
                if (err) { console.log(`${err}\nAccounts not added.`) }
                else { console.log(`Accounts added to the database.`) }
                pool.query(`\
                select * from subscriptions where active = true`, (err, result) => {
                    result.rows.map(row => {
                        console.log(`Active subscription from ${row.sub} to ${row.prov} found on database.`)
                        var task0 = cron.schedule(`0,30 * * * * *`, async () => {
                            console.log(`${row.prov} sets amount + Return previous amount to ${row.sub}.`)
                        }, { scheduled: true })
                        var task1 = cron.schedule(`10,40 * * * * *`, async () => {
                            console.log(`${row.med} pulls money from ${row.sub}.`)
                        }, { scheduled: true })
                        var task2 = cron.schedule(`20,50 * * * * *`, async () => {
                            console.log(`Final pull enabled. ${row.prov} can pull from ${row.med} the funds of ${row.sub}.`)
                        }, { scheduled: true })
                        var tasks = [task0, task1, task2]
                        payments.set(`${row.sub}-to-${row.med}-to-${row.prov}`, tasks)
                    })
                })
            })
        }
    })
})