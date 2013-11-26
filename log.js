var Log = function(msg) {
  console.log(msg);
  var logHolder = document.getElementById('log');
  logHolder.innerHTML = logHolder.innerHTML + "<p>" + msg + "</p>";// "\n" + logHolder.value;
  logHolder.scrollTop = logHolder.scrollHeight;
};
