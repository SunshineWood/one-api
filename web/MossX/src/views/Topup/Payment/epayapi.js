import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  Stack
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import EpayCore from './Lib/EpayCore';
import epayConfig from './Lib/epay.config';

// 自定义样式的TextField
const ReadOnlyTextField = styled(TextField)({
  '& .MuiInputBase-input.Mui-disabled': {
    WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
    backgroundColor: '#f5f5f5'
  }
});
const epay = new EpayCore(epayConfig);

const PaymentDialog = ({ open, onClose, payType, money, productName }) => {
  // 生成订单号
  const generateOrderNo = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    const millisecond = String(now.getMilliseconds()).padStart(3, '0');

    return `${year}${month}${day}${hour}${minute}${second}${millisecond}`;
  };

  const [paymentData, setPaymentData] = useState({
    out_trade_no: '',
    type: '',
    name: '',
    money: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setPaymentData({
        out_trade_no: generateOrderNo(),
        type: payType,
        name: productName,
        money: money
      });
    }
  }, [open, payType, money, productName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = epay.pagePay(paymentData);

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = response;
      document.body.appendChild(tempDiv);

      const form = tempDiv.querySelector('form');
      if (form) {
        form.submit();
      }
    } catch (error) {
      console.error('支付请求失败:', error);
      alert('支付请求失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentTypeName = (type) => {
    const types = {
      'alipay': '支付宝',
      'wxpay': '微信支付',
      'qqpay': 'QQ钱包',
      'bank': '网银支付'
    };
    return types[type] || type;
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">支付确认</Typography>
          {!loading && (
            <IconButton
              edge="end"
              onClick={onClose}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </DialogTitle>

      {loading ? (
        <DialogContent>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            py={3}
          >
            <CircularProgress size={48} />
            <Typography variant="body1" sx={{ mt: 2 }}>
              正在为您跳转到支付页面，请稍候...
            </Typography>
          </Box>
        </DialogContent>
      ) : (
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2}>
              <ReadOnlyTextField
                label="订单号"
                value={paymentData.out_trade_no}
                fullWidth
                disabled
                variant="outlined"
              />
              <ReadOnlyTextField
                label="支付方式"
                value={getPaymentTypeName(paymentData.type)}
                fullWidth
                disabled
                variant="outlined"
              />
              <ReadOnlyTextField
                label="商品名称"
                value={paymentData.name}
                fullWidth
                disabled
                variant="outlined"
              />
              <ReadOnlyTextField
                label="支付金额"
                value={paymentData.money}
                fullWidth
                disabled
                variant="outlined"
              />
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Stack direction="row" spacing={2} width="100%">
              <Button
                onClick={onClose}
                variant="outlined"
                fullWidth
                size="large"
                sx={{ color: 'text.secondary' }}
              >
                取消
              </Button>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                color="primary"
              >
                确认支付
              </Button>
            </Stack>
          </DialogActions>
        </form>
      )}
    </Dialog>
  );
};

export default PaymentDialog;
