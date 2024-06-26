'use client';

import { Row, Col, Input, Form, Button, Space, message } from 'antd';
import styles from './page.module.scss';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const formItemLayout = {
  labelCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 10,
    },
  },
  wrapperCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 14,
    },
  },
};
export default function Register() {
  const [inputs, setInputs] = useState({
    email: '',
    username: '',
    fullname: '',
    password: '',
    otp: '',
  });
  const [loading, setLoading] = useState(false);
  const [loadingOTP, setloadingOTP] = useState(false);

  const router = useRouter();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const handleChange = (event: any) => {
    const name = event.target.name;
    const value = event.target.value;

    setInputs((values) => ({ ...values, [name]: value }));
  };

  const notify = (type: any, message: string) => {
    messageApi.open({
      type: type,
      content: message,
    });
  };

  const handleSendOtp = async (event: any) => {
    try {
      await form.validateFields();
    } catch (e) {}

    const hasErrors = form.getFieldsError().some(({ errors }) => {
      return errors.length;
    });
    if (!hasErrors) {
      try {
        setloadingOTP(true);
        const response = await fetch(`${process.env.API}/api/v1/auth/register/otp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: inputs.email,
          }),
          credentials: 'include',
        });

        if (response.ok) {
          //  success
          setloadingOTP(false);
          notify('success', 'Vui lòng xác nhận mã OTP trong email');
        } else {
          // fail
          const data = await response.json();
          setloadingOTP(false);
          notify('error', data.message);
        }
      } catch (err) {
        console.log(err);
        setloadingOTP(false);
      }
    }
  };
  const handleRegister = async (event: any) => {
    try {
      setLoading(true);

      const response = await fetch(`${process.env.API}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: inputs.username,
          email: inputs.email,
          password: inputs.password,
          fullName: inputs.fullname,
          otpCode: inputs.otp,
        }),
      });

      const data = await response.json();

      if (data.error) {
        // fail
        setLoading(false);
        notify('error', data.message);
      } else {
        //  success
        setLoading(false);
        notify('success', 'Đăng ký thành công');
        setTimeout(() => {
          router.push('/');
        }, 1000);
      }
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <div className={styles.wrapper}>
        <Row className={styles.row} justify="center">
          <Col xs={24} sm={20} xl={14}>
            <Row className={styles.card} gutter={{ xs: 0, md: 50 }}>
              <Col className={styles.left} span={24} md={12}>
                <h2 style={{ display: 'block', textAlign: 'center', marginBottom: '20px' }}>
                  Đăng ký
                </h2>
                <Form
                  onFinish={handleRegister}
                  form={form}
                  autoComplete="off"
                  {...formItemLayout}
                  scrollToFirstError
                >
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      {
                        type: 'email',
                        message: 'Email không hợp lệ!',
                      },
                      {
                        required: true,
                        message: 'Hãy nhập email của bạn!',
                      },
                    ]}
                  >
                    <Input name="email" value={inputs.email} onChange={handleChange} />
                  </Form.Item>

                  <Form.Item
                    name="username"
                    label="Tên tài khoản"
                    rules={[
                      {
                        required: true,
                        message: 'Hãy nhập tên tài khoản!',
                      },
                    ]}
                  >
                    <Input name="username" value={inputs.username} onChange={handleChange} />
                  </Form.Item>

                  <Form.Item
                    name="fullname"
                    label="Họ và tên"
                    rules={[
                      {
                        required: true,
                        message: 'Hãy nhập họ và tên!',
                      },
                    ]}
                  >
                    <Input name="fullname" value={inputs.fullname} onChange={handleChange} />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    label="Mật khẩu"
                    rules={[
                      {
                        required: true,
                        message: 'Hãy nhập mật khẩu của bạn!',
                      },
                    ]}
                    hasFeedback
                  >
                    <Input.Password
                      name="password"
                      value={inputs.password}
                      onChange={handleChange}
                    />
                  </Form.Item>

                  <Form.Item
                    name="confirm"
                    label="Nhập lại mật khẩu"
                    dependencies={['password']}
                    hasFeedback
                    rules={[
                      {
                        required: true,
                        message: 'Hãy nhập xác nhận mật khẩu!',
                      },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error('The new password that you entered do not match!')
                          );
                        },
                      }),
                    ]}
                  >
                    <Input.Password />
                  </Form.Item>

                  <Form.Item label="OTP">
                    <Space>
                      <Form.Item name="otp">
                        <Input name="otp" value={inputs.otp} onChange={handleChange} />
                      </Form.Item>

                      <Form.Item>
                        <Button
                          className={styles['btn-resend']}
                          type="primary"
                          onClick={handleSendOtp}
                          disabled={loadingOTP}
                        >
                          {loadingOTP ? 'Please wait...' : 'Gửi'}
                        </Button>
                      </Form.Item>
                    </Space>
                  </Form.Item>
                  <div className={styles['btn-register']}>
                    <Button size="large" type="primary" htmlType="submit" disabled={loading}>
                      {loading ? 'Please wait...' : 'Đăng ký'}
                    </Button>
                  </div>
                </Form>

                <Link className={styles.login} href="/login">
                  Trở về đăng nhập
                </Link>
              </Col>

              <Col className={styles.right} span={0} md={12}>
                <img src="./register.jpg" alt="sign up image" />
                <Link href="/login">Trở về đăng nhập</Link>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    </>
  );
}
