import { useTranslation } from 'react-i18next'
import { DetailContainer, DetailField } from '@/shared/components/base/DetailContainer'
import type { ApiIndicationDetail } from '../types/indication.type'

interface Props {
  data: ApiIndicationDetail
  onEdit?: () => void
}

export function IndicationOrganizationContainer({ data, onEdit }: Props) {
  const { t } = useTranslation()

  return (
    <DetailContainer title={t('indicationDetail.sections.organization')} onEdit={onEdit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DetailField
          label={t('indicationDetail.fields.organizationName')}
          value={data.organization.name}
        />
      </div>
    </DetailContainer>
  )
}
