export const fields = {
  name: {
    type: 'string',
    required: true,
  },
  email: {
    type: 'email',
    required: true,
  },
  phone: {
    type: 'phone',
  },
  company: {
    type: 'string',
  },
  source: {
    type: 'select',
    options: [
      { value: 'website', label: 'Website' },
      { value: 'referral', label: 'Referral' },
      { value: 'social_media', label: 'Social Media' },
      { value: 'advertisement', label: 'Advertisement' },
      { value: 'other', label: 'Other' },
    ],
    defaultValue: 'other',
  },
  status: {
    type: 'select',
    options: [
      { value: 'new', label: 'New', color: 'blue' },
      { value: 'contacted', label: 'Contacted', color: 'orange' },
      { value: 'qualified', label: 'Qualified', color: 'purple' },
      { value: 'proposal', label: 'Proposal', color: 'cyan' },
      { value: 'negotiation', label: 'Negotiation', color: 'geekblue' },
      { value: 'closed_won', label: 'Closed Won', color: 'green' },
      { value: 'closed_lost', label: 'Closed Lost', color: 'red' },
    ],
    defaultValue: 'new',
  },
  followUps: {
    type: 'array',
    fields: {
      date: {
        type: 'date',
        defaultValue: new Date(),
      },
      type: {
        type: 'select',
        options: [
          { value: 'call', label: 'Call' },
          { value: 'email', label: 'Email' },
          { value: 'meeting', label: 'Meeting' },
          { value: 'note', label: 'Note' },
        ],
        defaultValue: 'note',
      },
      notes: {
        type: 'textarea',
      },
      outcome: {
        type: 'string',
      },
    },
  },
  nextActionDate: {
    type: 'date',
  },
  notes: {
    type: 'textarea',
  },
};