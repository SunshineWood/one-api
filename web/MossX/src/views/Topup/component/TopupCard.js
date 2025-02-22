import { Typography, Stack, OutlinedInput, InputAdornment, Button, InputLabel, FormControl } from '@mui/material';
import { IconWallet } from '@tabler/icons-react';
import { useTheme } from '@mui/material/styles';
import SubCard from 'ui-component/cards/SubCard';
import UserCard from 'ui-component/cards/UserCard';

import { API } from 'utils/api';
import React, { useEffect, useState } from 'react';
import { showError, showInfo, showSuccess, renderQuota } from 'utils/common';
import PaymentDialog from '../Payment/epayapi';

const TopupCard = () => {
  const theme = useTheme();
  const [rechargeAmount, setRechargeAmount]=useState(10);
  const [redemptionCode, setRedemptionCode] = useState('');
  const [topUpLink, setTopUpLink] = useState('');
  const [userQuota, setUserQuota] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // 控制对话框显示状态
  const [isPaymentDialogOpen, setPaymentDialogOpen] = useState(false);
  // 存储支付类型
  const [paymentType, setPaymentType] = useState('');


  // 处理支付宝支付点击
  const handleAlipayClick = () => {
    setPaymentType('alipay');
    setPaymentDialogOpen(true);
  };

  // 处理微信支付点击
  const handleWeixinClick = () => {
    setPaymentType('wxpay');
    setPaymentDialogOpen(true);
  };

  // 处理对话框关闭
  const handleCloseDialog = () => {
    setPaymentDialogOpen(false);
    setPaymentType(''); // 清除支付类型
  };


  const topUp = async () => {
    if (redemptionCode === '') {
      showInfo('请输入充值码！');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await API.post('/api/user/topup', {
        key: redemptionCode
      });
      const { success, message, data } = res.data;
      if (success) {
        showSuccess('充值成功！');
        setUserQuota((quota) => {
          return quota + data;
        });
        setRedemptionCode('');
      } else {
        showError(message);
      }
    } catch (err) {
      showError('请求失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openTopUpLink = () => {
    if (!topUpLink) {
      showError('超级管理员未设置充值链接！');
      return;
    }
    window.open(topUpLink, '_blank');
  };

  const getUserQuota = async () => {
    let res = await API.get(`/api/user/self`);
    const { success, message, data } = res.data;
    if (success) {
      setUserQuota(data.quota);
    } else {
      showError(message);
    }
  };

  useEffect(() => {
    let status = localStorage.getItem('siteInfo');
    if (status) {
      status = JSON.parse(status);
      if (status.top_up_link) {
        setTopUpLink(status.top_up_link);
      }
    }
    getUserQuota().then();
  }, []);

  return (
    <UserCard>
      <Stack direction="row" alignItems="center" justifyContent="center" spacing={2} paddingTop={'20px'}>
        <IconWallet color={theme.palette.primary.main} />
        <Typography variant="h4">当前额度:</Typography>
        <Typography variant="h4">{renderQuota(userQuota)}</Typography>
      </Stack>
      <SubCard
        sx={{
          marginTop: '40px'
        }}
      >
        <FormControl fullWidth variant="outlined">
          <InputLabel htmlFor="key">充值</InputLabel>
          <OutlinedInput
            id="key"
            label="充值金额"
            type="text"
            value={rechargeAmount}
            onChange={(e) => {
              setRechargeAmount(Number(e.target.value));
            }}
            name="key"
            placeholder="请输入充值金额"
            startAdornment={  // 添加这个部分
              <InputAdornment position="start">
                $
              </InputAdornment>
            }
            endAdornment={
              <InputAdornment position="end">
                <Button variant="contained" onClick={handleAlipayClick} disabled={isSubmitting} style={{ marginRight: '10px' }}>
                  {isSubmitting ? '充值中...' : '支付宝'}
                </Button>
                {/*<Button variant="contained" onClick={handleWeixinClick} disabled={isSubmitting}>*/}
                {/*  {isSubmitting ? '充值中...' : '微信'}*/}
                {/*</Button>*/}
                <PaymentDialog
                  open={isPaymentDialogOpen}
                  onClose={handleCloseDialog}
                  payType={paymentType}
                  money={rechargeAmount/10}
                  productName="MossX API"
                />
              </InputAdornment>
            }
            aria-describedby="helper-text-channel-quota-label"
          />
        </FormControl>
      </SubCard>
      <SubCard
        sx={{
          marginTop: '40px'
        }}
      >
        <FormControl fullWidth variant="outlined">
          <InputLabel htmlFor="key">兑换码</InputLabel>
          <OutlinedInput
            id="key"
            label="兑换码"
            type="text"
            value={redemptionCode}
            onChange={(e) => {
              setRedemptionCode(e.target.value);
            }}
            name="key"
            placeholder="请输入兑换码"
            endAdornment={
              <InputAdornment position="end">
                <Button variant="contained" onClick={topUp} disabled={isSubmitting}>
                  {isSubmitting ? '兑换中...' : '兑换'}
                </Button>
              </InputAdornment>
            }
            aria-describedby="helper-text-channel-quota-label"
          />
        </FormControl>

        <Stack justifyContent="center" alignItems={'center'} spacing={3} paddingTop={'20px'}>
          <Typography variant={'h4'} color={theme.palette.grey[700]}>
            还没有兑换码？ 点击获取兑换码：
          </Typography>
          <Button variant="contained" onClick={openTopUpLink}>
            获取兑换码
          </Button>
        </Stack>
      </SubCard>
    </UserCard>
  );
};

export default TopupCard;
