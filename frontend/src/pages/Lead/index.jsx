import CrudModule from '@/modules/CrudModule/CrudModule';
import DynamicForm from '@/forms/DynamicForm';
import { fields } from './config';

import useLanguage from '@/locale/useLanguage';

export default function Lead() {
  const translate = useLanguage();
  const entity = 'lead';
  const searchConfig = {
    displayLabels: ['name', 'email'],
    searchFields: 'name,email,company',
  };
  const deleteModalLabels = ['name'];

  const Labels = {
    PANEL_TITLE: translate('lead'),
    DATATABLE_TITLE: translate('lead_list'),
    ADD_NEW_ENTITY: translate('add_new_lead'),
    ENTITY_NAME: translate('lead'),
  };
  const configPage = {
    entity,
    ...Labels,
  };
  const config = {
    ...configPage,
    fields,
    searchConfig,
    deleteModalLabels,
    dataTableColumns: [
      {
        title: translate('Name'),
        dataIndex: 'name',
      },
      {
        title: translate('Email'),
        dataIndex: 'email',
      },
      {
        title: translate('Phone'),
        dataIndex: 'phone',
      },
      {
        title: translate('Status'),
        dataIndex: 'status',
        render: (status) => {
          const statusColors = {
            new: 'blue',
            contacted: 'orange',
            qualified: 'purple',
            proposal: 'cyan',
            negotiation: 'geekblue',
            closed_won: 'green',
            closed_lost: 'red',
          };
          return <span style={{ color: statusColors[status] || 'black' }}>{translate(status)}</span>;
        },
      },
      {
        title: translate('Next Action Date'),
        dataIndex: 'nextActionDate',
        render: (date) => date ? new Date(date).toLocaleDateString() : '',
      },
      {
        title: translate('Created'),
        dataIndex: 'created',
        render: (date) => new Date(date).toLocaleDateString(),
      },
    ],
  };
  return (
    <CrudModule
      createForm={<DynamicForm fields={fields} />}
      updateForm={<DynamicForm fields={fields} />}
      config={config}
    />
  );
}