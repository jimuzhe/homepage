// 加载配置文件并渲染页面
async function loadConfig() {
    console.log('🔄 开始加载配置文件...');

    try {
        // 直接从本地config.json加载配置
        console.log('📁 从本地config.json加载配置...');
        const fileResponse = await fetch('./config.json');
        console.log('📄 文件响应状态:', fileResponse.status, fileResponse.statusText);

        if (fileResponse.ok) {
            const config = await fileResponse.json();
            console.log('✅ 从本地config.json加载配置成功');
            console.log('📊 配置数据:', config);
            renderProfile(config);
            return;
        } else {
            console.error('❌ 配置文件响应失败:', fileResponse.status, fileResponse.statusText);
        }
    } catch (error) {
        console.error('❌ 配置文件加载失败:', error);
        console.error('❌ 错误详情:', error.message, error.stack);
    }

    console.log('⚠️ 配置文件加载失败');
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
        if (birthdayEl && profile.birthday) birthdayEl.textContent = profile.birthday;
        if (descriptionEl && profile.description) descriptionEl.textContent = profile.description;

        // 设置右侧背景（图片或视频）
        console.log('🖼️ 设置背景...');
        setRightBackground(profile);

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
                    a.innerHTML = `
                    <div class="project-link-icon"><i class="${project.icon}"></i></div>
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
            const response = await fetch('./config.json');
            const config = await response.json();

            if (config.music) {
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
            }
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
            this.audio.play().catch(error => {
                console.error('播放失败:', error);
            });
        }
    }

    // 自动播放方法
    autoPlay() {
        // 延迟一点时间确保音频加载完成
        setTimeout(() => {
            this.audio.play().catch(error => {
                console.log('自动播放被浏览器阻止，需要用户交互后播放:', error);
                // 添加用户交互监听器来启动播放
                this.addUserInteractionListener();
            });
        }, 500);
    }

    // 添加用户交互监听器
    addUserInteractionListener() {
        const startPlayback = () => {
            this.audio.play().catch(e => console.log('播放失败:', e));
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

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function () {
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
        const response = await fetch('config.json');
        const config = await response.json();

        if (config.background && config.background.profileImage) {
            // 创建动态样式来设置斜分割线区域的背景
            const styleId = 'dynamic-background-style';
            let styleElement = document.getElementById(styleId);

            if (!styleElement) {
                styleElement = document.createElement('style');
                styleElement.id = styleId;
                document.head.appendChild(styleElement);
            }

            // 直接用图片填充斜分割线左侧区域
            styleElement.textContent = `
                .container::before {
                    background: url('${config.background.profileImage}') center center / cover no-repeat !important;
                }
                .profile-section {
                    background: transparent !important;
                }
            `;
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