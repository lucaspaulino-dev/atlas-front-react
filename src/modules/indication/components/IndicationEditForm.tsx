import { useMemo } from 'react'
import { useForm, useController } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { cn } from '@/shared/helpers/cn'
import {
  updateIndicationSchema,
  type UpdateIndicationSchemaValues,
} from '../schemas/indication.schema'
import type { ApiIndicationDetail } from '../types/indication.type'
import type { EditSection } from '../hooks/useIndicationEdit'
import { useIndicationFormOptions } from '../hooks/useIndicationFormOptions'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Select } from '@/shared/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group'
import { Spinner } from '@/shared/components/ui/spinner'

interface IndicationEditFormProps {
  id: string
  isSubmitting: boolean
  initialData: ApiIndicationDetail
  section: EditSection
  onSubmit: (values: UpdateIndicationSchemaValues) => void
}

export function IndicationEditForm({
  id,
  isSubmitting,
  initialData,
  section,
  onSubmit,
}: IndicationEditFormProps) {
  const { t } = useTranslation()
  const schema = useMemo(() => updateIndicationSchema(t), [t])
  const { cities, organizations, isLoadingOptions, optionsError } = useIndicationFormOptions()
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UpdateIndicationSchemaValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData.name,
      ip: initialData.ip === 'IP' || initialData.ip === 'DO' ? initialData.ip : 'IP',
      city_id: String(initialData.city_id),
      organization_id: String(initialData.organization_id),
      grant_date: initialData.grant_date,
    },
  })

  const { field: ipField } = useController({ name: 'ip', control })
  const { field: cityField } = useController({ name: 'city_id', control })
  const { field: orgField } = useController({ name: 'organization_id', control })

  const disabled = isSubmitting || isLoadingOptions

  const isMain = section === 'main'
  const isLocation = section === 'location'
  const isOrganization = section === 'organization'

  return (
    <form id={id} className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      {optionsError && <p className="text-sm text-destructive">{optionsError}</p>}

      {/* Main section fields */}
      <div className={cn('space-y-4', !isMain && 'hidden')}>
        <div className="space-y-2">
          <Label htmlFor="edit-name">{t('indicationListing.create.form.name.label')}</Label>
          <Input
            id="edit-name"
            placeholder={t('indicationListing.create.form.name.placeholder')}
            disabled={disabled}
            {...register('name')}
          />
          {isMain && errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>{t('indicationListing.create.form.ip.label')}</Label>
          <RadioGroup value={ipField.value} onValueChange={ipField.onChange} disabled={disabled}>
            {(['IP', 'DO'] as const).map((opt) => (
              <div key={opt} className="flex items-center gap-2">
                <RadioGroupItem value={opt} id={`edit-ip-${opt}`} />
                <Label htmlFor={`edit-ip-${opt}`} className="cursor-pointer font-normal">
                  {opt}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {isMain && errors.ip && <p className="text-sm text-destructive">{errors.ip.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-grant-date">
            {t('indicationListing.create.form.grantDate.label')}
          </Label>
          <Input id="edit-grant-date" type="date" disabled={disabled} {...register('grant_date')} />
          {isMain && errors.grant_date && (
            <p className="text-sm text-destructive">{errors.grant_date.message}</p>
          )}
        </div>
      </div>

      {/* Location section fields */}
      <div className={cn('space-y-2', !isLocation && 'hidden')}>
        <div className="flex items-center gap-2">
          <Label htmlFor="edit-city-id">{t('indicationListing.create.form.city.label')}</Label>
          {isLoadingOptions && <Spinner size="sm" />}
        </div>
        <Select id="edit-city-id" disabled={disabled} {...cityField}>
          <option value="">{t('indicationListing.create.form.city.placeholder')}</option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </Select>
        {isLocation && errors.city_id && (
          <p className="text-sm text-destructive">{errors.city_id.message}</p>
        )}
      </div>

      {/* Organization section fields */}
      <div className={cn('space-y-2', !isOrganization && 'hidden')}>
        <div className="flex items-center gap-2">
          <Label htmlFor="edit-organization-id">
            {t('indicationListing.create.form.organization.label')}
          </Label>
          {isLoadingOptions && <Spinner size="sm" />}
        </div>
        <Select id="edit-organization-id" disabled={disabled} {...orgField}>
          <option value="">{t('indicationListing.create.form.organization.placeholder')}</option>
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </Select>
        {isOrganization && errors.organization_id && (
          <p className="text-sm text-destructive">{errors.organization_id.message}</p>
        )}
      </div>
    </form>
  )
}
