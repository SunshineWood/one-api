import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import EpayCore from './Lib/EpayCore'; // 替换为实际的路径
import epayConfig from './Lib/epay.config'; // 替换为实际的配置文件路径

const epay = new EpayCore(epayConfig);

const ReturnUrl = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [result, setResult] = useState({
    success: false,
    message: '正在处理...',
    tradeStatus: ''
  });
  useEffect(() => {
    const handlePaymentReturn = async () => {
      try {
        // 获取查询参数
        const queryParams = Object.fromEntries(searchParams.entries());

        // 验证签名
        const verifyResult = epay.verify(queryParams);

        if (verifyResult) {
          const {
            out_trade_no: outTradeNo,
            trade_no: tradeNo,
            trade_status: tradeStatus,
            type
          } = queryParams;

          if (tradeStatus === 'TRADE_SUCCESS') {
            try {

              setResult({
                success: true,
                message: '支付成功',
                tradeStatus: tradeStatus
              });

              // 3秒后跳转到订单页面
              setTimeout(() => {
                navigate('/topup');
              }, 3000);
            } catch (error) {
              console.error('订单处理错误:', error);
              setResult({
                success: false,
                message: '订单处理失败',
                tradeStatus: tradeStatus
              });
            }
          } else {
            setResult({
              success: false,
              message: '支付未完成',
              tradeStatus: tradeStatus
            });
          }
        } else {
          setResult({
            success: false,
            message: '验证失败',
            tradeStatus: ''
          });
        }
      } catch (error) {
        console.error('支付返回处理错误:', error);
        setResult({
          success: false,
          message: '处理过程出错',
          tradeStatus: ''
        });
      }
    };
    handlePaymentReturn().then();
  }, [searchParams, navigate]);
};

export default ReturnUrl;