var BaseController = require('./baseController').BaseController;

SettingsController = function(mongoose, app) {

    var base = new BaseController('Settings', 'settings', mongoose, app);

    base.list = function(req, res) {
        var self = this;
        this.Collection.find().sort('-createdAt').exec(function(err, docs) {
            res.render(self.viewPath + 'list.jade', {
                docs: docs[0],
                viewName: 'settings'
            });
        });
    };

    base.save = function(req, res) {
        var self = this;
        var doc;
        this.Collection.find().sort('-createdAt').exec(function(err, docs) {
            if (docs.length > 0) {
                doc = docs[0];
            } else {
                doc = new base.Collection();
            }

            doc.showPupilCabinet = req.body.showPupilCabinet === 'on';
            doc.showStats = req.body.showStats === 'on';
            doc.clientAppName = req.body.clientAppName;
            doc.clientAppSecret = req.body.clientAppSecret;
            doc.registrationEndDate = req.body.registrationEndDate;
            doc.confirmationEndDate = req.body.confirmationEndDate;
            doc.rulesLink = req.body.rulesLink;
            doc.rulesHTML = req.body.rulesHTML;
            doc.email1 = req.body.email1;
            doc.email1Pass = req.body.email1Pass;
            doc.email2 = req.body.email2;
            doc.email2Pass = req.body.email2Pass;
            doc.email3 = req.body.email3;
            doc.email3Pass = req.body.email3Pass;
            doc.email4 = req.body.email4;
            doc.email4Pass = req.body.email4Pass;
            doc.superPassword = req.body.superPassword;
            doc.reSiteKey = req.body.reSiteKey;

            doc.save(function(err, d) {
                app.siteConfig = doc;
                app.mailController.update();
                app.superCash = {};
                res.redirect(self.path);
            });
        });
    };

    base.constructor = arguments.callee;

    base.Collection.find().sort('-createdAt').exec(function(err, docs) {
        var doc;
        if (docs.length > 0) {
            doc = docs[0];
        } else {
            doc = new base.Collection();
            doc.save();
        }
        base.app.siteConfig = doc;
        base.app.mailController.update();
        console.log(base.app.siteConfig);
    });


    return base;
};



exports.SettingsController = SettingsController;