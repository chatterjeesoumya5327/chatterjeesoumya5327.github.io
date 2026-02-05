const body = document.body;
const cliForm = document.getElementById('cli-form');
const cliInput = document.getElementById('cli-input');
const cliOutput = document.getElementById('cli-output');
const yearLabel = document.getElementById('year');
const modeToggle = document.getElementById('mode-toggle');
const menuToggle = document.getElementById('menu-toggle');
const siteNav = document.querySelector('.site-nav');
const experienceCounter = document.getElementById('experience-counter');
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
    modeToggle.textContent = 'CLI';
}

const commandResponses = {
    'soumya --help': `Available commands:
- soumya --academics
- soumya --summary
- soumya --experience
- soumya --experience-details
- soumya --skills
- soumya --contact
- clear`,
    'soumya --summary': `Soumya Chatterjee is a Bangalore-based Software Developer with over a decade of experience building enterprise-scale applications across finance, telecom, and retail. He blends Java, Spring, Angular, Spark, and Kubernetes expertise with data science to create resilient, self-healing systems.`,
    'soumya --experience': `Total experience: 10+ years
JP Morgan Chase & Co. - Associate Vice President (Oct 2022 - Present) | 3+ yrs
Accenture - Application Development Assistant Manager (Apr 2019 - Oct 2022) | 3.5 yrs
L&T Technology Services - Software Engineer (Feb 2018 - Apr 2019) | 1 yr
TATA Consultancy Services - System Engineer (Sep 2015 - Feb 2018) | 2.5 yrs`,
    'soumya --experience-details': `Experience Details
JP Morgan Chase:
- Data ingestion platform loading millions of records daily with self-heal logic.
- Spark aggregations to prep consumer-ready datasets plus live data monitoring.
- Implemented UMA accounts and rebalancing workflows end-to-end.

Accenture:
- Directed feature teams for a Dutch bank aligning to business objectives.
- Led full-stack delivery across four apps while mentoring new hires.
- Built dashboards for microservice health.

L&T Technology Services:
- Delivered 20+ REST APIs with Spring for a telecom R&D program.
- Synced Angular UI and backend integrations, fixing 250+ issues.

TCS:
- Built 40+ Spring MVC APIs over MongoDB for a Fortune 500 retailer.
- Championed AngularJS practices and supported the app post-launch.`,
    'soumya --skills': `Top Skills
- Java | Spring Framework | Angular
- SQL | PostgreSQL | MongoDB
- Spark | Kubernetes | Machine Learning
- AWS | Azure | Git | Splunk`,
    'soumya --contact': `Reach Soumya
Email: chatterjeesoumya5327@gmail.com
Phone: +91 80500 88732
LinkedIn: linkedin.com/in/soumyachatterjee-088
Portfolio: chatterjeesoumya5327.github.io`,
    'soumya --academics': `Education Details
M.Tech - Data Science & Engineering | BITS Pilani - 2026 | CGPA: 8.35
B.Tech - Electronics & Communication Engineering | WBUT - 2015 | CGPA: 8.58
ISC 12th - Science | East West Model School - 2010 | 80.42%
ICSE 10th | Holy Rock School - 2008 | 80.07%`
};

const closeMenu = () => {
    menuToggle?.classList.remove('open');
    siteNav?.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
};

menuToggle?.addEventListener('click', () => {
    const willOpen = !menuToggle.classList.contains('open');
    menuToggle.classList.toggle('open', willOpen);
    siteNav?.classList.toggle('open', willOpen);
    menuToggle.setAttribute('aria-expanded', String(willOpen));
});

siteNav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => closeMenu());
});

window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        closeMenu();
    }
});

const setMode = (isCli) => {
    body.classList.toggle('mode-cli', isCli);
    if (modeToggle) {
        modeToggle.textContent = isCli ? 'Web' : 'CLI';
    }

    if (isCli) {
        closeMenu();
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

const appendLine = (type, text) => {
    if (!cliOutput) return;
    const line = document.createElement('div');
    line.classList.add('line', type);
    line.textContent = text;
    cliOutput.appendChild(line);
    syncCliScroll();
};

cliForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!cliInput) return;
    const raw = cliInput.value.trim();
    if (!raw) return;

    appendLine('input', `visitor@soumya.dev $ ${raw}`);

    const command = raw.toLowerCase();
    if (command === 'clear') {
        cliOutput.innerHTML = '';
        syncCliScroll();
    } else if (commandResponses[command]) {
        appendLine('response', commandResponses[command]);
    } else {
        appendLine('system', `Unknown command: ${raw}. Try "soumya --help".`);
    }

    cliInput.value = '';

    commandHistory.push(raw);
    if (commandHistory.length > 5) {
        commandHistory.shift();
    }
    historyPointer = commandHistory.length;
});

cliInput?.addEventListener('keydown', (event) => {
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
