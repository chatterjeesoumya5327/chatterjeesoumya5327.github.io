const body = document.body;
const cliForm = document.getElementById('cli-form');
const cliInput = document.getElementById('cli-input');
const cliOutput = document.getElementById('cli-output');
const yearLabel = document.getElementById('year');
const modeToggle = document.getElementById('mode-toggle');
const menuToggle = document.getElementById('menu-toggle');
const siteNav = document.querySelector('.site-nav');
const navLinks = document.querySelectorAll('.site-nav a');
const experienceCounter = document.getElementById('experience-counter');
const cursorBlink = document.querySelector('.cursor-blink');
const commandHistory = [];
let historyPointer = 0;

const scrollCliToBottom = () => {
    cliOutput?.scrollTo({ top: cliOutput.scrollHeight, behavior: 'instant' });
};
const scrollPageToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' });
};
const syncCliScroll = () => {
    scrollCliToBottom();
    scrollPageToBottom();
};
const scrollPageToTop = () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
};

// ===== EXPERIENCE COUNTER =====
const experienceStart = new Date('2015-09-07T00:00:00');
const updateExperienceCounter = () => {
    if (!experienceCounter) return;
    const now = new Date();
    let years = now.getFullYear() - experienceStart.getFullYear();
    let months = now.getMonth() - experienceStart.getMonth();
    if (months < 0) {
        years--;
        months += 12;
    }

    let anchor = new Date(experienceStart);
    anchor.setFullYear(experienceStart.getFullYear() + years);
    anchor.setMonth(experienceStart.getMonth() + months);

    if (anchor > now) {
        months--;
        if (months < 0) {
            months += 12;
            years = Math.max(0, years - 1);
        }
        anchor = new Date(experienceStart);
        anchor.setFullYear(experienceStart.getFullYear() + years);
        anchor.setMonth(experienceStart.getMonth() + months);
    }

    let diffMs = now - anchor;
    const msPerDay = 24 * 60 * 60 * 1000;
    const days = Math.floor(diffMs / msPerDay);
    diffMs -= days * msPerDay;
    const hours = Math.floor(diffMs / (60 * 60 * 1000));
    diffMs -= hours * 60 * 60 * 1000;
    const minutes = Math.floor(diffMs / (60 * 1000));
    diffMs -= minutes * 60 * 1000;
    const seconds = Math.floor(diffMs / 1000);

    const pad = (value) => String(value).padStart(2, '0');
    experienceCounter.innerHTML = `
        <span class="counter-major">${years}<small>yrs</small></span>
        <span class="counter-major">${months}<small>mos</small></span>
        <span class="counter-major">${days}<small>days</small></span>
        <span class="counter-time">${pad(hours)}:${pad(minutes)}:${pad(seconds)}</span>
    `;
};
updateExperienceCounter();
setInterval(updateExperienceCounter, 1000);

if (yearLabel) {
    yearLabel.textContent = new Date().getFullYear();
}

if (modeToggle) {
    modeToggle.textContent = '>_ CLI';
}

// ===== CLI HELPERS =====
const escapeHtml = (str) =>
    str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
       .replace(/"/g, '&quot;').replace(/'/g, '&#039;');

const appendHTML = (type, htmlString) => {
    if (!cliOutput) return;
    const line = document.createElement('div');
    line.classList.add('line', type);
    line.innerHTML = htmlString;
    cliOutput.appendChild(line);
    syncCliScroll();
};

const pushHistory = (raw) => {
    commandHistory.push(raw);
    if (commandHistory.length > 50) commandHistory.shift();
    historyPointer = commandHistory.length;
};

const typewriterOutput = async (lines, baseDelay = 40) => {
    for (let i = 0; i < lines.length; i++) {
        if (baseDelay > 0 && i > 0) {
            await new Promise(resolve => setTimeout(resolve, baseDelay));
        }
        appendHTML(lines[i].type, lines[i].html);
    }
    syncCliScroll();
};

// ===== WELCOME BANNER =====
const showWelcomeBanner = () => {
    if (!cliOutput) return;
    cliOutput.innerHTML = '';

    const banner = [
        ' ____   ___  _   _ __  ____   __ _',
        '/ ___| / _ \\| | | |  \\/  \\ \\ / // \\',
        '\\___ \\| | | | | | | |\\/| |\\ V // _ \\',
        ' ___) | |_| | |_| | |  | | | |/ ___ \\',
        '|____/ \\___/ \\___/|_|  |_| |_/_/   \\_\\',
    ];

    banner.forEach(row => {
        appendHTML('info', `<span class="t-cyan t-bold">${escapeHtml(row)}</span>`);
    });
    appendHTML('response', '');
    appendHTML('system',
        `<span class="t-green">soumya-portfolio</span> <span class="t-muted">v2.0.0</span>  ·  Software Developer & Data Engineer`
    );
    appendHTML('response',
        `<span class="t-muted">Type </span><span class="t-yellow">help</span>` +
        `<span class="t-muted"> to list commands, or </span>` +
        `<span class="t-yellow">whoami</span><span class="t-muted"> to start.</span>`
    );
    appendHTML('response', '');
};

// ===== COMMAND RESPONSES =====
const R = (lines) => lines;

const commandResponses = {
    'help': R([
        { type: 'info',     html: '<span class="t-cyan t-bold">Available Commands</span>' },
        { type: 'response', html: '<span class="t-yellow">help</span>                   <span class="t-muted">Show this help table</span>' },
        { type: 'response', html: '<span class="t-yellow">whoami</span>                 <span class="t-muted">One-liner about Soumya</span>' },
        { type: 'response', html: '<span class="t-yellow">ls</span>                     <span class="t-muted">List available files</span>' },
        { type: 'response', html: '<span class="t-yellow">cat &lt;file&gt;</span>             <span class="t-muted">Read a file  (about.txt · skills.txt · experience.txt · contact.txt)</span>' },
        { type: 'response', html: '<span class="t-yellow">pwd</span>                    <span class="t-muted">Print working directory</span>' },
        { type: 'response', html: '<span class="t-yellow">clear</span>                  <span class="t-muted">Clear the terminal</span>' },
        { type: 'divider',  html: '' },
        { type: 'response', html: '<span class="t-yellow">soumya --summary</span>       <span class="t-muted">Profile summary</span>' },
        { type: 'response', html: '<span class="t-yellow">soumya --experience</span>    <span class="t-muted">Career timeline</span>' },
        { type: 'response', html: '<span class="t-yellow">soumya --experience-details</span>  <span class="t-muted">Full experience breakdown</span>' },
        { type: 'response', html: '<span class="t-yellow">soumya --skills</span>        <span class="t-muted">Technical skills</span>' },
        { type: 'response', html: '<span class="t-yellow">soumya --contact</span>       <span class="t-muted">Contact information</span>' },
        { type: 'response', html: '<span class="t-yellow">soumya --academics</span>     <span class="t-muted">Education history</span>' },
    ]),
    'whoami': R([
        { type: 'response', html: '<span class="t-green">Soumya Chatterjee</span> — Associate Vice President at JPMorgan Chase. 10+ yrs building enterprise-scale data platforms across finance, telecom, and retail.' },
    ]),
    'ls': R([
        { type: 'info',     html: '<span class="t-cyan">~/portfolio</span>' },
        { type: 'response', html: '<span class="t-yellow">about.txt</span>    <span class="t-yellow">skills.txt</span>    <span class="t-yellow">experience.txt</span>    <span class="t-yellow">contact.txt</span>' },
    ]),
    'cat about.txt': R([
        { type: 'info',     html: '<span class="t-cyan t-bold">about.txt</span>' },
        { type: 'response', html: 'Software Developer with over a decade of success delivering enterprise systems' },
        { type: 'response', html: 'for finance, telecom, and retail. Adept in Java, Spring, Angular, Spark, and' },
        { type: 'response', html: 'Kubernetes with practical cloud experience across AWS and Azure.' },
        { type: 'response', html: '' },
        { type: 'response', html: 'Currently: <span class="t-green">Associate Vice President</span> · <span class="t-yellow">JPMorgan Chase</span> · Asset &amp; Wealth Management' },
    ]),
    'cat skills.txt': R([
        { type: 'info',     html: '<span class="t-cyan t-bold">skills.txt</span>' },
        { type: 'response', html: '<span class="t-yellow">Languages:    </span>Java · SQL · JavaScript · Python' },
        { type: 'response', html: '<span class="t-yellow">Frameworks:   </span>Spring · Angular · AngularJS · Spark' },
        { type: 'response', html: '<span class="t-yellow">Cloud:        </span>AWS · Azure · Kubernetes' },
        { type: 'response', html: '<span class="t-yellow">Databases:    </span>PostgreSQL · MongoDB' },
        { type: 'response', html: '<span class="t-yellow">Observability:</span>Splunk · Git' },
        { type: 'response', html: '<span class="t-yellow">Data Science: </span>Machine Learning · Data Engineering' },
    ]),
    'cat experience.txt': R([
        { type: 'info',     html: '<span class="t-cyan t-bold">experience.txt</span>' },
        { type: 'response', html: '<span class="t-green">Associate Vice President       </span>JP Morgan Chase &amp; Co.     Oct 2022 – Present' },
        { type: 'response', html: '<span class="t-green">App Dev Assistant Manager      </span>Accenture                 Apr 2019 – Oct 2022' },
        { type: 'response', html: '<span class="t-green">Software Engineer              </span>L&amp;T Technology Services   Feb 2018 – Apr 2019' },
        { type: 'response', html: '<span class="t-green">System Engineer                </span>TCS                       Sep 2015 – Feb 2018' },
    ]),
    'cat contact.txt': R([
        { type: 'info',     html: '<span class="t-cyan t-bold">contact.txt</span>' },
        { type: 'response', html: '<span class="t-yellow">Email:    </span>chatterjeesoumya5327@gmail.com' },
        { type: 'response', html: '<span class="t-yellow">Phone:    </span>+91 80500 88732' },
        { type: 'response', html: '<span class="t-yellow">LinkedIn: </span>linkedin.com/in/soumyachatterjee-088' },
        { type: 'response', html: '<span class="t-yellow">Portfolio:</span>chatterjeesoumya5327.github.io' },
    ]),
    'pwd': R([
        { type: 'response', html: '/home/soumya/portfolio' },
    ]),
    'soumya --help': R([
        { type: 'info',     html: '<span class="t-cyan t-bold">soumya --help</span>' },
        { type: 'response', html: '<span class="t-muted">Tip: type </span><span class="t-yellow">help</span><span class="t-muted"> for the full command table.</span>' },
        { type: 'response', html: 'soumya --summary · soumya --experience · soumya --experience-details' },
        { type: 'response', html: 'soumya --skills · soumya --contact · soumya --academics · clear' },
    ]),
    'soumya --summary': R([
        { type: 'info',     html: '<span class="t-cyan t-bold">Summary</span>' },
        { type: 'response', html: 'Soumya Chatterjee is a Bangalore-based Software Developer with over a decade' },
        { type: 'response', html: 'of experience building enterprise systems across finance, telecom, and retail.' },
        { type: 'response', html: 'Specialties: Java, Spring, Angular, Spark, Kubernetes, AWS, Azure, ML.' },
    ]),
    'soumya --experience': R([
        { type: 'info',     html: '<span class="t-cyan t-bold">Career Timeline</span>' },
        { type: 'response', html: '<span class="t-green">JP Morgan Chase   </span>AVP                        Oct 2022 – Present  <span class="t-muted">(3+ yrs)</span>' },
        { type: 'response', html: '<span class="t-green">Accenture         </span>App Dev Asst Manager       Apr 2019 – Oct 2022 <span class="t-muted">(3.5 yrs)</span>' },
        { type: 'response', html: '<span class="t-green">L&amp;T Tech Services  </span>Software Engineer          Feb 2018 – Apr 2019 <span class="t-muted">(1 yr)</span>' },
        { type: 'response', html: '<span class="t-green">TCS               </span>System Engineer            Sep 2015 – Feb 2018 <span class="t-muted">(2.5 yrs)</span>' },
    ]),
    'soumya --experience-details': R([
        { type: 'info',     html: '<span class="t-cyan t-bold">JP Morgan Chase</span>' },
        { type: 'response', html: '· Data ingestion platform loading millions of records daily (self-heal logic).' },
        { type: 'response', html: '· Spark aggregations + live data quality monitoring for stakeholders.' },
        { type: 'response', html: '· Implemented UMA accounts and rebalancing end-to-end.' },
        { type: 'divider',  html: '' },
        { type: 'info',     html: '<span class="t-cyan t-bold">Accenture</span>' },
        { type: 'response', html: '· Feature teams for a Dutch bank, full-stack across four apps concurrently.' },
        { type: 'response', html: '· Microservice health dashboards; mentored new hires.' },
        { type: 'divider',  html: '' },
        { type: 'info',     html: '<span class="t-cyan t-bold">L&amp;T Technology Services</span>' },
        { type: 'response', html: '· 20+ REST APIs with Spring; Angular UI integrations; 250+ issues resolved.' },
        { type: 'divider',  html: '' },
        { type: 'info',     html: '<span class="t-cyan t-bold">TCS</span>' },
        { type: 'response', html: '· 40+ Spring MVC APIs over MongoDB for a Fortune 500 retailer.' },
        { type: 'response', html: '· Led AngularJS best practices; greenfield to post-launch support.' },
    ]),
    'soumya --skills': R([
        { type: 'info',     html: '<span class="t-cyan t-bold">Technical Skills</span>' },
        { type: 'response', html: '<span class="t-yellow">Languages:    </span>Java · SQL · JavaScript · Python' },
        { type: 'response', html: '<span class="t-yellow">Frameworks:   </span>Spring · Angular · Spark' },
        { type: 'response', html: '<span class="t-yellow">Cloud/Infra:  </span>AWS · Azure · Kubernetes · Git' },
        { type: 'response', html: '<span class="t-yellow">Databases:    </span>PostgreSQL · MongoDB' },
        { type: 'response', html: '<span class="t-yellow">Data Science: </span>Machine Learning · Splunk' },
    ]),
    'soumya --contact': R([
        { type: 'info',     html: '<span class="t-cyan t-bold">Contact</span>' },
        { type: 'response', html: '<span class="t-yellow">Email:    </span>chatterjeesoumya5327@gmail.com' },
        { type: 'response', html: '<span class="t-yellow">Phone:    </span>+91 80500 88732' },
        { type: 'response', html: '<span class="t-yellow">LinkedIn: </span>linkedin.com/in/soumyachatterjee-088' },
    ]),
    'soumya --academics': R([
        { type: 'info',     html: '<span class="t-cyan t-bold">Education</span>' },
        { type: 'response', html: '<span class="t-green">M.Tech  </span>Data Science &amp; Engineering · BITS Pilani  · 2026 · CGPA 8.35' },
        { type: 'response', html: '<span class="t-green">B.Tech  </span>Electronics &amp; Communication · WBUT        · 2015 · CGPA 8.58' },
        { type: 'response', html: '<span class="t-green">ISC 12  </span>Science · East West Model School           · 2010 · 80.42%' },
        { type: 'response', html: '<span class="t-green">ICSE 10 </span>Holy Rock School                          · 2008 · 80.07%' },
    ]),
};

// ===== NAVIGATION =====
const closeMenu = () => {
    menuToggle?.classList.remove('open');
    siteNav?.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
};

const highlightSection = (hash) => {
    if (!hash) return;
    const target = document.querySelector(hash);
    if (!target) return;
    target.classList.remove('glow-focus');
    void target.offsetWidth;
    target.classList.add('glow-focus');
    target.addEventListener('animationend', () => {
        target.classList.remove('glow-focus');
    }, { once: true });
};

menuToggle?.addEventListener('click', () => {
    const willOpen = !menuToggle.classList.contains('open');
    menuToggle.classList.toggle('open', willOpen);
    siteNav?.classList.toggle('open', willOpen);
    menuToggle.setAttribute('aria-expanded', String(willOpen));
});

navLinks.forEach((link) => {
    link.addEventListener('click', () => {
        closeMenu();
        highlightSection(link.getAttribute('href'));
    });
});

window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        closeMenu();
    }
});

// ===== SCROLL SPY =====
const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
            });
        }
    });
}, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

document.querySelectorAll('main section[id]').forEach(el => navObserver.observe(el));

// ===== MODE TOGGLE =====
let cliInitialized = false;

const setMode = (isCli) => {
    body.classList.toggle('mode-cli', isCli);
    if (modeToggle) {
        modeToggle.textContent = isCli ? '>_ TUI' : '>_ CLI';
    }

    if (isCli) {
        closeMenu();
        if (!cliInitialized) {
            cliInitialized = true;
            showWelcomeBanner();
        }
        setTimeout(() => {
            cliInput?.focus();
            syncCliScroll();
        }, 300);
    } else {
        scrollPageToTop();
    }
};

modeToggle?.addEventListener('click', () => {
    const nextState = !body.classList.contains('mode-cli');
    setMode(nextState);
});

setMode(body.classList.contains('mode-cli'));

// ===== CLI FORM SUBMIT =====
cliForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!cliInput) return;
    const raw = cliInput.value.trim();
    if (!raw) return;

    // Echo the command with styled prompt
    appendHTML('input',
        `<span class="prompt-user">soumya</span>` +
        `<span class="prompt-at">@</span>` +
        `<span class="prompt-host">portfolio</span>` +
        `<span class="prompt-path"> ~</span>` +
        `<span class="prompt-dollar">$</span> ` +
        escapeHtml(raw)
    );

    const command = raw.toLowerCase().trim();

    if (command === 'clear') {
        cliOutput.innerHTML = '';
        cliInput.value = '';
        pushHistory(raw);
        syncCliScroll();
        return;
    }

    cliInput.disabled = true;
    cliInput.value = '';

    const lines = commandResponses[command];
    if (lines) {
        await typewriterOutput(lines, lines.length <= 12 ? 35 : 0);
    } else {
        appendHTML('error',
            `<span class="t-red">bash: ${escapeHtml(raw)}: command not found</span>` +
            `<span class="t-muted"> — type </span><span class="t-yellow">help</span><span class="t-muted"> for available commands.</span>`
        );
    }

    cliInput.disabled = false;
    cliInput.focus();
    pushHistory(raw);
    syncCliScroll();
});

// ===== CLI KEYBOARD NAVIGATION =====
cliInput?.addEventListener('keydown', (event) => {
    // Tab completion
    if (event.key === 'Tab') {
        event.preventDefault();
        const partial = cliInput.value.toLowerCase().trim();
        if (!partial) return;
        const allKnown = [...Object.keys(commandResponses), 'clear'];
        const matches = allKnown.filter(c => c.startsWith(partial));
        if (matches.length === 1) {
            cliInput.value = matches[0];
        } else if (matches.length > 1) {
            appendHTML('system', `<span class="t-muted">${matches.map(escapeHtml).join('   ')}</span>`);
            syncCliScroll();
        }
        return;
    }

    // History navigation
    if (!commandHistory.length) return;
    if (event.key === 'ArrowUp') {
        event.preventDefault();
        historyPointer = Math.max(0, historyPointer - 1);
        cliInput.value = commandHistory[historyPointer] ?? '';
        syncCliScroll();
    } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        historyPointer = Math.min(commandHistory.length, historyPointer + 1);
        if (historyPointer === commandHistory.length) {
            cliInput.value = '';
        } else {
            cliInput.value = commandHistory[historyPointer] ?? '';
        }
        syncCliScroll();
    }
});

// ===== CURSOR BLINK PAUSE ON TYPING =====
let cursorTimer = null;
cliInput?.addEventListener('input', () => {
    if (cursorBlink) cursorBlink.style.visibility = 'hidden';
    clearTimeout(cursorTimer);
    cursorTimer = setTimeout(() => {
        if (cursorBlink) cursorBlink.style.visibility = 'visible';
    }, 800);
});
