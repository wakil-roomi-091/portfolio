import { useEffect, useRef } from 'react'

const Marquee = ({ dark }) => {
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.scroll-reveal').forEach((el) => {
              el.classList.add('visible')
            })
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const skills = [
    'React', 'Node.js', 'Express', 'MongoDB', 'Socket.IO',
    'JWT Auth', 'Cloudinary', 'Tailwind CSS', 'Git & GitHub', 'Figma'
  ]

  // Duplicate for seamless loop
  const allItems = [...skills, ...skills]

  return (
    <section
      ref={sectionRef}
      id="skills"
      className={`py-6 border-y ${
        dark ? 'bg-[#161B22] border-[#262D3A]' : 'bg-[#FFFFFF] border-[#E7E8EE]'
      } overflow-hidden`}
    >
      <div className="relative w-full overflow-hidden">
        <div className="flex whitespace-nowrap animate-scroll-left w-max">
          {allItems.map((skill, index) => (
            <span
              key={index}
              className="font-display text-[15px] font-semibold text-[#8A92A3] px-[30px] relative after:content-['•'] after:text-accent-end after:absolute after:right-[-4px]"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Marquee