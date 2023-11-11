#!/usr/bin/python3
# -*- coding: utf-8 -*-
import logging
import os.path
import shutil

import git

LOG_FORMAT = "%(asctime)s %(filename)s[line:%(lineno)d] %(levelname)s %(message)s"
DATE_FORMAT = "%m/%d/%Y %H:%M:%S %p"
logging.basicConfig(level=logging.INFO, format=LOG_FORMAT, datefmt=DATE_FORMAT)

GIT_PROJECT_REMOTE_URL = 'https://gitee.com/GuoL-Stack/personal-notes-webpage.git'

SOURCE_PATH = '/home/GL/personal-notes/docs/.vitepress/dist/*'

GIT_PROJECT_PATH = '/home/GL/codes/'
GIT_PROJECT_NAME = 'personal-notes-webpage'
PROJECT_PATH = GIT_PROJECT_PATH + GIT_PROJECT_NAME

GIT_COMMIT_MSG = ':memo: 更新文档'


def init_git_project():
    """
    检查是否存在 git项目
    :return:
    """
    # 文件夹是否存在

    exists = os.path.exists(PROJECT_PATH)
    if not exists:
        logging.info(f'项目路径:{PROJECT_PATH} 不存在,开始 克隆项目!')
        # os.mkdir(GIT_PROJECT_PATH)
        gitrepo = git.Repo.clone_from(GIT_PROJECT_REMOTE_URL, PROJECT_PATH)
    # 项目是否被初始化
    git_init = os.path.exists(PROJECT_PATH + '/.git')
    if not git_init:
        logging.info(f'项目路径:{PROJECT_PATH} 存在,但是项目没有被初始化,开始 克隆项目!')
        shutil.rmtree(PROJECT_PATH)
        gitrepo = git.Repo.clone_from(GIT_PROJECT_REMOTE_URL, PROJECT_PATH)
    logging.info(f'项目路径:{PROJECT_PATH} ,初始化完成!')


def copy_files():
    logging.info(f'开始复制资源')
    # 获取当前目录下所有文件
    # 获取当前目录下的所有文件
    # files = [os.path.join(SOURCE_PATH, file) for file in os.listdir(SOURCE_PATH)]
    # 遍历文件列表，输出文件名
    # for file in files:
    #     split = file.split('/')
    #     shutil.copy(file, PROJECT_PATH + '/' + split[-1])
    # w os.popen(f'copy -rf {SOURCE_PATH}/* {PROJECT_PATH}')
    os.popen(f'cp -rf {SOURCE_PATH} {PROJECT_PATH}')
    logging.info(f'资源复制完成!')


def git_add_and_push():
    # https://baijiahao.baidu.com/s?id=1759216011543057955
    gitrepo = git.Repo(PROJECT_PATH)
    # 添加文件
    gitrepo.git.add('--all')
    # gitrepo.git.add(u=True)
    logging.info(f'资源添加完成!')
    # 提交更改
    gitrepo.index.commit(GIT_COMMIT_MSG)
    # 推送更改
    gitrepo.remote().push()
    logging.info(f'推送完成!')


if __name__ == '__main__':
    init_git_project()
    copy_files()
    git_add_and_push()
