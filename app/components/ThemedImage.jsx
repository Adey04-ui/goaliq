import Image from 'next/image'

export default function ThemedImage({ darkSrc, lightSrc, alt, className = '', ...props }) {
  return (
    <>
      <Image {...props} src={darkSrc} alt={alt} className={`${className} themed-img themed-img--dark`} />
      <Image {...props} src={lightSrc} alt="" aria-hidden="true" className={`${className} themed-img themed-img--light`} />
    </>
  )
}