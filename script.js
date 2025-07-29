// 加载配置文件并渲染页面
async function loadConfig() {
    try {
        // 首先尝试从config.json加载（需要服务器环境）
        const response = await fetch('./config.json');
        if (response.ok) {
            const config = await response.json();
            renderProfile(config);
            return;
        }
    } catch (error) {
        console.log('使用内嵌配置数据（避免跨域问题）');
    }

    // 使用内嵌配置数据
    renderProfile(CONFIG);
}

// 渲染个人信息
function renderProfile(config) {
    const {
        profile,
        contact,
        skills,
        friendLinks
    } = config;

    // 基本信息
    document.getElementById('avatar').src = profile.avatar;
    document.getElementById('name').textContent = profile.name;
    document.getElementById('title').textContent = profile.title;
    document.getElementById('birthday').textContent = profile.birthday;
    document.getElementById('description').textContent = profile.description;
    document.getElementById('background-image').src = profile.backgroundImage;

    // ...无等级和统计信息，防止报错...

    // 备案号和运行天数
    const idInfo = document.querySelector('.id-info');
    let days = 0;
    if (profile.siteStart) {
        const startDate = new Date(profile.siteStart);
        const now = new Date();
        days = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
    }
    idInfo.innerHTML = `
        <i class="fas fa-id-card"></i>
        <span>${profile.id || ''}</span>
        <span>已运行${days}天</span>
    `;
    // 技能标签（Simple Icons SVG）
    const skillTagsContainer = document.getElementById('skill-tags');
    skillTagsContainer.innerHTML = '';
    skills.forEach(skill => {
        // Simple Icons slug规则：全小写，空格/点/加号/下划线/斜杠等转为无
        let slug = skill.toLowerCase().replace(/(\s|\.|\+|_|\/)/g, '');
        // 特殊处理部分slug
        if (slug === 'springboot') slug = 'springboot';
        if (slug === 'css3') slug = 'css3';
        if (slug === 'c++') slug = 'cplusplus';
        if (slug === 'c#') slug = 'csharp';
        // Simple Icons CDN
        const iconUrl = `https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/${slug}.svg`;
        const skillTag = document.createElement('div');
        skillTag.className = 'skill-tag';
        skillTag.innerHTML = `<img src="${iconUrl}" alt="${skill}" style="width:28px;height:28px;display:block;margin-bottom:2px;filter:invert(80%) grayscale(1);"><span>${skill}</span>`;
        skillTagsContainer.appendChild(skillTag);
    });

    // 渲染友链
    if (friendLinks && friendLinks.length > 0) {
        const friendLinksContainer = document.getElementById('friend-links');
        friendLinksContainer.innerHTML = '';
        friendLinks.forEach(link => {
            const linkElement = document.createElement('a');
            linkElement.className = 'friend-link';
            linkElement.href = link.url;
            linkElement.target = '_blank';
            linkElement.innerHTML = `
                <img src="${link.icon}" alt="${link.name}" class="friend-link-icon" style="filter: invert(80%) grayscale(1);">
                <div class="friend-link-info">
                    <div class="friend-link-name">${link.name}</div>
                    <div class="friend-link-desc">${link.description}</div>
                </div>
            `;
            friendLinksContainer.appendChild(linkElement);
        });
    }
}

// 计算网站运行天数
function setSiteDays() {
    // 设置建站日期（如2024-01-01）
    var startDate = new Date('2025-07-28');
    var now = new Date();
    var days = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
    var siteDays = document.getElementById('site-days');
    if (siteDays) siteDays.textContent = `已运行${days}天`;
}

// Tab切换逻辑
function setupTabs() {
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');

    // 初始化：只显示第一个tab内容，其余隐藏
    tabContents.forEach((tc, idx) => {
        tc.style.display = idx === 0 ? 'block' : 'none';
    });

    navItems.forEach((item) => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            navItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            const tab = this.getAttribute('data-tab');
            tabContents.forEach(tc => {
                tc.style.display = tc.id === 'tab-' + tab ? 'block' : 'none';
            });
        });
    });
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function () {
    loadConfig();
    setSiteDays();
    setupTabs();
});