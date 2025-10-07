const queryBtn = document.getElementById('queryBtn');
const clearBtn = document.getElementById('clearBtn');
const tokenInput = document.getElementById('token');
const resultsDiv = document.getElementById('results');
const errorDiv = document.getElementById('error');
const accountInfoDiv = document.getElementById('accountInfo');
const usageStatsDiv = document.getElementById('usageStats');
const rawDataPre = document.getElementById('rawData');

// 从localStorage加载上次的token
window.addEventListener('DOMContentLoaded', () => {
    const savedToken = localStorage.getItem('cursorToken');
    if (savedToken) {
        tokenInput.value = savedToken;
    }
});

queryBtn.addEventListener('click', async () => {
    const token = tokenInput.value.trim();
    
    if (!token) {
        showError('请输入 Token');
        return;
    }
    
    // 保存token到localStorage
    localStorage.setItem('cursorToken', token);
    
    // 显示加载状态
    setLoading(true);
    hideError();
    resultsDiv.style.display = 'none';
    
    try {
        // 调用API
        const [stripeData, usageData] = await Promise.all([
            fetchStripeInfo(token),
            fetchUsageStats(token)
        ]);
        
        // 显示结果
        displayResults(stripeData, usageData);
        resultsDiv.style.display = 'block';
        
    } catch (error) {
        showError(error.message || '查询失败，请检查 Token 是否正确');
    } finally {
        setLoading(false);
    }
});

clearBtn.addEventListener('click', () => {
    tokenInput.value = '';
    resultsDiv.style.display = 'none';
    hideError();
    localStorage.removeItem('cursorToken');
});

async function fetchStripeInfo(token) {
    const response = await fetch('/api/stripe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Stripe API 请求失败');
    }
    
    return response.json();
}

async function fetchUsageStats(token) {
    const endDate = Date.now();
    const startDate = endDate - (30 * 24 * 60 * 60 * 1000); // 30天前
    
    const response = await fetch('/api/usage', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            token,
            teamId: -1,
            startDate,
            endDate
        })
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Usage API 请求失败');
    }
    
    return response.json();
}

function displayResults(stripeData, usageData) {
    // 显示账户信息
    displayAccountInfo(stripeData);
    
    // 显示使用统计
    displayUsageStats(usageData);
    
    // 显示原始数据
    rawDataPre.textContent = JSON.stringify({
        stripe: stripeData,
        usage: usageData
    }, null, 2);
}

function displayAccountInfo(data) {
    const items = [];
    
    // 用户ID
    if (data.userId) {
        items.push(createInfoItem('用户 ID', data.userId, 'success'));
    }
    
    // 订阅状态
    if (data.subscription) {
        const sub = data.subscription;
        items.push(createInfoItem(
            '订阅状态', 
            sub.status || '未知',
            sub.status === 'active' ? 'success' : 'warning'
        ));
        
        // 订阅计划
        if (sub.plan) {
            items.push(createInfoItem('订阅计划', sub.plan, 'success'));
        }
        
        // 订阅价格
        if (sub.amount !== undefined) {
            items.push(createInfoItem('订阅金额', `$${(sub.amount / 100).toFixed(2)}`, 'success'));
        }
        
        // 订阅周期结束时间
        if (sub.current_period_end) {
            const endDate = new Date(sub.current_period_end * 1000);
            items.push(createInfoItem('下次续费', endDate.toLocaleDateString('zh-CN'), 'success'));
        }
    }
    
    // 客户信息
    if (data.customer) {
        const cust = data.customer;
        if (cust.email) {
            items.push(createInfoItem('邮箱', cust.email, 'success'));
        }
        if (cust.name) {
            items.push(createInfoItem('用户名', cust.name, 'success'));
        }
    }
    
    accountInfoDiv.innerHTML = items.join('');
}

function displayUsageStats(data) {
    const items = [];
    
    // 检查是否有使用数据
    if (data.usage) {
        const usage = data.usage;
        
        // 快速请求次数
        if (usage.fast_requests !== undefined) {
            items.push(createInfoItem('快速请求', usage.fast_requests.toLocaleString(), 'success', true));
        }
        
        // 慢速请求次数
        if (usage.slow_requests !== undefined) {
            items.push(createInfoItem('慢速请求', usage.slow_requests.toLocaleString(), 'warning', true));
        }
        
        // 总请求次数
        if (usage.total_requests !== undefined) {
            items.push(createInfoItem('总请求', usage.total_requests.toLocaleString(), 'success', true));
        }
    }
    
    // 如果是聚合事件数据
    if (Array.isArray(data)) {
        let totalEvents = 0;
        const eventTypes = {};
        
        data.forEach(event => {
            totalEvents++;
            const type = event.type || '未知';
            eventTypes[type] = (eventTypes[type] || 0) + 1;
        });
        
        items.push(createInfoItem('总事件数', totalEvents.toLocaleString(), 'success', true));
        
        // 显示各类型事件
        Object.entries(eventTypes).forEach(([type, count]) => {
            items.push(createInfoItem(type, count.toLocaleString(), 'warning'));
        });
    }
    
    // 如果没有数据
    if (items.length === 0) {
        items.push(createInfoItem('使用统计', '暂无数据', 'warning'));
    }
    
    usageStatsDiv.innerHTML = items.join('');
}

function createInfoItem(label, value, type = '', large = false) {
    return `
        <div class="info-item ${type}">
            <div class="info-label">${label}</div>
            <div class="info-value ${large ? 'large' : ''}">${value}</div>
        </div>
    `;
}

function setLoading(loading) {
    const btnText = queryBtn.querySelector('.btn-text');
    const loader = queryBtn.querySelector('.loader');
    
    if (loading) {
        btnText.textContent = '查询中...';
        loader.style.display = 'block';
        queryBtn.disabled = true;
    } else {
        btnText.textContent = '查询';
        loader.style.display = 'none';
        queryBtn.disabled = false;
    }
}

function showError(message) {
    errorDiv.textContent = `❌ ${message}`;
    errorDiv.style.display = 'block';
}

function hideError() {
    errorDiv.style.display = 'none';
}

