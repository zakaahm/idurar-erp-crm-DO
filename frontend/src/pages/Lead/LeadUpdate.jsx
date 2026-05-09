import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { erp } from '@/redux/erp/actions';
import { selectReadItem } from '@/redux/erp/selectors';

import { ErpLayout } from '@/layout';
import PageLoader from '@/components/PageLoader';
import NotFound from '@/components/NotFound';
import DynamicForm from '@/forms/DynamicForm';
import { fields } from './config';
import useLanguage from '@/locale/useLanguage';
import { Form, Button } from 'antd';
import dayjs from 'dayjs';

export default function LeadUpdate() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const translate = useLanguage();

  const { result: currentResult, isSuccess, isLoading = true } = useSelector(selectReadItem);

  const [form] = Form.useForm();

  useEffect(() => {
    if (id) {
      dispatch(erp.read({ entity: 'lead', id }));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (currentResult) {
      const formData = {
        ...currentResult,
        created: currentResult.created ? dayjs(currentResult.created) : null,
        nextActionDate: currentResult.nextActionDate ? dayjs(currentResult.nextActionDate) : null,
        followUps: currentResult.followUps ? currentResult.followUps.map(followUp => ({
          ...followUp,
          date: followUp.date ? dayjs(followUp.date) : null,
        })) : [],
      };
      form.setFieldsValue(formData);
    }
  }, [currentResult, form]);

  const onSubmit = (values) => {
    dispatch(erp.update({ entity: 'lead', id, jsonData: values }));
  };

  if (isLoading) {
    return (
      <ErpLayout>
        <PageLoader />
      </ErpLayout>
    );
  }

  if (!isSuccess) {
    return (
      <ErpLayout>
        <NotFound entity="lead" />
      </ErpLayout>
    );
  }

  return (
    <ErpLayout>
      <div style={{ padding: '20px' }}>
        <h2>{translate('edit_lead')}</h2>
        <Form form={form} onFinish={onSubmit} layout="vertical">
          <DynamicForm fields={fields} isUpdateForm={true} />
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {translate('update')}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </ErpLayout>
  );
}