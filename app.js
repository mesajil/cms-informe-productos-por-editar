(function () {
  var meta = document.getElementById('meta');
  var tabla = document.getElementById('tabla');
  var id = new URLSearchParams(location.search).get('r');
  var url = id && /^[0-9_-]+$/.test(id) ? 'reportes/' + id + '.json' : 'reportes/ultimo.json';
  var fmt = new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
  function f(s) { var d = new Date(s); return isNaN(d) ? s : fmt.format(d); }
  fetch(url, { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (d) {
      meta.textContent = 'Informe del ' + f(d.generado) + ' · ' + d.total + (d.total === 1 ? ' producto pendiente' : ' productos pendientes');
      var tb = tabla.querySelector('tbody');
      d.productos.forEach(function (p) {
        var tr = document.createElement('tr');
        if (p.observacion) tr.className = 'alerta';
        [p.n, p.codigo, p.producto, f(p.fecha), p.observacion || '-'].forEach(function (v) {
          var td = document.createElement('td'); td.textContent = v; tr.appendChild(td);
        });
        tb.appendChild(tr);
      });
      tabla.hidden = false;
    })
    .catch(function () { meta.textContent = 'No se encontró el informe solicitado.'; });
})();