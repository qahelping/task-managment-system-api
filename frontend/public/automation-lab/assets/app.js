// ===== Theme Management =====
(function() {
    'use strict';

    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle?.querySelector('.theme-icon');
    const html = document.documentElement;

    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    // Theme toggle handler
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }

    function updateThemeIcon(theme) {
        if (themeIcon) {
            themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    }

    // ===== Navigation =====
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const linkPath = new URL(link.href).pathname;
        if (currentPath.endsWith(linkPath) || 
            (currentPath.endsWith('/') && linkPath.endsWith('index.html'))) {
            link.classList.add('active');
        }
    });

    // Update copyright year
    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }

    // Sidebar removed - no longer needed

    // ===== Log Panel =====
    const logPanel = document.getElementById('logPanel');
    const logContent = document.getElementById('logContent');
    const logFilter = document.getElementById('logFilter');
    const logClear = document.getElementById('logClear');
    const logToggle = document.getElementById('logToggle');
    const logClose = document.getElementById('logClose');
    let logEntries = [];
    let logFilterValue = 'all';

    // Toggle log panel visibility
    function updateLogPanelVisibility() {
        if (!logPanel || !logToggle) return;
        
        const isVisible = logPanel.classList.contains('visible');
        if (isVisible) {
            logToggle.classList.add('hidden'); // Скрываем кнопку когда панель открыта
        } else {
            logToggle.classList.remove('hidden'); // Показываем кнопку когда панель закрыта
        }
    }

    if (logToggle && logPanel) {
        logToggle.addEventListener('click', () => {
            logPanel.classList.toggle('visible');
            updateLogPanelVisibility();
        });
    }

    if (logClose && logPanel) {
        logClose.addEventListener('click', (e) => {
            e.stopPropagation();
            logPanel.classList.remove('visible');
            updateLogPanelVisibility();
        });
    }

    // Закрытие панели при клике вне её (опционально)
    if (logPanel) {
        logPanel.addEventListener('click', (e) => {
            // Если клик по самой панели (не по дочерним элементам), закрываем
            if (e.target === logPanel) {
                logPanel.classList.remove('visible');
                updateLogPanelVisibility();
            }
        });
    }

    // Инициализируем видимость при загрузке
    updateLogPanelVisibility();

    // Initialize log panel
    if (logPanel && logContent) {
        // Log function
        window.logEvent = function(type, message, data = {}) {
            const timestamp = new Date().toLocaleTimeString();
            const entry = {
                type,
                message,
                timestamp,
                data
            };
            logEntries.push(entry);
            renderLog();
        };

        // Filter handler
        if (logFilter) {
            logFilter.addEventListener('change', (e) => {
                logFilterValue = e.target.value;
                renderLog();
            });
        }

        // Clear handler
        if (logClear) {
            logClear.addEventListener('click', () => {
                logEntries = [];
                renderLog();
            });
        }

        function renderLog() {
            if (!logContent) return;
            
            const filtered = logFilterValue === 'all' 
                ? logEntries 
                : logEntries.filter(e => e.type === logFilterValue);
            
            logContent.innerHTML = filtered.slice(-50).map(entry => {
                return `<div class="log-entry ${entry.type}">
                    <span class="log-time">[${entry.timestamp}]</span>
                    <strong>${entry.type.toUpperCase()}:</strong> ${entry.message}
                    ${entry.data.details ? `<br><span style="opacity: 0.7; margin-left: 1rem;">${entry.data.details}</span>` : ''}
                </div>`;
            }).join('');
            
            logContent.scrollTop = logContent.scrollHeight;
        }

        // Auto-log common events
        document.addEventListener('click', (e) => {
            if (e.target.closest('.case-card, .case-element, .trigger-btn')) {
                logEvent('click', `Click on ${e.target.tagName}`, {
                    details: e.target.textContent.substring(0, 50)
                });
            }
        });

        document.addEventListener('focus', (e) => {
            if (e.target.matches('input, textarea, select')) {
                logEvent('focus', `Focus on ${e.target.tagName}`, {
                    details: e.target.name || e.target.id || 'unnamed'
                });
            }
        }, true);

        document.addEventListener('input', (e) => {
            if (e.target.matches('input, textarea')) {
                logEvent('input', `Input in ${e.target.tagName}`, {
                    details: `Value: ${e.target.value.substring(0, 30)}`
                });
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.target.matches('input, textarea')) {
                logEvent('keydown', `Key: ${e.key}`, {
                    details: `Code: ${e.code}`
                });
            }
        });

        document.addEventListener('change', (e) => {
            if (e.target.matches('input, select, textarea')) {
                logEvent('change', `Change in ${e.target.tagName}`, {
                    details: `New value: ${e.target.value.substring(0, 30)}`
                });
            }
        });
    }

    // ===== Stress Mode =====
    let stressMode = false;
    window.stressMode = {
        enabled: false,
        enable: function() {
            this.enabled = true;
            document.body.classList.add('stress-mode');
            logEvent('render', 'Stress mode enabled');
        },
        disable: function() {
            this.enabled = false;
            document.body.classList.remove('stress-mode');
            logEvent('render', 'Stress mode disabled');
        },
        toggle: function() {
            if (this.enabled) {
                this.disable();
            } else {
                this.enable();
            }
        },
        applyDelay: function(callback, min = 0, max = 1200) {
            if (!this.enabled) {
                callback();
                return;
            }
            const delay = Math.random() * (max - min) + min;
            setTimeout(() => {
                callback();
            }, delay);
        },
        reRender: function(element, times = 1) {
            if (!this.enabled || !element) return;
            
            const parent = element.parentNode;
            const nextSibling = element.nextSibling;
            
            for (let i = 0; i < times; i++) {
                setTimeout(() => {
                    parent.removeChild(element);
                    setTimeout(() => {
                        parent.insertBefore(element, nextSibling);
                        logEvent('render', 'Element re-rendered', {
                            details: element.tagName
                        });
                    }, 50);
                }, i * 200);
            }
        },
        showOverlay: function(duration = 2000) {
            if (!this.enabled) return;
            
            const overlay = document.createElement('div');
            overlay.className = 'overlay';
            overlay.innerHTML = '<div class="overlay-content"><h3>Stress Mode Overlay</h3><p>This overlay appears randomly</p></div>';
            document.body.appendChild(overlay);
            
            logEvent('render', 'Overlay shown');
            
            setTimeout(() => {
                overlay.remove();
                logEvent('render', 'Overlay hidden');
            }, duration);
        }
    };

    // Random overlay trigger
    if (window.stressMode) {
        setInterval(() => {
            if (window.stressMode.enabled && Math.random() > 0.95) {
                window.stressMode.showOverlay();
            }
        }, 5000);
    }

    // ===== Copy to Clipboard =====
    window.copyToClipboard = function(text, button) {
        navigator.clipboard.writeText(text).then(() => {
            const originalText = button.textContent;
            button.textContent = 'Скопировано!';
            button.classList.add('copied');
            setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove('copied');
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy:', err);
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            
            const originalText = button.textContent;
            button.textContent = 'Скопировано!';
            button.classList.add('copied');
            setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove('copied');
            }, 2000);
        });
    };

    // ===== Solution Key Check =====
    const SOLUTION_KEY = 'automation2024';
    window.checkSolutionKey = function(input, button) {
        if (input.value === SOLUTION_KEY) {
            button.disabled = false;
            button.textContent = 'Показать решение';
            return true;
        } else {
            button.disabled = true;
            return false;
        }
    };

    // Auto-check solution keys on input
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('solution-key-input')) {
            const wrapper = e.target.closest('.show-solution-wrapper') || e.target.closest('.solution-gate');
            const button = wrapper?.querySelector('.show-solution-btn');
            if (button) {
                window.checkSolutionKey(e.target, button);
            }
        }
    });

    // Show solution handler
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('show-solution-btn') && !e.target.disabled) {
            const wrapper = e.target.closest('.show-solution-wrapper') || e.target.closest('.solution-gate');
            const solutions = wrapper?.querySelectorAll('.solution-hidden') || wrapper?.querySelectorAll('.solution-grid');
            if (solutions && solutions.length > 0) {
                solutions.forEach(sol => {
                    sol.classList.remove('solution-hidden');
                    sol.classList.add('fade-in');
                });
                e.target.style.display = 'none';
            }
            // Показываем solution-grid если он есть
            const solutionGrid = wrapper?.querySelector('.solution-grid');
            if (solutionGrid && solutionGrid.style.display === 'none' || !solutionGrid.classList.contains('fade-in')) {
                solutionGrid.style.display = 'grid';
                solutionGrid.classList.add('fade-in');
                const input = wrapper.querySelector('.solution-key-input');
                if (input) {
                    input.style.display = 'none';
                }
                e.target.style.display = 'none';
            }
        }
    });

    // Initial log
    logEvent('render', 'Page loaded', {
        details: window.location.pathname
    });
})();

