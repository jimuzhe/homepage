#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
个人主页配置管理系统 - Python Flask 后端
作者: LongDz
功能: 提供配置文件的读取、保存和管理功能
"""

import os
import json
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_cors import CORS
import logging

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# 创建Flask应用
app = Flask(__name__)
CORS(app)  # 允许跨域请求

# 配置
CONFIG_FILE = '../frontend/public/config.json'
STATIC_DIR = '../frontend'


class ConfigManager:
    """配置文件管理器"""

    @staticmethod
    def load_config():
        """加载配置文件"""
        try:
            if not os.path.exists(CONFIG_FILE):
                logger.warning(f"⚠️ 配置文件不存在: {CONFIG_FILE}")
                return None

            with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                config = json.load(f)
            logger.info("📖 配置文件读取成功")
            return config
        except Exception as e:
            logger.error(f"❌ 读取配置文件失败: {e}")
            return None

    @staticmethod
    def save_config(config_data):
        """保存完整配置文件"""
        try:
            # 验证数据
            if not isinstance(config_data, dict):
                raise ValueError("配置数据必须是字典格式")

            # 保存新配置
            with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
                json.dump(config_data, f, ensure_ascii=False, indent=2)

            logger.info("💾 配置文件已更新")
            return True
        except Exception as e:
            logger.error(f"❌ 保存配置文件失败: {e}")
            raise

    @staticmethod
    def update_section(section, data):
        """更新配置文件的某个部分"""
        try:
            config = ConfigManager.load_config()
            if config is None:
                config = {}

            config[section] = data
            ConfigManager.save_config(config)
            logger.info(f"💾 配置部分 '{section}' 已更新")
            return True
        except Exception as e:
            logger.error(f"❌ 更新配置部分 '{section}' 失败: {e}")
            raise

    @staticmethod
    def get_section(section):
        """获取配置文件的某个部分"""
        try:
            config = ConfigManager.load_config()
            if config is None:
                return None
            return config.get(section)
        except Exception as e:
            logger.error(f"❌ 获取配置部分 '{section}' 失败: {e}")
            raise

    @staticmethod
    def add_item_to_array(section, item):
        """向数组类型的配置部分添加项目"""
        try:
            config = ConfigManager.load_config()
            if config is None:
                config = {}

            if section not in config:
                config[section] = []

            if not isinstance(config[section], list):
                raise ValueError(f"配置部分 '{section}' 不是数组类型")

            config[section].append(item)
            ConfigManager.save_config(config)
            logger.info(f"➕ 向 '{section}' 添加项目成功")
            return True
        except Exception as e:
            logger.error(f"❌ 向 '{section}' 添加项目失败: {e}")
            raise

    @staticmethod
    def update_item_in_array(section, index, item):
        """更新数组类型配置部分的某个项目"""
        try:
            config = ConfigManager.load_config()
            if config is None or section not in config:
                raise ValueError(f"配置部分 '{section}' 不存在")

            if not isinstance(config[section], list):
                raise ValueError(f"配置部分 '{section}' 不是数组类型")

            if index < 0 or index >= len(config[section]):
                raise ValueError(f"索引 {index} 超出范围")

            config[section][index] = item
            ConfigManager.save_config(config)
            logger.info(f"✏️ 更新 '{section}' 索引 {index} 的项目成功")
            return True
        except Exception as e:
            logger.error(f"❌ 更新 '{section}' 索引 {index} 的项目失败: {e}")
            raise

    @staticmethod
    def delete_item_from_array(section, index):
        """从数组类型的配置部分删除项目"""
        try:
            config = ConfigManager.load_config()
            if config is None or section not in config:
                raise ValueError(f"配置部分 '{section}' 不存在")

            if not isinstance(config[section], list):
                raise ValueError(f"配置部分 '{section}' 不是数组类型")

            if index < 0 or index >= len(config[section]):
                raise ValueError(f"索引 {index} 超出范围")

            deleted_item = config[section].pop(index)
            ConfigManager.save_config(config)
            logger.info(f"🗑️ 从 '{section}' 删除索引 {index} 的项目成功")
            return deleted_item
        except Exception as e:
            logger.error(f"❌ 从 '{section}' 删除索引 {index} 的项目失败: {e}")
            raise


# API路由
@app.route('/api/config', methods=['GET'])
def get_config():
    """获取配置信息"""
    try:
        config = ConfigManager.load_config()
        if config is None:
            return jsonify({
                'success': False,
                'error': '配置文件不存在或读取失败',
                'message': 'config.json文件未找到或格式错误'
            }), 404
        
        return jsonify({
            'success': True,
            'data': config,
            'message': '配置加载成功'
        })
    except Exception as e:
        logger.error(f"获取配置失败: {e}")
        return jsonify({
            'success': False,
            'error': '获取配置失败',
            'message': str(e)
        }), 500


@app.route('/api/config', methods=['POST'])
def save_config():
    """保存配置信息"""
    try:
        # 获取请求数据
        config_data = request.get_json()
        if not config_data:
            return jsonify({
                'success': False,
                'error': '无效的请求数据',
                'message': '请提供有效的JSON配置数据'
            }), 400
        
        # 保存配置
        ConfigManager.save_config(config_data)

        return jsonify({
            'success': True,
            'message': '配置保存成功！',
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"保存配置失败: {e}")
        return jsonify({
            'success': False,
            'error': '保存配置失败',
            'message': str(e)
        }), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查"""
    return jsonify({
        'success': True,
        'message': '服务运行正常',
        'timestamp': datetime.now().isoformat(),
        'config_exists': os.path.exists(CONFIG_FILE),
        'version': '2.0.0'
    })


@app.route('/api/login', methods=['POST'])
def login():
    """登录验证"""
    try:
        data = request.get_json()
        if not data or 'password' not in data:
            return jsonify({
                'success': False,
                'message': '请提供密码'
            }), 400

        password = data['password']
        # 这里可以从配置文件或环境变量读取密码
        # 目前使用硬编码，实际部署时应该使用更安全的方式
        correct_password = 'LongDz6299'  # 可以从环境变量或配置文件读取

        if password == correct_password:
            logger.info("✅ 用户登录成功")
            return jsonify({
                'success': True,
                'message': '登录成功'
            })
        else:
            logger.warning("❌ 用户登录失败：密码错误")
            return jsonify({
                'success': False,
                'message': '密码错误'
            }), 401

    except Exception as e:
        logger.error(f"❌ 登录验证失败: {e}")
        return jsonify({
            'success': False,
            'message': '登录验证失败'
        }), 500


# ==================== 细粒度 CRUD API ====================

@app.route('/api/profile', methods=['GET', 'PUT'])
def handle_profile():
    """处理个人信息"""
    if request.method == 'GET':
        try:
            profile = ConfigManager.get_section('profile')
            return jsonify({
                'success': True,
                'data': profile,
                'message': '个人信息获取成功'
            })
        except Exception as e:
            logger.error(f"获取个人信息失败: {e}")
            return jsonify({
                'success': False,
                'error': '获取个人信息失败',
                'message': str(e)
            }), 500

    elif request.method == 'PUT':
        try:
            profile_data = request.get_json()
            if not profile_data:
                return jsonify({
                    'success': False,
                    'error': '无效的请求数据',
                    'message': '请提供个人信息数据'
                }), 400

            ConfigManager.update_section('profile', profile_data)
            return jsonify({
                'success': True,
                'message': '个人信息更新成功',
                'timestamp': datetime.now().isoformat()
            })
        except Exception as e:
            logger.error(f"更新个人信息失败: {e}")
            return jsonify({
                'success': False,
                'error': '更新个人信息失败',
                'message': str(e)
            }), 500


@app.route('/api/contact', methods=['GET', 'PUT'])
def handle_contact():
    """处理联系信息"""
    if request.method == 'GET':
        try:
            contact = ConfigManager.get_section('contact')
            return jsonify({
                'success': True,
                'data': contact,
                'message': '联系信息获取成功'
            })
        except Exception as e:
            logger.error(f"获取联系信息失败: {e}")
            return jsonify({
                'success': False,
                'error': '获取联系信息失败',
                'message': str(e)
            }), 500

    elif request.method == 'PUT':
        try:
            contact_data = request.get_json()
            if not contact_data:
                return jsonify({
                    'success': False,
                    'error': '无效的请求数据',
                    'message': '请提供联系信息数据'
                }), 400

            ConfigManager.update_section('contact', contact_data)
            return jsonify({
                'success': True,
                'message': '联系信息更新成功',
                'timestamp': datetime.now().isoformat()
            })
        except Exception as e:
            logger.error(f"更新联系信息失败: {e}")
            return jsonify({
                'success': False,
                'error': '更新联系信息失败',
                'message': str(e)
            }), 500


@app.route('/api/skills', methods=['GET', 'POST'])
def handle_skills():
    """处理技能列表"""
    if request.method == 'GET':
        try:
            skills = ConfigManager.get_section('skills')
            return jsonify({
                'success': True,
                'data': skills or [],
                'message': '技能列表获取成功'
            })
        except Exception as e:
            logger.error(f"获取技能列表失败: {e}")
            return jsonify({
                'success': False,
                'error': '获取技能列表失败',
                'message': str(e)
            }), 500

    elif request.method == 'POST':
        try:
            skill_data = request.get_json()
            if not skill_data or 'name' not in skill_data:
                return jsonify({
                    'success': False,
                    'error': '无效的请求数据',
                    'message': '请提供技能名称'
                }), 400

            ConfigManager.add_item_to_array('skills', skill_data)
            return jsonify({
                'success': True,
                'message': '技能添加成功',
                'timestamp': datetime.now().isoformat()
            })
        except Exception as e:
            logger.error(f"添加技能失败: {e}")
            return jsonify({
                'success': False,
                'error': '添加技能失败',
                'message': str(e)
            }), 500


@app.route('/api/skills/<int:index>', methods=['PUT', 'DELETE'])
def handle_skill_item(index):
    """处理单个技能项目"""
    if request.method == 'PUT':
        try:
            skill_data = request.get_json()
            if not skill_data:
                return jsonify({
                    'success': False,
                    'error': '无效的请求数据',
                    'message': '请提供技能数据'
                }), 400

            ConfigManager.update_item_in_array('skills', index, skill_data)
            return jsonify({
                'success': True,
                'message': f'技能 {index} 更新成功',
                'timestamp': datetime.now().isoformat()
            })
        except Exception as e:
            logger.error(f"更新技能失败: {e}")
            return jsonify({
                'success': False,
                'error': '更新技能失败',
                'message': str(e)
            }), 500

    elif request.method == 'DELETE':
        try:
            deleted_skill = ConfigManager.delete_item_from_array('skills', index)
            return jsonify({
                'success': True,
                'message': f'技能删除成功',
                'data': deleted_skill,
                'timestamp': datetime.now().isoformat()
            })
        except Exception as e:
            logger.error(f"删除技能失败: {e}")
            return jsonify({
                'success': False,
                'error': '删除技能失败',
                'message': str(e)
            }), 500


@app.route('/api/projects', methods=['GET', 'POST'])
def handle_projects():
    """处理项目列表"""
    if request.method == 'GET':
        try:
            projects = ConfigManager.get_section('projects')
            return jsonify({
                'success': True,
                'data': projects or [],
                'message': '项目列表获取成功'
            })
        except Exception as e:
            logger.error(f"获取项目列表失败: {e}")
            return jsonify({
                'success': False,
                'error': '获取项目列表失败',
                'message': str(e)
            }), 500

    elif request.method == 'POST':
        try:
            project_data = request.get_json()
            if not project_data or 'name' not in project_data:
                return jsonify({
                    'success': False,
                    'error': '无效的请求数据',
                    'message': '请提供项目名称'
                }), 400

            ConfigManager.add_item_to_array('projects', project_data)
            return jsonify({
                'success': True,
                'message': '项目添加成功',
                'timestamp': datetime.now().isoformat()
            })
        except Exception as e:
            logger.error(f"添加项目失败: {e}")
            return jsonify({
                'success': False,
                'error': '添加项目失败',
                'message': str(e)
            }), 500


@app.route('/api/projects/<int:index>', methods=['PUT', 'DELETE'])
def handle_project_item(index):
    """处理单个项目"""
    if request.method == 'PUT':
        try:
            project_data = request.get_json()
            if not project_data:
                return jsonify({
                    'success': False,
                    'error': '无效的请求数据',
                    'message': '请提供项目数据'
                }), 400

            ConfigManager.update_item_in_array('projects', index, project_data)
            return jsonify({
                'success': True,
                'message': f'项目 {index} 更新成功',
                'timestamp': datetime.now().isoformat()
            })
        except Exception as e:
            logger.error(f"更新项目失败: {e}")
            return jsonify({
                'success': False,
                'error': '更新项目失败',
                'message': str(e)
            }), 500

    elif request.method == 'DELETE':
        try:
            deleted_project = ConfigManager.delete_item_from_array('projects', index)
            return jsonify({
                'success': True,
                'message': f'项目删除成功',
                'data': deleted_project,
                'timestamp': datetime.now().isoformat()
            })
        except Exception as e:
            logger.error(f"删除项目失败: {e}")
            return jsonify({
                'success': False,
                'error': '删除项目失败',
                'message': str(e)
            }), 500


@app.route('/api/friendlinks', methods=['GET', 'POST'])
def handle_friendlinks():
    """处理友情链接列表"""
    if request.method == 'GET':
        try:
            friendlinks = ConfigManager.get_section('friendLinks')
            return jsonify({
                'success': True,
                'data': friendlinks or [],
                'message': '友情链接列表获取成功'
            })
        except Exception as e:
            logger.error(f"获取友情链接列表失败: {e}")
            return jsonify({
                'success': False,
                'error': '获取友情链接列表失败',
                'message': str(e)
            }), 500

    elif request.method == 'POST':
        try:
            friendlink_data = request.get_json()
            if not friendlink_data or 'name' not in friendlink_data:
                return jsonify({
                    'success': False,
                    'error': '无效的请求数据',
                    'message': '请提供友情链接名称'
                }), 400

            ConfigManager.add_item_to_array('friendLinks', friendlink_data)
            return jsonify({
                'success': True,
                'message': '友情链接添加成功',
                'timestamp': datetime.now().isoformat()
            })
        except Exception as e:
            logger.error(f"添加友情链接失败: {e}")
            return jsonify({
                'success': False,
                'error': '添加友情链接失败',
                'message': str(e)
            }), 500


@app.route('/api/friendlinks/<int:index>', methods=['PUT', 'DELETE'])
def handle_friendlink_item(index):
    """处理单个友情链接"""
    if request.method == 'PUT':
        try:
            friendlink_data = request.get_json()
            if not friendlink_data:
                return jsonify({
                    'success': False,
                    'error': '无效的请求数据',
                    'message': '请提供友情链接数据'
                }), 400

            ConfigManager.update_item_in_array('friendLinks', index, friendlink_data)
            return jsonify({
                'success': True,
                'message': f'友情链接 {index} 更新成功',
                'timestamp': datetime.now().isoformat()
            })
        except Exception as e:
            logger.error(f"更新友情链接失败: {e}")
            return jsonify({
                'success': False,
                'error': '更新友情链接失败',
                'message': str(e)
            }), 500

    elif request.method == 'DELETE':
        try:
            deleted_friendlink = ConfigManager.delete_item_from_array('friendLinks', index)
            return jsonify({
                'success': True,
                'message': f'友情链接删除成功',
                'data': deleted_friendlink,
                'timestamp': datetime.now().isoformat()
            })
        except Exception as e:
            logger.error(f"删除友情链接失败: {e}")
            return jsonify({
                'success': False,
                'error': '删除友情链接失败',
                'message': str(e)
            }), 500


@app.route('/api/sociallinks', methods=['GET', 'PUT'])
def handle_sociallinks():
    """处理社交链接"""
    if request.method == 'GET':
        try:
            sociallinks = ConfigManager.get_section('socialLinks')
            return jsonify({
                'success': True,
                'data': sociallinks or [],
                'message': '社交链接获取成功'
            })
        except Exception as e:
            logger.error(f"获取社交链接失败: {e}")
            return jsonify({
                'success': False,
                'error': '获取社交链接失败',
                'message': str(e)
            }), 500

    elif request.method == 'PUT':
        try:
            sociallinks_data = request.get_json()
            if not sociallinks_data:
                return jsonify({
                    'success': False,
                    'error': '无效的请求数据',
                    'message': '请提供社交链接数据'
                }), 400

            ConfigManager.update_section('socialLinks', sociallinks_data)
            return jsonify({
                'success': True,
                'message': '社交链接更新成功',
                'timestamp': datetime.now().isoformat()
            })
        except Exception as e:
            logger.error(f"更新社交链接失败: {e}")
            return jsonify({
                'success': False,
                'error': '更新社交链接失败',
                'message': str(e)
            }), 500


@app.route('/api/music', methods=['GET', 'PUT'])
def handle_music():
    """处理音乐配置"""
    if request.method == 'GET':
        try:
            music = ConfigManager.get_section('music')
            return jsonify({
                'success': True,
                'data': music,
                'message': '音乐配置获取成功'
            })
        except Exception as e:
            logger.error(f"获取音乐配置失败: {e}")
            return jsonify({
                'success': False,
                'error': '获取音乐配置失败',
                'message': str(e)
            }), 500

    elif request.method == 'PUT':
        try:
            music_data = request.get_json()
            if not music_data:
                return jsonify({
                    'success': False,
                    'error': '无效的请求数据',
                    'message': '请提供音乐配置数据'
                }), 400

            ConfigManager.update_section('music', music_data)
            return jsonify({
                'success': True,
                'message': '音乐配置更新成功',
                'timestamp': datetime.now().isoformat()
            })
        except Exception as e:
            logger.error(f"更新音乐配置失败: {e}")
            return jsonify({
                'success': False,
                'error': '更新音乐配置失败',
                'message': str(e)
            }), 500


@app.route('/api/background', methods=['GET', 'PUT'])
def handle_background():
    """处理背景配置"""
    if request.method == 'GET':
        try:
            background = ConfigManager.get_section('background')
            return jsonify({
                'success': True,
                'data': background,
                'message': '背景配置获取成功'
            })
        except Exception as e:
            logger.error(f"获取背景配置失败: {e}")
            return jsonify({
                'success': False,
                'error': '获取背景配置失败',
                'message': str(e)
            }), 500

    elif request.method == 'PUT':
        try:
            background_data = request.get_json()
            if not background_data:
                return jsonify({
                    'success': False,
                    'error': '无效的请求数据',
                    'message': '请提供背景配置数据'
                }), 400

            ConfigManager.update_section('background', background_data)
            return jsonify({
                'success': True,
                'message': '背景配置更新成功',
                'timestamp': datetime.now().isoformat()
            })
        except Exception as e:
            logger.error(f"更新背景配置失败: {e}")
            return jsonify({
                'success': False,
                'error': '更新背景配置失败',
                'message': str(e)
            }), 500


# 静态文件路由
@app.route('/')
def index():
    """主页"""
    return send_file('../frontend/index.html')


@app.route('/admin')
def admin():
    """管理后台"""
    return send_file('../frontend/admin.html')


@app.route('/<path:filename>')
def static_files(filename):
    """静态文件服务"""
    return send_from_directory(STATIC_DIR, filename)


# 错误处理
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': '页面未找到',
        'message': '请求的资源不存在'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': '服务器内部错误',
        'message': '请稍后重试或联系管理员'
    }), 500


if __name__ == '__main__':
    # 启动信息
    port = int(os.environ.get('PORT', 3001))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    print("🚀 个人主页配置管理系统 v2.1 启动中...")
    print(f"📍 主页地址: http://localhost:{port}")
    print(f"🔧 管理后台: http://localhost:{port}/admin")
    print(f"📁 配置文件: {os.path.abspath(CONFIG_FILE)}")
    print("\n🔧 API端点:")
    print(f"   GET  /api/config         - 读取完整配置")
    print(f"   POST /api/config         - 保存完整配置")
    print(f"   POST /api/login          - 登录验证")
    print(f"   GET  /api/health         - 健康检查")
    print(f"\n📋 细粒度CRUD API:")
    print(f"   GET/PUT  /api/profile    - 个人信息")
    print(f"   GET/PUT  /api/contact    - 联系信息")
    print(f"   GET/POST /api/skills     - 技能列表")
    print(f"   PUT/DEL  /api/skills/<id> - 单个技能")
    print(f"   GET/POST /api/projects   - 项目列表")
    print(f"   PUT/DEL  /api/projects/<id> - 单个项目")
    print(f"   GET/POST /api/friendlinks - 友情链接")
    print(f"   PUT/DEL  /api/friendlinks/<id> - 单个友链")
    print(f"   GET/PUT  /api/sociallinks - 社交链接")
    print(f"   GET/PUT  /api/music      - 音乐配置")
    print(f"   GET/PUT  /api/background - 背景配置")
    print("\n💡 使用说明:")
    print(f"   1. 访问主页: http://localhost:{port}")
    print(f"   2. 管理配置: http://localhost:{port}/admin")
    print(f"   3. 使用细粒度API进行精确的数据管理!")
    print(f"   4. 每个页面都有独立的保存按钮，只更新对应数据!")
    
    # 启动应用
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug,
        threaded=True
    )
