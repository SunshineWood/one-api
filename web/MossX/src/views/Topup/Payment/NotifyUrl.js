import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import EpayCore from './Lib/EpayCore'; // 替换为实际的路径
import epayConfig from './Lib/epay.config';
import { API } from '../../../utils/api';
import { showError, showSuccess } from '../../../utils/common'; // 替换为实际的配置文件路径

const epay = new EpayCore(epayConfig);

const NotifyUrl = () => {
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const handlePaymentNotify = async () => {
      try {
        // 将 URLSearchParams 转换为普通对象
        const queryParams = Object.fromEntries(searchParams.entries());

        // 使用 EpayCore 验证签名
        const verifyResult = epay.verify(queryParams);

        if (verifyResult) {
          const { out_trade_no: outTradeNo, trade_no: tradeNo, trade_status: tradeStatus, type, money } = queryParams;

          if (tradeStatus === 'TRADE_SUCCESS') {
            try {
              // 处理订单
              await processOrder(outTradeNo, tradeNo, money, type);
              document.body.innerHTML = 'success';
            } catch (error) {
              console.error('订单处理错误:', error);
              document.body.innerHTML = 'fail';
            }
          } else {
            document.body.innerHTML = 'fail';
          }
        } else {
          // 验证失败
          console.error('签名验证失败');
          document.body.innerHTML = 'fail';
        }
      } catch (error) {
        console.error('支付通知处理错误:', error);
        document.body.innerHTML = 'fail';
      }
    };
    handlePaymentNotify().then();
  }, [searchParams]);

  return null;
};

// 订单处理函数
async function processOrder(outTradeNo, tradeNo, money, type) {
  try {
    await handleOrderProcessing(outTradeNo, tradeNo, money, type);
    document.body.innerHTML = 'success';
  } catch (error) {
    console.error('订单处理错误:', error);
    document.body.innerHTML = 'fail';
  }
}

// 处理订单逻辑
async function handleOrderProcessing(outTradeNo, tradeNo, money, type) {
  let redemptionCode="f5e424808e3148e6a54c98dfcb6c774b";
  const res = await API.post('/api/user/topup', {
    key: redemptionCode
  });
  redemptionCode="";
  const { success, message, data } = res.data;
  if (success) {
    showSuccess('充值成功！');
    // setUserQuota((quota) => quota + data);
  } else {
    throw new Error(message);
  }
}

// 查询订单
async function queryOrder(outTradeNo) {
  // 实现订单查询逻辑
  // return await OrderModel.findOne({ outTradeNo });
}

// 更新订单状态
async function updateOrderStatus(outTradeNo, updateData) {
  // 实现订单更新逻辑
  // await OrderModel.updateOne({ outTradeNo }, updateData);
}

// 发送通知
async function sendNotification(userId, notification) {
  // 实现通知发送逻辑
  // await NotificationService.send(userId, notification);
}

// 记录支付日志
async function logPayment(logData) {
  // 实现日志记录逻辑
  // await PaymentLog.create(logData);
}

export default NotifyUrl;
