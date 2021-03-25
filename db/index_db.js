const { Pool } = require('pg')
const pool = new Pool({
    host: "localhost",
    port: 5432,
    database: "ereuse",
    user: "ereuse",
    password: "ereuse"
})

module.exports = {
    init: () => {
        pool.query(`\
            create table if not exists subscriptions (\
            sub varchar not null, med varchar not null, prov varchar not null, lim integer not null,\
            primary key (sub, med, prov));`, (err, res) => {
            if (err) {
                console.log(err)
                return false
            }
            else {
                console.log(`Database initialized succesfully.`)
                return false
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
    }
}