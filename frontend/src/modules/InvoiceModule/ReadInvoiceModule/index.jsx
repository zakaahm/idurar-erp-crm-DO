import NotFound from '@/components/NotFound';
import { ErpLayout } from '@/layout';
import ReadItem from '@/modules/ErpPanelModule/ReadItem';

import PageLoader from '@/components/PageLoader';
import { erp } from '@/redux/erp/actions';
import { selectReadItem } from '@/redux/erp/selectors';

import { useLayoutEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useParams } from 'react-router-dom';

import { Button, message, Space } from 'antd';
import { MailOutlined } from '@ant-design/icons';

export default function ReadInvoiceModule({ config }) {
  const dispatch = useDispatch();
  const { id } = useParams();

  const [sendingMail, setSendingMail] = useState(false);

  useLayoutEffect(() => {
    dispatch(erp.read({ entity: config.entity, id }));
  }, [dispatch, config.entity, id]);

  const {
    result: currentResult,
    isSuccess,
    isLoading = true,
  } = useSelector(selectReadItem);

  const handleSendMail = async () => {
    try {
      setSendingMail(true);

      const auth = JSON.parse(localStorage.getItem('auth'));
      const token = auth?.current?.token;

      if (!token) {
        throw new Error('Geen login token gevonden. Log opnieuw in.');
      }

      const invoiceId = currentResult?.id || id;

      const response = await fetch(`/api/invoice/mail/${invoiceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Mail kon niet worden verzonden');
      }

      message.success(data?.message || 'Offerte succesvol per mail verzonden');
    } catch (error) {
      message.error(error.message || 'Er ging iets mis bij het verzenden');
    } finally {
      setSendingMail(false);
    }
  };

  if (isLoading) {
    return (
      <ErpLayout>
        <PageLoader />
      </ErpLayout>
    );
  }

  return (
    <ErpLayout>
      {isSuccess ? (
        <>
          <Space style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              icon={<MailOutlined />}
              loading={sendingMail}
              onClick={handleSendMail}
            >
              Verstuur offerte per mail
            </Button>
          </Space>

          <ReadItem config={config} selectedItem={currentResult} />
        </>
      ) : (
        <NotFound entity={config.entity} />
      )}
    </ErpLayout>
  );
}