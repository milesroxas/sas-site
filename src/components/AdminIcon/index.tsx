import Image from 'next/image'

export const AdminIcon = () => {
  return (
    <Image
      alt="Suits & Sandals"
      height={32}
      src="/logomark.svg"
      style={{ borderRadius: 4 }}
      width={32}
    />
  )
}
