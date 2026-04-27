/* ============================================
   NORTHERN ARENA - FULL VERSION
   Основной функционал + канадские уведомления + прелоадер
   ============================================ */

(function() {
    'use strict';

    function $(s) { return document.querySelector(s); }

    function $$(s) { return document.querySelectorAll(s); }

    // ========================================
    // CANADIAN TOAST SYSTEM (из второго файла)
    // ========================================
    function showToast(message, type) {
        var toast = $('#northernToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'northernToast';
            toast.className = 'northern-toast';
            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.className = 'northern-toast ' + (type || 'info');
        toast.classList.add('show');

        if (type === 'error' && navigator.vibrate) {
            navigator.vibrate(200);
        }

        setTimeout(function() {
            toast.classList.remove('show');
        }, 3500);
    }

    // ========================================
    // MAPLE LEAF CONFETTI (из второго файла)
    // ========================================
    function showMapleConfetti() {
        if (typeof canvasConfetti !== 'undefined') {
            canvasConfetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#D42426', '#FFD700', '#1A7A4B', '#FFFFFF']
            });
        } else {
            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1';
            script.onload = function() {
                canvasConfetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#D42426', '#FFD700', '#1A7A4B', '#FFFFFF']
                });
            };
            document.head.appendChild(script);
        }
    }

    // ========================================
    // Preloader with aurora animation (из второго файла)
    // ========================================
    var preloader = $('#auroraLoader');
    var auroraBar = $('.aurora-bar');
    if (preloader && auroraBar) {
        var width = 0;
        var interval = setInterval(function() {
            width += 2;
            auroraBar.style.width = width + '%';
            if (width >= 100) {
                clearInterval(interval);
                setTimeout(function() {
                    preloader.style.opacity = '0';
                    setTimeout(function() { preloader.style.display = 'none'; }, 500);
                }, 300);
            }
        }, 30);
    }

    // ========================================
    // Tab switching (из первого файла)
    // ========================================
    var tabs = $$('.compass-item');
    var tabContents = $$('.tab-content');

    for (var t = 0; t < tabs.length; t++) {
        var tab = tabs[t];
        tab.addEventListener('click', (function(tabElement) {
            return function() {
                var tabId = tabElement.getAttribute('data-tab');
                for (var i = 0; i < tabs.length; i++) {
                    tabs[i].classList.remove('active');
                }
                tabElement.classList.add('active');
                for (var j = 0; j < tabContents.length; j++) {
                    tabContents[j].classList.remove('active');
                }
                var activeTab = $('#' + tabId + '-tab');
                if (activeTab) activeTab.classList.add('active');
                showToast('📍 Entering ' + tabElement.querySelector('span').textContent + ' zone', 'info');
            };
        })(tab));
    }

    // ========================================
    // Token System (из первого файла + уведомления)
    // ========================================
    var tokens = 2845;
    var tokenSpan = $('#tokenAmount');
    var TOKEN_KEY = 'northern_tokens';

    function loadTokens() {
        var saved = localStorage.getItem(TOKEN_KEY);
        if (saved) tokens = parseInt(saved, 10);
        updateTokenDisplay();
    }

    function updateTokenDisplay() {
        if (tokenSpan) tokenSpan.textContent = tokens.toLocaleString();
    }

    function addTokens(amount, reason) {
        tokens += amount;
        localStorage.setItem(TOKEN_KEY, tokens);
        updateTokenDisplay();
        if (tokenSpan) {
            tokenSpan.style.transform = 'scale(1.2)';
            setTimeout(function() { if (tokenSpan) tokenSpan.style.transform = 'scale(1)'; }, 200);
        }
        showToast('🍁 +' + amount + ' MAPLE POINTS! ' + reason, 'success');
        if (amount >= 500) showMapleConfetti();
    }

    // ========================================
    // Level & XP System (из первого файла)
    // ========================================
    var xpCurrent = 1280;
    var xpNext = 2500;
    var level = 7;
    var xpFill = $('.level-progress-fill');
    var xpCurrentSpan = $('#xpCurrent');
    var xpNextSpan = $('#xpNext');
    var levelSpan = $('.level-number');
    var levelBadge = $('.level-badge');

    function addXP(amount) {
        xpCurrent += amount;
        var percent = (xpCurrent / xpNext) * 100;
        if (xpFill) xpFill.style.width = Math.min(percent, 100) + '%';
        if (xpCurrentSpan) xpCurrentSpan.textContent = xpCurrent;

        if (xpCurrent >= xpNext) {
            level++;
            xpCurrent -= xpNext;
            xpNext = Math.floor(xpNext * 1.2);
            if (levelSpan) {
                levelSpan.textContent = level;
                levelSpan.style.transform = 'scale(1.3)';
                setTimeout(function() { if (levelSpan) levelSpan.style.transform = 'scale(1)'; }, 300);
            }
            if (xpNextSpan) xpNextSpan.textContent = xpNext;
            showToast('🎉 LEVEL UP! You are now level ' + level + '! 🎉', 'success');
            showMapleConfetti();

            var badges = ['ROOKIE', 'RANGER', 'WARRIOR', 'GLADIATOR', 'LEGEND'];
            if (level <= 5 && levelBadge) levelBadge.textContent = badges[level - 1];
        }
        if (xpFill) xpFill.style.width = (xpCurrent / xpNext) * 100 + '%';
        localStorage.setItem('northern_xp', xpCurrent);
        localStorage.setItem('northern_level', level);
    }

    // ========================================
    // Raid Boss System (из первого файла)
    // ========================================
    var bossHealth = 8700000;
    var bossMaxHealth = 10000000;
    var bossFill = $('#bossHealthFill');
    var bossPercent = $('#bossHealthPercent');

    function updateBossHealth() {
        var percent = (bossHealth / bossMaxHealth) * 100;
        if (bossFill) bossFill.style.width = percent + '%';
        if (bossPercent) bossPercent.textContent = Math.floor(percent) + '%';

        if (bossHealth <= 0) {
            showToast('🏆 THE WYVERN IS DEFEATED! CLAIM YOUR REWARDS! 🏆', 'success');
            addTokens(5000, 'Raid victory!');
            addXP(1000);
            showMapleConfetti();
            bossHealth = bossMaxHealth;
            updateBossHealth();
        }
    }

    function attackBoss() {
        var damage = Math.floor(Math.random() * 5000) + 1000;
        bossHealth -= damage;
        if (bossHealth < 0) bossHealth = 0;
        updateBossHealth();
        addTokens(Math.floor(damage / 100), 'Raid damage!');
        addXP(Math.floor(damage / 200));
        showToast('⚔️ You dealt ' + damage.toLocaleString() + ' damage to the Wyvern!', 'info');

        if (damage > 4000) {
            document.body.style.transform = 'translateX(4px)';
            setTimeout(function() { document.body.style.transform = ''; }, 100);
        }
    }

    var attackBtn = $('#attackBossBtn');
    if (attackBtn) attackBtn.addEventListener('click', attackBoss);

    // ========================================
    // Game Buttons (из первого файла)
    // ========================================
    var playButtons = $$('.arcade-play');
    for (var p = 0; p < playButtons.length; p++) {
        var btn = playButtons[p];
        btn.addEventListener('click', (function(button) {
            return function() {
                var game = button.getAttribute('data-game');
                var reward = Math.floor(Math.random() * 50) + 20;
                addTokens(reward, 'Played ' + game);
                addXP(Math.floor(reward / 2));
                showToast('🎮 Launching ' + game + '! Good luck, gamer! 🎮', 'success');

                var card = button.closest('.arcade-card');
                if (card) {
                    card.style.transform = 'scale(0.98)';
                    setTimeout(function() { if (card) card.style.transform = ''; }, 150);
                }
            };
        })(btn));
    }

    // ========================================
    // Surprise Me Button (из первого файла)
    // ========================================
    var surpriseBtn = $('#viewAllArcade');
    if (surpriseBtn) {
        surpriseBtn.addEventListener('click', function() {
            var games = ['Maple Quest', 'Hockey Rumble', 'Northern Lights', 'Timber Tumble', 'Poutine Panic', 'Moose Mayhem'];
            var random = games[Math.floor(Math.random() * games.length)];
            var reward = Math.floor(Math.random() * 80) + 30;
            addTokens(reward, 'Surprise game: ' + random);
            addXP(Math.floor(reward / 2));
            showToast('🎲 SURPRISE! Playing ' + random + '! +' + reward + ' 🍁', 'success');
            showMapleConfetti();
        });
    }

    // ========================================
    // Daily Streak / Bonus (из первого файла)
    // ========================================
    var streakBtn = $('#claimStreakBtn');
    var lastBonusKey = 'northern_last_bonus';

    if (streakBtn) {
        streakBtn.addEventListener('click', function() {
            var lastBonus = localStorage.getItem(lastBonusKey);
            var canClaim = !lastBonus || (Date.now() - parseInt(lastBonus)) > 86400000;

            if (canClaim) {
                var bonus = 500;
                addTokens(bonus, '3-day streak bonus! 🍁');
                localStorage.setItem(lastBonusKey, Date.now());
                streakBtn.textContent = '✅ CLAIMED! COME BACK TOMORROW';
                streakBtn.disabled = true;
                streakBtn.style.opacity = '0.5';
                showMapleConfetti();
            } else {
                var hoursLeft = Math.ceil((86400000 - (Date.now() - parseInt(lastBonus))) / 3600000);
                showToast('⏰ Come back in ' + hoursLeft + ' hours for your streak bonus!', 'error');
            }
        });
    }

    // ========================================
    // Chat System (из первого файла)
    // ========================================
    var sendBtn = $('#sendMessageBtn');
    var chatInput = $('#chatInput');
    var chatMessages = $('#chatMessages');

    function addChatMessage(user, message) {
        if (!chatMessages) return;
        var msgDiv = document.createElement('div');
        msgDiv.className = 'chat-message';
        msgDiv.innerHTML = '<span class="chat-user">🍁 ' + user + ':</span> <span>' + message + '</span>';
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        while (chatMessages.children.length > 20) {
            chatMessages.removeChild(chatMessages.firstChild);
        }
    }

    if (sendBtn && chatInput) {
        sendBtn.addEventListener('click', function() {
            var msg = chatInput.value.trim();
            if (msg) {
                var username = localStorage.getItem('northern_username') || 'Player_' + Math.floor(Math.random() * 1000);
                addChatMessage(username, msg);
                chatInput.value = '';
            }
        });

        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') sendBtn.click();
        });
    }

    // ========================================
    // Hockey League Team Support (из первого файла)
    // ========================================
    var supportBtns = $$('.matchup-bet-btn');
    for (var s = 0; s < supportBtns.length; s++) {
        var supportBtn = supportBtns[s];
        supportBtn.addEventListener('click', (function(button) {
            return function() {
                var match = button.getAttribute('data-match');
                addTokens(100, 'Supporting team in ' + match);
                showToast('🏒 GO TEAM! You supported ' + match + '! 🏒', 'success');
            };
        })(supportBtn));
    }

    // ========================================
    // Filter Games (из первого файла)
    // ========================================
    var filterBtns = $$('.filter-btn');
    var gameCards = $$('.arcade-card');

    for (var f = 0; f < filterBtns.length; f++) {
        var filterBtn = filterBtns[f];
        filterBtn.addEventListener('click', (function(button) {
            return function() {
                for (var i = 0; i < filterBtns.length; i++) {
                    filterBtns[i].classList.remove('active');
                }
                button.classList.add('active');
                var filter = button.getAttribute('data-filter');
                var visibleCount = 0;

                for (var j = 0; j < gameCards.length; j++) {
                    var card = gameCards[j];
                    var category = card.getAttribute('data-category');
                    if (filter === 'all' || category === filter) {
                        card.style.display = 'block';
                        visibleCount++;
                    } else {
                        card.style.display = 'none';
                    }
                }
                showToast('🔍 Showing ' + visibleCount + ' ' + filter + ' games', 'info');
            };
        })(filterBtn));
    }

    // ========================================
    // Scroll to Top (Hypercube) - из первого файла
    // ========================================
    var hypercube = $('#hypercube');
    if (hypercube) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                hypercube.classList.add('visible');
            } else {
                hypercube.classList.remove('visible');
            }
        });

        hypercube.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            showToast('⬆️ Back to the top of the arena!', 'info');
        });
    }

    // ========================================
    // Power Play Timer (из первого файла)
    // ========================================
    var powerPlayTimer = $('#powerPlayTimer');
    if (powerPlayTimer) {
        var timeLeft = 154;
        setInterval(function() {
            if (timeLeft > 0) {
                timeLeft--;
                var mins = Math.floor(timeLeft / 60);
                var secs = timeLeft % 60;
                powerPlayTimer.textContent = String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');

                if (timeLeft === 60) {
                    showToast('⚡ POWER PLAY: 1 MINUTE REMAINING! ⚡', 'info');
                }
            }
        }, 1000);
    }

    // ========================================
    // Join Supporter Button (из второго файла)
    // ========================================
    var supporterBtn = $('#joinSupporterBtn');
    var supporterCount = $('#supporterCount');

    if (supporterBtn && supporterCount) {
        supporterBtn.addEventListener('click', function() {
            var count = parseInt(supporterCount.textContent, 10);
            count++;
            supporterCount.textContent = count;
            addTokens(250, 'Welcome to Maple Supporters!');
            showToast('🍁 Welcome to the Maple Supporters club! 🍁', 'success');
            showMapleConfetti();
            this.textContent = '✅ JOINED!';
            this.disabled = true;
        });
    }

    // ========================================
    // Load saved data (из первого файла)
    // ========================================
    function loadSavedData() {
        var savedXP = localStorage.getItem('northern_xp');
        var savedLevel = localStorage.getItem('northern_level');
        if (savedXP) xpCurrent = parseInt(savedXP, 10);
        if (savedLevel) level = parseInt(savedLevel, 10);
        if (levelSpan) levelSpan.textContent = level;
        if (xpCurrentSpan) xpCurrentSpan.textContent = xpCurrent;
        if (xpFill) xpFill.style.width = (xpCurrent / xpNext) * 100 + '%';
    }

    // ========================================
    // Initialize (из первого файла + приветствие из второго)
    // ========================================
    function init() {
        loadTokens();
        loadSavedData();
        console.log('🍁 Northern Arena — Ready for battle, eh! 🍁');
        showToast('🇨🇦 Welcome to Northern Arena, eh! Ready to play? 🇨🇦', 'success');
    }

    init();
})();