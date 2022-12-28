import { Link, Outlet } from 'umi';
import styles from './index.less';
import zhCN from 'antd/es/locale/zh_CN';
import { ConfigProvider } from 'antd';

export default function Layout() {
  return (
    <ConfigProvider locale={zhCN}>
      <div className={styles.navs}>
        <Outlet />
      </div>
    </ConfigProvider>
  );
}
