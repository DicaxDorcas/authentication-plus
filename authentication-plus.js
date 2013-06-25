var fs = require('fs');

var sessionsplus = require('sessions-plus');


// -- Set folder to store authentication files.
authFolder = './auth/';
// --

// -- Checks if folder exists in project where executed.
function initialChecks() {
    if(!fs.existsSync(authFolder)) {
            fs.mkdirSync(authFolder);
    }
}
// --

// -- Add a user.
exports.add = function (user, password, email, level) {
    initialChecks();
    // Returns true if successful.
    user = makeCanonical(user);
    if(fs.existsSync(authFolder + user + ".json")) {
        return false;
    } else if(validateUser(user)){
        user_data = {};
        user_data.name = user;
        user_data.password = password;
        user_data.email = email;
        user_data.active = true;
        user_data.level = level;
        fs.writeFileSync(authFolder + user_data.name + ".json", JSON.stringify(user_data));
        return true;
    }
}
// --

// -- Remove a user.
exports.remove = function (user) {
    initialChecks();
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
    initialChecks();
    // Returns req if correct or a boolean false if incorrect.
    user = makeCanonical(user);
    if((validateUser(user)) && (fs.existsSync(authFolder + user + ".json"))) {
        user_data = JSON.parse(fs.readFileSync(authFolder + user + '.json', encoding='utf8'));
        if((user_data.active == true) && (user_data.password == password)) {
            req.session.user = {};
            req.session.user.name = user_data.name;
            req.session.user.email = user_data.email;
            req.session.user.level = user_data.level;
        
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
    user = /^[a-z0-9]+$/i.test(user);
    return user;
}

function makeCanonical(user) {
    // Returns canonical username
    user = user.toLowerCase();
    return user;
}
// --
