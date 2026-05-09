export const fields = {
  name: {
    type: 'string',
    required: true,
  },
  surname: {
    type: 'string',
    required: true,
  },
  email: {
    type: 'email',
    required: true,
  },
  role: {
    type: 'select',
    options: [
      { value: 'owner', label: 'Owner' },
      { value: 'admin', label: 'Admin' },
      { value: 'sales', label: 'Sales' },
    ],
    defaultValue: 'sales',
  },
  enabled: {
    type: 'boolean',
    defaultValue: true,
  },
};
