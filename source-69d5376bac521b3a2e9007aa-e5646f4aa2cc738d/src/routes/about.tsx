import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: AboutPage,
})

function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
      <div className="mb-10">
        <p className="text-[10px] font-semibold tracking-[0.3em] text-neutral-600 uppercase mb-3">
          About
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
          Showtime Berklee
        </h1>
        <div className="mt-4 h-px bg-[#CC0000] w-12" />
      </div>

      <div className="space-y-5 text-neutral-300 leading-relaxed text-[15px]">
        <p>
          Showtime Berklee is built to close the gap between Berklee students and the live music scene
          around them. There's no shortage of shows—but a lot of students don't know where to find
          them, how to get involved, or even feel like they belong in those spaces. That disconnect is
          what this platform is here to fix.
        </p>
        <p>
          At its core, Showtime Berklee makes it easier to discover, organize, and attend shows.
          Whether you're trying to book your first gig, support your friends, or just find something to
          do on a random night, this platform helps you tap into what's already happening around you.
        </p>
        <p>
          It's also about learning the scene. Getting to know venues, understanding how shows run, and
          feeling more comfortable showing up. The goal is to make live music feel less intimidating and
          more like something you're a part of—not something you're on the outside of.
        </p>
        <p>
          No matter where you're at as a live music fan or artist, Showtime Berklee is here to make the
          experience more accessible, more connected, and more community-driven. It's about breaking
          down the gatekeeping that can exist in both the Berklee and DIY music scenes—and replacing it
          with something more open, informed, and welcoming.
        </p>
        <p className="font-medium text-white">
          Because the more people that feel like they belong, the better the scene becomes.
        </p>
      </div>
    </div>
  )
}
