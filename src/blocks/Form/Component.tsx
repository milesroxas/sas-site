import { resolveFormFields } from '@/blocks/shared/form/resolve-form'
import { Section, type SectionTheme } from '@/blocks/shared/section'
import { Container } from '@/components/Container'
import RichText from '@/components/RichText'
import type { FormBlock as FormBlockProps, Form as FormDoc } from '@/payload-types'
import { FormRenderer } from './Component.client'

export type { FormBlockProps }

/**
 * A form composed onto a page.
 *
 * Server-side because a form's fields can point at other documents — capability
 * chips name taxonomy terms — and those resolve here rather than shipping ids
 * to the browser and fetching again.
 */
export const FormBlock: React.FC<FormBlockProps & { theme?: SectionTheme | null }> = async ({
  enableIntro,
  form,
  introContent,
  theme,
}) => {
  if (typeof form !== 'object' || form === null) return null

  const doc = form as FormDoc
  const fields = await resolveFormFields(doc)

  return (
    <Section theme={theme}>
      <Container width="narrow">
        {enableIntro && introContent ? (
          <RichText className="mb-8 lg:mb-12" data={introContent} enableGutter={false} />
        ) : null}
        <FormRenderer
          confirmationMessage={doc.confirmationMessage}
          confirmationType={doc.confirmationType}
          delivery={doc.delivery ?? 'submissions'}
          fields={fields}
          formId={doc.id}
          redirectUrl={doc.redirect?.url}
          submitLabel={doc.submitButtonLabel ?? 'Submit'}
        />
      </Container>
    </Section>
  )
}
