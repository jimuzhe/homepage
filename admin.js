// 全局配置数据
let configData = {};

// 登录验证
function login() {
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');

    if (password === 'LongDz') {
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('adminLayout').style.display = 'block';
        loadConfig();
    } else {
        errorDiv.textContent = '密码错误，请重试';
    }
}

// 获取API端点
function getApiUrl() {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    return isLocalhost ? 'http://localhost:3001/api/config' : '/api/config';
}

// 加载配置文件
async function loadConfig() {
    try {
        // 首先尝试从API加载
        const response = await fetch(getApiUrl());
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                configData = result.data;
                populateForm();
                console.log('✅ 从API加载配置成功');
                return;
            }
        }

        // 如果API不可用，尝试直接加载config.json
        const fallbackResponse = await fetch('./config.json');
        if (fallbackResponse.ok) {
            configData = await fallbackResponse.json();
            populateForm();
            console.log('⚠️ 从config.json加载配置（API不可用）');
            const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            if (isLocalhost) {
                alert('注意：后端服务未启动，无法直接保存到文件。\n请先运行: node server.js');
            }
            return;
        }

        throw new Error('无法加载配置文件');
    } catch (error) {
        console.error('❌ 加载配置失败:', error);
        alert('加载配置文件失败\n\n请确保配置文件存在且格式正确');
    }
}

// 填充表单数据
function populateForm() {
    // 个人信息 - 适配新的config.json结构
    const profile = configData.profile || {};
    document.getElementById('profileName').value = profile.name || '';
    document.getElementById('profileTitle').value = profile.title || '';
    document.getElementById('profileBirthday').value = profile.siteStart || '';
    document.getElementById('profileId').value = profile.id || '';
    document.getElementById('profileDescription').value = profile.description || '';
    document.getElementById('profileAvatar').value = profile.avatar || '';

    // 音乐配置
    if (configData.music) {
        document.getElementById('currentSongId').value = configData.music.currentSongId || '';
        document.getElementById('playlist').value = configData.music.playlist ? configData.music.playlist.join('\n') : '';
    }

    // 背景设置
    const background = configData.background || {};
    document.getElementById('profileBackground').value = profile.profileBackground || '';
    document.getElementById('backgroundImage').value = profile.backgroundImage || '';
    document.getElementById('backgroundVideo').value = profile.backgroundVideo || '';
    document.getElementById('backgroundType').value = profile.backgroundType || 'image';
    document.getElementById('profileImage').value = background.profileImage || '';

    // 根据背景类型显示对应的输入框
    toggleBackgroundType();

    // 渲染列表
    renderSkills();
    renderProjects();
    renderFriends();
    renderSocial();
}

// 标签页切换
document.addEventListener('DOMContentLoaded', function () {
    const navLinks = document.querySelectorAll('.nav-link');
    const tabPanes = document.querySelectorAll('.tab-pane');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            // 移除所有活动状态
            navLinks.forEach(l => l.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            // 添加当前活动状态
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
});

// 保存个人信息
async function saveProfile() {
    if (!configData.profile) {
        configData.profile = {};
    }

    configData.profile.name = document.getElementById('profileName').value;
    configData.profile.title = document.getElementById('profileTitle').value;
    configData.profile.siteStart = document.getElementById('profileBirthday').value;
    configData.profile.id = document.getElementById('profileId').value;
    configData.profile.description = document.getElementById('profileDescription').value;
    configData.profile.avatar = document.getElementById('profileAvatar').value;

    // 自动保存
    await autoSaveConfig();
}

// 保存音乐配置
async function saveMusic() {
    if (!configData.music) {
        configData.music = {};
    }

    configData.music.currentSongId = document.getElementById('currentSongId').value;
    const playlistText = document.getElementById('playlist').value;
    configData.music.playlist = playlistText.split('\n').filter(id => id.trim() !== '');

    // 自动保存
    await autoSaveConfig();
}

// 保存背景设置
async function saveBackground() {
    if (!configData.profile) {
        configData.profile = {};
    }
    if (!configData.background) {
        configData.background = {};
    }

    // 保存个人资料背景
    configData.profile.profileBackground = document.getElementById('profileBackground').value;

    // 保存右侧背景
    configData.profile.backgroundImage = document.getElementById('backgroundImage').value;
    configData.profile.backgroundVideo = document.getElementById('backgroundVideo').value;
    configData.profile.backgroundType = document.getElementById('backgroundType').value;

    // 保存其他背景配置
    configData.background.profileImage = document.getElementById('profileImage').value;

    // 自动保存
    await autoSaveConfig();
}

// 渲染技能列表
function renderSkills() {
    const container = document.getElementById('skillsList');
    container.innerHTML = '';

    if (!configData.skills) {
        configData.skills = [];
    }

    configData.skills.forEach((skill, index) => {
        const skillDiv = document.createElement('div');
        skillDiv.className = 'item-card';
        skillDiv.innerHTML = `
            <div class="item-header">
                <span class="item-title">${skill.name || '未命名技能'}</span>
                <button class="btn btn-danger" onclick="removeSkill(${index})">删除</button>
            </div>
            <div class="grid grid-cols-2">
                <div class="form-group">
                    <label>技能名称</label>
                    <input type="text" class="form-control" value="${skill.name || ''}" onchange="updateSkill(${index}, 'name', this.value)" />
                </div>
                <div class="form-group">
                    <label>熟练程度</label>
                    <select class="form-control" onchange="updateSkill(${index}, 'level', this.value)">
                        <option value="了解" ${skill.level === '了解' ? 'selected' : ''}>了解</option>
                        <option value="熟悉" ${skill.level === '熟悉' ? 'selected' : ''}>熟悉</option>
                        <option value="掌握" ${skill.level === '掌握' ? 'selected' : ''}>掌握</option>
                    </select>
                </div>
            </div>
        `;
        container.appendChild(skillDiv);
    });
}

// 添加技能
async function addSkill() {
    if (!configData.skills) {
        configData.skills = [];
    }

    configData.skills.push({
        name: '',
        level: '了解'
    });

    renderSkills();
    // 自动保存
    await autoSaveConfig();
}

// 更新技能
async function updateSkill(index, field, value) {
    if (configData.skills[index]) {
        configData.skills[index][field] = value;
        if (field === 'name') {
            renderSkills();
        }
        // 自动保存
        await autoSaveConfig();
    }
}

// 删除技能
async function removeSkill(index) {
    if (confirm('确定要删除这个技能吗？')) {
        configData.skills.splice(index, 1);
        renderSkills();
        // 自动保存
        await autoSaveConfig();
    }
}

// 渲染项目列表
function renderProjects() {
    const container = document.getElementById('projectsList');
    container.innerHTML = '';

    if (!configData.projects) {
        configData.projects = [];
    }

    configData.projects.forEach((project, index) => {
        const projectDiv = document.createElement('div');
        projectDiv.className = 'item-card';
        projectDiv.innerHTML = `
            <div class="item-header">
                <span class="item-title">${project.name || '未命名项目'}</span>
                <button class="btn btn-danger" onclick="removeProject(${index})">删除</button>
            </div>
            <div class="grid grid-cols-2">
                <div class="form-group">
                    <label>项目名称</label>
                    <input type="text" class="form-control" value="${project.name || ''}" onchange="updateProject(${index}, 'name', this.value)" />
                </div>
                <div class="form-group">
                    <label>项目链接</label>
                    <input type="url" class="form-control" value="${project.url || ''}" onchange="updateProject(${index}, 'url', this.value)" />
                </div>
                <div class="form-group">
                    <label>项目图标</label>
                    <input type="text" class="form-control" value="${project.icon || ''}" onchange="updateProject(${index}, 'icon', this.value)" />
                </div>
                <div class="form-group">
                    <label>项目描述</label>
                    <input type="text" class="form-control" value="${project.desc || ''}" onchange="updateProject(${index}, 'desc', this.value)" />
                </div>
            </div>
        `;
        container.appendChild(projectDiv);
    });
}

// 添加项目
async function addProject() {
    if (!configData.projects) {
        configData.projects = [];
    }

    configData.projects.push({
        name: '',
        url: '',
        icon: '',
        desc: ''
    });

    renderProjects();
    // 自动保存
    await autoSaveConfig();
}

// 更新项目
async function updateProject(index, field, value) {
    if (configData.projects[index]) {
        configData.projects[index][field] = value;
        if (field === 'name') {
            renderProjects();
        }
        // 自动保存
        await autoSaveConfig();
    }
}

// 删除项目
async function removeProject(index) {
    if (confirm('确定要删除这个项目吗？')) {
        configData.projects.splice(index, 1);
        renderProjects();
        // 自动保存
        await autoSaveConfig();
    }
}

// 渲染友链列表
function renderFriends() {
    const container = document.getElementById('friendsList');
    container.innerHTML = '';

    if (!configData.friendLinks) {
        configData.friendLinks = [];
    }

    configData.friendLinks.forEach((friend, index) => {
        const friendDiv = document.createElement('div');
        friendDiv.className = 'item-card';
        friendDiv.innerHTML = `
            <div class="item-header">
                <span class="item-title">${friend.name || '未命名友链'}</span>
                <button class="btn btn-danger" onclick="removeFriend(${index})">删除</button>
            </div>
            <div class="grid grid-cols-2">
                <div class="form-group">
                    <label>友链名称</label>
                    <input type="text" class="form-control" value="${friend.name || ''}" onchange="updateFriend(${index}, 'name', this.value)" />
                </div>
                <div class="form-group">
                    <label>友链地址</label>
                    <input type="url" class="form-control" value="${friend.url || ''}" onchange="updateFriend(${index}, 'url', this.value)" />
                </div>
                <div class="form-group">
                    <label>图标链接</label>
                    <input type="url" class="form-control" value="${friend.icon || ''}" onchange="updateFriend(${index}, 'icon', this.value)" />
                </div>
                <div class="form-group">
                    <label>友链描述</label>
                    <input type="text" class="form-control" value="${friend.description || ''}" onchange="updateFriend(${index}, 'description', this.value)" />
                </div>
            </div>
        `;
        container.appendChild(friendDiv);
    });
}

// 添加友链
async function addFriend() {
    if (!configData.friendLinks) {
        configData.friendLinks = [];
    }

    configData.friendLinks.push({
        name: '',
        url: '',
        icon: '',
        description: ''
    });

    renderFriends();
    // 自动保存
    await autoSaveConfig();
}

// 更新友链
async function updateFriend(index, field, value) {
    if (configData.friendLinks[index]) {
        configData.friendLinks[index][field] = value;
        if (field === 'name') {
            renderFriends();
        }
        // 自动保存
        await autoSaveConfig();
    }
}

// 删除友链
async function removeFriend(index) {
    if (confirm('确定要删除这个友链吗？')) {
        configData.friendLinks.splice(index, 1);
        renderFriends();
        // 自动保存
        await autoSaveConfig();
    }
}

// 渲染社交媒体列表
function renderSocial() {
    const container = document.getElementById('socialList');
    container.innerHTML = '';

    if (!configData.socialLinks) {
        configData.socialLinks = [];
    }

    configData.socialLinks.forEach((social, index) => {
        const socialDiv = document.createElement('div');
        socialDiv.className = 'item-card';
        socialDiv.innerHTML = `
            <div class="item-header">
                <span class="item-title">${social.name || '未命名社交媒体'}</span>
                <button class="btn btn-danger" onclick="removeSocial(${index})">删除</button>
            </div>
            <div class="grid grid-cols-2">
                <div class="form-group">
                    <label>平台名称</label>
                    <input type="text" class="form-control" value="${social.name || ''}" onchange="updateSocial(${index}, 'name', this.value)" />
                </div>
                <div class="form-group">
                    <label>链接地址</label>
                    <input type="url" class="form-control" value="${social.url || ''}" onchange="updateSocial(${index}, 'url', this.value)" />
                </div>
            </div>
        `;
        container.appendChild(socialDiv);
    });
}

// 添加社交媒体
async function addSocial() {
    if (!configData.socialLinks) {
        configData.socialLinks = [];
    }

    configData.socialLinks.push({
        name: '',
        url: ''
    });

    renderSocial();
    // 自动保存
    await autoSaveConfig();
}

// 更新社交媒体
async function updateSocial(index, field, value) {
    if (configData.socialLinks[index]) {
        configData.socialLinks[index][field] = value;
        if (field === 'name') {
            renderSocial();
        }
        // 自动保存
        await autoSaveConfig();
    }
}

// 删除社交媒体
async function removeSocial(index) {
    if (confirm('确定要删除这个社交媒体吗？')) {
        configData.socialLinks.splice(index, 1);
        renderSocial();
        // 自动保存
        await autoSaveConfig();
    }
}

// 自动保存配置（静默保存，无弹窗）
async function autoSaveConfig() {
    try {
        const response = await fetch(getApiUrl(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(configData)
        });

        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                console.log('✅ 配置已自动保存');
                // 显示简单的保存提示
                showSaveIndicator();
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error('❌ 自动保存失败:', error);
        return false;
    }
}

// 显示保存指示器
function showSaveIndicator() {
    // 移除现有的指示器
    const existing = document.querySelector('.save-indicator');
    if (existing) {
        existing.remove();
    }

    // 创建新的指示器
    const indicator = document.createElement('div');
    indicator.className = 'save-indicator';
    indicator.textContent = '✅ 已保存';
    indicator.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 14px;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;

    document.body.appendChild(indicator);

    // 显示动画
    setTimeout(() => {
        indicator.style.opacity = '1';
    }, 10);

    // 3秒后隐藏
    setTimeout(() => {
        indicator.style.opacity = '0';
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.parentNode.removeChild(indicator);
            }
        }, 300);
    }, 3000);
}

// 手动保存配置（带详细提示）
async function saveConfig() {
    try {
        // 首先尝试通过后端API直接保存
        const response = await fetch(getApiUrl(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(configData)
        });

        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                alert(`✅ 配置保存成功！\n\n${result.message}\n备份文件: ${result.backup || '无'}\n\n🎉 config.json文件已直接更新，刷新主页即可看到效果！`);
                console.log('✅ 配置已通过后端API保存');
                return;
            }
        }

        // 如果后端不可用，降级为下载文件
        console.log('⚠️ 后端不可用，降级为文件下载');
        downloadConfig();

    } catch (error) {
        console.error('❌ 保存配置失败:', error);
        console.log('⚠️ 后端连接失败，降级为文件下载');
        downloadConfig();
    }
}

// 下载配置文件（备用方案）
function downloadConfig() {
    const configJson = JSON.stringify(configData, null, 2);
    const blob = new Blob([configJson], {
        type: 'application/json'
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('⚠️ 后端服务未启动，已导出配置文件到下载文件夹\n\n请手动替换原有的config.json文件\n\n💡 建议启动后端服务以实现自动保存：\nnode server.js');
}

// 切换背景类型显示
function toggleBackgroundType() {
    const backgroundType = document.getElementById('backgroundType').value;
    const imageGroup = document.getElementById('imageBackgroundGroup');
    const videoGroup = document.getElementById('videoBackgroundGroup');

    if (backgroundType === 'video') {
        imageGroup.style.display = 'none';
        videoGroup.style.display = 'block';
    } else {
        imageGroup.style.display = 'block';
        videoGroup.style.display = 'none';
    }
}