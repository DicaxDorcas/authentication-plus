var fs = require('fs');

var sha256 = require('./SHA256.js');
var sessionsplus = require('sessions-plus');


// -- Set folder to store authentication files.
authFolder = './auth/';
// --

// -- Add a user.
exports.add = function (user, password, email) {
    // Returns true if successful.
    user = makeCanonical(user);
    if(fs.existsSync(authFolder + user + ".json")) {
        return false;
    } else {
        user_data = {};
        user_data.name = user;
        user_data.password = sha256.hash(password);
        user_data.email = email;
        user_data.active = 'true';
        fs.writeFileSync(authFolder + user_data.name + ".json", JSON.stringify(user_data));
        return true;
    }
}
// --

// -- Remove a user.
exports.remove = function (user) {
    // Returns true if successful.
    user = makeCanonical(user);
    if(validateUser(user)) {
        fs.unlink(authFolder + user + '.json', function(err) {
            if(err) return false;
        });
        return true;
    } else {
        return false;
    }
}
// --

// -- Authenticate a user.
exports.auth = function (user, password, req) {
    // Returns req if correct or a boolean false if incorrect.
    user = makeCanonical(user);
    if((validateUser(user)) && (fs.existsSync(authFolder + user + ".json"))) {
        user_data = JSON.parse(fs.readFileSync(authFolder + user + '.json', encoding='utf8'));
        if((typeof req.session!='undefined') && (fs.existsSync(authFolder + user + ".json")) && (validateUser(user)) && (user_data.password == password)) {
            req.session.user = {};
            req.session.user.name = user_data.name;
            req.session.user.email = user_data.email;
        
            return req;
        } else {
            return false;
        }
    } else {
        return false;
    }

}
// --

// -- Validate a user name; given as string.
function validateUser(user) {
    // Returns true if it matches correct format.
    user = user.test(/^[a-z0-9]+$/i);
    return user;
}

function makeCanonical(user) {
    // Returns canonical username
    user = user.toLowerCase();
    return user;
}
// --
