const { Pool } = require('pg')
const pool = new Pool({
    host: "localhost",
    port: 5432,
    database: "ereuse",
    user: "ereuse",
    password: "ereuse"
})

module.exports = {
    ret: {},

    init: () => {
        pool.query(`\
            create table if not exists subscriptions (\
            sub varchar not null, med varchar not null, prov varchar not null, lim integer not null,\
            primary key (sub, med, prov));`, (err, res) => {
            if (err) {
                console.log(err)
            }
            else {
                console.log(`Database initialized succesfully.`)
            }
        })
    },

    addSub: (sub, med, prov, lim) => {
        pool.query(`\
            insert into subscriptions (sub, med, prov, lim) values (\
            '${sub}', '${med}', '${prov}', ${lim});`, (err, res) => {
            if (err) {
                console.log(err)
            }
            else {
                console.log(`Row inserted succesfully.`)
            }
        })
    },

    delSub: (sub, med, prov) => {
        pool.query(`\
            delete from subscriptions where (\
            sub = '${sub}' and med = '${med}' and prov = '${prov}');`, (err, res) => {
            if (err) {
                console.log(err)
            }
            else {
                console.log(`Row deleted succesfully.`)
            }
        })
    },

    subAgmt: (sub) => {
        pool.query(`\
            select * from subscriptions where sub ilike \'%${sub}%\';`, (err, res) => {
            if (err) {
                console.log(err)
            }
            else {
                console.log(res.rows)
            }
        })
    },

    medAgmt: (med) => {
        pool.query(`\
            select * from subscriptions where med ilike \'%${med}%\';`, (err, res) => {
            if (err) {
                console.log(err)
            }
            else {
                console.log(res.rows)
            }
        })
    },

    provAgmt: (prov) => {
        pool.query(`\
            select * from subscriptions where prov ilike \'%${prov}%\';`, (err, res) => {
            if (err) {
                console.log(err)
                return res.rows
            }
            else {
                console.log(res.rows)
                return res.rows
            }
        })
    },

    subLim: async (sub, med, prov) => {
        pool.query(`\
            select lim from subscriptions where \
            sub = '${sub}' and med = '${med}' and prov = '${prov}';`)
            .then(res => {
                console.log(res.rows[0].lim)
                return res.rows[0].lim
            })
            .catch(err => console.error(err.stack))
    }
}