import { useTranslation } from 'react-i18next'
import { DetailContainer, DetailField } from '@/shared/components/base/DetailContainer'
import type { ApiIndicationDetail } from '../types/indication.type'

interface Props {
  data: ApiIndicationDetail
  onEdit?: () => void
}

export function IndicationLocationContainer({ data, onEdit }: Props) {
  const { t } = useTranslation()

  return (
    <DetailContainer title={t('indicationDetail.sections.location')} onEdit={onEdit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DetailField label={t('indicationDetail.fields.city')} value={data.city.name} />
        <DetailField label={t('indicationDetail.fields.state')} value={data.city.state.name} />
        <DetailField label={t('indicationDetail.fields.uf')} value={data.city.state.uf} />
      </div>
    </DetailContainer>
  )
}
