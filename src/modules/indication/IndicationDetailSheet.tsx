import { useTranslation } from 'react-i18next'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/shared/components/ui/sheet'
import { Spinner } from '@/shared/components/ui/spinner'
import { FormDialog } from '@/shared/components/base/FormDialog'
import { IndicationMainContainer } from './containers/IndicationMainContainer'
import { IndicationLocationContainer } from './containers/IndicationLocationContainer'
import { IndicationOrganizationContainer } from './containers/IndicationOrganizationContainer'
import { IndicationAuditContainer } from './containers/IndicationAuditContainer'
import { IndicationEditForm } from './components/IndicationEditForm'
import { useIndicationDetail } from './hooks/useIndicationDetail'
import { useIndicationEdit } from './hooks/useIndicationEdit'

interface Props {
  id: number | null
  open: boolean
  onClose: () => void
}

export function IndicationDetailSheet({ id, open, onClose }: Props) {
  const { t } = useTranslation()

  const { data, isLoading, error, reload } = useIndicationDetail(id ?? 0)
  const { isFormOpened, isSubmitting, editTarget, editSection, openForm, closeForm, handleSubmit } =
    useIndicationEdit(reload)

  function renderBody() {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center flex-1 py-24">
          <Spinner size="lg" />
        </div>
      )
    }

    if (error || !data) {
      return (
        <div className="flex items-center justify-center flex-1 py-24">
          <span className="text-sm text-destructive">{t('common.errorMessage')}</span>
        </div>
      )
    }

    return (
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        <IndicationMainContainer data={data} onEdit={() => openForm(data, 'main')} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <IndicationLocationContainer data={data} onEdit={() => openForm(data, 'location')} />
          <IndicationOrganizationContainer
            data={data}
            onEdit={() => openForm(data, 'organization')}
          />
        </div>

        <IndicationAuditContainer data={data} />
      </div>
    )
  }

  const sectionTitle = editSection
    ? t(`indicationDetail.sections.${editSection}`)
    : t('indicationListing.edit.title')

  return (
    <>
      <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
        <SheetContent>
          <SheetHeader className="pr-10">
            <SheetTitle className="truncate">
              {isLoading ? t('common.loading') : (data?.name ?? '—')}
            </SheetTitle>
            {data && (
              <SheetDescription>
                {t('indicationDetail.fields.id')}: {data.id}
              </SheetDescription>
            )}
          </SheetHeader>

          {renderBody()}
        </SheetContent>
      </Sheet>

      <FormDialog
        open={isFormOpened}
        onOpenChange={closeForm}
        isLoading={isSubmitting}
        title={sectionTitle}
        description={t('indicationListing.edit.description')}
        formId="edit-indication-form"
      >
        {editTarget && (
          <IndicationEditForm
            id="edit-indication-form"
            isSubmitting={isSubmitting}
            initialData={editTarget}
            section={editSection}
            onSubmit={handleSubmit}
          />
        )}
      </FormDialog>
    </>
  )
}
