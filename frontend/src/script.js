// 图标转换工具函数
function convertIconClass(iconClass) {
    if (!iconClass || !iconClass.startsWith('fa fa-')) {
        return iconClass;
    }

    const iconName = iconClass.replace('fa fa-', '');
    console.log(`🔄 转换图标: ${iconClass} -> ${iconName}`);

    // Font Awesome 4.x -> 6.x 图标映射表
    const iconMapping = {
        'hand-o-up': 'hand-point-up',
        'hand-o-down': 'hand-point-down',
        'heart-o': 'heart',
        'star-o': 'star',
        'circle-o': 'circle',
        'square-o': 'square',
        'picture-o': 'image',
        'file-o': 'file',
        'folder-o': 'folder',
        'book-o': 'book',
        'caret-square-o-up': 'square-caret-up',
        'youtube-play': 'play',
        'check-circle-o': 'circle-check',
        'bell-o': 'bell',
        'envelope-o': 'envelope'
    };

    const mappedIcon = iconMapping[iconName] || iconName;
    const brandIcons = ['github', 'twitter', 'facebook', 'instagram', 'linkedin', 'youtube', 'react'];
    const regularIcons = ['heart', 'star', 'circle', 'square', 'bell', 'envelope'];

    let convertedClass;
    if (brandIcons.some(brand => iconName.includes(brand) || mappedIcon.includes(brand))) {
        convertedClass = `fab fa-${mappedIcon}`;
    } else if (iconName.includes('-o') || regularIcons.includes(mappedIcon)) {
        convertedClass = `far fa-${mappedIcon}`;
    } else {
        convertedClass = `fas fa-${mappedIcon}`;
    }

    console.log(`✅ 图标转换结果: ${convertedClass}`);
    return convertedClass;
}

// 获取API端点
function getApiUrl() {
    const baseUrl = window.location.origin;
    return `${baseUrl}/api/config`;
}

// 应用毛玻璃效果设置
function applyGlassMorphismSettings(backgroundConfig) {
    const profileSection = document.querySelector('.profile-section');
    if (!profileSection) return;

    if (backgroundConfig && backgroundConfig.enableGlassMorphism !== false) {
        // 启用毛玻璃效果（默认启用）
        profileSection.classList.add('glass-morphism');
        console.log('✅ 毛玻璃效果已启用');
    } else {
        // 禁用毛玻璃效果
        profileSection.classList.remove('glass-morphism');
        console.log('❌ 毛玻璃效果已禁用');
    }
}

// 加载配置文件并渲染页面
async function loadConfig() {
    console.log('🔄 开始从API加载配置文件...');

    try {
        // 从后端API加载配置
        console.log('� 从后端API加载配置...');
        const apiResponse = await fetch(getApiUrl());
        console.log('📄 API响应状态:', apiResponse.status, apiResponse.statusText);

        if (apiResponse.ok) {
            const result = await apiResponse.json();
            if (result.success && result.data) {
                console.log('✅ 从API加载配置成功');
                console.log('📊 配置数据:', result.data);
                renderProfile(result.data);
                return;
            } else {
                console.error('❌ API返回错误:', result.message || '未知错误');
            }
        } else {
            console.error('❌ API响应失败:', apiResponse.status, apiResponse.statusText);
        }
    } catch (error) {
        console.error('❌ 从API加载配置失败:', error);
        console.error('❌ 错误详情:', error.message, error.stack);
    }

    // 如果API加载失败，显示错误信息
    console.error('❌ 无法从后端API加载配置文件');
    document.body.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: #1a1f23; color: #fff; font-family: Arial, sans-serif;">
            <div style="text-align: center;">
                <h2>⚠️ 配置加载失败</h2>
                <p>无法连接到后端服务器或配置文件不存在</p>
                <p>请确保后端服务正在运行：<code>python backend/app.py</code></p>
                <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">重新加载</button>
            </div>
        </div>
    `;
}

// 渲染个人信息
function renderProfile(config) {
    try {
        console.log('🎨 开始渲染页面...');
        console.log('📋 配置数据结构:', Object.keys(config));

        if (!config || typeof config !== 'object') {
            throw new Error('配置数据无效');
        }

        const {
            profile,
            contact,
            skills,
            friendLinks
        } = config;

        if (!profile) {
            throw new Error('缺少profile配置');
        }

        console.log('👤 渲染个人信息...');
        // 基本信息
        const avatarEl = document.getElementById('avatar');
        const nameEl = document.getElementById('name');
        const titleEl = document.getElementById('title');
        const birthdayEl = document.getElementById('birthday');
        const descriptionEl = document.getElementById('description');

        if (avatarEl && profile.avatar) avatarEl.src = profile.avatar;
        if (nameEl && profile.name) nameEl.textContent = profile.name;
        if (titleEl && profile.title) titleEl.textContent = profile.title;
        if (birthdayEl && profile.birthday) {
            // 处理生日显示，只显示月日，不显示年份
            let birthdayDisplay = profile.birthday;
            if (profile.birthday.includes('-')) {
                // 如果是日期格式 (YYYY-MM-DD)，提取月日部分
                const dateParts = profile.birthday.split('-');
                if (dateParts.length === 3) {
                    const month = parseInt(dateParts[1]);
                    const day = parseInt(dateParts[2]);
                    birthdayDisplay = `${month}月${day}日`;
                }
            }
            birthdayEl.textContent = `生辰: ${birthdayDisplay}`;
        }
        if (descriptionEl && profile.description) descriptionEl.textContent = profile.description;

        // 设置右侧背景（图片或视频）
        console.log('🖼️ 设置背景...');
        setRightBackground(profile);

        // 应用毛玻璃效果设置
        console.log('✨ 应用毛玻璃效果设置...');
        applyGlassMorphismSettings(config.background);

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

        // 渲染社交媒体按钮
        console.log('🔗 渲染社交媒体按钮...');
        const socialButtonsContainer = document.querySelector('.social-media-buttons');
        if (socialButtonsContainer && config.socialLinks) {
            socialButtonsContainer.innerHTML = '';
            config.socialLinks.forEach(social => {
                if (social.name && social.url && social.url !== '#' && social.url !== '') {
                    const socialButton = document.createElement('a');
                    socialButton.className = 'social-button';
                    socialButton.href = social.url;
                    socialButton.target = '_blank';
                    socialButton.rel = 'noopener noreferrer';

                    // 根据社交媒体名称设置图标
                    let iconClass = 'fa-brands fa-link'; // 默认图标
                    const socialName = social.name.toLowerCase();

                    if (socialName.includes('github')) {
                        iconClass = 'fa-brands fa-github';
                    } else if (socialName.includes('twitter') || socialName.includes('x')) {
                        iconClass = 'fa-brands fa-x-twitter';
                    } else if (socialName.includes('linkedin')) {
                        iconClass = 'fa-brands fa-linkedin';
                    } else if (socialName.includes('微博') || socialName.includes('weibo')) {
                        iconClass = 'fa-brands fa-weibo';
                    } else if (socialName.includes('facebook')) {
                        iconClass = 'fa-brands fa-facebook';
                    } else if (socialName.includes('instagram')) {
                        iconClass = 'fa-brands fa-instagram';
                    } else if (socialName.includes('youtube')) {
                        iconClass = 'fa-brands fa-youtube';
                    } else if (socialName.includes('bilibili') || socialName.includes('b站')) {
                        iconClass = 'fa-brands fa-bilibili';
                    }

                    socialButton.innerHTML = `
                        <i class="${iconClass}"></i>
                        <span>${social.name}</span>
                    `;

                    socialButtonsContainer.appendChild(socialButton);
                }
            });
        }

        // 技能标签（Simple Icons SVG）
        const skillTagsContainer = document.getElementById('skill-tags');
        skillTagsContainer.innerHTML = '';
        skills.forEach(skill => {
            // 处理新的技能格式（支持字符串和对象）
            const skillName = typeof skill === 'string' ? skill : skill.name;
            const skillLevel = typeof skill === 'string' ? '掌握' : skill.level;

            // Simple Icons slug规则：全小写，空格/点/加号/下划线/斜杠等转为无
            let slug = skillName.toLowerCase().replace(/(\s|\.|\+|_|\/)/g, '');
            // 特殊处理部分slug
            if (slug === 'springboot') slug = 'springboot';
            if (slug === 'css3') slug = 'css3';
            if (slug === 'c++') slug = 'cplusplus';
            if (slug === 'c#') slug = 'csharp';
            // Simple Icons CDN
            const iconUrl = `https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/${slug}.svg`;
            const skillTag = document.createElement('div');
            skillTag.className = 'skill-tag';
            skillTag.setAttribute('data-level', skillLevel);
            skillTag.title = skillName; // 添加tooltip显示技能名
            skillTag.innerHTML = `<img src="${iconUrl}" alt="${skillName}" style="width:36px;height:36px;display:block;filter:brightness(0) saturate(100%) invert(15%) sepia(8%) saturate(1%) hue-rotate(314deg) brightness(95%) contrast(89%);">`;
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

                // 判断图标类型：URL还是FontAwesome类名
                let iconHtml = '';
                if (link.icon) {
                    if (link.icon.startsWith('http') || link.icon.startsWith('//') || link.icon.includes('.')) {
                        // 图片URL
                        iconHtml = `<img src="${link.icon}" alt="${link.name}" class="friend-link-icon" style="filter: invert(80%) grayscale(1);">`;
                    } else {
                        // FontAwesome类名 - 使用转换函数
                        const convertedClass = convertIconClass(link.icon);
                        iconHtml = `<div class="friend-link-icon"><i class="${convertedClass}" style="font-size: 24px; color: #888;"></i></div>`;
                    }
                } else {
                    // 默认图标
                    iconHtml = `<div class="friend-link-icon"><i class="fas fa-link" style="font-size: 24px; color: #888;"></i></div>`;
                }

                linkElement.innerHTML = `
                ${iconHtml}
                <div class="friend-link-info">
                    <div class="friend-link-name">${link.name}</div>
                    <div class="friend-link-desc">${link.description}</div>
                </div>
            `;
                friendLinksContainer.appendChild(linkElement);
            });
        }

        // 渲染项目卡片
        if (config.projects && config.projects.length > 0) {
            const projectsContainer = document.querySelector('.projects-container');
            if (projectsContainer) {
                projectsContainer.innerHTML = '';
                config.projects.forEach(project => {
                    const a = document.createElement('a');
                    a.className = 'project-link';
                    a.href = project.url || '#';
                    a.target = '_blank';
                    // 判断图标类型：URL还是FontAwesome类名
                    let iconHtml = '';
                    if (project.icon) {
                        if (project.icon.startsWith('http') || project.icon.startsWith('//') || project.icon.includes('.')) {
                            // 图片URL
                            iconHtml = `<img src="${project.icon}" alt="${project.name}" style="width: 24px; height: 24px; object-fit: contain;">`;
                        } else {
                            // FontAwesome类名 - 使用转换函数
                            const convertedClass = convertIconClass(project.icon);
                            iconHtml = `<i class="${convertedClass}"></i>`;
                        }
                    } else {
                        // 默认图标
                        iconHtml = `<i class="fas fa-code"></i>`;
                    }

                    a.innerHTML = `
                    <div class="project-link-icon">${iconHtml}</div>
                    <div class="project-link-info">
                        <div class="project-link-title">${project.name}</div>
                        <div class="project-link-desc">${project.desc || ''}</div>
                    </div>
                    <div class="project-link-arrow"><i class="fas fa-chevron-right"></i></div>
                `;
                    projectsContainer.appendChild(a);
                });
            }
        }
    } catch (error) {
        console.error('❌ 渲染页面失败:', error);
        console.error('❌ 错误详情:', error.message, error.stack);

        // 显示错误信息给用户
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #ff4757;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            z-index: 10000;
            font-family: Arial, sans-serif;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        errorDiv.textContent = `配置加载失败: ${error.message}`;
        document.body.appendChild(errorDiv);

        // 5秒后自动移除错误提示
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
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

// 音乐播放器类
class MusicPlayer {
    constructor() {
        this.audio = document.getElementById('audioPlayer');
        this.songText = document.getElementById('songText');
        this.albumCover = document.getElementById('albumCover');
        this.vinylRecord = document.getElementById('vinylRecord');

        this.currentSongIndex = 0;
        this.playlist = [];
        this.isPlaying = false;
        this.currentSongData = null;

        this.init();
    }

    async init() {
        // 设置单曲循环
        this.audio.loop = true;

        // 绑定事件
        this.audio.addEventListener('ended', () => this.nextSong());
        this.audio.addEventListener('play', () => this.onPlay());
        this.audio.addEventListener('pause', () => this.onPause());

        // 点击播放器切换播放状态
        document.getElementById('musicPlayer').addEventListener('click', () => this.togglePlay());

        // 加载配置
        await this.loadMusicConfig();
    }

    async loadMusicConfig() {
        try {
            const response = await fetch(getApiUrl());
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data && result.data.music) {
                    const config = result.data;
                    this.playlist = config.music.playlist || [];
                    const currentId = config.music.currentSongId;

                    if (currentId && this.playlist.includes(currentId)) {
                        this.currentSongIndex = this.playlist.indexOf(currentId);
                    }

                    if (this.playlist.length > 0) {
                        await this.loadSong(this.playlist[this.currentSongIndex]);
                        // 自动播放
                        this.autoPlay();
                    }
                    return;
                }
            }
            throw new Error('API响应失败');
        } catch (error) {
            console.error('加载音乐配置失败:', error);
            // 使用默认歌曲
            this.playlist = ['1901371647'];
            await this.loadSong(this.playlist[0]);
            // 默认歌曲也自动播放
            this.autoPlay();
        }
    }

    async loadSong(songId) {
        try {
            this.songText.textContent = '加载中...';

            // 获取歌曲信息
            const songInfo = await this.getSongInfo(songId);

            if (songInfo) {
                this.currentSongData = songInfo;
                this.updateUI();

                // 无论是否为VIP歌曲，都尝试设置音频源并自动播放
                if (songInfo.link) {
                    this.audio.src = songInfo.link;
                    // 设置音频源后自动播放
                    this.autoPlay();
                }

                // 如果是VIP歌曲，在控制台提示但不阻止播放
                if (songInfo.served) {
                    console.log('这是VIP歌曲，尝试播放');
                }
            } else {
                throw new Error('获取歌曲信息失败');
            }
        } catch (error) {
            console.error('加载歌曲失败:', error);
            this.songText.textContent = '加载失败 请检查网络';
        }
    }

    async getSongInfo(songId) {
        try {
            // 调用提供的API
            const response = await fetch(`https://api.paugram.com/netease/?id=${songId}`);
            if (response.ok) {
                const data = await response.json();
                return data;
            } else {
                throw new Error('API请求失败');
            }
        } catch (error) {
            console.error('获取歌曲信息失败:', error);

            // 备用方案：使用模拟数据
            const mockData = {
                title: "网易云音乐",
                artist: "未知艺术家",
                album: "未知专辑",
                cover: "https://p1.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg",
                link: `https://music.163.com/song/media/outer/url?id=${songId}`,
                lyric: "",
                sub_lyric: "",
                served: false
            };

            return mockData;
        }
    }

    updateUI() {
        if (this.currentSongData) {
            // 将歌曲名和艺术家用空格连接在同一行显示
            const songText = `${this.currentSongData.title} ${this.currentSongData.artist}`;
            this.songText.textContent = songText;
            this.albumCover.src = this.currentSongData.cover;

            // 检查文本是否需要滚动
            this.checkTextScroll();
        }
    }

    checkTextScroll() {
        // 检查文本是否超出容器宽度
        const textElement = this.songText;
        const containerWidth = textElement.parentElement.offsetWidth;

        // 创建临时元素来测量文本宽度
        const tempElement = document.createElement('span');
        tempElement.style.visibility = 'hidden';
        tempElement.style.position = 'absolute';
        tempElement.style.fontSize = window.getComputedStyle(textElement).fontSize;
        tempElement.style.fontWeight = window.getComputedStyle(textElement).fontWeight;
        tempElement.textContent = textElement.textContent;
        document.body.appendChild(tempElement);

        const textWidth = tempElement.offsetWidth;
        document.body.removeChild(tempElement);

        // 如果文本宽度超出容器，添加滚动动画
        if (textWidth > containerWidth - 20) { // 留一些边距
            textElement.classList.add('scrolling');
        } else {
            textElement.classList.remove('scrolling');
        }
    }

    togglePlay() {
        if (this.isPlaying) {
            this.audio.pause();
        } else {
            // 如果音量为0，说明是首次播放，需要渐变
            if (this.audio.volume === 0) {
                this.audio.play().then(() => {
                    this.fadeInVolume();
                }).catch(error => {
                    console.error('播放失败:', error);
                });
            } else {
                // 正常播放
                this.audio.play().catch(error => {
                    console.error('播放失败:', error);
                });
            }
        }
    }

    // 自动播放方法
    autoPlay() {
        // 延迟一点时间确保音频加载完成
        setTimeout(() => {
            // 设置初始音量为0，准备渐变
            this.audio.volume = 0;
            this.audio.play().then(() => {
                // 播放成功后开始音量渐变
                this.fadeInVolume();
            }).catch(error => {
                console.log('自动播放被浏览器阻止，需要用户交互后播放:', error);
                // 添加用户交互监听器来启动播放
                this.addUserInteractionListener();
            });
        }, 500);
    }

    // 音量渐变方法
    fadeInVolume() {
        const targetVolume = 0.7; // 目标音量
        const fadeTime = 3000; // 渐变时间3秒
        const steps = 60; // 渐变步数
        const volumeStep = targetVolume / steps;
        const timeStep = fadeTime / steps;

        let currentStep = 0;

        const fadeInterval = setInterval(() => {
            currentStep++;
            const newVolume = Math.min(volumeStep * currentStep, targetVolume);
            this.audio.volume = newVolume;

            if (currentStep >= steps || newVolume >= targetVolume) {
                clearInterval(fadeInterval);
                this.audio.volume = targetVolume;
                console.log('🎵 音乐音量渐变完成，当前音量:', targetVolume);
            }
        }, timeStep);
    }

    // 添加用户交互监听器
    addUserInteractionListener() {
        const startPlayback = () => {
            // 设置初始音量为0，准备渐变
            this.audio.volume = 0;
            this.audio.play().then(() => {
                // 播放成功后开始音量渐变
                this.fadeInVolume();
            }).catch(e => console.log('播放失败:', e));

            // 同时尝试播放背景视频
            const backgroundVideo = document.querySelector('.background-video');
            if (backgroundVideo) {
                backgroundVideo.play().catch(e => console.log('视频播放失败:', e));
            }
            // 移除监听器
            document.removeEventListener('click', startPlayback);
            document.removeEventListener('touchstart', startPlayback);
            document.removeEventListener('keydown', startPlayback);
        };

        // 监听各种用户交互事件
        document.addEventListener('click', startPlayback, {
            once: true
        });
        document.addEventListener('touchstart', startPlayback, {
            once: true
        });
        document.addEventListener('keydown', startPlayback, {
            once: true
        });
    }

    onPlay() {
        this.isPlaying = true;
        this.vinylRecord.classList.add('spinning');
    }

    onPause() {
        this.isPlaying = false;
        this.vinylRecord.classList.remove('spinning');
    }

    async previousSong() {
        if (this.playlist.length > 1) {
            this.currentSongIndex = (this.currentSongIndex - 1 + this.playlist.length) % this.playlist.length;
            await this.loadSong(this.playlist[this.currentSongIndex]);
        }
    }

    async nextSong() {
        if (this.playlist.length > 1) {
            this.currentSongIndex = (this.currentSongIndex + 1) % this.playlist.length;
            await this.loadSong(this.playlist[this.currentSongIndex]);
        }
    }
}

// 侧边栏控制功能
function initSidebarToggle() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const profileSection = document.getElementById('profileSection');
    const centerTitle = document.getElementById('centerTitle');
    const container = document.querySelector('.container');

    if (!sidebarToggle || !profileSection || !centerTitle || !container) {
        console.warn('侧边栏控制元素未找到');
        return;
    }

    // 默认状态：侧边栏展开，中心标题隐藏
    centerTitle.classList.add('hidden');

    // 切换侧边栏的函数
    function toggleSidebar() {
        const isCollapsed = profileSection.classList.contains('collapsed');

        if (isCollapsed) {
            // 展开侧边栏
            profileSection.classList.remove('collapsed');
            container.classList.remove('sidebar-collapsed');
            centerTitle.classList.add('hidden');
            sidebarToggle.classList.remove('active');
            sidebarToggle.innerHTML = '<i class="fas fa-bars"></i>';
            console.log('📖 侧边栏已展开');
        } else {
            // 收回侧边栏
            profileSection.classList.add('collapsed');
            container.classList.add('sidebar-collapsed');
            centerTitle.classList.remove('hidden');
            sidebarToggle.classList.add('active');
            sidebarToggle.innerHTML = '<i class="fas fa-times"></i>';
            console.log('📕 侧边栏已收回');
        }
    }

    // 点击按钮切换
    sidebarToggle.addEventListener('click', toggleSidebar);

    // 键盘快捷键支持 (ESC键)
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            toggleSidebar();
        }
    });

    console.log('✅ 侧边栏控制功能初始化完成');
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function () {
    // 初始化侧边栏控制
    initSidebarToggle();

    loadConfig();
    setSiteDays();
    setupTabs();

    // 初始化音乐播放器
    const musicPlayer = new MusicPlayer();

    // 设置背景图片
    setProfileBackground();
});

// 设置右侧背景（图片或视频）
function setRightBackground(profile) {
    console.log('🖼️ setRightBackground 被调用');

    // 检查DOM是否已加载
    if (document.readyState === 'loading') {
        console.log('⏳ DOM还在加载中，延迟执行背景设置');
        document.addEventListener('DOMContentLoaded', () => {
            setRightBackground(profile);
        });
        return;
    }

    const rightSection = document.querySelector('.image-section');
    if (!rightSection) {
        console.error('❌ 找不到 .image-section 元素');
        return;
    }

    const existingVideo = rightSection.querySelector('.background-video');
    const existingImage = rightSection.querySelector('#background-image');

    // 清除现有背景
    if (existingVideo) {
        existingVideo.remove();
    }

    // 根据背景类型设置背景
    if (profile.backgroundType === 'video' && profile.backgroundVideo) {
        // 隐藏背景图片
        if (existingImage) {
            existingImage.style.display = 'none';
        }

        // 创建视频背景
        const video = document.createElement('video');
        video.className = 'background-video';
        video.src = profile.backgroundVideo;
        video.autoplay = true;
        video.loop = true;
        video.muted = true; // 必须静音才能自动播放
        video.playsInline = true; // 移动端内联播放
        // CSS类已经定义了所有必要的样式

        rightSection.insertBefore(video, rightSection.firstChild);

        // 确保视频自动播放
        video.addEventListener('loadeddata', () => {
            video.play().catch(e => {
                console.log('视频自动播放失败，等待用户交互:', e);
                // 如果视频自动播放失败，等待用户交互
                addVideoInteractionListener(video);
            });
        });

    } else {
        // 使用图片背景
        // 重置容器样式（移除可能的position: relative）
        rightSection.style.position = '';

        if (existingImage) {
            existingImage.style.display = 'block';
            existingImage.src = profile.backgroundImage || '';
        }
    }
}

// 添加视频用户交互监听器
function addVideoInteractionListener(video) {
    const startVideoPlayback = () => {
        video.play().catch(e => console.log('视频播放失败:', e));
        // 移除监听器
        document.removeEventListener('click', startVideoPlayback);
        document.removeEventListener('touchstart', startVideoPlayback);
        document.removeEventListener('keydown', startVideoPlayback);
    };

    // 监听各种用户交互事件
    document.addEventListener('click', startVideoPlayback, {
        once: true
    });
    document.addEventListener('touchstart', startVideoPlayback, {
        once: true
    });
    document.addEventListener('keydown', startVideoPlayback, {
        once: true
    });
}



// 设置个人资料区域背景图片
async function setProfileBackground() {
    try {
        const response = await fetch(getApiUrl());
        if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
                const config = result.data;

                // 创建动态样式来设置斜分割线区域的背景
                const styleId = 'dynamic-background-style';
                let styleElement = document.getElementById(styleId);

                if (!styleElement) {
                    styleElement = document.createElement('style');
                    styleElement.id = styleId;
                    document.head.appendChild(styleElement);
                }

                // 检查是否显示背景图片
                if (config.background && config.background.showBackgroundImage && config.background.profileImage) {
                    console.log('✅ 显示背景图片:', config.background.profileImage);
                    // 显示背景图片 - 在毛玻璃效果下方添加背景图片
                    styleElement.textContent = `
                        .profile-section::before {
                            background:
                                linear-gradient(135deg,
                                    rgba(26, 31, 35, 0.8) 0%,
                                    rgba(26, 31, 35, 0.6) 50%,
                                    rgba(26, 31, 35, 0.7) 100%),
                                url('${config.background.profileImage}') center center / cover no-repeat !important;
                        }
                    `;
                } else {
                    console.log('🚫 隐藏背景图片，使用纯色背景');
                    // 不显示背景图片，使用纯色背景
                    styleElement.textContent = `
                        .profile-section::before {
                            background: linear-gradient(135deg,
                                rgba(26, 31, 35, 0.8) 0%,
                                rgba(26, 31, 35, 0.6) 50%,
                                rgba(26, 31, 35, 0.7) 100%) !important;
                        }
                    `;
                }
            }
        }
    } catch (error) {
        console.error('设置背景图片失败:', error);
    }
}

// 快速白色粒子点击特效
function createClickEffect(x, y) {
    // 创建多个快速散开的白色小粒子
    const particleCount = 12;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'click-particle';

        // 360度随机分布
        const angle = Math.random() * 2 * Math.PI;
        const distance = 30 + Math.random() * 60;
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;

        // 从点击位置开始
        particle.style.left = (x - 1) + 'px';
        particle.style.top = (y - 1) + 'px';
        particle.style.setProperty('--dx', dx + 'px');
        particle.style.setProperty('--dy', dy + 'px');

        // 很小的随机延迟，让散开更自然
        particle.style.animationDelay = Math.random() * 0.05 + 's';

        document.body.appendChild(particle);

        // 快速移除粒子
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 400);
    }
}

// 添加全局点击事件监听器
let clickEffectEnabled = true;
document.addEventListener('click', function (e) {
    if (clickEffectEnabled) {
        createClickEffect(e.clientX, e.clientY);

        // 短暂禁用以防止重复触发
        clickEffectEnabled = false;
        setTimeout(() => {
            clickEffectEnabled = true;
        }, 50);
    }
});