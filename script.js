// 配置数据（避免跨域问题）
const CONFIG = {
    "profile": {
        "name": "LongDz",
        "title": "<后端工程师>",
        "birthday": "生辰: 6月1日",
        "description": "热爱技术，专注于后端开发和系统架构设计。拥有5年的开发经验，擅长Java、Python、Node.js等技术栈。",
        "avatar": "https://image.name666.top/file/AgACAgUAAyEGAASfXnYUAAMjaIiYVwSI6brk1VkX8CwRlN-eOfEAAuzHMRsaw0lUVyqVbdjhIqwBAAMCAANtAAM2BA.png",
        "backgroundImage": "https://www.yysls.cn/pc/gw/20220815175950/img/downloads/bz/23_b5691a8.jpg?image_process=format,jpg",
        "days": "215"
    },
    "skills": [
        "Java",
        "Docker",
        "Git",
        "Nginx",
        "MySQL",
        "Redis",
        "Linux",
        "Spring Boot"
    ]
};

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
        skills
    } = config;

    // 基本信息
    document.getElementById('avatar').src = profile.avatar;
    document.getElementById('name').textContent = profile.name;
    document.getElementById('title').textContent = profile.title;
    document.getElementById('birthday').textContent = profile.birthday;
    document.getElementById('description').textContent = profile.description;
    document.getElementById('background-image').src = profile.backgroundImage;

    // 等级和统计信息
    document.querySelector('.level').textContent = profile.level;
    document.getElementById('coins').textContent = profile.coins;
    document.getElementById('fire').textContent = profile.fire;
    document.getElementById('friends').textContent = profile.friends;

    // ID信息
    document.querySelector('.id-info').innerHTML = `
        <i class="fas fa-id-card"></i>
        <span>备案号${profile.id}</span>
        <span>已运行${profile.days}天</span>
    `;
    // 技能标签
    const skillTagsContainer = document.getElementById('skill-tags');
    skillTagsContainer.innerHTML = '';
    skills.forEach(skill => {
        const skillTag = document.createElement('span');
        skillTag.className = 'skill-tag';
        skillTag.textContent = skill;
        skillTagsContainer.appendChild(skillTag);
    });
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', loadConfig);