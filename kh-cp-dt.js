/* TNP · Tab "Kế hoạch CP-DT" — tự dựng tab + pane, dùng chung ô Giá dầu (#ds) & %CP/DT (#rt).
   Logic dựa trên cost tuyến Trục Nam Bắc (8T-HN, 15T-HN). 1 tua = 2 chuyến.
   Giá bán = tổng chi phí 1 chiều ÷ mốc %CP/DT (làm tròn 100.000đ). */
(function () {
  var URE = 13200;
  var COST = [
    { k: '8T-HN',  km: 1710, dn: 20, un: 0.9, luong: 4000000, bdkm: 300, vetcVAT: 2605967 },
    { k: '15T-HN', km: 1710, dn: 23, un: 1.2, luong: 4250000, bdkm: 350, vetcVAT: 3790356 }
  ];
  var MONTHS = ['T7/26', 'T8/26', 'T9/26', 'T10/26', 'T11/26', 'T12/26'];
  var tuaxe = [4, 4.5, 5, 5.5, 5.5, 5.5];

  var fmt = function (n) { return Math.round(n).toLocaleString('vi-VN'); };
  var f1  = function (v) { return (Math.round(v * 10) / 10).toLocaleString('vi-VN'); };
  var pct = function (x) { return (x * 100).toFixed(1) + '%'; };
  var mround = function (v, m) { return Math.round(v / m) * m; };
  function D() { var e = document.getElementById('ds'); return e ? (parseFloat(e.value) || 0) : 22290; }
  function R() { var e = document.getElementById('rt'); return e ? (parseFloat(e.value) || 0.7) : 0.7; }

  function calcLane(L, d, r) {
    var dau = L.km * L.dn / 100 * d;
    var ure = L.km * L.un / 100 * URE;
    var bd  = L.km * L.bdkm;
    var tttx = dau + ure + L.luong + bd;
    var vetc = L.vetcVAT / 1.08;
    var tong = tttx + vetc;
    var gia = mround(tong / r, 100000);
    return { dau: dau, ure: ure, bd: bd, luong: L.luong, vetc: vetc, tong: tong, gia: gia };
  }

  function card(k, v) {
    return '<div style="border:1px solid #e0e9f1;border-radius:10px;padding:11px 15px;min-width:160px;flex:1">'
      + '<div style="font-size:11px;color:#6a7784;text-transform:uppercase;font-weight:700;letter-spacing:.3px">' + k + '</div>'
      + '<div style="font-size:19px;font-weight:800;color:#0E84BC;margin-top:3px">' + v + '</div></div>';
  }

  function buildTux() {
    var h = '<tr><td class="l" style="background:#e3f3fc;font-weight:700;color:#0E84BC">Tua/xe</td>';
    for (var i = 0; i < MONTHS.length; i++) {
      h += '<td style="text-align:center">' + MONTHS[i] + '<br>'
        + '<input data-i="' + i + '" type="number" step="0.5" min="0" value="' + tuaxe[i] + '" '
        + 'style="width:58px;text-align:right;border:1.5px solid #f3c88f;border-radius:6px;padding:5px;font-weight:700;color:#c2700d;background:#fffdf8"></td>';
    }
    h += '</tr>';
    var t = document.getElementById('kh_tux');
    t.innerHTML = h;
    t.querySelectorAll('input').forEach(function (inp) {
      inp.addEventListener('input', function (e) {
        tuaxe[+e.target.dataset.i] = parseFloat(e.target.value) || 0;
        renderPlan();
      });
    });
  }

  function renderPlan() {
    var d = D(), r = R();
    var c8 = calcLane(COST[0], d, r), c15 = calcLane(COST[1], d, r);
    var rev8 = c8.gia * 2, rev15 = c15.gia * 2;
    var d8 = c8.dau * 2, d15 = c15.dau * 2, u8 = c8.ure * 2, u15 = c15.ure * 2,
        v8 = c8.vetc * 2, v15 = c15.vetc * 2, b8 = c8.bd * 2, b15 = c15.bd * 2,
        l8 = c8.luong * 2, l15 = c15.luong * 2;
    var xe8 = parseFloat((document.getElementById('kh_xe8') || {}).value) || 0;
    var xe15 = parseFloat((document.getElementById('kh_xe15') || {}).value) || 0;
    var M = MONTHS.map(function (m, i) {
      var tx = tuaxe[i], t8 = xe8 * tx, t15 = xe15 * tx;
      var dt = t8 * rev8 + t15 * rev15;
      var dau = t8 * d8 + t15 * d15, ure = t8 * u8 + t15 * u15, vetc = t8 * v8 + t15 * v15,
          bd = t8 * b8 + t15 * b15, luong = t8 * l8 + t15 * l15;
      var cp = dau + ure + vetc + bd + luong;
      return { t8: t8, t15: t15, tua: t8 + t15, dt: dt, dau: dau, ure: ure, vetc: vetc, bd: bd, luong: luong, cp: cp, ln: dt - cp };
    });
    var S = function (k) { return M.reduce(function (s, x) { return s + x[k]; }, 0); };
    var T = { tua: S('tua'), dt: S('dt'), dau: S('dau'), ure: S('ure'), vetc: S('vetc'), bd: S('bd'), luong: S('luong'), cp: S('cp'), ln: S('ln') };
    var col  = function (a) { return a.map(function (v) { return '<td>' + fmt(v) + '</td>'; }).join(''); };
    var colT = function (a) { return a.map(function (v) { return '<td>' + f1(v) + '</td>'; }).join(''); };
    var h = '<thead><tr><th class="l">Chỉ tiêu</th>' + MONTHS.map(function (m) { return '<th>' + m + '</th>'; }).join('') + '<th>Cả kỳ</th></tr></thead><tbody>';
    h += '<tr class="secrow"><td class="l" colspan="8">SẢN LƯỢNG (tua) · 1 tua = 2 chuyến</td></tr>';
    h += '<tr><td class="l">Tua 8T-HN</td>' + colT(M.map(function (x) { return x.t8; })) + '<td>' + f1(S('t8')) + '</td></tr>';
    h += '<tr><td class="l">Tua 15T-HN</td>' + colT(M.map(function (x) { return x.t15; })) + '<td>' + f1(S('t15')) + '</td></tr>';
    h += '<tr class="subr"><td class="l">Tổng tua</td>' + colT(M.map(function (x) { return x.tua; })) + '<td>' + f1(T.tua) + '</td></tr>';
    h += '<tr class="secrow"><td class="l" colspan="8">DOANH THU (đ) · giá bán theo ' + Math.round(r * 100) + '% CP/DT</td></tr>';
    h += '<tr><td class="l">8T-HN</td>' + col(M.map(function (x) { return x.t8 * rev8; })) + '<td>' + fmt(S('t8') * rev8) + '</td></tr>';
    h += '<tr><td class="l">15T-HN</td>' + col(M.map(function (x) { return x.t15 * rev15; })) + '<td>' + fmt(S('t15') * rev15) + '</td></tr>';
    h += '<tr class="hlr"><td class="l">TỔNG DOANH THU</td>' + col(M.map(function (x) { return x.dt; })) + '<td>' + fmt(T.dt) + '</td></tr>';
    h += '<tr class="secrow"><td class="l" colspan="8">CHI PHÍ (đ)</td></tr>';
    h += '<tr><td class="l">Dầu (theo giá dầu)</td>' + col(M.map(function (x) { return x.dau; })) + '<td>' + fmt(T.dau) + '</td></tr>';
    h += '<tr><td class="l">Ure/AdBlue</td>' + col(M.map(function (x) { return x.ure; })) + '<td>' + fmt(T.ure) + '</td></tr>';
    h += '<tr><td class="l">VETC (chưa VAT)</td>' + col(M.map(function (x) { return x.vetc; })) + '<td>' + fmt(T.vetc) + '</td></tr>';
    h += '<tr><td class="l">Bảo dưỡng</td>' + col(M.map(function (x) { return x.bd; })) + '<td>' + fmt(T.bd) + '</td></tr>';
    h += '<tr><td class="l">Lương lái xe</td>' + col(M.map(function (x) { return x.luong; })) + '<td>' + fmt(T.luong) + '</td></tr>';
    h += '<tr class="hlr"><td class="l">TỔNG CHI PHÍ</td>' + col(M.map(function (x) { return x.cp; })) + '<td>' + fmt(T.cp) + '</td></tr>';
    h += '<tr class="secrow"><td class="l" colspan="8">TỔNG HỢP</td></tr>';
    h += '<tr class="secr"><td class="l">LỢI NHUẬN</td>' + col(M.map(function (x) { return x.ln; })) + '<td>' + fmt(T.ln) + '</td></tr>';
    h += '<tr><td class="l">Biên lợi nhuận %</td>' + M.map(function (x) { return '<td>' + (x.dt ? pct(x.ln / x.dt) : '-') + '</td>'; }).join('') + '<td>' + (T.dt ? pct(T.ln / T.dt) : '-') + '</td></tr>';
    h += '</tbody>';
    document.getElementById('kh_plan').innerHTML = h;
    document.getElementById('kh_kpi').innerHTML =
      card('Doanh thu cả kỳ', fmt(T.dt)) + card('Chi phí cả kỳ', fmt(T.cp)) +
      card('Lợi nhuận cả kỳ', fmt(T.ln)) + card('Biên lợi nhuận', T.dt ? pct(T.ln / T.dt) : '-');
  }

  function build() {
    var tabs = document.querySelector('.tabs');
    var body = document.querySelector('.body');
    if (!tabs || !body || document.getElementById('tb-kh')) return;

    var btn = document.createElement('button');
    btn.id = 'tb-kh';
    btn.className = 'tb';
    btn.textContent = 'Kế hoạch CP-DT';
    tabs.appendChild(btn);

    var pane = document.createElement('div');
    pane.id = 'pane-kh';
    pane.style.display = 'none';
    pane.innerHTML =
      '<div style="display:flex;gap:22px;flex-wrap:wrap;margin:2px 0 14px">'
        + '<div><div style="font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.4px;margin-bottom:6px">Số xe 8T</div>'
          + '<input id="kh_xe8" type="number" min="0" value="6" style="width:120px;font-size:1.1rem;font-weight:700;color:#0E84BC;border:2px solid #d9e7f1;border-radius:9px;padding:9px 11px"></div>'
        + '<div><div style="font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.4px;margin-bottom:6px">Số xe 15T</div>'
          + '<input id="kh_xe15" type="number" min="0" value="1" style="width:120px;font-size:1.1rem;font-weight:700;color:#0E84BC;border:2px solid #d9e7f1;border-radius:9px;padding:9px 11px"></div>'
      + '</div>'
      + '<h3 class="sec">Tua / xe mục tiêu theo tháng</h3>'
      + '<table id="kh_tux" style="margin-bottom:14px"></table>'
      + '<div id="kh_kpi" style="display:flex;gap:12px;flex-wrap:wrap;margin:6px 0 16px"></div>'
      + '<table id="kh_plan"></table>'
      + '<div class="hint">Tuyến Hà Nội · 1 tua = 2 chuyến · Sản lượng = số xe × tua/xe · dùng chung ô Giá dầu &amp; %CP/DT ở thanh trên. Giá bán = tổng chi phí 1 chiều ÷ mốc %CP/DT (làm tròn 100.000đ).</div>';
    body.appendChild(pane);

    var others = [].slice.call(document.querySelectorAll('.tabs .tb')).filter(function (x) { return x !== btn; });
    btn.addEventListener('click', function () {
      ['e', 'q', 'd', 'm'].forEach(function (k) { var el = document.getElementById('pane-' + k); if (el) el.style.display = 'none'; });
      var th = document.getElementById('pane-th'); if (th) th.style.display = 'none';
      others.forEach(function (x) { x.classList.remove('on'); });
      pane.style.display = 'block';
      btn.classList.add('on');
    });
    others.forEach(function (x) {
      x.addEventListener('click', function () { pane.style.display = 'none'; btn.classList.remove('on'); });
    });

    ['ds', 'rt'].forEach(function (id) {
      var e = document.getElementById(id);
      if (e) { e.addEventListener('input', renderPlan); e.addEventListener('change', renderPlan); }
    });
    ['kh_xe8', 'kh_xe15'].forEach(function (id) {
      var e = document.getElementById(id);
      if (e) e.addEventListener('input', renderPlan);
    });

    buildTux();
    renderPlan();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
