/* ============================================================
 * 心斋 · 心理学修习馆 — 交互逻辑（app.js）
 * 纯静态、零依赖、ES5；数据见 data*.js。
 * 功能：Tab 导航 / 每日一理一练 / 效应词典 / 数息与专注计时+打卡 /
 *       标准与多维测评 / 文集阅读 / 「问心·解结」预约留号（第三方接口，未配则降级加微信）
 * ============================================================ */
(function () {
  'use strict';
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  var SHOP = META || { shop: '心斋', wxId: '' };
  var ST_KEY = 'xinzai_stats_v1';   // 打卡记账
  var LEAD_KEY = 'xinzai_leads_v1'; // 本机留的线索（演示/自留底）
  var QLOG_KEY = 'xinzai_quizlog_v1'; // 测过量表的快照（随问心带给馆主）
  var ASK_HIS_KEY = 'xinzai_askhis_v1'; // 历次递过的心结：都收着，随下次一并带给馆主
  var ASK_DRAFT_KEY = 'xinzai_askdraft_v1'; // 浮层里最后一次输入的「心里的结」草稿
  var DAY_MS = 86400000;

  /* ================= 通用：Toast / 复制 ================= */
  var toastTimer = null;
  function toast(msg) {
    var t = $('toast'); t.textContent = msg; t.className = 'show';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.className = ''; }, 2200);
  }
  function copyText(txt, okMsg) {
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); toast(okMsg || '已复制'); }
      catch (e) { toast('复制失败，请长按手动复制'); }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(function () { toast(okMsg || '已复制'); },
        function () { fallback(); });
    } else { fallback(); }
  }
  function todayStr() {
    var d = new Date(), m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (day < 10 ? '0' : '') + day;
  }
  function daySeed() {
    var d = new Date();
    return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY_MS);
  }
  function readStore() {
    try { return JSON.parse(localStorage.getItem(ST_KEY) || '{}') || {}; }
    catch (e) { return {}; }
  }
  function saveStore(s) { try { localStorage.setItem(ST_KEY, JSON.stringify(s)); } catch (e) {} }

  /* ================= Tab 导航（5 页：问心 / 测一测 / 专注力 / 词典 / 随笔） ================= */
  var tabs = document.querySelectorAll('.tab-btn');
  var secs = {
    home: $('sec-home'),
    lab: $('sec-tests'),
    focus: $('sec-practice'),
    dict: $('sec-effects'),
    reads: $('sec-reads')
  };
  function showSec(key, on) {
    var el = secs[key];
    if (!el) return;
    el.classList.toggle('on', on);
  }
  function goTab(name) {
    if (!secs[name]) return;
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].classList.toggle('on', tabs[i].getAttribute('data-tab') === name);
    }
    for (var k in secs) showSec(k, k === name);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].addEventListener('click', function () { goTab(this.getAttribute('data-tab')); });
  }
  var goCards = document.querySelectorAll('[data-go]');
  for (var j = 0; j < goCards.length; j++) {
    (function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        var g = el.getAttribute('data-go');
        if (g === 'tests') { goTab('lab'); return; }
        if (g === 'dict' || g === 'effects') { goTab('dict'); return; }
        if (g === 'focus' || g === 'practice') { goTab('focus'); return; }
        if (g === 'qa') { goTab('home'); var inp = $('qaInput'); if (inp) { inp.focus(); inp.scrollIntoView({ behavior: 'smooth', block: 'center' }); } return; }
        goTab(g);
      });
    })(goCards[j]);
  }
  var gtp = $('goToPractice');
  if (gtp) gtp.addEventListener('click', function () { goTab('focus'); });

  /* ================= 每日一理 / 每日一练 ================= */
  var ideaOff = 0, doOff = 0;
  var dI = $('dailyIdea'), iN = $('ideaNote'), iD = $('ideaDate');
  var dD = $('dailyDo'), dN = $('doNote'), dDd = $('doDate');
  function wrapIdx(i, n) { return ((i % n) + n) % n; }
  function renderIdea() {
    var arr = ESSENCE, idx = wrapIdx(daySeed() + ideaOff, arr.length);
    var it = arr[idx];
    dI.innerHTML = '「' + esc(it.idea) + '」';
    iN.innerHTML = esc(it.note);
    iD.textContent = '第 ' + (idx + 1) + ' / ' + arr.length + ' 则';
  }
  function renderDo() {
    var arr = PRACTICE, idx = wrapIdx(daySeed() + doOff, arr.length);
    var it = arr[idx];
    dD.innerHTML = '「' + esc(it.title) + '」——' + esc(it.tip);
    dN.innerHTML = '今天把这一练做一遍，就是给自己最好的功课。';
    dDd.textContent = '第 ' + (idx + 1) + ' / ' + arr.length + ' 练';
  }
  $('ideaPrev').addEventListener('click', function () { ideaOff--; renderIdea(); });
  $('ideaNext').addEventListener('click', function () { ideaOff++; renderIdea(); });
  $('doPrev').addEventListener('click', function () { doOff--; renderDo(); });
  $('doNext').addEventListener('click', function () { doOff++; renderDo(); });
  $('shareIdea').addEventListener('click', function () {
    var it = ESSENCE[wrapIdx(daySeed() + ideaOff, ESSENCE.length)];
    copyText('【今日一理】' + it.idea + '\n' + it.note + '\n——来自 ' + SHOP.shop + ' · 心理修习馆 ' + (SHOP.domain || ''), '今日一句已复制');
  });
  $('shareDo').addEventListener('click', function () {
    var it = PRACTICE[wrapIdx(daySeed() + doOff, PRACTICE.length)];
    copyText('【今日一练】' + it.title + '：' + it.tip + '\n——来自 ' + SHOP.shop + ' · 心理修习馆 ' + (SHOP.domain || ''), '今日一练已复制');
  });
  renderIdea(); renderDo();

  /* ================= 识理 · 效应词典（西 · 中 · 佛 分类） ================= */
  var fxGrid = $('fxGrid'), fxCat = '' , fxWord = '';
  function srcOf(it) {
    if (it.src) return it.src;
    if (it.cat === '中医') return '中';
    if (it.cat === '佛家' || it.cat === '佛理') return '佛';
    return '西';
  }
  var CAT_COLOR = { 西: '#46607a', 中: '#8a6a2e', 佛: '#6d4f9e' };
  var SRC_LABEL = { 西: '现代心理', 中: '中医心理', 佛: '佛家心法' };
  function renderCats() {
    var box = $('fxCats'); box.innerHTML = '';
    function mk(label, key, on) {
      var b = document.createElement('button');
      b.className = 'chip' + (on ? ' on' : '');
      b.textContent = label;
      b.style.borderColor = CAT_COLOR[key] || '#8a6a2e';
      b.style.color = on ? '#fffaf0' : (CAT_COLOR[key] || '#8a6a2e');
      b.style.background = on ? (CAT_COLOR[key] || '#8a6a2e') : '';
      b.addEventListener('click', function () {
        fxCat = key;
        renderCats(); renderFx();
      });
      box.appendChild(b);
    }
    mk('全部', '', fxCat === '');
    var order = ['西', '中', '佛'];
    for (var i = 0; i < order.length; i++) mk(SRC_LABEL[order[i]], order[i], fxCat === order[i]);
  }
  function renderFx() {
    var q = fxWord.trim();
    var list = [];
    for (var i = 0; i < EFFECTS.length; i++) {
      var it = EFFECTS[i];
      var s = srcOf(it);
      if (fxCat && s !== fxCat) continue;
      if (q && (it.t + it.en + it.one + it.cure).indexOf(q) < 0) continue;
      list.push(it);
    }
    fxGrid.innerHTML = '';
    for (var i = 0; i < list.length; i++) {
      var it = list[i];
      var s = srcOf(it);
      var c = document.createElement('div');
      c.className = 'card fx';
      c.innerHTML =
        '<span class="cat" style="background:' + (CAT_COLOR[s] || '#8a6a2e') + '">' + esc(SRC_LABEL[s]) + ' · ' + esc(it.cat) + '</span>' +
        '<div class="fx-t">' + esc(it.t) + '</div>' +
        '<div class="fx-en">' + esc(it.en) + '</div>' +
        '<p class="fx-one">' + esc(it.one) + '</p>' +
        '<div class="fx-more">' +
          '<div><span class="lbl">为何会这样：</span>' + esc(it.why) + '</div><br>' +
          '<div><span class="lbl">身边例子：</span>' + esc(it.scene) + '</div><br>' +
          '<div><span class="lbl">一句心法：</span>' + esc(it.cure) + '</div>' +
        '</div>';
      c.addEventListener('click', function () { this.classList.toggle('open'); });
      fxGrid.appendChild(c);
    }
    var wc = 0, tc = 0, fc = 0;
    for (var i = 0; i < EFFECTS.length; i++) {
      var s2 = srcOf(EFFECTS[i]);
      if (s2 === '中') tc++; else if (s2 === '佛') fc++; else wc++;
    }
    $('fxCount').innerHTML = '共 ' + list.length + ' 条 · 点卡片展开「为何 · 例子 · 心法」' +
      (fxWord || fxCat ? '（当前有筛选）' : ' · 全库配比 ' + wc + ' 西 / ' + tc + ' 中 / ' + fc + ' 佛');
  }
  $('fxSearch').addEventListener('input', function () { fxWord = this.value; renderFx(); });
  renderCats(); renderFx();

  /* ================= 练定 · 打卡记账 ================= */
  var WD = ['日', '一', '二', '三', '四', '五', '六'];
  function todayRecord() {
    var s = readStore();
    return s.days && s.days[todayStr()] ? s.days[todayStr()] : null;
  }
  function refreshStats() {
    var s = readStore(), days = s.days || {}, t = todayStr();
    var today = days[t] || { min: 0, sits: 0 };
    var sumMin = 0, sumSits = 0, streak = 0;
    for (var k in days) {
      if (days[k] && days[k].min) { sumMin += days[k].min; sumSits += days[k].sits || 0; }
    }
    var base = new Date();
    base.setDate(base.getDate() - (days[t] ? 0 : 1));
    var cur = new Date(base.getTime());
    while (true) {
      var ds = cur.getFullYear() + '-' + (cur.getMonth() + 1 < 10 ? '0' : '') + (cur.getMonth() + 1) +
        '-' + (cur.getDate() < 10 ? '0' : '') + cur.getDate();
      if (!days[ds]) break;
      streak++; cur.setDate(cur.getDate() - 1);
    }
    $('stToday').textContent = today.min;
    $('stStreak').textContent = streak;
    $('stTotal').textContent = sumMin;
    $('stSits').textContent = sumSits;
    /* 近 7 日圆点 */
    var box = $('weekDots'), html = '';
    for (var n = 6; n >= 0; n--) {
      var dt = new Date(); dt.setDate(dt.getDate() - n);
      var ds = dt.getFullYear() + '-' + (dt.getMonth() + 1 < 10 ? '0' : '') + (dt.getMonth() + 1) +
        '-' + (dt.getDate() < 10 ? '0' : '') + dt.getDate();
      var on = !!(days[ds]);
      html += '<div class="wd' + (on ? ' on' : '') + '"><i></i>' + WD[dt.getDay()] + '</div>';
    }
    box.innerHTML = html;
  }
  function logSit(min) {
    var s = readStore();
    if (!s.days) s.days = {};
    var t = todayStr(), d = s.days[t] || { min: 0, sits: 0 };
    d.min += min; d.sits += 1; s.days[t] = d;
    saveStore(s); refreshStats();
  }
  refreshStats();

  /* ================= 打坐 · 打卡 / 不断座挑战（专注力页） =================
   * 每天至少记一座 → 算不断座；漏记一天，本期作断、可重新发起。
   * 打卡计入统一点击账（今日分钟 / 连续天数 / 静心次数），姿势与时长另存本模块。 */
  var SEAT_KEY = 'xinzai_seat_v1';
  var SEAT_POSTS = ['散盘', '单盘', '双盘'];
  function seatRead() { try { return JSON.parse(localStorage.getItem(SEAT_KEY) || '{}') || {}; } catch (e) { return {}; } }
  function seatWrite(s) { try { localStorage.setItem(SEAT_KEY, JSON.stringify(s)); } catch (e) {} }
  function _sd(d) {
    var m = d.getMonth() + 1, dd = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (dd < 10 ? '0' : '') + dd;
  }
  function _gap(a, b) { return Math.round((new Date(b) - new Date(a)) / 86400000); }
  function seatCtx() { var s = seatRead(); if (!s.ch) s.ch = {}; if (!s.log) s.log = []; return s; }

  /* 姿势选择：散盘 / 单盘 / 双盘 */
  var seatPosRow = $('seatPos');
  if (seatPosRow) seatPosRow.addEventListener('click', function (e) {
    var t = e.target;
    if (t && t.getAttribute && t.getAttribute('data-p')) {
      var s = seatCtx(); s.post = t.getAttribute('data-p'); seatWrite(s);
      renderSeatPos();
    }
  });
  function renderSeatPos() {
    var row = $('seatPos'); if (!row) return;
    var cur = (seatCtx().post) || '散盘';
    row.innerHTML = '';
    for (var i = 0; i < SEAT_POSTS.length; i++) {
      (function (p) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'dur' + (p === cur ? ' on' : '');
        b.textContent = p;
        b.setAttribute('data-p', p);
        row.appendChild(b);
      })(SEAT_POSTS[i]);
    }
  }
  /* 最近几座回顾 */
  function renderSeatMeta() {
    var el = $('seatMeta'); if (!el) return;
    var log = (seatCtx().log) || [], t = _sd(new Date());
    if (!log.length) { el.innerHTML = '还没记过一座。坐下来，哪怕三分钟，也请记上。'; return; }
    var yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    var yd = _sd(yesterday), parts = [];
    for (var i = 0; i < Math.min(log.length, 5); i++) {
      var e = log[i];
      var lb = e.d === t ? '今天' : (e.d === yd ? '昨天' : e.d.slice(5));
      parts.push('<b>' + lb + '</b> · ' + e.p + (e.m ? ' · ' + e.m + ' 分钟' : ' · 片刻'));
    }
    el.innerHTML = '近几座　' + parts.join('　');
  }

  /* 不断座挑战 */
  var chalPick = 21, chalCustom = false;
  var chalBody = $('seatChalBody');
  function renderChal() {
    if (!chalBody) return;
    var ch = (seatCtx().ch) || {}, html = '';
    var tgt = ch.tgt || chalPick || 21;
    if (!ch.on) {
      var chips = '';
      for (var i = 0; i < [7, 14, 21, 30].length; i++) {
        var v = [7, 14, 21, 30][i];
        var isOn = !chalCustom && v === chalPick;
        chips += '<button type="button" class="dur' + (isOn ? ' on' : '') + '" data-t="' + v + '">' + v + ' 天</button>';
      }
      chips += '<button type="button" class="dur' + (chalCustom ? ' on' : '') + '" data-t="custom">自 定</button>';
      if (chalCustom) chips += '<input id="chalNum" class="chal-num" type="number" min="3" max="365" value="' + chalPick + '" aria-label="自定义天数">';
      html = '<div class="chal-line">每天记一座，一期 <b>' + tgt + ' 天</b>；漏记一天，本期归零重来。</div>' +
        '<div class="dur-row" style="justify-content:center;">' + chips + '</div>' +
        '<div class="chal-actions"><button type="button" class="mini-btn cgo" data-act="start">发 起 挑 战</button></div>';
    } else if (ch.state === 'break') {
      html = '<div class="chal-line">上一期 <b>已中断</b>（漏记断座）。从今天起重新计数，别再断。</div>' +
        '<div class="chal-actions"><button type="button" class="mini-btn cgo" data-act="again">再 来 一 期</button></div>';
    } else {
      var win = ch.state === 'win', now = _sd(new Date());
      var streak = ch.streak || 0;
      html = '<div class="chal-line">' +
        (win ? '<b class="chal-ok">圆 满 · 不断座 ' + tgt + ' 天 已 达 成</b><br>' : '') +
        '不断座 第 <b>' + Math.min(streak, tgt) + '</b> / ' + tgt + ' 天' +
        (ch.last === now ? ' · 今日已记座' : ' · 今天还没记，勿忘座') + '</div>';
      html += '<div class="chal-bar"><i style="width:' + Math.round(Math.min(streak / tgt, 1) * 100) + '%"></i></div>';
      html += '<div class="chal-actions">' +
        (win ? '<button type="button" class="mini-btn cgo" data-act="again">再 来 一 期</button>' +
          '<button type="button" class="mini-btn" data-act="giveup">换 天 数</button>'
          : '<button type="button" class="mini-btn" data-act="giveup">放 弃</button>') +
        '</div>';
    }
    chalBody.innerHTML = html;
  }
  function startChal(tgtDays) {
    tgtDays = Math.max(3, Math.min(365, parseInt(tgtDays, 10) || 21));
    var s = seatCtx(), today = _sd(new Date());
    var loggedToday = false;
    for (var i = 0; i < s.log.length; i++) { if (s.log[i].d === today) { loggedToday = true; break; } }
    s.ch.on = true; s.ch.tgt = tgtDays; s.ch.state = 'run';
    s.ch.last = loggedToday ? today : '';
    s.ch.streak = loggedToday ? 1 : 0;
    s.ch.start = today;
    chalPick = tgtDays; chalCustom = false;
    seatWrite(s); renderChal();
    toast('不断座挑战已开启 · 目标 ' + tgtDays + ' 天，今天起每天记一座');
  }
  if (chalBody) chalBody.addEventListener('click', function (e) {
    var n = e.target;
    while (n && n !== this) {
      if (n.getAttribute && n.getAttribute('data-t')) {
        var tv = n.getAttribute('data-t');
        if (tv === 'custom') {
          chalCustom = true;
          var saved = (seatCtx().ch || {}).tgt || 30;
          chalPick = (chalCustom && saved) || 30;
          renderChal();
        } else { chalPick = parseInt(tv, 10) || 21; chalCustom = false; renderChal(); }
        return;
      }
      if (n.getAttribute && n.getAttribute('data-act')) {
        var a = n.getAttribute('data-act');
        var st = seatCtx();
        if (a === 'start') {
          var num = chalCustom ? $('chalNum') : null;
          startChal(num ? num.value : chalPick);
        } else if (a === 'again') { startChal(st.ch.tgt || chalPick); }
        else if (a === 'giveup') {
          var gone = st.ch && st.ch.streak ? st.ch.streak : 0;
          st.ch.on = false; st.ch.state = 'break';
          seatWrite(st); renderChal();
          toast('已放弃本期（连记 ' + gone + ' 天）。想再来，随时发起。');
        }
        return;
      }
      n = n.parentNode;
    }
  });
  /* 打卡：姿势 + 自由时长（小时/分钟）记一座 */
  (function () {
    var h = $('seatH'), m = $('seatM');
    if (h) for (var i = 0; i <= 6; i++) {
      var o = document.createElement('option'); o.value = i; o.textContent = i;
      if (i === 0) o.selected = true; h.appendChild(o);
    }
    if (m) for (var j = 0; j < 60; j++) {
      var o2 = document.createElement('option'); o2.value = j; o2.textContent = j;
      if (j === 10) o2.selected = true; m.appendChild(o2);
    }
  })();
  var seatCheckBtn = $('seatCheck');
  if (seatCheckBtn) seatCheckBtn.addEventListener('click', function () {
    var s = seatCtx(), h = parseInt($('seatH').value, 10) || 0,
        min = parseInt($('seatM').value, 10) || 0;
    var mins = h * 60 + min;   /* 0 分钟 = 只坐片刻，仍记一功 */
    var today = _sd(new Date()), had = false;
    for (var i = 0; i < s.log.length; i++) { if (s.log[i].d === today) { had = true; break; } }
    s.log.unshift({ d: today, t: Date.now(), p: s.post || '散盘', m: mins });
    if (s.log.length > 60) s.log.length = 60;
    /* 挑战计数 */
    var ch = s.ch || {};
    if (ch.on && ch.state !== 'win') {
      if (!ch.last) { ch.last = today; ch.streak = 1; ch.state = 'run'; }
      else if (ch.last !== today) {
        var g = _gap(ch.last, today);
        if (g === 1) { ch.streak = (ch.streak || 0) + 1; ch.last = today; ch.state = 'run'; }
        else if (g > 1) { ch.state = 'break'; ch.streak = 1; ch.last = today; }
      }
      if (ch.state === 'run' && ch.streak >= ch.tgt) { ch.state = 'win'; }
    }
    seatWrite(s);
    logSit(mins);                       /* 并入统一静心统计 */
    renderSeatPos(); renderSeatMeta(); renderChal();
    var hh = Math.floor(mins / 60), mm = mins % 60;
    var durTxt = mins ? (hh ? hh + ' 小时' + (mm ? ' ' + mm + ' 分' : '') : mm + ' 分钟') : '片刻';
    toast('已记一功 · ' + (s.post || '散盘') + ' ' + durTxt + (had ? '（今日再加一座）' : ''));
  });
  renderSeatPos(); renderSeatMeta(); renderChal();

  /* ---------- 计时器（数息 / 专注共用） ---------- */
  var RING = 104, CIR = 2 * Math.PI * RING;
  (function () {
    var r = $('ring'), b = document.querySelector('.ring-bg');
    if (r) r.setAttribute('stroke-dasharray', CIR.toFixed(2));
    if (b) b.setAttribute('stroke-dasharray', CIR.toFixed(2));
  })();
  function buildDur(rowId, arr, cb, def) {
    var row = $(rowId), btns = [], val = def;
    row.innerHTML = '';
    for (var i = 0; i < arr.length; i++) {
      (function (m) {
        var b = document.createElement('button');
        b.className = 'dur' + (m === val ? ' on' : '');
        b.textContent = m + ' 分钟';
        b.addEventListener('click', function () {
          for (var k = 0; k < btns.length; k++) btns[k].classList.remove('on');
          this.classList.add('on'); val = m;
          if (cb) cb(m);
        });
        btns.push(b); row.appendChild(b);
      })(arr[i]);
    }
    return function () { return val; };
  }
  var getBreathMin = buildDur('breathDurRow', [3, 5, 10], null, 5);
  var getFocusMin = buildDur('focusDurRow', [10, 15, 25, 45], null, 25);

  var timer = null, timerId = null, tickTimer = null;
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function openTimer(kind, minutes) {
    timer = { kind: kind, minutes: minutes, total: minutes * 60, left: minutes * 60, paused: false, done: false };
    $('timerOv').classList.remove('hidden');
    $('tmTitle').textContent = kind === 'breath' ? '数息安坐' : '一事一毕 · 专注';
    var ball = $('breathBall'), clock = $('tmClock');
    ball.style.display = kind === 'breath' ? 'block' : 'none';
    ball.style.width = ball.style.height = '120px';
    clock.style.fontSize = kind === 'breath' ? '26px' : '44px';
    $('tmDone').style.display = 'none';
    $('tmPause').textContent = '暂 停';
    if (kind === 'breath') {
      $('tmPhase').textContent = '吸气';
      ball.style.transform = 'scale(.6)';
    } else {
      $('tmPhase').textContent = '安住眼前这一件 · 心跑开就轻轻拉回';
    }
    paint();
    if (kind === 'breath' && !tickTimer) tickTimer = setInterval(breathAnim, 1000);
    timerId = setInterval(tick, 1000);
  }
  function breathAnim() {
    if (!timer || timer.kind !== 'breath' || timer.paused) return;
    var el = timer.total - timer.left + 1;      // 已过的秒（1 起）
    var c = ((el - 1) % 12) + 1;                 // 周期内 1..12
    var ball = $('breathBall'), ph = $('tmPhase');
    var s;
    if (c <= 4) { ph.textContent = '吸气'; s = 0.6 + 0.4 * (c / 4); }
    else if (c <= 6) { ph.textContent = '屏息'; s = 1; }
    else { ph.textContent = '呼气'; s = 1 - 0.4 * ((c - 6) / 6); }
    ball.style.transform = 'scale(' + Math.min(1, Math.max(.55, s)).toFixed(2) + ')';
  }
  function paint() {
    if (!timer) return;
    var m = Math.floor(timer.left / 60), s = timer.left % 60;
    $('tmClock').textContent = pad(m) + ':' + pad(s);
    var prog = 1 - timer.left / timer.total;
    $('ring').setAttribute('stroke-dashoffset', (CIR * (1 - prog)).toFixed(2));
  }
  function tick() {
    if (!timer || timer.paused || timer.done) return;
    timer.left--;
    if (timer.left <= 0) { finishTimer(); return; }
    paint();
  }
  function finishTimer() {
    timer.done = true; timer.left = 0; paint();
    clearInterval(timerId); timerId = null;
    if (timer.kind === 'breath') clearInterval(tickTimer), tickTimer = null;
    $('tmClock').textContent = '00:00';
    $('tmPhase').textContent = '';
    var ball = $('breathBall');
    ball.style.transform = 'scale(.8)';
    logSit(timer.minutes);
    var ok = $('tmDone');
    ok.style.display = 'block';
    ok.textContent = '圆满 · 已记静心 ' + timer.minutes + ' 分钟（共坐 ' +
      (todayRecord() ? todayRecord().min : timer.minutes) + ' 分钟）';
    toast('本次圆满，给自己记了一功');
  }
  function closeTimer() {
    if (timerId) { clearInterval(timerId); timerId = null; }
    if (tickTimer) { clearInterval(tickTimer); tickTimer = null; }
    timer = null;
    $('timerOv').classList.add('hidden');
    $('breathBall').style.transform = 'scale(.6)';
  }
  $('breathStart').addEventListener('click', function () { openTimer('breath', getBreathMin()); });
  $('focusStart').addEventListener('click', function () { openTimer('focus', getFocusMin()); });
  $('tmPause').addEventListener('click', function () {
    if (!timer || timer.done) return;
    timer.paused = !timer.paused;
    this.textContent = timer.paused ? '继 续' : '暂 停';
  });
  $('tmStop').addEventListener('click', function () {
    if (timer && !timer.done && timer.left > 0 && !window.confirm('现在就结束？本次不计入今日打卡。')) return;
    closeTimer();
  });
  $('timerOv').addEventListener('click', function (e) {
    if (e.target === this) closeTimer();
  });

  /* ================= 首页 · 问心问答搜索 ================= */
  var qaResult = $('qaResult');
  function qaSrcCls(s) { return s === '中' ? 'tcm' : (s === '佛' ? 'bud' : 'west'); }
  function qaTestName(id) {
    for (var i = 0; i < TESTS.length; i++) if (TESTS[i].id === id) return TESTS[i].name;
    return '';
  }
  function qaText(t) {
    /* 一个词条的全部可搜文本：标题 + 原问题 + 标签 + 三个视角正文 */
    var parts = [t.name, t.q];
    if (t.tags) parts.push(t.tags.join(' '));
    var views = [t.main, t.west, t.tcm, t.bud];
    for (var i = 0; i < views.length; i++) {
      if (views[i] && views[i].ans) parts.push(views[i].ans);
    }
    return parts.join(' ').toLowerCase();
  }
  function qaBigrams(s) {
    /* 字符二元组（对中文近似匹配友好） */
    var m = {}, i;
    s = (s || '').replace(/\s+/g, '');
    for (i = 0; i < s.length - 1; i++) {
      var b = s.substr(i, 2);
      m[b] = (m[b] || 0) + 1;
    }
    return m;
  }
  function qaDice(a, b) {
    var n = 0, ta = 0, tb = 0, k;
    for (k in a) { if (a.hasOwnProperty(k)) ta += a[k]; }
    for (k in b) { if (b.hasOwnProperty(k)) { tb += b[k]; if (a[k]) n += Math.min(a[k], b[k]); } }
    return (ta + tb) ? (2 * n) / (ta + tb) : 0;
  }
  function qaScore(topic, w) {
    /* 客户问法与该词条的相似分：整句命中 > 标签命中 > 字面重叠兜底 */
    var txt = qaText(topic);
    var s = 0;
    if (txt.indexOf(w) >= 0) s += 60;
    var tags = topic.tags || [];
    for (var i = 0; i < tags.length; i++) {
      var t = tags[i];
      if (w.indexOf(t) >= 0) s += 12;
      else if (t.indexOf(w) >= 0 && w.length >= 2) s += 6;
    }
    s += qaDice(qaBigrams(w), qaBigrams(txt)) * 60;
    return s;
  }
  function renderQaCard(t) {
    var div = document.createElement('div');
    div.className = 'qa-item';
    var views = [t.main];
    if (t.west) views.push(t.west);
    if (t.tcm) views.push(t.tcm);
    if (t.bud) views.push(t.bud);
    var order = views.slice(0);
    var html = '<div class="qa-q">' + esc(t.q) + '</div>';
    if (t.name) html += '<div class="qa-meta">相关困扰：' + esc(t.name) + '</div>';
    for (var i = 0; i < order.length; i++) {
      var v = order[i];
      if (!v) continue;
      var cls = qaSrcCls(v.src);
      html += '<div class="ans-row ' + cls + '">' +
        '<span class="ar-tag">' + esc(v.tip || '') + '</span>' + esc(v.ans);
      if (v.quote) html += '<div class="ar-quote"><span class="qq">' + esc(v.quote) + '</span>' +
        (v.raw ? '<div class="raw">' + esc(v.raw) + '</div>' : '') + '</div>';
      if (v.ref) html += '<div class="ar-ref">出处/依据：' + esc(v.ref) + '</div>';
      html += '</div>';
    }
    var act = '';
    if (t.test) {
      var tn = qaTestName(t.test);
      if (tn) {
        act += '<button class="mini-btn qa-test" data-testid="' + esc(t.test) + '">搭配自测：' + esc(tn) + ' →</button>';
      }
    }
    act += '<button class="mini-btn" data-hallcard="1">带着问题＋本条标题，去问心聊聊 →</button>';
    html += '<div class="qa-act">' + act + '</div>';
    div.innerHTML = html;
    var btn = div.querySelector('[data-testid]');
    if (btn) btn.addEventListener('click', function () {
      for (var i = 0; i < TESTS.length; i++) if (TESTS[i].id === btn.getAttribute('data-testid')) { goTab('lab'); startQuiz(TESTS[i]); return; }
    });
    var hb = div.querySelector('[data-hallcard]');
    if (hb) hb.addEventListener('click', function () {
      var q = qaInputRaw || (t.name || t.q);
      LEAD.qRaw = q;
      LEAD.qa = qaTitleLine(t);
      LEAD.msg = q;
      openAsk(null);
    });
    qaResult.appendChild(div);
  }
  var QA_TOP = 8; /* 发问后一次最多列出的相关词条数 */
  var qaInputRaw = ''; /* 最近一次点「问一问」的原话，供“返回再挑” */
  function qaOpenTopic(t) {
    qaResult.innerHTML = '';
    var bar = document.createElement('div');
    bar.className = 'qa-backbar';
    var bk = document.createElement('button');
    bk.className = 'mini-btn';
    bk.textContent = '← 返回，换一个相关条目';
    bk.addEventListener('click', function () { doQaSearch(qaInputRaw); });
    bar.appendChild(bk);
    qaResult.appendChild(bar);
    renderQaCard(t);
  }
  function qaStateLine(msg) {
    var d = document.createElement('div');
    d.className = 'qa-state';
    d.innerHTML = msg;
    return d;
  }
  function qaFallbackBtn(w) {
    var d = document.createElement('div');
    d.className = 'qa-none';
    d.innerHTML = '「' + esc(w) + '」暂时没搜到现成条目。换更常见的说法再问（如：焦虑、睡不好、拖延、发脾气、跟父母吵架）。<br>真想找馆主聊聊，就点右下角「问心 · 解结」，把原话写进去即可。';
    return d;
  }
  /* 客户点开条目后的回看入口；复制 / 给馆主都收在「问心」浮层里做 */
  function qaTitleLine(t) {
    if (!t) return '';
    return (t.name || t.q) + (t.name && t.q ? '（' + t.q + '）' : '');
  }
  function qaPickNames(raw, cands, dropped) {
    qaInputRaw = raw;
    qaResult.innerHTML = '';
    var note = (cands[0].s >= 60)
      ? '与「' + esc(raw) + '」最贴近的相关条目：'
      : '没有一字不差的，下面是意思最接近的相关条目：';
    qaResult.appendChild(qaStateLine(note));
    var list = document.createElement('div');
    list.className = 'qa-names';
    for (var i = 0; i < cands.length; i++) {
      (function (c) {
        var b = document.createElement('button');
        b.className = 'qa-name';
        b.innerHTML = '<b>' + esc(c.t.name || c.t.q) + '</b><small>' + esc(c.t.q) + '</small>';
        b.addEventListener('click', function () { qaOpenTopic(c.t); });
        list.appendChild(b);
      })(cands[i]);
    }
    qaResult.appendChild(list);
    if (dropped > 0) {
      qaResult.appendChild(qaStateLine('还有 ' + dropped + ' 个沾边的未列出——再说具体些、换个说法会更准。'));
    }
    var alt = document.createElement('div');
    alt.className = 'qa-none';
    alt.innerHTML = '都不是你想问的？换句大白话再问一次。<br>真想找馆主聊聊，就点右下角「问心 · 解结」，把原话写进去即可。';
    qaResult.appendChild(alt);
  }
  /* 两步提问：先列“相关词库名字”，客户点选后才打开正文 */
  function doQaSearch(raw, autoOpen) {
    var show = (raw || '').trim();
    qaInputRaw = show;
    var w = show.toLowerCase();
    qaResult.innerHTML = '';
    if (!w) return;
    var ranked = [];
    for (var i = 0; i < ASKTOPICS.length; i++) ranked.push({ t: ASKTOPICS[i], s: qaScore(ASKTOPICS[i], w) });
    ranked.sort(function (a, b) { return b.s - a.s; });
    var cands = [], k;
    for (k = 0; k < ranked.length; k++) {
      if (ranked[k].s < 3) break;
      cands.push(ranked[k]);
    }
    if (!cands.length) { qaResult.appendChild(qaFallbackBtn(show)); return; }
    /* 程序内跳转（如测完“再问一题”）直接打开最贴近一问；客户主动提问则先给候选名单 */
    if (autoOpen && cands[0].s >= 60) { qaOpenTopic(cands[0].t); return; }
    var extra = cands.length - QA_TOP;
    qaPickNames(show, cands.slice(0, QA_TOP), extra > 0 ? extra : 0);
  }
  function qaSendNow() { doQaSearch($('qaInput').value); }
  $('qaSend').addEventListener('click', function () { qaSendNow(); });
  /* 回车等同点「问一问」 */
  $('qaInput').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); qaSendNow(); }
  });
  /* 词库默认隐藏：清空输入即收起结果，打字时不再实时弹出 */
  $('qaInput').addEventListener('input', function () {
    if (!this.value.trim()) { qaResult.innerHTML = ''; }
  });

  /* ================= 自测 · 测评（标准量表 + 中医/佛家原创自省） ================= */
  var quiz = null, qi = 0, qScore = 0, qSels = [];
  /* 自测日志：测完自动记一笔，随「问心·解结」带给馆主 */
  function readQuizLog() {
    try { return JSON.parse(localStorage.getItem(QLOG_KEY) || '[]') || []; }
    catch (e) { return []; }
  }
  function saveQuizLog(id, name, src, badge, score, at) {
    if (!id) return;
    try {
      var arr = readQuizLog(), i, found = -1;
      var day = String(at || todayStr()).slice(0, 10);
      for (i = 0; i < arr.length; i++) {
        if (arr[i].id === id && String(arr[i].at || '').slice(0, 10) === day) { found = i; break; }
      }
      if (found >= 0) arr.splice(found, 1);
      arr.unshift({ id: id, name: name, src: src, badge: badge, score: score, at: at || todayStr() });
      if (arr.length > 12) arr.length = 12;
      localStorage.setItem(QLOG_KEY, JSON.stringify(arr));
    } catch (e) {}
  }
  function quizLogLines(n) {
    var arr = readQuizLog();
    if (!arr.length) return '';
    var s = [], i;
    for (i = 0; i < Math.min(n || 5, arr.length); i++) {
      var q = arr[i];
      s.push('· ' + q.name + (q.src ? '（' + q.src + '）' : '') + '：' + q.badge +
        (q.score ? '　' + q.score : '') + '　' + (q.at || ''));
    }
    return s.join('\n');
  }
  function srcCls(s) { return s === 'tcm' ? 'tcm' : (s === 'bud' ? 'buddha' : 'west'); }
  function srcName(s) { return s === 'tcm' ? '中医心理' : (s === 'bud' ? '佛家心法' : '现代心理'); }
  function quizFoot(it) {
    var n = it.questions ? it.questions.length : 0;
    var min = Math.max(1, Math.ceil(n / 3));
    var tag = it.kind === 'multi' ? '多维计分' : '标准量表';
    if (it.self) tag = '原创自省';
    return n + ' 题 · 约 ' + min + ' 分钟 · ' + tag;
  }
  function listTests() {
    var box = $('testList'); box.innerHTML = '';
    for (var i = 0; i < TESTS.length; i++) {
      (function (it) {
        var c = document.createElement('div');
        c.className = 'card go-card test-card';
        c.innerHTML =
          '<span class="src-tag ' + srcCls(it.src) + '">' + esc(srcName(it.src)) + '</span>' +
          '<h3>' + esc(it.name) + '</h3><p>' + esc(it.sub) + '</p>' +
          (it.base ? '<p class="t-base">依据：' + esc(it.base) + '</p>' : '') +
          '<p style="margin-top:8px; color:#98896d; font-size:12px;">' + quizFoot(it) + '</p>';
        c.addEventListener('click', function () { startQuiz(it); });
        box.appendChild(c);
      })(TESTS[i]);
    }
  }
  function quizScaleOf(q) {
    /* 单题最高可选分值（用于总分分母），供 sum 模式展示 */
    var m = 0;
    for (var i = 0; i < q.opts.length; i++) m = Math.max(m, q.opts[i].s || 0);
    return m;
  }
  function startQuiz(it) {
    quiz = it; qi = 0; qScore = 0; qSels = [];
    $('testList').style.display = 'none';
    $('quizRes').style.display = 'none';
    $('quizBox').style.display = 'block';
    $('quizName').textContent = it.name + ' · ' + it.sub;
    renderQ();
  }
  function renderQ() {
    if (!quiz) return;
    var it = quiz;
    $('qStep').textContent = '第 ' + (qi + 1) + ' / ' + it.questions.length + ' 题';
    $('qFill').style.width = ((qi / it.questions.length) * 100) + '%';
    if (qi >= it.questions.length) { finishQuiz(); return; }
    var q = it.questions[qi];
    var qno = (it.questions[qi].qno ? it.questions[qi].qno + ' ' : '');
    var qh = '<span style="color:#a0392a; letter-spacing:2px;">' + (qi + 1) + '.</span> ' +
      (qno ? '<span style="color:#8a6a2e; font-size:12px; letter-spacing:1px;">' + esc(qno) + '</span>' : '') + esc(q.q);
    if (q.en) {
      qh += '<div style="font-size:12px; color:#98896d; font-style:italic; letter-spacing:.5px; margin-top:6px; line-height:1.8;">原题 · ' + esc(q.en) + '</div>';
    }
    $('qText').innerHTML = qh;
    var box = $('qOpts'); box.innerHTML = '';
    for (var k = 0; k < q.opts.length; k++) {
      (function (o) {
        var b = document.createElement('button');
        b.className = 'q-opt';
        b.textContent = o.t;
        b.addEventListener('click', function () { pick(o); });
        box.appendChild(b);
      })(q.opts[k]);
    }
  }
  function pick(o) {
    qScore += (o.s || 0);
    qSels.push({ s: o.s || 0, d: o.d || (quiz.questions[qi] && quiz.questions[qi].dim) || null });
    qi++;
    renderQ();
  }
  function sumMax(it) {
    var m = 0;
    for (var i = 0; i < it.questions.length; i++) m += quizScaleOf(it.questions[i]);
    return m;
  }
  function finishQuiz() {
    var it = quiz, r = null;
    if (it.kind === 'multi') {
      r = (typeof it.build === 'function') ? it.build(qSels, it) : {
        badge: '多维结果', color: '#a0392a', title: '本次自测', note: '（本量表未配置结果解读）', sug: '建议与馆主细聊。'
      };
    } else {
      for (var i = 0; i < it.ranges.length; i++) {
        if (qScore <= it.ranges[i].to) { r = it.ranges[i]; break; }
      }
      if (!r) r = it.ranges[it.ranges.length - 1];
    }
    $('quizBox').style.display = 'none';
    $('quizRes').style.display = 'block';
    $('resBadge').style.background = r.color;
    $('resBadge').textContent = r.badge;
    $('resTitle').textContent = r.title;
    if (it.kind === 'multi') {
      $('resNote').innerHTML = esc(r.note).replace(/\n/g, '<br>');
    } else {
      $('resNote').textContent = r.note;
    }
    var footHtml = '';
    if (it.kind !== 'multi') {
      footHtml = '<div style="text-align:center; color:#98896d; margin-top:10px; font-size:12px;">本测共 ' + it.questions.length +
        ' 题 · 你的得分 ' + qScore + ' / ' + sumMax(it) + '（各量表计分方向不同，仅供自我参照，不作诊断）</div>';
    }
    $('resSug').innerHTML = '<b>给你的小练：</b>' + esc(r.sug).replace(/\n/g, '<br>') + footHtml;
    /* 借鉴依据标注：标准量表 / 原创自省 */
    var sn = $('resSrcNote');
    if (it.self) {
      sn.innerHTML = it.base ? '<b>本测视角：</b>' + esc(it.base) + '　·　「' + esc(srcName(it.src)) + '」原创自省，非诊断工具' : '';
    } else if (it.kind === 'multi') {
      sn.innerHTML = it.base ? '<b>本测依据：</b>' + esc(it.base) + '　·　按原版维度计分的中文版本，结果仅供参考，不作诊断' : '';
    } else {
      sn.innerHTML = it.base ? '<b>本测依据：</b>' + esc(it.base) + '　·　按原版计分与分档（非诊断工具，需专业评估请就诊）' : '';
    }
    /* 记录一笔自测日志（随「问心」浮层带给馆主） */
    var d = new Date();
    var now = d.getFullYear() + '-' + (d.getMonth() + 1 < 10 ? '0' : '') + (d.getMonth() + 1) + '-' +
      (d.getDate() < 10 ? '0' : '') + d.getDate() + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
    saveQuizLog(it.id, it.name, srcName(it.src), r.badge,
      it.kind === 'multi' ? '' : (qScore + ' / ' + sumMax(it)), now);
  }
  function backToList() {
    quiz = null;
    $('quizBox').style.display = 'none';
    $('quizRes').style.display = 'none';
    $('testList').style.display = '';
  }
  $('quizBack').addEventListener('click', backToList);
  $('quizAgain').addEventListener('click', function () { if (quiz) startQuiz(quiz); });
  $('quizMore').addEventListener('click', backToList);
  $('askAfterTest').addEventListener('click', function () {
    var preset = '';
    if (quiz && quiz.id === 'phq9') preset = '低落';
    else if (quiz && quiz.id === 'gad7') preset = '焦虑';
    else if (quiz && quiz.id === 'pss10') preset = '压力';
    else if (quiz && quiz.id === 'ais8') preset = '失眠';
    else if (quiz && quiz.id === 'ucla') preset = '孤独';
    else if (quiz && quiz.id === 'rses') preset = '自卑';
    else if (quiz && quiz.id === 'ecr12') preset = '患得患失';
    else if (quiz && quiz.id === 'maas15') preset = '静不下来';
    else if (quiz && quiz.id === 'bfi10') preset = '拖延';
    else if (quiz && quiz.id === 'mbti16') preset = '选择';
    else if (quiz && quiz.id === 'mercy') preset = '自我关怀';
    else if (quiz && quiz.id === 'qixing') preset = '发脾气';
    else if (quiz && quiz.id === 'shenqi') preset = '心慌';
    if (preset) $('qaInput').value = preset;
    goTab('home');
    doQaSearch($('qaInput').value || '', true);
    var el = $('qaInput');
    el.focus(); el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (window.setTimeout) window.setTimeout(function () { el.focus(); }, 600);
  });
  var goAsk = $('goAskAfterQuiz');
  if (goAsk) goAsk.addEventListener('click', function () {
    LEAD.qRaw = ''; LEAD.qa = ''; /* 不带「问一问」条目，只带最近自测 */
    var arr = readQuizLog();
    LEAD.msg = arr.length ? ('刚测了' + arr[0].name + '（' + arr[0].badge + '），想聊聊') : '';
    openAsk(null);
  });
  listTests();

  /* ================= 文集 ================= */
  var ESSAY_COLOR = { 修心: '#a0392a', 识人: '#5d6b50', 情绪: '#46607a', 行动: '#8a6a2e', 认知: '#7a5a9c', 成长: '#4f6f47', 禅观: '#6d4f9e', 中医: '#8a6a2e', 医心: '#b07a3c' };
  function listReads() {
    var box = $('readList'); box.innerHTML = '';
    for (var i = 0; i < ESSAYS.length; i++) {
      (function (it, idx) {
        var c = document.createElement('div');
        c.className = 'card essay';
        c.innerHTML = '<span class="es-cat" style="background:' + (ESSAY_COLOR[it.cat] || '#8a6a2e') + '">' +
          esc(it.cat) + '</span><h3>' + esc(it.title) + '</h3><p class="es-lead">' + esc(it.lead) + '</p>';
        c.addEventListener('click', function () { openRead(idx); });
        box.appendChild(c);
      })(ESSAYS[i], i);
    }
  }
  function openRead(idx) {
    var it = ESSAYS[idx];
    $('readCat').style.background = ESSAY_COLOR[it.cat] || '#8a6a2e';
    $('readCat').textContent = it.cat + ' · 随笔';
    $('readTitle').textContent = it.title;
    $('readMeta').textContent = '心斋随笔 · 全文 ' + it.paras.join('').length + ' 字左右';
    var body = $('readBody'); body.innerHTML = '';
    for (var i = 0; i < it.paras.length; i++) {
      var p = document.createElement('p');
      p.textContent = it.paras[i];
      body.appendChild(p);
    }
    $('readOv').classList.remove('hidden');
  }
  $('readClose').addEventListener('click', function () { $('readOv').classList.add('hidden'); });
  $('readOv').addEventListener('click', function (e) { if (e.target === this) this.classList.add('hidden'); });
  listReads();

  /* ================= 问心 · 预约留号 ================= */
  var AREAS = [
    { v: '事业前程', p: '工作/事业卡住了，想找人捋一捋' },
    { v: '感情婚姻', p: '感情或婚姻里，有个解不开的结' },
    { v: '情绪内耗', p: '心里累、内耗大，想找人说说话' },
    { v: '自我怀疑 · 想成长', p: '老觉得自己不行，想找回自信和方向' },
    { v: '专注与效率', p: '静不下来、拖延、做事没效率' },
    { v: '家庭亲子', p: '家里、跟孩子之间的事想聊聊' },
    { v: '学业考试', p: '学习静不下心，考试压力大' }
  ];
  var askArea = AREAS[0].v;
  var LEAD = { area: askArea, msg: '', phone: '', more: '', qRaw: '', qa: '' };
  /* 问心浮层 · 自测带入区：列出日志，空则引导去测，满则每项可再测 */
  function goAskLab() {
    $('askOv').classList.add('hidden');
    goTab('lab');
    window.setTimeout(function () {
      var el = $('testList'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);
  }
  function retakeAskQuiz(id) {
    $('askOv').classList.add('hidden');
    goTab('lab');
    var i, it = null;
    for (i = 0; i < TESTS.length; i++) { if (TESTS[i].id === id) { it = TESTS[i]; break; } }
    if (!it) { goAskLab(); return; }
    window.setTimeout(function () { startQuiz(it); }, 160);
  }
  function syncAskBring() {
    var bb = $('askBringBox'); if (!bb) return;
    var qb = $('askQaBox');
    var show = (qb && qb.style.display !== 'none') || readQuizLog().length > 0;
    bb.style.display = show ? 'block' : 'none';
  }
  function renderAskLog() {
    var box = $('askLogBox'); if (!box) return;
    var arr = readQuizLog(), h = '', i, k;
    if (!arr.length) {
      h = '<div class="log-empty">测过「自测 · 照一照」会记在这里、随问心带给馆主；还没测过？' +
        '<button type="button" class="log-go" id="logGoTest">去照一照 →</button></div>';
    } else {
      h = '<div class="log-head"><span>最近测过的自测</span>' +
        '<button type="button" class="log-go" id="logMoreTest">＋ 再测一份</button></div>';
      for (i = 0; i < arr.length; i++) {
        var rec = arr[i];
        h += '<div class="ask-log-item"><span class="nm">' + esc(rec.name) +
          '<span class="rs">' + esc(rec.badge) + '</span>' +
          (rec.score ? '<span class="tm">' + esc(rec.score) + '</span>' : '') +
          '<span class="tm">　' + esc(rec.at || '') + '</span></span>' +
          '<button type="button" data-retake="' + esc(rec.id) + '">再测一次</button></div>';
      }
    }
    box.innerHTML = h;
    var go = $('logGoTest');
    if (go) go.addEventListener('click', goAskLab);
    var more = $('logMoreTest');
    if (more) more.addEventListener('click', goAskLab);
    var rts = box.querySelectorAll('[data-retake]');
    for (k = 0; k < rts.length; k++) {
      (function (b) {
        b.addEventListener('click', function () { retakeAskQuiz(b.getAttribute('data-retake')); });
      })(rts[k]);
    }
    syncAskBring();
  }
  /* 问心浮层 · 问一问带入区：客户在「问一问」点开条目后选“连同本条递给馆主”时展示 */
  function renderAskQa() {
    var box = $('askQaBox'); if (!box) return;
    if (!LEAD.qa) { box.style.display = 'none'; return; }
    box.style.display = 'block';
    box.innerHTML =
      '<div class="log-head"><span>「问一问」里对上的一问一答</span>' +
      '<button type="button" class="log-go" id="qaLogClear">不用带这条 ×</button></div>' +
      '<div class="ask-log-item"><span class="nm">问了：' + esc(LEAD.qRaw || LEAD.msg) + '</span></div>' +
      '<div class="ask-log-item"><span class="nm">答到：' + esc(LEAD.qa) + '</span></div>';
    var cl = $('qaLogClear');
    if (cl) cl.addEventListener('click', function () {
      LEAD.qRaw = ''; LEAD.qa = '';
      renderAskQa();
    });
    syncAskBring();
  }
  /* 问心浮层 · 历史心结：历次递过的都收在这，可逐条去掉，会随本次一并带给馆主 */
  function renderAskHist() {
    var box = $('askHistBox'); if (!box) return;
    var a = readAskHis();
    if (!a.length) { box.style.display = 'none'; box.innerHTML = ''; return; }
    box.style.display = 'block';
    var h = '<div class="log-head"><span>之前写过的结（随这次一起带给馆主）</span></div>';
    for (var i = 0; i < a.length; i++) {
      var lab = (a[i].t ? '[' + a[i].t + '] ' : '') + (a[i].msg || '');
      h += '<div class="ask-log-item"><span class="nm">' + esc(lab) + '</span>' +
        '<button type="button" class="log-go" data-hisdel="' + i + '">去掉 ×</button></div>';
    }
    box.innerHTML = h;
    var dels = box.querySelectorAll('[data-hisdel]');
    for (var k = 0; k < dels.length; k++) {
      (function (b) {
        b.addEventListener('click', function () {
          var a2 = readAskHis();
          a2.splice(Number(b.getAttribute('data-hisdel')), 1);
          saveAskHis(a2);
          renderAskHist();
          syncAskBring();
        });
      })(dels[k]);
    }
  }
  function buildAskChips() {
    var box = $('askChips'); box.innerHTML = '';
    for (var i = 0; i < AREAS.length; i++) {
      (function (a) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'area-chip' + (a.v === askArea ? ' on' : '');
        b.textContent = a.v;
        b.addEventListener('click', function () {
          askArea = a.v; LEAD.area = a.v;
          var chips = box.querySelectorAll('.area-chip');
          for (var k = 0; k < chips.length; k++) chips[k].classList.remove('on');
          this.classList.add('on');
        });
        box.appendChild(b);
      })(AREAS[i]);
    }
  }
  buildAskChips();
  function openAsk(preset) {
    if (preset) {
      askArea = preset; LEAD.area = preset; buildAskChips();
    }
    $('askDone').style.display = 'none';
    $('askForm').style.display = 'block';
    $('aMsg').value = LEAD.msg || readDraftMsg() || '';
    $('aPhone').value = LEAD.phone || '';
    $('aMore').value = LEAD.more || '';
    renderAskLog();
    renderAskQa();
    renderAskHist();
    $('askOv').classList.remove('hidden');
  }
  $('askFab').addEventListener('click', function () {
    LEAD.qRaw = ''; LEAD.qa = ''; /* 手动打开默认不带「问一问」条目 */
    /* 「问一问」里已写好的话 → 直接带进浮层「心里的结」，免去重抄 */
    var inkEl = $('qaInput');
    var inkW = inkEl ? inkEl.value.trim() : '';
    if (inkW) LEAD.msg = inkW;
    openAsk(null);
    var mEl = $('aMsg');
    if (mEl && LEAD.msg) { try { mEl.focus(); mEl.setSelectionRange(LEAD.msg.length, LEAD.msg.length); } catch (e) {} }
  });
  var amEl = $('aMsg');
  if (amEl) amEl.addEventListener('input', syncAskDraft);
  $('askClose').addEventListener('click', function () { $('askOv').classList.add('hidden'); });
  $('askOv').addEventListener('click', function (e) { if (e.target === this) this.classList.add('hidden'); });

  function buildLeadText() {
    var t = new Date();
    var time = t.getFullYear() + '-' + (t.getMonth() + 1 < 10 ? '0' : '') + (t.getMonth() + 1) + '-' +
      (t.getDate() < 10 ? '0' : '') + t.getDate() + ' ' + pad(t.getHours()) + ':' + pad(t.getMinutes());
    var L = ['【心斋 · 问心解结】', '想聊的方向：' + LEAD.area];
    L.push('心里的结：' + (LEAD.msg || '（暂未写，想当面说）'));
    var hisPrev = askHisPreview();
    if (hisPrev) { L.push('—— 之前写过的结 ——'); L.push(hisPrev); }
    if (LEAD.qa) {
      if (LEAD.qRaw && LEAD.qRaw !== LEAD.msg) L.push('曾在问一问里问过：「' + LEAD.qRaw + '」');
      L.push('对上条目：' + LEAD.qa);
    }
    L.push('手机：' + LEAD.phone);
    if (LEAD.more) L.push('补充（称呼/城市/微信/QQ/X 等）：' + LEAD.more);
    var ql = quizLogLines(5);
    if (ql) L.push('—— 近期自测（照一照）——\n' + ql);
    L.push('提交时间：' + time);
    return L.join('\n');
  }
  function saveLead() {
    try {
      var list = JSON.parse(localStorage.getItem(LEAD_KEY) || '[]');
      list.unshift({ t: todayStr(), lead: LEAD });
      if (list.length > 50) list.length = 50;
      localStorage.setItem(LEAD_KEY, JSON.stringify(list));
    } catch (e) {}
  }
  /* ====== 心结历史与草稿 ====== */
  function shortClock() {
    var d = new Date();
    return (d.getMonth() + 1 < 10 ? '0' : '') + (d.getMonth() + 1) + '-' +
      (d.getDate() < 10 ? '0' : '') + d.getDate() + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  function readAskHis() {
    try { var a = JSON.parse(localStorage.getItem(ASK_HIS_KEY) || '[]'); return (a instanceof Array) ? a : []; }
    catch (e) { return []; }
  }
  function saveAskHis(a) { try { localStorage.setItem(ASK_HIS_KEY, JSON.stringify(a)); } catch (e) {} }
  /* 递出一笔时入账：跟上一句相同则不重复记 */
  function addAskHis(msg) {
    if (!msg) return;
    var a = readAskHis();
    if (a.length && a[0].msg === msg) return;
    a.unshift({ t: shortClock(), msg: msg });
    if (a.length > 30) a.length = 30;
    saveAskHis(a);
  }
  /* 草稿：浮层里最后一次输入的内容，关了再开/刷新都还在 */
  function readDraftMsg() {
    try { var d = JSON.parse(localStorage.getItem(ASK_DRAFT_KEY) || 'null'); return (d && d.msg) ? d.msg : ''; }
    catch (e) { return ''; }
  }
  function syncAskDraft() {
    var m = $('aMsg'); if (!m) return;
    LEAD.msg = m.value.trim(); /* 跟着输入走：再开浮层还是最后一次写的话 */
    try { localStorage.setItem(ASK_DRAFT_KEY, JSON.stringify({ msg: m.value })); } catch (e) {}
  }
  /* 历次心结里、与本次这句不同的一并拼进发送文本 */
  function askHisPreview() {
    var a = readAskHis(), cur = LEAD.msg || '', out = [], i;
    for (i = 0; i < a.length; i++) {
      if (!a[i].msg || a[i].msg === cur) continue;
      out.push((a[i].t ? '[' + a[i].t + '] ' : '') + a[i].msg);
    }
    return out.join('\n');
  }
  $('askSubmit').addEventListener('click', function () {
    var honeyEl = $('honey');
    var honey = honeyEl ? honeyEl.value.trim() : '';
    if (honey) { toast('心结已妥投 ✓'); $('askOv').classList.add('hidden'); return; } // 机器人陷阱：填了蜜罐直接丢弃
    LEAD.msg = $('aMsg').value.trim();
    LEAD.phone = $('aPhone').value.replace(/\D/g, '');
    LEAD.more = $('aMore').value.trim();
    if (!/^1\d{10}$/.test(LEAD.phone)) { toast('手机号必填：请留 11 位手机号（1 开头），馆主才好回电陪你聊'); return; }
    if (!LEAD.msg) {
      toast('心里的结还没写——往下填一句，馆主才知道怎么陪你聊');
      var m = $('aMsg');
      if (m) { m.focus(); m.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      return;
    }
    addAskHis(LEAD.msg);
    renderAskHist();
    saveLead();
    var text = buildLeadText();
    var hasEp = !!(SHOP.formEndpoint && /^https?:/i.test(SHOP.formEndpoint));
    var showDone = function (delivered) {
      var ok = $('askDone');
      $('askForm').style.display = 'none';
      ok.style.display = 'block';
      ok.innerHTML =
        '<div class="ok-seal">✦</div>' +
        '<div class="done-txt"><b>' + (delivered ? '心结已妥投 ✓' : '这盏灯，馆主记下了') + '</b><br>' +
        (delivered
          ? (LEAD.phone
              ? '你的手机号与心结都已送到馆主那里，1~2 日内会打给你，陪你聊上 10 分钟。'
              : '你的心结已送到馆主那里，1~2 日内会用你留的方式回你。')
          : '在线投递没打通，用下面这段发我也一样：微信添加 <b>' + esc(SHOP.wxId || '馆主微信') + '</b> 发过去，或点下方按钮用邮箱发送。') + '</div>' +
        (SHOP.wxPic ? '<img class="wx-img" src="' + esc(SHOP.wxPic) + '" onerror="this.style.display=\'none\'" alt="微信">' : '') +
        '<div class="copy-area" id="leadText">' + esc(text) + '</div>' +
        '<div class="btn-line">' +
          '<button class="mini-btn" id="cpLead">复制这段，发给我</button>' +
          (SHOP.wxId ? '<button class="mini-btn" id="cpWx">复制微信 ' + esc(SHOP.wxId) + '</button>' : '') +
          (SHOP.email ? '<button class="mini-btn" id="mailLead">改用邮箱发送</button>' : '') +
        '</div>' +
        '<div style="text-align:center; margin-top:12px;"><button class="mini-btn" id="doneClose" style="letter-spacing:4px; padding:8px 34px;">收 下</button></div>';
      $('cpLead').addEventListener('click', function () { copyText(text, '预约信息已复制'); });
      var cw = $('cpWx');
      if (cw) cw.addEventListener('click', function () { copyText(SHOP.wxId, '微信号已复制'); });
      var ml = $('mailLead');
      if (ml) ml.addEventListener('click', function () {
        var subj = (SHOP.emailSubject || '心斋·问心') + ' · 想聊的方向：' + LEAD.area;
        window.location.href = 'mailto:' + encodeURIComponent(SHOP.email || '') +
          '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(text);
      });
      $('doneClose').addEventListener('click', function () { $('askOv').classList.add('hidden'); });
    };
    if (hasEp) {
      var sb = $('askSubmit');
      sb.disabled = true; sb.textContent = '递 送 中…';
      var done = function (okFlag) {
        sb.disabled = false; sb.textContent = '递 心 结 · 约 回 访';
        showDone(okFlag);
      };
      try {
        fetch(SHOP.formEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            _subject: '心斋预约·' + LEAD.area,
            _captcha: 'false',
            _honey: honey,
            area: LEAD.area,
            phone: LEAD.phone,
            more: LEAD.more || '',
            msg: LEAD.msg || '',
            qRaw: LEAD.qRaw || '',
            qa: LEAD.qa || '',
            hist: askHisPreview() || '',
            quizlog: quizLogLines(5)
          })
        }).then(function (r) { done(r.ok); })
          .catch(function () { done(false); });
      } catch (e) { done(false); }
    } else {
      showDone(false);
    }
  });

  /* ================= 悬浮疗愈 · 静心纯音乐播放器 =================
   * 已配 3 首疗愈系纯音乐（audio/ 本地文件）：
   * Kevin MacLeod · incompetech.com · CC BY 3.0（署名见面板底部）。
   * 想换曲就把 file 改成本机 mp3 路径或 https 直链。 */
  /* 曲目按「倒序」排布：默认从《静心·冥想》起，03 → 02 → 01 → 03 … 循环 */
  var CALM_TRACKS = [
    { name: '静心 · 冥想', note: 'Meditation Impromptu 01 · 柔缓钢琴', file: 'audio/03-meditation1.mp3' },
    { name: '禅定 · 长音', note: 'Long Note Two · 静坐冥想', file: 'audio/02-longnote2.mp3' },
    { name: '疗愈 · 微风', note: 'Healing · 氛围疗愈', file: 'audio/01-healing.mp3' }
  ];
  var mpA = $('museAudio'), mpDisc = $('museDisc'), mpPanel = $('musePanel'),
      mpList = $('museList'), mpPlay = $('musePlay'), mpPrev = $('musePrev'),
      mpNext = $('museNext'), mpMute = $('museMute'), mpVol = $('museVol');
  var mpCur = 0, MP_KEY2 = 'xinzai_muse_v1';
  function mpVolUi() {
    var v = parseInt(mpVol.value, 10) || 0;
    mpA.volume = Math.min(1, v / 100);
    var mutedNow = !!mpA.muted || v === 0;
    mpMute.classList.toggle('mute-off', mutedNow);
    if (mpDisc) {
      mpDisc.classList.toggle('mute', mutedNow);
      mpDisc.title = mutedNow ? '已静音 · 点此出声' : '点此静音';
    }
  }
  function mpSync() { mpVolUi(); mpUi(); }
  function mpSaveVol() {
    try { localStorage.setItem(MP_KEY2, JSON.stringify({ v: parseInt(mpVol.value, 10) || 0 })); } catch (e) {}
  }
  try {
    var _mv = JSON.parse(localStorage.getItem(MP_KEY2) || '{}');
    if (_mv && _mv.v >= 0 && _mv.v <= 100) mpVol.value = _mv.v;
  } catch (e) {}
  mpVolUi();
  mpVol.addEventListener('input', function () {
    mpA.muted = false; mpVolUi(); mpSaveVol();
  });
  mpMute.addEventListener('click', function () {
    if (mpA.muted) {
      mpA.muted = false;
      if ((parseInt(mpVol.value, 10) || 0) === 0) { mpVol.value = 60; mpSaveVol(); }
    } else { mpA.muted = true; }
    mpVolUi();
  });
  function mpUi() {
    var playing = mpA && mpA.currentSrc && !mpA.paused && !mpA.ended;
    if (mpPlay) mpPlay.textContent = playing ? '❚❚' : '▶';
    if (mpDisc) mpDisc.classList.toggle('on', playing);
  }
  function mpRender() {
    if (!mpList) return;
    mpList.innerHTML = '';
    for (var i = 0; i < CALM_TRACKS.length; i++) {
      (function (t, n) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'muse-track' + (n === mpCur ? ' on' : '');
        b.title = t.note || '';
        var nm = document.createElement('b'); nm.textContent = t.name;
        var nt = document.createElement('small');
        nt.textContent = (t.note || '') + (t.file ? '' : ' · 待配音频');
        b.appendChild(nm); b.appendChild(nt);
        b.addEventListener('click', function () { mpPlayAt(n); });
        mpList.appendChild(b);
      })(CALM_TRACKS[i], i);
    }
  }
  function mpPlayAt(i, quiet) {
    if (!CALM_TRACKS.length) return;
    mpCur = ((i % CALM_TRACKS.length) + CALM_TRACKS.length) % CALM_TRACKS.length;
    mpRender();
    var t = CALM_TRACKS[mpCur];
    if (!t.file) {
      toast('这首还没配好音频：在 app.js 的 CALM_TRACKS 里填 mp3 地址即可');
      mpUi(); return;
    }
    mpA.src = t.file;
    var p = mpA.play();
    if (p && p.catch) p.catch(function () {
      if (!quiet) toast('音乐没能播放：检查音频地址是否可访问');
    });
  }
  function mpToggle() {
    if (!mpA.src) { mpPlayAt(mpCur); return; }
    if (mpA.paused) { mpA.play(); } else { mpA.pause(); }
  }
  function museOpen() { mpPanel.classList.add('open'); if (mpDisc) mpDisc.setAttribute('aria-expanded', 'true'); }
  function museClose() { mpPanel.classList.remove('open'); if (mpDisc) mpDisc.setAttribute('aria-expanded', 'false'); }
  var museWrap = mpDisc ? mpDisc.parentNode : null, museCloseTimer = null;
  if (mpDisc) {
    mpDisc.addEventListener('click', function () {
      museOpen();                                   /* 点开功能页 */
      if (!mpA.src) { mpPlayAt(mpCur); return; }
      if (mpA.muted) {                              /* 静音中 → 点一下出声 */
        mpA.muted = false;
        if (mpA.paused) { var p = mpA.play(); if (p && p.catch) p.catch(function () {}); }
      } else { mpA.muted = true; }                  /* 出声中 → 点一下静音 */
      mpSync();
    });
    mpDisc.addEventListener('mouseenter', museOpen);
  }
  if (museWrap) {
    museWrap.addEventListener('mouseleave', function () {
      clearTimeout(museCloseTimer);
      museCloseTimer = setTimeout(museClose, 380);  /* 鼠标离开界面后自动收起 */
    });
    museWrap.addEventListener('mouseenter', function () { clearTimeout(museCloseTimer); });
  }
  if (mpPlay) mpPlay.addEventListener('click', mpToggle);
  if (mpPrev) mpPrev.addEventListener('click', function () { mpPlayAt(mpCur - 1); });
  if (mpNext) mpNext.addEventListener('click', function () { mpPlayAt(mpCur + 1); });
  if (mpA) {
    mpA.addEventListener('playing', mpSync);
    mpA.addEventListener('pause', mpSync);
    /* 一曲自然播完 → 自动接下一首（按倒序曲目循环） */
    mpA.addEventListener('ended', function () { mpPlayAt(mpCur + 1); });
  }
  document.addEventListener('click', function (e) {
    if (!mpPanel.classList.contains('open')) return;
    var n = e.target, inside = false;
    while (n) { if (n.id === 'muse') { inside = true; break; } n = n.parentNode; }
    if (!inside) mpPanel.classList.remove('open');
  });
  mpRender();
  mpSync();
  /* 打开网页即自动播放：浏览器不许带声自动播放，故先静音起播；点小喇叭即出声 */
  (function () {
    var hinted = false;
    try { hinted = !!sessionStorage.getItem('xinzai_muse_hint'); } catch (e) {}
    mpA.muted = true;
    mpPlayAt(mpCur, true);
    mpSync();
    if (!hinted) {
      try { sessionStorage.setItem('xinzai_muse_hint', '1'); } catch (e) {}
      setTimeout(function () { toast('静心乐已静音起播 · 点左上角小喇叭即可出声'); }, 800);
    }
  })();

  /* ================= 邻馆入口（玄学馆） ================= */
  function bindHall(el) {
    if (!el) return;
    if (SHOP.hallUrl) {
      el.href = SHOP.hallUrl;
      el.target = '_blank';
      el.rel = 'noopener';
    } else {
      el.href = '#';
      el.addEventListener('click', function (e) {
        e.preventDefault();
        toast('玄学馆尚未上线，稍后再来串门');
      });
    }
  }
  var fh = $('footHall');
  if (fh) { fh.textContent = SHOP.hall || '深情猫玄学馆'; bindHall(fh); }
  bindHall($('sisterHall'));
})();
