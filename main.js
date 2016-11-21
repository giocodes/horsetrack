'use strict';

const vorpal = require('vorpal')();
const chalk = require('chalk');
const horses = require('./horses.js');
let cash = require('./cash.js');

vorpal.show();

vorpal
    .command('R')
    .alias('r')
    .description('Restocks the cash inventory')
    .action((args, callback) => {
        restock()
        callback()
    })

vorpal
    .command('Q')
    .alias('q')
    .description('Exits application.')
    .action(function(args) {
        args.options = args.options || {};
        args.options.sessionId = this.session.id;
        this.parent.exit(args.options);
    });

vorpal
    .command('W [horseNum...]')
    .alias('w')
    .description('Sets new winner')
    .action((args, callback) => {
        setWin(args.horseNum[0])
        status('all')
        callback()
    })

vorpal
    .command('1 [amount]')
    .alias(['2', '3', '4', '5', '6', '7'])
    .description('Sets bet on horses 1 to 7')
    .action((args, callback) => {
        bet(vorpal._command.command)
        status('all')
        callback();
    })

console.log(chalk.magenta('\nWelcome!'));
status(true);

// Place a bet
function bet(betData) {
    let horse = betData.split(' ')[0],
        amount = betData.split(' ')[1],
        payout = (horses[horse].odds * amount);
    if (amount % 1 !== 0) {
        return console.log(chalk.red('Invalid bet: $' + amount))
    }
    if (horses[horse].win) {
        console.log(chalk.cyan('Winner horse!'))
        console.log(chalk.cyan('Payout: ' + horses[horse].name + ', $' + payout))
        doPayout(payout)
    } else {
        console.log(chalk.red('No Payout: ' + horses[horse].name))
    }
}

// Payout
function doPayout(payout) {
    console.log('Dispensing: ')
    let billArray = [];
    let currentPayout = {}
    for (let bill in cash) {
        billArray.push(+bill)
    }
    // sort descending
    billArray.sort((first, second) => second - first)
        // dispense least bills possible
    billArray.forEach(bill => {
            currentPayout[bill] = 0
            if (payout >= (+bill)) {
                // console.log(chalk.blue(payout, bill, (bill * Math.floor(payout / bill))))
                currentPayout[bill] = Math.floor(payout / bill)
                cash[bill] -= Math.floor(payout / bill)
                payout -= (bill * Math.floor(payout / bill))
            }
        })
        // print Payout
    for (let bill in currentPayout) {
        console.log(chalk.green('$' + bill, currentPayout[bill]))
    }
}


// Print status of horses, cash or both.
function status(display = 'all') {
    if (display !== 'horses') {
        console.log('Inventory:')
        for (let bill in cash) {
            console.log(chalk.yellow(`$${bill}, ${cash[bill]}`))
        }
    }
    if (display !== 'cash') {
        console.log('Horses:')
        for (let horse in horses) {
            console.log(chalk.yellow(horse + ', ' + horses[horse].name + ', ' + horses[horse].odds + ', ' + (horses[horse].win ? 'won' : 'lost')))
        }
    }
}

// Set winner horse
function setWin(winHorse) {
    for (let horse in horses) {
        if (winHorse == horse) {
            horses[horse].win = true
        } else {
            horses[horse].win = false
        }
    }
}

// Restock cash inventory
function restock() {
    console.log(chalk.green('Inventory Restocked'))
    for (let bill in cash) {
        cash[bill] = 10
    }
    status('cash')
}

// Tests
// 1 55
// 2 25
// W 4
// 4 10.25
