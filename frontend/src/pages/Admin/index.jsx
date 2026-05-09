import { useSelector } from 'react-redux';
import CrudModule from '@/modules/CrudModule/CrudModule';
import AdminForm from '@/forms/AdminForm';
import { fields } from './config';
import { selectCurrentAdmin } from '@/redux/auth/selectors';
import useLanguage from '@/locale/useLanguage';

export default function Admin() {
  const translate = useLanguage();
  const currentAdmin = useSelector(selectCurrentAdmin);
  const entity = 'admin';
  const searchConfig = {
    displayLabels: ['name', 'surname', 'email', 'role'],
    searchFields: 'name,surname,email,role',
  };
  const deleteModalLabels = ['name', 'surname'];

  const Labels = {
    PANEL_TITLE: translate('users'),
    DATATABLE_TITLE: translate('admin_list'),
    ADD_NEW_ENTITY: translate('add_new_admin'),
    ENTITY_NAME: translate('admin'),
  };

  const config = {
    entity,
    ...Labels,
    fields,
    searchConfig,
    deleteModalLabels,
  };

  const isOwner = currentAdmin?.role === 'owner';

  return (
    <CrudModule
      createForm={<AdminForm isForAdminOwner={isOwner} />}
      updateForm={<AdminForm isUpdateForm={true} isForAdminOwner={isOwner} />}
      config={config}
    />
  );
}
