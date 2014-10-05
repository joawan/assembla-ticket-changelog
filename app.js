#!/usr/bin/env node

'use strict';

var request = require('request'),
  es = require('event-stream'),
  config = require('./config.js');

var baseRequest = request.defaults({
  headers: {
    'X-Api-Key': config.key,
    'X-Api-Secret': config.secret
  }
});

process.stdin
  .pipe(es.split())
  .pipe(es.map(function(num, cb) {
    if (!parseInt(num, 10)) {
      return cb();
    }
    var url = '{b}/spaces/{s}/tickets/{#}.json'.replace('{b}', config.url).replace('{s}', config.space).replace('{#}', num);
    baseRequest.get(url, function(err, res, body) {
      if (err) {
        return cb(err);
      }
      if (res.statusCode !== 200) {
        return cb(null, 'Ticket {n} not found'.replace('{n}', num));
      }
      var ticket = JSON.parse(body);
      var out = String.prototype.concat.call(ticket.status, '\t #', ticket.number, ' - ', ticket.summary);
      return cb(null, out);
    });
  }))
  .pipe(es.join('\n'))
  .pipe(process.stdout);
