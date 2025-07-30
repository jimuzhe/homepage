// 全局配置数据
let configData = {};

// 登录验证
async function login() {
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    const loginBtn = document.querySelector('#loginContainer button');

    if (!password.trim()) {
        errorDiv.textContent = '请输入密码';
        return;
    }

    // 显示加载状态
    const originalText = loginBtn.textContent;
    loginBtn.textContent = '登录中...';
    loginBtn.disabled = true;
    errorDiv.textContent = '';

    try {
        const response = await fetch(`${window.location.origin}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                password: password
            })
        });

        const result = await response.json();

        if (result.success) {
            // 登录成功
            document.getElementById('loginContainer').style.display = 'none';
            document.getElementById('adminLayout').style.display = 'block';
            loadConfig();
        } else {
            // 登录失败
            errorDiv.textContent = result.message || '登录失败';
        }
    } catch (error) {
        console.error('❌ 登录请求失败:', error);
        errorDiv.textContent = '网络错误，请确保后端服务正在运行';
    } finally {
        // 恢复按钮状态
        loginBtn.textContent = originalText;
        loginBtn.disabled = false;
    }
}

// 获取API端点
function getApiUrl() {
    const baseUrl = window.location.origin;
    return `${baseUrl}/api/config`;
}

// 加载配置文件
async function loadConfig() {
    try {
        // 从后端API加载配置
        const response = await fetch(getApiUrl());
        if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
                configData = result.data;

                // 加载预设数据
                loadPresets();

                populateForm();
                console.log('✅ 从API加载配置成功');
                return;
            } else {
                console.error('❌ API返回错误:', result.message || '未知错误');
                alert('❌ 加载配置失败: ' + (result.message || '未知错误'));
                return;
            }
        } else {
            console.error('❌ API响应失败:', response.status, response.statusText);
            alert('❌ 无法连接到后端服务器\n请确保后端服务正在运行：python backend/app.py');
            return;
        }
    } catch (error) {
        console.error('❌ 从API加载配置失败:', error);
        alert('❌ 网络错误，无法连接到后端服务器\n请确保后端服务正在运行：python backend/app.py');
    }
}

// 加载预设数据
function loadPresets() {
    try {
        // 从配置数据中加载预设
        if (configData.backgroundPresets) {
            profileBackgroundPresets = configData.backgroundPresets.profile || [];
            rightBackgroundPresets = configData.backgroundPresets.right || [];
            videoBackgroundPresets = configData.backgroundPresets.video || [];
        } else {
            // 如果没有预设数据，使用默认值
            profileBackgroundPresets = [];
            rightBackgroundPresets = [];
            videoBackgroundPresets = [];
        }
        console.log('✅ 预设数据加载成功');
    } catch (error) {
        console.error('❌ 预设数据加载失败:', error);
        // 使用空数组作为默认值
        profileBackgroundPresets = [];
        rightBackgroundPresets = [];
        videoBackgroundPresets = [];
    }
}

// 填充表单数据
function populateForm() {
    // 个人信息 - 适配新的config.json结构
    const profile = configData.profile || {};
    document.getElementById('profileName').value = profile.name || '';
    document.getElementById('profileTitle').value = profile.title || '';
    document.getElementById('profileBirthday').value = profile.birthday || '';
    document.getElementById('profileId').value = profile.id || '';
    document.getElementById('profileSiteStart').value = profile.siteStart || '';
    document.getElementById('profileDescription').value = profile.description || '';
    document.getElementById('profileAvatar').value = profile.avatar || '';

    // 音乐配置
    if (configData.music) {
        document.getElementById('currentSongId').value = configData.music.currentSongId || '';
        document.getElementById('playlist').value = configData.music.playlist ? configData.music.playlist.join('\n') : '';
    }

    // 背景设置
    const background = configData.background || {};
    document.getElementById('backgroundImage').value = profile.backgroundImage || '';
    document.getElementById('backgroundVideo').value = profile.backgroundVideo || '';
    document.getElementById('backgroundType').value = profile.backgroundType || 'image';
    document.getElementById('profileImage').value = background.profileImage || '';
    document.getElementById('showBackgroundImage').checked = background.showBackgroundImage !== false; // 默认为true
    document.getElementById('enableGlassMorphism').checked = background.enableGlassMorphism !== false; // 默认为true

    // 根据背景类型显示对应的输入框
    toggleBackgroundType();

    // 更新视频预览
    updateVideoPreview();

    // 渲染列表
    renderSkills();
    renderProjects();
    renderFriends();
    renderSocial();
    renderBackgroundPresets();
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
    configData.profile.birthday = document.getElementById('profileBirthday').value;
    configData.profile.id = document.getElementById('profileId').value;
    configData.profile.siteStart = document.getElementById('profileSiteStart').value;
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
    try {
        if (!configData.profile) {
            configData.profile = {};
        }
        if (!configData.background) {
            configData.background = {};
        }

        // 保存右侧背景
        configData.profile.backgroundImage = document.getElementById('backgroundImage').value;
        configData.profile.backgroundVideo = document.getElementById('backgroundVideo').value;
        configData.profile.backgroundType = document.getElementById('backgroundType').value;

        // 保存个人资料背景配置
        configData.background.profileImage = document.getElementById('profileImage').value;
        configData.background.showBackgroundImage = document.getElementById('showBackgroundImage').checked;
        configData.background.enableGlassMorphism = document.getElementById('enableGlassMorphism').checked;

        // 自动保存
        const success = await autoSaveConfig();
        if (success) {
            alert('✅ 背景设置保存成功！');
        } else {
            alert('⚠️ 保存失败，请检查后端服务是否正常运行');
        }
    } catch (error) {
        console.error('❌ 保存背景设置失败:', error);
        alert('❌ 保存失败，请检查网络连接和后端服务');
    }
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
                    <div class="input-group">
                        <input type="text" class="form-control" value="${project.icon || ''}" onchange="updateProject(${index}, 'icon', this.value)" placeholder="FontAwesome类名或图标URL" />
                        <button type="button" class="btn btn-secondary" onclick="autoGetProjectIcon(${index})" title="从项目URL自动获取图标">
                            <i class="fas fa-magic"></i>
                        </button>
                    </div>
                    <small class="form-text">支持FontAwesome类名(如: fas fa-code, fa fa-hand-o-up)或图标URL，点击魔法按钮从项目URL自动获取</small>
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

// 自动获取项目图标
async function autoGetProjectIcon(index) {
    const project = configData.projects[index];
    if (!project || !project.url || project.url === '#' || project.url === '') {
        alert('请先填写项目URL');
        return;
    }

    try {
        // 从URL提取域名
        const url = new URL(project.url);
        const domain = url.hostname;

        // 尝试多种favicon获取方式
        const faviconUrls = [
            `${url.protocol}//${domain}/favicon.ico`,
            `${url.protocol}//${domain}/favicon.png`,
            `${url.protocol}//${domain}/apple-touch-icon.png`,
            `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
            `https://favicon.yandex.net/favicon/${domain}`
        ];

        // 测试第一个可用的favicon
        for (const faviconUrl of faviconUrls) {
            try {
                const response = await fetch(faviconUrl, {
                    method: 'HEAD'
                });
                if (response.ok) {
                    await updateProject(index, 'icon', faviconUrl);
                    renderProjects();
                    alert('图标获取成功！');
                    return;
                }
            } catch (e) {
                continue;
            }
        }

        // 如果都失败了，使用Google的favicon服务作为备选
        const fallbackIcon = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
        await updateProject(index, 'icon', fallbackIcon);
        renderProjects();
        alert('使用备选图标服务获取成功！');

    } catch (error) {
        console.error('获取图标失败:', error);
        alert('获取图标失败，请手动输入图标URL或FontAwesome类名');
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
                    <div class="input-group">
                        <input type="url" class="form-control" value="${friend.icon || ''}" onchange="updateFriend(${index}, 'icon', this.value)" placeholder="图标URL" />
                        <button type="button" class="btn btn-secondary" onclick="autoGetFriendIcon(${index})" title="从友链URL自动获取图标">
                            <i class="fas fa-magic"></i>
                        </button>
                    </div>
                    <small class="form-text">点击魔法按钮从友链URL自动获取网站图标</small>
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

// 自动获取友链图标
async function autoGetFriendIcon(index) {
    const friend = configData.friendLinks[index];
    if (!friend || !friend.url || friend.url === '#' || friend.url === '') {
        alert('请先填写友链URL');
        return;
    }

    try {
        // 从URL提取域名
        const url = new URL(friend.url);
        const domain = url.hostname;

        // 尝试多种favicon获取方式
        const faviconUrls = [
            `${url.protocol}//${domain}/favicon.ico`,
            `${url.protocol}//${domain}/favicon.png`,
            `${url.protocol}//${domain}/apple-touch-icon.png`,
            `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
            `https://favicon.yandex.net/favicon/${domain}`
        ];

        // 测试第一个可用的favicon
        for (const faviconUrl of faviconUrls) {
            try {
                const response = await fetch(faviconUrl, {
                    method: 'HEAD'
                });
                if (response.ok) {
                    await updateFriend(index, 'icon', faviconUrl);
                    renderFriends();
                    alert('图标获取成功！');
                    return;
                }
            } catch (e) {
                continue;
            }
        }

        // 如果都失败了，使用Google的favicon服务作为备选
        const fallbackIcon = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
        await updateFriend(index, 'icon', fallbackIcon);
        renderFriends();
        alert('使用备选图标服务获取成功！');

    } catch (error) {
        console.error('获取友链图标失败:', error);
        alert('获取图标失败，请手动输入图标URL');
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
                alert(`✅ 配置保存成功！\n\n${result.message}\n\n🎉 config.json文件已直接更新，刷新主页即可看到效果！`);
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

    alert('⚠️ 后端服务未启动，已导出配置文件到下载文件夹\n\n请手动替换原有的config.json文件\n\n💡 建议启动后端服务以实现自动保存：\npython app.py 或 python start.py');
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

// 背景图片预设列表 - 从配置文件中加载
let profileBackgroundPresets = [];
let rightBackgroundPresets = [];
let videoBackgroundPresets = [];

// 渲染背景预设
function renderBackgroundPresets() {
    renderPresets('profile');
    renderPresets('right');
    renderPresets('video');
    updateBackgroundPreview('profile');
    updateBackgroundPreview('right');
    updateVideoPreview();
}

// 渲染指定类型的预设
function renderPresets(type) {
    let containerId, presets;

    if (type === 'profile') {
        containerId = 'profilePresets';
        presets = profileBackgroundPresets;
    } else if (type === 'right') {
        containerId = 'rightPresets';
        presets = rightBackgroundPresets;
    } else if (type === 'video') {
        containerId = 'videoPresets';
        presets = videoBackgroundPresets;
    } else {
        return;
    }

    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    presets.forEach((preset, index) => {
        const presetDiv = document.createElement('div');
        presetDiv.className = `preset-item ${preset.custom ? 'custom' : ''}`;
        presetDiv.onclick = () => selectBackgroundPreset(type, preset.url, index);
        presetDiv.ondblclick = () => editPresetName(type, index);

        // 创建图片元素
        const img = document.createElement('img');
        img.src = preset.url;
        img.alt = preset.name;
        img.onerror = function () {
            this.style.display = 'none';
        };

        // 创建标签元素
        const label = document.createElement('div');
        label.className = 'preset-label';
        label.setAttribute('data-original', preset.name);
        label.textContent = preset.name;

        // 添加图片和标签
        presetDiv.appendChild(img);
        presetDiv.appendChild(label);

        // 添加删除按钮（所有预设都有，但只在悬停时显示）
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'preset-delete';
        deleteBtn.textContent = '×';
        deleteBtn.onclick = (e) => {
            e.stopPropagation(); // 阻止事件冒泡
            deletePreset(type, index);
        };
        presetDiv.appendChild(deleteBtn);

        container.appendChild(presetDiv);
    });
}

// 选择背景预设
function selectBackgroundPreset(type, url, index) {
    // 更新对应的输入框
    let inputId, containerId;

    if (type === 'profile') {
        inputId = 'profileImage';
        containerId = 'profilePresets';
    } else if (type === 'right') {
        inputId = 'backgroundImage';
        containerId = 'rightPresets';
    } else if (type === 'video') {
        inputId = 'backgroundVideo';
        containerId = 'videoPresets';
    } else {
        return;
    }

    document.getElementById(inputId).value = url;

    // 更新选中状态
    const container = document.getElementById(containerId);
    if (container) {
        const presetItems = container.querySelectorAll('.preset-item');
        presetItems.forEach((item, i) => {
            if (i === index) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }

    // 更新预览
    if (type === 'video') {
        updateVideoPreview();
    } else {
        updateBackgroundPreview(type);
    }
}

// 更新背景预览
function updateBackgroundPreview(type) {
    if (type === 'profile') {
        updateProfilePreview();
    } else if (type === 'right') {
        updateRightPreview();
    } else {
        // 更新所有预览
        updateProfilePreview();
        updateRightPreview();
    }
}

// 更新个人资料背景预览
function updateProfilePreview() {
    const profileImageUrl = document.getElementById('profileImage').value;
    const previewImage = document.getElementById('profilePreviewImage');
    const previewPlaceholder = document.getElementById('profilePreviewPlaceholder');

    if (profileImageUrl) {
        previewImage.src = profileImageUrl;
        previewImage.style.display = 'block';
        previewPlaceholder.style.display = 'none';

        // 更新预设选中状态
        const container = document.getElementById('profilePresets');
        const presetItems = container.querySelectorAll('.preset-item');
        presetItems.forEach((item, index) => {
            if (profileBackgroundPresets[index] && profileBackgroundPresets[index].url === profileImageUrl) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    } else {
        previewImage.style.display = 'none';
        previewPlaceholder.style.display = 'flex';

        // 清除所有选中状态
        const container = document.getElementById('profilePresets');
        const presetItems = container.querySelectorAll('.preset-item');
        presetItems.forEach(item => item.classList.remove('selected'));
    }
}

// 更新右侧背景预览
function updateRightPreview() {
    const backgroundImageUrl = document.getElementById('backgroundImage').value;
    const previewImage = document.getElementById('rightPreviewImage');
    const previewPlaceholder = document.getElementById('rightPreviewPlaceholder');

    if (backgroundImageUrl) {
        previewImage.src = backgroundImageUrl;
        previewImage.style.display = 'block';
        previewPlaceholder.style.display = 'none';

        // 更新预设选中状态
        const container = document.getElementById('rightPresets');
        const presetItems = container.querySelectorAll('.preset-item');
        presetItems.forEach((item, index) => {
            if (rightBackgroundPresets[index] && rightBackgroundPresets[index].url === backgroundImageUrl) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    } else {
        previewImage.style.display = 'none';
        previewPlaceholder.style.display = 'flex';

        // 清除所有选中状态
        const container = document.getElementById('rightPresets');
        const presetItems = container.querySelectorAll('.preset-item');
        presetItems.forEach(item => item.classList.remove('selected'));
    }
}

// 滚动预设列表
function scrollPresets(containerId, direction) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const scrollAmount = 140; // 一个预设项的宽度 + 间距
    container.scrollLeft += direction * scrollAmount;
}

// 保存预设到后端
async function saveBackgroundPresets() {
    try {
        const response = await fetch('/api/config');
        if (!response.ok) throw new Error('获取配置失败');

        const result = await response.json();
        if (!result.success) throw new Error(result.message || '获取配置失败');

        const config = result.data;

        // 更新配置中的预设数据
        if (!config.backgroundPresets) {
            config.backgroundPresets = {};
        }
        config.backgroundPresets.profile = profileBackgroundPresets;
        config.backgroundPresets.right = rightBackgroundPresets;
        config.backgroundPresets.video = videoBackgroundPresets;

        const saveResponse = await fetch('/api/config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(config)
        });

        if (!saveResponse.ok) throw new Error('保存配置失败');

        const saveResult = await saveResponse.json();
        if (!saveResult.success) throw new Error(saveResult.message || '保存配置失败');

    } catch (error) {
        console.error('保存预设失败:', error);
        throw error;
    }
}

// 添加自定义预设
async function addCustomPreset(type) {
    let urlPrompt, nameDefault, presets;

    if (type === 'video') {
        urlPrompt = '请输入背景视频URL:';
        nameDefault = '自定义视频';
        presets = videoBackgroundPresets;
    } else {
        urlPrompt = '请输入背景图片URL:';
        nameDefault = '自定义背景';
        presets = type === 'profile' ? profileBackgroundPresets : rightBackgroundPresets;
    }

    const url = prompt(urlPrompt);
    if (!url) return;

    const name = prompt('请输入预设名称:', nameDefault);
    if (!name) return;

    const newPreset = {
        name: name,
        url: url,
        custom: true
    };

    try {
        presets.push(newPreset);
        await saveBackgroundPresets();
        renderPresets(type);
        selectBackgroundPreset(type, url, presets.length - 1);
        showMessage('自定义预设添加成功！', 'success');
    } catch (error) {
        // 回滚操作
        presets.pop();
        console.error('添加预设失败:', error);
        showMessage('添加预设失败: ' + error.message, 'error');
    }
}

// 编辑预设名称
async function editPresetName(type, index) {
    let presets;
    if (type === 'profile') {
        presets = profileBackgroundPresets;
    } else if (type === 'right') {
        presets = rightBackgroundPresets;
    } else if (type === 'video') {
        presets = videoBackgroundPresets;
    } else {
        return;
    }
    const preset = presets[index];
    const originalName = preset.name;
    const originalCustom = preset.custom;

    const newName = prompt('请输入新的预设名称:', preset.name);
    if (newName && newName !== preset.name) {
        try {
            preset.name = newName;
            // 如果是默认预设，将其标记为自定义预设
            if (!preset.custom) {
                preset.custom = true;
            }

            await saveBackgroundPresets();
            renderPresets(type);
            showMessage('预设重命名成功！', 'success');
        } catch (error) {
            // 回滚操作
            preset.name = originalName;
            preset.custom = originalCustom;
            console.error('重命名预设失败:', error);
            showMessage('重命名预设失败: ' + error.message, 'error');
        }
    }
}

// 删除预设
async function deletePreset(type, index) {
    let presets;
    if (type === 'profile') {
        presets = profileBackgroundPresets;
    } else if (type === 'right') {
        presets = rightBackgroundPresets;
    } else if (type === 'video') {
        presets = videoBackgroundPresets;
    } else {
        return;
    }
    const preset = presets[index];

    // 默认预设不能删除
    if (!preset.custom) {
        alert('系统预设不能删除，只能删除自定义预设！');
        return;
    }

    if (confirm(`确定要删除预设"${preset.name}"吗？\n删除后将无法恢复！`)) {
        try {
            // 从数组中移除
            presets.splice(index, 1);

            // 保存到后端
            await saveBackgroundPresets();

            // 重新渲染
            renderPresets(type);
            updateBackgroundPreview(type);

            showMessage('预设删除成功！', 'success');
        } catch (error) {
            console.error('删除预设失败:', error);
            showMessage('删除预设失败: ' + error.message, 'error');

            // 恢复数据
            presets.splice(index, 0, preset);
            renderPresets(type);
        }
    }
}

// 更新视频预览
function updateVideoPreview() {
    const videoInput = document.getElementById('backgroundVideo');
    const videoPreview = document.getElementById('videoPreview');
    const placeholder = document.getElementById('videoPreviewPlaceholder');

    if (!videoInput || !videoPreview || !placeholder) return;

    const videoUrl = videoInput.value.trim();

    if (videoUrl) {
        videoPreview.src = videoUrl;
        videoPreview.style.display = 'block';
        placeholder.style.display = 'none';

        // 尝试播放视频
        videoPreview.load();
        videoPreview.play().catch(error => {
            console.log('视频自动播放失败:', error);
        });

        // 处理视频加载错误
        videoPreview.onerror = function () {
            videoPreview.style.display = 'none';
            placeholder.style.display = 'flex';
            placeholder.textContent = '视频加载失败';
        };

        // 视频加载成功
        videoPreview.onloadeddata = function () {
            placeholder.textContent = '暂无背景视频';
        };
    } else {
        videoPreview.style.display = 'none';
        placeholder.style.display = 'flex';
        placeholder.textContent = '暂无背景视频';
    }
}

// 监听输入框变化
document.addEventListener('DOMContentLoaded', function () {
    const profileImageInput = document.getElementById('profileImage');
    const backgroundImageInput = document.getElementById('backgroundImage');

    if (profileImageInput) {
        profileImageInput.addEventListener('input', () => updateBackgroundPreview('profile'));
    }

    if (backgroundImageInput) {
        backgroundImageInput.addEventListener('input', () => updateBackgroundPreview('right'));
    }

    // 初始化视频预览
    updateVideoPreview();
});