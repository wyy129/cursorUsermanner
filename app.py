#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Cursor用户管理系统 - 后端API代理服务
用于解决CORS跨域问题，代理前端对Cursor API的请求
"""

from fastapi import FastAPI, Request, Response
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import httpx
import uvicorn
import os

app = FastAPI(title="Cursor User Manager API")

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cursor API配置
CURSOR_API_URL = "https://www.cursor.com/api/auth/stripe"

@app.get("/api/auth/stripe")
async def proxy_cursor_api(request: Request):
    """
    代理Cursor API请求
    从请求头中获取WorkosCursorSessionToken，转发给Cursor API
    """
    try:
        # 优先从自定义header获取Token
        token = request.headers.get("x-cursor-token")
        
        # 如果header中没有，尝试从Cookie获取
        if not token:
            cookie_header = request.headers.get("cookie", "")
            if cookie_header:
                for cookie in cookie_header.split(";"):
                    cookie = cookie.strip()
                    if cookie.startswith("WorkosCursorSessionToken="):
                        token = cookie.split("=", 1)[1]
                        break
        
        if not token:
            return JSONResponse(
                status_code=400,
                content={"error": "缺少WorkosCursorSessionToken", "hint": "请确保在请求中包含Token"}
            )
        
        # 转发请求到Cursor API
        # 增加超时时间，因为Cursor API可能响应较慢
        async with httpx.AsyncClient(follow_redirects=True, timeout=30.0) as client:
            # 记录请求信息（用于调试）
            print(f"[API] 请求Cursor API, Token前10位: {token[:10]}...")
            
            response = await client.get(
                CURSOR_API_URL,
                headers={
                    "Cookie": f"WorkosCursorSessionToken={token}",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Accept": "application/json, text/plain, */*",
                    "Accept-Language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7",
                    "Accept-Encoding": "gzip, deflate, br",
                    "Origin": "https://www.cursor.com",
                    "Referer": "https://www.cursor.com/",
                    "Sec-Fetch-Dest": "empty",
                    "Sec-Fetch-Mode": "cors",
                    "Sec-Fetch-Site": "same-origin"
                }
            )
            
            print(f"[API] 响应状态码: {response.status_code}")
            print(f"[API] 响应内容长度: {len(response.text)}")
            
            # 返回响应
            if response.status_code == 200:
                try:
                    data = response.json()
                    return JSONResponse(content=data)
                except Exception:
                    return JSONResponse(
                        status_code=500,
                        content={"error": "API返回的不是有效的JSON"}
                    )
            else:
                return JSONResponse(
                    status_code=response.status_code,
                    content={"error": f"API返回错误: {response.status_code}", "details": response.text[:200]}
                )
            
    except httpx.TimeoutException as e:
        print(f"[API] 超时错误: {str(e)}")
        return JSONResponse(
            status_code=504,
            content={
                "error": "请求超时", 
                "hint": "Cursor API响应超时（>30秒），请稍后重试或检查Token是否有效",
                "timeout": "30s"
            }
        )
    except httpx.HTTPStatusError as e:
        return JSONResponse(
            status_code=e.response.status_code,
            content={"error": f"HTTP错误: {e.response.status_code}", "details": str(e)}
        )
    except Exception as e:
        import traceback
        error_detail = traceback.format_exc()
        print(f"Error: {error_detail}")  # 记录到日志
        return JSONResponse(
            status_code=500,
            content={"error": f"服务器错误: {str(e)}", "type": type(e).__name__}
        )

@app.get("/health")
async def health_check():
    """健康检查接口"""
    return {"status": "ok", "message": "Cursor User Manager API is running"}

@app.get("/test-network")
async def test_network():
    """
    测试HF Spaces是否允许外部请求
    """
    test_results = {}
    
    # 测试1：访问公开API
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get("https://httpbin.org/get")
            test_results["httpbin"] = {
                "success": True,
                "status": response.status_code
            }
    except Exception as e:
        test_results["httpbin"] = {
            "success": False,
            "error": str(e)
        }
    
    # 测试2：访问Cursor官网
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get("https://www.cursor.com")
            test_results["cursor_homepage"] = {
                "success": True,
                "status": response.status_code
            }
    except Exception as e:
        test_results["cursor_homepage"] = {
            "success": False,
            "error": str(e)
        }
    
    # 测试3：访问Cursor API（无Token）
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get("https://www.cursor.com/api/auth/stripe")
            test_results["cursor_api"] = {
                "success": True,
                "status": response.status_code,
                "note": "无Token的请求"
            }
    except Exception as e:
        test_results["cursor_api"] = {
            "success": False,
            "error": str(e)
        }
    
    return {
        "message": "网络连接测试",
        "results": test_results,
        "conclusion": "如果全部失败，说明HF Spaces限制了外部请求"
    }

# 静态文件服务（Vue构建产物）
if os.path.exists("dist"):
    app.mount("/assets", StaticFiles(directory="dist/assets"), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """服务Vue SPA应用"""
        file_path = os.path.join("dist", full_path)
        
        # 如果请求的是具体文件且存在，返回该文件
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        
        # 否则返回index.html（支持Vue Router）
        return FileResponse("dist/index.html")

if __name__ == "__main__":
    # 本地开发时运行
    uvicorn.run(app, host="0.0.0.0", port=7860)

