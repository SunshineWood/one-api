// BatchModal.js
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useTheme } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Alert,
  TextField,
  FormHelperText, Switch, InputAdornment, FormControl, InputLabel, OutlinedInput
} from '@mui/material';

import { renderQuotaWithPrompt, showSuccess, showError } from 'utils/common';
import { API } from 'utils/api';

const validationSchema = Yup.object().shape({
  prefix: Yup.string().required('前缀 不能为空'),
  quantity: Yup.number().min(1, '数量必须大于0'),
  remain_quota: Yup.number().min(0, '必须大于等于0'),
  expired_time: Yup.number(),
  unlimited_quota: Yup.boolean()
});

const originInputs = {
  prefix: '',
  quantity: 1,
  remain_quota: 0,
  expired_time: -1,
  unlimited_quota: false,
  subnet: '',
  models: []
};

const BatchModal = ({ open, onCancel, onOk }) => {
  const theme = useTheme();
  const [inputs] = useState(originInputs);
  const [, setModelOptions] = useState([]);

  const submit = async (values, { setErrors, setStatus, setSubmitting }) => {
    setSubmitting(true);

    try {
      values.remain_quota = parseInt(values.remain_quota);
      let models = values.models.join(',');

      // 根据 quantity 生成多条数据
      const tokensToCreate = [];
      for (let i = 1; i <= values.quantity; i++) {
        tokensToCreate.push({
          ...values,
          name: `${values.prefix}-${i}`, // 使用 prefix 和序号生成唯一名称
          models: models,
          is_edit: false, // 标记为新创建的数据
        });
      }

      // 使用 Promise.all 批量插入数据
      const results = await Promise.all(
          tokensToCreate.map(async (token) => {
            const res = await API.post(`/api/token/`, token);
            return res.data;
          })
      );

      // 检查所有请求是否成功
      const allSuccess = results.every((result) => result.success);

      if (allSuccess) {
        showSuccess(`成功创建 ${values.quantity} 条令牌！`);
        setSubmitting(false);
        setStatus({ success: true });
        onOk(true);
      } else {
        // 如果有任何一个请求失败，处理错误
        const errorMessages = results
        .filter((result) => !result.success)
        .map((result) => result.message)
        .join(', ');
        showError(`部分令牌创建失败: ${errorMessages}`);
        setErrors({ submit: errorMessages });
      }
    } catch (error) {
      // 处理网络错误或其他异常
      showError('操作过程中发生错误');
      setErrors({ submit: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const loadAvailableModels = async () => {
    let res = await API.get(`/api/user/available_models`);
    const { success, message, data } = res.data;
    if (success) {
      setModelOptions(data);
    } else {
      showError(message);
    }
  };

  useEffect(() => {
    loadAvailableModels().then();
  }, []);

  return (
      <Dialog open={open} onClose={onCancel} fullWidth maxWidth={'md'}>
        <DialogTitle
            sx={{
              margin: '0px',
              fontWeight: 700,
              lineHeight: '1.55556',
              padding: '24px',
              fontSize: '1.125rem'
            }}
        >
          批量新建令牌
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Alert severity="info">注意，令牌的额度仅用于限制令牌本身的最大额度使用量，实际的使用受到账户的剩余额度限制。</Alert>
          <Formik initialValues={inputs} enableReinitialize validationSchema={validationSchema} onSubmit={submit}>
            {({ errors, handleBlur, handleChange, handleSubmit, touched, values, setFieldError, setFieldValue, isSubmitting }) => (
                <form noValidate onSubmit={handleSubmit}>
                  <TextField
                      fullWidth
                      error={Boolean(touched.prefix && errors.prefix)}
                      label="名称前缀"
                      type="text"
                      value={values.prefix}
                      name="prefix"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      inputProps={{ autoComplete: 'prefix' }}
                      aria-describedby="helper-text-prefix-label"
                      sx={{ ...theme.typography.otherInput }}
                  />
                  {touched.prefix && errors.prefix && (
                      <FormHelperText error id="helper-text-prefix-label">
                        {errors.prefix}
                      </FormHelperText>
                  )}

                  <TextField
                      fullWidth
                      error={Boolean(touched.quantity && errors.quantity)}
                      label="新建数量"
                      type="number"
                      value={values.quantity}
                      name="quantity"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      inputProps={{ autoComplete: 'quantity' }}
                      aria-describedby="helper-text-quantity-label"
                      sx={{ ...theme.typography.otherInput }}
                  />
                  {touched.quantity && errors.quantity && (
                      <FormHelperText error id="helper-text-quantity-label">
                        {errors.quantity}
                      </FormHelperText>
                  )}

                  <FormControl fullWidth error={Boolean(touched.remain_quota && errors.remain_quota)} sx={{ ...theme.typography.otherInput }}>
                    <InputLabel htmlFor="channel-remain_quota-label">额度</InputLabel>
                    <OutlinedInput
                        id="channel-remain_quota-label"
                        label="额度"
                        type="number"
                        value={values.remain_quota}
                        name="remain_quota"
                        endAdornment={<InputAdornment position="end">{renderQuotaWithPrompt(values.remain_quota)}</InputAdornment>}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        aria-describedby="helper-text-channel-remain_quota-label"
                        disabled={values.unlimited_quota}
                    />

                    {touched.remain_quota && errors.remain_quota && (
                        <FormHelperText error id="helper-tex-channel-remain_quota-label">
                          {errors.remain_quota}
                        </FormHelperText>
                    )}
                  </FormControl>

                  <TextField
                      fullWidth
                      error={Boolean(touched.subnet && errors.subnet)}
                      label="IP 限制"
                      type="text"
                      value={values.subnet}
                      name="subnet"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      inputProps={{ autoComplete: 'subnet' }}
                      aria-describedby="helper-text-subnet-label"
                      sx={{ ...theme.typography.otherInput }}
                  />
                  {touched.subnet && errors.subnet ? (
                      <FormHelperText error id="helper-text-subnet-label">
                        {errors.subnet}
                      </FormHelperText>
                  ) : (
                      <FormHelperText id="helper-text-subnet-label">
                        请输入允许访问的网段，例如：192.168.0.0/24，请使用英文逗号分隔多个网段
                      </FormHelperText>
                  )}

                  <TextField
                      fullWidth
                      error={Boolean(touched.models && errors.models)}
                      label="模型范围"
                      type="text"
                      value={values.models.join(',')}
                      name="models"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      inputProps={{ autoComplete: 'models' }}
                      aria-describedby="helper-text-models-label"
                      sx={{ ...theme.typography.otherInput }}
                  />
                  {errors.models ? (
                      <FormHelperText error id="helper-text-models-label">
                        {errors.models}
                      </FormHelperText>
                  ) : (
                      <FormHelperText id="helper-text-models-label">
                        请选择允许使用的模型，留空则不进行限制
                      </FormHelperText>
                  )}

                  <Switch
                      checked={values.expired_time === -1}
                      onClick={() => {
                        if (values.expired_time === -1) {
                          setFieldValue('expired_time', Math.floor(Date.now() / 1000));
                        } else {
                          setFieldValue('expired_time', -1);
                        }
                      }}
                  />{' '}
                  永不过期
                  <Switch
                      checked={values.unlimited_quota === true}
                      onClick={() => {
                        setFieldValue('unlimited_quota', !values.unlimited_quota);
                      }}
                  />{' '}
                  无限额度

                  <DialogActions>
                    <Button onClick={onCancel}>取消</Button>
                    <Button disableElevation disabled={isSubmitting} type="submit" variant="contained" color="primary">
                      提交
                    </Button>
                  </DialogActions>
                </form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
  );
};

export default BatchModal;

BatchModal.propTypes = {
  open: PropTypes.bool,
  onCancel: PropTypes.func,
  onOk: PropTypes.func
};
