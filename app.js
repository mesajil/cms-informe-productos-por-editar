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
        [p.n, p.codigo, p.producto, f(p.fecha), p.observacion || '-', p.asignacion || 'Sin asignar.'].forEach(function (v) {
          var td = document.createElement('td'); td.textContent = v; if (v === '-') td.className = 'vacio'; tr.appendChild(td);
        });
        tb.appendChild(tr);
      });
      tabla.hidden = false;
      document.getElementById('copiar').hidden = false;
    })
    .catch(function () { meta.textContent = 'No se encontró el informe solicitado.'; });
})();
(function () {
  var btn = document.getElementById('copiar');
  var txt = btn.textContent;
  function aviso(m) { btn.classList.remove('cargando'); btn.textContent = m; setTimeout(function () { btn.textContent = txt; btn.disabled = false; }, 2500); }
  function generar() {
    return html2canvas(document.getElementById('tabla'), { scale: 2, backgroundColor: '#ffffff' })
      .then(function (c) { return new Promise(function (ok) { c.toBlob(ok, 'image/png'); }); });
  }
  function descargar(b) {
    var a = document.createElement('a'); a.href = URL.createObjectURL(b);
    a.download = 'productos-por-editar.png'; a.click(); aviso('Imagen descargada');
  }
  btn.addEventListener('click', function () {
    if (btn.disabled) return; btn.disabled = true; btn.classList.add('cargando'); btn.innerHTML = '<span class="spinner"></span>Generando…';
    var p = generar();
    if (navigator.clipboard && window.ClipboardItem) {
      navigator.clipboard.write([new ClipboardItem({ 'image/png': p })])
        .then(function () { aviso('¡Copiada! Ya puedes pegarla'); })
        .catch(function () {
          p.then(function (b) {
            var f = new File([b], 'productos-por-editar.png', { type: 'image/png' });
            if (navigator.canShare && navigator.canShare({ files: [f] })) {
              navigator.share({ files: [f] }).then(function () { aviso('Listo'); }, function () { descargar(b); });
            } else { descargar(b); }
          });
        });
    } else { p.then(descargar); }
  });
})();