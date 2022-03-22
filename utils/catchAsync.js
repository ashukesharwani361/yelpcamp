module.exports = function (fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(next);        //catches the error and forwards it to next. 
    }
}

