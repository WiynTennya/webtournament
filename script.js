/* ================================================================
   STRINOVA TOURNAMENT — Main Script
   ================================================================ */

/* ── Constants ── */
var LS_KEY      = 'strinova_t_v17';
var SECRET_PASS = 'fuchsiabinigw';
var SECRET_N    = 8;
var DEF_ROUNDS  = ['Round 1', 'Round 2', 'Round 3', 'Semi Final', 'Final'];
var DEF_BG      = 'https://z-cdn-media.chatglm.cn/files/e0999d9b-98ce-4136-8576-824ca56be605.jpg?auth_key=1875058813-74c81c8300454a5cbfc0069d240419ba-0-ee882fb429c18d22a2a3d1ceea582665';

/* ── State ── */
var adminRd = 0, regUC = 5, isAdmin = false;
var clickCount = 0, clickTimer = null;
var editTeamId = null, editUC = 5, secretAttempts = 0;

var S = load();

function fresh() {
  return {
    phase: 'setup', name: '', maxTeams: 42,
    regOpen: false, deadline: null,
    rounds: DEF_ROUNDS.map(function (n, i) {
      return { num: i + 1, name: n, pool: [], matches: [] };
    }),
    teams: [], champion: null, bgImg: ''
  };
}

function load() {
  try {
    var d = JSON.parse(localStorage.getItem(LS_KEY));
    return d && d.phase ? d : fresh();
  } catch (e) { return fresh(); }
}

function save() { localStorage.setItem(LS_KEY, JSON.stringify(S)); }

/* ── Helpers ── */
function uid()   { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function team(id) { for (var i = 0; i < S.teams.length; i++) if (S.teams[i].id === id) return S.teams[i]; return null; }
function esc(s)  { var e = document.createElement('span'); e.textContent = s; return e.innerHTML; }

function fmtDate(v) {
  if (!v) return '';
  var d = new Date(v);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function applyBg() {
  document.body.style.backgroundImage = "url('" + (S.bgImg || DEF_BG) + "')";
  var el = document.getElementById('adm-bg');
  if (el) el.value = S.bgImg || '';
}

/* ================================================================
   SECRET ADMIN ACCESS
   ================================================================ */
var dotsEl = document.getElementById('click-dots');

document.getElementById('nav-brand').addEventListener('click', function () {
  if (isAdmin) { navigateTo('admin'); return; }

  var brand = document.getElementById('nav-brand');
  brand.classList.remove('pulse-glow');
  void brand.offsetWidth;
  brand.classList.add('pulse-glow');

  clickCount++;
  clearTimeout(clickTimer);
  clickTimer = setTimeout(function () {
    clickCount = 0;
    dotsEl.classList.remove('show');
    syncDots(0);
  }, 2000);

  if (clickCount >= 2) dotsEl.classList.add('show');
  syncDots(clickCount);

  if (clickCount >= SECRET_N) {
    clickCount = 0;
    dotsEl.classList.remove('show');
    syncDots(0);
    openTerminal();
  }
});

function syncDots(n) {
  var dots = dotsEl.querySelectorAll('span');
  for (var i = 0; i < dots.length; i++)
    dots[i].classList.toggle('filled', i < n);
}

function openTerminal() {
  secretAttempts = 0;
  document.getElementById('modal-wrap').innerHTML =
    '<div class="secret-overlay" id="secret-overlay">' +
      '<div class="secret-terminal">' +
        '<div class="terminal-header">' +
          '<div class="terminal-header-left">' +
            '<div class="terminal-dots"><span></span><span></span><span></span></div>' +
            '<span class="terminal-title">secure_access v3.1</span>' +
          '</div>' +
          '<button class="terminal-close" onclick="closeTerminal()"><i class="fas fa-times"></i></button>' +
        '</div>' +
        '<div class="terminal-body" id="sec-body">' +
          '<div style="text-align:center;margin-bottom:.8rem"><div class="classified-stamp">CLASSIFIED</div></div>' +
          '<div class="terminal-line" style="animation-delay:.3s">> INITIALIZING SECURE CONNECTION...</div>' +
          '<div class="terminal-line accent" style="animation-delay:.5s">> ENCRYPTED CHANNEL ESTABLISHED</div>' +
          '<div class="terminal-line" style="animation-delay:.7s">> AUTHENTICATION REQUIRED</div>' +
          '<div class="terminal-line danger" style="animation-delay:.9s">> UNAUTHORIZED ACCESS WILL BE LOGGED</div>' +
          '<div class="terminal-line" style="animation-delay:1.1s">> ENTER ACCESS CODE BELOW <span class="cursor-blink"></span></div>' +
          '<div class="secret-input-wrap">' +
            '<div class="secret-input-label">ACCESS CODE:</div>' +
            '<input type="password" class="secret-input" id="sec-pw" placeholder="__________" autocomplete="off" spellcheck="false">' +
            '<div id="sec-msg"></div>' +
          '</div>' +
          '<button class="secret-submit" onclick="verifyPw()"><i class="fas fa-lock" style="margin-right:.4rem"></i>AUTHENTICATE</button>' +
          '<div class="secret-footer">STRINOVA TOURNAMENT SYSTEM // LEVEL-3 CLEARANCE REQUIRED</div>' +
        '</div>' +
      '</div>' +
    '</div>';

  setTimeout(function () {
    var inp = document.getElementById('sec-pw');
    if (inp) inp.focus();
  }, 1500);
}

function verifyPw() {
  var inp = document.getElementById('sec-pw');
  var msg = document.getElementById('sec-msg');
  if (!inp) return;

  secretAttempts++;

  if (inp.value === SECRET_PASS) {
    document.getElementById('sec-body').innerHTML =
      '<div class="secret-granted">' +
        '<div class="check-icon"><i class="fas fa-check"></i></div>' +
        '<div class="granted-text">ACCESS GRANTED</div>' +
        '<div class="granted-sub">WELCOME, ADMINISTRATOR</div>' +
      '</div>';
    setTimeout(function () {
      closeTerminal();
      isAdmin = true;
      document.getElementById('nav-admin').style.display = '';
      navigateTo('admin');
      toast('Logged in as Admin', 's');
      renderAll();
    }, 1400);
  } else {
    inp.classList.add('error');
    setTimeout(function () { inp.classList.remove('error'); }, 500);
    inp.value = '';

    if (secretAttempts >= 5) {
      msg.innerHTML = '<div class="secret-denied">MAX ATTEMPTS REACHED</div>';
      setTimeout(closeTerminal, 1200);
    } else {
      msg.innerHTML = '<div class="secret-denied">ACCESS DENIED #' + secretAttempts + '</div>';
    }
  }
}

function closeTerminal() { document.getElementById('modal-wrap').innerHTML = ''; }

function adminOut() {
  isAdmin = false;
  document.getElementById('nav-admin').style.display = 'none';
  navigateTo('home');
  toast('Logged out', 'i');
}

/* ================================================================
   ADMIN SETTINGS
   ================================================================ */
function saveTName()    { var v = val('adm-name');  if (!v) return toast('Enter name', 'e'); S.name = v; save(); renderAll(); toast('Saved', 's'); }
function saveMax()      { S.maxTeams = clamp(parseInt(val('adm-max')) || 42, 2, 99); save(); renderAll(); toast('Saved', 's'); }
function saveDeadline() { S.deadline = val('adm-dl') || null; save(); renderAll(); toast('Saved', 's'); }
function saveBg()       { S.bgImg = val('adm-bg').trim(); save(); applyBg(); toast('Background updated', 's'); }

function saveRounds() {
  var n = clamp(parseInt(val('adm-rounds')) || 5, 2, 10);
  var old = S.rounds;
  S.rounds = [];

  for (var i = 0; i < n; i++) {
    var e = old[i];
    S.rounds.push(e
      ? { num: i + 1, name: e.name, pool: e.pool, matches: e.matches }
      : { num: i + 1, name: 'Round ' + (i + 1), pool: [], matches: [] }
    );
  }

  /* Auto-name last two rounds */
  for (var j = 0; j < n; j++) {
    if (j === n - 2)      S.rounds[j].name = 'Semi Final';
    else if (j === n - 1) S.rounds[j].name = 'Final';
    else                   S.rounds[j].name = 'Round ' + (j + 1);
  }

  if (adminRd >= n) adminRd = n - 1;
  save(); renderAll(); toast('Rounds: ' + n, 's');
}

function openReg()  { S.regOpen = true;  if (S.phase === 'setup') S.phase = 'registration'; save(); renderAll(); toast('Registration opened', 's'); }
function closeReg() { S.regOpen = false; save(); renderAll(); toast('Registration closed', 's'); }

function startTourn() {
  if (!S.teams.length) return toast('No teams', 'e');
  S.phase = 'active';
  S.regOpen = false;
  S.rounds[0].pool = S.teams.map(function (t) { return t.id; });
  save(); renderAll(); toast('Tournament started!', 's');
}

function confirmReset() {
  showModal(
    '<h2 class="fd text-sm font-bold mb-2">Reset Tournament?</h2>' +
    '<p class="text-sm mb-5" style="color:var(--muted)">All data will be deleted.</p>' +
    '<div class="flex gap-2 justify-center">' +
      '<button class="btn btn-s btn-sm" onclick="closeModal()">Cancel</button>' +
      '<button class="btn btn-sm" style="background:var(--danger);color:#fff" onclick="closeModal();doReset()">Reset</button>' +
    '</div>'
  );
}

function doReset() { S = fresh(); save(); renderAll(); navigateTo('home'); toast('Reset', 'i'); }

/* ================================================================
   REGISTRATION
   ================================================================ */
function addRegUser()    { if (regUC >= 5) return; regUC++; buildRegForm(); }
function removeRegUser(n) { if (n <= 1) return; regUC = n - 1; buildRegForm(); }

function buildRegForm() {
  var box = document.getElementById('r-users');
  var html = '';

  for (var i = 1; i <= regUC; i++) {
    var label = i === 1 ? 'Member 1 (Captain)' : 'Member ' + i;
    html +=
      '<div class="ublock">' +
        '<div class="flex items-center justify-between mb-2">' +
          '<span class="text-xs font-bold" style="color:var(--accent)">' + label + '</span>' +
          (i > 1 ? '<button class="btn btn-xs btn-d" onclick="removeRegUser(' + i + ')"><i class="fas fa-times"></i></button>' : '') +
        '</div>' +
        '<div class="grid grid-cols-1 sm:grid-cols-3 gap-2">' +
          '<input class="inp" id="r-u' + i + '-sn" placeholder="Strinova IGN">' +
          '<input class="inp" id="r-u' + i + '-id" placeholder="Game ID">' +
          '<input class="inp" id="r-u' + i + '-dn" placeholder="Discord Name">' +
        '</div>' +
      '</div>';
  }

  box.innerHTML = html;
  document.getElementById('btn-addu').style.display = regUC >= 5 ? 'none' : '';
}

function submitTeam() {
  if (!S.regOpen)                return toast('Closed', 'e');
  if (S.phase !== 'registration') return toast('Not available', 'e');
  if (S.deadline && new Date() > new Date(S.deadline)) return toast('Deadline passed', 'e');
  if (S.teams.length >= S.maxTeams) return toast('Full', 'e');

  var tn = val('r-tn').trim();
  if (!tn) return toast('Enter name', 'e');

  for (var c = 0; c < S.teams.length; c++) {
    if (S.teams[c].name.toLowerCase() === tn.toLowerCase()) return toast('Taken', 'e');
  }

  var users = [];
  for (var i = 1; i <= regUC; i++) {
    var sn = (val('r-u' + i + '-sn') || '').trim();
    var id = (val('r-u' + i + '-id') || '').trim();
    var dn = (val('r-u' + i + '-dn') || '').trim();
    if (i === 1 && !sn) return toast('Captain IGN required', 'e');
    if (sn || id || dn) users.push({ sn: sn, id: id, dn: dn });
  }

  if (!users.length) return toast('Fill 1 member', 'e');

  S.teams.push({ id: uid(), name: tn, users: users });
  save(); renderAll(); toast('"' + tn + '" registered!', 's');

  document.getElementById('r-tn').value = '';
  regUC = 5;
  buildRegForm();
}

/* ================================================================
   EDIT TEAM
   ================================================================ */
function openEditTeam(tid) {
  if (!S.regOpen && !isAdmin) return toast('Locked', 'e');
  var t = team(tid);
  if (!t) return;

  editTeamId = tid;
  editUC = clamp(t.users.length, 1, 5);

  showModal(
    '<h2 class="fd text-sm font-bold mb-3">Edit Team</h2>' +
    '<label class="block text-sm font-medium mb-1" style="color:var(--muted);text-align:left">Team Name</label>' +
    '<input class="inp mb-4" id="edit-tn">' +
    '<div id="edit-users"></div>' +
    '<div style="text-align:center;margin-bottom:.8rem">' +
      '<button class="btn btn-s btn-sm" id="btn-edit-addu" onclick="addEditUser()">Add Member</button>' +
    '</div>' +
    '<div class="flex gap-2 justify-center">' +
      '<button class="btn btn-s btn-sm" onclick="closeModal()">Cancel</button>' +
      '<button class="btn btn-p btn-sm" onclick="saveEditTeam()">Save</button>' +
    '</div>'
  );

  document.getElementById('edit-tn').value = t.name;
  buildEditForm();
}

function addEditUser()    { if (editUC >= 5) return; editUC++; buildEditForm(); }
function removeEditUser(n) { if (n <= 0) return; editUC = n; buildEditForm(); }

function buildEditForm() {
  var t = team(editTeamId);
  if (!t) return;
  var box = document.getElementById('edit-users');
  if (!box) return;

  var html = '';
  for (var i = 0; i < editUC; i++) {
    var u = t.users[i] || {};
    var label = i === 0 ? 'Captain' : 'Member ' + (i + 1);
    html +=
      '<div class="ublock">' +
        '<div class="flex items-center justify-between mb-2">' +
          '<span class="text-xs font-bold" style="color:var(--accent)">' + label + '</span>' +
          (i > 0 ? '<button class="btn btn-xs btn-d" onclick="removeEditUser(' + i + ')"><i class="fas fa-times"></i></button>' : '') +
        '</div>' +
        '<div class="grid grid-cols-1 sm:grid-cols-3 gap-2">' +
          '<input class="inp" id="e-u' + i + '-sn" value="' + esc(u.sn || '') + '" placeholder="IGN">' +
          '<input class="inp" id="e-u' + i + '-id" value="' + esc(u.id || '') + '" placeholder="Game ID">' +
          '<input class="inp" id="e-u' + i + '-dn" value="' + esc(u.dn || '') + '" placeholder="Discord">' +
        '</div>' +
      '</div>';
  }

  box.innerHTML = html;
  var btn = document.getElementById('btn-edit-addu');
  if (btn) btn.style.display = editUC >= 5 ? 'none' : '';
}

function saveEditTeam() {
  var t = team(editTeamId);
  if (!t) return;

  var nn = val('edit-tn').trim();
  if (!nn) return toast('Name required', 'e');

  for (var c = 0; c < S.teams.length; c++) {
    if (S.teams[c].id !== editTeamId && S.teams[c].name.toLowerCase() === nn.toLowerCase())
      return toast('Taken', 'e');
  }

  var users = [];
  for (var i = 0; i < editUC; i++) {
    var sn = (val('e-u' + i + '-sn') || '').trim();
    var id = (val('e-u' + i + '-id') || '').trim();
    var dn = (val('e-u' + i + '-dn') || '').trim();
    if (i === 0 && !sn) return toast('Captain IGN required', 'e');
    if (sn || id || dn) users.push({ sn: sn, id: id, dn: dn });
  }

  if (!users.length) return toast('Fill 1 member', 'e');

  t.name = nn;
  t.users = users;
  save(); closeModal(); renderAll(); toast('"' + nn + '" updated!', 's');
}

/* ================================================================
   POOL & MATCHES
   ================================================================ */
function addToPool(rn, tid) {
  var r = round(rn);
  if (!r) return;
  if (r.pool.indexOf(tid) !== -1) return;
  for (var j = 0; j < r.matches.length; j++) {
    if (r.matches[j].t1 === tid || r.matches[j].t2 === tid) return toast('In match', 'e');
  }
  r.pool.push(tid);
  save(); renderAdmin();
}

function removeFromPool(rn, tid) {
  var r = round(rn);
  if (!r) return;
  r.pool = r.pool.filter(function (x) { return x !== tid; });
  save(); renderAdmin();
}

function createMatch(rn, t1, t2) {
  var r = round(rn);
  if (!r || t1 === t2) return;
  r.pool = r.pool.filter(function (x) { return x !== t1 && x !== t2; });
  r.matches.push({ id: uid(), t1: t1, t2: t2, winner: null });
  save(); renderAdmin(); toast('Match created', 's');
}

function removeMatch(rn, mid) {
  var r = round(rn);
  if (!r) return;

  var m = findMatch(r, mid);
  if (!m) return;

  /* Return teams to pool */
  if (m.t1) r.pool.push(m.t1);
  if (m.t2) r.pool.push(m.t2);

  /* Remove winner from next round pool */
  if (m.winner && rn < S.rounds.length) {
    var nr = round(rn + 1);
    if (nr) nr.pool = nr.pool.filter(function (x) { return x !== m.winner; });
  }

  r.matches = r.matches.filter(function (x) { return x.id !== mid; });
  save(); renderAdmin(); toast('Removed', 'i');
}

function declareWinner(rn, mid, wid) {
  var r = round(rn);
  var m = findMatch(r, mid);
  if (!m) return;

  var t = team(wid);
  showModal(
    '<h2 class="fd text-sm font-bold mb-1">Confirm Winner</h2>' +
    '<p class="text-xs mb-1" style="color:var(--muted)">' + r.name + '</p>' +
    '<p class="text-base font-bold mb-4" style="color:var(--accent)">' + (t ? esc(t.name) : '?') + '</p>' +
    '<div class="flex gap-2 justify-center">' +
      '<button class="btn btn-s btn-sm" onclick="closeModal()">Cancel</button>' +
      '<button class="btn btn-p btn-sm" onclick="execWin(' + rn + ',\'' + mid + '\',\'' + wid + '\')">Confirm</button>' +
    '</div>'
  );
}

function execWin(rn, mid, wid) {
  closeModal();
  var r = round(rn);
  var m = findMatch(r, mid);
  if (!m) return;

  m.winner = wid;

  /* Final round → crown champion */
  if (rn === S.rounds.length) {
    S.champion = wid;
    S.phase = 'completed';
    save(); renderAll();
    toast('Champion: ' + (team(wid) || {}).name || '', 's');
    return;
  }

  /* Advance winner to next round pool */
  var nr = round(rn + 1);
  if (nr && nr.pool.indexOf(wid) === -1) nr.pool.push(wid);

  save(); renderAll();
  toast(((team(wid) || {}).name || '?') + ' wins!', 's');
}

function shufflePool(rn) {
  var r = round(rn);
  if (!r) return;
  for (var i = r.pool.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = r.pool[i]; r.pool[i] = r.pool[j]; r.pool[j] = tmp;
  }
  save(); renderAdmin(); toast('Shuffled', 's');
}

function autoMatch(rn) {
  var r = round(rn);
  if (!r) return;
  var p = r.pool.slice();
  if (p.length < 2) return toast('Need 2+', 'e');

  r.pool = [];
  r.matches = [];

  for (var i = 0; i < p.length - 1; i += 2)
    r.matches.push({ id: uid(), t1: p[i], t2: p[i + 1], winner: null });

  if (p.length % 2 === 1) r.pool.push(p[p.length - 1]);
  save(); renderAdmin(); toast('Generated', 's');
}

function addAllToPool(rn) {
  var r = round(rn);
  if (!r) return;

  var inRound = {};
  r.pool.forEach(function (x) { inRound[x] = true; });
  r.matches.forEach(function (m) { if (m.t1) inRound[m.t1] = true; if (m.t2) inRound[m.t2] = true; });

  S.teams.forEach(function (t) {
    if (!inRound[t.id]) r.pool.push(t.id);
  });

  save(); renderAdmin(); toast('All added', 's');
}

function confirmDelTeam(tid) {
  if (!isAdmin) return;
  var t = team(tid);
  if (!t) return;

  showModal(
    '<h2 class="fd text-sm font-bold mb-2">Remove Team?</h2>' +
    '<p class="text-base font-bold mb-4" style="color:var(--accent)">' + esc(t.name) + '</p>' +
    '<div class="flex gap-2 justify-center">' +
      '<button class="btn btn-s btn-sm" onclick="closeModal()">Cancel</button>' +
      '<button class="btn btn-sm" style="background:var(--danger);color:#fff" onclick="closeModal();deleteTeam(\'' + tid + '\')">Remove</button>' +
    '</div>'
  );
}

function deleteTeam(tid) {
  S.teams = S.teams.filter(function (t) { return t.id !== tid; });

  S.rounds.forEach(function (r) {
    r.pool = r.pool.filter(function (x) { return x !== tid; });
    r.matches.forEach(function (m) {
      if (m.t1 === tid) m.t1 = null;
      if (m.t2 === tid) m.t2 = null;
      if (m.winner === tid) m.winner = null;
    });
    r.matches = r.matches.filter(function (m) { return m.t1 || m.t2; });
  });

  save(); renderAll(); toast('Removed', 'i');
}

/* ================================================================
   ADMIN PANEL HELPERS
   ================================================================ */
function admDoAdd() {
  var v = val('adm-sel');
  if (!v) return toast('Select team', 'e');
  addToPool(S.rounds[adminRd].num, v);
}

function admDoMatch() {
  var v1 = val('adm-m1'), v2 = val('adm-m2');
  if (!v1 || !v2) return toast('Select 2', 'e');
  if (v1 === v2)  return toast('Same team', 'e');
  createMatch(S.rounds[adminRd].num, v1, v2);
}

/* ================================================================
   RENDER — Master
   ================================================================ */
function renderAll() {
  renderNav();
  renderHome();
  renderRegister();
  renderTeams();
  renderBracket();
  if (isAdmin) renderAdmin();
  applyBg();
}

/* ── Nav ── */
function renderNav() {
  var tabs = document.querySelectorAll('.nt:not(#nav-admin)');
  for (var i = 0; i < tabs.length; i++) {
    var tab = tabs[i], p = tab.dataset.page;
    tab.classList.remove('dis');
    if (p === 'register' && !S.regOpen)       tab.classList.add('dis');
    if (p === 'teams'    && S.phase === 'setup') tab.classList.add('dis');
    if (p === 'bracket'  && S.phase === 'setup') tab.classList.add('dis');
  }
  document.getElementById('nav-title').textContent = S.name ? S.name.toUpperCase() : 'STRINOVA TOURNAMENT';
}

/* ── Home ── */
function renderHome() {
  var setup = document.getElementById('home-setup');
  var active = document.getElementById('home-active');

  if (S.phase === 'setup') { setup.style.display = ''; active.style.display = 'none'; return; }

  setup.style.display = 'none';
  active.style.display = '';
  document.getElementById('home-tname').textContent = S.name;

  /* Phase badge */
  var phases = {
    setup:       ['p-setup', 'Not Started'],
    registration:['p-reg',   'Registration'],
    active:      ['p-act',   'In Progress'],
    completed:   ['p-comp',  'Completed'],
    closed:      ['p-closed','Closed']
  };
  var pk = S.phase;
  if (!S.regOpen && S.phase === 'registration') pk = 'closed';
  var info = phases[pk] || phases.setup;
  var badge = document.getElementById('home-phase');
  badge.className = 'pb ' + info[0];
  badge.innerHTML = '<span class="pd"></span>' + info[1];

  document.getElementById('home-deadline').textContent = S.deadline ? 'Deadline: ' + fmtDate(S.deadline) : '';

  /* Stats */
  document.getElementById('st-t').textContent = S.teams.length + '/' + S.maxTeams;

  var activeRound = null;
  for (var r = 0; r < S.rounds.length; r++) {
    for (var m = 0; m < S.rounds[r].matches.length; m++) {
      if (!S.rounds[r].matches[m].winner) { activeRound = S.rounds[r]; break; }
    }
    if (activeRound) break;
  }
  document.getElementById('st-r').textContent = activeRound ? activeRound.name : '-';

  var totalM = 0, doneM = 0;
  for (var a = 0; a < S.rounds.length; a++) {
    totalM += S.rounds[a].matches.length;
    for (var b = 0; b < S.rounds[a].matches.length; b++) {
      if (S.rounds[a].matches[b].winner) doneM++;
    }
  }
  document.getElementById('st-m').textContent = totalM;
  document.getElementById('st-d').textContent = doneM;

  /* Champion */
  var champEl = document.getElementById('home-champ');
  if (S.phase === 'completed' && S.champion) {
    champEl.style.display = '';
    document.getElementById('champ-n').textContent = (team(S.champion) || {}).name || '?';
  } else {
    champEl.style.display = 'none';
  }

  /* Latest results */
  var results = [];
  S.rounds.forEach(function (r) {
    r.matches.forEach(function (m) {
      if (m.winner) results.push({ t1: team(m.t1), t2: team(m.t2), w: team(m.winner) });
    });
  });

  document.getElementById('home-res').innerHTML = results.length
    ? results.slice(-6).reverse().map(function (m) {
        var s1 = m.w && m.t1 && m.w.id === m.t1.id ? 'color:var(--accent);font-weight:700' : '';
        var s2 = m.w && m.t2 && m.w.id === m.t2.id ? 'color:var(--accent);font-weight:700' : '';
        return '<div class="flex items-center justify-between py-1 text-sm border-b" style="border-color:var(--border)">' +
          '<span style="' + s1 + '">' + (m.t1 ? esc(m.t1.name) : '?') + '</span>' +
          '<span class="fd text-xs" style="color:var(--muted)">VS</span>' +
          '<span style="' + s2 + '">' + (m.t2 ? esc(m.t2.name) : '?') + '</span></div>';
      }).join('')
    : '<p class="text-sm" style="color:var(--muted);text-align:center">No results yet.</p>';

  /* Round status */
  document.getElementById('home-rinfo').innerHTML = S.rounds.map(function (r) {
    var d = 0;
    for (var i = 0; i < r.matches.length; i++) if (r.matches[i].winner) d++;
    var allDone = r.matches.length > 0 && d === r.matches.length;
    var icon = allDone ? '<i class="fas fa-check-circle" style="color:var(--success)"></i> ' : '';
    var poolInfo = r.pool.length ? ' \u00B7 pool:' + r.pool.length : '';
    return '<div class="flex items-center justify-between py-1 text-sm border-b" style="border-color:var(--border)">' +
      '<span class="font-medium">' + icon + r.name + '</span>' +
      '<span style="color:var(--muted)">' + r.matches.length + ' \u00B7 ' + d + ' done' + poolInfo + '</span></div>';
  }).join('');
}

/* ── Register ── */
function renderRegister() {
  var canReg = S.regOpen && S.phase === 'registration';
  var passed = S.deadline && new Date() > new Date(S.deadline);
  var sub = '';

  if (passed && canReg)     sub = 'Deadline passed.';
  else if (!canReg)         sub = 'Closed.';
  else                      sub = '(' + S.teams.length + '/' + S.maxTeams + ')' + (S.deadline ? ' \u00B7 ' + fmtDate(S.deadline) : '');

  document.getElementById('reg-sub').textContent = sub;
  document.getElementById('btn-reg').disabled = !canReg || passed || S.teams.length >= S.maxTeams;

  document.getElementById('reg-list').innerHTML = S.teams.length
    ? S.teams.map(function (t, i) {
        return '<div class="flex items-center py-2 border-b" style="border-color:var(--border)">' +
          '<div class="flex-1 min-w-0">' +
            '<div class="text-sm font-semibold">' + esc(t.name) + '</div>' +
            '<div class="text-xs" style="color:var(--muted)">' + t.users.length + ' members</div>' +
          '</div>' +
          '<span class="fd text-xs" style="color:var(--muted)">#' + (i + 1) + '</span></div>';
      }).join('')
    : '<p class="text-sm" style="color:var(--muted);text-align:center">No teams yet.</p>';
}

/* ── Teams ── */
function renderTeams() {
  var grid  = document.getElementById('teams-g');
  var empty = document.getElementById('teams-empty');

  if (!S.teams.length) { grid.innerHTML = ''; empty.style.display = ''; return; }
  empty.style.display = 'none';

  grid.innerHTML = S.teams.map(function (t) {
    var isChamp = S.champion === t.id;
    var badge   = isChamp ? '<span class="text-xs font-bold" style="color:var(--gold)">CHAMPION</span>' : '';

    var editBtn = S.regOpen
      ? '<button class="btn btn-xs btn-s" onclick="openEditTeam(\'' + t.id + '\')">Edit</button>' : '';
    var delBtn  = isAdmin && S.phase !== 'completed'
      ? '<button class="btn btn-xs btn-d" onclick="confirmDelTeam(\'' + t.id + '\')" style="margin-left:.4rem">Remove</button>' : '';
    var actions = (editBtn || delBtn)
      ? '<div class="mt-3 pt-2 border-t" style="border-color:var(--border);text-align:center">' + editBtn + delBtn + '</div>' : '';

    var members = t.users.map(function (u, idx) {
      var label = idx === 0 ? 'Captain' : 'Member ' + (idx + 1);
      return '<div class="py-1.5 text-xs border-t" style="border-color:var(--border)">' +
        '<div style="color:var(--accent);font-weight:700;margin-bottom:.2rem;font-size:.65rem;letter-spacing:.5px;text-transform:uppercase">' + label + '</div>' +
        '<div style="color:var(--muted)">IGN: <span class="font-semibold" style="color:var(--fg)">' + (esc(u.sn) || '-') + '</span></div>' +
        '<div style="color:var(--muted)">ID: <span style="color:var(--fg)">' + (esc(u.id) || '-') + '</span></div>' +
        '<div style="color:var(--muted)">Discord: <span style="color:var(--fg)">' + (esc(u.dn) || '-') + '</span></div>' +
      '</div>';
    }).join('');

    return '<div class="card p-5 ' + (isChamp ? 'champ' : '') + '">' +
      '<div style="text-align:center;margin-bottom:.5rem">' +
        '<h3 class="fd text-sm font-bold">' + esc(t.name) + '</h3>' + badge +
      '</div>' + members + actions + '</div>';
  }).join('');
}

/* ── Bracket ── */
function renderBracket() {
  var area  = document.getElementById('brk-area');
  var empty = document.getElementById('brk-empty');

  var hasMatches = false;
  for (var r = 0; r < S.rounds.length; r++) {
    if (S.rounds[r].matches.length) { hasMatches = true; break; }
  }
  var isActive = S.phase === 'active' || S.phase === 'completed';

  if (!hasMatches && !isActive) { area.innerHTML = ''; empty.style.display = ''; return; }
  empty.style.display = 'none';

  /* Collect visible rounds */
  var vis = [];
  for (var r = 0; r < S.rounds.length; r++) {
    if (S.rounds[r].matches.length) vis.push(S.rounds[r]);
  }
  if (!vis.length) { area.innerHTML = '<div class="bk-wait">Waiting for matches to be created...</div>'; return; }

  /* Layout constants */
  var MW  = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--bk-mw')) || 180;
  var MH  = 50;   /* match height */
  var CG  = 44;   /* connector gap between columns */
  var RG  = 14;   /* gap between matches in same column */
  var HDR = 38;   /* header height */

  /* Calculate grid size */
  var r1Count = vis[0].matches.length;
  var gridH   = r1Count * MH + (r1Count - 1) * RG;
  var gridW   = (vis.length - 1) * (MW + CG) + MW;
  var totalH  = HDR + gridH + 16;

  /* Calculate match positions per round */
  var positions = [];

  for (var ri = 0; ri < vis.length; ri++) {
    var cx = ri * (MW + CG);
    var rp = [];

    if (ri === 0) {
      for (var mi = 0; mi < vis[ri].matches.length; mi++)
        rp.push({ x: cx, y: mi * (MH + RG) });
    } else {
      var prev = positions[ri - 1];
      for (var mi = 0; mi < vis[ri].matches.length; mi++) {
        var a = prev[mi * 2];
        var b = prev[mi * 2 + 1];
        if (a && b) {
          rp.push({ x: cx, y: (a.y + MH / 2 + b.y + MH / 2) / 2 - MH / 2 });
        } else {
          rp.push({ x: cx, y: a ? a.y : 0 });
        }
      }
    }

    positions.push(rp);
  }

  /* Build HTML */
  var html = '<div class="bracket-wrap"><div class="bracket-grid" style="width:' + gridW + 'px;height:' + totalH + 'px;">';

  /* ── Round headers ── */
  for (var ri = 0; ri < vis.length; ri++) {
    var rd     = vis[ri];
    var isFin  = rd.num === S.rounds.length;
    var done   = roundDone(rd);

    html += '<div class="bracket-hdr" style="left:' + (ri * (MW + CG)) + 'px;width:' + MW + 'px;">';
    html += '<div class="bracket-hdr-name' + (isFin ? ' fin' : '') + '">' + esc(rd.name) + '</div>';

    if (done && !isFin)            html += '<div class="bracket-hdr-sub done"><i class="fas fa-check-circle"></i> Done</div>';
    else if (isFin && S.phase === 'completed' && S.champion)
                                   html += '<div class="bracket-hdr-sub champ"><i class="fas fa-crown"></i> Champion</div>';
    else                           html += '<div class="bracket-hdr-sub">' + roundDoneCount(rd) + '/' + rd.matches.length + '</div>';

    html += '</div>';
  }

  /* ── SVG connectors ── */
  html += '<svg class="bracket-svg" style="top:' + HDR + 'px;height:' + gridH + 'px;" viewBox="0 0 ' + gridW + ' ' + gridH + '" preserveAspectRatio="xMidYMid meet">';

  for (var ri = 1; ri < vis.length; ri++) {
    var prev = positions[ri - 1];
    var curr = positions[ri];

    for (var mi = 0; mi < curr.length; mi++) {
      var a = prev[mi * 2];
      var b = prev[mi * 2 + 1];
      if (!a || !b) continue;

      var x1 = a.x + MW, y1 = a.y + MH / 2;
      var x2 = b.x + MW, y2 = b.y + MH / 2;
      var x3 = curr[mi].x, y3 = curr[mi].y + MH / 2;
      var mx = (x1 + x3) / 2;

      /* Top feeder → vertical → right */
      html += '<path d="M' + x1 + ',' + y1 + ' H' + mx + ' V' + y3 + ' H' + x3 + '" fill="none" stroke="rgba(14,165,233,.35)" stroke-width="1.5"/>';
      /* Bottom feeder → meets vertical */
      html += '<path d="M' + x2 + ',' + y2 + ' H' + mx + '" fill="none" stroke="rgba(14,165,233,.35)" stroke-width="1.5"/>';
    }
  }

  html += '</svg>';

  /* ── Match cards ── */
  for (var ri = 0; ri < vis.length; ri++) {
    var isFin = vis[ri].num === S.rounds.length;
    for (var mi = 0; mi < vis[ri].matches.length; mi++) {
      var p = positions[ri][mi];
      html += '<div class="bracket-match" style="left:' + p.x + 'px;top:' + (p.y + HDR) + 'px;animation-delay:' + (ri * .06 + mi * .03) + 's;">';
      html += matchCard(vis[ri].matches[mi], isFin);
      html += '</div>';
    }
  }

  html += '</div>';

  /* ── Pool chips ── */
  for (var ri = 0; ri < vis.length; ri++) {
    if (!vis[ri].pool.length) continue;
    var nextName = ri < vis.length - 1 ? vis[ri + 1].name : 'next';

    html += '<div class="bracket-pool">';
    html += '<div class="bracket-pool-lbl">Advancing to ' + esc(nextName) + ' (' + vis[ri].pool.length + ')</div>';
    html += '<div class="bracket-pool-chips">';

    for (var pi = 0; pi < vis[ri].pool.length; pi++) {
      var t = team(vis[ri].pool[pi]);
      if (t) html += '<span class="bracket-pool-chip">' + esc(t.name) + '</span>';
    }

    html += '</div></div>';
  }

  html += '</div>';
  area.innerHTML = html;
}

function matchCard(m, isFin) {
  var t1 = team(m.t1), t2 = team(m.t2);
  var t1W = m.winner === m.t1, t2W = m.winner === m.t2;
  var t1L = m.winner && !t1W,   t2L = m.winner && !t2W;

  var h = '<div class="bk-m' + (isFin ? ' fin' : '') + '">';
  h += '<div class="bk-t' + (t1W ? ' w' : '') + (t1L ? ' l' : '') + (!t1 ? ' tbd' : '') + '">' +
       '<span class="bk-t-n">' + (t1 ? esc(t1.name) : 'TBD') + '</span>' +
       '<span class="bk-t-chk"><i class="fas fa-check"></i></span></div>';
  h += '<div class="bk-t' + (t2W ? ' w' : '') + (t2L ? ' l' : '') + (!t2 ? ' tbd' : '') + '">' +
       '<span class="bk-t-n">' + (t2 ? esc(t2.name) : 'TBD') + '</span>' +
       '<span class="bk-t-chk"><i class="fas fa-check"></i></span></div>';

  if (isFin && m.winner) {
    var ct = team(m.winner);
    h += '<div class="bk-champ"><i class="fas fa-trophy" style="margin-right:.3rem"></i>' + (ct ? esc(ct.name) : '') + '</div>';
  }

  return h + '</div>';
}

/* ── Admin Panel ── */
function renderAdmin() {
  if (!isAdmin) return;

  /* Settings fields */
  setVal('adm-name', S.name || '');
  setVal('adm-max', S.maxTeams || 42);
  setVal('adm-dl', S.deadline || '');
  setVal('adm-rounds', S.rounds.length || 5);

  /* Registration status */
  document.getElementById('adm-reg-status').innerHTML = S.regOpen
    ? '<span class="pb p-reg"><span class="pd"></span>Open</span>'
    : '<span class="pb p-closed"><span class="pd"></span>Closed</span>';
  document.getElementById('btn-open-reg').disabled  = S.regOpen;
  document.getElementById('btn-close-reg').disabled = !S.regOpen;

  /* Round tabs */
  document.getElementById('admin-rtabs').innerHTML = S.rounds.map(function (r, i) {
    var done = roundDone(r);
    var icon = done ? ' <i class="fas fa-check-circle" style="color:var(--success);font-size:.6rem"></i>' : '';
    return '<button class="rtab ' + (adminRd === i ? 'act' : '') + '" onclick="adminRd=' + i + ';renderAdmin()">' + r.name + icon + '</button>';
  }).join('');

  /* Current round content */
  var rd = S.rounds[adminRd];
  if (!rd) return;

  /* Build lists of available and pooled teams */
  var inRound = {};
  rd.pool.forEach(function (x) { inRound[x] = true; });
  rd.matches.forEach(function (m) { if (m.t1) inRound[m.t1] = true; if (m.t2) inRound[m.t2] = true; });

  var avail  = S.teams.filter(function (t) { return !inRound[t.id]; });
  var pooled = rd.pool.map(function (id) { return team(id); }).filter(Boolean);
  var dc     = roundDoneCount(rd);

  /* Selects */
  var optEmpty = '<option value="">-- Select --</option>';
  var optAvail = optEmpty + avail.map(function (t) { return '<option value="' + t.id + '">' + esc(t.name) + '</option>'; }).join('');
  var optPool1 = '<option value="">Team 1</option>' + pooled.map(function (t) { return '<option value="' + t.id + '">' + esc(t.name) + '</option>'; }).join('');
  var optPool2 = '<option value="">Team 2</option>' + pooled.map(function (t) { return '<option value="' + t.id + '">' + esc(t.name) + '</option>'; }).join('');

  /* Pool chips */
  var poolChips = rd.pool.map(function (tid) {
    var t = team(tid);
    return t ? '<span class="chip">' + esc(t.name) + '<button onclick="removeFromPool(' + rd.num + ',\'' + tid + '\')">&times;</button></span>' : '';
  }).join('');

  /* Match cards */
  var matchHTML = rd.matches.map(function (m, mi) {
    var t1 = team(m.t1), t2 = team(m.t2);
    var d1 = m.winner && m.winner !== m.t1 ? 'opacity:.35' : '';
    var d2 = m.winner && m.winner !== m.t2 ? 'opacity:.35' : '';
    var w1 = m.winner === m.t1 ? 'color:var(--accent);font-weight:700' : '';
    var w2 = m.winner === m.t2 ? 'color:var(--accent);font-weight:700' : '';

    var bottom;
    if (m.winner) {
      var wt = team(m.winner);
      bottom = '<div class="mt-2 text-xs font-bold" style="color:var(--gold);text-align:center"><i class="fas fa-crown"></i> ' + (wt ? esc(wt.name) : '?') + '</div>';
    } else {
      bottom = '<div class="mt-2 flex flex-wrap gap-1.5 justify-center">' +
        '<button class="btn btn-xs btn-p" onclick="declareWinner(' + rd.num + ',\'' + m.id + '\',\'' + m.t1 + '\')" ' + (!m.t1 ? 'disabled' : '') + '>' + (t1 ? esc(t1.name) : '?') + '</button>' +
        '<button class="btn btn-xs btn-p" onclick="declareWinner(' + rd.num + ',\'' + m.id + '\',\'' + m.t2 + '\')" ' + (!m.t2 ? 'disabled' : '') + '>' + (t2 ? esc(t2.name) : '?') + '</button>' +
        '<button class="btn btn-xs btn-d" onclick="removeMatch(' + rd.num + ',\'' + m.id + '\')"><i class="fas fa-trash-alt"></i></button>' +
      '</div>';
    }

    return '<div class="mcard mb-2">' +
      '<div class="flex items-center text-sm" style="' + d1 + '"><span class="fd text-xs" style="color:var(--muted);min-width:18px;margin-right:.3rem">#' + (mi + 1) + '</span><span class="flex-1" style="' + w1 + '">' + (t1 ? esc(t1.name) : '?') + '</span></div>' +
      '<div class="flex items-center text-sm" style="' + d2 + '"><span style="min-width:18px;margin-right:.3rem"></span><span class="fd text-xs" style="color:var(--muted);margin-right:.3rem">VS</span><span class="flex-1" style="' + w2 + '">' + (t2 ? esc(t2.name) : '?') + '</span></div>' +
      bottom + '</div>';
  }).join('');

  /* Next round info */
  var nextInfo = '';
  if (rd.num < S.rounds.length) {
    var nr  = S.rounds[rd.num];
    var allDone = roundDone(rd);
    nextInfo = '<div class="mt-4 pt-3 border-t" style="border-color:var(--border);text-align:center">' +
      '<div class="text-xs font-bold mb-1" style="color:var(--gold)">NEXT: ' + nr.name + '</div>' +
      '<div class="text-xs" style="color:' + (allDone ? 'var(--success)' : 'var(--muted)') + '">' +
        (allDone ? 'Ready (' + nr.pool.length + ' advanced)' : 'Complete all matches') +
      '</div></div>';
  }

  /* Assemble */
  document.getElementById('admin-rcontent').innerHTML =
    '<div class="flex flex-wrap items-center gap-3 mb-4 justify-center">' +
      '<span class="fd text-sm font-bold" style="color:var(--accent)">' + rd.name + '</span>' +
      '<span class="text-xs" style="color:var(--muted)">Pool:' + rd.pool.length + ' Match:' + rd.matches.length + ' Done:' + dc + '</span>' +
    '</div>' +

    /* Add to pool */
    '<div class="mb-4">' +
      '<div class="text-xs font-bold mb-2" style="color:var(--blue);text-align:center">ADD TO POOL</div>' +
      '<div class="flex flex-wrap gap-2 items-center justify-center">' +
        '<select class="inp" style="max-width:200px" id="adm-sel">' + optAvail + '</select>' +
        '<button class="btn btn-bl btn-sm" onclick="admDoAdd()">Add</button>' +
        '<button class="btn btn-s btn-sm" onclick="addAllToPool(' + rd.num + ')">Add All</button>' +
      '</div>' +
    '</div>' +

    /* Pool */
    (rd.pool.length
      ? '<div class="mb-4">' +
          '<div class="flex items-center justify-between mb-2">' +
            '<span class="text-xs font-bold" style="color:var(--blue)">POOL (' + rd.pool.length + ')</span>' +
            '<div class="flex gap-1.5">' +
              '<button class="btn btn-xs btn-s" onclick="shufflePool(' + rd.num + ')">Shuffle</button>' +
              '<button class="btn btn-xs btn-p" onclick="autoMatch(' + rd.num + ')">Auto Match</button>' +
            '</div>' +
          '</div>' +
          '<div class="flex flex-wrap gap-1.5 justify-center">' + poolChips + '</div>' +
        '</div>'
      : '') +

    /* Matchup creator */
    (rd.pool.length >= 2
      ? '<div class="mb-4 p-3 rounded-lg" style="background:rgba(59,130,246,.05);border:1px dashed rgba(59,130,246,.2)">' +
          '<div class="text-xs font-bold mb-2" style="color:var(--blue);text-align:center">MATCHUP</div>' +
          '<div class="flex flex-wrap gap-2 items-center justify-center">' +
            '<select class="inp" style="max-width:150px" id="adm-m1">' + optPool1 + '</select>' +
            '<span class="fd text-xs font-bold" style="color:var(--muted)">VS</span>' +
            '<select class="inp" style="max-width:150px" id="adm-m2">' + optPool2 + '</select>' +
            '<button class="btn btn-sm btn-p" onclick="admDoMatch()">Create</button>' +
          '</div>' +
        '</div>'
      : '') +

    /* Matches list */
    (rd.matches.length
      ? '<div><div class="text-xs font-bold mb-2" style="color:var(--blue);text-align:center">MATCHES</div>' + matchHTML + '</div>'
      : '') +

    nextInfo;
}

/* ================================================================
   UTILITY FUNCTIONS
   ================================================================ */
function val(id) {
  var el = document.getElementById(id);
  return el ? el.value : '';
}

function setVal(id, v) {
  var el = document.getElementById(id);
  if (el) el.value = v;
}

function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }

function round(n) { return S.rounds[n - 1] || null; }

function findMatch(r, mid) {
  for (var i = 0; i < r.matches.length; i++) {
    if (r.matches[i].id === mid) return r.matches[i];
  }
  return null;
}

function roundDoneCount(r) {
  var c = 0;
  for (var i = 0; i < r.matches.length; i++) if (r.matches[i].winner) c++;
  return c;
}

function roundDone(r) { return r.matches.length > 0 && roundDoneCount(r) === r.matches.length; }

/* ================================================================
   TOAST & MODAL
   ================================================================ */
function toast(msg, type) {
  type = type || 'i';
  var cls = { s: 'toast-s', e: 'toast-e', i: 'toast-i' };
  var ico = { s: 'check-circle', e: 'times-circle', i: 'info-circle' };

  var el = document.createElement('div');
  el.className = 'toast ' + (cls[type] || cls.i);
  el.innerHTML = '<i class="fas fa-' + (ico[type] || ico.i) + '"></i> ' + msg;
  document.getElementById('toast-wrap').appendChild(el);
  setTimeout(function () { el.remove(); }, 3200);
}

function showModal(html) {
  document.getElementById('modal-wrap').innerHTML =
    '<div class="mo" onclick="if(event.target===this)closeModal()"><div class="mc">' + html + '</div></div>';
}

function closeModal() { document.getElementById('modal-wrap').innerHTML = ''; }

/* ================================================================
   NAVIGATION
   ================================================================ */
function navigateTo(page) {
  var pages = document.querySelectorAll('.page');
  for (var i = 0; i < pages.length; i++) pages[i].classList.remove('act');

  var tabs = document.querySelectorAll('.nt');
  for (var j = 0; j < tabs.length; j++) tabs[j].classList.remove('act');

  var pg = document.getElementById('pg-' + page);
  if (pg) pg.classList.add('act');

  var tb = document.querySelector('.nt[data-page="' + page + '"]');
  if (tb && !tb.classList.contains('dis')) tb.classList.add('act');
}

/* Tab click handlers */
var allTabs = document.querySelectorAll('.nt');
for (var i = 0; i < allTabs.length; i++) {
  (function (tab) {
    tab.addEventListener('click', function () {
      if (tab.classList.contains('dis')) return;
      if (tab.dataset.page === 'admin' && !isAdmin) return;
      navigateTo(tab.dataset.page);
    });
  })(allTabs[i]);
}

/* Global keyboard */
document.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    var secPw = document.getElementById('sec-pw');
    if (secPw && secPw === document.activeElement) verifyPw();
  }
  if (e.key === 'Escape') {
    if (document.getElementById('secret-overlay')) closeTerminal();
    else closeModal();
  }
});

/* Click outside secret overlay */
document.addEventListener('click', function (e) {
  var overlay = document.getElementById('secret-overlay');
  if (overlay && e.target === overlay) closeTerminal();
});

/* ================================================================
   INIT
   ================================================================ */
regUC = 5;
buildRegForm();
renderAll();

if (S.phase === 'setup')      navigateTo('home');
else if (isAdmin)             navigateTo('admin');
else                          navigateTo('bracket');