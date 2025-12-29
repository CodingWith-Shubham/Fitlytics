export function HeroSection() {
  return (
    <section id="home" className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 lg:pt-32 lg:pb-32 overflow-hidden">
      {/* Background Video Layer */}
      <div className="absolute inset-0 -z-10">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
          aria-hidden="true"
        >
          <source
            src="https://res.cloudinary.com/ddjxsqetl/video/upload/v1766989958/Fitness_Inspired_Minimalist_Background_Video_diiexy.mp4"
            type="video/mp4"
          />
        </video>
        
        {/* Dark Gradient Overlay */}
        {/* <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background pointer-events-none" /> */}
      </div>

      {/* Content Layer */}
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
        <div className="text-sm sm:text-base text-muted-foreground">{"Heyy !"}</div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-balance">
          Fitlytics
        </h1>

        <p className="text-xl sm:text-2xl md:text-3xl text-muted-foreground font-light text-balance">
          Fitness meets intelligent analytics.
        </p>

        <blockquote className="text-base sm:text-lg md:text-xl italic text-muted-foreground/80 pt-4">
          {'"What gets measured, gets improved."'}
        </blockquote>

        <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto pt-6 text-pretty">
          Fitlytics is a smart fitness analytics platform that visualizes human activity in real time. It tracks
          motion-based activities like idle, walking, and running, displays live timelines, and converts raw movement
          into meaningful fitness insights — all in a clean, distraction-free interface.
        </p>
      </div>
    </section>
  )
}
