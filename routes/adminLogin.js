var osutils = require('os-utils');
var getSize = require('get-folder-size');
var path = require('path');
var async = require('async');

var dateFormat = function () {
	var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
		timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
		timezoneClip = /[^-+\dA-Z]/g,
		pad = function (val, len) {
			val = String(val);
			len = len || 2;
			while (val.length < len) val = "0" + val;
			return val;
		};

	// Regexes and supporting functions are cached through closure
	return function (date, mask, utc) {
		var dF = dateFormat;

		// You can't provide utc if you skip other args (use the "UTC:" mask prefix)
		if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
			mask = date;
			date = undefined;
		}

		// Passing date through Date applies Date.parse, if necessary
		date = date ? new Date(date) : new Date;
		if (isNaN(date)) throw SyntaxError("invalid date");

		mask = String(dF.masks[mask] || mask || dF.masks["default"]);

		// Allow setting the utc argument via the mask
		if (mask.slice(0, 4) == "UTC:") {
			mask = mask.slice(4);
			utc = true;
		}

		var	_ = utc ? "getUTC" : "get",
			d = date[_ + "Date"](),
			D = date[_ + "Day"](),
			m = date[_ + "Month"](),
			y = date[_ + "FullYear"](),
			H = date[_ + "Hours"](),
			M = date[_ + "Minutes"](),
			s = date[_ + "Seconds"](),
			L = date[_ + "Milliseconds"](),
			o = utc ? 0 : date.getTimezoneOffset(),
			flags = {
				d:    d,
				dd:   pad(d),
				ddd:  dF.i18n.dayNames[D],
				dddd: dF.i18n.dayNames[D + 7],
				m:    m + 1,
				mm:   pad(m + 1),
				mmm:  dF.i18n.monthNames[m],
				mmmm: dF.i18n.monthNames[m + 12],
				yy:   String(y).slice(2),
				yyyy: y,
				h:    H % 12 || 12,
				hh:   pad(H % 12 || 12),
				H:    H,
				HH:   pad(H),
				M:    M,
				MM:   pad(M),
				s:    s,
				ss:   pad(s),
				l:    pad(L, 3),
				L:    pad(L > 99 ? Math.round(L / 10) : L),
				t:    H < 12 ? "a"  : "p",
				tt:   H < 12 ? "am" : "pm",
				T:    H < 12 ? "A"  : "P",
				TT:   H < 12 ? "AM" : "PM",
				Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
				o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
				S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
			};

		return mask.replace(token, function ($0) {
			return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
		});
	};
}();

// Some common format strings
dateFormat.masks = {
	"default":      "ddd mmm dd yyyy HH:MM:ss",
	shortDate:      "m/d/yy",
	mediumDate:     "mmm d, yyyy",
	longDate:       "mmmm d, yyyy",
	fullDate:       "dddd, mmmm d, yyyy",
	shortTime:      "h:MM TT",
	mediumTime:     "h:MM:ss TT",
	longTime:       "h:MM:ss TT Z",
	isoDate:        "yyyy-mm-dd",
	isoTime:        "HH:MM:ss",
	isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
	isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

dateFormat.i18n = {
	dayNames: [
		"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
		"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
	],
	monthNames: [
		"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
		"Января", "Февраля", "Марта", "Апреля", "Мая", "June", "July", "August", "September", "October", "November", "December"
	]
};

module.exports = function (app) {

	app.get('/admin', function (req, res) {
		if (res.locals.logged === 'logged') {
			var pupils_all = function (callback) {
				app.pupilsController.Collection.count({})
					.exec(function (err, data) {
						queryExecFn(err, data, callback)
					});
			};
			var pupils_approved = function (callback) {
				app.pupilsController.Collection.count({
					status: 'approved'
				}).exec(function (err, data) {
						queryExecFn(err, data, callback)
					});
			};
			var pupils_new = function (callback) {
				app.pupilsController.Collection.count({
					status: 'new'
				}).exec(function (err, data) {
						queryExecFn(err, data, callback)
					});
			};
			var pupils_new_clear= function (callback) {
				app.pupilsController.Collection.count({
					status: 'new clear'
				}).exec(function (err, data) {
						queryExecFn(err, data, callback)
					});
			};
			var pupils_unapproved= function (callback) {
				app.pupilsController.Collection.count({
					status: 'unapproved'
				}).exec(function (err, data) {
						queryExecFn(err, data, callback)
					});
			};

			var pupils_disapproved= function (callback) {
				app.pupilsController.Collection.count({
					status: 'disapproved'
				}).exec(function (err, data) {
						queryExecFn(err, data, callback)
					});
			};

			var pupils_olymp= function (callback) {
				app.pupilsController.Collection.count({
					passOlymp: true
				}).exec(function (err, data) {
						queryExecFn(err, data, callback)
					});
			};

			var profiles_all= function (callback) {
				app.profileController.Collection.find()
				.exec(function (err, data) {
						queryExecFn(err, data, callback)
					});
			};
				async.parallel([
					pupils_all, 
					pupils_approved, 
					pupils_new, 
					pupils_new_clear, 
					pupils_unapproved, 
					pupils_disapproved, 
					pupils_olymp, 
					profiles_all
				], function (err, results) {
					osutils.cpuUsage(function (cpuUsage) {
						getSize(path.resolve(__dirname, '../'), function (err, size) {
							if (err) {
								throw err;
							}

							res.render('admin/dashboard', {
								cpuUsage: cpuUsage,
								totalmem: osutils.totalmem(),
								memUsage: process.memoryUsage().heapUsed / (1024 * 1024),
								freemem: osutils.freemem(),
								size: (size / 1024 / 1024).toFixed(2),
								totalP: results[0],
								approvedP: results[1],
								unapprovedP: results[4],
								disapprovedP: results[5],
								newP: results[2],
								newClearP: results[3],
								passOlymp: results[6],
								profiles: calcProfileStats(results[7])
							});
						});
					});
				});				
		} else {
			res.render('admin/login');
		}
	});

	app.post('/admin', function (req, res) {
		app.userController.authenticate(req.body.username, req.body.password, req, res);
	});

	app.get('/admin/logout', function (req, res) {
		app.userController.logout(req, res);
	});

	function calcProfileStats(profiles) {
		var returnData = [];
		var sum = 0;
		var olymp = 0;
		var ammount = 0,
			returnOlymp = [],
			returnAmmounts = [],
			common = {},
			flag,
			i = 0,
			j,
			ammountLength,
			commonLength,
			profile,
			dates = [],
			date,
			length = profiles.length;
		for (i; i < length; i++) {
			if (profiles[i].countArray.length > 0) {
				sum = sum + profiles[i].countArray[profiles[i].countArray.length - 1].count;
			}
			returnOlymp.push(profiles[i].olymp || 0);
			returnAmmounts.push(profiles[i].ammount)
			olymp = olymp + profiles[i].olymp || 0;
			ammount = ammount + profiles[i].ammount;
		}

		common = {
			common: true,
			name: 'Общий конкурс',
			countArray: [{
				count: sum
			}],
			points: [],
			olymp: olymp,
			ammount: ammount,
			code: 'Все'
		};
		returnOlymp.push(olymp);
		returnAmmounts.push(ammount)
		for (i = 0; i < length; i++) {
			profile = {
				name: profiles[i].name,
				code: profiles[i].code,
				points: []
			}
			date = '';
			ammountLength = profiles[i].countArray.length;
			
			for (j = 0; j < ammountLength; j++) {
				if (date == dateFormat(profiles[i].countArray[j].date, "yyyy-mm-dd")) {
					profile.points[profile.points.length - 1].count = profiles[i].countArray[j].count;
				} else {
					date = dateFormat(profiles[i].countArray[j].date, "yyyy-mm-dd");
					profile.points.push({
						count: profiles[i].countArray[j].count,
						date: date
					});
					flag = false;
					for (k = 0; k < dates.length; k++) {
						if (date == dates[k]) {
							flag = true;
							break;
						}
					}
					if (!flag) {
						dates.push(date);
					}
				}

			}

			returnData.push(profile)
		}
		dates = dates.sort();
		if (dates[dates.length - 1] !== dateFormat(Date.now(), "yyyy-mm-dd")) {
			dates.push(dateFormat(Date.now(), "yyyy-mm-dd"));
		}

		for (i = 0; i < dates.length; i++) {
			common.points.push({
				date: dates[i],
				count: 0
			});
			sum = 0;
			for (j = 0; j < length; j++) {
				profile = returnData[j];
				//profile.points = $filter('orderBy')(profile.points, 'date', false);
				ammountLength = returnData[j].points.length;
				flag = false;
				for (k = 0; k < ammountLength; k++) {
					if (dates[i] == profile.points[k].date) {
						sum = sum + profile.points[k].count;
						flag = true;
					}
				}
				if (!flag) {
					for (k = 0; k < ammountLength; k++) {
						if (profile.points[k].date >= dates[i]) {
							break;

						}
					}
					if (k == 0) {
						k = 1;
					}
					profile.points.push({
						date: dates[i],
						count: profile.points[k - 1].count
					});

					sum = sum + profile.points[k - 1].count;
				}
			}
			common.points[common.points.length - 1].count = sum;
		}


		returnData.push(common);
		var returnPoints = [];
		var returnNames = [];
		var returnCodes = [];
		for (var k = 0; k < returnData.length; k++) {
			returnNames.push(returnData[k].name)
			returnCodes.push(returnData[k].code)
			returnPoints[k] = []
			returnData[k].points.forEach(function(v, i) {
				returnPoints[k].push(v.count)
			})
		}
		var flag = true;
		var g = -1;
		while (flag) {
			g++;
			for (var m = 0; m < returnPoints.length; m++) {
				if (returnPoints[m][g] > 0) {
					flag = false
				}
			}
			
		}

		dates = dates.slice(g)
		for (m = 0; m < returnPoints.length; m++) {
			returnPoints[m] = returnPoints[m].slice(g)
		}
	


		return {
			names: returnNames,
			points: returnPoints,
			dates: dates,
			olymp: returnOlymp,
			ammounts: returnAmmounts,
			codes: returnCodes
		}
	}

	function queryExecFn(err, data, callback) {
        if (err) {
            callback(err, null);
        }
        else {
            callback(null, data);
        }
    }
}