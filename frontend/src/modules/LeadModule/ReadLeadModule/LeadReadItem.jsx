import { useState, useEffect } from 'react';
import { Divider } from 'antd';
import dayjs from 'dayjs';

import { Button, Row, Col, Descriptions, Statistic, Tag } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import {
  EditOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';

import { useSelector, useDispatch } from 'react-redux';
import useLanguage from '@/locale/useLanguage';
import { erp } from '@/redux/erp/actions';

import { generate as uniqueId } from 'shortid';

import { selectReadItem } from '@/redux/erp/selectors';

import { useDate } from '@/settings';
import { useNavigate } from 'react-router-dom';

export default function LeadReadItem({ config }) {
  const { entity, ENTITY_NAME } = config;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const translate = useLanguage();
  const { dateFormat } = useDate();

  const { result: currentErp } = useSelector(selectReadItem);

  const resetErp = {
    status: '',
    client: {
      name: '',
      address: '',
      email: '',
      phone: '',
    },
    subTotal: 0,
    taxTotal: 0,
    taxRate: 0,
    total: 0,
    credit: 0,
    number: 0,
    year: 0,
  };

  return (
    <>
      <PageHeader
        onBack={() => {
          navigate(`/${entity.toLowerCase()}`);
        }}
        title={`${ENTITY_NAME} # ${currentErp.number || ''}`}
        ghost={false}
        tags={<Tag color="volcano">{currentErp.status}</Tag>}
        extra={[
          <Button
            key={`${uniqueId()}`}
            onClick={() => {
              navigate(`/${entity.toLowerCase()}/update/${currentErp._id}`);
            }}
            type="primary"
            icon={<EditOutlined />}
          >
            {translate('edit')}
          </Button>,
        ]}
        style={{
          padding: '20px 0px',
        }}
      >
        <Row>
          <Statistic title="Status" value={currentErp.status} />
          <Statistic
            title={translate('Created')}
            value={dayjs(currentErp.created).format(dateFormat)}
            style={{
              margin: '0 32px',
            }}
          />
        </Row>
      </PageHeader>
      <Divider dashed />
      <Descriptions title={translate('Lead Information')}>
        <Descriptions.Item label={translate('Name')}>{currentErp.name}</Descriptions.Item>
        <Descriptions.Item label={translate('Email')}>{currentErp.email}</Descriptions.Item>
        <Descriptions.Item label={translate('Phone')}>{currentErp.phone}</Descriptions.Item>
        <Descriptions.Item label={translate('Company')}>{currentErp.company}</Descriptions.Item>
        <Descriptions.Item label={translate('Source')}>{currentErp.source}</Descriptions.Item>
        <Descriptions.Item label={translate('Next Action Date')}>
          {currentErp.nextActionDate ? dayjs(currentErp.nextActionDate).format(dateFormat) : ''}
        </Descriptions.Item>
      </Descriptions>
      <Divider />
      <Descriptions title={translate('Notes')}>
        <Descriptions.Item>{currentErp.notes}</Descriptions.Item>
      </Descriptions>
      {currentErp.followUps && currentErp.followUps.length > 0 && (
        <>
          <Divider />
          <Descriptions title={translate('Follow-ups')}>
            {currentErp.followUps.map((followUp, index) => (
              <Descriptions.Item key={index} label={`${translate('Follow-up')} ${index + 1}`}>
                <div>
                  <strong>{translate('Date')}:</strong> {dayjs(followUp.date).format(dateFormat)}
                </div>
                <div>
                  <strong>{translate('Type')}:</strong> {followUp.type}
                </div>
                <div>
                  <strong>{translate('Notes')}:</strong> {followUp.notes}
                </div>
                <div>
                  <strong>{translate('Outcome')}:</strong> {followUp.outcome}
                </div>
              </Descriptions.Item>
            ))}
          </Descriptions>
        </>
      )}
    </>
  );
}