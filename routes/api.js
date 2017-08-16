var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/group/:id', function(req, res, next) {
    var group = parseInt(req.params.id);
    var db = req.db;
    var collection = db.get('message');
    collection.find({"group":group},function(e,confirm){
        console.log(typeof(group));
        console.log(confirm);
        if(e) console.log("reading error");
        else res.send(confirm);
    });
});

module.exports = router;
