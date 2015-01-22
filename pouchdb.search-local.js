var url = require('url'),
    pouchdb = require('pouchdb');

function httpQuery(db, name, opts) {
    // List of parameters to add to the PUT request
    var params = [];

    if (typeof opts.q !== 'undefined') {
        params.push('q=' + opts.q);
    }
    if (typeof opts.include_docs !== 'undefined') {
        params.push('include_docs=' + opts.include_docs);
    }
    if (typeof opts.limit !== 'undefined') {
        params.push('limit=' + opts.limit);
    }
    if (typeof opts.sort !== 'undefined') {
        opts.sort = opts.sort
            .replace(/"/g, '')
            .replace(/^(-)/, '\\')
            .replace('<score>', 'score');
        params.push('sort=' + opts.sort);
    }
    // if (typeof opts.bookmark !== 'undefined') {
    //     params.push('bookmark=' + opts.bookmark);
    // }
    if (typeof opts.stale !== 'undefined') {
        params.push('stale=' + stale);
    }

    // Format the list of parameters into a valid URI query string
    params = params.join('&');
    params = params === '' ? '' : '?' + params;

    var deferred = pouchdb.utils.Promise.defer();

    var _url = url.parse(db._db_name),
        host = _url.href.replace(new RegExp(_url.path + '$'), ''),
        dbName = _url.path.replace(new RegExp('^/'), '');

    pouchdb.utils.ajax({
        method: 'GET',
        url: host + '/_fti/local/' + dbName + '/_design/' + name + params
    }, function(err, body, response) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(body);
        }
    });

    return deferred.promise;
}

function query(db, name, opts) {
    if (db.type() === 'http') {
        return httpQuery(db, name, opts);
    }

    throw {
        error: 'http_db_only',
        reason: 'Only http databases are supported'
    };
}

module.exports = function(name, opts, callback) {
    var db = this;

    var resp = query(db, name, opts);

    if (typeof callback === 'function') {
        return resp.then(function(result) {
            return callback(null, result);
        }, callback);

    } else {
        return resp;
    }
};
