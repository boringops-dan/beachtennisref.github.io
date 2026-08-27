// Live-story stage: phones join one live beach tennis match beat by beat.
// Beat 5 drops the signal (offline, still scoring); beat 6 resyncs.
// Auto-advances in view, rail buttons jump to a beat, reduced motion
// shows the resync finale statically.
document.addEventListener('DOMContentLoaded', function() {
  var storyStage = document.querySelector('.bth-story-stage');
  if (!storyStage) return;
  var FINAL_STEP = 6;
  var OFFLINE_STEP = 5;
  var storyItems = storyStage.querySelectorAll('[data-on]');
  var stepButtons = document.querySelectorAll('[data-step-btn]');
  var storySvg = storyStage.querySelector('.bth-story-links');
  var storyTimer = null;
  var resumeTimer = null;
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var watchersEl = storyStage.querySelector('[data-watchers]');
  var WATCHERS_BY_STEP = { 3: 8, 4: 14, 5: 14, 6: 17 };
  var youScoreEl = storyStage.querySelector('[data-youscore]');
  var YOU_SCORES = { 1: '0 - 0', 2: '1 - 0', 3: '3 - 2', 4: '5 - 3', 5: '5 - 4', 6: '6 - 4 SET' };
  var deskScoreEl = storyStage.querySelector('[data-deskscore]');
  var DESK_SCORES = { 4: '5 - 3', 5: '5 - 3', 6: '6 - 4 SET' };
  var captionEl = storyStage.querySelector('.bth-story-caption');
  var captionTimeEl = storyStage.querySelector('[data-caption-time]');
  var captionTextEl = storyStage.querySelector('[data-caption-text]');
  // One golden-hour final, told beat by beat. The clock moves, the games
  // climb, and the set gets won while the signal is still gone.
  var CAPTIONS = [
    { t: '6:48 PM', x: 'Golden hour. You tap the first point of the club final.' },
    { t: '6:49 PM', x: 'Every tap is saved to the cloud before the sand settles.' },
    { t: '7:05 PM', x: 'Someone scans the QR on the net post. The whole court follows along.' },
    { t: '7:21 PM', x: 'The tournament desk and family back home see the same point land at the same second.' },
    { t: '7:44 PM', x: 'The beach loses signal mid-rally. Nobody on the court notices. The final keeps scoring itself.' },
    { t: '7:52 PM', x: 'One bar of signal returns. Every point lands everywhere at once.' }
  ];

  function setStoryStep(n, beatMs) {
    storyStage.dataset.step = String(n);
    storyStage.classList.toggle('is-offline', n === OFFLINE_STEP);
    storyStage.classList.toggle('is-resync', n === FINAL_STEP);
    storyItems.forEach(function(el) {
      el.classList.toggle('is-on', n >= parseInt(el.dataset.on, 10));
    });
    stepButtons.forEach(function(btn) {
      var active = parseInt(btn.dataset.stepBtn, 10) === n;
      btn.classList.toggle('is-active', active);
      if (active && beatMs) btn.style.setProperty('--beat', beatMs + 'ms');
    });
    if (watchersEl && WATCHERS_BY_STEP[n]) {
      watchersEl.textContent = '+' + WATCHERS_BY_STEP[n] + ' watching';
    }
    if (youScoreEl && YOU_SCORES[n]) { youScoreEl.textContent = YOU_SCORES[n]; }
    if (deskScoreEl && DESK_SCORES[n]) { deskScoreEl.textContent = DESK_SCORES[n]; }
    var cap = CAPTIONS[n - 1];
    if (captionEl && cap) {
      captionTimeEl.textContent = cap.t;
      captionTextEl.textContent = cap.x;
      captionEl.classList.remove('is-swap');
      void captionEl.offsetWidth;
      captionEl.classList.add('is-swap');
    }
  }

  // Each beat lasts long enough to read its caption (~3 words per second
  // plus settle time); the offline and resync beats hold a little longer.
  var FIRST_BEAT_MS = 2200;
  function beatDuration(step) {
    if (step === 1) return FIRST_BEAT_MS;
    var cap = CAPTIONS[step - 1];
    var words = cap ? cap.x.split(/\s+/).length : 10;
    var ms = Math.max(5000, Math.round((words / 3) * 1000) + 2500);
    if (step === OFFLINE_STEP || step === FINAL_STEP) ms += 3000;
    return ms;
  }

  function advanceStory() {
    var current = parseInt(storyStage.dataset.step, 10) || 1;
    var next = current >= FINAL_STEP ? 1 : current + 1;
    var beat = beatDuration(next);
    setStoryStep(next, beat);
    storyTimer = setTimeout(advanceStory, beat);
  }

  function pauseStory(resumeAfterMs) {
    clearTimeout(storyTimer);
    clearTimeout(resumeTimer);
    if (resumeAfterMs && !prefersReduced) {
      resumeTimer = setTimeout(function() {
        storyTimer = setTimeout(advanceStory, 800);
      }, resumeAfterMs);
    }
  }

  stepButtons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      setStoryStep(parseInt(btn.dataset.stepBtn, 10), 9800);
      pauseStory(9000);
    });
  });

  // The pulse dots are SMIL animations that otherwise tick for the whole
  // page lifetime; freeze the SVG clock whenever the stage can't be seen.
  function setSvgRunning(running) {
    if (!storySvg || !storySvg.pauseAnimations) return;
    try {
      if (running) { storySvg.unpauseAnimations(); } else { storySvg.pauseAnimations(); }
    } catch (e) {}
  }

  if (prefersReduced) {
    setStoryStep(FINAL_STEP);
    setSvgRunning(false);
  } else {
    setStoryStep(1);
    var storyObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        setSvgRunning(entry.isIntersecting);
        if (entry.isIntersecting) {
          clearTimeout(storyTimer);
          storyTimer = setTimeout(advanceStory, beatDuration(1));
        } else {
          pauseStory();
        }
      });
    }, { threshold: 0.35 });
    storyObserver.observe(storyStage);
  }
});
