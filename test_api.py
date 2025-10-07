#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Cursor API 测试脚本
演示如何正确调用 Cursor Stripe API
"""

import requests
import json
import sys

def test_method_1_cookie_header(token):
    """
    方式1：使用 Cookie Header（标准方式）
    """
    print("\n" + "="*50)
    print("方式1：Cookie Header")
    print("="*50)
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*'
    }
    
    cookies = {
        'WorkosCursorSessionToken': token
    }
    
    try:
        response = requests.get(
            'https://www.cursor.com/api/auth/stripe',
            headers=headers,
            cookies=cookies,
            timeout=10,
            allow_redirects=True  # 自动跟随重定向
        )
        
        print(f"状态码: {response.status_code}")
        print(f"响应头: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"\n✅ 成功!")
            print(f"会员类型: {data.get('membershipType')}")
            if 'daysRemainingOnTrial' in data:
                print(f"试用剩余: {data.get('daysRemainingOnTrial')} 天")
            return True, data
        else:
            print(f"❌ 失败: {response.status_code}")
            print(f"响应: {response.text[:200]}")
            return False, None
            
    except Exception as e:
        print(f"❌ 错误: {str(e)}")
        return False, None


def test_method_2_post_body(token):
    """
    方式2：POST 请求，Token 放在请求体中
    格式：WorkosCursorSessionToken=<token>
    """
    print("\n" + "="*50)
    print("方式2：POST with Body (Form Data)")
    print("="*50)
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    
    # 请求体：WorkosCursorSessionToken=<token>
    data = {
        'WorkosCursorSessionToken': token
    }
    
    try:
        response = requests.post(
            'https://www.cursor.com/api/auth/stripe',
            headers=headers,
            data=data,  # 表单格式
            timeout=10,
            allow_redirects=True
        )
        
        print(f"状态码: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"\n✅ 成功!")
            print(f"会员类型: {data.get('membershipType')}")
            if 'daysRemainingOnTrial' in data:
                print(f"试用剩余: {data.get('daysRemainingOnTrial')} 天")
            return True, data
        else:
            print(f"❌ 失败: {response.status_code}")
            print(f"响应: {response.text[:200]}")
            return False, None
            
    except Exception as e:
        print(f"❌ 错误: {str(e)}")
        return False, None


def test_method_3_post_json(token):
    """
    方式3：POST 请求，JSON 格式
    """
    print("\n" + "="*50)
    print("方式3：POST with JSON Body")
    print("="*50)
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
    
    payload = {
        'WorkosCursorSessionToken': token
    }
    
    try:
        response = requests.post(
            'https://www.cursor.com/api/auth/stripe',
            headers=headers,
            json=payload,
            timeout=10,
            allow_redirects=True
        )
        
        print(f"状态码: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"\n✅ 成功!")
            print(f"会员类型: {data.get('membershipType')}")
            if 'daysRemainingOnTrial' in data:
                print(f"试用剩余: {data.get('daysRemainingOnTrial')} 天")
            return True, data
        else:
            print(f"❌ 失败: {response.status_code}")
            return False, None
            
    except Exception as e:
        print(f"❌ 错误: {str(e)}")
        return False, None


def test_method_4_query_param(token):
    """
    方式4：GET 请求，Token 作为查询参数
    """
    print("\n" + "="*50)
    print("方式4：GET with Query Parameter")
    print("="*50)
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*'
    }
    
    params = {
        'WorkosCursorSessionToken': token
    }
    
    try:
        response = requests.get(
            'https://www.cursor.com/api/auth/stripe',
            headers=headers,
            params=params,
            timeout=10,
            allow_redirects=True
        )
        
        print(f"状态码: {response.status_code}")
        print(f"请求URL: {response.url}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"\n✅ 成功!")
            print(f"会员类型: {data.get('membershipType')}")
            if 'daysRemainingOnTrial' in data:
                print(f"试用剩余: {data.get('daysRemainingOnTrial')} 天")
            return True, data
        else:
            print(f"❌ 失败: {response.status_code}")
            return False, None
            
    except Exception as e:
        print(f"❌ 错误: {str(e)}")
        return False, None


def main():
    """
    主函数：测试所有方法
    """
    if len(sys.argv) < 2:
        print("用法: python test_api.py <WorkosCursorSessionToken>")
        print("\n示例:")
        print("python test_api.py 'user_xxx%3A%3Aeyxxx...'")
        sys.exit(1)
    
    token = sys.argv[1]
    
    print("╔════════════════════════════════════════╗")
    print("║   Cursor API 测试脚本                 ║")
    print("╚════════════════════════════════════════╝")
    print(f"\n🔑 Token (前20字符): {token[:20]}...")
    
    # 测试所有方法
    methods = [
        ("Cookie Header (标准)", test_method_1_cookie_header),
        ("POST Form Data", test_method_2_post_body),
        ("POST JSON", test_method_3_post_json),
        ("GET Query Param", test_method_4_query_param),
    ]
    
    results = []
    for name, method in methods:
        success, data = method(token)
        results.append((name, success, data))
    
    # 总结
    print("\n" + "="*50)
    print("测试总结")
    print("="*50)
    
    for name, success, data in results:
        status = "✅ 成功" if success else "❌ 失败"
        print(f"{name}: {status}")
    
    # 找到成功的方法
    successful = [r for r in results if r[1]]
    if successful:
        print(f"\n🎉 推荐使用: {successful[0][0]}")
        print("\n返回数据示例:")
        print(json.dumps(successful[0][2], indent=2, ensure_ascii=False))
    else:
        print("\n⚠️ 所有方法都失败了。请检查:")
        print("1. Token 是否有效")
        print("2. 网络连接是否正常")
        print("3. API 端点是否变更")


if __name__ == '__main__':
    main()





