#!/usr/bin/python3
# -*- coding: utf-8 -*-

import git


def init_web_page():
    
    gitrepo = git.Repo.init('/path/to/repo')