import useLanguage from '@/locale/useLanguage';
import ReadLeadModule from '@/modules/LeadModule/ReadLeadModule';

export default function LeadRead() {
  const entity = 'lead';
  const translate = useLanguage();
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
  return <ReadLeadModule config={configPage} />;
}