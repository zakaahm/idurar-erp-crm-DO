import { useState } from 'react';
import { DatePicker, Input, Form, Select, InputNumber, Switch, Tag } from 'antd';

import { CloseOutlined, CheckOutlined } from '@ant-design/icons';
import useLanguage from '@/locale/useLanguage';
import { useMoney, useDate } from '@/settings';
import AutoCompleteAsync from '@/components/AutoCompleteAsync';
import SelectAsync from '@/components/SelectAsync';

import { countryList } from '@/utils/countryList';

export default function DynamicForm({ fields, isUpdateForm = false }) {
  const [feedback, setFeedback] = useState();

  return (
    <div>
      {Object.keys(fields).map((key) => {
        const field = {
          ...fields[key],
          name: key,
          label: fields[key].label || key,
        };

        if (
          (isUpdateForm && !field.disableForUpdate) ||
          !field.disableForForm
        ) {
          if (field.hasFeedback) {
            return (
              <FormElement
                feedback={feedback}
                setFeedback={setFeedback}
                key={key}
                field={field}
                isUpdateForm={isUpdateForm}
              />
            );
          } else if (feedback && field.feedback) {
            if (feedback === field.feedback) {
              return (
                <FormElement
                  key={key}
                  field={field}
                  isUpdateForm={isUpdateForm}
                />
              );
            }
          } else {
            return (
              <FormElement
                key={key}
                field={field}
                isUpdateForm={isUpdateForm}
              />
            );
          }
        }

        return null;
      })}
    </div>
  );
}

function FormElement({
  field,
  feedback,
  setFeedback,
  isUpdateForm,
}) {
  const translate = useLanguage();
  const money = useMoney();
  const { dateFormat } = useDate();

  const { TextArea } = Input;

  const fieldType = {
    string: 'string',
    textarea: 'string',
    number: 'number',
    phone: 'string',
    url: 'url',
    website: 'url',
    email: 'email',
  };

  const commonRules = [
    {
      required: field.required || false,
      type: fieldType[field.type] ?? 'any',
    },
  ];

  const SelectComponent = () => (
    <Form.Item
      label={translate(field.label)}
      name={field.name}
      rules={commonRules}
    >
      <Select
        showSearch={field.showSearch}
        defaultValue={
          isUpdateForm ? undefined : field.defaultValue
        }
        style={{ width: '100%' }}
      >
        {field.options?.map((option) => (
          <Select.Option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );

  const SelectWithTranslationComponent = () => (
    <Form.Item
      label={translate(field.label)}
      name={field.name}
      rules={commonRules}
    >
      <Select
        defaultValue={field.defaultValue}
        style={{ width: '100%' }}
      >
        {field.options?.map((option) => (
          <Select.Option
            key={option.value}
            value={option.value}
          >
            <Tag bordered={false} color={option.color}>
              {translate(option.label)}
            </Tag>
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );

  const SelectWithFeedbackComponent = ({
    feedbackValue,
    launchFeedback,
  }) => (
    <Form.Item
      label={translate(field.label)}
      name={field.name}
      rules={commonRules}
    >
      <Select
        onSelect={(value) => launchFeedback(value)}
        value={feedbackValue}
        style={{ width: '100%' }}
      >
        {field.options?.map((option) => (
          <Select.Option
            key={option.value}
            value={option.value}
          >
            {translate(option.label)}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );

  const ColorComponent = () => (
    <Form.Item
      label={translate(field.label)}
      name={field.name}
      rules={commonRules}
    >
      <Select
        showSearch
        defaultValue={field.defaultValue}
        filterOption={(input, option) =>
          (option?.label ?? '')
            .toLowerCase()
            .includes(input.toLowerCase())
        }
        filterSort={(optionA, optionB) =>
          (optionA?.label ?? '')
            .toLowerCase()
            .localeCompare(
              (optionB?.label ?? '').toLowerCase()
            )
        }
        style={{ width: '100%' }}
      >
        {field.options?.map((option) => (
          <Select.Option
            key={option.value}
            value={option.value}
            label={option.label}
          >
            <Tag bordered={false} color={option.color}>
              {option.label}
            </Tag>
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );

  const TagComponent = () => (
    <Form.Item
      label={translate(field.label)}
      name={field.name}
      rules={commonRules}
    >
      <Select
        defaultValue={field.defaultValue}
        style={{ width: '100%' }}
      >
        {field.options?.map((option) => (
          <Select.Option
            key={option.value}
            value={option.value}
          >
            <Tag bordered={false} color={option.color}>
              {translate(option.label)}
            </Tag>
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );

  const ArrayComponent = () => (
    <Form.Item
      label={translate(field.label)}
      name={field.name}
      rules={commonRules}
    >
      <Select
        mode="multiple"
        defaultValue={field.defaultValue}
        style={{ width: '100%' }}
      >
        {field.options?.map((option) => (
          <Select.Option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );

  const CountryComponent = () => (
    <Form.Item
      label={translate(field.label)}
      name={field.name}
      rules={commonRules}
    >
      <Select
        showSearch
        defaultValue={field.defaultValue}
        optionFilterProp="children"
        filterOption={(input, option) =>
          (option?.label ?? '')
            .toLowerCase()
            .includes(input.toLowerCase())
        }
        filterSort={(optionA, optionB) =>
          (optionA?.label ?? '')
            .toLowerCase()
            .localeCompare(
              (optionB?.label ?? '').toLowerCase()
            )
        }
        style={{ width: '100%' }}
      >
        {countryList.map((country) => (
          <Select.Option
            key={country.value}
            value={country.value}
            label={translate(country.label)}
          >
            {country?.icon && `${country.icon} `}
            {translate(country.label)}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );

  const SearchComponent = () => (
    <Form.Item
      label={translate(field.label)}
      name={field.name}
      rules={commonRules}
    >
      <AutoCompleteAsync
        entity={field.entity}
        displayLabels={field.displayLabels}
        searchFields={field.searchFields}
        outputValue={field.outputValue}
        withRedirect={field.withRedirect}
        urlToRedirect={field.urlToRedirect}
        redirectLabel={field.redirectLabel}
      />
    </Form.Item>
  );

  const formItemComponent = {
    select: <SelectComponent />,
    selectWithTranslation:
      <SelectWithTranslationComponent />,
    selectWithFeedback: (
      <SelectWithFeedbackComponent
        launchFeedback={setFeedback}
        feedbackValue={feedback}
      />
    ),
    color: <ColorComponent />,
    tag: <TagComponent />,
    array: <ArrayComponent />,
    country: <CountryComponent />,
    search: <SearchComponent />,
  };

  const computedComponent = {
    string: (
      <Input
        autoComplete="off"
        maxLength={field.maxLength}
        defaultValue={
          isUpdateForm
            ? undefined
            : field.defaultValue
        }
      />
    ),

    url: (
      <Input
        addonBefore="http://"
        autoComplete="off"
        placeholder="www.example.com"
      />
    ),

    textarea: <TextArea rows={4} />,

    email: (
      <Input
        autoComplete="off"
        placeholder="email@example.com"
      />
    ),

    number: (
      <InputNumber
        style={{ width: '100%' }}
      />
    ),

    phone: (
      <Input
        style={{ width: '100%' }}
        placeholder="+1 123 456 789"
      />
    ),

    boolean: (
      <Switch
        checkedChildren={<CheckOutlined />}
        unCheckedChildren={<CloseOutlined />}
        defaultChecked={true}
      />
    ),

    date: (
      <DatePicker
        placeholder={translate('select_date')}
        style={{ width: '100%' }}
        format={dateFormat}
      />
    ),

    async: (
      <SelectAsync
        entity={field.entity}
        displayLabels={field.displayLabels}
        outputValue={field.outputValue}
        loadDefault={field.loadDefault}
        withRedirect={field.withRedirect}
        urlToRedirect={field.urlToRedirect}
        redirectLabel={field.redirectLabel}
      />
    ),

    currency: (
      <InputNumber
        className="moneyInput"
        min={0}
        controls={false}
        style={{ width: '100%' }}
        addonAfter={
          money.currency_position === 'after'
            ? money.currency_symbol
            : undefined
        }
        addonBefore={
          money.currency_position === 'before'
            ? money.currency_symbol
            : undefined
        }
      />
    ),
  };

  const customFormItem =
    formItemComponent[field.type];

  let renderComponent =
    computedComponent[field.type];

  if (!renderComponent) {
    renderComponent = computedComponent.string;
  }

  if (customFormItem) {
    return <>{customFormItem}</>;
  }

  return (
    <Form.Item
      label={translate(field.label)}
      name={field.name}
      rules={commonRules}
      valuePropName={
        field.type === 'boolean'
          ? 'checked'
          : 'value'
      }
    >
      {renderComponent}
    </Form.Item>
  );
}