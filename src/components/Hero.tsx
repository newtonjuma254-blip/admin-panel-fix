import { Play, ArrowRight } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import cake from "@/assets/p-cake.jpg";
import rocket from "@/assets/p-rocket.jpg";
import sparkler from "@/assets/p-sparkler.jpg";
import fountain from "@/assets/p-fountain.jpg";
import shell from "@/assets/p-shell.jpg";
import mega from "@/assets/p-mega.jpg";

const STRIP = [cake, rocket, sparkler, fountain, shell, mega];

export function Hero() {
  return (
    <section id="hero" className="relative min-h-[92vh] overflow-hidden">
      {/* Background video slot — uses hero image as poster */}
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={heroImg}
          className="h-full w-full object-cover opacity-70"
        >
          {/* Drop a looping mp4 here to enable streaming background */}
        </video>
        <img
          src={heroImg}
          alt="Cinematic fireworks over Nairobi skyline"
          className="absolute inset-0 h-full w-full object-cover"
          width={1920}
          height={1088}
        />
        <div className="absolute inset-0" style={{ background: "var(--gradient-night)" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/30 to-background" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-center px-4 pt-24 pb-32 sm:px-6">
        <div className="max-w-3xl animate-float-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs font-heading text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan animate-pulse" style={{ background: "var(--cyan)" }} />
            Licensed Pyrotechnics · KEBS Certified · Est. 2014
          </div>

          <h1 className="mt-6 font-display text-5xl font-bold leading-[0.95] sm:text-7xl md:text-8xl">
            Light up <br />
            <span className="text-aurora">Nairobi nights.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Cinematic, professional-grade fireworks delivered and choreographed across Kenya. From intimate rooftop sparklers to 60-shell aerial finales.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#catalog"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-aurora px-6 py-3.5 text-sm font-heading font-semibold text-white glow-violet transition hover:scale-[1.03]"
            >
              Explore Catalog <ArrowRight className="h-4 w-4" />
            </a>
            <button className="watch-btn inline-flex min-h-11 items-center gap-2 rounded-full px-6 py-3.5 text-sm font-heading font-semibold transition glass hover:border-white/20">
              <Play className="h-4 w-4 fill-current" />
              Watch Live Reel
            </button>
          </div>
        </div>
      </div>

      {/* Image strip marquee */}
      <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/5 bg-background/60 backdrop-blur-md py-4 overflow-hidden">
        <div className="flex gap-4 animate-marquee" style={{ width: "fit-content" }}>
          {[...STRIP, ...STRIP, ...STRIP].map((src, i) => (
            <div
              key={i}
              className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg border border-white/5"
            >
              <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
