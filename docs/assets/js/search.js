(function () {
  var input = document.getElementById('mnemonic-search');
  var results = document.getElementById('search-results');
  if (!input || !results) return;

  var data = null;

  fetch(input.dataset.src)
    .then(function (res) { return res.json(); })
    .then(function (json) { data = json; });

  function render(list) {
    if (!list.length) {
      results.innerHTML = '';
      return;
    }
    results.innerHTML = list
      .slice(0, 30)
      .map(function (item) {
        return (
          '<a class="result-item" href="' + item.url + '">' +
          '<span class="rn">' + item.name + '</span>' +
          '</a>'
        );
      })
      .join('');
  }

  input.addEventListener('input', function () {
    var q = input.value.trim().toUpperCase();
    if (!data || !q) {
      results.innerHTML = '';
      return;
    }
    var matched = data.filter(function (item) {
      return item.name.indexOf(q) !== -1;
    });
    render(matched);
  });
})();
