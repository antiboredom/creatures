var Log = function(msg, type) {
  console.log(msg);
  var logHolder = document.getElementById('log');
  var p = typeof type == "undefined" ? '<p>' : '<p class="'+type+'"><span></span>';
  logHolder.innerHTML = logHolder.innerHTML + p + msg + "</p>";// "\n" + logHolder.value;
  logHolder.scrollTop = logHolder.scrollHeight;
};
