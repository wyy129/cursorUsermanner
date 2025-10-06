#!/usr/bin/env python3
"""
测试脚本 - 直接测试Cursor API连接
用于验证Token和API是否正常工作
"""

import httpx
import sys

def test_cursor_api(token: str):
    """
    测试Cursor API
    """
    url = "https://www.cursor.com/api/auth/stripe"
    
    print(f"测试Token: {token[:20]}...")
    print(f"请求URL: {url}")
    print("-" * 50)
    
    try:
        with httpx.Client(follow_redirects=True, timeout=30.0) as client:
            response = client.get(
                url,
                headers={
                    "Cookie": f"WorkosCursorSessionToken={token}",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    "Accept": "application/json",
                    "Origin": "https://www.cursor.com",
                    "Referer": "https://www.cursor.com/"
                }
            )
            
            print(f"状态码: {response.status_code}")
            print(f"响应头: {dict(response.headers)}")
            print(f"响应内容: {response.text[:500]}")
            
            if response.status_code == 200:
                print("\n✅ 测试成功！")
                try:
                    data = response.json()
                    print(f"JSON数据: {data}")
                except:
                    print("⚠️ 响应不是JSON格式")
            else:
                print(f"\n❌ 测试失败: HTTP {response.status_code}")
                
    except httpx.TimeoutException:
        print("❌ 请求超时（>30秒）")
    except Exception as e:
        print(f"❌ 错误: {type(e).__name__}: {str(e)}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("使用方法: python test_api.py <WorkosCursorSessionToken>")
        sys.exit(1)
    
    token = sys.argv[1]
    test_cursor_api(token)

