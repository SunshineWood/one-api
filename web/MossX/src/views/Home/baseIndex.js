import { Box, Typography, Button, Container, Stack } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';

const BaseIndex = () => (
  <Box
    sx={{
      minHeight: 'calc(100vh - 136px)',
      backgroundImage: 'linear-gradient(to right, #ff9966, #ff5e62)',
      color: 'white',
      p: 4
    }}
  >
    <Container maxWidth="lg">
      <Grid container columns={6} wrap="nowrap" alignItems="center" justifyContent="center" sx={{ minHeight: 'calc(100vh - 230px)' }}>
        <Grid md={7} lg={6}>
          <Stack spacing={3} alignItems="center">
            <Typography
              variant="h1"
              sx={{
                fontSize: '4rem',
                color: '#fff',
                lineHeight: 1.5,
                textAlign: 'center'
              }}
            >
              📢 重要公告 (2024年12月08日更新)
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontSize: '1.4rem',
                color: '#fff',
                lineHeight: 1.8,
                textAlign: 'left'
              }}
            >
              🔑 账户登录与安全
              <br />
              本站最新地址：https://api.mossx.tech
              <br />
              点击右上角"登入"按钮即可注册新账号或登录已有账号，注册无需邀请码，选填！
              <br />
              登录后请立即绑定邮箱，以确保账号安全
              <br />
              推荐使用Edge或Chrome浏览器，不推荐国产浏览器！
              <br />
              🤖 模型支持：
              <br />
              GPT：gpt-3.5-turbo gpt-3.5-turbo-0125 gpt-3.5-turbo-16k gpt-3.5-turbo-16k-0613 gpt-4-turbo gpt-4-turbo-2024-04-09 gpt-4o-all
              gpt-4o-2024-08-06 gpt-4o-mini-2024-07-18 chatgpt-4o-latest
              <br />
              claude: claude-3-5-sonnet-20240620 claude-3-5-sonnet-20241022 claude-3-5-haiku-20241022
              <br />
              按量计费价格: 0.5元/刀 充值方式: 钱包充值--输入额度直充或者充值钱包充值**--获取兑换码充值
              <br />
              💬 用户交流 QQ群: 885345386 站主QQ: 59773627
              <br />
              感谢您的支持与关注!
            </Typography>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  </Box>
);

export default BaseIndex;
