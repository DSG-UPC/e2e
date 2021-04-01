const Web3 = require('web3')
const DDToken = require('../build/contracts/DDToken.json')
const Mediator = require('../build/contracts/Mediator.json')
const nodeplotlib = require('nodeplotlib')
const { Pool } = require('pg')
const { exec } = require('child_process')


async function test() {
    const pool = new Pool({
        host: "localhost",
        port: 5432,
        database: "ereuse",
        user: "ereuse",
        password: "ereuse"
    })

    web3 = new Web3('http://localhost:8545');
    accounts = await web3.eth.getAccounts();
    net = await web3.eth.net.getId()
    chain = await web3.eth.getChainId()

    tokAt = DDToken.networks[net].address
    tok = new web3.eth.Contract(DDToken.abi, tokAt)

    medAt = Mediator.networks[net].address
    med = new web3.eth.Contract(Mediator.abi, medAt)

    console.log(accounts)
    console.log(`Using network ${net}.`)
    console.log(`Using chain ${chain}.`)
    console.log(`Token is deployed at ${tokAt}.`)
    console.log(`Mediator is deployed at ${medAt}. Its owner is ${await med.methods.owner().call({ from: accounts[0] })}`)
    console.log(`List of subscribers:`)
    for (i = 1; i < 5; ++i) {
        console.log(`           ${accounts[i]}  ${await tok.methods.balanceOf(accounts[i]).call({ from: accounts[0] })} tokens`)
    }
    console.log(`List of providers:`)
    for (i = 5; i < 9; ++i) {
        console.log(`           ${accounts[i]}  ${await tok.methods.balanceOf(accounts[i]).call({ from: accounts[0] })} tokens`)
    }

    /*     await pool.query(
            `\
            drop table subs cascade;
            drop table meds cascade;
            drop table provs cascade;
            drop table subscriptions cascade;
    
            create table if not exists subs
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
            if (err) {
                console.log(err)
            }
            else {
                console.log(`Database initialized succesfully. Inserting test accounts...`)
    
                await pool.query(`\
                insert into subs (sub) values ('${accounts[1]}'), ('${accounts[2]}'), \
                ('${accounts[3]}'), ('${accounts[4]}');\
                insert into meds (med) values ('${medAt}');\
                insert into provs (prov) values ('${accounts[5]}'), ('${accounts[6]}'), \
                ('${accounts[7]}'), ('${accounts[8]}');`, (err, result) => {
                    if (err) { console.log(`${err}\nAccounts not added.`) }
                    else { console.log(`Test accounts added to the database. Ready to perform tests.`) }
                }, (err, result) => {return})
            }
        }, (err, result) => {return}) */
    await pool.query(
        `\
        drop table subs cascade;
        drop table meds cascade;
        drop table provs cascade;
        drop table subscriptions cascade;

        create table if not exists subs
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
        foreign key (prov) references provs (prov));`

    )
    console.log(`Tables created. Inserting test rows...`)
    await pool.query(`\
                    insert into subs (sub) values ('${accounts[1]}'), ('${accounts[2]}'), \
                    ('${accounts[3]}'), ('${accounts[4]}');\
                    insert into meds (med) values ('${medAt}');\
                    insert into provs (prov) values ('${accounts[5]}'), ('${accounts[6]}'), \
                    ('${accounts[7]}'), ('${accounts[8]}');`)
    console.log(`Test rows inserted. Adding relevant subscriptions...`)

    /* Step 1: The parts make an off-chain agreement. Afterwards, subscription is added to the system as inactive.*/
    await pool.query(`\
    insert into subscriptions (sub, med, prov, lim, charge, unit, num, fwd, active) values\
        ('${accounts[1]}', '${medAt}', '${accounts[5]}', 50, 0, 'day', '5', 'false', false),
        ('${accounts[2]}', '${medAt}', '${accounts[6]}', 50, 0, 'day', '5', 'false', false),
        ('${accounts[3]}', '${medAt}', '${accounts[7]}', 50, 0, 'day', '5', 'false', false),
        ('${accounts[4]}', '${medAt}', '${accounts[8]}', 50, 0, 'day', '5', 'false', false);
    `)
    console.log(`Subscriptions added. Performing token transfer approvals...`)
    
    /* Step 2: After the subscriptions are present in the system, each subscriber account has to interact with
    the token, and allow the mediator to transfer tokens on its behalf. The limit has been established at 50 tokens
    for no meaningful reason. */
    await tok.methods.approve(medAt, 50).send({ from: accounts[1] })
    await tok.methods.approve(medAt, 50).send({ from: accounts[2] })
    await tok.methods.approve(medAt, 50).send({ from: accounts[3] })
    await tok.methods.approve(medAt, 50).send({ from: accounts[4] })
    console.log(`Token transfer approvals done. Marking subscriptions as active...`)

    /* Step 3: Now, the token will let the mediator transfer tokens that belong to the subscribers. Next, the
    subscriptions need to be marked as active in the system. This is important for automation purposes. */
    await pool.query(`\
    update subscriptions set active = true where\
    sub = '${accounts[1]}' and med = '${medAt}' and prov = '${accounts[5]}';

    update subscriptions set active = true where\
    sub = '${accounts[2]}' and med = '${medAt}' and prov = '${accounts[6]}';

    update subscriptions set active = true where\
    sub = '${accounts[3]}' and med = '${medAt}' and prov = '${accounts[7]}';

    update subscriptions set active = true where\
    sub = '${accounts[4]}' and med = '${medAt}' and prov = '${accounts[8]}';    
    `)
    console.log(`Subscriptions marked as active. Token transfers can begin.`)

    await pool.end()
}
test()