var Log = function(msg) {
  console.log(msg);
  var logHolder = document.getElementById('log');
  logHolder.value = msg + "\n" + logHolder.value;
};
