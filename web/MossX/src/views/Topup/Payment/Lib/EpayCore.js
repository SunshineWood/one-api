import axios from 'axios';

const KJUR = require('jsrsasign');
class EpayCore {
  constructor(config) {
    this.apiurl = config.apiurl;
    this.pid = config.pid;
    this.notify_url = "http://localhost:3001/notify_url";
    this.return_url = "http://localhost:3001/return_url";
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
    params.notify_url = this.notify_url;
    params.return_url = this.return_url;
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
      const key = KJUR.KEYUTIL.getKey(`-----BEGIN PRIVATE KEY-----\n${this.merchant_private_key}\n-----END PRIVATE KEY-----`);
      // 创建 Signature 对象，设置签名编码算法
      const signature = new KJUR.KJUR.crypto.Signature({ alg: "SHA256withRSA" });
      // 初始化
      signature.init(key);
      signature.updateString(data);
      // 生成密文
      const originSign = signature.sign();
      console.log(originSign)
      return KJUR.hextob64(originSign);
    } catch (e) {
      throw new Error('签名失败，商户私钥错误: ' + e.message);
    }
  }

// 平台公钥验签
  // 平台公钥验签
  rsaPublicVerify(data, sign) {
    try {
      const key = KJUR.KEYUTIL.getKey(`-----BEGIN PUBLIC KEY-----\n${this.platform_public_key}\n-----END PUBLIC KEY-----`);
      const sig = new KJUR.KJUR.crypto.Signature({
        "alg": "SHA256withRSA"
      });
      sig.init(key);
      sig.updateString(data);
      const result = sig.verify((KJUR.b64tohex(sign)));
      return result;
    } catch (e) {
      throw new Error('验签失败，平台公钥错误: ' + e.message);
    }
  }


  // 请求外部资源
  async getHttpResponse(url, postData = false, timeout = 10000) {
    try {
      const response = await axios({
        url,
        method: postData ? 'POST' : 'GET',
        headers: {
          'Accept': '*/*',
          'Accept-Language': 'zh-CN,zh;q=0.8',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: postData,
        timeout: timeout
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default EpayCore;
