[[TOC]]

# 第十三章 多线程

## 13.1 进程 与 线程

略

## 13.2 使用线程

### 13.2.1 全局解释器锁

python 代码 由python 虚拟机（解释器主循环） 控制，并且在主循环中 只能一个主线执行。

而所谓的 多线程 便是 在 任意时刻只有一个线程在 解释器中运行。

Python 虚拟机的访问由全局 解释器锁（GIL）控制，这个锁 能保证 同一时刻 只能 有一个 线程运行。

多线程环境下，执行 方式：

1. 设置 GIL
2. 切换到一个线程运行
3. 运行指定数量的字节码指令 或者 线程主动让出控制
4. 把 线程设置为睡眠状态
5. 解锁 GIL
6. 再次重复

调用 外部代码 （如 C/C++），GIL 将被锁定。 直到 执行完成，编写 扩展的 人员 可以主动 解锁GIL

### 13.2.2 推出线程

当一个线程结束计算， 它就推出。线程 可以 调用 `_thread.exit()`等函数 退出。也可以 使用 Python 推出进程的标准方法 `sys.exit()` 或者 抛出一个 SystemExit . 不过 不能 直接 杀掉 线程

### 13.2.3 Python 线程模块

常用的 多线程模块： **_thread threading 和 Queue** 

**_thread threading ** 允许 程序员 创建和 管理 线程。

**_thread** 提供基本线程 和 说的支持

**threading** 提供了更高级别 功能更强的线程管理

**Queue** 模块运行用户创建一个 可以用于多个线程之间 共享数据的 队列数据结构

不推荐 **_thread**

1. threading 更先进，支持 更完善，而且 属性 也会导致 两者冲突
2. 低级别的 _thread 模块 同步 原语很少， threading 很多
3. 在 主线程结束时，所有线程都会被强制结束， 也就是说 不会取等待 子线程，没有警告 也不会有 清理工作，threading 会保证所有子线程都完成后  主线程 才退出，

## 13.3 _thread 模块

 `th.start_new_thread(th_1_fun, ())` 二个参数必须

```python
#! /usr/bin/python3
# -*-coding:UTF-8-*-
import _thread as th
import time
from datetime import datetime

time_format = '%H:%M %S'


def to_time_format(time_val):
    """
    由于下面这种使用的 单独对象 导致，并行 没有被锁
    线程一开始：线程二开始：  23:23 27
23:23 27
出现这种情况
    """
    # return time_val.strftime(time_format)
    return datetime.strftime(time_val, time_format)


def to_format(time_val):
    return time.strftime(time_format, time_val)


def th_1_fun():
    print('线程一开始：', to_time_format(datetime.now()))
    time.sleep(5)
    print('线程一休眠五秒后：', to_time_format(datetime.now()))


def th_2_fun():
    print('线程二开始：', to_format(time.localtime()))
    time.sleep(2)
    print('线程二休眠2秒后：', to_format(time.localtime()))


def main():
    print('主线程开始：', to_time_format(datetime.now()))
    print('主线程执行线程1开始：', to_time_format(datetime.now()))
    th.start_new_thread(th_1_fun, ())
    print('主线程执行线程2开始：', to_time_format(datetime.now()))
    th.start_new_thread(th_2_fun, ())
    time.sleep(3)
    print('主线程休眠三秒：', to_time_format(datetime.now()), '退出')


if __name__ == '__main__':
    main()

"""
主线程开始： 23:19 52
主线程执行线程1开始： 23:19 52
主线程执行线程2开始： 23:19 52
线程一开始： 23:19 52
线程二开始： 23:19 52
线程二休眠2秒后： 23:19 54
主线程休眠三秒： 23:19 55 退出

可以看出 线程一 没有完成，主线程就直接退出
"""
```

如何避免  主线程 推出时 不管 子线程呢？

```python
#! /usr/bin/python3
# -*-coding:UTF-8-*-
import _thread as th
import time
from datetime import datetime

time_format = '%H:%M %S'


def to_time_format(time_val):
    """
    由于下面这种使用的 单独对象 导致，并行 没有被锁
    线程一开始：线程二开始：  23:23 27
23:23 27
出现这种情况
    """
    # return time_val.strftime(time_format)
    return datetime.strftime(time_val, time_format)


def th_1_fun(th_num, lock):
    # print('线程锁：', lock)
    print('线程 %d 开始：' % th_num, to_time_format(datetime.now()))
    time.sleep(2)
    print('线程%d 休眠五秒后：' % th_num, to_time_format(datetime.now()))
    # 释放
    lock.release()


def main():
    print('主线程开始：', to_time_format(datetime.now()))

    locks = []
    # 开始三个线程
    for i in range(3):
        lock = th.allocate_lock()
        # 开启锁
        lock.acquire()
        locks.append(lock)

    for i in range(3):
        th.start_new_thread(th_1_fun, (i, locks[i]))

    print('线程锁个数：', len(locks))

    # 等待锁的 结束
    for i in range(len(locks)):
        while locks[i].locked():
            pass

    print('主线程退出', to_time_format(datetime.now()))


if __name__ == '__main__':
    main()

```

## 13.4 threading 模块

_thread 模块 无法提供 线程 守护，如果 要  就得使用 锁来完成

threading 提供 **Thread** 类 以及更好的同步机制

threading 线程守护一般是一个等待客户请求的服务器，如果没有请求 就会 一直等待。

如果设定一个 线程 为 **守护线程**，就表示 这个线程不重要，在进程推出时，不用等待这个线程推出。

如果 主线程 推出时 不用等待子线程完成，就要设置这些线程的 **daemon**(守护进程) 属性，即 在线程 `Thread.start()`前，调用 `setDaemon()` 设置为 True

### 13.4.1 Thread 类

```python
#! /usr/bin/python3
# -*-coding:UTF-8-*-

import threading as th
from time import sleep
from datetime import datetime

time_format = '%H:%M %S'


def to_time_format(time_val):
    return datetime.strftime(time_val, time_format)


def th_do(th_num, sleep_val):
    print('线程 %d 开始：' % th_num, to_time_format(datetime.now()))
    sleep(sleep_val)
    print('线程%d 休眠%d秒后：' % (th_num, sleep_val), to_time_format(datetime.now()))


def main():
    print('主线程开始：', to_time_format(datetime.now()))
    nums = [1, 2, 3]
    # 创建三个线程 分别对应
    ths = [];
    for i in nums:
        # 函数名 与 参数
        t = th.Thread(target=th_do, args=(i, i))
        ths.append(t)

    # 执行 线程
    for i in nums:
        # 当 休眠时间 大于 2 我们设置为守护线程
        if i > 2:
            ths[i - 1].setDaemon(True)
        ths[i - 1].start()
    # 关联主线程，  就会 像使用了锁一样 等待 全部线程完成， join 可以 设置 timeout
    # 主要 用途 是 当主线程需要 某个线程完成 后才能执行 就可以 使用
    # for t in ths:
    #     t.join()
    print('主线程退出', to_time_format(datetime.now()))


if __name__ == '__main__':
    main()

    """
    主线程开始： 00:20 23
    线程 1 开始： 00:20 23
    线程 2 开始： 00:20 23
    线程 3 开始：主线程退出 00:20 23
     00:20 23
    线程1 休眠1秒后： 00:20 24
    线程2 休眠2秒后： 00:20 25

    可以看到 第三个线程 并没有 执行完成 
    """
```

Thread 的创建 不仅可以是函数，target 还可以是 一个类实例，执行 这个类实例 需要 `__call__` 方法。

```python
class TestTh(object):
    def __init__(self, fun, age):
        self.fun = fun
        self.age = age

    def __call__(self):
        self.fun(*self.age)


def testFun(num, nu2):
    print(num + nu2)

if __name__ == '__main__':
    t = th.Thread(target=TestTh(testFun, (10, 20)))
    t.start()
```



还可以 自定义类 继承 Thread ，重写 **run()** ， 有点类似 Java中 Thread 的实现

## 13.5 线程同步

Thread 对象中 使用 Lock 与 Rlock 完成简单的 同步锁。 即 acquire 和 release 

```python
class MyThread(th.Thread):
    def __init__(self, threadID, thread_name, obj):
        th.Thread.__init__(self)
        self.threadID = threadID
        self.thread_name = thread_name
        self.obj = obj

    def run(self):
        self.lock.acquire()
        
        self.lock.selease()
```

## 13.6 线程优先级队列

Queue 模块 用来进行线程之间通信，各个线程之间 共享数据。

包含 **FIFO** 先进先出队列的 Queue **LIFO 先进后出 LifoQueue**  **PriorityQueue 优先级队列**

Queue 模块中常用方法

| 方法名                  | 秒描述                                               |
| ----------------------- | ---------------------------------------------------- |
| qsize()                 | 返回队列大小                                         |
| empty()                 | 如果 队列为空，返回 True                             |
| full()                  | 如果 队列满了 返回 True                              |
| full                    | 与 MaxSize 大小对应                                  |
| get([block[, timeout]]) | 获取 队列， timeout 等待时间                         |
| get_nowait()            | 相当于 Queue.get(False)                              |
| put(timeout)            | 写入队列， timeout 等待时间                          |
| put_nowait(item)        | 相当于 Queue.get(item, False)                        |
| task_done()             | 在完成一项工作后， 函数 向已经完成的队列发送一个信号 |
| join()                  | 等到 队列为空，再执行别的操作                        |

实例 略

## 13.7 进程 与 线程

处理多任务时: 往往设计 为 Master—Worker 模式： Master 负责 分配任务， Worker 负责 执行任务

**多进程** ： 稳定性高， 一个子进程崩溃 不会影响到其他进程，但是 创建进程代价大，尤其是在 Windows 下 ，Linux 可以使用 fork ，另外 操作系统 运行的进程数是有限的 

**多线程：** 比 进程快一点，没多少， 唯一的确定就是， 一个子进程崩溃 那么整个进程都会出问题

无论多线程 还是 多进程 数量多了 效率都上不去。

