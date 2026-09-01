import Image from 'next/image'

const css = `
  .graphic-logo {
    display: block;
    height: auto;
    width: min(100%, 17.5rem);
  }
  .graphic-logo--dark {
    display: none;
  }
  html[data-theme='dark'] .graphic-logo--light {
    display: none;
  }
  html[data-theme='dark'] .graphic-logo--dark {
    display: block;
  }
`

export const AdminLogo = () => {
  return (
    <>
      <style>{css}</style>
      <Image
        alt="Suits & Sandals"
        className="graphic-logo graphic-logo--light"
        height={28}
        src="/logo-type-light.svg"
        unoptimized
        width={352}
      />
      <Image
        alt=""
        aria-hidden
        className="graphic-logo graphic-logo--dark"
        height={28}
        src="/logo-type-dark.svg"
        unoptimized
        width={352}
      />
    </>
  )
}
