const KJUR = require('jsrsasign');

class EpayCore {
  constructor(config) {
    this.apiurl = config.apiurl;
    this.pid = config.pid;
    this.notify_url = "http://127.0.0.1/notify_url";
    this.return_url = "http://127.0.0.1/return_url";
    this.platform_public_key = config.platform_public_key;
    this.merchant_private_key = config.merchant_private_key;
    this.sign_type = 'RSA';
  }

  // 发起支付（页面跳转）
  pagePay(param_tmp, button = '正在跳转') {
    const requrl = this.apiurl + 'api/pay/submit';
    const param = this.buildRequestParam(param_tmp);

    let html = `<form id="dopay" action="${requrl}" method="post">`;
    for (let k in param) {
      html += `<input type="hidden" name="${k}" value="${param[k]}"/>`;
    }
    html += `<input type="submit" value="${button}"></form><script>document.getElementById("dopay").submit();</script>`;

    return html;
  }

  // 发起支付（获取链接）
  getPayLink(param_tmp) {
    const requrl = this.apiurl + 'api/pay/submit';
    const param = this.buildRequestParam(param_tmp);
    const url = requrl + '?' + new URLSearchParams(param).toString();
    return url;
  }

  // 发起支付（API接口）
  async apiPay(params) {
    return await this.execute('api/pay/create', params);
  }

  // 发起API请求
  async execute(path, params) {
    path = path.replace(/^\//, '');
    const requrl = this.apiurl + path;
    const param = this.buildRequestParam(params);

    try {
      const response = await this.getHttpResponse(requrl, new URLSearchParams(param).toString());
      const arr = JSON.parse(response);

      if (arr && arr.code === 0) {
        if (!this.verify(arr)) {
          throw new Error('返回数据验签失败');
        }
        return arr;
      } else {
        throw new Error(arr ? arr.msg : '请求失败');
      }
    } catch (error) {
      throw error;
    }
  }

  // 回调验证
  verify(arr) {
    if (!arr || !arr.sign) return false;
    if (!arr.timestamp || Math.abs(Date.now()/1000 - arr.timestamp) > 300) return false;

    const sign = arr.sign;
    return this.rsaPublicVerify(this.getSignContent(arr), sign);
  }

  // 查询订单支付状态
  async orderStatus(trade_no) {
    const result = await this.queryOrder(trade_no);
    return !!(result && result.status === 1);
  }

  // 查询订单
  async queryOrder(trade_no) {
    const params = { trade_no };
    return await this.execute('api/pay/query', params);
  }

  // 订单退款
  async refund(out_refund_no, trade_no, money) {
    const params = {
      trade_no,
      money,
      out_refund_no
    };
    return await this.execute('api/pay/refund', params);
  }

  buildRequestParam(params) {
    params = { ...params };
    params.pid = this.pid;
    params.timestamp = Math.floor(Date.now()/1000).toString();
    params.sign = this.getSign(params);
    params.sign_type = this.sign_type;
    return params;
  }

  // 生成签名
  getSign(params) {
    return this.rsaPrivateSign(this.getSignContent(params));
  }

  // 获取待签名字符串
  getSignContent(params) {
    const sortedKeys = Object.keys(params).sort();
    const signParts = [];

    for (let key of sortedKeys) {
      const value = params[key];
      if (Array.isArray(value) || this.isEmpty(value) || key === 'sign' || key === 'sign_type') continue;
      signParts.push(`${key}=${value}`);
    }

    return signParts.join('&');
  }

  isEmpty(value) {
    return value === null || value === undefined || String(value).trim() === '';
  }

  // 商户私钥签名
  rsaPrivateSign(data) {
    try {
      const key = "-----BEGIN PRIVATE KEY-----\n" +
      this.merchant_private_key.match(/.{1,64}/g).join("\n") +
      "\n-----END PRIVATE KEY-----";

      const sig = new KJUR.crypto.Signature({
        "alg": "SHA256withRSA"
      });

      sig.init(key);
      sig.updateString(data);
      const signatureBase64 = sig.sign();

      return signatureBase64;
    } catch (e) {
      throw new Error('签名失败，商户私钥错误: ' + e.message);
    }
  }

// 平台公钥验签
  rsaPublicVerify(data, sign) {
    try {
      const key = "-----BEGIN PUBLIC KEY-----\n" +
      this.platform_public_key.match(/.{1,64}/g).join("\n") +
      "\n-----END PUBLIC KEY-----";

      const sig = new KJUR.crypto.Signature({
        "alg": "SHA256withRSA"
      });

      sig.init(key);
      sig.updateString(data);
      const result = sig.verify(sign);

      return result;
    } catch (e) {
      throw new Error('验签失败，平台公钥错误: ' + e.message);
    }
  }


  // 请求外部资源
  async getHttpResponse(url, post = false, timeout = 10000) {
    const options = {
      method: post ? 'POST' : 'GET',
      headers: {
        'Accept': '*/*',
        'Accept-Language': 'zh-CN,zh;q=0.8',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: timeout
    };

    if (post) {
      options.body = post;
    }

    try {
      const response = await fetch(url, options);
      return await response.text();
    } catch (error) {
      throw error;
    }
  }
}

export default EpayCore;
