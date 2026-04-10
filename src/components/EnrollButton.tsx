import { useState } from 'react'
import { Button } from './ui/Button'

interface Props {
  enrolled: boolean
  courseFull: boolean
  onEnroll: () => Promise<void>
  onUnenroll: () => Promise<void>
}

export default function EnrollButton({ enrolled, courseFull, onEnroll, onUnenroll }: Props) {
  const [busy, setBusy] = useState(false)

  async function handleClick() {
    setBusy(true)
    try {
      if (enrolled) {
        await onUnenroll()
      } else {
        await onEnroll()
      }
    } finally {
      setBusy(false)
    }
  }

  if (courseFull && !enrolled) {
    return (
      <Button variant="outline" disabled>
        Course Full
      </Button>
    )
  }

  return (
    <Button
      onClick={handleClick}
      isLoading={busy}
      variant={enrolled ? 'danger' : 'primary'}
      className="min-w-[120px]"
    >
      {enrolled ? 'Unenroll' : 'Enroll'}
    </Button>
  )
}
