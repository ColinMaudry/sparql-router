module.exports.stringBefore = function (str, sep) {
 var i = str.indexOf(sep);

 if(i > 0)
  return  str.slice(0, i);
 else
  return str;
};

module.exports.capitalizeFirst = function(str) {
	return str.substring(0, 1).toUpperCase() + str.substring(1);
}
