import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import type { UpdateIndicationSchemaValues } from '../schemas/indication.schema'
import type { ApiIndicationDetail } from '../types/indication.type'
import { toast } from '@/shared/components/ui/toast/use-toast'
import { updateIndication } from '../services/indication.service'

export type EditSection = 'main' | 'location' | 'organization'

export function useIndicationEdit(onSuccess?: () => void) {
  const { t } = useTranslation()
  const [isFormOpened, setIsFormOpened] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editTarget, setEditTarget] = useState<ApiIndicationDetail | null>(null)
  const [editSection, setEditSection] = useState<EditSection>('main')

  const openForm = useCallback((indication: ApiIndicationDetail, section: EditSection = 'main') => {
    setEditTarget(indication)
    setEditSection(section)
    setIsFormOpened(true)
  }, [])

  const closeForm = useCallback(() => {
    setIsFormOpened(false)
  }, [])

  const handleSubmit = useCallback(
    async (values: UpdateIndicationSchemaValues) => {
      if (!editTarget) return
      setIsSubmitting(true)
      try {
        await updateIndication(editTarget.id, values)
        toast({
          title: t('common.success'),
          description: t('common.updateMessage'),
          variant: 'success',
        })
        closeForm()
        onSuccess?.()
      } catch {
        toast({
          title: t('common.error'),
          description: t('common.errorMessage'),
          variant: 'destructive',
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [editTarget, closeForm, onSuccess, t]
  )

  return { isFormOpened, isSubmitting, editTarget, editSection, openForm, closeForm, handleSubmit }
}
