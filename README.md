# zero-to-tech

项目采用前后端分离架构。Next.js 提供首页和文字实验室页面，FastAPI 提供中文文本分析接口。

## 技术架构

| 层 | 技术 | 职责 |
| --- | --- | --- |
| 前端 | Next.js 15、React 19、CSS、Anime.js | 使用 App Router 管理页面，提交文本并展示分析结果 |
| 后端 | Python、FastAPI、Pydantic、Uvicorn | 接收并校验 JSON 请求，调用 Python 库分析文本并返回结果 |
| 拼音 | pypinyin | 生成带声调的拼音，保留标点、英文和数字 |
| 情感分析 | SnowNLP | 计算 0–1 的情感分数，后端按阈值给出判断 |

浏览器从文字实验室页面直接向 FastAPI 发送 `POST /api/analyze`，请求体为 `{"text":"今天天气真好"}`。接口返回原文 `text`、拼音 `pinyin`、情感分数 `score` 和判断 `sentiment`。分数 ≤ 0.4 为「偏消极」，≥ 0.6 为「偏积极」，其余为「中性」。

前端入口位于 `app/`，页面组件位于 `components/`。后端入口为 `backend/main.py`，Python 依赖清单为 `backend/requirements.txt`。

## Windows 本地启动

在项目根目录打开两个 PowerShell 终端。当前项目路径为 `D:\My Project\zero-to-tech`。

### 1. 启动 FastAPI 后端

首次配置时执行下面三行。如果项目根目录已经有可用的 `.venv`，直接执行下一段的启动命令。

```powershell
Set-Location 'D:\My Project\zero-to-tech'
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend/requirements.txt
```

在第一个终端启动后端并保持窗口打开。如果 [Swagger UI](http://127.0.0.1:8000/docs) 已能打开，可直接使用正在运行的后端。

```powershell
Set-Location 'D:\My Project\zero-to-tech'
.\.venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. 启动 Next.js 前端

日常使用时，在第二个终端直接执行以下命令并保持窗口打开。

```powershell
Set-Location 'D:\My Project\zero-to-tech'
npm run dev -- --hostname 127.0.0.1 --port 3000
```

首次配置或锁文件更新后，需要先安装依赖。在项目的前端终端按 Ctrl+C 停止正在运行的 Next.js，再在根目录执行以下命令，成功后运行上面的启动命令。

```powershell
Set-Location 'D:\My Project\zero-to-tech'
npm ci
```

Windows 下，运行中的 Next.js 会占用 SWC 编译文件。此时执行 `npm ci` 可能出现 `EPERM unlink`，安装中断后也可能出现找不到 `next` 的错误。停止项目的 Next.js 进程后，重新执行 `npm ci`，等待安装成功再启动。

### 3. 验证结果

打开 [文字实验室](http://127.0.0.1:3000/text-lab/)，输入 `今天真开心！ABC 123`，点击「开始分析」。

本地实测使用 Node.js 24 和 Python 3.13。按上述启动命令重新启动两端后，文字实验室页面、Swagger UI 和分析接口均返回 HTTP 200。测试文本返回拼音 `jīn tiān zhēn kāi xīn ！ABC 123`，情感分数约为 `0.70`，判断为「偏积极」。

### 本地地址配置

前端默认请求 `http://127.0.0.1:8000`。如果后端地址或端口有变化，在项目根目录的 `.env.local` 设置 `NEXT_PUBLIC_API_URL` 并重启 Next.js。例如，后端改用 8001 端口时，设置 `NEXT_PUBLIC_API_URL=http://127.0.0.1:8001`。

后端默认允许来自 `http://localhost:3000` 和 `http://127.0.0.1:3000` 的跨域请求。如果更改前端地址或端口，同步更新 `backend/main.py` 的 `allow_origins`。

## 分析历史

每次成功分析会自动将原文、拼音、情感分数、情感判断和分析时间保存到后端 SQLite 文件 backend/history.sqlite3。首次启动后端时自动创建数据库，无需安装额外依赖。重复文本每次提交都会新增记录，重启服务后记录继续保留。

点击文字实验室的「分析历史」按钮可展开列表，按时间从新到旧显示，时间以北京时间展示。GET /api/history 返回历史记录。数据库文件已加入 .gitignore，历史从接入此功能后开始保存。
